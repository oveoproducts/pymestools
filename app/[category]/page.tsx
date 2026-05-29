import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import brand from '@/data/brand.json'
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
  const description = CATEGORY_DESCRIPTIONS[cat]
  const title = `Mejor ${label.toLowerCase()} para pymes | ${brand.displayName}`
  const canonicalUrl = `${brand.siteUrl}/${category}`

  return {
    title,
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
  const description = CATEGORY_DESCRIPTIONS[cat]

  const articles = category === 'comparativas'
    ? await getArticlesByType('comparison')
    : await getArticlesByCategory(category)

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Category header */}
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          {label}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">{description}</p>
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
