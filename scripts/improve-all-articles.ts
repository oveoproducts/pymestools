/**
 * improve-all-articles.ts
 * Regenerates all articles (except already-improved ones) with claude-sonnet-4-6.
 * Reads metadata from existing MDX frontmatter — no hardcoded list needed.
 *
 * Usage: npx tsx --env-file=.env.local scripts/improve-all-articles.ts
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import matter from 'gray-matter'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '../lib/db/client'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.join(__dirname, '..')
const ARTICLES_DIR = path.join(PROJECT_ROOT, 'content', 'articles')

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Already improved with Sonnet — skip these
const ALREADY_IMPROVED = new Set([
  'brevo-vs-acumbamail',
  'mejores-software-rrhh-pymes-espana',
  'review-mailrelay',
  'review-mailchimp',
  'review-brevo',
  // Batch improved 2026-05-24 — 89 articles
  'activecampaign-vs-brevo',
  'activecampaign-vs-getresponse',
  'alternativas-activecampaign',
  'alternativas-factorial',
  'alternativas-getresponse',
  'alternativas-holded',
  'alternativas-hubspot-crm',
  'alternativas-mailchimp',
  'alternativas-pipedrive',
  'alternativas-salesforce',
  'alternativas-zapier-gratis',
  'alternativas-zoho-crm',
  'anfix-vs-contasimple',
  'asana-vs-trello',
  'automatizar-atencion-cliente-pymes',
  'automatizar-facturacion-pymes',
  'automatizar-redes-sociales-pymes',
  'brevo-vs-mailchimp',
  'como-aumentar-tasa-apertura-emails',
  'como-automatizar-tu-pyme',
  'como-calcular-finiquito-espana',
  'como-conectar-holded-con-crm',
  'como-crear-newsletter-pymes',
  'como-elegir-crm-pymes',
  'como-elegir-software-facturacion',
  'como-gestionar-nominas-pymes',
  'como-hacer-email-marketing-pymes',
  'como-hacer-factura-autonomo',
  'como-implementar-crm-pymes',
  'como-segmentar-lista-email-pymes',
  'como-usar-excel-como-crm',
  'control-horario-pymes',
  'crm-gratis-pymes',
  'crm-para-autonomos',
  'email-marketing-b2b-pymes',
  'email-marketing-gratis-pymes',
  'facturacion-electronica-pymes',
  'getresponse-vs-brevo',
  'getresponse-vs-mailchimp',
  'holded-vs-anfix',
  'holded-vs-sage',
  'hubspot-crm-gratis-guia',
  'hubspot-vs-activecampaign-pymes',
  'integrar-crm-email-marketing',
  'mailchimp-vs-acumbamail',
  'mailchimp-vs-mailrelay',
  'mailrelay-vs-acumbamail',
  'mejores-apps-facturacion-movil',
  'mejores-crm-pymes-espana',
  'mejores-crm-sector-servicios',
  'mejores-email-marketing-pymes-espana',
  'mejores-herramientas-automatizacion-pymes',
  'mejores-herramientas-gestion-proyectos-pymes',
  'mejores-programas-contabilidad-pymes',
  'mejores-software-facturacion-pymes',
  'notion-vs-clickup',
  'onboarding-digital-empleados-pymes',
  'pipedrive-vs-hubspot',
  'pipedrive-vs-zoho-crm',
  'review-activecampaign',
  'review-acumbamail',
  'review-anfix',
  'review-asana',
  'review-bizneo',
  'review-clickup',
  'review-contasimple',
  'review-copper-crm',
  'review-factorial',
  'review-factusol',
  'review-freshsales',
  'review-getresponse',
  'review-holded',
  'review-hubspot-crm',
  'review-kenjo',
  'review-make',
  'review-monday-crm',
  'review-n8n',
  'review-notion-pymes',
  'review-pipedrive',
  'review-power-automate-pymes',
  'review-sage-50',
  'review-salesforce-pymes',
  'review-sesame',
  'review-trello',
  'review-zapier',
  'review-zoho-crm',
  'salesforce-vs-hubspot',
  'sesame-vs-factorial',
  'software-control-presencia-pymes',
  'software-gestion-integral-pymes',
])

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

interface ArticleMeta {
  slug: string
  category: string
  type: string
  tools: string[]
  keyword: string
  filePath: string
}

async function readArticles(): Promise<ArticleMeta[]> {
  const files = (await fs.readdir(ARTICLES_DIR)).filter(f => f.endsWith('.mdx'))
  const articles: ArticleMeta[] = []

  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file)
    const raw = await fs.readFile(filePath, 'utf-8')
    try {
      const { data } = matter(raw)
      const slug = file.replace('.mdx', '')
      if (ALREADY_IMPROVED.has(slug)) continue
      articles.push({
        slug,
        category: (data.category as string) ?? '',
        type: (data.type as string) ?? 'review',
        tools: Array.isArray(data.tools) ? data.tools : [],
        keyword: (data.keywords_primary as string) ?? (data.title as string) ?? slug,
        filePath,
      })
    } catch { /* skip malformed */ }
  }

  return articles
}

async function generate(article: ArticleMeta, systemPrompt: string): Promise<string> {
  const template = await loadTemplate(article.type)

  const userPrompt = `Escribe un artículo MDX completo, detallado y de alta calidad para la keyword: "${article.keyword}"

Slug: ${article.slug}
Categoría: ${article.category}
Tipo: ${article.type}
Herramientas: ${article.tools.join(', ') || 'ninguna específica'}

FRONTMATTER OBLIGATORIO: title, slug ("${article.slug}"), description, category ("${article.category}"), type ("${article.type}"), tools (${JSON.stringify(article.tools)}), keywords_primary, status: "draft", author: "Equipo PymesTools", readingTime, publishedAt: null, updatedAt: "${new Date().toISOString()}"

REQUISITOS DE CALIDAD (artículo premium para posicionar en top 3):
- Mínimo 1.500 palabras de contenido real
- Incluye sección "## ¿Preguntas frecuentes?" con 3-5 preguntas reales (formato H3 con signo ?)
- Datos y precios actualizados a 2026
- Casos de uso concretos para pymes españolas
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
  const articles = await readArticles()
  console.log(`\n⭐  Mejorando ${articles.length} artículos con Claude Sonnet\n`)
  const systemPrompt = await loadSystemPrompt()

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i]
    console.log(`\n[${i + 1}/${articles.length}] ${article.slug}`)
    try {
      const mdx = await generate(article, systemPrompt)
      const clean = mdx.startsWith('---') ? mdx : mdx.slice(mdx.indexOf('---'))
      const cleaned = clean.replace(/\n?```\s*$/, '').trimEnd() + '\n'

      await fs.writeFile(article.filePath, cleaned, 'utf-8')
      await upsertToSupabase(article.slug, cleaned, article.category)
      console.log(`  ✅  Mejorado y sincronizado`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`  ❌  Error: ${msg}`)
      // Stop if credits run out
      if (msg.includes('credit balance')) {
        console.error('\n💳  Créditos agotados. Recarga en console.anthropic.com y vuelve a ejecutar.\n')
        process.exit(1)
      }
    }
  }

  console.log('\n✅  Todos los artículos mejorados\n')
}

main()
