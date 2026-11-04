/**
 * enable-rls.ts
 * Enables Row Level Security on all Supabase tables and adds minimal
 * read-only policies for tables that need public access.
 *
 * The app uses SUPABASE_SERVICE_KEY (bypasses RLS) for all server queries,
 * so enabling RLS doesn't break anything — it just closes the anon-key hole.
 *
 * Usage: npx tsx --env-file=.env.local scripts/enable-rls.ts
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  { auth: { persistSession: false } }
)

async function sql(query: string, label: string) {
  const { error } = await supabase.rpc('exec_sql', { sql: query })
  if (error) throw new Error(`[${label}] ${error.message}`)
  console.log(`  ✅  ${label}`)
}

async function main() {
  console.log('\n🔒  Enabling RLS on all tables\n')

  // 1. Enable RLS on every table
  const tables = [
    'articles',
    'affiliate_programs',
    'keywords',
    'pipeline_queue',
    'agent_logs',
    'content_metrics',
  ]

  for (const table of tables) {
    await sql(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`, `RLS on ${table}`)
  }

  // 2. Public read-only policies (anon key can only SELECT published/active rows)
  await sql(`
    DROP POLICY IF EXISTS "public_read_published_articles" ON public.articles;
    CREATE POLICY "public_read_published_articles"
      ON public.articles
      FOR SELECT
      TO anon
      USING (status = 'published');
  `, 'Policy: articles → anon SELECT published only')

  await sql(`
    DROP POLICY IF EXISTS "public_read_active_affiliates" ON public.affiliate_programs;
    CREATE POLICY "public_read_active_affiliates"
      ON public.affiliate_programs
      FOR SELECT
      TO anon
      USING (active = true);
  `, 'Policy: affiliate_programs → anon SELECT active only')

  // 3. No anon policies for internal tables
  // (keywords, pipeline_queue, agent_logs, content_metrics — service role only)
  console.log('\n  ℹ️  Internal tables (keywords, pipeline_queue, agent_logs, content_metrics)')
  console.log('     No anon policies → only accessible via service role key\n')

  console.log('✅  RLS fully enabled. Supabase security advisor should clear within 24h.\n')
}

main().catch(err => {
  console.error('❌', err.message)
  process.exit(1)
})
