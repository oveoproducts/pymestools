/**
 * add-early-cta.ts
 * Adds a second AffiliateLink right after the ProsCons block in review articles
 * that currently only have 1 CTA buried at the bottom (>70% into article).
 *
 * Usage: npx tsx --env-file=.env.local scripts/add-early-cta.ts
 */

import fs from 'node:fs/promises'
import path from 'node:path'

const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles')

async function processFile(filePath: string): Promise<boolean> {
  const content = await fs.readFile(filePath, 'utf-8')
  const lines = content.split('\n')

  // Only process if there's exactly 1 AffiliateLink, in the last 30% of the file
  const ctaLines = lines.reduce<number[]>((acc, l, i) => l.includes('AffiliateLink') ? [...acc, i] : acc, [])
  if (ctaLines.length !== 1) return false
  if (ctaLines[0]! / lines.length <= 0.70) return false

  // Extract existing CTA data
  const existingCta = lines[ctaLines[0]!]!
  const slugMatch = existingCta.match(/programSlug="([^"]+)"/)
  const articleMatch = existingCta.match(/articleSlug="([^"]+)"/)
  const labelMatch = existingCta.match(/label="([^"]+)"/)
  if (!slugMatch || !articleMatch || !labelMatch) return false

  const programSlug = slugMatch[1]!
  const articleSlug = articleMatch[1]!
  const label = labelMatch[1]!

  // Find the closing of the first ProsCons block
  const prosConsCloseIdx = lines.findIndex(l => {
    // Find the line that closes the ProsCons (either standalone "/> " or just "/>")
    return l.trim() === '/>'
  })

  if (prosConsCloseIdx === -1) return false

  // Make sure there isn't already a CTA right after the ProsCons
  const nextFewLines = lines.slice(prosConsCloseIdx + 1, prosConsCloseIdx + 5).join('\n')
  if (nextFewLines.includes('AffiliateLink')) return false

  // Insert CTA after ProsCons closing tag
  const earlyCtaLine = `<AffiliateLink programSlug="${programSlug}" articleSlug="${articleSlug}" label="${label}" />`
  lines.splice(prosConsCloseIdx + 1, 0, '', earlyCtaLine)

  await fs.writeFile(filePath, lines.join('\n'), 'utf-8')
  return true
}

async function main() {
  console.log('\n📍  Add early CTA after ProsCons\n')

  const files = (await fs.readdir(ARTICLES_DIR))
    .filter(f => f.endsWith('.mdx'))
    .sort()

  let fixed = 0
  for (const file of files) {
    const changed = await processFile(path.join(ARTICLES_DIR, file))
    if (changed) {
      console.log(`  ✅  ${file}`)
      fixed++
    }
  }

  console.log(`\n✅  Done — ${fixed} articles updated\n`)
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1) })
