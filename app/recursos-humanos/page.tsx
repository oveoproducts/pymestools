import type { Metadata } from 'next'
import Link from 'next/link'
import brand from '@/data/brand.json'
import { getArticlesByCategory } from '@/lib/db/articles'
import { ArticleCard } from '@/app/components/ArticleCard'

export const metadata: Metadata = {
  title: 'Software de RRHH para pymes en España 2026',
  description:
    'Factorial, Sesame, Kenjo y más: comparativa de software de RRHH para pymes españolas. Control horario obligatorio, nóminas y gestión de equipos.',
  alternates: { canonical: `${brand.siteUrl}/recursos-humanos` },
  openGraph: {
    title: 'Software de RRHH para pymes en España 2026',
    description:
      'Factorial, Sesame, Kenjo y más: comparativa de software de RRHH para pymes españolas. Control horario obligatorio, nóminas y gestión de equipos.',
    url: `${brand.siteUrl}/recursos-humanos`,
    siteName: brand.siteName,
    type: 'website',
    images: [{ url: `${brand.siteUrl}/api/og?title=Software+de+RRHH+para+Pymes&type=category`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Software de RRHH para pymes en España 2026',
    description: 'Factorial, Sesame, Kenjo y más: control horario, nóminas y gestión de equipos.',
    images: [`${brand.siteUrl}/api/og?title=Software+de+RRHH+para+Pymes&type=category`],
  },
}

const TOP_TOOLS = [
  {
    name: 'Factorial',
    slug: 'review-factorial',
    badge: 'Hecho en España',
    badgeColor: 'bg-red-100 text-red-800',
    price: 'Desde 5 €/empleado/mes',
    score: '8.0',
    why: 'Sede en Barcelona. Control horario, vacaciones, documentos y nóminas en un solo sitio. Cumple con el RDL 8/2019.',
  },
  {
    name: 'Sesame',
    slug: 'review-sesame',
    badge: 'Mejor control horario',
    badgeColor: 'bg-blue-100 text-blue-800',
    price: 'Desde 3 €/empleado/mes',
    score: '7.6',
    why: 'El más sencillo para cumplir con el registro horario obligatorio. Fichaje por app, web o código QR.',
  },
  {
    name: 'Kenjo',
    slug: 'review-kenjo',
    badge: 'Más completo',
    badgeColor: 'bg-purple-100 text-purple-800',
    price: 'Desde 4 €/empleado/mes',
    score: '7.4',
    why: 'RRHH completo para pymes en crecimiento: onboarding, evaluaciones y gestión documental digital.',
  },
]

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Mejores software de RRHH para pymes en España 2026',
  description:
    'Comparativa de los mejores programas de recursos humanos para pymes españolas: control horario, nóminas y gestión de equipos.',
  url: `${brand.siteUrl}/recursos-humanos`,
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
      name: '¿Es obligatorio el control horario en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El Real Decreto-ley 8/2019 obliga a todas las empresas a registrar la jornada laboral de sus empleados desde mayo de 2019. Las sanciones por incumplimiento van de 626 € a 6.250 €. El registro debe conservarse durante 4 años y estar disponible para la Inspección de Trabajo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta el software de RRHH para una pyme de 10 personas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Entre 30 y 80 €/mes para un equipo de 10 personas, dependiendo de las funcionalidades. Sesame sale a unos 30 €/mes para control horario básico. Factorial con nóminas integradas ronda los 50 €/mes. Kenjo y Bizneo están en rangos similares. Todos tienen prueba gratuita de 14-30 días.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Factorial o Sesame para una empresa española?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sesame es más sencillo y más barato si solo necesitas control horario y gestión básica de vacaciones. Factorial es más completo: incluye nóminas, documentos, firma digital y onboarding. Para pymes en crecimiento con más necesidades de RRHH, Factorial es la mejor opción; para equipos que solo quieren cumplir con el registro horario, Sesame.',
      },
    },
  ],
}

export default async function RecursosHumanosPage() {
  const articles = await getArticlesByCategory('recursos-humanos')
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
            Recursos humanos para pymes
          </p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
            El mejor software de RRHH para pymes en España (2026)
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            El control horario es obligatorio en España desde el Real Decreto-ley 8/2019. Una multa
            por incumplimiento puede llegar a 6.250 €. Pero más allá del cumplimiento, el software de
            RRHH moderno también simplifica nóminas, vacaciones y onboarding para equipos de 3 a 100 personas.
          </p>
        </header>

        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuestros 3 favoritos</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {TOP_TOOLS.map((tool) => (
              <Link
                key={tool.slug}
                href={`/recursos-humanos/${tool.slug}`}
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
          <h2 className="text-xl font-bold text-gray-900 mb-4">¿Qué es el software de RRHH y por qué lo necesita tu pyme?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            El software de recursos humanos digitaliza los procesos de gestión de personas: registro
            horario, gestión de vacaciones y ausencias, nóminas, documentos laborales, onboarding y
            evaluaciones de desempeño. Sustituye las hojas de cálculo, los emails de petición de
            vacaciones y los registros en papel que siguen usando muchas pymes.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            En España, la principal razón para adoptar un software de RRHH es el cumplimiento legal.
            El RDL 8/2019 obliga a todas las empresas a llevar un registro diario de la jornada de cada
            empleado, conservarlo 4 años y tenerlo disponible para la Inspección de Trabajo. La multa
            mínima por incumplimiento es 626 € y puede llegar a 6.250 € por infracción grave.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Más allá del cumplimiento, tiene sentido adoptar un software de RRHH cuando tienes 5 o más
            empleados y el volumen de gestión administrativa empieza a consumir horas de trabajo que
            podrían dedicarse a otra cosa. Con 3-4 personas, una hoja de cálculo puede seguir siendo
            suficiente para el control básico.
          </p>
        </section>

        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comparativa de software de RRHH para pymes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Software</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Control horario</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Precio/empleado</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Nóminas</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Factorial', slug: 'review-factorial', horario: '✅', price: '5 €/emp', nominas: 'Sí (integrado)' },
                  { name: 'Sesame', slug: 'review-sesame', horario: '✅', price: '3 €/emp', nominas: 'Vía gestoría' },
                  { name: 'Kenjo', slug: 'review-kenjo', horario: '✅', price: '4 €/emp', nominas: 'Sí' },
                  { name: 'Bizneo', slug: 'review-bizneo', horario: '✅', price: '4 €/emp', nominas: 'Sí' },
                ].map((row) => (
                  <tr key={row.slug} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/recursos-humanos/${row.slug}`} className="text-blue-600 hover:underline">{row.name}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.horario}</td>
                    <td className="px-4 py-3 text-gray-600">{row.price}</td>
                    <td className="px-4 py-3 text-gray-600">{row.nominas}</td>
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
              { if: 'Solo necesitas control horario para cumplir la ley', choose: 'Sesame (más barato)', href: '/recursos-humanos/review-sesame' },
              { if: 'Quieres RRHH completo con nóminas integradas', choose: 'Factorial', href: '/recursos-humanos/review-factorial' },
              { if: 'Tu empresa está creciendo y necesitas onboarding y evaluaciones', choose: 'Kenjo', href: '/recursos-humanos/review-kenjo' },
              { if: 'Tienes gestoría y solo necesitas digitalizar vacaciones y documentos', choose: 'Bizneo', href: '/recursos-humanos/review-bizneo' },
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Preguntas frecuentes sobre software de RRHH para pymes</h2>
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
