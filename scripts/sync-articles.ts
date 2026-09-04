/**
 * sync-articles.ts
 * Reads all MDX frontmatter and upserts into the Supabase articles table.
 *
 * Ownership rules — the two stores are not interchangeable:
 *   MDX owns  : title, category, type, tools, keywords_primary, reading time, body
 *   DB  owns  : status, published_at, schema_markup, quality_score
 *
 * The DB must win on status. Frontmatter goes stale the moment the pipeline
 * advances an article, so a naive upsert silently unpublishes live pages: two
 * published articles were carrying status:draft in their MDX and a plain sync
 * would have pulled them off the site.
 *
 * Usage: npx tsx --env-file=.env.local scripts/sync-articles.ts
 *        npx tsx --env-file=.env.local scripts/sync-articles.ts --dry-run
 */

import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { supabase } from '../lib/db/client'

const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles')

const DRY_RUN = process.argv.includes('--dry-run')

async function main() {
  console.log(`\n📂  Syncing MDX articles → Supabase${DRY_RUN ? '  [DRY RUN]' : ''}\n`)

  const files = (await fs.readdir(ARTICLES_DIR)).filter((f) => f.endsWith('.mdx'))
  console.log(`Found ${files.length} articles\n`)

  // Existing rows decide what must not be overwritten.
  const { data: existingRows, error: readErr } = await supabase
    .from('articles')
    .select('slug, status, published_at, meta_title, meta_description')
  if (readErr) {
    console.error('❌  Read error:', readErr.message)
    process.exit(1)
  }
  const existing = new Map((existingRows ?? []).map((r) => [r.slug as string, r]))

  const rows = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(ARTICLES_DIR, file), 'utf8')
      const { data: fm } = matter(raw)

      const readingMinutes =
        typeof fm.readingTime === 'string'
          ? parseInt(fm.readingTime, 10) || null
          : null

      const prior = existing.get(fm.slug)

      return {
        title: fm.title,
        slug: fm.slug,
        category: fm.category,
        type: fm.type,
        // Metas: frontmatter is authored deliberately, so it wins when set —
        // but an absent field must never blank an optimised value in the DB.
        meta_title: fm.meta_title ?? prior?.meta_title ?? null,
        meta_description:
          fm.meta_description ?? fm.description ?? prior?.meta_description ?? null,
        // Lifecycle belongs to the pipeline, never to frontmatter.
        status: prior?.status ?? fm.status ?? 'draft',
        published_at: prior?.published_at ?? fm.publishedAt ?? null,
        author: fm.author ?? 'Equipo PymesTools',
        tools: fm.tools ?? [],
        keywords_primary: fm.keywords?.primary ?? fm.keywords_primary ?? null,
        quality_score: fm.qualityScore ?? null,
        reading_time_minutes: readingMinutes,
        // Keep the body in the DB so no later stage depends on this checkout.
        content_mdx: raw,
        updated_at: fm.updatedAt ?? new Date().toISOString(),
      }
    })
  )

  const changes = rows.filter((r) => {
    const prior = existing.get(r.slug)
    return !prior || prior.meta_title !== r.meta_title || prior.meta_description !== r.meta_description
  })
  console.log(`  ${rows.length} artículos | ${rows.length - existing.size > 0 ? rows.length - existing.size : 0} nuevos | ${changes.length} con metas distintas\n`)

  if (DRY_RUN) {
    for (const r of changes.slice(0, 20)) console.log(`  ~ ${r.slug}`)
    console.log('\n(dry run — no se ha escrito nada)\n')
    return
  }

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
