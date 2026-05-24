/**
 * improve-top-articles.ts
 * Regenerates the top 5 articles by impressions using claude-sonnet-4-6
 * for higher quality content that ranks better.
 *
 * Usage: npx tsx --env-file=.env.local scripts/improve-top-articles.ts
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import matter from 'gray-matter'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '../lib/db/client'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.join(__dirname, '..')

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const ARTICLES_DIR = path.join(PROJECT_ROOT, 'content', 'articles')

// Top 5 by impressions — improve these with Sonnet for better rankings
const TOP_ARTICLES = [
  { slug: 'brevo-vs-acumbamail',              keyword: 'brevo vs acumbamail pymes españa cuál elegir',                category: 'email_marketing', type: 'comparison',   tools: ['brevo', 'acumbamail'] },
  { slug: 'mejores-software-rrhh-pymes-espana', keyword: 'mejor software recursos humanos pymes españa 2026',          category: 'recursos_humanos', type: 'top-list',    tools: ['factorial', 'sesame'] },
  { slug: 'review-mailrelay',                 keyword: 'mailrelay review pymes españa',                               category: 'email_marketing', type: 'review',       tools: ['mailrelay'] },
  { slug: 'review-mailchimp',                 keyword: 'mailchimp review español pymes',                              category: 'email_marketing', type: 'review',       tools: ['mailchimp'] },
  { slug: 'review-brevo',                     keyword: 'brevo review español pymes',                                  category: 'email_marketing', type: 'review',       tools: ['brevo'] },
]

async function loadSystemPrompt(): Promise<string> {
  return fs.readFile(path.join(PROJECT_ROOT, 'lib', 'prompts', 'content-system.md'), 'utf-8')
}

async function loadTemplate(type: string): Promise<string> {
  const map: Record<string, string> = {
    comparison: 'comparison.md', review: 'review.md', 'top-list': 'top-list.md',
    'how-to': 'how-to.md', alternatives: 'alternatives.md',
  }
  try {
    return await fs.readFile(path.join(PROJECT_ROOT, 'lib', 'prompts', 'templates', map[type] ?? 'review.md'), 'utf-8')
  } catch { return '' }
}

async function generate(article: typeof TOP_ARTICLES[0], systemPrompt: string): Promise<string> {
  const template = await loadTemplate(article.type)

  const userPrompt = `Escribe un artículo MDX completo, detallado y de alta calidad para la keyword: "${article.keyword}"

Slug: ${article.slug}
Categoría: ${article.category}
Tipo: ${article.type}
Herramientas: ${article.tools.join(', ')}

FRONTMATTER OBLIGATORIO: title, slug ("${article.slug}"), description, category ("${article.category}"), type ("${article.type}"), tools (${JSON.stringify(article.tools)}), keywords_primary, status: "draft", author: "Equipo PymesTools", readingTime, publishedAt: null, updatedAt: "${new Date().toISOString()}"

REQUISITOS DE CALIDAD (artículo premium para posicionar en top 3):
- Mínimo 1.500 palabras de contenido real
- Incluye sección "## ¿Preguntas frecuentes?" con 3-5 preguntas reales que busca la gente (formato H3 con signo de interrogación)
- Datos y precios verificados y actualizados a 2026
- Casos de uso concretos para pymes españolas con ejemplos reales
- Tabla comparativa detallada si aplica
- Párrafos máx 3 líneas. H2/H3 con emoji donde ayude
- Usa <Callout type="warning|tip|info"> para info crítica
- Usa <AffiliateLink programSlug="[slug]" articleSlug="${article.slug}" label="Probar [Herramienta] gratis" /> para CTAs
- Añade {/* TODO: captura */} donde irían screenshots

${template ? `PLANTILLA:\n${template}` : ''}

Devuelve SOLO el bloque MDX completo. Sin texto fuera del MDX.`

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  let text = msg.content[0].type === 'text' ? msg.content[0].text : ''
  console.log(`    tokens — in: ${msg.usage.input_tokens}, out: ${msg.usage.output_tokens}`)
  text = text.replace(/<(\d)/g, '&lt;$1')
  return text
}

async function upsertToSupabase(slug: string, mdx: string, category: string) {
  const { data: fm } = matter(mdx)
  await supabase.from('articles').upsert({
    title: fm.title ?? slug,
    slug,
    category: category.replace(/-/g, '_'),
    type: fm.type,
    meta_title: fm.meta_title ?? null,
    meta_description: fm.meta_description ?? fm.description ?? null,
    status: 'published',
    author: fm.author ?? 'Equipo PymesTools',
    tools: fm.tools ?? [],
    keywords_primary: fm.keywords_primary ?? null,
    reading_time_minutes: fm.readingTime ? parseInt(fm.readingTime) : null,
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'slug' })
}

async function main() {
  console.log('\n⭐  Mejorando top 5 artículos con Claude Sonnet\n')
  const systemPrompt = await loadSystemPrompt()

  for (const article of TOP_ARTICLES) {
    console.log(`\n[${TOP_ARTICLES.indexOf(article) + 1}/5] ${article.slug}`)
    try {
      const mdx = await generate(article, systemPrompt)
      const clean = mdx.startsWith('---') ? mdx : mdx.slice(mdx.indexOf('---'))
      const cleaned = clean.replace(/\n?```\s*$/, '').trimEnd() + '\n'

      await fs.writeFile(path.join(ARTICLES_DIR, `${article.slug}.mdx`), cleaned, 'utf-8')
      await upsertToSupabase(article.slug, cleaned, article.category)
      console.log(`  ✅  Mejorado y sincronizado`)
    } catch (err) {
      console.error(`  ❌  Error: ${err instanceof Error ? err.message : err}`)
    }
  }

  console.log('\n✅  Top 5 artículos mejorados\n')
}

main()
