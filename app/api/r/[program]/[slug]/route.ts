import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db/client'
import brand from '@/data/brand.json'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ program: string; slug: string }> },
) {
  const { program: programSlug, slug: articleSlug } = await params

  // Look up program
  const { data: program, error: programError } = await supabase
    .from('affiliate_programs')
    .select('id, affiliate_url')
    .eq('slug', programSlug)
    .eq('status', 'active')
    .single()

  if (programError || !program) {
    return NextResponse.redirect(brand.siteUrl, { status: 302 })
  }

  // Try to find an article-specific affiliate link
  let affiliateUrl: string = program.affiliate_url
  let linkId: string | null = null

  const { data: link } = await supabase
    .from('affiliate_links')
    .select('id, affiliate_url')
    .eq('program_id', program.id)
    .eq('article_slug', articleSlug)
    .single()

  if (link?.affiliate_url) {
    affiliateUrl = link.affiliate_url
    linkId = link.id
  } else {
    // Fall back to generic program link (no article)
    const { data: genericLink } = await supabase
      .from('affiliate_links')
      .select('id, affiliate_url')
      .eq('program_id', program.id)
      .is('article_id', null)
      .single()

    if (genericLink?.affiliate_url) {
      affiliateUrl = genericLink.affiliate_url
      linkId = genericLink.id
    }
  }

  // Fire-and-forget click tracking
  if (linkId) {
    void supabase
      .rpc('increment_affiliate_clicks', { link_id: linkId })
      .then(() => {})
  }

  return NextResponse.redirect(affiliateUrl, { status: 302 })
}
