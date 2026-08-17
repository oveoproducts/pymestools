import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db/client'
import brand from '@/data/brand.json'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ program: string; slug: string }> },
) {
  const { program: programSlug, slug: articleSlug } = await params

  // affiliate_programs uses a boolean `active` column — the previous
  // `.eq('status', 'active')` matched a column that doesn't exist, so the
  // lookup always failed and every click fell through to the homepage
  // redirect below instead of reaching the merchant.
  const { data: program } = await supabase
    .from('affiliate_programs')
    .select('id, affiliate_url')
    .eq('slug', programSlug)
    .eq('active', true)
    .maybeSingle()

  if (!program?.affiliate_url) {
    return NextResponse.redirect(brand.siteUrl, { status: 302 })
  }

  // Best-effort, non-blocking click log. Resolve the article by slug so the
  // click is attributed to a page; skip silently if anything is missing.
  void (async () => {
    const { data: article } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', articleSlug)
      .maybeSingle()
    await supabase.from('affiliate_links').insert({
      program_id: program.id,
      article_id: article?.id ?? null,
      url: program.affiliate_url,
      anchor_text: articleSlug,
      clicks: 1,
    })
  })()

  return NextResponse.redirect(program.affiliate_url, { status: 302 })
}
