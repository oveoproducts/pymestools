/**
 * release-price-checked.ts
 * Releases an article held at the QA price gate (PRICE_CHECK) after a human has
 * verified its prices against the vendor's own site: stamps `prices_verified`
 * in the frontmatter and moves it on to SEO review.
 *
 * Usage: npx tsx --env-file=.env.local scripts/release-price-checked.ts <slug> [YYYY-MM-DD]
 */
import matter from 'gray-matter'
import { supabase } from '../lib/db/client'
import { readArticleBody, writeArticleBody } from '../lib/content-store'

async function main() {
  const slug = process.argv[2]
  const date = process.argv[3] ?? new Date().toISOString().slice(0, 10)
  if (!slug) throw new Error('Usage: release-price-checked.ts <slug> [YYYY-MM-DD]')

  const parsed = matter(await readArticleBody(slug))
  parsed.data.prices_verified = date
  await writeArticleBody(slug, matter.stringify(parsed.content, parsed.data))

  const { data: article, error } = await supabase
    .from('articles')
    .update({ status: 'seo_review', updated_at: new Date().toISOString() })
    .eq('slug', slug)
    .select('id')
    .single()
  if (error || !article) throw new Error(`Article not found: ${slug}`)

  await supabase
    .from('pipeline_queue')
    .update({ status: 'seo_review', error_message: null, attempts: 0, updated_at: new Date().toISOString() })
    .eq('article_id', article.id)

  console.log(`✅ ${slug}: prices_verified=${date}, now in seo_review`)
}

main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1) })
