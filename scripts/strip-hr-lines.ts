/**
 * strip-hr-lines.ts
 * Removes standalone --- lines from MDX article bodies (not frontmatter).
 * Keeps the --- immediately before the disclosure line (*Este artículo contiene).
 *
 * Usage: npx tsx scripts/strip-hr-lines.ts
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles')

async function main() {
  const files = (await fs.readdir(ARTICLES_DIR)).filter(f => f.endsWith('.mdx'))
  let updated = 0

  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file)
    const raw = await fs.readFile(filePath, 'utf-8')

    // Split into frontmatter + body
    const fmEnd = raw.indexOf('---', 3)
    if (fmEnd === -1) continue
    const frontmatter = raw.slice(0, fmEnd + 3)
    const body = raw.slice(fmEnd + 3)

    // Remove standalone --- lines, EXCEPT the one before the disclosure
    const cleaned = body
      // Keep "---\n*Este artículo" pattern
      .replace(/\n---\n(?!\n?\*Este artículo)/g, '\n')
      // Also clean up triple+ newlines left behind
      .replace(/\n{3,}/g, '\n\n')

    const newContent = frontmatter + cleaned

    if (newContent !== raw) {
      await fs.writeFile(filePath, newContent, 'utf-8')
      const removed = (raw.match(/\n---\n/g) ?? []).length - (newContent.match(/\n---\n/g) ?? []).length
      console.log(`  ✅  ${file.replace('.mdx', '')} — ${removed} HR(s) eliminados`)
      updated++
    } else {
      console.log(`  ⏭️   ${file.replace('.mdx', '')} (sin cambios)`)
    }
  }

  console.log(`\n✅  ${updated}/${files.length} artículos actualizados\n`)
}

main().catch(err => { console.error('❌', err); process.exit(1) })
