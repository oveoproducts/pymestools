/**
 * measure-prompts.ts
 * Mide el área /prompts en Search Console: impresiones, clics y posición por
 * página, separando consultas reales de las sintéticas (prompts de IA).
 *
 * Uso: npx tsx -r dotenv/config scripts/measure-prompts.ts dotenv_config_path=.env.local [días]
 * Compara los últimos N días (por defecto 14) con los N anteriores.
 * Los datos de GSC llevan 2-3 días de retraso.
 */
import { google } from 'googleapis'

const SITE = 'https://pymestools.com/'
const DAYS = Number(process.argv.find((a) => /^\d+$/.test(a)) ?? 14)

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!),
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
})
const sc = google.searchconsole({ version: 'v1', auth })

const day = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

const isSynthetic = (q: string) =>
  q.length > 80 || /^context:|location:|\+"|-"/i.test(q) || q.includes('\n')

async function query(start: string, end: string, dimensions: string[]) {
  const r = await sc.searchanalytics.query({
    siteUrl: SITE,
    requestBody: { startDate: start, endDate: end, dimensions, rowLimit: 25000 },
  })
  return r.data.rows ?? []
}

function sum(rows: { clicks?: number | null; impressions?: number | null }[]) {
  return rows.reduce(
    (s, r) => ({ c: s.c + (r.clicks ?? 0), i: s.i + (r.impressions ?? 0) }),
    { c: 0, i: 0 },
  )
}

async function main() {
  const cur = [day(DAYS + 2), day(2)] as const
  const prev = [day(DAYS * 2 + 3), day(DAYS + 3)] as const
  console.log(`Actual: ${cur[0]} → ${cur[1]} | Anterior: ${prev[0]} → ${prev[1]}\n`)

  const [pc, pp, qc] = await Promise.all([
    query(cur[0], cur[1], ['page']),
    query(prev[0], prev[1], ['page']),
    query(cur[0], cur[1], ['query', 'page']),
  ])
  const isPrompts = (u: string) => u.includes('/prompts')

  const curP = pc.filter((r) => isPrompts(r.keys![0]))
  const prevP = pp.filter((r) => isPrompts(r.keys![0]))
  const t = sum(pc)
  const a = sum(curP)
  const b = sum(prevP)
  console.log(`Sitio: ${t.i} impresiones, ${t.c} clics`)
  console.log(`/prompts actual: ${a.i} impr, ${a.c} clics (${((a.i / (t.i || 1)) * 100).toFixed(2)}% del sitio)`)
  console.log(`/prompts anterior: ${b.i} impr, ${b.c} clics\n`)

  console.log('Páginas de /prompts (periodo actual):')
  curP
    .sort((x, y) => (y.impressions ?? 0) - (x.impressions ?? 0))
    .forEach((r) =>
      console.log(` ${r.keys![0].replace(SITE, '/')}  ${r.clicks} clics  ${r.impressions} impr  pos ${(r.position ?? 0).toFixed(1)}`),
    )

  const qs = qc.filter((r) => isPrompts(r.keys![1]))
  const real = qs.filter((r) => !isSynthetic(r.keys![0]))
  const synth = qs.filter((r) => isSynthetic(r.keys![0]))
  console.log(`\nConsultas: ${real.length} reales (${sum(real).i} impr) y ${synth.length} sintéticas (${sum(synth).i} impr)`)
  console.log('Consultas reales:')
  real
    .sort((x, y) => (y.impressions ?? 0) - (x.impressions ?? 0))
    .slice(0, 15)
    .forEach((r) => console.log(` "${r.keys![0]}"  ${r.clicks} clics  ${r.impressions} impr  pos ${(r.position ?? 0).toFixed(1)}`))
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
