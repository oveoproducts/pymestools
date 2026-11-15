/**
 * build-prompt-library.ts
 * Genera los descargables de la biblioteca de prompts a partir de las guías MDX:
 *   public/descargas/biblioteca-prompts-pymes.csv  (todos los prompts, para Excel/Sheets)
 *   public/descargas/biblioteca-prompts-pymes.pdf  (checklist + fórmula + índice, imprimible)
 *
 * Uso: npx tsx scripts/build-prompt-library.ts
 * Re-ejecútalo cuando se añadan o cambien guías de prompts.
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const ROOT = process.cwd()
const ARTICLES = path.join(ROOT, 'content/articles')
const OUT = path.join(ROOT, 'public/descargas')
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

interface Row { guia: string; slug: string; titulo: string; prompt: string; revisar: string }

function field(src: string, name: string): string {
  const m = src.match(new RegExp(`${name}="((?:[^"\\\\]|\\\\.)*)"`))
  return m ? m[1].replace(/\\"/g, '"') : ''
}

function guideTitle(src: string): string {
  const m = src.match(/^title:\s*"(.*)"\s*$/m)
  if (!m) return ''
  const t = m[1].replace(/^Prompts de ChatGPT para\s+/i, '').replace(/:\s*\d+.*$/, '')
  return t.charAt(0).toUpperCase() + t.slice(1)
}

const files = fs.readdirSync(ARTICLES).filter((f) => f.startsWith('prompts-') && f.endsWith('.mdx')).sort()
const rows: Row[] = []
for (const f of files) {
  const src = fs.readFileSync(path.join(ARTICLES, f), 'utf8')
  if (!/status:\s*"?published"?/.test(src)) continue
  const slug = f.replace(/\.mdx$/, '')
  const guia = guideTitle(src)
  for (const block of src.match(/<PromptBox[\s\S]*?\/>/g) ?? []) {
    const p = block.match(/prompt=\{`([\s\S]*?)`\}/)
    if (!p) continue
    rows.push({ guia, slug, titulo: field(block, 'title').replace(/^\d+\.\s*/, ''), prompt: p[1].trim(), revisar: field(block, 'check') })
  }
}

fs.mkdirSync(OUT, { recursive: true })

// ---- CSV (UTF-8 con BOM para que Excel respete los acentos) ----
const esc = (s: string) => `"${s.replace(/"/g, '""')}"`
const header = ['Guía', 'Prompt', 'Texto para copiar', 'Qué revisar antes de usar la respuesta', 'Más información']
const csv = [header.map(esc).join(';')]
for (const r of rows) {
  csv.push([r.guia, r.titulo, r.prompt, r.revisar, `https://pymestools.com/prompts/${r.slug}`].map(esc).join(';'))
}
fs.writeFileSync(path.join(OUT, 'biblioteca-prompts-pymes.csv'), '﻿' + csv.join('\r\n') + '\r\n')

// ---- PDF vía Chrome headless ----
const h = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const byGuide = new Map<string, Row[]>()
for (const r of rows) byGuide.set(r.guia, [...(byGuide.get(r.guia) ?? []), r])

const full = [...byGuide.entries()]
  .map(
    ([g, rs]) =>
      `<h2 class="g">${h(g)}</h2>` +
      rs
        .map(
          (r, i) =>
            `<div class="p"><div class="pt">${i + 1}. ${h(r.titulo)}</div><div class="pp">${h(r.prompt)}</div>` +
            (r.revisar ? `<div class="pc"><strong>Revisa:</strong> ${h(r.revisar)}</div>` : '') +
            `</div>`,
        )
        .join(''),
  )
  .join('')

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
@page{size:A4;margin:18mm}
body{font-family:-apple-system,Helvetica,Arial,sans-serif;color:#1f2937;font-size:11pt;line-height:1.5}
h1{font-size:22pt;margin:0 0 4px}h2{font-size:14pt;margin:22px 0 8px;color:#1d4ed8}
.sub{color:#6b7280;margin-bottom:18px}
table{border-collapse:collapse;width:100%}td,th{border:1px solid #d1d5db;padding:6px 8px;vertical-align:top;text-align:left}th{background:#f3f4f6}
.box{border:1px solid #d1d5db;border-radius:6px;padding:10px 14px;margin:10px 0;background:#f9fafb}
.warn{border-color:#f59e0b;background:#fffbeb}
ul{margin:4px 0 4px 18px;padding:0}li{margin:2px 0}
.chk li{list-style:none;margin-left:-18px}.chk li:before{content:"☐ ";}
.g{page-break-before:auto}.p{border:1px solid #d1d5db;border-radius:6px;padding:8px 12px;margin:8px 0;page-break-inside:avoid}.pt{font-weight:700;margin-bottom:4px}.pp{font-size:10pt;background:#f9fafb;padding:6px 8px;border-radius:4px;white-space:pre-wrap}.pc{font-size:9.5pt;color:#92400e;margin-top:5px}
.foot{margin-top:24px;font-size:9pt;color:#6b7280}
</style></head><body>
<h1>Biblioteca de prompts para pymes</h1>
<div class="sub">PymesTools · ${rows.length} prompts en ${byGuide.size} guías · Edición noviembre 2026</div>

<h2>La fórmula de cinco partes</h2>
<table><tr><th>Parte</th><th>Qué pones</th><th>Ejemplo</th></tr>
<tr><td>1. Rol</td><td>Quién es el asistente</td><td>"Eres el responsable comercial de una asesoría de 6 personas"</td></tr>
<tr><td>2. Contexto</td><td>Qué ha pasado, con datos reales y sin nombres de clientes</td><td>"Un cliente lleva 30 días sin pagar la factura [Nº]"</td></tr>
<tr><td>3. Tarea</td><td>Qué quieres exactamente</td><td>"Redacta un email de recordatorio"</td></tr>
<tr><td>4. Formato</td><td>Longitud, estructura y tono</td><td>"Máximo 90 palabras, tono cordial"</td></tr>
<tr><td>5. Límites</td><td>Qué evitar y qué hacer si falta información</td><td>"No amenaces. Si te falta un dato, pregúntame"</td></tr></table>

<h2>Checklist antes de usar una respuesta de la IA</h2>
<div class="box"><ul class="chk">
<li>Cada cifra, fecha, plazo y nombre propio coincide con tu fuente real, no con lo que "suena bien".</li>
<li>No promete nada que tu negocio no pueda cumplir (precios, plazos, resultados, garantías).</li>
<li>No contiene datos personales de clientes, pacientes o empleados, ni los has pegado en el prompt.</li>
<li>No cita leyes, artículos ni sanciones. Si hace falta, las añade tu asesoría tras revisarlas.</li>
<li>Suena a tu negocio: tono, trato (tú/usted) y vocabulario.</li>
<li>Lo han leído una vez en voz alta o lo ha revisado otra persona si va a ser público (web, reseñas, contratos).</li>
</ul></div>
<div class="box warn"><strong>Nunca delegues en la IA:</strong> alérgenos de platos, consentimientos y textos jurídicos, cálculos fiscales, diagnósticos o consejos clínicos, y cualquier dato personal. La responsabilidad sigue siendo tuya.</div>

<h2>Cuándo un prompt no basta</h2>
<table><tr><th>Si repites esto cada semana…</th><th>Una herramienta lo hace por ti</th></tr>
<tr><td>Responder las mismas preguntas</td><td>Chatbot en tu web</td></tr>
<tr><td>Seguir a clientes y vencimientos</td><td>CRM</td></tr>
<tr><td>Enviar los mismos correos</td><td>Email marketing con automatizaciones</td></tr>
<tr><td>Emitir y reclamar facturas</td><td>Software de facturación</td></tr></table>
<p>Comparativas con precios verificados en <strong>pymestools.com</strong>.</p>

<h1 style="page-break-before:always">Los ${rows.length} prompts</h1>
<div class="sub">Sustituye lo que va entre [CORCHETES] por tus datos reales. Más contexto de cada uno en pymestools.com/prompts</div>
${full}

<div class="foot">Los prompts son ejemplos para adaptar; el resultado depende del asistente que uses. Este documento no contiene asesoramiento legal, fiscal ni sanitario. © PymesTools · pymestools.com/prompts</div>
</body></html>`

const tmp = path.join(OUT, '.tmp-library.html')
fs.writeFileSync(tmp, html)
try {
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${path.join(OUT, 'biblioteca-prompts-pymes.pdf')}`, `file://${tmp}`], { stdio: 'ignore' })
} finally {
  fs.rmSync(tmp, { force: true })
}
console.log(`OK: ${rows.length} prompts, ${byGuide.size} guías -> public/descargas/`)
