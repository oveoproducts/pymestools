/**
 * optimize-meta-descriptions.ts
 * Generates CTR-optimized meta descriptions for all articles.
 *
 * Usage: npx tsx --env-file=.env.local scripts/optimize-meta-descriptions.ts
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import matter from 'gray-matter'
import { supabase } from '../lib/db/client'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles')

const TOOL_NAMES: Record<string, string> = {
  'activecampaign': 'ActiveCampaign', 'getresponse': 'GetResponse',
  'mailchimp': 'Mailchimp', 'brevo': 'Brevo', 'acumbamail': 'Acumbamail',
  'mailrelay': 'Mailrelay', 'hubspot': 'HubSpot', 'hubspot-crm': 'HubSpot CRM',
  'zoho-crm': 'Zoho CRM', 'pipedrive': 'Pipedrive', 'salesforce': 'Salesforce',
  'freshsales': 'Freshsales', 'copper-crm': 'Copper CRM', 'holded': 'Holded',
  'anfix': 'Anfix', 'contasimple': 'Contasimple', 'sage-50': 'Sage 50',
  'factusol': 'Factusol', 'factorial': 'Factorial', 'sesame': 'Sesame HR',
  'bizneo': 'Bizneo', 'kenjo': 'Kenjo', 'zapier': 'Zapier', 'make': 'Make',
  'n8n': 'n8n', 'notion': 'Notion', 'trello': 'Trello', 'asana': 'Asana',
  'clickup': 'ClickUp', 'monday': 'Monday.com',
}

function toolName(slug: string): string {
  return TOOL_NAMES[slug] ?? slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function buildDescription(title: string, type: string, tools: string[]): string {
  const t1 = tools[0] ? toolName(tools[0]) : ''
  const t2 = tools[1] ? toolName(tools[1]) : ''

  if (type === 'review' && t1) {
    return `Análisis completo de ${t1} para pymes españolas: precio, planes, pros y contras. ¿Vale la pena en 2026? Opinión honesta del equipo PymesTools.`
  }

  if ((type === 'comparison' || type === 'comparativa') && t1 && t2) {
    return `${t1} o ${t2}: comparamos precio, funciones y soporte para pymes españolas. Descubre cuál encaja mejor con tu empresa en 2026.`
  }

  if (type === 'top-list') {
    return `Las mejores opciones analizadas por el equipo PymesTools. Precios en euros, opiniones reales y comparativa para elegir sin equivocarte en 2026.`
  }

  if (type === 'alternatives' || type === 'alternativas') {
    if (t1) return `Las mejores alternativas a ${t1} para pymes españolas en 2026. Comparamos precio, funciones y facilidad de uso para que elijas la mejor opción.`
  }

  if (type === 'tutorial' || type === 'how-to') {
    return `Guía paso a paso para pymes y autónomos españoles. Aprende cómo hacerlo de forma sencilla con ejemplos reales y herramientas en español.`
  }

  // guia / default
  return `Guía completa para pymes y autónomos españoles. Todo lo que necesitas saber explicado de forma clara, con ejemplos reales y contexto legal español.`
}

async function main() {
  const files = (await fs.readdir(ARTICLES_DIR)).filter((f: string) => f.endsWith('.mdx'))
  let updated = 0

  console.log(`\n📝  Optimizando meta descriptions de ${files.length} artículos\n`)

  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file)
    const slug = file.replace('.mdx', '')
    const raw = await fs.readFile(filePath, 'utf-8')
    const { data, content } = matter(raw)

    const description = buildDescription(
      (data.title as string) ?? slug,
      (data.type as string) ?? 'guia',
      Array.isArray(data.tools) ? data.tools : []
    )

    const newData = { ...data, description, meta_description: description }
    const newContent = matter.stringify(content, newData)
    await fs.writeFile(filePath, newContent, 'utf-8')
    await supabase.from('articles').update({ meta_description: description }).eq('slug', slug)

    console.log(`  ✅  ${slug}`)
    updated++
  }

  console.log(`\n✅  ${updated} meta descriptions actualizadas\n`)
}

main().catch((err: Error) => { console.error('❌', err); process.exit(1) })
