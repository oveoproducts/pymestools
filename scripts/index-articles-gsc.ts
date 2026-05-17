/**
 * index-articles-gsc.ts
 * Submits all published article URLs to the Google Indexing API.
 * Quota: 200 requests/day per property.
 *
 * Requires GSC_REFRESH_TOKEN to have the 'indexing' scope.
 * Run auth-gsc.ts first if not already done (it now requests both scopes).
 *
 * Usage: npx tsx --env-file=.env.local scripts/index-articles-gsc.ts
 * Railway: add to cron after generate or pipeline-run
 */
import 'dotenv/config'
import { google } from 'googleapis'
import { supabase } from '../lib/db/client'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pymestools.com'
const DAILY_QUOTA = 180 // stay under 200 limit with buffer

function getAuth() {
  const clientId = process.env.GSC_CLIENT_ID
  const clientSecret = process.env.GSC_CLIENT_SECRET
  const refreshToken = process.env.GSC_REFRESH_TOKEN
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing env vars: GSC_CLIENT_ID, GSC_CLIENT_SECRET, GSC_REFRESH_TOKEN')
  }
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret)
  oauth2Client.setCredentials({ refresh_token: refreshToken })
  return oauth2Client
}

async function fetchPublishedArticles(): Promise<Array<{ slug: string; category: string }>> {
  const { data, error } = await supabase
    .from('articles')
    .select('slug, category')
    .eq('status', 'published')
  if (error) throw new Error(`Articles fetch error: ${error.message}`)
  return (data ?? []) as Array<{ slug: string; category: string }>
}

function buildUrl(article: { slug: string; category: string }): string {
  const categoryPath = article.category.replace(/_/g, '-')
  return `${SITE_URL}/${categoryPath}/${article.slug}`
}

async function submitUrl(
  indexing: ReturnType<typeof google.indexing>,
  url: string,
): Promise<boolean> {
  try {
    await indexing.urlNotifications.publish({
      requestBody: { url, type: 'URL_UPDATED' },
    })
    return true
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    // 429 = quota exceeded, 403 = scope missing
    if (msg.includes('429')) {
      console.warn(`  ⚠️  Quota exceeded, stopping`)
      return false
    }
    console.warn(`  ⚠️  ${url} — ${msg}`)
    return true // continue with next URL
  }
}

async function main() {
  console.log('\n📡  GSC Indexing API\n')

  const auth = getAuth()
  const indexing = google.indexing({ version: 'v3', auth })
  const articles = await fetchPublishedArticles()

  const urls = [
    SITE_URL, // homepage
    ...articles.map(buildUrl),
  ].slice(0, DAILY_QUOTA)

  console.log(`  Submitting ${urls.length} URLs...\n`)

  let submitted = 0
  for (const url of urls) {
    const ok = await submitUrl(indexing, url)
    if (!ok) break
    submitted++
    console.log(`  ✅  ${url}`)
    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 200))
  }

  console.log(`\n✅  Indexing complete — ${submitted} URLs submitted\n`)
}

main().catch((err) => {
  console.error('❌  Indexing error:', err.message)
  process.exit(1)
})
