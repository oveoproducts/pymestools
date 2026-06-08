import type { Metadata } from 'next'
import Link from 'next/link'
import brand from '@/data/brand.json'
import { getArticlesByCategory } from '@/lib/db/articles'
import { ArticleCard } from '@/app/components/ArticleCard'

export const metadata: Metadata = {
  title: 'Mejores CRM para pymes en España 2026',
  description:
    'Comparativa actualizada de los mejores CRM para pymes españolas: HubSpot, Zoho CRM, Pipedrive y más. Precios en euros, planes gratuitos y cuál elegir según el tamaño de tu empresa.',
  alternates: { canonical: `${brand.siteUrl}/crm` },
  openGraph: {
    title: 'Mejores CRM para pymes en España 2026',
    description:
      'Comparativa actualizada de los mejores CRM para pymes españolas: HubSpot, Zoho CRM, Pipedrive y más.',
    url: `${brand.siteUrl}/crm`,
    siteName: brand.siteName,
    type: 'website',
  },
}

const TOP_TOOLS = [
  {
    name: 'HubSpot CRM',
    slug: 'review-hubspot-crm',
    badge: 'Mejor gratuito',
    badgeColor: 'bg-green-100 text-green-800',
    price: 'Gratis',
    score: '8.2',
    why: 'Plan gratuito real con contactos ilimitados. El más fácil de empezar.',
  },
  {
    name: 'Zoho CRM',
    slug: 'review-zoho-crm',
    badge: 'Mejor calidad-precio',
    badgeColor: 'bg-blue-100 text-blue-800',
    price: 'Desde 14 €/usuario/mes',
    score: '8.5',
    why: 'El más completo por precio. Automatizaciones avanzadas sin pagar de más.',
  },
  {
    name: 'Pipedrive',
    slug: 'review-pipedrive',
    badge: 'Mejor para ventas',
    badgeColor: 'bg-purple-100 text-purple-800',
    price: 'Desde 14 €/usuario/mes',
    score: '7.8',
    why: 'Pipeline visual muy intuitivo. Ideal para equipos comerciales activos.',
  },
]

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Mejores CRM para pymes en España 2026',
  description:
    'Comparativa de los mejores CRM para pymes españolas: precios, planes gratuitos y cuál elegir.',
  url: `${brand.siteUrl}/crm`,
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
      name: '¿Cuál es el mejor CRM gratuito para pymes en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'HubSpot CRM tiene el mejor plan gratuito del mercado: contactos ilimitados, pipeline de ventas visual y sin límite de tiempo. Freshsales también ofrece un plan gratuito con usuarios ilimitados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué CRM es más barato para una pyme española?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Zoho CRM Standard arranca en 14 €/usuario/mes (facturación anual), igual que Pipedrive Essential. HubSpot tiene plan gratuito, pero el primer plan de pago sube a ~18 €/mes. Para listas muy pequeñas, el free de HubSpot es la opción más barata.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los CRM cumplen con el GDPR y la LOPDGDD española?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, los principales CRM (HubSpot, Zoho, Pipedrive, Salesforce) firman DPA bajo GDPR. Zoho y Pipedrive ofrecen servidores en la UE en todos los planes. Consulta con tu delegado de protección de datos si gestionas datos sensibles.',
      },
    },
  ],
}

export default async function CRMPage() {
  const articles = await getArticlesByCategory('crm')
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

        {/* Hero */}
        <header className="mb-12 max-w-3xl">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">
            Software CRM para pymes
          </p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
            Los mejores CRM para pymes en España (2026)
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Si llevas los clientes en Excel y se te escapan seguimientos, necesitas un CRM. Hemos analizado
            más de 10 herramientas para encontrar las que mejor funcionan para empresas de 2 a 50 personas
            en España: soporte en español, precios en euros y sin pagar por funciones que no vas a usar.
          </p>
        </header>

        {/* Top picks */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuestros 3 favoritos</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {TOP_TOOLS.map((tool) => (
              <Link
                key={tool.slug}
                href={`/crm/${tool.slug}`}
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

        {/* What is CRM */}
        <section className="mb-14 bg-gray-50 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">¿Qué es un CRM y para qué sirve?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Un CRM (Customer Relationship Management) es una herramienta para gestionar la relación con tus
            clientes y clientes potenciales. En la práctica, reemplaza el Excel de seguimiento de clientes,
            centraliza el historial de cada conversación y automatiza los recordatorios de seguimiento.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Para una pyme española de servicios B2B, los beneficios concretos son tres: no se te escapa
            ningún lead por falta de seguimiento, tienes visibilidad de en qué punto está cada oportunidad
            de venta, y puedes medir qué canales generan más clientes.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Tiene sentido empezar a usar un CRM cuando tu equipo comercial tiene 2 o más personas, o cuando
            gestionas más de 20-30 oportunidades simultáneas. Por debajo de eso, una hoja de cálculo bien
            organizada puede ser suficiente.
          </p>
        </section>

        {/* Quick comparison table */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comparativa rápida de precios</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">CRM</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Plan gratuito</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Precio entrada</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Precio en euros</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Mejor para</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'HubSpot CRM', slug: 'review-hubspot-crm', free: '✅ Sin límite', price: '~18 €/mes', eur: '❌ Cobra en $', for: 'Empezar gratis' },
                  { name: 'Zoho CRM', slug: 'review-zoho-crm', free: '✅ 3 usuarios', price: '14 €/usuario/mes', eur: '✅ Sí', for: 'Máx. funciones/€' },
                  { name: 'Pipedrive', slug: 'review-pipedrive', free: '❌ Solo 14 días', price: '14 €/usuario/mes', eur: '✅ Sí', for: 'Equipos comerciales' },
                  { name: 'Freshsales', slug: 'review-freshsales', free: '✅ Usuarios ilimitados', price: '15 €/usuario/mes', eur: '✅ Sí', for: 'Alternativa a HubSpot' },
                  { name: 'Salesforce Starter', slug: 'review-salesforce-pymes', free: '❌ Solo 30 días', price: '25 €/usuario/mes', eur: '✅ Sí', for: 'Crecer sin migrar' },
                ].map((row) => (
                  <tr key={row.slug} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/crm/${row.slug}`} className="text-blue-600 hover:underline">{row.name}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.free}</td>
                    <td className="px-4 py-3 text-gray-600">{row.price}</td>
                    <td className="px-4 py-3 text-gray-600">{row.eur}</td>
                    <td className="px-4 py-3 text-gray-600">{row.for}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">Precios en facturación anual, junio 2026. Verifica en la web de cada proveedor.</p>
        </section>

        {/* How to choose */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">¿Cómo elegir el CRM adecuado para tu pyme?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { if: 'Nunca has usado un CRM y quieres empezar sin pagar', choose: 'HubSpot CRM gratuito', href: '/crm/review-hubspot-crm' },
              { if: 'Tienes un equipo comercial de 2-5 personas activo en ventas', choose: 'Pipedrive Advanced', href: '/crm/review-pipedrive' },
              { if: 'Quieres el máximo de funciones al menor coste', choose: 'Zoho CRM Standard', href: '/crm/review-zoho-crm' },
              { if: 'Prevés crecer mucho y no quieres migrar de herramienta', choose: 'Salesforce Starter', href: '/crm/review-salesforce-pymes' },
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

        {/* Reviews */}
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

        {/* Comparativas */}
        {comparativas.length > 0 && (
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Comparativas CRM</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {comparativas.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* Guías */}
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

        {/* FAQ */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Preguntas frecuentes sobre CRM para pymes</h2>
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
