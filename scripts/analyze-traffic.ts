import { google } from 'googleapis'
const SITE = 'https://pymestools.com/'
const auth = new google.auth.GoogleAuth({ credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!), scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] })
const sc = google.searchconsole({ version: 'v1', auth })
const day = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10) }
const q = async (s: string, e: string, dims: string[]) => (await sc.searchanalytics.query({ siteUrl: SITE, requestBody: { startDate: s, endDate: e, dimensions: dims, rowLimit: 25000 } })).data.rows ?? []
const synth = (x: string) => x.length > 80 || /^context:|location:|\+"|-"/i.test(x) || x.includes('\n')
const p = (u: string) => u.replace(SITE, '/')
;(async () => {
  const [s1, e1, s0, e0] = [day(30), day(3), day(60), day(31)]
  const cur = await q(s1, e1, ['page']), prev = await q(s0, e0, ['page'])
  const tot = (r: any[]) => r.reduce((a, x) => ({ c: a.c + x.clicks, i: a.i + x.impressions }), { c: 0, i: 0 })
  console.log('TOTAL 30d', tot(cur), 'prev 30d', tot(prev))
  const pm = new Map(prev.map((r: any) => [r.keys[0], r]))
  console.log('\nTOP PÁGINAS (clics, impr, pos, CTR) vs previo')
  cur.sort((a: any, b: any) => b.impressions - a.impressions).slice(0, 25).forEach((r: any) => { const o: any = pm.get(r.keys[0]); console.log(p(r.keys[0]).padEnd(70), r.clicks, r.impressions, r.position.toFixed(1), (r.ctr * 100).toFixed(1) + '%', '| prev', o ? `${o.clicks}/${o.impressions}` : '-') })
  console.log('\nOPORTUNIDAD: pos 4-15, impr>=15 (consulta real)')
  const qs = (await q(s1, e1, ['query', 'page'])).filter((r: any) => !synth(r.keys[0]))
  qs.filter((r: any) => r.position >= 4 && r.position <= 15 && r.impressions >= 15).sort((a: any, b: any) => b.impressions - a.impressions).slice(0, 25).forEach((r: any) => console.log(r.keys[0].slice(0, 50).padEnd(52), p(r.keys[1]).slice(0, 55).padEnd(56), r.impressions, r.clicks, r.position.toFixed(1)))
  console.log('\nBAJO CTR: pos<=6, impr>=30, CTR<3%')
  qs.filter((r: any) => r.position <= 6 && r.impressions >= 30 && r.ctr < 0.03).sort((a: any, b: any) => b.impressions - a.impressions).slice(0, 15).forEach((r: any) => console.log(r.keys[0].slice(0, 50).padEnd(52), p(r.keys[1]).slice(0, 55).padEnd(56), r.impressions, r.clicks, r.position.toFixed(1)))
  console.log('\nPÁGINAS CON IMPRESIONES Y 0 CLICS (top 15)')
  cur.filter((r: any) => r.clicks === 0).sort((a: any, b: any) => b.impressions - a.impressions).slice(0, 15).forEach((r: any) => console.log(p(r.keys[0]).padEnd(70), r.impressions, r.position.toFixed(1)))
  console.log('\nPAÍS/DISPOSITIVO')
  for (const d of ['country', 'device']) (await q(s1, e1, [d])).sort((a: any, b: any) => b.impressions - a.impressions).slice(0, 5).forEach((r: any) => console.log(d, r.keys[0], r.clicks, r.impressions))
})()
