/**
 * skill-content.ts
 * Content generation skill — turns an approved keyword into a full MDX article.
 *
 * Flow:
 *   1. Fetch next approved keyword from DB
 *   2. Load content-system.md + article template + research context
 *   3. Call Anthropic API (claude-sonnet-4-5)
 *   4. Save MDX to content/articles/{slug}.mdx
 *   5. Insert article record to DB (status: draft)
 *   6. Update pipeline_queue item
 *
 * Usage: npx tsx scripts/skill-content.ts
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

export interface ContentOptions {
  queueItemId?: string | null
  keywordId?: string | null
}

interface Keyword {
  id: string
  keyword: string
  search_intent: string | null
  category: string | null
  affiliate_program_ids: string[] | null
  priority_score: number | null
}

interface ArticleInsert {
  title: string
  slug: string
  category: string
  type: 'review' | 'comparison' | 'top-list' | 'how-to' | 'alternatives'
  keyword_id: string
  status: 'draft'
  keywords_primary: string
  reading_time_minutes: number
  tools: string[]
}

interface ContentResult {
  success: boolean
  articleId?: string
  slug?: string
  message: string
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

export function keywordToSlug(keyword: string): string {
  return keyword
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function inferArticleType(
  keyword: string,
  intent: string | null
): ArticleInsert['type'] {
  const kw = keyword.toLowerCase()
  if (kw.includes('alternativa')) return 'alternatives'
  if (kw.includes('comparati') || kw.includes(' vs ')) return 'comparison'
  if (kw.includes('mejor') || kw.includes('top')) return 'top-list'
  if (kw.includes('cómo') || kw.includes('como') || kw.includes('guía')) return 'how-to'
  if (intent === 'commercial') return 'review'
  return 'how-to'
}

function estimateReadingTime(markdown: string): number {
  const wordCount = markdown.split(/\s+/).length
  return Math.max(1, Math.round(wordCount / 200))
}

async function loadSystemPrompt(): Promise<string> {
  const systemPath = path.join(process.cwd(), 'lib', 'prompts', 'content-system.md')
  return fs.readFile(systemPath, 'utf-8')
}

async function loadTemplate(articleType: string): Promise<string> {
  const templateMap: Record<string, string> = {
    comparison: 'comparison.md',
    review: 'review.md',
    'top-list': 'top-list.md',
    'how-to': 'how-to.md',
    alternatives: 'alternatives.md',
  }
  const file = templateMap[articleType] ?? 'review.md'
  const templatePath = path.join(process.cwd(), 'lib', 'prompts', 'templates', file)
  try {
    return await fs.readFile(templatePath, 'utf-8')
  } catch {
    return ''
  }
}

async function buildUserPrompt(keyword: Keyword): Promise<string> {
  const affiliateNames = await fetchAffiliateNames(keyword.affiliate_program_ids ?? [])
  const articleType = inferArticleType(keyword.keyword, keyword.search_intent)
  const template = await loadTemplate(articleType)
  const slug = keywordToSlug(keyword.keyword)

  return `Escribe un artículo MDX completo para la keyword: "${keyword.keyword}"

Categoría: ${keyword.category ?? 'herramientas-pymes'}
Slug: ${slug}
Tipo: ${articleType}
Intención de búsqueda: ${keyword.search_intent ?? 'commercial'}
Herramientas afiliadas: ${affiliateNames.length > 0 ? affiliateNames.join(', ') : 'ninguna específica'}

FRONTMATTER OBLIGATORIO (incluye todos estos campos):
- title, slug ("${slug}"), description, category, type, tools[], keywords_primary
- status: "draft", author: "Equipo PymesTools", readingTime, publishedAt: null, updatedAt: "[hoy ISO]"

REGLAS DE FORMATO:
- Párrafos máx 3 líneas (~55 palabras). Si se alarga, rómpelo.
- H2/H3 con emoji donde ayude (💶 precios, ✅ ventajas, ❌ pegas, ⚠️ advertencias, 🇪🇸 España)
- Usa <Callout type="warning|tip|info"> para info crítica (permanencia, trampas de precio, consejos)
- Usa <AffiliateLink programSlug="[slug]" articleSlug="${slug}" label="Probar [Herramienta] gratis" /> para CTAs — NUNCA pongas URLs de afiliado directamente
- Añade {/* TODO: captura del dashboard */} donde irían imágenes clave

REGLAS CRÍTICAS PARA <ProsCons>:
- Cada item de pros/cons DEBE tener formato "Título corto: explicación concreta de 1 frase"
- El separador es ": " (dos puntos + espacio) — OBLIGATORIO en cada item
- CORRECTO: "Plan gratuito generoso: hasta 300 emails/día con contactos ilimitados, sin caducidad"
- CORRECTO: "Sin soporte telefónico: solo chat y email, con tiempos de respuesta de 24-48h"
- INCORRECTO: "Plan gratuito generoso" (sin explicación)
- INCORRECTO: "Interfaz en español" (sin contexto de por qué importa)
- Cada item debe poder leerse de forma independiente y responder "¿por qué esto es bueno/malo para una pyme española?"

${template ? `PLANTILLA DE ESTRUCTURA A SEGUIR:\n${template}` : ''}

Devuelve SOLO el bloque MDX completo. Sin texto fuera del MDX.`
}

async function fetchAffiliateNames(ids: string[]): Promise<string[]> {
  if (ids.length === 0) return []
  const { data } = await supabase
    .from('affiliate_programs')
    .select('name')
    .in('id', ids)
  return (data ?? []).map((r: { name: string }) => r.name)
}

async function logAgent(
  task: string,
  status: 'started' | 'completed' | 'failed',
  durationMs?: number,
  score?: number,
  feedback?: string
): Promise<void> {
  await supabase.from('agent_logs').insert({
    agent_name: 'skill-content',
    task,
    status,
    duration_ms: durationMs,
    score,
    feedback,
  })
}

async function updateQueueItem(
  id: string,
  patch: { status: string; article_id?: string; error_message?: string }
): Promise<void> {
  await supabase
    .from('pipeline_queue')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
}

// ---------------------------------------------------------------------------
// Core content generation
// ---------------------------------------------------------------------------

async function generateArticle(keyword: Keyword): Promise<string> {
  const systemPrompt = await loadSystemPrompt()
  const userPrompt = await buildUserPrompt(keyword)

  console.log(`  Calling Anthropic API for keyword: "${keyword.keyword}"`)

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Anthropic API')
  }

  console.log(
    `  API call complete. Input tokens: ${message.usage.input_tokens}, Output: ${message.usage.output_tokens}`
  )

  return stripCodeFence(content.text)
}

/**
 * The model occasionally wraps the whole MDX output in a ```mdx ... ```
 * fence despite instructions not to. That breaks frontmatter parsing and
 * component rendering, so strip it defensively rather than trust the prompt.
 */
function stripCodeFence(text: string): string {
  const trimmed = text.trim()
  const match = trimmed.match(/^```[a-z]*\n([\s\S]*)\n```$/)
  return match ? match[1] : trimmed
}

async function saveArticleMDX(slug: string, mdx: string): Promise<string> {
  const dir = path.join(process.cwd(), 'content', 'articles')
  await fs.mkdir(dir, { recursive: true })

  const filePath = path.join(dir, `${slug}.mdx`)
  await fs.writeFile(filePath, mdx, 'utf-8')
  console.log(`  Saved MDX → content/articles/${slug}.mdx`)
  return filePath
}

async function insertArticle(
  keyword: Keyword,
  slug: string,
  mdx: string
): Promise<string> {
  const articleType = inferArticleType(keyword.keyword, keyword.search_intent)
  const readingTime = estimateReadingTime(mdx)

  const insert: ArticleInsert = {
    title: keyword.keyword, // TODO: extract from MDX frontmatter
    slug,
    category: keyword.category ?? 'herramientas-pymes',
    type: articleType,
    keyword_id: keyword.id,
    status: 'draft',
    keywords_primary: keyword.keyword,
    reading_time_minutes: readingTime,
    tools: [], // TODO: extract from MDX frontmatter
  }

  const { data, error } = await supabase
    .from('articles')
    .insert(insert)
    .select('id')
    .single()

  if (error) throw new Error(`Article insert failed: ${error.message}`)
  return data.id as string
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function runContent(options: ContentOptions): Promise<ContentResult> {
  const startedAt = Date.now()
  console.log('\n✍️   Skill Content\n')
  await logAgent('content:generate', 'started')

  try {
    // 1. Fetch keyword
    let keyword: Keyword | null = null

    if (options.keywordId) {
      const { data, error } = await supabase
        .from('keywords')
        .select('id, keyword, search_intent, category, affiliate_program_ids, priority_score')
        .eq('id', options.keywordId)
        .single()
      if (error) throw new Error(`Keyword fetch error: ${error.message}`)
      keyword = data as Keyword
    } else {
      // Pick next approved keyword not yet in an article
      const { data, error } = await supabase
        .from('keywords')
        .select('id, keyword, search_intent, category, affiliate_program_ids, priority_score')
        .eq('status', 'approved')
        .order('priority_score', { ascending: false })
        .limit(1)
        .single()

      if (error?.code === 'PGRST116') {
        return { success: false, message: 'No approved keywords available.' }
      }
      if (error) throw new Error(`Keyword fetch error: ${error.message}`)
      keyword = data as Keyword
    }

    console.log(`  Keyword: "${keyword.keyword}" [${keyword.category}]`)

    // 2. Bail early if this slug is already published — avoids wasting an
    //    Anthropic API call and hitting the articles_slug_key constraint.
    const slug = keywordToSlug(keyword.keyword)
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existingArticle) {
      await supabase.from('keywords').update({ status: 'rejected' }).eq('id', keyword.id)
      const message = `Skipped: slug "${slug}" already published`
      if (options.queueItemId) {
        await updateQueueItem(options.queueItemId, { status: 'failed', error_message: message })
      }
      await logAgent('content:generate', 'completed', Date.now() - startedAt, undefined, message)
      console.log(`\n⏭️   ${message}`)
      return { success: false, message }
    }

    // 3. Mark keyword in_progress
    await supabase
      .from('keywords')
      .update({ status: 'in_progress' })
      .eq('id', keyword.id)

    // 4. Generate article via Anthropic API
    const mdx = await generateArticle(keyword)

    // 5. Save MDX
    await saveArticleMDX(slug, mdx)

    // 6. Insert article record
    const articleId = await insertArticle(keyword, slug, mdx)

    // 7. Update pipeline queue
    if (options.queueItemId) {
      await updateQueueItem(options.queueItemId, {
        status: 'qa_review',
        article_id: articleId,
      })
    }

    const durationMs = Date.now() - startedAt
    const message = `Article drafted: ${slug} (${estimateReadingTime(mdx)} min read)`
    await logAgent('content:generate', 'completed', durationMs, undefined, message)

    console.log(`\n✅  ${message}`)
    return { success: true, articleId, slug, message }
  } catch (err) {
    const durationMs = Date.now() - startedAt
    const message = err instanceof Error ? err.message : String(err)

    if (options.queueItemId) {
      await updateQueueItem(options.queueItemId, {
        status: 'failed',
        error_message: message,
      })
    }

    await logAgent('content:generate', 'failed', durationMs, undefined, message)
    console.error(`\n❌  Content error: ${message}`)
    return { success: false, message }
  }
}

// ---------------------------------------------------------------------------
// CLI entry
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const result = await runContent({})
  process.exit(result.success ? 0 : 1)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
