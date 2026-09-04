/**
 * notify.ts
 * Outbound alerting for the autonomous pipeline.
 *
 * The pipeline runs unattended on a daily cron. Without alerting, a failure is
 * invisible: skills return { success: false }, the runner exits 0 and CI stays
 * green. That is exactly how the queue sat deadlocked on a single item from
 * 2026-08-16 with nothing published. Every abnormal outcome must reach a human
 * inbox even though no human is watching the logs.
 */
import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? ''
const NOTIFY_EMAIL = process.env.NOTIFICATION_EMAIL ?? ''
// Resend refuses any From address on a domain it has not verified, so the
// default is its shared sender: it delivers to the Resend account owner with no
// DNS setup. Switch to noreply@pymestools.com once pymestools.com is verified
// at resend.com/domains.
const FROM = process.env.RESEND_FROM ?? 'onboarding@resend.dev'

export type AlertLevel = 'info' | 'warn' | 'error'

const SUBJECT_PREFIX: Record<AlertLevel, string> = {
  info: '✅ PymesTools',
  warn: '⚠️ PymesTools',
  error: '🚨 PymesTools',
}

/**
 * Sends an alert. Never throws: a broken notifier must not take the pipeline
 * down with it, but it does report to stdout so CI logs still show the reason.
 */
export async function alert(
  level: AlertLevel,
  subject: string,
  body: string,
): Promise<void> {
  const line = `[${level.toUpperCase()}] ${subject}`
  console.log(`\n📣  ${line}\n${body}\n`)

  if (!RESEND_API_KEY || !NOTIFY_EMAIL) {
    console.warn(
      '  ⚠️  Alert not emailed — set RESEND_API_KEY and NOTIFICATION_EMAIL.',
    )
    return
  }

  try {
    const resend = new Resend(RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: FROM,
      to: NOTIFY_EMAIL,
      subject: `${SUBJECT_PREFIX[level]} — ${subject}`,
      text: body,
    })
    if (error) console.warn(`  ⚠️  Resend error: ${error.message}`)
    else console.log('  📧  Alert emailed.')
  } catch (err) {
    console.warn(
      `  ⚠️  Alert send failed: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
}
