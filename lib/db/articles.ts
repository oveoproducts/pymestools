import { supabase } from './client'

export interface Article {
  id: string
  title: string
  slug: string
  category: string
  type: string
  meta_title: string | null
  meta_description: string | null
  quality_score: number | null
  status: string
  author: string | null
  reading_time_minutes: number | null
  tools: string[]
  published_at: string | null
  updated_at: string | null
  /** Alias for meta_description */
  description: string | null
  keywords_primary: string | null
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !data) return null

  return normalise(data)
}

export async function getPublishedArticles(limit?: number): Promise<Article[]> {
  let query = supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (limit !== undefined) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error || !data) return []

  return data.map(normalise)
}

export async function getAllArticleSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('slug')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error || !data) return []

  return data.map((row: { slug: string }) => row.slug)
}

export async function getArticlesByCategory(
  category: string,
  limit?: number,
): Promise<Article[]> {
  const dbCategory = category.replace(/-/g, '_')
  let query = supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .eq('category', dbCategory)
    .order('published_at', { ascending: false })

  if (limit !== undefined) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error || !data) return []

  return data.map(normalise)
}

/**
 * Related articles for a given article: prioritizes articles that share a
 * tool (e.g. other HubSpot content) over just "same category, most recent" —
 * the previous logic ignored `tools` entirely, so a HubSpot review's related
 * block could show unrelated CRM articles while missing
 * "alternativas-a-hubspot" or "hubspot-precio-y-planes" pages.
 *
 * One slot is reserved for whichever topically-relevant candidate is
 * currently weakest in Search Console (traffic audit, 2026-09-05): with
 * 123 articles and near-zero domain authority, internal links are the
 * cheapest lever this site has, and left to pure recency they never
 * deliberately reach the pages that need them — a page Google has never
 * even crawled scores as weak as it gets, worse than any real position.
 */
export async function getRelatedArticles(
  article: Pick<Article, 'id' | 'category' | 'tools'>,
  limit = 3,
): Promise<Article[]> {
  const pool: Article[] = []
  const seen = new Set([article.id])

  if (article.tools.length > 0) {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .neq('id', article.id)
      .overlaps('tools', article.tools)
      .order('published_at', { ascending: false })
      .limit(limit * 4)

    for (const a of data ?? []) {
      if (seen.has(a.id)) continue
      pool.push(normalise(a))
      seen.add(a.id)
    }
  }

  if (pool.length < limit * 2) {
    const dbCategory = article.category.replace(/-/g, '_')
    const { data: byCategory } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .eq('category', dbCategory)
      .order('published_at', { ascending: false })
      .limit(limit * 4)

    for (const a of byCategory ?? []) {
      if (seen.has(a.id)) continue
      pool.push(normalise(a))
      seen.add(a.id)
    }
  }

  if (pool.length <= limit) return pool

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10)
  const { data: metrics } = await supabase
    .from('content_metrics')
    .select('article_id, impressions, avg_position')
    .in(
      'article_id',
      pool.map((a) => a.id),
    )
    .gte('recorded_at', thirtyDaysAgo)

  const posByArticle = new Map<string, { weightedSum: number; weight: number }>()
  for (const m of metrics ?? []) {
    if (m.avg_position == null || m.impressions === 0) continue
    const cur = posByArticle.get(m.article_id) ?? { weightedSum: 0, weight: 0 }
    cur.weightedSum += m.avg_position * m.impressions
    cur.weight += m.impressions
    posByArticle.set(m.article_id, cur)
  }

  // No impressions in 30 days outranks (in weakness) even position 100 —
  // it means the page hasn't been discovered at all, not just that it
  // ranks poorly for something.
  const weaknessScore = (a: Article): number => {
    const p = posByArticle.get(a.id)
    if (!p || p.weight === 0) return Number.POSITIVE_INFINITY
    return p.weightedSum / p.weight
  }

  const weakest = [...pool].sort((a, b) => weaknessScore(b) - weaknessScore(a))[0]!
  const rest = pool.filter((a) => a.id !== weakest.id).slice(0, limit - 1)

  return [weakest, ...rest]
}

export async function getArticlesByType(
  type: string,
  limit?: number,
): Promise<Article[]> {
  let query = supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .eq('type', type)
    .order('published_at', { ascending: false })

  if (limit !== undefined) {
    query = query.limit(limit)
  }

  const { data, error } = await query
  if (error || !data) return []
  return data.map(normalise)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalise(row: any): Article {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: (row.category as string).replace(/_/g, '-'),
    type: row.type,
    meta_title: row.meta_title ?? null,
    meta_description: row.meta_description ?? null,
    quality_score: row.quality_score ?? null,
    status: row.status,
    author: row.author ?? null,
    reading_time_minutes: row.reading_time_minutes ?? null,
    tools: Array.isArray(row.tools) ? row.tools : [],
    published_at: row.published_at ?? null,
    updated_at: row.updated_at ?? null,
    description: row.meta_description ?? null,
    keywords_primary: row.keywords_primary ?? null,
  }
}
