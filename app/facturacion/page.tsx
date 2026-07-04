import type { Metadata } from 'next'
import Link from 'next/link'
import brand from '@/data/brand.json'
import { getArticlesByCategory } from '@/lib/db/articles'
import { ArticleCard } from '@/app/components/ArticleCard'

export const metadata: Metadata = {
  title: 'Software de facturación para pymes en España 2026',
  description:
    'Holded, Sage 50, Anfix y más: comparativa de software de facturación para pymes españolas. Verifactu, precios en euros y cuál elegir.',
  alternates: { canonical: `${brand.siteUrl}/facturacion` },
  openGraph: {
    title: 'Software de facturación para pymes en España 2026',
    description:
      'Holded, Sage 50, Anfix y más: comparativa de software de facturación para pymes españolas. Verifactu, precios en euros y cuál elegir.',
    url: `${brand.siteUrl}/facturacion`,
    siteName: brand.siteName,
    type: 'website',
    images: [{ url: `${brand.siteUrl}/api/og?title=Software+de+Facturación+para+Pymes&type=category`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Software de facturación para pymes en España 2026',
    description: 'Holded, Sage 50, Anfix y más: Verifactu, precios en euros y cuál elegir.',
    images: [`${brand.siteUrl}/api/og?title=Software+de+Facturación+para+Pymes&type=category`],
  },
}

const TOP_TOOLS = [
  {
    name: 'Holded',
    slug: 'review-holded',
    badge: 'Todo en uno',
    badgeColor: 'bg-blue-100 text-blue-800',
    price: 'Desde 29 €/mes',
    score: '7.9',
    why: 'Facturación, CRM, contabilidad e inventario en un solo sitio. Compatible con Verifactu y SII.',
  },
  {
    name: 'Sage 50',
    slug: 'review-sage-50',
    badge: 'Más completo',
    badgeColor: 'bg-purple-100 text-purple-800',
    price: 'Desde 25 €/mes',
    score: '7.5',
    why: 'El estándar para empresas con contabilidad compleja. Compatible con Verifactu y gestoría.',
  },
  {
    name: 'Anfix',
    slug: 'review-anfix',
    badge: 'Mejor precio',
    badgeColor: 'bg-green-100 text-green-800',
    price: 'Desde 9 €/mes',
    score: '7.2',
    why: 'La opción más económica para autónomos y pymes pequeñas. En la nube, sin instalación.',
  },
]

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Mejores software de facturación para pymes en España 2026',
  description:
    'Comparativa de los mejores programas de facturación para pymes españolas: Verifactu, precios y cuál elegir.',
  url: `${brand.siteUrl}/facturacion`,
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
      name: '¿Qué es Verifactu y es obligatorio para mi empresa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Verifactu es el sistema de verificación de facturas de la AEAT obligatorio desde julio 2025 para empresas en régimen general del IRPF y desde enero 2026 para el resto. Si tu software no está homologado por la AEAT, no puedes emitir facturas válidas. Holded, Sage 50, Anfix y ContaSimple ya están homologados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el software de facturación más barato para autónomos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Anfix tiene el plan más económico para autónomos: desde 9 €/mes con Verifactu incluido. ContaSimple también empieza en 10 €/mes. Si no necesitas Verifactu todavía, Factusol tiene versión gratuita para uso local.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Holded o Sage 50 para una pyme con gestoría?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de la complejidad. Si tu gestoría trabaja con Sage, Sage 50 es la opción con mejor integración. Si quieres llevar tú mismo la facturación y el inventario con más autonomía, Holded es más moderno e intuitivo, aunque requiere algo más de aprendizaje al principio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El software de facturación incluye el IVA en los precios?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los precios que publicamos son sin IVA. En España, los servicios digitales B2B tributan al 21% de IVA, así que añade ese porcentaje al precio mensual que ves en la web del proveedor.',
      },
    },
  ],
}

export default async function FacturacionPage() {
  const articles = await getArticlesByCategory('facturacion')
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
            Facturación y contabilidad para pymes
          </p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
            El mejor software de facturación para pymes en España (2026)
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Desde 2025, Verifactu es obligatorio para muchas empresas españolas. Si tu software de
            facturación no está homologado, estás en riesgo de sanción. Te explicamos qué opciones
            existen, a qué precio, y cuál encaja con tu tipo de empresa.
          </p>
        </header>

        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuestros 3 favoritos</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {TOP_TOOLS.map((tool) => (
              <Link
                key={tool.slug}
                href={`/facturacion/${tool.slug}`}
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
          <h2 className="text-xl font-bold text-gray-900 mb-4">¿Qué es el software de facturación y por qué importa en España?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            El software de facturación automatiza la emisión, envío y registro de facturas. Sustituye
            las plantillas de Word o Excel por un sistema que numera automáticamente, calcula el IVA,
            genera el PDF y guarda el histórico de clientes y cobros. La mayoría también incluye gestión
            de gastos y conciliación bancaria básica.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Desde julio de 2025, Verifactu es obligatorio para las empresas en régimen general del IRPF,
            y desde enero de 2026 para el resto. Verifactu exige que el software de facturación esté
            homologado por la AEAT y envíe los registros de facturas en tiempo real. Si emites facturas
            desde Excel o un programa no homologado, estás en incumplimiento y puedes enfrentarte a
            sanciones de la Agencia Tributaria.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Tiene sentido pagar por un software de facturación cuando emites más de 20-30 facturas al mes
            o cuando tu gestoría te pide los datos en un formato concreto. Por debajo de eso, una solución
            gratuita como Factusol puede ser suficiente, aunque sin cumplir Verifactu si no está homologado.
          </p>
        </section>

        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comparativa de software de facturación para pymes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Software</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Verifactu</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Precio</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Holded', slug: 'review-holded', verifactu: '✅', price: '29 €/mes', type: 'Todo en uno' },
                  { name: 'Sage 50', slug: 'review-sage-50', verifactu: '✅', price: '25 €/mes', type: 'Contabilidad completa' },
                  { name: 'Anfix', slug: 'review-anfix', verifactu: '✅', price: '9 €/mes', type: 'Solo facturación' },
                  { name: 'ContaSimple', slug: 'review-contasimple', verifactu: '✅', price: '10 €/mes', type: 'Solo facturación' },
                  { name: 'Factusol', slug: 'review-factusol', verifactu: 'Gratis', price: '0 €/mes', type: 'Local (no cloud)' },
                ].map((row) => (
                  <tr key={row.slug} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/facturacion/${row.slug}`} className="text-blue-600 hover:underline">{row.name}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.verifactu}</td>
                    <td className="px-4 py-3 text-gray-600">{row.price}</td>
                    <td className="px-4 py-3 text-gray-600">{row.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">Precios en facturación anual, junio 2026. Verifica en la web de cada proveedor.</p>
        </section>

        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">¿Qué software elegir según tu situación?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { if: 'Eres autónomo o tienes facturación simple', choose: 'Anfix o ContaSimple', href: '/facturacion/review-anfix' },
              { if: 'Necesitas contabilidad completa y gestoría', choose: 'Sage 50', href: '/facturacion/review-sage-50' },
              { if: 'Quieres CRM + factura + inventario todo junto', choose: 'Holded', href: '/facturacion/review-holded' },
              { if: 'Buscas algo gratuito sin Verifactu aún', choose: 'Factusol (local)', href: '/facturacion/review-factusol' },
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Comparativas de software</h2>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Preguntas frecuentes sobre software de facturación para pymes</h2>
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
