import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import brand from '@/data/brand.json'
import { brandedTitle } from '@/lib/seo/meta-title'
import { getArticlesByCategory, getArticlesByType } from '@/lib/db/articles'
import { ArticleCard } from '@/app/components/ArticleCard'

const VALID_CATEGORIES = [
  'email-marketing',
  'crm',
  'automatizacion',
  'comparativas',
  'facturacion',
  'recursos-humanos',
  'gestion-proyectos',
  'seo',
  'productividad',
  'hosting',
  'prompts',
] as const

type ValidCategory = (typeof VALID_CATEGORIES)[number]

const CATEGORY_LABELS: Record<ValidCategory, string> = {
  'email-marketing': 'Email Marketing',
  crm: 'CRM',
  automatizacion: 'Automatización',
  comparativas: 'Comparativas',
  facturacion: 'Facturación',
  'recursos-humanos': 'Recursos Humanos',
  'gestion-proyectos': 'Gestión de Proyectos',
  seo: 'SEO',
  productividad: 'Productividad',
  hosting: 'Hosting',
  prompts: 'Prompts para pymes',
}

const CATEGORY_DESCRIPTIONS: Record<ValidCategory, string> = {
  'email-marketing':
    'Comparativas y reviews de las mejores herramientas de email marketing para pymes españolas.',
  crm: 'Guías y comparativas de CRM para pequeñas y medianas empresas en España.',
  automatizacion:
    'Las mejores herramientas de automatización de marketing para pymes.',
  comparativas:
    'Comparativas detalladas de software de marketing y ventas para pymes.',
  facturacion:
    'Reviews y comparativas del mejor software de facturación para pymes españolas.',
  'recursos-humanos':
    'Herramientas de gestión de recursos humanos y RRHH para pymes en España.',
  'gestion-proyectos':
    'Reviews y comparativas de herramientas de gestión de proyectos para pymes españolas.',
  seo: 'Herramientas de SEO y posicionamiento web para pymes españolas.',
  productividad:
    'Reviews y comparativas de herramientas de productividad para pymes en España.',
  hosting:
    'Guías y comparativas de hosting y alojamiento web para pymes españolas.',
  prompts:
    'Prompts de ChatGPT para pymes y autónomos: ventas, atención al cliente, marketing y administración.',
}

interface HubContent {
  title: string
  description: string
  h1: string
  intro: ReactNode
}

// Category hubs served by this dynamic route. The ones with their own
// app/<category>/page.tsx never reach it.
const HUBS: Partial<Record<ValidCategory, HubContent>> = {
  seo: {
    title: 'Herramientas SEO para pymes: Semrush y alternativas',
    description:
      'Herramientas SEO para pymes españolas: cómo funciona Semrush, alternativas más baratas y qué plan elegir, con precios verificados en euros.',
    h1: 'Herramientas SEO para pymes en España',
    intro: (
      <>
        <p>
          El SEO de pago no es para todos los negocios: una suite como Semrush cuesta más de 100 € al mes
          y muchas pymes solo necesitan seguir unas pocas palabras clave. Aquí comparamos las opciones con
          los precios publicados por cada proveedor y te decimos para quién compensa cada una.
        </p>
        <p>
          Empieza por las <Link href="/seo/alternativas-a-semrush-en-espanol" className="text-blue-600 hover:underline">alternativas a Semrush</Link> si
          buscas algo más barato, o por el{' '}
          <Link href="/seo/como-funciona-semrush-tutorial-espanol" className="text-blue-600 hover:underline">tutorial de Semrush</Link> si ya
          lo usas. Los precios los comprobamos en las webs oficiales y mostramos la fecha:{' '}
          <Link href="/como-verificamos-los-precios" className="text-blue-600 hover:underline">así lo hacemos</Link>.
        </p>
      </>
    ),
  },
  hosting: {
    title: 'Hosting para pymes: Hostinger y alternativas',
    description:
      'Hosting para pymes y autónomos en España: precios y planes de Hostinger, alternativas con soporte en español y guías para conectarlo con tu software.',
    h1: 'Hosting para pymes y autónomos en España',
    intro: (
      <>
        <p>
          Elegir hosting no es solo mirar el precio del primer año: cuentan la renovación, el soporte en
          español, las copias de seguridad y dónde se alojan los datos. Reunimos las guías de Hostinger y
          sus alternativas con los precios publicados por cada proveedor.
        </p>
        <p>
          Si dudas entre proveedores, empieza por las{' '}
          <Link href="/hosting/alternativas-a-hostinger-en-espanol" className="text-blue-600 hover:underline">alternativas a Hostinger</Link>; si
          ya lo tienes, mira los{' '}
          <Link href="/hosting/hostinger-precio-y-planes-2026" className="text-blue-600 hover:underline">precios y planes de Hostinger</Link>.
          Los importes se verifican en las webs oficiales:{' '}
          <Link href="/como-verificamos-los-precios" className="text-blue-600 hover:underline">cómo lo hacemos</Link>.
        </p>
      </>
    ),
  },
  productividad: {
    title: 'Notion y herramientas de productividad para pymes',
    description:
      'Guías sobre Notion y sus alternativas para pymes españolas: precios y planes, qué incluye el plan gratuito y cómo conectarlo con Holded o Factorial.',
    h1: 'Notion y herramientas de productividad para pymes',
    intro: (
      <>
        <p>
          Notion sirve para centralizar documentación, proyectos y procesos, pero no encaja en todos los
          equipos. Estas guías te ayudan a decidir si te compensa, cuánto cuesta de verdad para tu número
          de usuarios y qué alternativas hay.
        </p>
        <p>
          Puedes empezar por los{' '}
          <Link href="/productividad/notion-precio-y-planes-2026" className="text-blue-600 hover:underline">precios y planes de Notion</Link>,
          la <Link href="/productividad/notion-gratis-pymes-espana" className="text-blue-600 hover:underline">guía del plan gratuito</Link> o
          las <Link href="/productividad/alternativas-a-notion-en-espanol" className="text-blue-600 hover:underline">alternativas a Notion</Link>.
        </p>
      </>
    ),
  },
  comparativas: {
    title: 'Comparativas de software para pymes: A contra B',
    description:
      'Comparativas cara a cara de software para pymes españolas: CRM, email marketing, facturación y automatización, con precios verificados y para quién encaja cada uno.',
    h1: 'Comparativas de software para pymes',
    intro: (
      <>
        <p>
          Cuando ya tienes dos candidatos, lo que necesitas es una comparación directa: precio real, qué
          incluye cada plan, límites y para qué tipo de negocio encaja cada uno. Estas son nuestras
          comparativas cara a cara.
        </p>
        <p>
          Entre las más consultadas:{' '}
          <Link href="/crm/pipedrive-vs-hubspot" className="text-blue-600 hover:underline">Pipedrive vs HubSpot</Link>,{' '}
          <Link href="/facturacion/holded-vs-sage" className="text-blue-600 hover:underline">Holded vs Sage</Link> y{' '}
          <Link href="/email-marketing/brevo-vs-mailchimp" className="text-blue-600 hover:underline">Brevo vs Mailchimp</Link>.
          Todos los precios se comprueban en las webs oficiales:{' '}
          <Link href="/como-verificamos-los-precios" className="text-blue-600 hover:underline">cómo lo hacemos</Link>.
        </p>
      </>
    ),
  },
}

interface PageProps {
  params: Promise<{ category: string }>
}

export function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({ category }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params

  if (!VALID_CATEGORIES.includes(category as ValidCategory)) {
    return { title: 'Categoría no encontrada' }
  }

  const cat = category as ValidCategory
  const label = CATEGORY_LABELS[cat]
  const hub = HUBS[cat]
  const description = hub?.description ?? CATEGORY_DESCRIPTIONS[cat]
  const title = hub?.title ?? `${label} para pymes`
  const canonicalUrl = `${brand.siteUrl}/${category}`

  return {
    title: brandedTitle(title),
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: brand.siteName,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params

  if (!VALID_CATEGORIES.includes(category as ValidCategory)) {
    notFound()
  }

  const cat = category as ValidCategory
  const label = CATEGORY_LABELS[cat]
  const hub = HUBS[cat]
  const description = hub?.description ?? CATEGORY_DESCRIPTIONS[cat]

  const articles = category === 'comparativas'
    ? await getArticlesByType('comparison')
    : await getArticlesByCategory(category)

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Category header */}
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          {hub?.h1 ?? label}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">{description}</p>
        {hub?.intro && (
          <div className="mt-6 max-w-2xl space-y-3 text-gray-700 leading-relaxed">{hub.intro}</div>
        )}
      </header>

      {articles.length === 0 ? (
        <p className="text-gray-500">
          No hay artículos publicados en esta categoría todavía.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
