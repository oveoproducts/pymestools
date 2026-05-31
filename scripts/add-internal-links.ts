/**
 * add-internal-links.ts
 * Adds internal links between articles by detecting tool mentions.
 * - Only links first mention per tool per article
 * - Max 5 internal links per article
 * - Skips headings, existing links, code blocks, and component lines
 *
 * Usage: npx tsx --env-file=.env.local scripts/add-internal-links.ts
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles')

// Tool name -> url, ordered longest first to avoid partial matches
const TOOL_MAP: Array<{ name: string; url: string; slug: string }> = [
  { name: 'Zoho CRM',       url: '/crm/review-zoho-crm',                   slug: 'review-zoho-crm' },
  { name: 'HubSpot CRM',    url: '/crm/review-hubspot-crm',                slug: 'review-hubspot-crm' },
  { name: 'HubSpot',        url: '/crm/review-hubspot-crm',                slug: 'review-hubspot-crm' },
  { name: 'Pipedrive',      url: '/crm/review-pipedrive',                  slug: 'review-pipedrive' },
  { name: 'Salesforce',     url: '/crm/review-salesforce-pymes',           slug: 'review-salesforce-pymes' },
  { name: 'Freshsales',     url: '/crm/review-freshsales',                 slug: 'review-freshsales' },
  { name: 'Copper CRM',     url: '/crm/review-copper-crm',                 slug: 'review-copper-crm' },
  { name: 'ActiveCampaign', url: '/email-marketing/review-activecampaign', slug: 'review-activecampaign' },
  { name: 'GetResponse',    url: '/email-marketing/review-getresponse',    slug: 'review-getresponse' },
  { name: 'Mailchimp',      url: '/email-marketing/review-mailchimp',      slug: 'review-mailchimp' },
  { name: 'Brevo',          url: '/email-marketing/review-brevo',          slug: 'review-brevo' },
  { name: 'Acumbamail',     url: '/email-marketing/review-acumbamail',     slug: 'review-acumbamail' },
  { name: 'Mailrelay',      url: '/email-marketing/review-mailrelay',      slug: 'review-mailrelay' },
  { name: 'Factorial',      url: '/recursos-humanos/review-factorial',     slug: 'review-factorial' },
  { name: 'Sesame HR',      url: '/recursos-humanos/review-sesame',        slug: 'review-sesame' },
  { name: 'Sesame',         url: '/recursos-humanos/review-sesame',        slug: 'review-sesame' },
  { name: 'Bizneo',         url: '/recursos-humanos/review-bizneo',        slug: 'review-bizneo' },
  { name: 'Kenjo',          url: '/recursos-humanos/review-kenjo',         slug: 'review-kenjo' },
  { name: 'Holded',         url: '/facturacion/review-holded',             slug: 'review-holded' },
  { name: 'Anfix',          url: '/facturacion/review-anfix',              slug: 'review-anfix' },
  { name: 'Contasimple',    url: '/facturacion/review-contasimple',        slug: 'review-contasimple' },
  { name: 'Sage 50',        url: '/facturacion/review-sage-50',            slug: 'review-sage-50' },
  { name: 'Factusol',       url: '/facturacion/review-factusol',           slug: 'review-factusol' },
  { name: 'Zapier',         url: '/automatizacion/review-zapier',          slug: 'review-zapier' },
  { name: 'Make',           url: '/automatizacion/review-make',            slug: 'review-make' },
  { name: 'n8n',            url: '/automatizacion/review-n8n',             slug: 'review-n8n' },
  { name: 'Notion',         url: '/gestion-proyectos/review-notion-pymes', slug: 'review-notion-pymes' },
  { name: 'Trello',         url: '/gestion-proyectos/review-trello',       slug: 'review-trello' },
  { name: 'Asana',          url: '/gestion-proyectos/review-asana',        slug: 'review-asana' },
  { name: 'ClickUp',        url: '/gestion-proyectos/review-clickup',      slug: 'review-clickup' },
  { name: 'Monday.com',     url: '/gestion-proyectos/review-monday-crm',   slug: 'review-monday-crm' },
]

function isSkippableLine(line: string): boolean {
  const t = line.trim()
  return (
    t.startsWith('#') ||
    t.startsWith('<') ||
    t.startsWith('|') ||
    t.startsWith('```') ||
    t.startsWith('    ') ||
    t.startsWith('`') ||
    t.includes('](') ||
    t.includes('programSlug') ||
    t.includes('articleSlug')
  )
}

function addInternalLinks(body: string, currentSlug: string): { text: string; count: number } {
  const lines = body.split('\n')
  let linksAdded = 0
  const MAX_LINKS = 5
  const linkedSlugs = new Set<string>()

  const processed = lines.map(line => {
    if (linksAdded >= MAX_LINKS || isSkippableLine(line)) return line

    let result = line

    for (const tool of TOOL_MAP) {
      if (linksAdded >= MAX_LINKS) break
      if (tool.slug === currentSlug) continue
      if (linkedSlugs.has(tool.slug)) continue

      const escaped = tool.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp('\\b' + escaped + '\\b')

      if (regex.test(result) && !result.includes('[' + tool.name + ']')) {
        result = result.replace(regex, '[' + tool.name + '](' + tool.url + ')')
        linkedSlugs.add(tool.slug)
        linksAdded++
      }
    }

    return result
  })

  return { text: processed.join('\n'), count: linksAdded }
}

async function main() {
  const files = (await fs.readdir(ARTICLES_DIR)).filter((f: string) => f.endsWith('.mdx'))
  let totalLinks = 0
  let updatedFiles = 0

  console.log('\n🔗  Añadiendo enlaces internos a ' + files.length + ' artículos\n')

  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file)
    const slug = file.replace('.mdx', '')
    const raw = await fs.readFile(filePath, 'utf-8')

    const fmEnd = raw.indexOf('---', 3)
    if (fmEnd === -1) continue

    const frontmatter = raw.slice(0, fmEnd + 3)
    const body = raw.slice(fmEnd + 3)

    const { text: newBody, count } = addInternalLinks(body, slug)

    if (count > 0) {
      await fs.writeFile(filePath, frontmatter + newBody, 'utf-8')
      console.log('  ✅  ' + slug + ' — ' + count + ' enlace(s)')
      totalLinks += count
      updatedFiles++
    }
  }

  console.log('\n✅  ' + updatedFiles + ' artículos actualizados — ' + totalLinks + ' enlaces internos añadidos\n')
}

main().catch((err: Error) => { console.error('❌', err); process.exit(1) })
