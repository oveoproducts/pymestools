/**
 * regenerate-articles.ts
 * Regenerates all existing articles with the updated prompts and style.
 * Overwrites the MDX files and upserts to Supabase.
 * Usage: npx tsx --env-file=.env.local scripts/regenerate-articles.ts
 */
import path from 'node:path'
import fs from 'node:fs/promises'
import matter from 'gray-matter'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '../lib/db/client'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles')

const ARTICLES = [
  { slug: 'review-getresponse',                   keyword: 'getresponse review español pymes',        category: 'email_marketing', type: 'review',       tools: ['getresponse'] },
  { slug: 'review-activecampaign',                 keyword: 'activecampaign review español pymes',     category: 'email_marketing', type: 'review',       tools: ['activecampaign'] },
  { slug: 'review-brevo',                          keyword: 'brevo review español pymes',              category: 'email_marketing', type: 'review',       tools: ['brevo'] },
  { slug: 'review-hubspot-crm',                    keyword: 'hubspot crm review pymes españa',         category: 'crm',            type: 'review',       tools: ['hubspot'] },
  { slug: 'getresponse-vs-mailchimp',              keyword: 'getresponse vs mailchimp pymes',          category: 'email_marketing', type: 'comparison',   tools: ['getresponse'] },
  { slug: 'activecampaign-vs-getresponse',         keyword: 'activecampaign vs getresponse pymes',    category: 'email_marketing', type: 'comparison',   tools: ['activecampaign', 'getresponse'] },
  { slug: 'alternativas-getresponse',              keyword: 'alternativas a getresponse en españa',    category: 'email_marketing', type: 'alternatives', tools: ['getresponse'] },
  { slug: 'mejores-email-marketing-pymes-espana',  keyword: 'mejor email marketing pymes españa',     category: 'email_marketing', type: 'top-list',     tools: ['getresponse', 'activecampaign', 'brevo'] },
]

async function loadSystemPrompt(): Promise<string> {
  return fs.readFile(path.join(process.cwd(), 'lib', 'prompts', 'content-system.md'), 'utf-8')
}

async function loadTemplate(type: string): Promise<string> {
  const map: Record<string, string> = { comparison: 'comparison.md', review: 'review.md', 'top-list': 'top-list.md', 'how-to': 'how-to.md', alternatives: 'alternatives.md' }
  try { return await fs.readFile(path.join(process.cwd(), 'lib', 'prompts', 'templates', map[type] ?? 'review.md'), 'utf-8') } catch { return '' }
}

async function generate(article: typeof ARTICLES[0], systemPrompt: string): Promise<string> {
  const template = await loadTemplate(article.type)

  const userPrompt = `Escribe un artículo MDX completo para la keyword: "${article.keyword}"

Slug: ${article.slug}
Categoría: ${article.category}
Tipo: ${article.type}
Herramientas: ${article.tools.join(', ')}

FRONTMATTER OBLIGATORIO: title, slug ("${article.slug}"), description, category ("${article.category}"), type ("${article.type}"), tools (${JSON.stringify(article.tools)}), keywords_primary, status: "draft", author: "Equipo PymesTools", readingTime, publishedAt: null, updatedAt: "${new Date().toISOString()}"

REGLAS DE FORMATO:
- Párrafos máx 3 líneas (~55 palabras). Si se alarga, rómpelo con salto de línea o bullet.
- H2/H3 con emoji donde ayude (💶 precios, ✅ ventajas, ❌ pegas, ⚠️ advertencias, 🇪🇸 España)
- Usa <Callout type="warning|tip|info"> para info crítica
- Usa <AffiliateLink programSlug="[slug]" articleSlug="${article.slug}" label="Probar [Herramienta] gratis" /> para CTAs
- Añade {/* TODO: captura */} donde irían screenshots

${template ? `PLANTILLA:\n${template}` : ''}

Devuelve SOLO el bloque MDX completo.`

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  let text = msg.content[0].type === 'text' ? msg.content[0].text : ''
  console.log(`    tokens — in: ${msg.usage.input_tokens}, out: ${msg.usage.output_tokens}`)
  text = text.replace(/<(\d)/g, '&lt;$1')
  return text
}

async function upsertToSupabase(slug: string, mdx: string) {
  const { data: fm } = matter(mdx)
  await supabase.from('articles').upsert({
    title: fm.title ?? slug,
    slug,
    category: fm.category,
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
  console.log('\n🔄  Regenerando artículos con nuevos prompts\n')
  const systemPrompt = await loadSystemPrompt()

  for (const article of ARTICLES) {
    console.log(`\n[${ARTICLES.indexOf(article) + 1}/${ARTICLES.length}] ${article.slug}`)
    try {
      const mdx = await generate(article, systemPrompt)

      // Strip any leading/trailing non-MDX text
      const clean = mdx.startsWith('---') ? mdx : mdx.slice(mdx.indexOf('---'))

      await fs.writeFile(path.join(ARTICLES_DIR, `${article.slug}.mdx`), clean, 'utf-8')
      await upsertToSupabase(article.slug, clean)
      console.log(`  ✅  Guardado y sincronizado`)
    } catch (err) {
      console.error(`  ❌  Error: ${err instanceof Error ? err.message : err}`)
    }
  }

  console.log('\n✅  Regeneración completa\n')
}

main()
