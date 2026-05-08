import { supabase } from '@/lib/db/client'

interface Props {
  programSlug: string
  articleSlug: string
  label: string
}

export async function AffiliateLink({ programSlug, label }: Props) {
  const { data: program } = await supabase
    .from('affiliate_programs')
    .select('affiliate_url, name')
    .eq('slug', programSlug)
    .eq('active', true)
    .single()

  if (!program?.affiliate_url) return null

  return (
    <a
      href={program.affiliate_url}
      rel="nofollow noopener noreferrer"
      target="_blank"
      data-affiliate={programSlug}
      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors no-underline my-4"
    >
      {label}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>
  )
}
