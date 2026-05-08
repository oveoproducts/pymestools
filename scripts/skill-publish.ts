/**
 * skill-publish.ts
 * Publish skill — final validation, Git commit/push, Vercel deploy polling,
 * live URL verification, Supabase status update, IndexNow ping, Resend notification.
 *
 * Flow:
 *   1. Final pre-publish validation (meta completeness, file exists)
 *   2. Git commit + push via simple-git
 *   3. Poll Vercel for deploy completion (placeholder)
 *   4. Verify live URL returns HTTP 200
 *   5. Update article status → published + published_at
 *   6. Update pipeline_queue → published + completed_at
 *   7. Ping IndexNow for fast indexing
 *   8. Send Resend email notification
 *
 * Usage: npx tsx scripts/skill-publish.ts
 */

import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import simpleGit, { type SimpleGit } from 'simple-git'
import { supabase } from '../lib/db/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PublishOptions {
  queueItemId?: string | null
  articleId?: string | null
  dryRun?: boolean // if true, skip git/deploy steps but do all validation
}

interface ArticleRow {
  id: string
  title: string
  slug: string
  category: string
  meta_title: string | null
  meta_description: string | null
  schema_markup: Record<string, unknown> | null
  status: string
  author: string | null
}

interface ValidationResult {
  passed: boolean
  errors: string[]
  warnings: string[]
}

interface PublishResult {
  success: boolean
  articleId?: string
  liveUrl?: string
  message: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pymestools.com'
const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? ''
const RESEND_API_KEY = process.env.RESEND_API_KEY ?? ''
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? ''

async function fetchArticle(articleId: string): Promise<ArticleRow> {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, category, meta_title, meta_description, schema_markup, status, author')
    .eq('id', articleId)
    .single()

  if (error) throw new Error(`Article fetch error: ${error.message}`)
  return data as ArticleRow
}

async function logAgent(
  task: string,
  status: 'started' | 'completed' | 'failed',
  durationMs?: number,
  feedback?: string
): Promise<void> {
  await supabase.from('agent_logs').insert({
    agent_name: 'skill-publish',
    task,
    status,
    duration_ms: durationMs,
    feedback,
  })
}

// ---------------------------------------------------------------------------
// Step 1 — Pre-publish validation
// ---------------------------------------------------------------------------

async function validateArticle(article: ArticleRow): Promise<ValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []

  // Meta completeness
  if (!article.meta_title) errors.push('Missing meta_title')
  if (!article.meta_description) errors.push('Missing meta_description')
  if (!article.schema_markup) warnings.push('Missing schema_markup (AEO impact)')

  // File exists
  const filePath = path.join(process.cwd(), 'content', 'articles', `${article.slug}.mdx`)
  try {
    await fs.access(filePath)
  } catch {
    errors.push(`MDX file not found: content/articles/${article.slug}.mdx`)
  }

  // Status must be ready_to_publish
  if (article.status !== 'ready_to_publish') {
    errors.push(`Article status is "${article.status}", expected "ready_to_publish"`)
  }

  return { passed: errors.length === 0, errors, warnings }
}

// ---------------------------------------------------------------------------
// Step 2 — Git commit + push
// ---------------------------------------------------------------------------

async function gitCommitAndPush(article: ArticleRow): Promise<void> {
  const git: SimpleGit = simpleGit(process.cwd())

  const filePath = `content/articles/${article.slug}.mdx`
  console.log(`  Adding ${filePath} to git…`)
  await git.add(filePath)

  const commitMessage = `content: add article "${article.title}" [${article.slug}]`
  console.log(`  Committing: ${commitMessage}`)
  await git.commit(commitMessage)

  console.log('  Pushing to origin…')
  await git.push('origin', 'main') // TODO: make branch configurable
  console.log('  ✅ Git push complete')
}

// ---------------------------------------------------------------------------
// Step 3 — Vercel deploy polling
// ---------------------------------------------------------------------------

async function pollVercelDeploy(): Promise<string> {
  // TODO: implement real Vercel API polling
  // 1. GET https://api.vercel.com/v6/deployments?teamId=X&limit=1
  // 2. Poll until state === 'READY' (timeout 5 min)
  // 3. Return deploy URL

  console.log('  Polling Vercel deploy status… (placeholder)')

  // Simulate a 2-second wait for skeleton
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const deployUrl = process.env.VERCEL_DEPLOY_URL ?? SITE_URL
  console.log(`  Deploy URL: ${deployUrl}`)
  return deployUrl
}

// ---------------------------------------------------------------------------
// Step 4 — Live URL verification
// ---------------------------------------------------------------------------

async function verifyLiveUrl(slug: string): Promise<boolean> {
  const liveUrl = `${SITE_URL}/blog/${slug}`
  console.log(`  Verifying live URL: ${liveUrl}`)

  try {
    const response = await fetch(liveUrl, { method: 'HEAD' })
    const ok = response.status === 200
    console.log(`  HTTP ${response.status} — ${ok ? '✅ LIVE' : '❌ NOT FOUND'}`)
    return ok
  } catch (err) {
    console.warn(`  ⚠️  URL verification failed: ${err}`)
    return false
  }
}

// ---------------------------------------------------------------------------
// Step 7 — IndexNow ping
// ---------------------------------------------------------------------------

async function pingIndexNow(slug: string): Promise<void> {
  if (!INDEXNOW_KEY) {
    console.log('  IndexNow: INDEXNOW_KEY not set — skipping')
    return
  }

  const url = `${SITE_URL}/blog/${slug}`
  const endpoint = `https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${INDEXNOW_KEY}`

  try {
    const response = await fetch(endpoint, { method: 'GET' })
    console.log(`  IndexNow ping: HTTP ${response.status}`)
  } catch (err) {
    console.warn(`  ⚠️  IndexNow ping failed: ${err}`)
  }
}

// ---------------------------------------------------------------------------
// Step 8 — Resend email notification
// ---------------------------------------------------------------------------

async function sendPublishNotification(article: ArticleRow, liveUrl: string): Promise<void> {
  if (!RESEND_API_KEY || !NOTIFY_EMAIL) {
    console.log('  Resend: RESEND_API_KEY or NOTIFY_EMAIL not set — skipping email')
    return
  }

  // TODO: replace with @resend/node SDK call
  // const resend = new Resend(RESEND_API_KEY)
  // await resend.emails.send({
  //   from: 'robots@pymestools.com',
  //   to: NOTIFY_EMAIL,
  //   subject: `✅ Published: ${article.title}`,
  //   html: `<p>New article published: <a href="${liveUrl}">${article.title}</a></p>`,
  // })

  console.log(`  Resend: would notify ${NOTIFY_EMAIL} about "${article.title}" — placeholder`)
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function runPublish(options: PublishOptions): Promise<PublishResult> {
  const startedAt = Date.now()
  const dryRun = options.dryRun ?? false
  console.log(`\n🚀  Skill Publish${dryRun ? ' [DRY RUN]' : ''}\n`)
  await logAgent('publish', 'started')

  try {
    if (!options.articleId) {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, slug, category, meta_title, meta_description, schema_markup, status, author')
        .eq('status', 'ready_to_publish')
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      if (error?.code === 'PGRST116') {
        return { success: false, message: 'No articles ready to publish.' }
      }
      if (error) throw new Error(`Article fetch error: ${error.message}`)
      options = { ...options, articleId: (data as ArticleRow).id }
    }

    const article = await fetchArticle(options.articleId!)
    console.log(`  Article: "${article.title}" [${article.slug}]`)

    // Step 1 — Validate
    console.log('\n  Step 1/8 — Pre-publish validation')
    const validation = await validateArticle(article)
    if (validation.warnings.length > 0) {
      for (const w of validation.warnings) console.log(`    ⚠️  ${w}`)
    }
    if (!validation.passed) {
      for (const e of validation.errors) console.log(`    ❌ ${e}`)
      throw new Error(`Pre-publish validation failed: ${validation.errors.join('; ')}`)
    }
    console.log('    ✅ Validation passed')

    let liveUrl = `${SITE_URL}/blog/${article.slug}`

    if (!dryRun) {
      // Step 2 — Git commit + push
      console.log('\n  Step 2/8 — Git commit + push')
      await gitCommitAndPush(article)

      // Step 3 — Vercel deploy polling
      console.log('\n  Step 3/8 — Vercel deploy polling')
      await pollVercelDeploy()

      // Step 4 — Live URL verification
      console.log('\n  Step 4/8 — Live URL verification')
      const isLive = await verifyLiveUrl(article.slug)
      if (!isLive) {
        console.warn('    ⚠️  Live URL not yet available — proceeding anyway (CDN propagation delay)')
      }
    } else {
      console.log('\n  Steps 2–4 skipped (dry run)')
    }

    // Step 5 — Update article status
    console.log('\n  Step 5/8 — Updating article status → published')
    await supabase
      .from('articles')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', article.id)

    // Step 6 — Update pipeline queue
    if (options.queueItemId) {
      console.log('  Step 6/8 — Updating pipeline queue → published')
      await supabase
        .from('pipeline_queue')
        .update({
          status: 'published',
          updated_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        })
        .eq('id', options.queueItemId)
    }

    if (!dryRun) {
      // Step 7 — IndexNow
      console.log('\n  Step 7/8 — IndexNow ping')
      await pingIndexNow(article.slug)

      // Step 8 — Resend notification
      console.log('\n  Step 8/8 — Email notification')
      await sendPublishNotification(article, liveUrl)
    } else {
      console.log('\n  Steps 7–8 skipped (dry run)')
    }

    const durationMs = Date.now() - startedAt
    const message = `Published "${article.title}" → ${liveUrl}`
    await logAgent('publish', 'completed', durationMs, message)

    console.log(`\n✅  ${message}`)
    return { success: true, articleId: article.id, liveUrl, message }
  } catch (err) {
    const durationMs = Date.now() - startedAt
    const message = err instanceof Error ? err.message : String(err)

    if (options.articleId) {
      await supabase
        .from('articles')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', options.articleId)
    }
    if (options.queueItemId) {
      await supabase
        .from('pipeline_queue')
        .update({ status: 'failed', error_message: message, updated_at: new Date().toISOString() })
        .eq('id', options.queueItemId)
    }

    await logAgent('publish', 'failed', durationMs, message)
    console.error(`\n❌  Publish error: ${message}`)
    return { success: false, message }
  }
}

// ---------------------------------------------------------------------------
// CLI entry
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')
  const result = await runPublish({ dryRun })
  process.exit(result.success ? 0 : 1)
}

main()
