import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db/client'
import { isBot } from '@/lib/bot-detect'
import { SURVEY_ID, validateAnswers } from '@/lib/survey'

export async function POST(req: NextRequest) {
  if (isBot(req.headers.get('user-agent'))) {
    return NextResponse.json({ error: 'Solicitud no válida.' }, { status: 400 })
  }

  let body: { answers?: unknown; website?: unknown; elapsedMs?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Solicitud no válida.' }, { status: 400 })
  }

  // Honeypot y tiempo mínimo: un humano tarda más de 8 s en contestar 9 preguntas.
  // A los bots se les responde "ok" sin guardar nada.
  const elapsed = typeof body.elapsedMs === 'number' ? body.elapsedMs : 0
  if ((typeof body.website === 'string' && body.website !== '') || elapsed < 8000) {
    return NextResponse.json({ ok: true })
  }

  const answers = validateAnswers(body.answers)
  if (!answers) {
    return NextResponse.json({ error: 'Faltan respuestas por completar.' }, { status: 400 })
  }

  const { error } = await supabase.from('survey_responses').insert({ survey: SURVEY_ID, answers })
  if (error) {
    console.error('[survey] insert failed:', error.message)
    return NextResponse.json({ error: 'No hemos podido guardar tus respuestas. Inténtalo más tarde.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
