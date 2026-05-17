/**
 * generate-articles-batch3.ts
 * Generates 25 more articles to reach ~74 total.
 * Skips articles that already exist as MDX files.
 *
 * Usage: npx tsx --env-file=.env.local scripts/generate-articles-batch3.ts
 */
import path from 'node:path'
import fs from 'node:fs/promises'
import matter from 'gray-matter'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '../lib/db/client'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles')

const VALID_CATEGORIES = new Set([
  'email_marketing', 'crm', 'automatizacion', 'comparativas', 'facturacion', 'recursos_humanos',
])

const NEW_ARTICLES = [
  // Email marketing
  { slug: 'email-marketing-gratis-pymes',          keyword: 'email marketing gratis pymes españa 2026',                    category: 'email_marketing',  type: 'top-list',     tools: ['brevo', 'mailchimp', 'mailrelay'] },
  { slug: 'como-crear-newsletter-pymes',            keyword: 'cómo crear una newsletter para tu pyme paso a paso',          category: 'email_marketing',  type: 'how-to',       tools: ['brevo', 'mailrelay'] },
  { slug: 'mailchimp-vs-mailrelay',                 keyword: 'mailchimp vs mailrelay pymes españa cuál elegir',             category: 'email_marketing',  type: 'comparison',   tools: ['mailchimp', 'mailrelay'] },
  { slug: 'mailchimp-vs-acumbamail',                keyword: 'mailchimp vs acumbamail pymes españa',                        category: 'email_marketing',  type: 'comparison',   tools: ['mailchimp', 'acumbamail'] },
  { slug: 'como-aumentar-tasa-apertura-emails',     keyword: 'cómo aumentar la tasa de apertura de emails pymes',          category: 'email_marketing',  type: 'how-to',       tools: [] },
  // CRM
  { slug: 'review-salesforce-pymes',                keyword: 'salesforce review pequeñas empresas pymes españa',            category: 'crm',              type: 'review',       tools: ['salesforce'] },
  { slug: 'alternativas-salesforce',                keyword: 'alternativas a salesforce para pymes españa 2026',            category: 'crm',              type: 'alternatives', tools: ['salesforce'] },
  { slug: 'crm-para-autonomos',                     keyword: 'mejor crm para autónomos y freelancers españa',               category: 'crm',              type: 'top-list',     tools: ['hubspot', 'pipedrive', 'zoho-crm'] },
  { slug: 'como-implementar-crm-pymes',             keyword: 'cómo implementar un crm en tu pyme sin errores',              category: 'crm',              type: 'how-to',       tools: [] },
  { slug: 'salesforce-vs-hubspot',                  keyword: 'salesforce vs hubspot pymes españa cuál elegir',              category: 'crm',              type: 'comparison',   tools: ['salesforce', 'hubspot'] },
  // Facturación
  { slug: 'facturacion-electronica-pymes',          keyword: 'facturación electrónica obligatoria pymes españa 2026',       category: 'facturacion',      type: 'how-to',       tools: ['holded', 'anfix'] },
  { slug: 'review-factusol',                        keyword: 'factusol review programa facturación gratuito pymes',         category: 'facturacion',      type: 'review',       tools: ['factusol'] },
  { slug: 'como-hacer-factura-autonomo',            keyword: 'cómo hacer una factura correcta como autónomo en españa',     category: 'facturacion',      type: 'how-to',       tools: ['holded', 'anfix'] },
  { slug: 'anfix-vs-contasimple',                   keyword: 'anfix vs contasimple pymes españa',                           category: 'facturacion',      type: 'comparison',   tools: ['anfix', 'contasimple'] },
  { slug: 'software-gestion-integral-pymes',        keyword: 'mejor software gestión integral pymes españa 2026',           category: 'facturacion',      type: 'top-list',     tools: ['holded', 'sage'] },
  // Recursos humanos
  { slug: 'review-bizneo',                          keyword: 'bizneo hr review software rrhh pymes españa',                 category: 'recursos_humanos', type: 'review',       tools: ['bizneo'] },
  { slug: 'control-horario-pymes',                  keyword: 'mejor software control horario pymes españa 2026',            category: 'recursos_humanos', type: 'top-list',     tools: ['factorial', 'sesame'] },
  { slug: 'como-gestionar-nominas-pymes',           keyword: 'cómo gestionar nóminas en una pyme española sin errores',     category: 'recursos_humanos', type: 'how-to',       tools: ['factorial'] },
  { slug: 'review-kenjo',                           keyword: 'kenjo review software recursos humanos pymes españa',         category: 'recursos_humanos', type: 'review',       tools: ['kenjo'] },
  { slug: 'alternativas-factorial',                 keyword: 'alternativas a factorial rrhh pymes españa',                  category: 'recursos_humanos', type: 'alternatives', tools: ['factorial'] },
  // Automatización
  { slug: 'review-n8n',                             keyword: 'n8n review automatización gratuita pymes españa',             category: 'automatizacion',   type: 'review',       tools: ['n8n'] },
  { slug: 'alternativas-zapier-gratis',             keyword: 'alternativas gratuitas a zapier para pymes españa',           category: 'automatizacion',   type: 'alternatives', tools: ['zapier'] },
  { slug: 'automatizar-facturacion-pymes',          keyword: 'cómo automatizar la facturación en tu pyme españa',           category: 'automatizacion',   type: 'how-to',       tools: ['zapier', 'holded'] },
  { slug: 'integrar-crm-email-marketing',           keyword: 'cómo integrar crm con email marketing pymes sin programar',  category: 'automatizacion',   type: 'how-to',       tools: ['zapier', 'make'] },
  { slug: 'automatizar-atencion-cliente-pymes',     keyword: 'cómo automatizar la atención al cliente en pymes españa',    category: 'automatizacion',   type: 'how-to',       tools: ['zapier', 'make'] },
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
  console.log(`\n✍️   Generando ${NEW_ARTICLES.length} artículos nuevos (batch 3)\n`)
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

  console.log('\n✅  Generación batch 3 completa\n')
}

main()
