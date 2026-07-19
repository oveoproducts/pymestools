/**
 * pipeline-run.ts
 * Main pipeline runner. Reads pipeline_queue from Supabase and routes each
 * item to the correct skill based on its current status.
 *
 * State machine:
 *   pending          → researching  → skill-research
 *   drafting         →              → skill-content
 *   qa_review        →              → skill-qa
 *   seo_review       →              → skill-seo
 *   ready_to_publish →              → skill-publish
 *   (empty + Monday) →              → skill-research (discovery mode)
 *
 * Usage: npx tsx scripts/pipeline-run.ts
 */

import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import { supabase } from '../lib/db/client'
import { runResearch } from './skill-research'
import { runContent, keywordToSlug } from './skill-content'
import { runQA } from './skill-qa'
import { runSEO } from './skill-seo'
import { runPublish } from './skill-publish'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type QueueStatus =
  | 'pending'
  | 'researching'
  | 'drafting'
  | 'qa_review'
  | 'seo_review'
  | 'awaiting_human'
  | 'ready_to_publish'
  | 'published'
  | 'failed'

interface QueueItem {
  id: string
  keyword_id: string | null
  article_id: string | null
  type: string
  status: QueueStatus
  priority: number
  error_message: string | null
  created_at: string
  updated_at: string
}

interface RunResult {
  success: boolean
  message: string
  itemsProcessed: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isMonday(): boolean {
  return new Date().getDay() === 1
}

async function logAgent(
  task: string,
  status: 'started' | 'completed' | 'failed',
  durationMs?: number,
  feedback?: string
): Promise<void> {
  await supabase.from('agent_logs').insert({
    agent_name: 'pipeline-run',
    task,
    status,
    duration_ms: durationMs,
    feedback,
  })
}

async function updateQueueItem(
  id: string,
  patch: Partial<Pick<QueueItem, 'status' | 'error_message'>>
): Promise<void> {
  await supabase
    .from('pipeline_queue')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
}

function inferQueueType(keyword: string): string {
  const kw = keyword.toLowerCase()
  if (kw.includes('alternativa')) return 'alternatives'
  if (kw.includes('comparati') || kw.includes(' vs ')) return 'comparison'
  if (kw.includes('mejor')) return 'top-list'
  if (kw.includes('cómo') || kw.includes('como') || kw.includes('qué es')) return 'how-to'
  return 'review'
}

/**
 * Pulls the next approved keyword that isn't already queued or published
 * into a fresh pipeline_queue item. Without this, `keywords` fills up with
 * approved rows that nothing ever turns into an article — research alone
 * doesn't drive publishing.
 */
async function enqueueNextApprovedKeyword(): Promise<boolean> {
  const { data: queued } = await supabase.from('pipeline_queue').select('keyword_id')
  const queuedIds = new Set((queued ?? []).map((q) => q.keyword_id).filter(Boolean))

  const { data: candidates } = await supabase
    .from('keywords')
    .select('id, keyword, priority_score')
    .eq('status', 'approved')
    .order('priority_score', { ascending: false })
    .limit(50)

  if (!candidates || candidates.length === 0) return false

  const { data: articles } = await supabase.from('articles').select('slug')
  const existingSlugs = new Set((articles ?? []).map((a) => a.slug))

  for (const kw of candidates) {
    if (queuedIds.has(kw.id)) continue

    const slug = keywordToSlug(kw.keyword)
    if (existingSlugs.has(slug)) {
      await supabase.from('keywords').update({ status: 'rejected' }).eq('id', kw.id)
      continue
    }

    await supabase.from('pipeline_queue').insert({
      keyword_id: kw.id,
      type: inferQueueType(kw.keyword),
      status: 'pending',
      priority: kw.priority_score ?? 5,
    })
    console.log(`  ➕  Encolado "${kw.keyword}"`)
    return true
  }

  return false
}

/**
 * Fetches the highest-priority actionable queue item.
 * Items in awaiting_human, published, or failed are skipped.
 */
async function fetchNextItem(): Promise<QueueItem | null> {
  const { data, error } = await supabase
    .from('pipeline_queue')
    .select('*')
    .in('status', ['pending', 'researching', 'drafting', 'qa_review', 'seo_review', 'ready_to_publish'])
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (error?.code === 'PGRST116') return null // no rows
  if (error) throw new Error(`Queue fetch error: ${error.message}`)
  return data as QueueItem
}

// ---------------------------------------------------------------------------
// Route dispatcher
// ---------------------------------------------------------------------------

async function dispatch(item: QueueItem): Promise<void> {
  console.log(`\n→  Dispatching item ${item.id} [status: ${item.status}]`)

  switch (item.status) {
    case 'pending': {
      // Transition to researching before calling skill
      await updateQueueItem(item.id, { status: 'researching' })
      await runResearch({ mode: 'keyword', queueItemId: item.id, keywordId: item.keyword_id })
      break
    }
    case 'researching':
    case 'drafting': {
      await runContent({ queueItemId: item.id, keywordId: item.keyword_id })
      break
    }
    case 'qa_review': {
      await runQA({ queueItemId: item.id, articleId: item.article_id })
      break
    }
    case 'seo_review': {
      await runSEO({ queueItemId: item.id, articleId: item.article_id })
      break
    }
    case 'ready_to_publish': {
      await runPublish({ queueItemId: item.id, articleId: item.article_id })
      break
    }
    default: {
      console.warn(`  ⚠️  No handler for status: ${item.status}`)
    }
  }
}

// ---------------------------------------------------------------------------
// Daily summary
// ---------------------------------------------------------------------------

async function sendDailySummary(result: RunResult): Promise<void> {
  // TODO: replace with Resend email notification
  console.log('\n📊  Daily Pipeline Summary')
  console.log('─'.repeat(40))
  console.log(`  Items processed : ${result.itemsProcessed}`)
  console.log(`  Status          : ${result.success ? '✅ OK' : '❌ FAILED'}`)
  console.log(`  Message         : ${result.message}`)
  console.log('─'.repeat(40))
}

// ---------------------------------------------------------------------------
// Main runner
// ---------------------------------------------------------------------------

async function pingSitemap(): Promise<void> {
  const sitemapUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pymestools.com'}/sitemap.xml`
  try {
    await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`)
    console.log('  🗺️  Sitemap pinged to Google')
  } catch {
    console.warn('  ⚠️  Sitemap ping failed (non-fatal)')
  }
}

export async function runPipeline(): Promise<RunResult> {
  const startedAt = Date.now()
  console.log('\n🚀  PymesTools — Pipeline Run\n')
  await logAgent('pipeline-run', 'started')
  await pingSitemap()

  let itemsProcessed = 0

  try {
    const item = await fetchNextItem()

    if (!item) {
      // Empty queue: top up keyword candidates on Mondays, then always try
      // to pull the next approved keyword into a fresh queue item so
      // publishing keeps moving on the other days too.
      if (isMonday()) {
        console.log('  Queue is empty and today is Monday → running discovery research.')
        await runResearch({ mode: 'discovery' })
      }

      const enqueued = await enqueueNextApprovedKeyword()
      if (enqueued) {
        itemsProcessed = 1
      } else {
        console.log('  Queue is empty and no approved keywords left to enqueue.')
      }
    } else {
      await dispatch(item)
      itemsProcessed = 1
    }

    const durationMs = Date.now() - startedAt
    await logAgent(
      'pipeline-run',
      'completed',
      durationMs,
      `Processed ${itemsProcessed} item(s)`
    )

    const result: RunResult = {
      success: true,
      message: `Processed ${itemsProcessed} item(s) in ${durationMs}ms`,
      itemsProcessed,
    }

    await sendDailySummary(result)
    return result
  } catch (err) {
    const durationMs = Date.now() - startedAt
    const message = err instanceof Error ? err.message : String(err)
    await logAgent('pipeline-run', 'failed', durationMs, message)
    console.error('\n❌  Pipeline error:', message)

    const result: RunResult = { success: false, message, itemsProcessed }
    await sendDailySummary(result)
    return result
  }
}

async function main(): Promise<void> {
  const result = await runPipeline()
  process.exit(result.success ? 0 : 1)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
