/**
 * generate-articles-batch4.ts
 * Generates 26 more articles to reach ~100 total.
 * Includes new category: gestion-proyectos.
 *
 * Usage: npx tsx --env-file=.env.local scripts/generate-articles-batch4.ts
 */
import path from 'node:path'
import fs from 'node:fs/promises'
import matter from 'gray-matter'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '../lib/db/client'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles')

const VALID_CATEGORIES = new Set([
  'email_marketing', 'crm', 'automatizacion', 'comparativas',
  'facturacion', 'recursos_humanos', 'gestion_proyectos',
])

const NEW_ARTICLES = [
  // Email marketing (4)
  { slug: 'mailrelay-vs-acumbamail',              keyword: 'mailrelay vs acumbamail herramientas españolas email marketing',       category: 'email_marketing',   type: 'comparison',   tools: ['mailrelay', 'acumbamail'] },
  { slug: 'getresponse-vs-brevo',                 keyword: 'getresponse vs brevo pymes españa cuál elegir',                       category: 'email_marketing',   type: 'comparison',   tools: ['getresponse', 'brevo'] },
  { slug: 'como-segmentar-lista-email-pymes',     keyword: 'cómo segmentar lista de email pymes para vender más',                 category: 'email_marketing',   type: 'how-to',       tools: ['activecampaign', 'brevo'] },
  { slug: 'email-marketing-b2b-pymes',            keyword: 'email marketing b2b para pymes españolas guía completa',              category: 'email_marketing',   type: 'how-to',       tools: ['activecampaign', 'getresponse'] },
  // CRM (4)
  { slug: 'hubspot-crm-gratis-guia',              keyword: 'cómo usar hubspot crm gratis pymes guía paso a paso',                 category: 'crm',               type: 'how-to',       tools: ['hubspot'] },
  { slug: 'como-usar-excel-como-crm',             keyword: 'cómo usar excel como crm para pymes y cuándo dejar de hacerlo',      category: 'crm',               type: 'how-to',       tools: ['hubspot', 'pipedrive'] },
  { slug: 'mejores-crm-sector-servicios',         keyword: 'mejor crm para empresas de servicios pymes españa',                  category: 'crm',               type: 'top-list',     tools: ['hubspot', 'pipedrive', 'zoho-crm'] },
  { slug: 'review-copper-crm',                    keyword: 'copper crm review pymes google workspace españa',                    category: 'crm',               type: 'review',       tools: ['copper'] },
  // Facturación (4)
  { slug: 'verifactu-pymes-espana',               keyword: 'verifactu qué es cómo afecta a pymes españa 2026',                   category: 'facturacion',       type: 'how-to',       tools: ['holded', 'anfix'] },
  { slug: 'como-elegir-software-facturacion',     keyword: 'cómo elegir software de facturación para tu pyme española',          category: 'facturacion',       type: 'how-to',       tools: ['holded', 'anfix', 'sage'] },
  { slug: 'ticket-bai-pymes',                     keyword: 'ticketbai qué es obligaciones pymes país vasco navarra',             category: 'facturacion',       type: 'how-to',       tools: ['holded'] },
  { slug: 'mejores-apps-facturacion-movil',       keyword: 'mejor app facturación móvil autónomos pymes españa',                 category: 'facturacion',       type: 'top-list',     tools: ['holded', 'anfix', 'contasimple'] },
  // RRHH (3)
  { slug: 'como-calcular-finiquito-espana',       keyword: 'cómo calcular el finiquito de un trabajador en españa 2026',         category: 'recursos_humanos',  type: 'how-to',       tools: [] },
  { slug: 'onboarding-digital-empleados-pymes',   keyword: 'cómo hacer onboarding digital de empleados en pymes españa',        category: 'recursos_humanos',  type: 'how-to',       tools: ['factorial', 'sesame'] },
  { slug: 'software-control-presencia-pymes',     keyword: 'mejor software control de presencia y fichajes pymes españa',       category: 'recursos_humanos',  type: 'top-list',     tools: ['factorial', 'sesame', 'bizneo'] },
  // Automatización (4)
  { slug: 'review-power-automate-pymes',          keyword: 'microsoft power automate review pymes españa alternativa zapier',    category: 'automatizacion',    type: 'review',       tools: ['power-automate'] },
  { slug: 'zapier-guia-completa-pymes',           keyword: 'zapier guía completa para pymes en español desde cero',              category: 'automatizacion',    type: 'how-to',       tools: ['zapier'] },
  { slug: 'automatizar-redes-sociales-pymes',     keyword: 'cómo automatizar redes sociales para pymes sin agencia',             category: 'automatizacion',    type: 'how-to',       tools: ['zapier', 'make'] },
  { slug: 'como-conectar-holded-con-crm',         keyword: 'cómo conectar holded con hubspot pipedrive pymes',                   category: 'automatizacion',    type: 'how-to',       tools: ['holded', 'zapier'] },
  // Gestión de proyectos (7) — nueva categoría
  { slug: 'review-asana',                         keyword: 'asana review gestión proyectos pymes españa',                        category: 'gestion_proyectos', type: 'review',       tools: ['asana'] },
  { slug: 'review-trello',                        keyword: 'trello review gestión tareas pymes españa',                          category: 'gestion_proyectos', type: 'review',       tools: ['trello'] },
  { slug: 'review-notion-pymes',                  keyword: 'notion review para pymes y equipos pequeños españa',                 category: 'gestion_proyectos', type: 'review',       tools: ['notion'] },
  { slug: 'review-clickup',                       keyword: 'clickup review gestión proyectos pymes españa',                     category: 'gestion_proyectos', type: 'review',       tools: ['clickup'] },
  { slug: 'asana-vs-trello',                      keyword: 'asana vs trello pymes españa cuál elegir',                          category: 'gestion_proyectos', type: 'comparison',   tools: ['asana', 'trello'] },
  { slug: 'mejores-herramientas-gestion-proyectos-pymes', keyword: 'mejores herramientas gestión de proyectos pymes españa 2026', category: 'gestion_proyectos', type: 'top-list',  tools: ['asana', 'trello', 'notion', 'clickup'] },
  { slug: 'notion-vs-clickup',                    keyword: 'notion vs clickup pymes españa cuál es mejor',                      category: 'gestion_proyectos', type: 'comparison',   tools: ['notion', 'clickup'] },
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

async function upsertToSupabase(slug: string, mdx: string, categoryOverride: string) {
  const { data: fm } = matter(mdx)
  const category = categoryOverride.replace(/-/g, '_')
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
  console.log(`\n✍️   Generando ${NEW_ARTICLES.length} artículos nuevos (batch 4 → ~100 total)\n`)
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

  console.log('\n✅  Generación batch 4 completa\n')
}

main()
