/**
 * auth-gsc.ts
 * One-time OAuth2 flow to get a refresh token for GSC API access.
 * Run once locally — stores the refresh token in .env.local automatically.
 *
 * Usage: npx tsx scripts/auth-gsc.ts
 */
import { config } from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.join(__dirname, '..', '.env.local') })
import { createServer } from 'node:http'
import { exec } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { google } from 'googleapis'

const CLIENT_ID = process.env.GSC_CLIENT_ID ?? ''
const CLIENT_SECRET = process.env.GSC_CLIENT_SECRET ?? ''
const REDIRECT_URI = 'http://localhost:4242/callback'

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌  Set GSC_CLIENT_ID and GSC_CLIENT_SECRET in .env.local before running this script.')
  process.exit(1)
}
const SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/indexing',
]
const ENV_FILE = path.join(__dirname, '..', '.env.local')

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: SCOPES,
})

console.log('\n🔐  GSC OAuth2 — autorización única\n')
console.log('  Abriendo navegador...')
exec(`open "${authUrl}"`)

const server = createServer(async (req, res) => {
  if (!req.url?.startsWith('/callback')) return

  const code = new URL(req.url, 'http://localhost:4242').searchParams.get('code')
  if (!code) {
    res.end('Error: no se recibió el código de autorización.')
    return
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    const refreshToken = tokens.refresh_token

    if (!refreshToken) {
      res.end('Error: no se recibió refresh_token. Revoca el acceso en myaccount.google.com y vuelve a ejecutar el script.')
      server.close()
      return
    }

    // Update .env.local
    let env = await fs.readFile(ENV_FILE, 'utf-8')
    if (env.includes('GSC_REFRESH_TOKEN=')) {
      env = env.replace(/GSC_REFRESH_TOKEN=.*/, `GSC_REFRESH_TOKEN=${refreshToken}`)
    } else {
      env += `\nGSC_REFRESH_TOKEN=${refreshToken}\n`
    }
    if (!env.includes('GSC_CLIENT_ID=')) {
      env += `GSC_CLIENT_ID=${CLIENT_ID}\n`
      env += `GSC_CLIENT_SECRET=${CLIENT_SECRET}\n`
    }
    console.log(`  GSC_CLIENT_ID=${CLIENT_ID}`)
    console.log(`  GSC_CLIENT_SECRET=${CLIENT_SECRET}`)
    await fs.writeFile(ENV_FILE, env, 'utf-8')

    console.log('\n✅  Refresh token guardado en .env.local')
    console.log('  Añade estas variables también en Railway:\n')
    console.log(`  GSC_REFRESH_TOKEN=${refreshToken}`)
    console.log(`  GSC_CLIENT_ID=${CLIENT_ID}`)
    console.log(`  GSC_CLIENT_SECRET=${CLIENT_SECRET}\n`)

    res.end('<h2>✅ Autorización completada. Puedes cerrar esta ventana.</h2>')
    server.close()
    process.exit(0)
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err)
    console.error('❌ Error completo:', err)
    res.end(`<pre>Error: ${msg}</pre>`)
    server.close()
    process.exit(1)
  }
})

server.listen(4242, () => {
  console.log('  Esperando autorización en http://localhost:4242/callback...\n')
})
