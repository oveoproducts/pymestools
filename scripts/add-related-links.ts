/**
 * add-related-links.ts
 * Adds a "Sigue leyendo" block (4 related articles + 1 category hub link) to
 * every published article that doesn't have one. Targets with few inbound
 * links are favoured so link equity spreads instead of piling on reviews.
 *
 * Usage: npx tsx --env-file=.env.local scripts/add-related-links.ts [--dry]
 * Then run `npm run content:sync` to push the files to Supabase.
 */
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { supabase } from '../lib/db/client'

const DRY = process.argv.includes('--dry')
const MARK = '## Sigue leyendo'
const MAX_LINKS = 4
const INBOUND_CAP = 14
const PRIORITY = new Set([
  'hubspot-gratis-pymes-espana', 'hubspot-precio-y-planes-2026', 'review-brevo', 'email-marketing-b2b-pymes',
  'getresponse-opiniones-2026', 'review-getresponse', 'review-acumbamail', 'review-zoho-crm',
  'mejor-zoho-crm-para-servicios', 'mejor-zoho-crm-para-ecommerce', 'como-funciona-zoho-crm-tutorial-espanol',
])
const MONEY_TOOLS = new Set(['zoho-crm', 'getresponse'])
const HUB_LABEL: Record<string, string> = {
  'email-marketing': 'email marketing', crm: 'CRM', automatizacion: 'automatización', comparativas: 'software',
  facturacion: 'facturación', 'recursos-humanos': 'recursos humanos', 'gestion-proyectos': 'gestión de proyectos',
  seo: 'SEO', productividad: 'productividad', hosting: 'hosting',
}

interface Art { slug: string; cat: string; type: string; tools: string[]; title: string; file: string; raw: string; links: Set<string> }

function cleanTitle(t: string): string {
  const x = t.replace(/\s*\|\s*PymesTools\s*$/i, '').replace(/\s*\((2024|2025)\)\s*$/, '').trim()
  return x.charAt(0).toUpperCase() + x.slice(1)
}

async function main() {
  const { data } = await supabase.from('articles').select('slug,category,type,tools').eq('status', 'published')
  const arts: Art[] = []
  for (const a of data ?? []) {
    const file = path.join(process.cwd(), 'content', 'articles', `${a.slug}.mdx`)
    if (!fs.existsSync(file)) continue
    const raw = fs.readFileSync(file, 'utf-8')
    const fm = matter(raw).data
    const links = new Set<string>()
    for (const m of raw.matchAll(/\]\(\/[a-z-]+\/([a-z0-9-]+)\)/g)) links.add(m[1])
    arts.push({ slug: a.slug, cat: String(a.category).replace(/_/g, '-'), type: a.type, tools: a.tools ?? [], title: cleanTitle(String(fm.title ?? a.slug)), file, raw, links })
  }
  const inbound = new Map<string, number>(arts.map((a) => [a.slug, 0]))
  for (const a of arts) for (const l of a.links) if (inbound.has(l) && l !== a.slug) inbound.set(l, inbound.get(l)! + 1)

  let changed = 0
  const order = [...arts].sort((x, y) => x.slug.localeCompare(y.slug))
  for (const a of order) {
    if (a.raw.includes(MARK)) continue
    const cands = arts
      .filter((b) => b.slug !== a.slug && !a.links.has(b.slug))
      .map((b) => {
        const shared = b.tools.filter((t) => a.tools.includes(t)).length
        const sameCat = b.cat === a.cat ? 1 : 0
        if (shared === 0 && !sameCat) return { b, score: -1 }
        if (shared === 0 && a.type === 'how-to') return { b, score: -1 }
        const need = Math.max(0, 3 - (inbound.get(b.slug) ?? 0))
        const score = 3 * Math.min(shared, 2) + sameCat + need + (PRIORITY.has(b.slug) ? 3 : 0) +
          (MONEY_TOOLS.has(b.tools[0]) ? 1 : 0) + (b.type === 'review' ? 1 : 0) - ((inbound.get(b.slug) ?? 0) >= INBOUND_CAP ? 99 : 0)
        return { b, score }
      })
      .filter((c) => c.score > 0)
      .sort((x, y) => y.score - x.score || x.b.slug.localeCompare(y.b.slug))
      .slice(0, MAX_LINKS)
    if (cands.length === 0) continue

    const lines = cands.map((c) => `- [${c.b.title}](/${c.b.cat}/${c.b.slug})`)
    if (HUB_LABEL[a.cat]) lines.push(`- [Todas las guías de ${HUB_LABEL[a.cat]} para pymes](/${a.cat})`)
    const block = `${MARK}\n\n${lines.join('\n')}\n\n`

    const disc = a.raw.search(/\n---\s*\n+\*Este artículo contiene enlaces/)
    const next = disc >= 0 ? a.raw.slice(0, disc + 1) + '\n' + block + a.raw.slice(disc + 1) : a.raw.trimEnd() + '\n\n' + block
    for (const c of cands) inbound.set(c.b.slug, (inbound.get(c.b.slug) ?? 0) + 1)
    if (!DRY) fs.writeFileSync(a.file, next, 'utf-8')
    changed++
  }
  const zero = [...inbound.values()].filter((v) => v === 0).length
  console.log(`${DRY ? '[dry] ' : ''}articles updated: ${changed} / ${arts.length} · still 0 inbound: ${zero} · max inbound: ${Math.max(...inbound.values())}`)
}
main()
