/**
 * generate-new-articles.ts
 * Generates 15 new articles across email marketing, CRM, and facturación.
 * Skips articles that already exist as MDX files.
 *
 * Usage: npx tsx --env-file=.env.local scripts/generate-new-articles.ts
 */
import path from 'node:path'
import fs from 'node:fs/promises'
import matter from 'gray-matter'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '../lib/db/client'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles')

// Must match VALID_CATEGORIES in app/[category]/page.tsx and app/[category]/[slug]/page.tsx
const VALID_CATEGORIES = new Set([
  'email_marketing', 'crm', 'automatizacion', 'comparativas', 'facturacion', 'recursos-humanos',
])

function validateArticles() {
  const invalid = NEW_ARTICLES.filter((a) => !VALID_CATEGORIES.has(a.category))
  if (invalid.length > 0) {
    console.error('\n❌  Categorías no registradas en las rutas de Next.js:')
    for (const a of invalid) console.error(`   - ${a.slug}: "${a.category}"`)
    console.error('\n   Añádelas primero en app/[category]/page.tsx y app/[category]/[slug]/page.tsx\n')
    process.exit(1)
  }
}

const NEW_ARTICLES = [
  // Email marketing — completar nicho
  { slug: 'review-mailchimp',                    keyword: 'mailchimp review español pymes',               category: 'email_marketing', type: 'review',       tools: ['mailchimp'] },
  { slug: 'review-mailrelay',                    keyword: 'mailrelay review pymes españa',                category: 'email_marketing', type: 'review',       tools: ['mailrelay'] },
  { slug: 'review-acumbamail',                   keyword: 'acumbamail review pymes españa',               category: 'email_marketing', type: 'review',       tools: ['acumbamail'] },
  { slug: 'brevo-vs-mailchimp',                  keyword: 'brevo vs mailchimp pymes españa',              category: 'email_marketing', type: 'comparison',   tools: ['brevo', 'mailchimp'] },
  { slug: 'alternativas-mailchimp',              keyword: 'alternativas a mailchimp en españa pymes',     category: 'email_marketing', type: 'alternatives', tools: ['mailchimp'] },
  // CRM — categoría casi vacía
  { slug: 'review-zoho-crm',                    keyword: 'zoho crm review pymes españa',                 category: 'crm',             type: 'review',       tools: ['zoho-crm'] },
  { slug: 'review-pipedrive',                    keyword: 'pipedrive review pymes españa',                category: 'crm',             type: 'review',       tools: ['pipedrive'] },
  { slug: 'mejores-crm-pymes-espana',            keyword: 'mejor crm pymes españa 2026',                 category: 'crm',             type: 'top-list',     tools: ['hubspot', 'zoho-crm', 'pipedrive'] },
  { slug: 'zoho-crm-vs-hubspot',                 keyword: 'zoho crm vs hubspot pymes',                   category: 'crm',             type: 'comparison',   tools: ['zoho-crm', 'hubspot'] },
  { slug: 'pipedrive-vs-hubspot',                keyword: 'pipedrive vs hubspot pymes españa',            category: 'crm',             type: 'comparison',   tools: ['pipedrive', 'hubspot'] },
  { slug: 'alternativas-hubspot-crm',            keyword: 'alternativas a hubspot crm pymes españa',     category: 'crm',             type: 'alternatives', tools: ['hubspot'] },
  // Facturación — categoría nueva
  { slug: 'review-holded',                       keyword: 'holded review pymes españa',                   category: 'facturacion',     type: 'review',       tools: ['holded'] },
  { slug: 'review-factorial',                    keyword: 'factorial review pymes españa',                category: 'recursos-humanos', type: 'review',      tools: ['factorial'] },
  { slug: 'mejores-software-facturacion-pymes',  keyword: 'mejor software facturacion pymes españa',     category: 'facturacion',     type: 'top-list',     tools: ['holded', 'sage', 'anfix'] },
  { slug: 'holded-vs-sage',                      keyword: 'holded vs sage pymes españa',                  category: 'facturacion',     type: 'comparison',   tools: ['holded', 'sage'] },
]

async function loadSystemPrompt(): Promise<string> {
  return fs.readFile(path.join(process.cwd(), 'lib', 'prompts', 'content-system.md'), 'utf-8')
}

async function loadTemplate(type: string): Promise<string> {
  const map: Record<string, string> = { comparison: 'comparison.md', review: 'review.md', 'top-list': 'top-list.md', 'how-to': 'how-to.md', alternatives: 'alternatives.md' }
  try { return await fs.readFile(path.join(process.cwd(), 'lib', 'prompts', 'templates', map[type] ?? 'review.md'), 'utf-8') } catch { return '' }
}

async function generate(article: typeof NEW_ARTICLES[0], systemPrompt: string): Promise<string> {
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

Devuelve SOLO el bloque MDX completo. Sin texto fuera del MDX.`

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
  console.log(`    tokens — in: ${msg.usage.input_tokens}, out: ${msg.usage.output_tokens}`)
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
  validateArticles()
  console.log(`\n✍️   Generando ${NEW_ARTICLES.length} artículos nuevos\n`)
  const systemPrompt = await loadSystemPrompt()

  for (const article of NEW_ARTICLES) {
    const filePath = path.join(ARTICLES_DIR, `${article.slug}.mdx`)

    // Skip if already exists
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
      await upsertToSupabase(article.slug, cleaned)
      console.log(`  ✅  Guardado y sincronizado`)
    } catch (err) {
      console.error(`  ❌  Error: ${err instanceof Error ? err.message : err}`)
    }
  }

  console.log('\n✅  Generación completa\n')
}

main()
