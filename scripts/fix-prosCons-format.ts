/**
 * fix-prosCons-format.ts
 * Reformats ProsCons items in MDX articles to use "Título: explicación" format.
 * Only processes items that don't already have ": " or " — " separator.
 *
 * Usage: npx tsx --env-file=.env.local scripts/fix-prosCons-format.ts
 */

import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles')

function hasGoodFormat(item: string): boolean {
  // Item already has separator within first 55 chars
  const colonIdx = item.indexOf(': ')
  const dashIdx = item.indexOf(' — ')
  const splitIdx = colonIdx !== -1 && dashIdx !== -1
    ? Math.min(colonIdx, dashIdx)
    : colonIdx !== -1 ? colonIdx : dashIdx
  return splitIdx > 0 && splitIdx <= 55
}

function extractItems(str: string): string[] {
  const items: string[] = []
  const regex = /"([^"]+)"|'([^']+)'/g
  let m
  while ((m = regex.exec(str)) !== null) items.push(m[1] ?? m[2]!)
  return items
}

async function reformatItems(items: string[], context: string): Promise<string[]> {
  const toFix = items.filter(i => !hasGoodFormat(i))
  if (toFix.length === 0) return items

  const prompt = `Eres un editor de contenido para PymesTools.com (reviews de software para pymes españolas).

Reformatea los siguientes items de ProsCons al formato: "Título corto (máx 5 palabras): explicación concreta de 1 frase".

REGLAS:
- El título debe ser específico (no genérico como "Fácil de usar")
- La explicación debe responder "¿por qué esto importa para una pyme española?"
- Mantén la misma información, no inventes datos
- Longitud total máx 100 caracteres por item
- Devuelve SOLO los items reformateados, uno por línea, sin numeración ni comillas

Contexto del artículo: ${context}

Items a reformatear:
${toFix.map((item, i) => `${i + 1}. ${item}`).join('\n')}`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') return items

  const lines = content.text.trim().split('\n').map(l => l.replace(/^\d+\.\s*/, '').trim()).filter(Boolean)

  // Map fixed items back into original array
  const result = [...items]
  let fixIdx = 0
  for (let i = 0; i < result.length; i++) {
    if (!hasGoodFormat(result[i]!) && fixIdx < lines.length) {
      result[i] = lines[fixIdx]!
      fixIdx++
    }
  }
  return result
}

function buildReplacedBlock(block: string, newPros: string[], newCons: string[]): string {
  const formatArray = (items: string[]) =>
    items.map(item => `    "${item.replace(/"/g, '\\"')}"`).join(',\n')

  let result = block
  result = result.replace(/pros=\{\s*\[[\s\S]*?\]\s*\}/,
    `pros={[\n${formatArray(newPros)}\n  ]}`)
  result = result.replace(/cons=\{\s*\[[\s\S]*?\]\s*\}/,
    `cons={[\n${formatArray(newCons)}\n  ]}`)
  return result
}

async function processFile(filePath: string): Promise<boolean> {
  const content = await fs.readFile(filePath, 'utf-8')
  const filename = path.basename(filePath, '.mdx')

  const prosConsRegex = /<ProsCons[\s\S]*?\/>/g
  const matches = [...content.matchAll(prosConsRegex)]
  if (matches.length === 0) return false

  let hasChanges = false
  let updatedContent = content

  for (const match of matches) {
    const block = match[0]
    const prosArrayMatch = block.match(/pros=\{\s*\[([\s\S]*?)\]\s*\}/)
    const consArrayMatch = block.match(/cons=\{\s*\[([\s\S]*?)\]\s*\}/)

    const prosItems = prosArrayMatch ? extractItems(prosArrayMatch[1]!) : []
    const consItems = consArrayMatch ? extractItems(consArrayMatch[1]!) : []

    const allItems = [...prosItems, ...consItems]
    const needsFix = allItems.some(i => !hasGoodFormat(i))
    if (!needsFix) continue

    const newPros = await reformatItems(prosItems, filename)
    const newCons = await reformatItems(consItems, filename)

    const newBlock = buildReplacedBlock(block, newPros, newCons)
    updatedContent = updatedContent.replace(block, newBlock)
    hasChanges = true
  }

  if (hasChanges) {
    await fs.writeFile(filePath, updatedContent, 'utf-8')
  }

  return hasChanges
}

async function main() {
  console.log('\n🔧  Fix ProsCons Format\n')

  const files = (await fs.readdir(ARTICLES_DIR))
    .filter(f => f.endsWith('.mdx'))
    .sort()

  let fixed = 0
  let skipped = 0
  let errors = 0

  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file)
    try {
      const changed = await processFile(filePath)
      if (changed) {
        console.log(`  ✅  ${file}`)
        fixed++
      } else {
        skipped++
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`  ❌  ${file} — ${msg}`)
      errors++
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 300))
  }

  console.log(`\n✅  Done — fixed: ${fixed}, skipped: ${skipped}, errors: ${errors}\n`)
}

main().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
