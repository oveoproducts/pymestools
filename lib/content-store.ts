/**
 * content-store.ts
 * Single accessor for an article's MDX body.
 *
 * The pipeline used to keep the body only on the local filesystem. Each CI run
 * gets a fresh checkout, so a body written by the "content" stage was gone by
 * the time a later stage looked for it, and that stage died with ENOENT — the
 * failure that deadlocked the queue. Supabase is now the primary store and disk
 * is a cache, so any stage can run on any machine in any order.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { supabase } from './db/client'

export class MissingContentError extends Error {
  readonly slug: string
  constructor(slug: string) {
    super(
      `No MDX body for "${slug}" in Supabase or on disk. ` +
        `The draft was never persisted — this item cannot be recovered automatically.`,
    )
    this.name = 'MissingContentError'
    this.slug = slug
  }
}

function diskPath(slug: string): string {
  return path.join(process.cwd(), 'content', 'articles', `${slug}.mdx`)
}

/** Reads the body: Supabase first, disk as fallback (and backfills the DB). */
export async function readArticleBody(slug: string): Promise<string> {
  const { data } = await supabase
    .from('articles')
    .select('content_mdx')
    .eq('slug', slug)
    .maybeSingle()

  if (data?.content_mdx) return data.content_mdx as string

  try {
    const fromDisk = await fs.readFile(diskPath(slug), 'utf-8')
    // Opportunistic backfill so the next stage doesn't need the filesystem.
    await supabase.from('articles').update({ content_mdx: fromDisk }).eq('slug', slug)
    return fromDisk
  } catch {
    throw new MissingContentError(slug)
  }
}

/** Writes the body to Supabase (source of truth) and to disk (for the build). */
export async function writeArticleBody(slug: string, mdx: string): Promise<void> {
  const file = diskPath(slug)
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, mdx, 'utf-8')

  const { error } = await supabase
    .from('articles')
    .update({ content_mdx: mdx })
    .eq('slug', slug)
  if (error) throw new Error(`content_mdx write failed for ${slug}: ${error.message}`)
}
