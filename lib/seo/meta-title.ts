/**
 * meta-title.ts
 * Builds a meta title that fits Google's display width.
 *
 * The previous implementation hard-sliced at 55 chars and appended an ellipsis,
 * so 26 published pages shipped titles like
 *   "Cómo implementar un CRM en tu pyme sin errores: guía pa… (2026)"
 * Google renders that verbatim — a broken title on a page that already ranks.
 * Shorten by dropping whole parts, never by cutting a word in half.
 */

export const META_TITLE_MAX = 60

/** Strips an existing year and the punctuation artefacts removing it leaves. */
export function stripYear(title: string): string {
  return title
    .replace(/\s*[([]?\b(20\d{2})\b[)\]]?/g, '')
    // "…para pymes en 2026: guía" would otherwise become "…para pymes en: guía"
    .replace(/\s+\b(en|de|del|para|the)\s*:/gi, ':')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([:,.])/g, '$1')
    .replace(/[\s:–-]+$/, '')
    .trim()
}

/** Words that must not be left dangling at the end of a truncated title. */
const TRAILING_STOPWORDS =
  /\s+\b(a|al|ante|con|contra|de|del|desde|el|en|entre|hacia|hasta|la|las|lo|los|para|por|según|sin|sobre|tras|un|una|unos|unas|y|o|u|e|que|más)\b[\s:,.–-]*$/i

/** Truncates at a word boundary. Used only when every structural option fails. */
function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  let out = (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s:,–-]+$/, '')
  // "…para pymes en España" cut at 60 leaves "…para pymes en", which reads as
  // an error in the SERP. Drop dangling function words until it reads cleanly.
  let prev = ''
  while (prev !== out) {
    prev = out
    out = out.replace(TRAILING_STOPWORDS, '')
  }
  return out.replace(/[\s:,–-]+$/, '')
}

/**
 * Returns the longest candidate that fits, preferring to keep the year (it
 * signals freshness in the SERP) and dropping the subtitle before anything else.
 */
export function buildMetaTitle(title: string, year = String(new Date().getFullYear())): string {
  const clean = stripYear(title)
  const beforeColon = stripYear(clean.split(/[:–]/)[0] ?? clean).trim()

  // Dropping the subtitle only helps when what remains still describes the
  // page. "TicketBAI: qué es y obligaciones…" would otherwise collapse to the
  // bare product name, which says nothing to someone scanning results.
  const MIN_STANDALONE = 25
  const subtitleUsable = beforeColon.length >= MIN_STANDALONE

  const candidates = [
    `${clean} (${year})`,
    clean,
    subtitleUsable ? `${beforeColon} (${year})` : '',
    subtitleUsable ? beforeColon : '',
  ].filter(Boolean)

  for (const c of candidates) {
    if (c.length <= META_TITLE_MAX) return c
  }

  return truncateAtWord(clean, META_TITLE_MAX)
}
