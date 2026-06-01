/**
 * extract-scores.ts
 * Reads <ScoreCard score={X.X} /> from MDX body and writes score to frontmatter.
 * This allows the article page to include Review schema markup with star ratings.
 *
 * Usage: npx tsx --env-file=.env.local scripts/extract-scores.ts
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import matter from 'gray-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles')

async function main() {
  const files = (await fs.readdir(ARTICLES_DIR)).filter((f: string) => f.endsWith('.mdx'))
  let updated = 0

  console.log(`\n⭐  Extrayendo scores de ${files.length} artículos\n`)

  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file)
    const raw = await fs.readFile(filePath, 'utf-8')
    const { data, content } = matter(raw)

    const match = content.match(/<ScoreCard\s+score=\{(\d+\.?\d*)\}/)
    if (!match) continue

    const score = parseFloat(match[1])
    if (data.score === score) continue

    const newData = { ...data, score }
    const newContent = matter.stringify(content, newData)
    await fs.writeFile(filePath, newContent, 'utf-8')
    console.log(`  ✅  ${file.replace('.mdx', '')} — score: ${score}`)
    updated++
  }

  console.log(`\n✅  ${updated} artículos con score extraído\n`)
}

main().catch((err: Error) => { console.error('❌', err); process.exit(1) })
