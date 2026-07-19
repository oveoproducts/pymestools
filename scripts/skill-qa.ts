/**
 * skill-qa.ts
 * QA skill — validates article quality via programmatic + AI checks.
 *
 * Tier 1 (programmatic):
 *   - Placeholder detection ({{PLACEHOLDER}} patterns)
 *   - Word count minimum (1500 words)
 *   - Required sections (Introduction, FAQ, Conclusion, affiliate disclosure)
 *   - Forbidden phrases (from data/forbidden-phrases.json)
 *
 * Tier 2 (AI):
 *   - Anthropic API review for factual accuracy, readability, SEO coherence
 *
 * Outcomes:
 *   - Pass (score ≥ 7.0) → status: seo_review
 *   - Fail with feedback → status: awaiting_human (or re-draft if auto-fix enabled)
 *
 * Usage: npx tsx scripts/skill-qa.ts
 */

import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import path from 'node:path'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '../lib/db/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QAOptions {
  queueItemId?: string | null
  articleId?: string | null
}

interface QAIssue {
  type: 'error' | 'warning'
  code: string
  message: string
}

interface Tier1Result {
  passed: boolean
  issues: QAIssue[]
  wordCount: number
}

interface Tier2Result {
  score: number // 1–10
  feedback: string
  passed: boolean
}

interface QAResult {
  success: boolean
  articleId?: string
  score?: number
  issues?: QAIssue[]
  message: string
}

interface ArticleRow {
  id: string
  title: string
  slug: string
  status: string
  quality_score: number | null
  quality_feedback: string | null
}

// ---------------------------------------------------------------------------
// Anthropic client
// ---------------------------------------------------------------------------

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function readArticleMDX(slug: string): Promise<string> {
  const filePath = path.join(process.cwd(), 'content', 'articles', `${slug}.mdx`)
  return fs.readFile(filePath, 'utf-8')
}

async function loadForbiddenPhrases(): Promise<string[]> {
  const filePath = path.join(process.cwd(), 'data', 'forbidden-phrases.json')
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    const parsed = JSON.parse(raw) as { phrases?: string[] } | string[]
    if (Array.isArray(parsed)) return parsed
    return parsed.phrases ?? []
  } catch {
    console.warn('  ⚠️  data/forbidden-phrases.json not found — skipping forbidden phrase check')
    return []
  }
}

async function fetchArticle(articleId: string): Promise<ArticleRow> {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, status, quality_score, quality_feedback')
    .eq('id', articleId)
    .single()

  if (error) throw new Error(`Article fetch error: ${error.message}`)
  return data as ArticleRow
}

async function logAgent(
  task: string,
  status: 'started' | 'completed' | 'failed',
  durationMs?: number,
  score?: number,
  feedback?: string
): Promise<void> {
  await supabase.from('agent_logs').insert({
    agent_name: 'skill-qa',
    task,
    status,
    duration_ms: durationMs,
    score,
    feedback,
  })
}

async function updateQueueItem(
  id: string,
  patch: { status: string; error_message?: string }
): Promise<void> {
  await supabase
    .from('pipeline_queue')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
}

// ---------------------------------------------------------------------------
// Tier 1 — Programmatic checks
// ---------------------------------------------------------------------------

// Nota: no se exige "## Introducción" — todas las plantillas usan
// deliberadamente un hook de apertura sin cabecera en vez de una
// introducción genérica (ver lib/prompts/templates/*.md).
const REQUIRED_SECTIONS = [
  { pattern: /##\s*(faq|preguntas frecuentes)/i, label: 'FAQ' },
  { pattern: /##\s*(conclusi[oó]n|resumen)/i, label: 'Conclusión' },
  { pattern: /afiliado|affiliate|compensaci[oó]n/i, label: 'Affiliate disclosure' },
]

const MIN_WORD_COUNT = 1500
const PLACEHOLDER_PATTERN = /\{\{[A-Z_]+\}\}/g

function runTier1Checks(mdx: string, forbiddenPhrases: string[]): Tier1Result {
  const issues: QAIssue[] = []

  // Word count
  const wordCount = mdx.split(/\s+/).filter(Boolean).length
  if (wordCount < MIN_WORD_COUNT) {
    issues.push({
      type: 'error',
      code: 'WORD_COUNT_LOW',
      message: `Word count ${wordCount} is below minimum ${MIN_WORD_COUNT}`,
    })
  }

  // Placeholder detection
  const placeholders = mdx.match(PLACEHOLDER_PATTERN) ?? []
  if (placeholders.length > 0) {
    const unique = [...new Set(placeholders)]
    issues.push({
      type: 'error',
      code: 'PLACEHOLDER_FOUND',
      message: `Unresolved placeholders: ${unique.join(', ')}`,
    })
  }

  // Required sections
  for (const section of REQUIRED_SECTIONS) {
    if (!section.pattern.test(mdx)) {
      issues.push({
        type: 'error',
        code: 'MISSING_SECTION',
        message: `Missing required section: ${section.label}`,
      })
    }
  }

  // Forbidden phrases
  for (const phrase of forbiddenPhrases) {
    const regex = new RegExp(phrase, 'i')
    if (regex.test(mdx)) {
      issues.push({
        type: 'warning',
        code: 'FORBIDDEN_PHRASE',
        message: `Forbidden phrase detected: "${phrase}"`,
      })
    }
  }

  const errors = issues.filter((i) => i.type === 'error')
  return { passed: errors.length === 0, issues, wordCount }
}

// ---------------------------------------------------------------------------
// Tier 2 — AI review
// ---------------------------------------------------------------------------

async function runTier2Review(
  mdx: string,
  articleTitle: string
): Promise<Tier2Result> {
  console.log('  Running Tier 2 AI review…')

  const systemPrompt = `Eres un editor experto en contenido SEO para pymes españolas.
Evalúa artículos en una escala del 1 al 10. Sé estricto pero justo.
Responde SOLO con JSON válido, sin markdown, sin explicación adicional.
Formato:
{
  "score": <number 1-10>,
  "feedback": "<feedback conciso en español, máx 300 chars>",
  "passed": <true si score >= 7>
}`

  const userPrompt = `Evalúa este artículo:
Título: ${articleTitle}

${mdx.slice(0, 4000)}${mdx.length > 4000 ? '\n[...truncado para revisión...]' : ''}`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 512,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'

  try {
    // Strip markdown code fences if present
    const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const parsed = JSON.parse(clean) as Tier2Result
    return {
      score: parsed.score ?? 5,
      feedback: parsed.feedback ?? '',
      passed: (parsed.score ?? 0) >= 7,
    }
  } catch {
    console.warn('  ⚠️  Could not parse AI review JSON, using defaults')
    return { score: 5, feedback: text.slice(0, 300), passed: false }
  }
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function runQA(options: QAOptions): Promise<QAResult> {
  const startedAt = Date.now()
  console.log('\n🔎  Skill QA\n')
  await logAgent('qa:review', 'started')

  try {
    if (!options.articleId) {
      // Pick next article in qa_review status
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, slug, status, quality_score, quality_feedback')
        .eq('status', 'qa_review')
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      if (error?.code === 'PGRST116') {
        return { success: false, message: 'No articles in qa_review status.' }
      }
      if (error) throw new Error(`Article fetch error: ${error.message}`)
      options = { ...options, articleId: (data as ArticleRow).id }
    }

    const article = await fetchArticle(options.articleId!)
    console.log(`  Article: "${article.title}" [${article.slug}]`)

    // Load MDX
    const mdx = await readArticleMDX(article.slug)

    // Load forbidden phrases
    const forbiddenPhrases = await loadForbiddenPhrases()

    // Tier 1
    console.log('  Running Tier 1 programmatic checks…')
    const tier1 = runTier1Checks(mdx, forbiddenPhrases)
    console.log(`  Tier 1: ${tier1.passed ? '✅ PASSED' : '❌ FAILED'} (${tier1.issues.length} issues, ${tier1.wordCount} words)`)

    for (const issue of tier1.issues) {
      console.log(`    [${issue.type.toUpperCase()}] ${issue.code}: ${issue.message}`)
    }

    if (!tier1.passed) {
      // Hard fail — send to awaiting_human
      await supabase
        .from('articles')
        .update({
          status: 'awaiting_human',
          quality_score: 0,
          quality_feedback: tier1.issues.map((i) => i.message).join('; '),
          updated_at: new Date().toISOString(),
        })
        .eq('id', article.id)

      if (options.queueItemId) {
        await updateQueueItem(options.queueItemId, {
          status: 'awaiting_human',
          error_message: 'Tier 1 QA failed',
        })
      }

      const durationMs = Date.now() - startedAt
      const message = `QA failed (Tier 1): ${tier1.issues.length} error(s)`
      await logAgent('qa:review', 'failed', durationMs, 0, message)
      return { success: false, articleId: article.id, issues: tier1.issues, message }
    }

    // Tier 2 (only if Tier 1 passes)
    const tier2 = await runTier2Review(mdx, article.title)
    console.log(`  Tier 2: score ${tier2.score}/10 — ${tier2.passed ? '✅ PASSED' : '❌ FAILED'}`)
    console.log(`  Feedback: ${tier2.feedback}`)

    const newStatus = tier2.passed ? 'seo_review' : 'awaiting_human'

    await supabase
      .from('articles')
      .update({
        status: newStatus,
        quality_score: tier2.score,
        quality_feedback: tier2.feedback,
        updated_at: new Date().toISOString(),
      })
      .eq('id', article.id)

    if (options.queueItemId) {
      await updateQueueItem(options.queueItemId, { status: newStatus })
    }

    const durationMs = Date.now() - startedAt
    const message = `QA ${tier2.passed ? 'passed' : 'failed'}: score ${tier2.score}/10 → ${newStatus}`
    await logAgent('qa:review', tier2.passed ? 'completed' : 'failed', durationMs, tier2.score, message)

    console.log(`\n${tier2.passed ? '✅' : '⚠️'}  ${message}`)
    return {
      success: tier2.passed,
      articleId: article.id,
      score: tier2.score,
      issues: tier1.issues,
      message,
    }
  } catch (err) {
    const durationMs = Date.now() - startedAt
    const message = err instanceof Error ? err.message : String(err)
    await logAgent('qa:review', 'failed', durationMs, undefined, message)
    console.error(`\n❌  QA error: ${message}`)
    return { success: false, message }
  }
}

// ---------------------------------------------------------------------------
// CLI entry
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const result = await runQA({})
  process.exit(result.success ? 0 : 1)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
