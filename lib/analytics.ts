declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function trackScrollDepth(
  milestone: number,
  pageSlug: string,
  contentType: string,
): void {
  try {
    if (typeof window === 'undefined') return
    if (typeof window.gtag !== 'function') return

    window.gtag('event', 'scroll_depth', {
      event_category: 'engagement',
      event_label: pageSlug,
      value: milestone,
      content_type: contentType,
    })
  } catch {
    // never throw from analytics
  }
}

export function trackAffiliateClick(
  program: string,
  href: string,
  label: string,
): void {
  try {
    if (typeof window === 'undefined') return
    if (typeof window.gtag !== 'function') return

    window.gtag('event', 'affiliate_click', {
      event_category: 'affiliate',
      event_label: label,
      affiliate_program: program,
      outbound_url: href,
    })
  } catch {
    // never throw from analytics
  }
}

export function trackNewsletterSignup(source: string): void {
  try {
    if (typeof window === 'undefined') return
    if (typeof window.gtag !== 'function') return

    window.gtag('event', 'newsletter_signup', {
      event_category: 'engagement',
      event_label: source,
    })
  } catch {
    // never throw from analytics
  }
}
