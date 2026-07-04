import type { Metadata } from 'next'
import Link from 'next/link'
import brand from '@/data/brand.json'
import { getArticlesByCategory } from '@/lib/db/articles'
import { ArticleCard } from '@/app/components/ArticleCard'

export const metadata: Metadata = {
  title: 'Gestión de proyectos para pymes en España 2026',
  description:
    'Notion, ClickUp, Asana y Trello: comparativa de herramientas de gestión de proyectos para pymes españolas. Cuál elegir según el tamaño de tu equipo.',
  alternates: { canonical: `${brand.siteUrl}/gestion-proyectos` },
  openGraph: {
    title: 'Gestión de proyectos para pymes en España 2026',
    description:
      'Notion, ClickUp, Asana y Trello: comparativa de herramientas de gestión de proyectos para pymes españolas. Cuál elegir según el tamaño de tu equipo.',
    url: `${brand.siteUrl}/gestion-proyectos`,
    siteName: brand.siteName,
    type: 'website',
    images: [{ url: `${brand.siteUrl}/api/og?title=Gestión+de+Proyectos+para+Pymes&type=category`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gestión de proyectos para pymes en España 2026',
    description: 'Notion, ClickUp, Asana y Trello: cuál elegir según el tamaño de tu equipo.',
    images: [`${brand.siteUrl}/api/og?title=Gestión+de+Proyectos+para+Pymes&type=category`],
  },
}

const TOP_TOOLS = [
  {
    name: 'Notion',
    slug: 'review-notion-pymes',
    badge: 'Más versátil',
    badgeColor: 'bg-blue-100 text-blue-800',
    price: 'Gratis / desde 8 €/mes',
    score: '8.0',
    why: 'Wiki, base de datos y gestión de proyectos en un solo sitio. Muy flexible para cualquier equipo.',
  },
  {
    name: 'ClickUp',
    slug: 'review-clickup',
    badge: 'Más funciones',
    badgeColor: 'bg-purple-100 text-purple-800',
    price: 'Gratis / desde 7 €/mes',
    score: '7.8',
    why: 'La herramienta más completa: tareas, documentos, chat y seguimiento de tiempo. Plan gratuito potente.',
  },
  {
    name: 'Trello',
    slug: 'review-trello',
    badge: 'Más sencillo',
    badgeColor: 'bg-green-100 text-green-800',
    price: 'Gratis / desde 5 €/mes',
    score: '7.2',
    why: 'El tablero Kanban más fácil de aprender. Ideal para equipos pequeños con procesos simples.',
  },
]

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Mejores herramientas de gestión de proyectos para pymes en España 2026',
  description:
    'Comparativa de las mejores herramientas de gestión de proyectos para pymes españolas: Notion, ClickUp, Asana y Trello.',
  url: `${brand.siteUrl}/gestion-proyectos`,
  publisher: {
    '@type': 'Organization',
    name: brand.siteName,
    url: brand.siteUrl,
  },
}

const JSON_LD_FAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la mejor herramienta de gestión de proyectos gratis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Todas las opciones principales tienen plan gratuito. Trello es el más sencillo gratis para equipos pequeños. ClickUp tiene el plan gratuito más completo en funcionalidades. Notion es gratuito para equipos de hasta 10 personas con colaboración completa. Asana es gratuito hasta 15 usuarios con proyectos ilimitados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Notion o ClickUp para una pyme española?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del uso. Notion es mejor si quieres una herramienta de conocimiento y documentación además de gestión de proyectos: wikis, bases de datos relacionales y notas del equipo. ClickUp es mejor si tu prioridad es gestionar tareas y proyectos con más detalle: subtareas, seguimiento de tiempo, dependencias y automatizaciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Las herramientas de gestión de proyectos cumplen con el GDPR?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Notion, ClickUp, Asana y Trello firman DPA bajo GDPR y almacenan datos en servidores europeos (UE) o permiten elegir la región de almacenamiento. Para la mayoría de pymes españolas, el cumplimiento básico del GDPR está cubierto. Si manejas datos especialmente sensibles, revisa el DPA específico de cada herramienta.',
      },
    },
  ],
}

export default async function GestionProyectosPage() {
  const articles = await getArticlesByCategory('gestion-proyectos')
  const reviews = articles.filter((a) => a.type === 'review').slice(0, 3)
  const comparativas = articles.filter((a) => a.type === 'comparison').slice(0, 3)
  const guias = articles.filter((a) => a.type === 'how-to' || a.type === 'top-list').slice(0, 3)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_FAQ) }}
      />

      <div className="max-w-5xl mx-auto px-4 py-12">

        <header className="mb-12 max-w-3xl">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">
            Gestión de proyectos para pymes
          </p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
            Las mejores herramientas de gestión de proyectos para pymes (2026)
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Coordinar un equipo de 5-20 personas por email y WhatsApp escala mal. Las herramientas de
            gestión de proyectos centralizan tareas, plazos y comunicación. El reto es elegir una que el
            equipo realmente use y que no cueste una barbaridad.
          </p>
        </header>

        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuestros 3 favoritos</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {TOP_TOOLS.map((tool) => (
              <Link
                key={tool.slug}
                href={`/gestion-proyectos/${tool.slug}`}
                className="group block rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm p-5 transition-all"
              >
                <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-3 ${tool.badgeColor}`}>
                  {tool.badge}
                </span>
                <p className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-700">{tool.name}</p>
                <p className="text-sm text-gray-500 mb-3">{tool.price}</p>
                <p className="text-sm text-gray-600 leading-snug">{tool.why}</p>
                <p className="mt-3 text-xs font-semibold text-blue-600 group-hover:underline">Ver análisis completo →</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-14 bg-gray-50 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">¿Qué es la gestión de proyectos y para qué sirve en una pyme?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Las herramientas de gestión de proyectos centralizan las tareas, los responsables, los plazos
            y los archivos en un solo lugar. Sustituyen la combinación de emails, WhatsApp, hojas de
            cálculo y notas sueltas que acaban siendo la forma de trabajar en la mayoría de pymes cuando
            el equipo supera las 4-5 personas.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Para una pyme española, el beneficio principal es la visibilidad: saber qué está haciendo
            cada persona, qué proyectos tienen retraso y qué tareas están bloqueadas. Sin eso, el
            seguimiento recae sobre el dueño o el responsable de equipo, que pasa más tiempo en reuniones
            de estado que en trabajo real.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Todas las opciones principales (Notion, ClickUp, Asana, Trello) tienen plan gratuito funcional.
            Para equipos de menos de 5 personas con proyectos sencillos, el plan gratuito de cualquiera
            de estas herramientas es suficiente para empezar y decidir si encaja con tu forma de trabajar.
          </p>
        </section>

        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comparativa de herramientas de gestión de proyectos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Herramienta</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Plan gratuito</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Precio entrada</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Interfaz en español</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Notion', slug: 'review-notion-pymes', free: 'Sí (ilimitado)', price: '8 €/mes', es: '✅' },
                  { name: 'ClickUp', slug: 'review-clickup', free: 'Sí (potente)', price: '7 €/mes', es: '✅' },
                  { name: 'Asana', slug: 'review-asana', free: 'Sí (15 usuarios)', price: '10 €/mes', es: '✅' },
                  { name: 'Trello', slug: 'review-trello', free: 'Sí (ilimitado)', price: '5 €/mes', es: '✅' },
                ].map((row) => (
                  <tr key={row.slug} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/gestion-proyectos/${row.slug}`} className="text-blue-600 hover:underline">{row.name}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{row.free}</td>
                    <td className="px-4 py-3 text-gray-600">{row.price}</td>
                    <td className="px-4 py-3 text-gray-600">{row.es}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">Precios en facturación anual, junio 2026. Verifica en la web de cada proveedor.</p>
        </section>

        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">¿Qué herramienta elegir según tu situación?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { if: 'Equipo pequeño (2-5 personas) con procesos simples', choose: 'Trello (gratis)', href: '/gestion-proyectos/review-trello' },
              { if: 'Quieres la herramienta más versátil como wiki + proyectos', choose: 'Notion', href: '/gestion-proyectos/review-notion-pymes' },
              { if: 'Necesitas la solución más completa con más funcionalidades', choose: 'ClickUp', href: '/gestion-proyectos/review-clickup' },
              { if: 'Equipo mediano que ya usa Google Workspace', choose: 'Asana', href: '/gestion-proyectos/review-asana' },
            ].map((item) => (
              <div key={item.href} className="rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Si {item.if}:</p>
                <Link href={item.href} className="font-semibold text-blue-700 hover:underline text-sm">
                  → {item.choose}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {reviews.length > 0 && (
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews detalladas</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {comparativas.length > 0 && (
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Comparativas de herramientas</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {comparativas.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {guias.length > 0 && (
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Guías y recursos</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {guias.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Preguntas frecuentes sobre gestión de proyectos para pymes</h2>
          <div className="space-y-6">
            {JSON_LD_FAQ.mainEntity.map((faq) => (
              <div key={faq.name} className="border-b border-gray-100 pb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </>
  )
}
