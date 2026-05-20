import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Metadata } from 'next'
import Link from 'next/link'
import brand from '@/data/brand.json'
import {
  getArticleBySlug,
  getPublishedArticles,
  getArticlesByCategory,
} from '@/lib/db/articles'
import { ScrollDepthTracker } from '@/app/components/ScrollDepthTracker'
import { ArticleCard } from '@/app/components/ArticleCard'
import {
  CTAButton,
  Callout,
  ScoreCard,
  PriceTable,
  ProsCons,
} from '@/app/components/mdx'
import { AffiliateLink } from '@/app/components/mdx/AffiliateLink'

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

const MDX_COMPONENTS = {
  CTAButton,
  Callout,
  ScoreCard,
  PriceTable,
  ProsCons,
  AffiliateLink,
}

interface PageProps {
  params: Promise<{ category: string; slug: string }>
}

export async function generateStaticParams() {
  const articles = await getPublishedArticles()

  return articles
    .filter((a) => VALID_CATEGORIES.includes(normaliseCategory(a.category) as ValidCategory))
    .map((a) => ({ category: normaliseCategory(a.category), slug: a.slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category, slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article || normaliseCategory(article.category) !== category) {
    return { title: 'Artículo no encontrado' }
  }

  // Strip trailing "| PymesTools" suffix if present — layout template adds it automatically
  const rawTitle = article.meta_title ?? article.title
  const title = rawTitle.replace(/\s*\|\s*PymesTools\s*$/i, '')
  const description = article.meta_description ?? article.description ?? ''
  const canonicalUrl = `${brand.siteUrl}/${category}/${slug}`
  const ogImageUrl = `${brand.siteUrl}/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&type=${encodeURIComponent(article.type)}`

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: brand.siteName,
      type: 'article',
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at ?? undefined,
      authors: article.author ? [article.author] : undefined,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  }
}

function getMdxContent(slug: string): string | null {
  const filePath = path.join(process.cwd(), 'content', 'articles', `${slug}.mdx`)

  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { content } = matter(raw)

  return content
}

function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

type ArticleType =
  | 'review'
  | 'comparativa'
  | 'guia'
  | 'tutorial'
  | string

const TYPE_LABELS: Record<string, string> = {
  review: 'Review',
  comparativa: 'Comparativa',
  comparison: 'Comparativa',
  'top-list': 'Top Lista',
  alternatives: 'Alternativas',
  alternativas: 'Alternativas',
  guia: 'Guía',
  tutorial: 'Tutorial',
  'how-to': 'Guía',
}

const TYPE_COLORS: Record<string, string> = {
  review: 'bg-blue-100 text-blue-800',
  comparativa: 'bg-purple-100 text-purple-800',
  comparison: 'bg-purple-100 text-purple-800',
  'top-list': 'bg-amber-100 text-amber-800',
  alternatives: 'bg-teal-100 text-teal-800',
  alternativas: 'bg-teal-100 text-teal-800',
  guia: 'bg-green-100 text-green-800',
  'how-to': 'bg-green-100 text-green-800',
  tutorial: 'bg-orange-100 text-orange-800',
}

function normaliseCategory(cat: string): string {
  return cat.replace(/_/g, '-')
}

export default async function ArticlePage({ params }: PageProps) {
  const { category, slug } = await params

  if (!VALID_CATEGORIES.includes(category as ValidCategory)) {
    notFound()
  }

  const article = await getArticleBySlug(slug)

  if (!article || normaliseCategory(article.category) !== category) {
    notFound()
  }

  const mdxContent = getMdxContent(slug)

  const relatedArticles = (await getArticlesByCategory(category, 4)).filter(
    (a) => a.slug !== slug,
  ).slice(0, 3)

  const categoryLabel =
    CATEGORY_LABELS[category as ValidCategory] ?? category

  const typeBadgeClass =
    TYPE_COLORS[article.type] ?? 'bg-gray-100 text-gray-800'
  const typeLabel = TYPE_LABELS[article.type] ?? article.type

  const articleUrl = `${brand.siteUrl}/${category}/${slug}`

  const jsonLdBlogPosting = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description ?? '',
    url: articleUrl,
    datePublished: article.published_at ?? undefined,
    dateModified: article.updated_at ?? undefined,
    author: {
      '@type': 'Organization',
      name: article.author ?? brand.authorName,
      url: brand.siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: brand.siteName,
      url: brand.siteUrl,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
    image: `${brand.siteUrl}/api/og?title=${encodeURIComponent(article.title)}&type=${encodeURIComponent(article.type)}`,
  }

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: brand.siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryLabel,
        item: `${brand.siteUrl}/${category}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: articleUrl,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBlogPosting) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      <ScrollDepthTracker
        pageSlug={slug}
        contentType={article.type === 'comparativa' ? 'comparativa' : 'article'}
      />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-gray-700 transition-colors">
                Inicio
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/${category}`}
                className="hover:text-gray-700 transition-colors capitalize"
              >
                {categoryLabel}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 font-medium truncate max-w-xs">
              {article.title}
            </li>
          </ol>
        </nav>

        {/* Article header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${typeBadgeClass}`}
            >
              {typeLabel}
            </span>

            {article.reading_time_minutes && (
              <span className="text-sm text-gray-500">
                {article.reading_time_minutes} min de lectura
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
            {article.title}
          </h1>

          {article.description && (
            <p className="text-lg text-gray-600 leading-relaxed">
              {article.description}
            </p>
          )}

          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
            {article.published_at && (
              <time dateTime={article.published_at}>
                Publicado el {formatDate(article.published_at)}
              </time>
            )}
            {article.updated_at &&
              article.updated_at !== article.published_at && (
                <time dateTime={article.updated_at}>
                  Actualizado el {formatDate(article.updated_at)}
                </time>
              )}
          </div>
        </header>

        {/* MDX content */}
        {mdxContent ? (
          <article className="prose prose-gray max-w-none">
            <MDXRemote
              source={mdxContent}
              components={MDX_COMPONENTS}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                },
              }}
            />
          </article>
        ) : (
          <p className="text-gray-500 italic">Contenido no disponible.</p>
        )}
      </div>

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <section className="bg-gray-50 border-t border-gray-100 mt-12 py-12">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Artículos relacionados
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((related) => (
                <ArticleCard key={related.id} article={related} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
