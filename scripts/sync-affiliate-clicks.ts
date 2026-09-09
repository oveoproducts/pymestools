/**
 * sync-affiliate-clicks.ts
 * Rolls up real click events from affiliate_links (one row per click,
 * written by app/api/r/[program]/[slug]/route.ts) into content_metrics.
 * affiliate_clicks, grouped by article + day.
 *
 * Without this, skill-analytics.ts always reports 0 affiliate clicks and
 * 0 revenue even when real clicks are happening — the two tables never
 * talked to each other. affiliate_links has no article_id for clicks on
 * an article that later got deleted/renamed; those are skipped, not
 * guessed at.
 *
 * estimated_revenue is intentionally left untouched here: commission_rate
 * in affiliate_programs is a free-text field ("33%", "$200/venta", "5€
 * lead + 100€ venta") with no real conversion data behind it, and turning
 * that into a euro figure would mean inventing a conversion rate out of
 * nothing — exactly what regla 8 (nunca precios inventados) exists to
 * prevent, applied to our own numbers instead of the articles' claims.
 * Real revenue can only come from each affiliate network's own dashboard.
 *
 * Usage: npx tsx --env-file=.env.local scripts/sync-affiliate-clicks.ts
 */
import 'dotenv/config'
import { supabase } from '../lib/db/client'

async function main() {
  console.log('\n💶  Sync affiliate clicks → content_metrics\n')

  const { data: links, error } = await supabase
    .from('affiliate_links')
    .select('article_id, created_at')
    .not('article_id', 'is', null)
  if (error) throw new Error(`affiliate_links fetch error: ${error.message}`)

  const byArticleDay = new Map<string, number>()
  for (const link of links ?? []) {
    const day = (link.created_at as string).slice(0, 10)
    const key = `${link.article_id}|${day}`
    byArticleDay.set(key, (byArticleDay.get(key) ?? 0) + 1)
  }

  console.log(`  Clic events: ${links?.length}. Días-artículo distintos: ${byArticleDay.size}`)

  let updated = 0
  let inserted = 0

  for (const [key, clickCount] of byArticleDay) {
    const [articleId, day] = key.split('|')

    const { data: existing, error: fetchErr } = await supabase
      .from('content_metrics')
      .select('id')
      .eq('article_id', articleId)
      .eq('recorded_at', day)
      .limit(1)
    if (fetchErr) {
      console.log(`  ❌ ${key}: ${fetchErr.message}`)
      continue
    }

    if (existing && existing.length > 0) {
      const { error: updateErr } = await supabase
        .from('content_metrics')
        .update({ affiliate_clicks: clickCount })
        .eq('id', existing[0]!.id)
      if (updateErr) {
        console.log(`  ❌ ${key}: ${updateErr.message}`)
        continue
      }
      updated++
    } else {
      const { error: insertErr } = await supabase.from('content_metrics').insert({
        article_id: articleId,
        recorded_at: day,
        impressions: 0,
        clicks: 0,
        affiliate_clicks: clickCount,
      })
      if (insertErr) {
        console.log(`  ❌ ${key}: ${insertErr.message}`)
        continue
      }
      inserted++
    }
  }

  console.log(`\n✅  ${updated} filas actualizadas, ${inserted} filas nuevas creadas.\n`)
}

main().catch((err) => {
  console.error('❌  Sync affiliate clicks error:', err.message)
  process.exit(1)
})
