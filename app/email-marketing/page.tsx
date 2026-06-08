import type { Metadata } from 'next'
import Link from 'next/link'
import brand from '@/data/brand.json'
import { getArticlesByCategory } from '@/lib/db/articles'
import { ArticleCard } from '@/app/components/ArticleCard'

export const metadata: Metadata = {
  title: 'Mejores herramientas de email marketing para pymes en España 2026',
  description:
    'Comparativa actualizada de las mejores plataformas de email marketing para pymes españolas: Brevo, Mailchimp, GetResponse, Mailrelay y más. Planes gratuitos, precios en euros y cuál elegir.',
  alternates: { canonical: `${brand.siteUrl}/email-marketing` },
  openGraph: {
    title: 'Mejores herramientas de email marketing para pymes en España 2026',
    description:
      'Comparativa de las mejores plataformas de email marketing para pymes españolas: planes gratuitos, precios y cuál elegir.',
    url: `${brand.siteUrl}/email-marketing`,
    siteName: brand.siteName,
    type: 'website',
  },
}

const TOP_TOOLS = [
  {
    name: 'Brevo',
    slug: 'review-brevo',
    badge: 'Mejor gratuito',
    badgeColor: 'bg-green-100 text-green-800',
    price: 'Gratis / desde 7 €/mes',
    score: '7.8',
    why: '300 emails/día gratis con contactos ilimitados. Cobra por envíos, no por lista.',
  },
  {
    name: 'Mailrelay',
    slug: 'review-mailrelay',
    badge: 'Mejor plan gratuito grande',
    badgeColor: 'bg-blue-100 text-blue-800',
    price: 'Gratis / desde 29 €/mes',
    score: '7.8',
    why: '20.000 contactos y 80.000 emails/mes gratis, sin marca. Empresa española.',
  },
  {
    name: 'GetResponse',
    slug: 'review-getresponse',
    badge: 'Mejor todo en uno',
    badgeColor: 'bg-purple-100 text-purple-800',
    price: 'Desde 13 €/mes',
    score: '7.2',
    why: 'Email + automatizaciones + landing pages + webinars en una sola herramienta.',
  },
]

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Mejores herramientas de email marketing para pymes en España 2026',
  description:
    'Comparativa de las mejores plataformas de email marketing para pymes españolas: planes gratuitos, precios y cuál elegir.',
  url: `${brand.siteUrl}/email-marketing`,
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
      name: '¿Cuál es la mejor herramienta de email marketing gratuita para pymes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mailrelay tiene el plan gratuito más generoso: hasta 20.000 contactos y 80.000 emails/mes sin límite de tiempo y sin marca visible. Brevo también ofrece un plan gratuito con 300 emails/día y contactos ilimitados. Para listas pequeñas (menos de 500 contactos), Mailchimp es otra opción.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué plataforma de email marketing es más barata para España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Brevo es la más barata para listas grandes: cobra por emails enviados, no por contactos almacenados. El plan Starter arranca en 7 €/mes para 5.000 envíos mensuales. GetResponse es más cara pero incluye landing pages y webinars en el mismo precio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El email marketing cumple con el GDPR en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las principales plataformas (Brevo, Mailrelay, GetResponse, ActiveCampaign) firman DPA bajo GDPR y almacenan datos en servidores europeos. Mailrelay es empresa española y cumple específicamente con la LOPDGDD. En cualquier caso, debes tener el consentimiento explícito de tus suscriptores antes de enviarles emails comerciales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos contactos necesito para que valga la pena pagar por email marketing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si tienes menos de 500 contactos, empieza con un plan gratuito (Mailrelay o Brevo). Con 500-5.000 contactos y envíos regulares, un plan de pago entre 7-15 €/mes ya empieza a justificarse si el email marketing te genera ventas. Por encima de 5.000 contactos activos, una plataforma con automatizaciones como GetResponse o ActiveCampaign suele amortizarse rápido.',
      },
    },
  ],
}

export default async function EmailMarketingPage() {
  const articles = await getArticlesByCategory('email-marketing')
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
            Email marketing para pymes
          </p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
            Las mejores herramientas de email marketing para pymes en España (2026)
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Enviar newsletters desde Outlook o Gmail no escala. Si tienes una lista de clientes y quieres
            comunicarte con ellos de forma profesional — sin pagar una barbaridad y cumpliendo con el GDPR —
            estas son las plataformas que mejor funcionan para pymes españolas en 2026.
          </p>
        </header>

        {/* Top picks */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuestros 3 favoritos</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {TOP_TOOLS.map((tool) => (
              <Link
                key={tool.slug}
                href={`/email-marketing/${tool.slug}`}
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

        {/* What is email marketing */}
        <section className="mb-14 bg-gray-50 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">¿Qué es el email marketing y para qué sirve en una pyme?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            El email marketing es enviar emails comerciales o informativos a una lista de contactos que han
            dado su consentimiento para recibirlos. En la práctica, incluye newsletters periódicas, emails
            de bienvenida automáticos, promociones puntuales y secuencias de seguimiento a leads.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Para una pyme española, el email marketing sigue siendo el canal con mejor retorno de inversión:
            no dependes de algoritmos de redes sociales, el coste por envío es muy bajo y los contactos
            de tu lista ya te conocen, lo que mejora las tasas de conversión.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Tiene sentido empezar a usar una plataforma dedicada cuando tienes más de 200-300 contactos,
            envías emails con regularidad (mínimo una vez al mes) o necesitas automatizar secuencias básicas
            como la bienvenida a nuevos clientes.
          </p>
        </section>

        {/* Comparison table */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comparativa de precios y planes gratuitos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Plataforma</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Plan gratuito</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Modelo de precio</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Precio entrada</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Automatizaciones</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Mailrelay', slug: 'review-mailrelay', free: '20.000 contactos / 80K emails', model: 'Por contactos', price: '29 €/mes', auto: 'Básicas' },
                  { name: 'Brevo', slug: 'review-brevo', free: '300 emails/día, contactos ilimitados', model: 'Por envíos', price: '7 €/mes', auto: 'Avanzadas' },
                  { name: 'Mailchimp', slug: 'review-mailchimp', free: '500 contactos / 1.000 emails/mes', model: 'Por contactos', price: '13 €/mes', auto: 'Básicas' },
                  { name: 'GetResponse', slug: 'review-getresponse', free: '30 días trial', model: 'Por contactos', price: '13 €/mes', auto: 'Avanzadas' },
                  { name: 'ActiveCampaign', slug: 'review-activecampaign', free: '14 días trial', model: 'Por contactos', price: '15 €/mes', auto: 'Muy avanzadas' },
                  { name: 'Acumbamail', slug: 'review-acumbamail', free: '2.000 contactos / 20K emails', model: 'Por contactos', price: '9 €/mes', auto: 'Básicas' },
                ].map((row) => (
                  <tr key={row.slug} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/email-marketing/${row.slug}`} className="text-blue-600 hover:underline">{row.name}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{row.free}</td>
                    <td className="px-4 py-3 text-gray-600">{row.model}</td>
                    <td className="px-4 py-3 text-gray-600">{row.price}</td>
                    <td className="px-4 py-3 text-gray-600">{row.auto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">Precios en facturación anual, junio 2026. Verifica en la web de cada proveedor.</p>
        </section>

        {/* How to choose */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">¿Qué plataforma elegir según tu situación?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { if: 'Tienes menos de 500 contactos y quieres empezar gratis', choose: 'Brevo (gratuito)', href: '/email-marketing/review-brevo' },
              { if: 'Tienes 1.000-20.000 contactos y envías newsletters periódicas', choose: 'Mailrelay (gratuito hasta 20K)', href: '/email-marketing/review-mailrelay' },
              { if: 'Necesitas automatizaciones avanzadas y tienes más de 500 contactos', choose: 'GetResponse o ActiveCampaign', href: '/email-marketing/review-getresponse' },
              { if: 'Tienes más de 5.000 contactos y haces nurturing de leads', choose: 'ActiveCampaign', href: '/email-marketing/review-activecampaign' },
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Comparativas de plataformas</h2>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Preguntas frecuentes sobre email marketing para pymes</h2>
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
