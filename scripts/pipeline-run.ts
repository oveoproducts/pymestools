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
import { alert } from '../lib/notify'

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
  attempts: number | null
  last_error_at: string | null
  created_at: string
  updated_at: string
}

interface RunResult {
  success: boolean
  message: string
  itemsProcessed: number
  /** True when the run actually advanced a queue item. */
  progressed: boolean
}

interface StepResult {
  success: boolean
  message: string
}

/**
 * How many times a single queue item may fail before it is quarantined.
 *
 * Without this the runner retried the same broken item forever: fetchNextItem
 * always returns the highest-priority active item, the skill swallowed its own
 * error and returned success:false, and nothing ever advanced. One article
 * stuck in seo_review blocked every other item behind it for 19 days.
 */
const MAX_ATTEMPTS = 3

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

  // Slugs already represented by a queue item (via its keyword). Two approved
  // keyword rows can share the same text → same slug (legacy duplicates); if
  // one is already in flight, enqueuing the other produces a duplicate-slug
  // collision downstream. Guard against slug, not just keyword_id.
  const queuedKeywordIds = [...queuedIds] as string[]
  const inFlightSlugs = new Set<string>()
  if (queuedKeywordIds.length > 0) {
    const { data: queuedKws } = await supabase
      .from('keywords')
      .select('keyword')
      .in('id', queuedKeywordIds)
    for (const k of queuedKws ?? []) inFlightSlugs.add(keywordToSlug(k.keyword))
  }

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
    if (existingSlugs.has(slug) || inFlightSlugs.has(slug)) {
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

async function dispatch(item: QueueItem): Promise<StepResult> {
  console.log(`\n→  Dispatching item ${item.id} [status: ${item.status}] (intento ${(item.attempts ?? 0) + 1}/${MAX_ATTEMPTS})`)

  switch (item.status) {
    case 'pending': {
      // Transition to researching before calling skill
      await updateQueueItem(item.id, { status: 'researching' })
      return await runResearch({ mode: 'keyword', queueItemId: item.id, keywordId: item.keyword_id })
    }
    case 'researching':
    case 'drafting':
      return await runContent({ queueItemId: item.id, keywordId: item.keyword_id })
    case 'qa_review':
      return await runQA({ queueItemId: item.id, articleId: item.article_id })
    case 'seo_review':
      return await runSEO({ queueItemId: item.id, articleId: item.article_id })
    case 'ready_to_publish':
      return await runPublish({ queueItemId: item.id, articleId: item.article_id })
    default:
      return { success: false, message: `No handler for status: ${item.status}` }
  }
}

/**
 * Records a failed step. Retries up to MAX_ATTEMPTS, then quarantines the item
 * as 'failed' so the queue can move on, and alerts a human — a quarantined item
 * is content that was researched and paid for but will never publish itself.
 */
async function handleStepFailure(item: QueueItem, message: string): Promise<void> {
  const attempts = (item.attempts ?? 0) + 1
  const quarantine = attempts >= MAX_ATTEMPTS

  await supabase
    .from('pipeline_queue')
    .update({
      attempts,
      error_message: message.slice(0, 1000),
      last_error_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...(quarantine ? { status: 'failed' } : {}),
    })
    .eq('id', item.id)

  if (!quarantine) {
    console.warn(`  ⚠️  Fallo ${attempts}/${MAX_ATTEMPTS} — se reintentará mañana.`)
    return
  }

  // Release the article so it stops occupying an active pipeline status.
  if (item.article_id) {
    await supabase.from('articles').update({ status: 'failed' }).eq('id', item.article_id)
  }

  console.error(`  ⛔  Item ${item.id} en cuarentena tras ${attempts} intentos.`)
  await alert(
    'error',
    `Item en cuarentena tras ${attempts} intentos`,
    [
      `Queue item : ${item.id}`,
      `Etapa      : ${item.status}`,
      `Tipo       : ${item.type}`,
      `Article id : ${item.article_id ?? '—'}`,
      '',
      `Último error: ${message}`,
      '',
      'La cola ha seguido con el siguiente item. Revisa este cuando puedas:',
      '  npx tsx --env-file=.env.local scripts/pipeline-doctor.ts',
    ].join('\n'),
  )
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
  console.log(`  Progressed      : ${result.progressed ? 'sí' : 'no'}`)
  console.log(`  Message         : ${result.message}`)
  console.log('─'.repeat(40))
}

// ---------------------------------------------------------------------------
// Main runner
// ---------------------------------------------------------------------------

export async function runPipeline(): Promise<RunResult> {
  const startedAt = Date.now()
  console.log('\n🚀  PymesTools — Pipeline Run\n')
  await logAgent('pipeline-run', 'started')

  let itemsProcessed = 0
  let progressed = false

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
        progressed = true
      } else {
        console.log('  Queue is empty and no approved keywords left to enqueue.')
      }
    } else {
      const step = await dispatch(item)
      itemsProcessed = 1

      if (!step.success) {
        // A skill that returns success:false has already caught and logged its
        // own error. If the runner ignores that (as it used to), the item keeps
        // its status, gets picked again next run, and blocks the whole queue.
        await handleStepFailure(item, step.message)

        const durationMs = Date.now() - startedAt
        await logAgent('pipeline-run', 'failed', durationMs, step.message)
        const result: RunResult = {
          success: false,
          message: step.message,
          itemsProcessed,
          progressed: false,
        }
        await sendDailySummary(result)
        return result
      }

      // A successful step clears the failure counter for the next stage.
      if ((item.attempts ?? 0) > 0) {
        await supabase
          .from('pipeline_queue')
          .update({ attempts: 0, error_message: null })
          .eq('id', item.id)
      }
      progressed = true
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
      progressed,
    }

    await sendDailySummary(result)
    return result
  } catch (err) {
    const durationMs = Date.now() - startedAt
    const message = err instanceof Error ? err.message : String(err)
    await logAgent('pipeline-run', 'failed', durationMs, message)
    console.error('\n❌  Pipeline error:', message)
    await alert('error', 'Pipeline abortado con excepción', message)

    const result: RunResult = { success: false, message, itemsProcessed, progressed: false }
    await sendDailySummary(result)
    return result
  }
}

async function main(): Promise<void> {
  const result = await runPipeline()
  process.exit(result.success ? 0 : 1)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
