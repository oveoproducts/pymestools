/**
 * pipeline-doctor.ts
 * Single health check for the autonomous pipeline. Run it before touching
 * anything: it answers "is the machine actually running, and what is stuck?".
 *
 *   npx tsx --env-file=.env.local scripts/pipeline-doctor.ts
 *   npx tsx --env-file=.env.local scripts/pipeline-doctor.ts --fix
 *
 * --fix only performs repairs that cannot lose work: releasing items whose
 * content is unrecoverable, clearing keyword states that no longer match a
 * queue item, and reconciling article status between MDX and Supabase.
 */
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { supabase } from '../lib/db/client'
import { alert } from '../lib/notify'

const FIX = process.argv.includes('--fix')
const QUIET = process.argv.includes('--quiet')

const ACTIVE_STATUSES = [
  'pending', 'researching', 'drafting', 'qa_review', 'seo_review', 'ready_to_publish',
]

interface Finding {
  level: 'ok' | 'warn' | 'error'
  title: string
  detail: string
  fix?: () => Promise<string>
}

const findings: Finding[] = []
const ICON = { ok: '✅', warn: '⚠️ ', error: '🚨' }

function daysSince(iso: string | null): number {
  if (!iso) return Infinity
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
}

async function main() {
  const articlesDir = path.join(process.cwd(), 'content', 'articles')
  const diskSlugs = new Set(
    fs.existsSync(articlesDir)
      ? fs.readdirSync(articlesDir).filter((f) => f.endsWith('.mdx')).map((f) => f.replace(/\.mdx$/, ''))
      : [],
  )

  const { data: queue } = await supabase.from('pipeline_queue').select('*')
  const { data: articles } = await supabase
    .from('articles')
    .select('id, slug, status, meta_title, meta_description, content_mdx, published_at, updated_at')
  const { data: keywords } = await supabase.from('keywords').select('id, status')

  const q = queue ?? []
  const arts = articles ?? []
  const active = q.filter((i) => ACTIVE_STATUSES.includes(i.status))

  // ---- 1. Is the queue moving? --------------------------------------------
  const lastPublished = arts
    .filter((a) => a.status === 'published' && a.published_at)
    .map((a) => a.published_at as string)
    .sort()
    .at(-1) ?? null
  const staleDays = daysSince(lastPublished)

  findings.push(
    staleDays > 7
      ? {
          level: 'error',
          title: `Sin publicar nada desde hace ${staleDays} días`,
          detail: `Último publicado: ${lastPublished?.slice(0, 10) ?? 'nunca'}. El pipeline corre a diario, así que esto significa que algo lo bloquea.`,
        }
      : { level: 'ok', title: 'Publicación al día', detail: `Último artículo hace ${staleDays} día(s).` },
  )

  // ---- 2. Items atascados --------------------------------------------------
  for (const item of active) {
    const age = daysSince(item.updated_at)
    const attempts = item.attempts ?? 0
    if (age >= 3 || attempts >= 2) {
      const art = arts.find((a) => a.id === item.article_id)
      const recoverable = Boolean(art?.content_mdx) || (art ? diskSlugs.has(art.slug) : false)
      findings.push({
        level: 'error',
        title: `Item atascado en "${item.status}" desde hace ${age} día(s)`,
        detail:
          `id=${item.id} intentos=${attempts} slug=${art?.slug ?? '—'}\n` +
          `      contenido recuperable: ${recoverable ? 'sí' : 'NO — no existe cuerpo ni en DB ni en disco'}\n` +
          `      último error: ${item.error_message ?? '(ninguno registrado)'}`,
        fix: recoverable
          ? undefined
          : async () => {
              await supabase
                .from('pipeline_queue')
                .update({
                  status: 'failed',
                  error_message: 'Sin cuerpo MDX recuperable — liberado por pipeline-doctor',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', item.id)
              if (item.article_id) {
                await supabase.from('articles').update({ status: 'failed' }).eq('id', item.article_id)
              }
              return `Item ${item.id} liberado (cuarentena) — la cola puede avanzar`
            },
      })
    }
  }
  if (active.length === 0) {
    findings.push({ level: 'warn', title: 'Cola vacía', detail: 'No hay ningún item activo. Si quedan keywords aprobadas, el runner encolará una en la próxima ejecución.' })
  }

  // ---- 3. Keywords in_progress huérfanas ----------------------------------
  const queuedKeywordIds = new Set(q.map((i) => i.keyword_id).filter(Boolean))
  const orphanKw = (keywords ?? []).filter((k) => k.status === 'in_progress' && !queuedKeywordIds.has(k.id))
  if (orphanKw.length > 0) {
    findings.push({
      level: 'warn',
      title: `${orphanKw.length} keywords marcadas "in_progress" sin item en cola`,
      detail: 'Quedaron colgadas de ejecuciones abortadas. Nunca se convertirán en artículo ni se volverán a elegir.',
      fix: async () => {
        const ids = orphanKw.map((k) => k.id)
        for (let i = 0; i < ids.length; i += 100) {
          await supabase.from('keywords').update({ status: 'approved' }).in('id', ids.slice(i, i + 100))
        }
        return `${ids.length} keywords devueltas a "approved" y disponibles otra vez`
      },
    })
  }

  // ---- 4. Cuerpos ausentes -------------------------------------------------
  const bodyless = arts.filter((a) => !a.content_mdx && !diskSlugs.has(a.slug))
  if (bodyless.length > 0) {
    findings.push({
      level: bodyless.some((a) => ACTIVE_STATUSES.includes(a.status)) ? 'error' : 'warn',
      title: `${bodyless.length} artículos sin cuerpo MDX en ningún sitio`,
      detail: bodyless.map((a) => `      - ${a.slug} [${a.status}]`).join('\n'),
    })
  }

  // ---- 5. MDX huérfanos en disco ------------------------------------------
  const dbSlugs = new Set(arts.map((a) => a.slug))
  const orphanFiles = [...diskSlugs].filter((s) => !dbSlugs.has(s))
  if (orphanFiles.length > 0) {
    findings.push({
      level: 'warn',
      title: `${orphanFiles.length} MDX en disco sin fila en Supabase`,
      detail:
        'El sitio sólo sirve filas de la base de datos, así que estos artículos existen en el repo pero son invisibles para Google.\n' +
        `      ${orphanFiles.slice(0, 10).join(', ')}${orphanFiles.length > 10 ? '…' : ''}\n` +
        '      Recupéralos con: npx tsx --env-file=.env.local scripts/sync-articles.ts',
    })
  }

  // ---- 6. Calidad de metas en publicados ----------------------------------
  const published = arts.filter((a) => a.status === 'published')
  const longTitles = published.filter((a) => (a.meta_title ?? '').length > 60)
  const noMeta = published.filter((a) => !a.meta_title || !a.meta_description)
  if (longTitles.length > 0) {
    findings.push({
      level: 'warn',
      title: `${longTitles.length} meta titles de más de 60 caracteres`,
      detail: 'Google los trunca en resultados, lo que cuesta CTR directamente.',
    })
  }
  if (noMeta.length > 0) {
    findings.push({ level: 'error', title: `${noMeta.length} publicados sin meta title o description`, detail: noMeta.map((a) => `      - ${a.slug}`).join('\n') })
  }

  // ---- 7. Credenciales -----------------------------------------------------
  const required = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'ANTHROPIC_API_KEY']
  const optional = ['RESEND_API_KEY', 'NOTIFICATION_EMAIL', 'INDEXNOW_KEY', 'GOOGLE_SERVICE_ACCOUNT_JSON', 'VERCEL_TOKEN']
  const missingReq = required.filter((k) => !process.env[k])
  const missingOpt = optional.filter((k) => !process.env[k])
  if (missingReq.length > 0) findings.push({ level: 'error', title: 'Faltan credenciales obligatorias', detail: `      ${missingReq.join(', ')}` })
  if (missingOpt.length > 0) findings.push({ level: 'warn', title: 'Credenciales opcionales sin configurar', detail: `      ${missingOpt.join(', ')} — funciones degradadas (alertas, indexación, espera de deploy)` })

  // ---- Informe -------------------------------------------------------------
  const errors = findings.filter((f) => f.level === 'error')
  const warns = findings.filter((f) => f.level === 'warn')

  if (!QUIET) {
    console.log('\n🩺  PymesTools — Pipeline Doctor\n' + '─'.repeat(60))
    for (const f of findings) {
      console.log(`\n${ICON[f.level]} ${f.title}`)
      if (f.detail) console.log(`      ${f.detail.replace(/^ {6}/, '')}`)
      if (f.fix && !FIX) console.log('      → reparable con --fix')
    }
    console.log('\n' + '─'.repeat(60))
    console.log(`  ${errors.length} error(es), ${warns.length} aviso(s)\n`)
  }

  if (FIX) {
    console.log('🔧  Aplicando reparaciones seguras…\n')
    let applied = 0
    for (const f of findings) {
      if (!f.fix) continue
      console.log(`  • ${await f.fix()}`)
      applied++
    }
    console.log(`\n  ${applied} reparación(es) aplicadas.\n`)
  }

  if (errors.length > 0 && process.env.DOCTOR_ALERT === '1') {
    await alert(
      'error',
      `Pipeline doctor: ${errors.length} error(es)`,
      errors.map((e) => `• ${e.title}\n  ${e.detail}`).join('\n\n'),
    )
  }

  process.exit(errors.length > 0 ? 1 : 0)
}

main()
