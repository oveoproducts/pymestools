/**
 * skill-research.ts
 * Research skill — generates keyword candidates from active affiliate programs.
 *
 * Modes:
 *   'keyword'   — targeted research for a specific queue item / keyword
 *   'discovery' — broad discovery run (triggered on empty queue on Monday)
 *
 * Usage: npx tsx scripts/skill-research.ts
 */

import 'dotenv/config'
import { supabase } from '../lib/db/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ResearchMode = 'keyword' | 'discovery'

export interface ResearchOptions {
  mode: ResearchMode
  queueItemId?: string | null
  keywordId?: string | null
}

interface AffiliateProgram {
  id: string
  name: string
  slug: string
  commission_type: string
  commission_rate: string
  language_support: string[]
  notes: string | null
}

interface KeywordCandidate {
  keyword: string
  search_intent: 'commercial' | 'informational' | 'navigational' | 'transactional'
  category: string
  affiliate_program_ids: string[]
  priority_score: number
  monthly_volume?: number
  difficulty?: number
}

interface ResearchResult {
  success: boolean
  keywordsInserted: number
  programs: string[]
  message: string
}

// ---------------------------------------------------------------------------
// Keyword generation patterns
// (Skeleton — replace with real web search / Anthropic API calls)
// ---------------------------------------------------------------------------

const INTENT_PATTERNS: Record<string, 'commercial' | 'informational' | 'transactional'> = {
  mejor: 'commercial',
  'mejores alternativas': 'commercial',
  alternativas: 'commercial',
  precio: 'commercial',
  gratis: 'commercial',
  comparativa: 'commercial',
  cómo: 'informational',
  'qué es': 'informational',
  tutorial: 'informational',
  guía: 'informational',
  contratar: 'transactional',
  descargar: 'transactional',
  comprar: 'transactional',
}

/**
 * Generates keyword candidates for a given affiliate program.
 * TODO: replace with Anthropic API + web search for real volume/difficulty data.
 */
function generateKeywordCandidates(program: AffiliateProgram): KeywordCandidate[] {
  const toolName = program.name.toLowerCase()
  const category = deriveCategory(program)

  const templates: Array<{ keyword: string; intent: KeywordCandidate['search_intent']; priority: number }> = [
    {
      keyword: `mejor ${toolName} para pymes`,
      intent: 'commercial',
      priority: 8,
    },
    {
      keyword: `alternativas a ${toolName} en español`,
      intent: 'commercial',
      priority: 7,
    },
    {
      keyword: `${toolName} precio y planes ${new Date().getFullYear()}`,
      intent: 'commercial',
      priority: 6,
    },
  ]

  return templates.map((t) => ({
    keyword: t.keyword,
    search_intent: t.intent,
    category,
    affiliate_program_ids: [program.id],
    priority_score: t.priority,
    // monthly_volume and difficulty to be filled by real SEO data source
  }))
}

function deriveCategory(program: AffiliateProgram): string {
  const slug = program.slug.toLowerCase()
  if (['getresponse', 'brevo', 'activecampaign'].includes(slug)) return 'email-marketing'
  if (['hubspot'].includes(slug)) return 'crm'
  if (['semrush'].includes(slug)) return 'seo'
  if (['hostinger'].includes(slug)) return 'hosting'
  if (['notion'].includes(slug)) return 'productividad'
  return 'herramientas-pymes'
}

// ---------------------------------------------------------------------------
// DB helpers
// ---------------------------------------------------------------------------

async function fetchActivePrograms(): Promise<AffiliateProgram[]> {
  const { data, error } = await supabase
    .from('affiliate_programs')
    .select('id, name, slug, commission_type, commission_rate, language_support, notes')
    .eq('active', true)

  if (error) throw new Error(`Failed to fetch programs: ${error.message}`)
  return (data ?? []) as AffiliateProgram[]
}

async function insertKeywords(candidates: KeywordCandidate[]): Promise<number> {
  if (candidates.length === 0) return 0

  const rows = candidates.map((c) => ({
    keyword: c.keyword,
    search_intent: c.search_intent,
    category: c.category,
    affiliate_program_ids: c.affiliate_program_ids,
    priority_score: c.priority_score,
    monthly_volume: c.monthly_volume ?? null,
    difficulty: c.difficulty ?? null,
    status: 'pending_approval' as const,
  }))

  const { data, error } = await supabase.from('keywords').insert(rows).select('id')
  if (error) throw new Error(`Keyword insert failed: ${error.message}`)
  return (data ?? []).length
}

async function logAgent(
  task: string,
  status: 'started' | 'completed' | 'failed',
  durationMs?: number,
  feedback?: string
): Promise<void> {
  await supabase.from('agent_logs').insert({
    agent_name: 'skill-research',
    task,
    status,
    duration_ms: durationMs,
    feedback,
  })
}

// ---------------------------------------------------------------------------
// Discovery mode
// ---------------------------------------------------------------------------

async function runDiscovery(): Promise<ResearchResult> {
  console.log('  Mode: discovery — scanning all active programs for new keyword opportunities')
  const programs = await fetchActivePrograms()
  console.log(`  Found ${programs.length} active affiliate programs`)

  const allCandidates: KeywordCandidate[] = []
  for (const program of programs) {
    const candidates = generateKeywordCandidates(program)
    console.log(`  → ${program.name}: generated ${candidates.length} keyword candidates`)
    allCandidates.push(...candidates)
  }

  const inserted = await insertKeywords(allCandidates)

  return {
    success: true,
    keywordsInserted: inserted,
    programs: programs.map((p) => p.name),
    message: `Discovery complete. Inserted ${inserted} keyword candidates for review.`,
  }
}

// ---------------------------------------------------------------------------
// Keyword mode
// ---------------------------------------------------------------------------

async function runKeywordResearch(
  options: ResearchOptions
): Promise<ResearchResult> {
  console.log(`  Mode: keyword — targeted research for queue item ${options.queueItemId}`)

  // If a specific keyword is provided, fetch its linked programs
  // Otherwise fall back to all active programs
  let programs: AffiliateProgram[]

  if (options.keywordId) {
    const { data: kw, error: kwErr } = await supabase
      .from('keywords')
      .select('affiliate_program_ids')
      .eq('id', options.keywordId)
      .single()

    if (kwErr || !kw) {
      console.warn('  ⚠️  Keyword not found, falling back to all active programs')
      programs = await fetchActivePrograms()
    } else {
      const ids: string[] = kw.affiliate_program_ids ?? []
      const { data, error } = await supabase
        .from('affiliate_programs')
        .select('id, name, slug, commission_type, commission_rate, language_support, notes')
        .in('id', ids)
        .eq('active', true)

      if (error) throw new Error(`Program fetch error: ${error.message}`)
      programs = (data ?? []) as AffiliateProgram[]
    }
  } else {
    programs = await fetchActivePrograms()
  }

  const allCandidates: KeywordCandidate[] = []
  for (const program of programs) {
    const candidates = generateKeywordCandidates(program)
    allCandidates.push(...candidates)
  }

  const inserted = await insertKeywords(allCandidates)

  return {
    success: true,
    keywordsInserted: inserted,
    programs: programs.map((p) => p.name),
    message: `Keyword research complete. ${inserted} candidates inserted.`,
  }
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function runResearch(options: ResearchOptions): Promise<ResearchResult> {
  const startedAt = Date.now()
  const task = `research:${options.mode}`

  console.log(`\n🔍  Skill Research [${options.mode}]\n`)
  await logAgent(task, 'started')

  try {
    const result =
      options.mode === 'discovery'
        ? await runDiscovery()
        : await runKeywordResearch(options)

    const durationMs = Date.now() - startedAt
    await logAgent(task, 'completed', durationMs, result.message)

    console.log(`\n✅  ${result.message}`)
    return result
  } catch (err) {
    const durationMs = Date.now() - startedAt
    const message = err instanceof Error ? err.message : String(err)
    await logAgent(task, 'failed', durationMs, message)
    console.error(`\n❌  Research error: ${message}`)
    return { success: false, keywordsInserted: 0, programs: [], message }
  }
}

// ---------------------------------------------------------------------------
// CLI entry
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const mode: ResearchMode =
    (process.argv[2] as ResearchMode) ?? 'discovery'
  const result = await runResearch({ mode })
  process.exit(result.success ? 0 : 1)
}

main()
