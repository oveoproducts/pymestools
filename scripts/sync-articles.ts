/**
 * sync-articles.ts
 * One-time script: reads all MDX frontmatter and upserts into Supabase articles table.
 * Usage: npx tsx --env-file=.env.local scripts/sync-articles.ts
 */

import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { supabase } from '../lib/db/client'

const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles')

async function main() {
  console.log('\n📂  Syncing MDX articles → Supabase\n')

  const files = (await fs.readdir(ARTICLES_DIR)).filter((f) => f.endsWith('.mdx'))
  console.log(`Found ${files.length} articles\n`)

  const rows = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(ARTICLES_DIR, file), 'utf8')
      const { data: fm } = matter(raw)

      const readingMinutes =
        typeof fm.readingTime === 'string'
          ? parseInt(fm.readingTime, 10) || null
          : null

      return {
        title: fm.title,
        slug: fm.slug,
        category: fm.category,
        type: fm.type,
        meta_title: fm.meta_title ?? null,
        meta_description: fm.meta_description ?? fm.description ?? null,
        status: fm.status ?? 'draft',
        author: fm.author ?? 'Equipo PymesTools',
        tools: fm.tools ?? [],
        keywords_primary: fm.keywords?.primary ?? null,
        quality_score: fm.qualityScore ?? null,
        reading_time_minutes: readingMinutes,
        published_at: fm.publishedAt ?? null,
        updated_at: fm.updatedAt ?? new Date().toISOString(),
      }
    })
  )

  const { data, error } = await supabase
    .from('articles')
    .upsert(rows, { onConflict: 'slug' })
    .select('id, title, slug, status')

  if (error) {
    console.error('❌  Upsert error:', error.message)
    process.exit(1)
  }

  console.log('Synced articles:')
  console.log('─'.repeat(70))
  for (const row of data ?? []) {
    console.log(`  • [${row.status.padEnd(9)}]  ${row.slug}`)
  }
  console.log('─'.repeat(70))
  console.log(`\n✅  ${(data ?? []).length} articles synced.\n`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
