/**
 * skill-seo.ts
 * SEO skill — enriches a QA-approved article with meta tags, schema.org JSON-LD,
 * and AEO (Answer Engine Optimisation) validation.
 *
 * Flow:
 *   1. Fetch next article in seo_review status
 *   2. Generate meta title + meta description via Anthropic API
 *   3. Build schema.org JSON-LD (Article / FAQPage)
 *   4. Run AEO checks (FAQ presence, featured snippet anchor, structured data)
 *   5. Update article in DB (meta_title, meta_description, schema_markup, aeo_warnings)
 *   6. Advance status → ready_to_publish
 *
 * Usage: npx tsx scripts/skill-seo.ts
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

export interface SEOOptions {
  queueItemId?: string | null
  articleId?: string | null
}

interface AEOWarning {
  code: string
  message: string
}

interface SchemaArticle {
  '@context': string
  '@type': string
  headline: string
  description: string
  author: { '@type': string; name: string }
  publisher: { '@type': string; name: string; url: string }
  datePublished: string
  dateModified: string
  inLanguage: string
}

interface SchemaFAQPage {
  '@context': string
  '@type': 'FAQPage'
  mainEntity: Array<{
    '@type': 'Question'
    name: string
    acceptedAnswer: { '@type': 'Answer'; text: string }
  }>
}

type SchemaMarkup = {
  article: SchemaArticle
  faq?: SchemaFAQPage
}

interface MetaResult {
  metaTitle: string
  metaDescription: string
}

interface SEOResult {
  success: boolean
  articleId?: string
  metaTitle?: string
  aeoWarnings?: AEOWarning[]
  message: string
}

interface ArticleRow {
  id: string
  title: string
  slug: string
  category: string
  type: string
  keywords_primary: string | null
  author: string | null
  created_at: string
  updated_at: string
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

async function fetchArticle(articleId: string): Promise<ArticleRow> {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, category, type, keywords_primary, author, created_at, updated_at')
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
    agent_name: 'skill-seo',
    task,
    status,
    duration_ms: durationMs,
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
// Meta generation
// ---------------------------------------------------------------------------

async function generateMeta(article: ArticleRow, mdx: string): Promise<MetaResult> {
  console.log('  Generating meta title + description via Anthropic API…')

  const systemPrompt = `Eres un especialista SEO para pymes españolas.
Genera meta title y meta description optimizados para Google.
Responde SOLO con JSON válido:
{
  "metaTitle": "<título ≤60 chars, incluye keyword principal>",
  "metaDescription": "<descripción 120-160 chars, incluye CTA y keyword>"
}`

  const userPrompt = `Artículo: ${article.title}
Keyword principal: ${article.keywords_primary ?? article.title}
Categoría: ${article.category}
Tipo: ${article.type}
Extracto:
${mdx.slice(0, 800)}`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 256,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'

  try {
    const parsed = JSON.parse(text) as MetaResult
    return {
      metaTitle: (parsed.metaTitle ?? article.title).slice(0, 60),
      metaDescription: (parsed.metaDescription ?? '').slice(0, 160),
    }
  } catch {
    console.warn('  ⚠️  Could not parse meta JSON, using article title')
    return {
      metaTitle: article.title.slice(0, 60),
      metaDescription: `Guía completa sobre ${article.keywords_primary ?? article.title} para pymes. Aprende todo lo que necesitas saber.`.slice(0, 160),
    }
  }
}

// ---------------------------------------------------------------------------
// Schema.org JSON-LD builder
// ---------------------------------------------------------------------------

function buildSchemaMarkup(article: ArticleRow, meta: MetaResult, mdx: string): SchemaMarkup {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pymestools.com'
  const now = new Date().toISOString()

  const schemaArticle: SchemaArticle = {
    '@context': 'https://schema.org',
    '@type': article.type === 'how-to' ? 'HowTo' : 'Article',
    headline: meta.metaTitle,
    description: meta.metaDescription,
    author: {
      '@type': 'Organization',
      name: article.author ?? 'Equipo PymesTools',
    },
    publisher: {
      '@type': 'Organization',
      name: 'PymesTools',
      url: siteUrl,
    },
    datePublished: article.created_at,
    dateModified: now,
    inLanguage: 'es',
  }

  // Extract FAQ questions from MDX (## FAQ section)
  const faqSchema = extractFAQSchema(mdx)

  return {
    article: schemaArticle,
    ...(faqSchema ? { faq: faqSchema } : {}),
  }
}

const FAQ_QUESTION_PATTERN = /###\s+(.+)\n+([\s\S]+?)(?=###|\n##|$)/g

function extractFAQSchema(mdx: string): SchemaFAQPage | null {
  // Find FAQ section
  const faqMatch = mdx.match(/##\s+(FAQ|Preguntas frecuentes)([\s\S]+?)(?=\n##|$)/i)
  if (!faqMatch) return null

  const faqSection = faqMatch[2]
  const mainEntity: SchemaFAQPage['mainEntity'] = []

  let match: RegExpExecArray | null
  FAQ_QUESTION_PATTERN.lastIndex = 0
  while ((match = FAQ_QUESTION_PATTERN.exec(faqSection)) !== null) {
    const question = match[1].trim()
    const answer = match[2].trim().replace(/\n+/g, ' ').slice(0, 500)
    if (question && answer) {
      mainEntity.push({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })
    }
  }

  if (mainEntity.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  }
}

// ---------------------------------------------------------------------------
// AEO checks
// ---------------------------------------------------------------------------

function runAEOChecks(mdx: string, schema: SchemaMarkup): AEOWarning[] {
  const warnings: AEOWarning[] = []

  // 1. FAQ presence
  if (!schema.faq || schema.faq.mainEntity.length < 3) {
    warnings.push({
      code: 'AEO_FAQ_MISSING',
      message: 'Less than 3 FAQ questions found. Add a structured FAQ section for featured snippets.',
    })
  }

  // 2. Definition / featured snippet anchor
  const hasDefinitionParagraph = /^(.*\s+es\s+una?\s+.{20,})/im.test(mdx)
  if (!hasDefinitionParagraph) {
    warnings.push({
      code: 'AEO_NO_DEFINITION',
      message: 'No clear definition sentence found (e.g. "X es una herramienta…"). Add one for featured snippet.',
    })
  }

  // 3. Numbered list (useful for "top" queries)
  const hasNumberedList = /^\d+\.\s+/m.test(mdx)
  if (!hasNumberedList) {
    warnings.push({
      code: 'AEO_NO_NUMBERED_LIST',
      message: 'No numbered list found. Consider adding one to target position-zero answers.',
    })
  }

  // 4. Table presence
  const hasTable = /^\|.+\|$/m.test(mdx)
  if (!hasTable) {
    warnings.push({
      code: 'AEO_NO_TABLE',
      message: 'No markdown table found. Tables improve CTR in AI-powered search results.',
    })
  }

  return warnings
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function runSEO(options: SEOOptions): Promise<SEOResult> {
  const startedAt = Date.now()
  console.log('\n🔧  Skill SEO\n')
  await logAgent('seo:enrich', 'started')

  try {
    if (!options.articleId) {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, slug, category, type, keywords_primary, author, created_at, updated_at')
        .eq('status', 'seo_review')
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      if (error?.code === 'PGRST116') {
        return { success: false, message: 'No articles in seo_review status.' }
      }
      if (error) throw new Error(`Article fetch error: ${error.message}`)
      options = { ...options, articleId: (data as ArticleRow).id }
    }

    const article = await fetchArticle(options.articleId!)
    console.log(`  Article: "${article.title}" [${article.slug}]`)

    const mdx = await readArticleMDX(article.slug)

    // Generate meta
    const meta = await generateMeta(article, mdx)
    console.log(`  Meta title (${meta.metaTitle.length} chars): ${meta.metaTitle}`)
    console.log(`  Meta desc  (${meta.metaDescription.length} chars): ${meta.metaDescription}`)

    // Build schema
    const schemaMarkup = buildSchemaMarkup(article, meta, mdx)
    console.log(`  Schema: Article + ${schemaMarkup.faq ? `FAQPage (${schemaMarkup.faq.mainEntity.length} Q&A)` : 'no FAQ'}`)

    // AEO checks
    const aeoWarnings = runAEOChecks(mdx, schemaMarkup)
    if (aeoWarnings.length > 0) {
      console.log(`  AEO warnings (${aeoWarnings.length}):`)
      for (const w of aeoWarnings) {
        console.log(`    [${w.code}] ${w.message}`)
      }
    } else {
      console.log('  AEO checks: ✅ all passed')
    }

    // Update article in DB
    await supabase
      .from('articles')
      .update({
        meta_title: meta.metaTitle,
        meta_description: meta.metaDescription,
        schema_markup: schemaMarkup,
        aeo_warnings: aeoWarnings.length > 0 ? aeoWarnings : null,
        status: 'ready_to_publish',
        updated_at: new Date().toISOString(),
      })
      .eq('id', article.id)

    if (options.queueItemId) {
      await updateQueueItem(options.queueItemId, { status: 'ready_to_publish' })
    }

    const durationMs = Date.now() - startedAt
    const message = `SEO enrichment complete for "${article.slug}". ${aeoWarnings.length} AEO warning(s).`
    await logAgent('seo:enrich', 'completed', durationMs, message)

    console.log(`\n✅  ${message}`)
    return {
      success: true,
      articleId: article.id,
      metaTitle: meta.metaTitle,
      aeoWarnings,
      message,
    }
  } catch (err) {
    const durationMs = Date.now() - startedAt
    const message = err instanceof Error ? err.message : String(err)
    await logAgent('seo:enrich', 'failed', durationMs, message)
    console.error(`\n❌  SEO error: ${message}`)
    return { success: false, message }
  }
}

// ---------------------------------------------------------------------------
// CLI entry
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const result = await runSEO({})
  process.exit(result.success ? 0 : 1)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
