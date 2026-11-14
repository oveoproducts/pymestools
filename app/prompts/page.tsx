import type { Metadata } from 'next'
import Link from 'next/link'
import brand from '@/data/brand.json'
import { brandedTitle } from '@/lib/seo/meta-title'
import { getArticlesByCategory } from '@/lib/db/articles'
import { ArticleCard } from '@/app/components/ArticleCard'

export const revalidate = 3600

const TITLE = 'Prompts de ChatGPT para pymes: biblioteca en español'
const DESCRIPTION =
  'Prompts de ChatGPT listos para copiar, pensados para pymes y autónomos en España: ventas, atención al cliente, marketing y administración, con las herramientas que los completan.'

export const metadata: Metadata = {
  title: brandedTitle(TITLE),
  description: DESCRIPTION,
  alternates: { canonical: `${brand.siteUrl}/prompts` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${brand.siteUrl}/prompts`,
    siteName: brand.siteName,
    type: 'website',
    images: [{ url: `${brand.siteUrl}/api/og?title=Prompts+de+ChatGPT+para+Pymes&type=category`, width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const AREAS = [
  { icon: '🤝', label: 'Ventas', text: 'Seguimiento de leads, propuestas y correos a clientes.', slug: 'prompts-chatgpt-ventas-pymes' },
  { icon: '🎧', label: 'Atención al cliente', text: 'Respuestas tipo, FAQ y guiones de chatbot.', slug: 'prompts-chatgpt-atencion-cliente-pymes' },
  { icon: '🧾', label: 'Administración', text: 'Impagos, presupuestos y comunicaciones con la gestoría.', slug: 'prompts-chatgpt-administracion-facturacion-autonomos' },
  { icon: '📧', label: 'Email marketing', text: 'Asuntos, secuencias de bienvenida y newsletters.', slug: 'prompts-chatgpt-email-marketing-pymes' },
  { icon: '📣', label: 'Marketing y reseñas', text: 'Reseñas de Google, redes sociales, ficha de empresa y textos web.', slug: 'prompts-chatgpt-marketing-resenas-redes-pymes' },
  { icon: '👥', label: 'Recursos humanos', text: 'Ofertas de empleo, entrevistas, onboarding y comunicados internos.', slug: 'prompts-chatgpt-recursos-humanos-pymes' },
  { icon: '🗂️', label: 'Operaciones y reuniones', text: 'Actas, procedimientos, checklists y planes de proyecto.', slug: 'prompts-chatgpt-operaciones-reuniones-pymes' },
]

const FORMULA = [
  { n: '1', t: 'Rol', d: 'Quién es el asistente: "responsable comercial de una asesoría de 6 personas".' },
  { n: '2', t: 'Contexto', d: 'Qué ha pasado, con datos reales y sin nombres de clientes.' },
  { n: '3', t: 'Tarea', d: 'Qué quieres exactamente: un email, una tabla, una lista.' },
  { n: '4', t: 'Formato', d: 'Longitud, estructura y tono.' },
  { n: '5', t: 'Límites', d: 'Qué evitar, y "si te falta información, pregúntame".' },
]

const FAQ = [
  {
    q: '¿Hace falta pagar para usar estos prompts?',
    a: 'No. Son texto que puedes pegar en cualquier asistente de IA conversacional, como ChatGPT, Gemini, Claude o Copilot. Las versiones de pago dan más capacidad, pero los prompts no la requieren.',
  },
  {
    q: '¿Puedo pegar datos de mis clientes?',
    a: 'Mejor no. Sustituye nombres, DNI, emails e importes reales por marcadores como [CLIENTE] y rellena los datos reales al final, en tu documento.',
  },
  {
    q: '¿Por qué me da respuestas genéricas?',
    a: 'Casi siempre por falta de contexto. Añade sector, ciudad, tipo de cliente, tono, longitud y qué debe evitar, y pídele que pregunte lo que le falte antes de escribir.',
  },
  {
    q: '¿Sirven para temas fiscales o legales?',
    a: 'Solo para preparar preguntas o borradores que revisa un profesional. Las normas cambian y una respuesta de IA no sustituye a tu gestoría o asesoría laboral.',
  },
]

export default async function PromptsHubPage() {
  const articles = await getArticlesByCategory('prompts')
  const bySlug = new Map(articles.map((a) => [a.slug, a]))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: TITLE,
        description: DESCRIPTION,
        url: `${brand.siteUrl}/prompts`,
        inLanguage: 'es-ES',
        isPartOf: { '@type': 'WebSite', name: brand.siteName, url: brand.siteUrl },
        hasPart: articles.map((a) => ({
          '@type': 'Article',
          headline: a.title,
          url: `${brand.siteUrl}/prompts/${a.slug}`,
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Prompts de ChatGPT para pymes y autónomos
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Prompts en español, con el contexto de una pyme española, que puedes copiar y adaptar.
          Cada uno indica qué revisar antes de usar la respuesta y, cuando hay una herramienta que
          hace mejor ese trabajo, te la señalamos.
        </p>
      </header>

      <section aria-labelledby="areas" className="mb-12">
        <h2 id="areas" className="text-xl font-bold text-gray-900 mb-4">Elige tu área</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {AREAS.map((area) => {
            const published = bySlug.has(area.slug)
            const card = (
              <div className="h-full rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-blue-400">
                <p className="text-2xl mb-1">{area.icon}</p>
                <p className="font-semibold text-gray-900">{area.label}</p>
                <p className="mt-1 text-sm text-gray-600">{area.text}</p>
                {!published && <p className="mt-2 text-xs text-gray-400">Próximamente</p>}
              </div>
            )
            return published ? (
              <Link key={area.slug} href={`/prompts/${area.slug}`} className="no-underline">
                {card}
              </Link>
            ) : (
              <div key={area.slug}>{card}</div>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="formula" className="mb-12">
        <h2 id="formula" className="text-xl font-bold text-gray-900 mb-2">La fórmula de cinco partes</h2>
        <p className="text-gray-600 mb-4 max-w-2xl">
          Todos los prompts de esta biblioteca siguen la misma estructura. Si el resultado no te
          convence, no empieces de cero: dile qué falla (&quot;demasiado formal&quot;, &quot;recorta a la mitad&quot;).{' '}
          <Link href="/prompts/prompts-chatgpt-para-pymes" className="text-blue-700 underline">
            Guía completa con 12 prompts
          </Link>
          .
        </p>
        <ol className="grid gap-3 sm:grid-cols-5">
          {FORMULA.map((f) => (
            <li key={f.n} className="rounded-xl border border-gray-200 bg-white p-4 text-sm">
              <p className="font-semibold text-gray-900">{f.n}. {f.t}</p>
              <p className="mt-1 text-gray-600">{f.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="guias" className="mb-12">
        <h2 id="guias" className="text-xl font-bold text-gray-900 mb-4">Todas las guías de prompts</h2>
        {articles.length === 0 ? (
          <p className="text-gray-500">Estamos preparando las primeras guías.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="faq" className="mb-12">
        <h2 id="faq" className="text-xl font-bold text-gray-900 mb-4">Preguntas frecuentes</h2>
        <div className="space-y-4">
          {FAQ.map((f) => (
            <div key={f.q}>
              <h3 className="font-semibold text-gray-900">{f.q}</h3>
              <p className="mt-1 text-gray-600">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <p className="font-semibold mb-1">Antes de pegar nada en ChatGPT</p>
        <p>
          No incluyas datos personales de clientes (nombres completos, DNI, emails, importes de
          facturas reales). Sustitúyelos por marcadores como [CLIENTE]. Y no uses una respuesta de
          ChatGPT como asesoramiento fiscal o legal: sirve para borradores que revisa un
          profesional.
        </p>
      </aside>
    </div>
  )
}
