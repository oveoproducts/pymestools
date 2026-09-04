/**
 * backfill-content-mdx.ts
 * One-time: copies every MDX body on disk into articles.content_mdx so the
 * pipeline no longer depends on a particular checkout being present.
 *
 * Usage: npx tsx --env-file=.env.local scripts/backfill-content-mdx.ts
 */
import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { supabase } from '../lib/db/client'

async function main() {
  const dir = path.join(process.cwd(), 'content', 'articles')
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.mdx'))

  const { data: rows, error } = await supabase.from('articles').select('slug, content_mdx')
  if (error) throw error
  const known = new Map((rows ?? []).map((r) => [r.slug as string, r.content_mdx as string | null]))

  let written = 0
  let skipped = 0
  let orphan = 0

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '')
    if (!known.has(slug)) {
      orphan++
      continue
    }
    if (known.get(slug)) {
      skipped++
      continue
    }
    const mdx = await fs.readFile(path.join(dir, file), 'utf-8')
    const { error: e } = await supabase.from('articles').update({ content_mdx: mdx }).eq('slug', slug)
    if (e) throw new Error(`${slug}: ${e.message}`)
    written++
  }

  console.log(`\n  Escritos : ${written}`)
  console.log(`  Ya tenían: ${skipped}`)
  console.log(`  MDX en disco sin fila en DB (huérfanos): ${orphan}`)

  const missing = (rows ?? []).filter((r) => !r.content_mdx && !files.includes(`${r.slug}.mdx`))
  console.log(`  Filas en DB sin cuerpo por ningún lado: ${missing.length}`)
  for (const m of missing) console.log(`     - ${m.slug}`)
}

main()
