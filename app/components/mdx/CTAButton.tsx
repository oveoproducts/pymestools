'use client'

import { trackAffiliateClick } from '@/lib/analytics'

interface CTAButtonProps {
  href: string
  children: React.ReactNode
  affiliate?: string
}

export function CTAButton({ href, children, affiliate }: CTAButtonProps) {
  function handleClick() {
    const label = typeof children === 'string' ? children : 'CTA'
    trackAffiliateClick(affiliate ?? 'unknown', href, label)
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow noopener"
      data-affiliate={affiliate}
      onClick={handleClick}
      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors no-underline text-sm"
    >
      {children}
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  )
}
