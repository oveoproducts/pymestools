'use client'
import { useState } from 'react'
import Link from 'next/link'

type Problem = 'crm' | 'email' | 'facturacion' | 'rrhh' | 'automatizacion' | 'proyectos'

interface Recommendation {
  name: string
  slug: string
  category: string
  score: number
  reason: string
  alt?: { name: string; slug: string; category: string }
}

const PROBLEMS = [
  { id: 'crm' as Problem,           icon: '🤝', text: 'Pierdo clientes porque no hago seguimiento',       sub: 'Necesitas un CRM' },
  { id: 'email' as Problem,         icon: '📧', text: 'Mando emails a clientes uno a uno a mano',         sub: 'Email marketing' },
  { id: 'facturacion' as Problem,   icon: '🧾', text: 'Hacer facturas me roba demasiado tiempo',           sub: 'Software de facturación' },
  { id: 'rrhh' as Problem,          icon: '👥', text: 'No controlo vacaciones ni bajas de mi equipo',      sub: 'Gestión de RRHH' },
  { id: 'automatizacion' as Problem,icon: '⚙️', text: 'Repito las mismas tareas manuales cada semana',    sub: 'Automatización' },
  { id: 'proyectos' as Problem,     icon: '📋', text: 'Mi equipo no sabe quién hace qué',                  sub: 'Gestión de proyectos' },
]

const FOLLOWUP: Record<Problem, { question: string; options: { id: string; text: string }[] }> = {
  crm: {
    question: '¿Qué te importa más en un CRM?',
    options: [
      { id: 'precio',    text: '💰 Precio — que sea gratis o barato' },
      { id: 'facilidad', text: '🚀 Arrancar rápido sin configuración' },
      { id: 'pipeline',  text: '📊 Controlar bien el pipeline de ventas' },
    ],
  },
  email: {
    question: '¿Cuántos contactos tienes (o esperas tener)?',
    options: [
      { id: 'pequena',  text: '👤 Menos de 500 contactos' },
      { id: 'mediana',  text: '👥 Entre 500 y 5.000 contactos' },
      { id: 'grande',   text: '🏢 Más de 5.000 contactos' },
    ],
  },
  facturacion: {
    question: '¿Cómo es tu situación?',
    options: [
      { id: 'autonomo', text: '🧑‍💻 Soy autónomo o freelance' },
      { id: 'empresa',  text: '🏢 Tengo empleados o equipo' },
    ],
  },
  rrhh: {
    question: '¿Cuántos empleados tenéis?',
    options: [
      { id: 'micro',   text: '👤 Menos de 10 personas' },
      { id: 'pequena', text: '👥 Entre 10 y 50 personas' },
      { id: 'mediana', text: '🏢 Más de 50 personas' },
    ],
  },
  automatizacion: {
    question: '¿Cómo te defines?',
    options: [
      { id: 'nocode',   text: '😊 Sin conocimientos técnicos' },
      { id: 'medio',    text: '🛠️ Me manejo con un poco de técnica' },
      { id: 'tecnico',  text: '💻 Tengo perfil técnico o soy dev' },
    ],
  },
  proyectos: {
    question: '¿Qué necesitas principalmente?',
    options: [
      { id: 'tareas',   text: '✅ Un tablero simple de tareas' },
      { id: 'notas',    text: '📝 Notas + proyectos en un solo sitio' },
      { id: 'completo', text: '🎯 Gestión de proyectos completa' },
    ],
  },
}

const RECOMMENDATIONS: Record<Problem, Record<string, Recommendation>> = {
  crm: {
    precio:    { name: 'Zoho CRM',    slug: 'review-zoho-crm',      category: 'crm', score: 7.2, reason: 'Plan gratuito real para hasta 3 usuarios. El más barato en planes de pago — hasta 4 veces menos que HubSpot con las mismas funciones básicas.', alt: { name: 'HubSpot CRM', slug: 'review-hubspot-crm', category: 'crm' } },
    facilidad: { name: 'HubSpot CRM', slug: 'review-hubspot-crm',   category: 'crm', score: 6.8, reason: 'El más fácil de arrancar. La mayoría de equipos lo usa bien en la primera semana sin formación ni configuración técnica.', alt: { name: 'Zoho CRM', slug: 'review-zoho-crm', category: 'crm' } },
    pipeline:  { name: 'Pipedrive',   slug: 'review-pipedrive',      category: 'crm', score: 7.8, reason: 'Diseñado exclusivamente para gestionar el pipeline de ventas. Visual, rápido y sin funciones que no vas a usar.', alt: { name: 'HubSpot CRM', slug: 'review-hubspot-crm', category: 'crm' } },
  },
  email: {
    pequena: { name: 'Brevo',          slug: 'review-brevo',          category: 'email-marketing', score: 7.5, reason: 'Plan gratuito generoso (300 emails/día, contactos ilimitados). El mejor punto de entrada si estás empezando desde cero.', alt: { name: 'Mailchimp', slug: 'review-mailchimp', category: 'email-marketing' } },
    mediana:  { name: 'GetResponse',   slug: 'review-getresponse',    category: 'email-marketing', score: 7.2, reason: 'Mejor relación calidad-precio para listas medianas. Incluye landing pages, webinars y automatizaciones en el mismo precio.', alt: { name: 'Mailchimp', slug: 'review-mailchimp', category: 'email-marketing' } },
    grande:   { name: 'ActiveCampaign',slug: 'review-activecampaign', category: 'email-marketing', score: 7.2, reason: 'Las mejores automatizaciones del mercado. Vale el precio si tienes más de 5.000 contactos y vas a usarlas de verdad.', alt: { name: 'GetResponse', slug: 'review-getresponse', category: 'email-marketing' } },
  },
  facturacion: {
    autonomo: { name: 'Anfix',   slug: 'review-anfix',   category: 'facturacion', score: 7.0, reason: 'Diseñado para autónomos españoles. Facturas, gastos, IRPF y declaraciones sin complicaciones técnicas.', alt: { name: 'Contasimple', slug: 'review-contasimple', category: 'facturacion' } },
    empresa:  { name: 'Holded',  slug: 'review-holded',  category: 'facturacion', score: 7.8, reason: 'Todo en uno: facturación, contabilidad, inventario y gestión de equipo. El más completo para pymes con empleados.', alt: { name: 'Anfix', slug: 'review-anfix', category: 'facturacion' } },
  },
  rrhh: {
    micro:   { name: 'Factorial', slug: 'review-factorial', category: 'recursos-humanos', score: 7.5, reason: 'Plan gratuito para equipos pequeños. Vacaciones, fichajes y documentos en un solo sitio. El más fácil de arrancar.', alt: { name: 'Sesame HR', slug: 'review-sesame', category: 'recursos-humanos' } },
    pequena: { name: 'Factorial', slug: 'review-factorial', category: 'recursos-humanos', score: 7.5, reason: 'El más usado en pymes españolas de este tamaño. Cubre todo el ciclo de RRHH sin necesitar un equipo técnico.', alt: { name: 'Sesame HR', slug: 'review-sesame', category: 'recursos-humanos' } },
    mediana: { name: 'Bizneo',    slug: 'review-bizneo',    category: 'recursos-humanos', score: 7.0, reason: 'Plataforma más completa para empresas medianas. Selección, onboarding, evaluaciones y RRHH en un solo sistema.', alt: { name: 'Factorial', slug: 'review-factorial', category: 'recursos-humanos' } },
  },
  automatizacion: {
    nocode:  { name: 'Zapier', slug: 'review-zapier', category: 'automatizacion', score: 7.5, reason: 'El más fácil sin código. Conecta más de 6.000 apps con flujos visuales. Empieza gratis y escala cuando lo necesites.', alt: { name: 'Make', slug: 'review-make', category: 'automatizacion' } },
    medio:   { name: 'Make',   slug: 'review-make',   category: 'automatizacion', score: 7.8, reason: 'Más potente y más barato que Zapier. Interfaz visual avanzada con más control sobre los flujos y transformaciones.', alt: { name: 'Zapier', slug: 'review-zapier', category: 'automatizacion' } },
    tecnico: { name: 'n8n',    slug: 'review-n8n',    category: 'automatizacion', score: 8.0, reason: 'Open source, auto-hospedable y sin límite de operaciones. El más potente si tienes perfil técnico y quieres control total.', alt: { name: 'Make', slug: 'review-make', category: 'automatizacion' } },
  },
  proyectos: {
    tareas:   { name: 'Trello',   slug: 'review-trello',        category: 'gestion-proyectos', score: 7.2, reason: 'Tablero Kanban simple y visual. Gratuito para equipos pequeños y fácil de adoptar sin formación.', alt: { name: 'Notion', slug: 'review-notion-pymes', category: 'gestion-proyectos' } },
    notas:    { name: 'Notion',   slug: 'review-notion-pymes',  category: 'gestion-proyectos', score: 7.5, reason: 'Combina notas, base de datos y proyectos en un solo espacio de trabajo. Ideal si quieres centralizar todo.', alt: { name: 'ClickUp', slug: 'review-clickup', category: 'gestion-proyectos' } },
    completo: { name: 'ClickUp',  slug: 'review-clickup',       category: 'gestion-proyectos', score: 7.8, reason: 'El más completo: tareas, tiempo, sprints, documentos y dashboards. Para equipos que necesitan gestión de proyectos seria.', alt: { name: 'Asana', slug: 'review-asana', category: 'gestion-proyectos' } },
  },
}

function Stars({ score }: { score: number }) {
  const stars = Math.round((score / 10) * 5)
  const color = score >= 7 ? 'text-green-500' : score >= 5 ? 'text-amber-500' : 'text-red-400'
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(s => (
        <svg key={s} className={`w-4 h-4 ${s <= stars ? color : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
      <span className={`text-sm font-semibold ml-1 ${color}`}>{score.toFixed(1)}/10</span>
    </div>
  )
}

export function Recommender() {
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [problem, setProblem] = useState<Problem | null>(null)
  const [answer, setAnswer] = useState<string | null>(null)

  const rec = problem && answer ? RECOMMENDATIONS[problem][answer] : null
  const followup = problem ? FOLLOWUP[problem] : null

  function reset() { setStep(0); setProblem(null); setAnswer(null) }

  if (step === 0) {
    return (
      <div>
        <p className="text-gray-600 mb-6 text-center">Selecciona el que mejor describe tu situación:</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {PROBLEMS.map(p => (
            <button
              key={p.id}
              onClick={() => { setProblem(p.id); setStep(1) }}
              className="flex items-start gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
            >
              <span className="text-2xl shrink-0 mt-0.5">{p.icon}</span>
              <div>
                <p className="font-medium text-gray-900 text-sm group-hover:text-blue-700">{p.text}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (step === 1 && followup) {
    return (
      <div>
        <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1">
          ← Cambiar problema
        </button>
        <p className="font-semibold text-gray-900 text-lg mb-6">{followup.question}</p>
        <div className="flex flex-col gap-3">
          {followup.options.map(opt => (
            <button
              key={opt.id}
              onClick={() => { setAnswer(opt.id); setStep(2) }}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
            >
              <span className="font-medium text-gray-900 text-sm group-hover:text-blue-700">{opt.text}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (step === 2 && rec) {
    return (
      <div>
        <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1">
          ← Empezar de nuevo
        </button>

        <p className="text-sm text-gray-500 mb-4 font-medium uppercase tracking-wide">Nuestra recomendación</p>

        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-6 mb-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className="text-2xl font-bold text-gray-900">{rec.name}</h3>
            <Stars score={rec.score} />
          </div>
          <p className="text-gray-700 text-sm leading-relaxed mb-5">{rec.reason}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${rec.category}/${rec.slug}`}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              Ver review completa →
            </Link>
          </div>
        </div>

        {rec.alt && (
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-400 mb-1 font-medium">TAMBIÉN PUEDES MIRAR</p>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-800">{rec.alt.name}</p>
              <Link
                href={`/${rec.alt.category}/${rec.alt.slug}`}
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                Ver review →
              </Link>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-4 text-center">
          Puntuación basada en nuestro análisis. Puede contener enlaces de afiliado.
        </p>
      </div>
    )
  }

  return null
}
