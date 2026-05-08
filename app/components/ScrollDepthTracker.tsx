'use client'

import { useEffect, useRef } from 'react'
import { trackScrollDepth } from '@/lib/analytics'

interface Props {
  pageSlug: string
  contentType: 'article' | 'comparativa'
}

export function ScrollDepthTracker({ pageSlug, contentType }: Props) {
  const fired = useRef<Set<number>>(new Set())

  useEffect(() => {
    const milestones = [25, 50, 75, 90] as const

    function onScroll() {
      const scrolled = window.scrollY + window.innerHeight
      const total = document.documentElement.scrollHeight
      if (total <= window.innerHeight) return
      const percent = Math.round((scrolled / total) * 100)

      for (const milestone of milestones) {
        if (percent >= milestone && !fired.current.has(milestone)) {
          fired.current.add(milestone)
          trackScrollDepth(milestone, pageSlug, contentType)
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [pageSlug, contentType])

  return null
}
