import { supabase } from './client'

export interface AffiliateProgram {
  id: string
  slug: string
  name: string
  affiliate_url: string
  status: string
  commission_type: string | null
  commission_value: number | null
  created_at: string | null
}

export interface AffiliateLink {
  id: string
  program_id: string
  article_id: string | null
  affiliate_url: string
  clicks: number
  created_at: string | null
}

export async function getAffiliateLink(
  programSlug: string,
  articleId?: string,
): Promise<string | null> {
  // First resolve the program by slug
  const { data: program, error: programError } = await supabase
    .from('affiliate_programs')
    .select('id, affiliate_url')
    .eq('slug', programSlug)
    .eq('status', 'active')
    .single()

  if (programError || !program) return null

  // Try to find an article-specific link first
  if (articleId) {
    const { data: link } = await supabase
      .from('affiliate_links')
      .select('affiliate_url')
      .eq('program_id', program.id)
      .eq('article_id', articleId)
      .single()

    if (link?.affiliate_url) return link.affiliate_url
  }

  // Fall back to a program-level link (no article_id)
  const { data: genericLink } = await supabase
    .from('affiliate_links')
    .select('affiliate_url')
    .eq('program_id', program.id)
    .is('article_id', null)
    .single()

  if (genericLink?.affiliate_url) return genericLink.affiliate_url

  // Last resort: use the program's own affiliate_url
  return program.affiliate_url ?? null
}

export async function getActivePrograms(): Promise<AffiliateProgram[]> {
  const { data, error } = await supabase
    .from('affiliate_programs')
    .select('*')
    .eq('status', 'active')
    .order('name', { ascending: true })

  if (error || !data) return []

  return data as AffiliateProgram[]
}

export async function trackAffiliateClick(linkId: string): Promise<void> {
  // Fire-and-forget: increment clicks counter
  await supabase.rpc('increment_affiliate_clicks', { link_id: linkId }).then(
    () => {},
    () => {},
  )
}
