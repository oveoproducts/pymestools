/**
 * add-internal-links.ts
 * Adds "También te puede interesar" section to all articles based on
 * shared tools and category. Also fixes trailing ``` fences left by
 * the article generator.
 *
 * Usage: npx tsx --env-file=.env.local scripts/add-internal-links.ts
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import matter from 'gray-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles')
const SITE_URL = 'https://pymestools.com'

interface ArticleMeta {
  slug: string
  title: string
  tools: string[]
  category: string
  type: string
  filePath: string
  content: string
}

function categoryToPath(category: string): string {
  return category.replace(/_/g, '-')
}

function score(a: ArticleMeta, b: ArticleMeta): number {
  if (a.slug === b.slug) return -1
  let s = 0
  // Shared tools are the strongest signal
  for (const tool of a.tools) {
    if (b.tools.includes(tool)) s += 3
  }
  // Same category
  if (a.category === b.category) s += 1
  // Bonus for complementary types (review ↔ comparison/alternatives)
  const complementary = new Set([
    'review:comparison', 'review:alternatives', 'review:top-list',
    'comparison:review', 'alternatives:review', 'top-list:review',
  ])
  if (complementary.has(`${a.type}:${b.type}`)) s += 1
  return s
}

function buildRelatedSection(current: ArticleMeta, all: ArticleMeta[]): string {
  const scored = all
    .filter((a) => a.slug !== current.slug)
    .map((a) => ({ meta: a, s: score(current, a) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)

  if (scored.length === 0) return ''

  const links = scored
    .map(({ meta }) => `- [${meta.title}](${SITE_URL}/${categoryToPath(meta.category)}/${meta.slug})`)
    .join('\n')

  return `\n---\n\n## 📖 También te puede interesar\n\n${links}\n`
}

function insertRelatedSection(raw: string, section: string): string {
  // Remove trailing ``` fence left by the generator
  const cleaned = raw.replace(/\n?```\s*$/, '').trimEnd()

  // Find the disclosure line and insert before its preceding ---
  const disclosureRegex = /(\n---\n\n?\*Este artículo contiene)/
  const match = disclosureRegex.exec(cleaned)
  if (match) {
    const idx = match.index
    return cleaned.slice(0, idx) + section + cleaned.slice(idx) + '\n'
  }

  // No disclosure found — append at end
  return cleaned + section + '\n'
}

async function main() {
  console.log('\n🔗  Adding internal links to articles\n')

  // 1. Read all articles
  const files = (await fs.readdir(ARTICLES_DIR)).filter((f) => f.endsWith('.mdx'))
  const articles: ArticleMeta[] = []

  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file)
    const raw = await fs.readFile(filePath, 'utf-8')
    const { data, content } = matter(raw)
    articles.push({
      slug: data.slug ?? file.replace('.mdx', ''),
      title: data.title ?? file,
      tools: Array.isArray(data.tools) ? data.tools : [],
      category: data.category ?? 'herramientas-pymes',
      type: data.type ?? 'article',
      filePath,
      content: raw,
    })
  }

  console.log(`  Found ${articles.length} articles\n`)

  // 2. Process each article
  let updated = 0
  for (const article of articles) {
    const section = buildRelatedSection(article, articles)
    const newContent = insertRelatedSection(article.content, section)

    if (newContent !== article.content) {
      await fs.writeFile(article.filePath, newContent, 'utf-8')
      console.log(`  ✅  ${article.slug}`)
      updated++
    } else {
      console.log(`  ⏭️   ${article.slug} (sin cambios)`)
    }
  }

  console.log(`\n✅  ${updated}/${articles.length} artículos actualizados\n`)
}

main().catch((err) => {
  console.error('❌', err)
  process.exit(1)
})
