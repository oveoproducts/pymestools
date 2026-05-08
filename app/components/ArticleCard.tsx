import Link from 'next/link'

interface ArticleCardProps {
  article: {
    title: string
    slug: string
    category: string
    type: string
    meta_description: string | null
    reading_time_minutes: number | null
    published_at: string | null
  }
}

const TYPE_LABELS: Record<string, string> = {
  review: 'Review',
  comparativa: 'Comparativa',
  guia: 'Guía',
  tutorial: 'Tutorial',
}

const TYPE_COLORS: Record<string, string> = {
  review: 'bg-blue-100 text-blue-800',
  comparativa: 'bg-purple-100 text-purple-800',
  guia: 'bg-green-100 text-green-800',
  tutorial: 'bg-orange-100 text-orange-800',
}

function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function ArticleCard({ article }: ArticleCardProps) {
  const typeBadgeClass =
    TYPE_COLORS[article.type] ?? 'bg-gray-100 text-gray-800'
  const typeLabel = TYPE_LABELS[article.type] ?? article.type

  return (
    <Link
      href={`/${article.category}/${article.slug}`}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {/* Type badge */}
      <span
        className={`self-start inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide mb-3 ${typeBadgeClass}`}
      >
        {typeLabel}
      </span>

      {/* Title */}
      <h3 className="text-base font-semibold text-gray-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors">
        {article.title}
      </h3>

      {/* Description excerpt */}
      {article.meta_description && (
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4 flex-1">
          {article.meta_description}
        </p>
      )}

      {/* Meta row */}
      <div className="flex items-center justify-between mt-auto text-xs text-gray-400">
        {article.reading_time_minutes && (
          <span>{article.reading_time_minutes} min</span>
        )}
        {article.published_at && (
          <time dateTime={article.published_at}>
            {formatDate(article.published_at)}
          </time>
        )}
      </div>
    </Link>
  )
}
