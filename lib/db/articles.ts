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
 */
export async function getRelatedArticles(
  article: Pick<Article, 'id' | 'category' | 'tools'>,
  limit = 3,
): Promise<Article[]> {
  const byTool: Article[] = []

  if (article.tools.length > 0) {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .neq('id', article.id)
      .overlaps('tools', article.tools)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (data) byTool.push(...data.map(normalise))
  }

  if (byTool.length >= limit) return byTool.slice(0, limit)

  const dbCategory = article.category.replace(/-/g, '_')
  const excludeIds = new Set([article.id, ...byTool.map((a) => a.id)])

  const { data: byCategory } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .eq('category', dbCategory)
    .order('published_at', { ascending: false })
    .limit(limit + excludeIds.size)

  const fallback = (byCategory ?? [])
    .map(normalise)
    .filter((a) => !excludeIds.has(a.id))
    .slice(0, limit - byTool.length)

  return [...byTool, ...fallback]
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
