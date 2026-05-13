/**
 * ingest-gsc.ts
 * Pulls Search Console data (clicks, impressions, position) for all
 * published articles and upserts into the content_metrics table.
 *
 * Prerequisites:
 *   1. Google Cloud project with Search Console API enabled
 *   2. Service account with "Verified owner" role in GSC for pymestools.com
 *   3. GOOGLE_SERVICE_ACCOUNT_JSON env var with the full service account JSON
 *
 * Usage: npx tsx --env-file=.env.local scripts/ingest-gsc.ts
 * Railway: add to cronSchedule alongside pipeline-run (or daily after it)
 */
import 'dotenv/config'
import { google } from 'googleapis'
import { supabase } from '../lib/db/client'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pymestools.com'
const DAYS_BACK = 30

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

function getAuth() {
  const clientId = process.env.GSC_CLIENT_ID
  const clientSecret = process.env.GSC_CLIENT_SECRET
  const refreshToken = process.env.GSC_REFRESH_TOKEN
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing env vars: GSC_CLIENT_ID, GSC_CLIENT_SECRET, GSC_REFRESH_TOKEN')
  }
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret)
  oauth2Client.setCredentials({ refresh_token: refreshToken })
  return oauth2Client
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

// ---------------------------------------------------------------------------
// GSC query
// ---------------------------------------------------------------------------

interface GSCRow {
  keys: string[]   // [date, page]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

async function queryGSC(auth: ReturnType<typeof getAuth>): Promise<GSCRow[]> {
  const sc = google.searchconsole({ version: 'v1', auth })
  const startDate = dateStr(daysAgo(DAYS_BACK))
  const endDate = dateStr(daysAgo(1))

  console.log(`  Querying GSC: ${startDate} → ${endDate}`)

  const response = await sc.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['date', 'page'],
      rowLimit: 5000,
    },
  })

  return (response.data.rows ?? []) as GSCRow[]
}

// ---------------------------------------------------------------------------
// Supabase helpers
// ---------------------------------------------------------------------------

interface ArticleRow {
  id: string
  slug: string
  category: string
}

async function fetchPublishedArticles(): Promise<ArticleRow[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('id, slug, category')
    .eq('status', 'published')
  if (error) throw new Error(`Articles fetch error: ${error.message}`)
  return (data ?? []) as ArticleRow[]
}

async function upsertMetrics(rows: Array<{
  article_id: string
  recorded_at: string
  clicks: number
  impressions: number
  avg_position: number
}>): Promise<void> {
  if (rows.length === 0) return
  // Delete existing rows for same article+date before inserting to avoid duplicates
  for (const row of rows) {
    await supabase
      .from('content_metrics')
      .delete()
      .eq('article_id', row.article_id)
      .eq('recorded_at', row.recorded_at)
  }
  const { error } = await supabase.from('content_metrics').insert(rows)
  if (error) throw new Error(`Insert error: ${error.message}`)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n📊  GSC Ingest\n')

  const auth = getAuth()
  const [gscRows, articles] = await Promise.all([
    queryGSC(auth),
    fetchPublishedArticles(),
  ])

  console.log(`  GSC rows: ${gscRows.length}`)
  console.log(`  Articles: ${articles.length}`)

  // Build URL → article map
  const urlMap = new Map<string, ArticleRow>()
  for (const article of articles) {
    const category = article.category.replace(/_/g, '-')
    const url = `${SITE_URL}/${category}/${article.slug}`
    urlMap.set(url, article)
    // Also map without trailing slash variants
    urlMap.set(url + '/', article)
  }

  // Transform GSC rows into content_metrics inserts
  const toUpsert: Array<{
    article_id: string
    recorded_at: string
    clicks: number
    impressions: number
    avg_position: number
  }> = []

  for (const row of gscRows) {
    const [date, page] = row.keys
    const article = urlMap.get(page)
    if (!article) continue

    toUpsert.push({
      article_id: article.id,
      recorded_at: date,
      clicks: row.clicks,
      impressions: row.impressions,
      avg_position: row.position,
    })
  }

  console.log(`  Rows matched to articles: ${toUpsert.length}`)

  await upsertMetrics(toUpsert)

  console.log(`\n✅  GSC ingest complete — ${toUpsert.length} rows upserted\n`)
}

main().catch((err) => {
  console.error('❌  GSC ingest error:', err.message)
  process.exit(1)
})
