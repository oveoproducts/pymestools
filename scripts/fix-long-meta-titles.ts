/**
 * fix-long-meta-titles.ts
 * Repairs published meta titles over 60 chars — including the ellipsis-mangled
 * ones produced by the old optimize-meta-titles.ts fallback. Rebuilds from
 * articles.title (never from the damaged meta) and writes DB + MDX together.
 *
 * Usage: npx tsx --env-file=.env.local scripts/fix-long-meta-titles.ts [--dry-run]
 */
import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { supabase } from '../lib/db/client'
import { buildMetaTitle, META_TITLE_MAX } from '../lib/seo/meta-title'

const DRY = process.argv.includes('--dry-run')

async function main() {
  const { data, error } = await supabase
    .from('articles')
    .select('slug, title, meta_title')
    .eq('status', 'published')
  if (error) throw error

  const broken = (data ?? []).filter((a) => (a.meta_title ?? '').length > META_TITLE_MAX)
  console.log(`\n🔧  ${broken.length} meta titles por encima de ${META_TITLE_MAX} caracteres${DRY ? '  [DRY RUN]' : ''}\n`)

  let changed = 0
  for (const a of broken) {
    const next = buildMetaTitle(a.title as string)
    if (next === a.meta_title) continue
    console.log(`  ${a.slug}`)
    console.log(`    antes (${a.meta_title!.length}): ${a.meta_title}`)
    console.log(`    ahora (${next.length}): ${next}\n`)
    changed++

    if (DRY) continue

    const { error: e } = await supabase
      .from('articles')
      .update({ meta_title: next, updated_at: new Date().toISOString() })
      .eq('slug', a.slug)
    if (e) throw new Error(`${a.slug}: ${e.message}`)

    // Keep the MDX in step so a later sync can't reintroduce the broken value.
    const file = path.join(process.cwd(), 'content', 'articles', `${a.slug}.mdx`)
    try {
      const raw = await fs.readFile(file, 'utf8')
      const parsed = matter(raw)
      parsed.data.meta_title = next
      await fs.writeFile(file, matter.stringify(parsed.content, parsed.data), 'utf8')
    } catch {
      console.log(`    (sin MDX en disco — sólo actualizado en Supabase)`)
    }
  }

  console.log(`${changed} título(s) ${DRY ? 'a corregir' : 'corregidos'}.\n`)
}

main()
