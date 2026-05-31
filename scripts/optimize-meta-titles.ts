/**
 * optimize-meta-titles.ts
 * Updates meta_title for all articles with CTR-optimized patterns.
 *
 * Usage: npx tsx --env-file=.env.local scripts/optimize-meta-titles.ts
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import matter from 'gray-matter'
import { supabase } from '../lib/db/client'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles')

const TOOL_NAMES: Record<string, string> = {
  'activecampaign': 'ActiveCampaign',
  'getresponse': 'GetResponse',
  'mailchimp': 'Mailchimp',
  'brevo': 'Brevo',
  'acumbamail': 'Acumbamail',
  'mailrelay': 'Mailrelay',
  'hubspot': 'HubSpot',
  'hubspot-crm': 'HubSpot CRM',
  'zoho-crm': 'Zoho CRM',
  'pipedrive': 'Pipedrive',
  'salesforce': 'Salesforce',
  'freshsales': 'Freshsales',
  'copper-crm': 'Copper CRM',
  'holded': 'Holded',
  'anfix': 'Anfix',
  'contasimple': 'Contasimple',
  'sage-50': 'Sage 50',
  'factusol': 'Factusol',
  'factorial': 'Factorial',
  'sesame': 'Sesame HR',
  'bizneo': 'Bizneo',
  'kenjo': 'Kenjo',
  'zapier': 'Zapier',
  'make': 'Make',
  'n8n': 'n8n',
  'notion': 'Notion',
  'trello': 'Trello',
  'asana': 'Asana',
  'clickup': 'ClickUp',
  'monday': 'Monday.com',
}

function toolName(slug: string): string {
  return TOOL_NAMES[slug] ?? slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function buildMetaTitle(title: string, type: string, tools: string[]): string {
  const year = '2026'
  const t1 = tools[0] ? toolName(tools[0]) : ''
  const t2 = tools[1] ? toolName(tools[1]) : ''

  if (type === 'review' && t1) {
    return `Review ${t1} ${year}: opiniones y precio para pymes`
  }

  if ((type === 'comparison' || type === 'comparativa') && t1 && t2) {
    const base = `${t1} vs ${t2} ${year}: ¿Cuál elegir para tu pyme?`
    if (base.length <= 60) return base
    return `${t1} vs ${t2} ${year}: comparativa para pymes`
  }

  if (type === 'alternatives' || type === 'alternativas') {
    if (t1) return `Mejores alternativas a ${t1} en ${year} para pymes`
  }

  // Default: clean title + year
  const clean = title.replace(/\s*[\(\[]?\d{4}[\)\]]?\s*/g, '').trim()
  const withYear = `${clean} (${year})`
  return withYear.length <= 62 ? withYear : `${clean.slice(0, 55)}… (${year})`
}

async function main() {
  const files = (await fs.readdir(ARTICLES_DIR)).filter((f: string) => f.endsWith('.mdx'))
  let updated = 0

  console.log(`\n🏷️  Optimizando meta titles de ${files.length} artículos\n`)

  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file)
    const slug = file.replace('.mdx', '')
    const raw = await fs.readFile(filePath, 'utf-8')
    const { data, content } = matter(raw)

    const metaTitle = buildMetaTitle(
      (data.title as string) ?? slug,
      (data.type as string) ?? 'review',
      Array.isArray(data.tools) ? data.tools : []
    )

    const newData = { ...data, meta_title: metaTitle }
    const newContent = matter.stringify(content, newData)
    await fs.writeFile(filePath, newContent, 'utf-8')
    await supabase.from('articles').update({ meta_title: metaTitle }).eq('slug', slug)

    console.log(`  ✅  ${slug}\n       "${metaTitle}"`)
    updated++
  }

  console.log(`\n✅  ${updated} meta titles actualizados\n`)
}

main().catch((err: Error) => { console.error('❌', err); process.exit(1) })
