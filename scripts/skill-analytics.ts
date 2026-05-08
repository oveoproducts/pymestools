/**
 * skill-analytics.ts
 * Analytics skill — reads content_metrics and generates reports.
 *
 * Modes:
 *   daily   — yesterday's performance snapshot for all published articles
 *   weekly  — 7-day rolling summary with top performers and movers
 *   monthly — 30-day report with revenue estimates and trend analysis
 *   monitor — real-time alert check (traffic drops, zero-click articles)
 *
 * Usage:
 *   npx tsx scripts/skill-analytics.ts daily
 *   npx tsx scripts/skill-analytics.ts weekly
 *   npx tsx scripts/skill-analytics.ts monthly
 *   npx tsx scripts/skill-analytics.ts monitor
 */

import 'dotenv/config'
import { supabase } from '../lib/db/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AnalyticsMode = 'daily' | 'weekly' | 'monthly' | 'monitor'

export interface AnalyticsOptions {
  mode: AnalyticsMode
}

interface MetricRow {
  id: string
  article_id: string
  impressions: number
  clicks: number
  avg_position: number | null
  affiliate_clicks: number
  estimated_revenue: number
  recorded_at: string
}

interface ArticleSummary {
  articleId: string
  title: string
  slug: string
  totalImpressions: number
  totalClicks: number
  avgPosition: number | null
  totalAffiliateClicks: number
  totalRevenue: number
  ctr: number
}

interface AnalyticsReport {
  mode: AnalyticsMode
  periodStart: string
  periodEnd: string
  totalImpressions: number
  totalClicks: number
  totalAffiliateClicks: number
  totalRevenue: number
  avgCTR: number
  topArticles: ArticleSummary[]
  alerts: string[]
}

interface AnalyticsResult {
  success: boolean
  report?: AnalyticsReport
  message: string
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function dateStr(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function subtractDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - days)
  return d
}

function getPeriod(mode: AnalyticsMode): { start: Date; end: Date } {
  const today = new Date()
  const end = subtractDays(today, 1) // yesterday as latest complete day

  switch (mode) {
    case 'daily':
      return { start: end, end }
    case 'weekly':
      return { start: subtractDays(end, 6), end }
    case 'monthly':
      return { start: subtractDays(end, 29), end }
    case 'monitor':
      return { start: subtractDays(end, 1), end } // last 2 days for diff
  }
}

// ---------------------------------------------------------------------------
// DB helpers
// ---------------------------------------------------------------------------

async function fetchMetrics(startDate: Date, endDate: Date): Promise<MetricRow[]> {
  const { data, error } = await supabase
    .from('content_metrics')
    .select('*')
    .gte('recorded_at', dateStr(startDate))
    .lte('recorded_at', dateStr(endDate))
    .order('recorded_at', { ascending: false })

  if (error) throw new Error(`Metrics fetch error: ${error.message}`)
  return (data ?? []) as MetricRow[]
}

async function fetchPublishedArticles(): Promise<
  Array<{ id: string; title: string; slug: string }>
> {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug')
    .eq('status', 'published')

  if (error) throw new Error(`Articles fetch error: ${error.message}`)
  return data ?? []
}

async function logAgent(
  task: string,
  status: 'started' | 'completed' | 'failed',
  durationMs?: number,
  feedback?: string
): Promise<void> {
  await supabase.from('agent_logs').insert({
    agent_name: 'skill-analytics',
    task,
    status,
    duration_ms: durationMs,
    feedback,
  })
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

function aggregateByArticle(
  metrics: MetricRow[],
  articles: Array<{ id: string; title: string; slug: string }>
): ArticleSummary[] {
  const articleMap = new Map(articles.map((a) => [a.id, a]))
  const grouped = new Map<string, MetricRow[]>()

  for (const row of metrics) {
    const existing = grouped.get(row.article_id) ?? []
    existing.push(row)
    grouped.set(row.article_id, existing)
  }

  const summaries: ArticleSummary[] = []
  for (const [articleId, rows] of grouped) {
    const article = articleMap.get(articleId)
    if (!article) continue

    const totalImpressions = rows.reduce((sum, r) => sum + r.impressions, 0)
    const totalClicks = rows.reduce((sum, r) => sum + r.clicks, 0)
    const totalAffiliateClicks = rows.reduce((sum, r) => sum + r.affiliate_clicks, 0)
    const totalRevenue = rows.reduce((sum, r) => sum + r.estimated_revenue, 0)

    const positionRows = rows.filter((r) => r.avg_position !== null)
    const avgPosition =
      positionRows.length > 0
        ? positionRows.reduce((sum, r) => sum + (r.avg_position ?? 0), 0) / positionRows.length
        : null

    summaries.push({
      articleId,
      title: article.title,
      slug: article.slug,
      totalImpressions,
      totalClicks,
      avgPosition,
      totalAffiliateClicks,
      totalRevenue,
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
    })
  }

  return summaries.sort((a, b) => b.totalClicks - a.totalClicks)
}

// ---------------------------------------------------------------------------
// Alert detection (monitor mode)
// ---------------------------------------------------------------------------

function detectAlerts(
  currentMetrics: MetricRow[],
  previousMetrics: MetricRow[]
): string[] {
  const alerts: string[] = []

  // Group clicks by article for current vs previous day
  const current = new Map<string, number>()
  const previous = new Map<string, number>()

  for (const row of currentMetrics) {
    current.set(row.article_id, (current.get(row.article_id) ?? 0) + row.clicks)
  }
  for (const row of previousMetrics) {
    previous.set(row.article_id, (previous.get(row.article_id) ?? 0) + row.clicks)
  }

  for (const [articleId, currentClicks] of current) {
    const previousClicks = previous.get(articleId) ?? 0

    // Alert: traffic dropped > 50%
    if (previousClicks > 10 && currentClicks < previousClicks * 0.5) {
      alerts.push(
        `Traffic drop >50% on article ${articleId}: ${previousClicks} → ${currentClicks} clicks`
      )
    }

    // Alert: zero clicks for articles that had > 20 yesterday
    if (previousClicks > 20 && currentClicks === 0) {
      alerts.push(`Zero clicks on high-traffic article ${articleId} (had ${previousClicks} yesterday)`)
    }
  }

  return alerts
}

// ---------------------------------------------------------------------------
// Report rendering
// ---------------------------------------------------------------------------

function printReport(report: AnalyticsReport): void {
  console.log(`\n📊  Analytics Report — ${report.mode.toUpperCase()}`)
  console.log(`    Period: ${report.periodStart} → ${report.periodEnd}`)
  console.log('─'.repeat(60))
  console.log(`    Impressions    : ${report.totalImpressions.toLocaleString()}`)
  console.log(`    Clicks         : ${report.totalClicks.toLocaleString()}`)
  console.log(`    Avg CTR        : ${report.avgCTR.toFixed(2)}%`)
  console.log(`    Affiliate clicks: ${report.totalAffiliateClicks.toLocaleString()}`)
  console.log(`    Est. revenue   : €${report.totalRevenue.toFixed(2)}`)

  if (report.topArticles.length > 0) {
    console.log('\n  Top articles:')
    const top5 = report.topArticles.slice(0, 5)
    for (const a of top5) {
      console.log(
        `    • ${a.slug.padEnd(35)} ${String(a.totalClicks).padStart(5)} clicks  CTR ${a.ctr.toFixed(1)}%`
      )
    }
  }

  if (report.alerts.length > 0) {
    console.log('\n  🚨 Alerts:')
    for (const alert of report.alerts) {
      console.log(`    ⚠️  ${alert}`)
    }
  } else {
    console.log('\n  ✅ No alerts')
  }
  console.log('─'.repeat(60))
}

// ---------------------------------------------------------------------------
// Mode handlers
// ---------------------------------------------------------------------------

async function runDaily(period: { start: Date; end: Date }): Promise<AnalyticsReport> {
  console.log('  Mode: daily snapshot')
  const [metrics, articles] = await Promise.all([
    fetchMetrics(period.start, period.end),
    fetchPublishedArticles(),
  ])

  const summaries = aggregateByArticle(metrics, articles)
  const totals = summarize(summaries)

  return {
    mode: 'daily',
    periodStart: dateStr(period.start),
    periodEnd: dateStr(period.end),
    ...totals,
    topArticles: summaries.slice(0, 10),
    alerts: [],
  }
}

async function runWeekly(period: { start: Date; end: Date }): Promise<AnalyticsReport> {
  console.log('  Mode: weekly 7-day rolling')
  const [metrics, articles] = await Promise.all([
    fetchMetrics(period.start, period.end),
    fetchPublishedArticles(),
  ])

  const summaries = aggregateByArticle(metrics, articles)
  const totals = summarize(summaries)

  return {
    mode: 'weekly',
    periodStart: dateStr(period.start),
    periodEnd: dateStr(period.end),
    ...totals,
    topArticles: summaries.slice(0, 10),
    alerts: [],
  }
}

async function runMonthly(period: { start: Date; end: Date }): Promise<AnalyticsReport> {
  console.log('  Mode: monthly 30-day report')
  const [metrics, articles] = await Promise.all([
    fetchMetrics(period.start, period.end),
    fetchPublishedArticles(),
  ])

  const summaries = aggregateByArticle(metrics, articles)
  const totals = summarize(summaries)

  return {
    mode: 'monthly',
    periodStart: dateStr(period.start),
    periodEnd: dateStr(period.end),
    ...totals,
    topArticles: summaries,
    alerts: [],
  }
}

async function runMonitor(period: { start: Date; end: Date }): Promise<AnalyticsReport> {
  console.log('  Mode: monitor — real-time alert check')

  // Fetch current day and previous day
  const today = period.end
  const yesterday = subtractDays(today, 1)

  const [current, previous, articles] = await Promise.all([
    fetchMetrics(today, today),
    fetchMetrics(yesterday, yesterday),
    fetchPublishedArticles(),
  ])

  const summaries = aggregateByArticle(current, articles)
  const totals = summarize(summaries)
  const alerts = detectAlerts(current, previous)

  if (alerts.length > 0) {
    console.log(`  🚨 ${alerts.length} alert(s) detected`)
  }

  return {
    mode: 'monitor',
    periodStart: dateStr(yesterday),
    periodEnd: dateStr(today),
    ...totals,
    topArticles: summaries.slice(0, 5),
    alerts,
  }
}

function summarize(
  summaries: ArticleSummary[]
): Pick<
  AnalyticsReport,
  'totalImpressions' | 'totalClicks' | 'totalAffiliateClicks' | 'totalRevenue' | 'avgCTR'
> {
  const totalImpressions = summaries.reduce((s, a) => s + a.totalImpressions, 0)
  const totalClicks = summaries.reduce((s, a) => s + a.totalClicks, 0)
  const totalAffiliateClicks = summaries.reduce((s, a) => s + a.totalAffiliateClicks, 0)
  const totalRevenue = summaries.reduce((s, a) => s + a.totalRevenue, 0)
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

  return { totalImpressions, totalClicks, totalAffiliateClicks, totalRevenue, avgCTR }
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function runAnalytics(options: AnalyticsOptions): Promise<AnalyticsResult> {
  const startedAt = Date.now()
  console.log(`\n📈  Skill Analytics [${options.mode}]\n`)
  await logAgent(`analytics:${options.mode}`, 'started')

  try {
    const period = getPeriod(options.mode)

    let report: AnalyticsReport
    switch (options.mode) {
      case 'daily':
        report = await runDaily(period)
        break
      case 'weekly':
        report = await runWeekly(period)
        break
      case 'monthly':
        report = await runMonthly(period)
        break
      case 'monitor':
        report = await runMonitor(period)
        break
    }

    printReport(report)

    const durationMs = Date.now() - startedAt
    const message = `${options.mode} analytics complete. ${report.totalClicks} clicks, €${report.totalRevenue.toFixed(2)} revenue.`
    await logAgent(`analytics:${options.mode}`, 'completed', durationMs, message)

    return { success: true, report, message }
  } catch (err) {
    const durationMs = Date.now() - startedAt
    const message = err instanceof Error ? err.message : String(err)
    await logAgent(`analytics:${options.mode}`, 'failed', durationMs, message)
    console.error(`\n❌  Analytics error: ${message}`)
    return { success: false, message }
  }
}

// ---------------------------------------------------------------------------
// CLI entry
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const rawMode = process.argv[2] as AnalyticsMode | undefined
  const validModes: AnalyticsMode[] = ['daily', 'weekly', 'monthly', 'monitor']

  if (rawMode && !validModes.includes(rawMode)) {
    console.error(`Invalid mode "${rawMode}". Choose from: ${validModes.join(', ')}`)
    process.exit(1)
  }

  const mode: AnalyticsMode = rawMode ?? 'daily'
  const result = await runAnalytics({ mode })
  process.exit(result.success ? 0 : 1)
}

main()
