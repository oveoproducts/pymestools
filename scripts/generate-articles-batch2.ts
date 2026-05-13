/**
 * generate-articles-batch2.ts
 * Generates ~25 new articles: CRM, email, facturación, RRHH, automatización.
 * Skips articles that already exist as MDX files.
 * Normalises category to underscore format so Supabase queries work correctly.
 *
 * Usage: npx tsx --env-file=.env.local scripts/generate-articles-batch2.ts
 */
import path from 'node:path'
import fs from 'node:fs/promises'
import matter from 'gray-matter'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '../lib/db/client'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles')

// Categories use underscore (normalised for Supabase). URLs use hyphen (converted in lib/db/articles.ts).
const VALID_CATEGORIES = new Set([
  'email_marketing', 'crm', 'automatizacion', 'comparativas', 'facturacion', 'recursos_humanos',
])

const NEW_ARTICLES = [
  // Email marketing
  { slug: 'activecampaign-vs-brevo',              keyword: 'activecampaign vs brevo pymes españa',                    category: 'email_marketing', type: 'comparison',   tools: ['activecampaign', 'brevo'] },
  { slug: 'alternativas-activecampaign',           keyword: 'alternativas a activecampaign pymes españa',              category: 'email_marketing', type: 'alternatives', tools: ['activecampaign'] },
  { slug: 'como-hacer-email-marketing-pymes',      keyword: 'cómo hacer email marketing pymes españa paso a paso',     category: 'email_marketing', type: 'how-to',       tools: ['brevo', 'mailchimp'] },
  { slug: 'brevo-vs-acumbamail',                   keyword: 'brevo vs acumbamail pymes españa',                        category: 'email_marketing', type: 'comparison',   tools: ['brevo', 'acumbamail'] },
  // CRM
  { slug: 'alternativas-pipedrive',                keyword: 'alternativas a pipedrive pymes españa',                   category: 'crm',             type: 'alternatives', tools: ['pipedrive'] },
  { slug: 'alternativas-zoho-crm',                 keyword: 'alternativas a zoho crm pymes españa',                    category: 'crm',             type: 'alternatives', tools: ['zoho-crm'] },
  { slug: 'pipedrive-vs-zoho-crm',                 keyword: 'pipedrive vs zoho crm pymes españa',                      category: 'crm',             type: 'comparison',   tools: ['pipedrive', 'zoho-crm'] },
  { slug: 'crm-gratis-pymes',                      keyword: 'crm gratis pymes españa 2026',                            category: 'crm',             type: 'top-list',     tools: ['hubspot', 'zoho-crm'] },
  { slug: 'como-elegir-crm-pymes',                 keyword: 'cómo elegir un crm para pymes paso a paso',               category: 'crm',             type: 'how-to',       tools: [] },
  { slug: 'review-freshsales',                     keyword: 'freshsales review pymes españa',                          category: 'crm',             type: 'review',       tools: ['freshsales'] },
  { slug: 'review-monday-crm',                     keyword: 'monday crm review pymes españa',                          category: 'crm',             type: 'review',       tools: ['monday-crm'] },
  // Facturación
  { slug: 'review-anfix',                          keyword: 'anfix review pymes españa',                               category: 'facturacion',     type: 'review',       tools: ['anfix'] },
  { slug: 'review-sage-50',                        keyword: 'sage 50 review pymes españa',                             category: 'facturacion',     type: 'review',       tools: ['sage'] },
  { slug: 'review-contasimple',                    keyword: 'contasimple review pymes españa',                         category: 'facturacion',     type: 'review',       tools: ['contasimple'] },
  { slug: 'holded-vs-anfix',                       keyword: 'holded vs anfix pymes españa',                            category: 'facturacion',     type: 'comparison',   tools: ['holded', 'anfix'] },
  { slug: 'alternativas-holded',                   keyword: 'alternativas a holded pymes españa',                      category: 'facturacion',     type: 'alternatives', tools: ['holded'] },
  { slug: 'mejores-programas-contabilidad-pymes',  keyword: 'mejor programa contabilidad pymes españa 2026',           category: 'facturacion',     type: 'top-list',     tools: ['holded', 'anfix', 'sage', 'contasimple'] },
  // Recursos Humanos
  { slug: 'review-sesame',                         keyword: 'sesame hr review pymes españa',                           category: 'recursos_humanos', type: 'review',      tools: ['sesame'] },
  { slug: 'sesame-vs-factorial',                   keyword: 'sesame vs factorial pymes españa',                        category: 'recursos_humanos', type: 'comparison',  tools: ['sesame', 'factorial'] },
  { slug: 'mejores-software-rrhh-pymes-espana',    keyword: 'mejor software recursos humanos pymes españa 2026',       category: 'recursos_humanos', type: 'top-list',    tools: ['factorial', 'sesame'] },
  // Automatización
  { slug: 'review-zapier',                         keyword: 'zapier review pymes españa en español',                   category: 'automatizacion',  type: 'review',       tools: ['zapier'] },
  { slug: 'review-make',                           keyword: 'make integromat review pymes españa',                     category: 'automatizacion',  type: 'review',       tools: ['make'] },
  { slug: 'zapier-vs-make',                        keyword: 'zapier vs make pymes españa cuál elegir',                 category: 'automatizacion',  type: 'comparison',   tools: ['zapier', 'make'] },
  { slug: 'mejores-herramientas-automatizacion-pymes', keyword: 'mejores herramientas automatización pymes españa',    category: 'automatizacion',  type: 'top-list',     tools: ['zapier', 'make'] },
  { slug: 'como-automatizar-tu-pyme',              keyword: 'cómo automatizar tu pyme sin programar guía completa',    category: 'automatizacion',  type: 'how-to',       tools: ['zapier', 'make'] },
]

function validateArticles() {
  const invalid = NEW_ARTICLES.filter((a) => !VALID_CATEGORIES.has(a.category))
  if (invalid.length > 0) {
    console.error('\n❌  Categorías no registradas:')
    for (const a of invalid) console.error(`   - ${a.slug}: "${a.category}"`)
    process.exit(1)
  }
}

async function loadSystemPrompt(): Promise<string> {
  return fs.readFile(path.join(process.cwd(), 'lib', 'prompts', 'content-system.md'), 'utf-8')
}

async function loadTemplate(type: string): Promise<string> {
  const map: Record<string, string> = {
    comparison: 'comparison.md', review: 'review.md', 'top-list': 'top-list.md',
    'how-to': 'how-to.md', alternatives: 'alternatives.md',
  }
  try {
    return await fs.readFile(path.join(process.cwd(), 'lib', 'prompts', 'templates', map[type] ?? 'review.md'), 'utf-8')
  } catch { return '' }
}

async function generate(article: typeof NEW_ARTICLES[0], systemPrompt: string): Promise<string> {
  const template = await loadTemplate(article.type)
  const categoryUrl = article.category.replace(/_/g, '-')

  const userPrompt = `Escribe un artículo MDX completo para la keyword: "${article.keyword}"

Slug: ${article.slug}
Categoría: ${article.category}
Tipo: ${article.type}
Herramientas: ${article.tools.join(', ') || 'ninguna específica'}

FRONTMATTER OBLIGATORIO: title, slug ("${article.slug}"), description, category ("${article.category}"), type ("${article.type}"), tools (${JSON.stringify(article.tools)}), keywords_primary, status: "draft", author: "Equipo PymesTools", readingTime, publishedAt: null, updatedAt: "${new Date().toISOString()}"

REGLAS DE FORMATO:
- Párrafos máx 3 líneas (~55 palabras). Si se alarga, rómpelo con salto de línea o bullet.
- H2/H3 con emoji donde ayude (💶 precios, ✅ ventajas, ❌ pegas, ⚠️ advertencias, 🇪🇸 España)
- Usa <Callout type="warning|tip|info"> para info crítica
- Usa <AffiliateLink programSlug="[slug]" articleSlug="${article.slug}" label="Probar [Herramienta] gratis" /> para CTAs
- Añade {/* TODO: captura */} donde irían screenshots

${template ? `PLANTILLA:\n${template}` : ''}

Devuelve SOLO el bloque MDX completo. Sin texto fuera del MDX.`

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

async function upsertToSupabase(slug: string, mdx: string, categoryOverride?: string) {
  const { data: fm } = matter(mdx)
  // Always normalise category to underscore for consistent Supabase queries
  const category = categoryOverride ?? (fm.category as string).replace(/-/g, '_')
  await supabase.from('articles').upsert({
    title: fm.title ?? slug,
    slug,
    category,
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
  validateArticles()
  console.log(`\n✍️   Generando ${NEW_ARTICLES.length} artículos nuevos (batch 2)\n`)
  const systemPrompt = await loadSystemPrompt()

  for (const article of NEW_ARTICLES) {
    const filePath = path.join(ARTICLES_DIR, `${article.slug}.mdx`)

    try {
      await fs.access(filePath)
      console.log(`\n[${NEW_ARTICLES.indexOf(article) + 1}/${NEW_ARTICLES.length}] ${article.slug} — ya existe, saltando`)
      continue
    } catch { /* no existe, generamos */ }

    console.log(`\n[${NEW_ARTICLES.indexOf(article) + 1}/${NEW_ARTICLES.length}] ${article.slug}`)
    try {
      const mdx = await generate(article, systemPrompt)
      const clean = mdx.startsWith('---') ? mdx : mdx.slice(mdx.indexOf('---'))
      const cleaned = clean.replace(/\n?```\s*$/, '').trimEnd() + '\n'

      await fs.writeFile(filePath, cleaned, 'utf-8')
      await upsertToSupabase(article.slug, cleaned, article.category)
      console.log(`  ✅  Guardado y sincronizado`)
    } catch (err) {
      console.error(`  ❌  Error: ${err instanceof Error ? err.message : err}`)
    }
  }

  console.log('\n✅  Generación batch 2 completa\n')
}

main()
