/**
 * _index-urls.ts — submits specific URLs to the Google Indexing API + IndexNow.
 * Usage: npx tsx --env-file=.env.local scripts/_index-urls.ts <path> [<path>...]
 */
import 'dotenv/config'
import { google } from 'googleapis'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pymestools.com'
const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? ''
const paths = process.argv.slice(2)

function getAuth() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GSC_CLIENT_ID,
    process.env.GSC_CLIENT_SECRET,
  )
  oauth2Client.setCredentials({ refresh_token: process.env.GSC_REFRESH_TOKEN })
  return oauth2Client
}

async function main() {
  const indexing = google.indexing({ version: 'v3', auth: getAuth() })
  for (const p of paths) {
    const url = `${SITE_URL}/${p.replace(/^\//, '')}`
    // Google Indexing API
    try {
      await indexing.urlNotifications.publish({ requestBody: { url, type: 'URL_UPDATED' } })
      console.log(`  ✅ Google Indexing API  ${url}`)
    } catch (err) {
      console.log(`  ❌ Google Indexing API  ${url}\n     ${err instanceof Error ? err.message : String(err)}`)
    }
    // IndexNow (Bing / Yandex)
    if (INDEXNOW_KEY) {
      try {
        const r = await fetch(`https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${INDEXNOW_KEY}`)
        console.log(`  ${r.ok ? '✅' : '⚠️ '} IndexNow HTTP ${r.status}      ${url}`)
      } catch (err) {
        console.log(`  ❌ IndexNow  ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  }
}
main()
