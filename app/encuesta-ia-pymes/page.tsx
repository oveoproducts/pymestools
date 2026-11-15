import type { Metadata } from 'next'
import brand from '@/data/brand.json'
import { brandedTitle } from '@/lib/seo/meta-title'
import { supabase } from '@/lib/db/client'
import { QUESTIONS, SURVEY_ID, MIN_RESPONSES_TO_PUBLISH } from '@/lib/survey'
import { SurveyForm } from './SurveyForm'

export const revalidate = 60

const TITLE = 'Encuesta: cómo usan la IA las pymes españolas (2026)'
const DESCRIPTION =
  'Encuesta anónima de 2 minutos sobre el uso de ChatGPT y otras IA en pymes y autónomos de España. Publicaremos los resultados abiertos, con la metodología.'

export const metadata: Metadata = {
  title: brandedTitle(TITLE),
  description: DESCRIPTION,
  alternates: { canonical: `${brand.siteUrl}/encuesta-ia-pymes` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${brand.siteUrl}/encuesta-ia-pymes`, siteName: brand.siteName, type: 'website' },
}

type Answers = Record<string, string | string[]>

async function loadResponses(): Promise<Answers[]> {
  const { data, error } = await supabase
    .from('survey_responses')
    .select('answers')
    .eq('survey', SURVEY_ID)
    .limit(5000)
  if (error || !data) return []
  return data.map((r) => r.answers as Answers)
}

export default async function SurveyPage() {
  const responses = await loadResponses()
  const n = responses.length
  const provisional = n < MIN_RESPONSES_TO_PUBLISH

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          ¿Cómo usan la IA las pymes españolas?
        </h1>
        <p className="text-lg text-gray-600">
          Nueve preguntas, dos minutos, anónima. Los resultados son públicos y se actualizan
          según se contesta: qué tareas se hacen ya con IA, qué frena a los negocios pequeños y qué ahorro
          de tiempo notan. Sin datos inventados: solo lo que contestéis.
        </p>
      </header>

      <section aria-labelledby="resultados" className="mb-12">
        <h2 id="resultados" className="text-xl font-bold text-gray-900 mb-1">Resultados en directo</h2>
        {n === 0 ? (
          <p className="text-sm text-gray-600">Todavía no hay respuestas. Sé la primera persona en contestar: los resultados aparecerán aquí.</p>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-3">
              <strong>{n}</strong> {n === 1 ? 'respuesta' : 'respuestas'}. Porcentajes sobre el total de respuestas
              (en las preguntas de varias opciones suman más de 100 %).
            </p>
            {provisional && (
              <p className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                <strong>Resultados provisionales:</strong> con tan pocas respuestas los porcentajes cambian mucho y
                no deben citarse como dato. Los daremos por fiables a partir de {MIN_RESPONSES_TO_PUBLISH} respuestas.
              </p>
            )}
            <div className="space-y-8">
              {QUESTIONS.map((q) => {
                const counts = new Map<string, number>(q.options.map((o) => [o, 0]))
                for (const r of responses) {
                  const v = r[q.id]
                  for (const x of Array.isArray(v) ? v : v ? [v] : []) counts.set(x, (counts.get(x) ?? 0) + 1)
                }
                return (
                  <div key={q.id}>
                    <h3 className="font-semibold text-gray-900 mb-2">{q.label}</h3>
                    <ul className="space-y-1.5">
                      {q.options.map((o) => {
                        const c = counts.get(o) ?? 0
                        const pct = Math.round((c / n) * 100)
                        return (
                          <li key={o} className="text-sm">
                            <div className="flex justify-between gap-2">
                              <span>{o}</span>
                              <span className="tabular-nums text-gray-600">{pct}% <span className="text-gray-400">({c})</span></span>
                            </div>
                            <div className="h-2 rounded bg-gray-100"><div className="h-2 rounded bg-blue-500" style={{ width: `${pct}%` }} /></div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )
              })}
            </div>
            <p className="mt-8 text-sm text-gray-600">
              Muestra autoseleccionada (contestan quienes llegan a esta página), por lo que no es representativa de
              todas las pymes de España. Si citas estos datos, enlaza a esta página. Metodología: encuesta anónima
              online, sin incentivos, filtrado básico de bots.
            </p>
          </>
        )}
      </section>

      <section aria-labelledby="encuesta">
        <h2 id="encuesta" className="text-xl font-bold text-gray-900 mb-4">{n > 0 ? 'Añade tu respuesta' : 'Contesta la encuesta'}</h2>
        <SurveyForm />
      </section>
    </div>
  )
}
