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
  let query = supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .eq('category', category)
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
    category: row.category,
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
