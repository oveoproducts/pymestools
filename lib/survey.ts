/**
 * Definición de la encuesta "IA en las pymes españolas". Compartida por el
 * formulario (cliente), la API (validación) y la página de resultados.
 * Es anónima: no se recoge email, IP ni texto libre.
 */
export const SURVEY_ID = 'ia-pymes-2026'
/** Mínimo de respuestas válidas para publicar porcentajes. */
export const MIN_RESPONSES_TO_PUBLISH = 50

export interface SurveyQuestion {
  id: string
  label: string
  multi?: boolean
  options: string[]
}

export const QUESTIONS: SurveyQuestion[] = [
  {
    id: 'sector',
    label: '¿En qué sector trabaja tu negocio?',
    options: ['Hostelería y restauración', 'Comercio y ecommerce', 'Servicios profesionales (asesoría, despacho, consultoría)', 'Salud y bienestar', 'Inmobiliaria', 'Construcción y reformas', 'Marketing y comunicación', 'Tecnología', 'Otro'],
  },
  {
    id: 'size',
    label: '¿Cuántas personas trabajan en tu negocio (contándote a ti)?',
    options: ['Solo yo (autónomo/a)', '2 a 5', '6 a 10', '11 a 49', '50 o más'],
  },
  {
    id: 'usage',
    label: '¿Usas asistentes de IA (ChatGPT, Gemini, Copilot, Claude…) en tu trabajo?',
    options: ['Cada día', 'Varias veces por semana', 'Alguna vez al mes', 'Lo he probado pero no lo uso', 'Nunca, pero me gustaría', 'Nunca y no me interesa'],
  },
  {
    id: 'tasks',
    label: '¿Para qué tareas lo usas o lo usarías? (elige hasta 4)',
    multi: true,
    options: ['Escribir emails y mensajes a clientes', 'Responder reseñas y redes sociales', 'Textos de la web y fichas de producto', 'Presupuestos y propuestas', 'Facturación y administración', 'Atención al cliente', 'Selección de personal y RR. HH.', 'Actas, resúmenes y organización interna', 'Traducciones', 'Ninguna'],
  },
  {
    id: 'tools',
    label: '¿Qué herramientas de IA usas? (todas las que apliquen)',
    multi: true,
    options: ['ChatGPT', 'Gemini', 'Copilot (Microsoft)', 'Claude', 'La IA integrada en otras herramientas (Canva, Notion, CRM…)', 'Otras', 'Ninguna'],
  },
  {
    id: 'paying',
    label: '¿Pagas por alguna herramienta de IA?',
    options: ['No, solo versiones gratuitas', 'Sí, una', 'Sí, varias', 'No uso IA'],
  },
  {
    id: 'barrier',
    label: '¿Cuál es el mayor freno para usarla más?',
    options: ['No sé qué pedirle ni cómo', 'Me preocupa la privacidad de los datos de clientes', 'Las respuestas no son fiables', 'No tengo tiempo para aprender', 'Mi equipo no la usa', 'Ninguno, ya la uso todo lo que quiero'],
  },
  {
    id: 'policy',
    label: '¿Tenéis normas sobre qué datos no se pueden pegar en una IA?',
    options: ['Sí, por escrito', 'Sí, pero solo de palabra', 'No', 'No lo había pensado'],
  },
  {
    id: 'saving',
    label: 'Si la usas, ¿cuánto tiempo estimas que te ahorra a la semana?',
    options: ['Menos de 1 hora', 'Entre 1 y 3 horas', 'Entre 3 y 5 horas', 'Más de 5 horas', 'No lo sé', 'No uso IA'],
  },
]

export const MAX_MULTI = 4

/** Valida un envío; devuelve las respuestas limpias o null. */
export function validateAnswers(input: unknown): Record<string, string | string[]> | null {
  if (!input || typeof input !== 'object') return null
  const src = input as Record<string, unknown>
  const out: Record<string, string | string[]> = {}
  for (const q of QUESTIONS) {
    const v = src[q.id]
    if (q.multi) {
      if (!Array.isArray(v) || v.length === 0 || v.length > (q.id === 'tasks' ? MAX_MULTI : q.options.length)) return null
      const uniq = [...new Set(v)]
      if (uniq.some((x) => typeof x !== 'string' || !q.options.includes(x))) return null
      out[q.id] = uniq as string[]
    } else {
      if (typeof v !== 'string' || !q.options.includes(v)) return null
      out[q.id] = v
    }
  }
  return out
}
