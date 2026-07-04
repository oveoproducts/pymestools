import type { Metadata } from 'next'
import Link from 'next/link'
import brand from '@/data/brand.json'
import { getArticlesByCategory } from '@/lib/db/articles'
import { ArticleCard } from '@/app/components/ArticleCard'

export const metadata: Metadata = {
  title: 'Automatización para pymes en España 2026',
  description:
    'Make, Zapier, n8n y más: herramientas de automatización para pymes españolas. Conecta tus apps, elimina tareas repetitivas y ahorra tiempo.',
  alternates: { canonical: `${brand.siteUrl}/automatizacion` },
  openGraph: {
    title: 'Automatización para pymes en España 2026',
    description:
      'Make, Zapier, n8n y más: herramientas de automatización para pymes españolas. Conecta tus apps, elimina tareas repetitivas y ahorra tiempo.',
    url: `${brand.siteUrl}/automatizacion`,
    siteName: brand.siteName,
    type: 'website',
    images: [{ url: `${brand.siteUrl}/api/og?title=Automatización+para+Pymes&type=category`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Automatización para pymes en España 2026',
    description: 'Make, Zapier, n8n y más: conecta tus apps y elimina tareas repetitivas.',
    images: [`${brand.siteUrl}/api/og?title=Automatización+para+Pymes&type=category`],
  },
}

const TOP_TOOLS = [
  {
    name: 'Make',
    slug: 'review-make',
    badge: 'Mejor precio',
    badgeColor: 'bg-green-100 text-green-800',
    price: 'Gratis / desde 9 €/mes',
    score: '8.1',
    why: '1.700+ apps, interfaz visual, plan gratuito generoso. La mejor relación precio/potencia para pymes.',
  },
  {
    name: 'Zapier',
    slug: 'review-zapier',
    badge: 'Más integraciones',
    badgeColor: 'bg-blue-100 text-blue-800',
    price: 'Gratis / desde 19 €/mes',
    score: '7.8',
    why: '6.000+ integraciones. El más fácil de configurar sin conocimientos técnicos. Plan gratuito limitado.',
  },
  {
    name: 'n8n',
    slug: 'review-n8n',
    badge: 'Open source',
    badgeColor: 'bg-gray-100 text-gray-800',
    price: 'Gratis (self-hosted)',
    score: '7.4',
    why: 'Open source y gratuito si lo alojas tú. Para pymes con alguien técnico que quiere control total.',
  },
]

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Mejores herramientas de automatización para pymes en España 2026',
  description:
    'Comparativa de las mejores herramientas de automatización para pymes españolas: Make, Zapier, n8n y Power Automate.',
  url: `${brand.siteUrl}/automatizacion`,
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
      name: '¿Qué es la automatización y cuánto puede ahorrar una pyme?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La automatización conecta apps y realiza tareas sin intervención humana: crear un contacto en el CRM cuando alguien rellena un formulario, enviar un email de seguimiento 3 días después, o generar una factura al cerrar un pedido. Una pyme puede ahorrar entre 5 y 20 horas semanales según el volumen de procesos repetitivos que tenga.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Make o Zapier para una pyme española?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Zapier es más fácil de configurar y tiene más integraciones (6.000+), pero es significativamente más caro para volumen medio. Make es más barato, igual de potente, y tiene mejor relación precio/funcionalidad. Para pymes con presupuesto ajustado, Make suele ser la mejor opción. Para quien quiere la mayor simplicidad posible, Zapier.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede automatizar sin saber programar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Make, Zapier y Power Automate están diseñados para no-code: arrastras y sueltas para conectar apps. n8n requiere algo más de conocimiento técnico si lo alojas tú mismo. Para el 90% de los casos de uso de una pyme (sincronizar CRM, notificaciones, formularios), no necesitas saber programar.',
      },
    },
  ],
}

export default async function AutomatizacionPage() {
  const articles = await getArticlesByCategory('automatizacion')
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
            Automatización para pymes
          </p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
            Las mejores herramientas de automatización para pymes (2026)
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Una pyme de 10 personas puede ahorrar 10-15 horas semanales automatizando tareas repetitivas:
            sincronizar contactos entre CRM y email, crear facturas automáticas al cerrar un trato,
            notificar por WhatsApp cuando llega un pedido. Estas son las herramientas que lo hacen posible.
          </p>
        </header>

        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuestros 3 favoritos</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {TOP_TOOLS.map((tool) => (
              <Link
                key={tool.slug}
                href={`/automatizacion/${tool.slug}`}
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
          <h2 className="text-xl font-bold text-gray-900 mb-4">¿Qué es la automatización y para qué sirve en una pyme?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Las herramientas de automatización conectan dos o más aplicaciones y ejecutan acciones
            automáticamente cuando ocurre algo en una de ellas. El ejemplo más común: cuando alguien
            rellena un formulario de contacto en tu web, se crea automáticamente un lead en tu CRM,
            se manda un email de confirmación y se añade la persona a una lista de seguimiento.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Para una pyme, el valor está en eliminar el trabajo manual repetitivo que no aporta valor:
            copiar datos entre sistemas, mandar emails de seguimiento uno a uno, actualizar hojas de
            cálculo a mano. Con Make o Zapier, esas tareas se configuran una vez y se ejecutan solas.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Tiene sentido empezar a automatizar cuando identificas al menos 2-3 procesos repetitivos que
            consumen tiempo cada semana. Con las opciones gratuitas de Make y Zapier, puedes validar si
            la automatización te funciona antes de comprometerte con ningún plan de pago.
          </p>
        </section>

        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comparativa de herramientas de automatización</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Herramienta</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Plan gratuito</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Precio entrada</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">No-code</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Make', slug: 'review-make', free: '1.000 ops/mes', price: '9 €/mes', nocode: '✅' },
                  { name: 'Zapier', slug: 'review-zapier', free: '100 tareas/mes', price: '19 €/mes', nocode: '✅' },
                  { name: 'n8n', slug: 'review-n8n', free: 'Self-hosted gratis', price: '20 €/mes cloud', nocode: '⚠️ técnico' },
                  { name: 'Power Automate', slug: 'review-power-automate-pymes', free: 'Microsoft 365', price: '15 €/mes', nocode: '✅' },
                ].map((row) => (
                  <tr key={row.slug} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/automatizacion/${row.slug}`} className="text-blue-600 hover:underline">{row.name}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{row.free}</td>
                    <td className="px-4 py-3 text-gray-600">{row.price}</td>
                    <td className="px-4 py-3 text-gray-600">{row.nocode}</td>
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
              { if: 'Quieres empezar sin pagar nada y sin conocimientos técnicos', choose: 'Zapier (plan gratuito)', href: '/automatizacion/review-zapier' },
              { if: 'Necesitas volumen medio con buen precio', choose: 'Make', href: '/automatizacion/review-make' },
              { if: 'Tienes alguien técnico y quieres control total', choose: 'n8n self-hosted', href: '/automatizacion/review-n8n' },
              { if: 'Usas Microsoft 365 en tu empresa', choose: 'Power Automate', href: '/automatizacion/review-power-automate-pymes' },
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Preguntas frecuentes sobre automatización para pymes</h2>
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
