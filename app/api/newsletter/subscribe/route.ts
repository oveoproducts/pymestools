import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db/client'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(req: NextRequest) {
  let body: { email?: unknown; source?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Solicitud no válida.' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Introduce un email válido.' }, { status: 400 })
  }

  const source = typeof body.source === 'string' ? body.source.slice(0, 40) : 'banner'

  // Upsert on the unique email so a repeat signup is a silent success rather
  // than an error that tells a visitor whether an address is already on file.
  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert({ email, source }, { onConflict: 'email', ignoreDuplicates: true })

  if (error) {
    console.error('[newsletter] insert failed:', error.message)
    return NextResponse.json({ error: 'No hemos podido guardar tu email. Inténtalo más tarde.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
