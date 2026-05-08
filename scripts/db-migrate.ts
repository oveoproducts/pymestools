/**
 * db-migrate.ts
 * Runs SQL migrations against Supabase, creating all core tables.
 * Usage: npx tsx scripts/db-migrate.ts
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Bootstrap a service-role client (bypasses RLS)
// ---------------------------------------------------------------------------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Executes a raw SQL statement via the Supabase REST API.
 * Requires the `exec_sql` Postgres function to exist in the public schema:
 *
 *   CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS void
 *   LANGUAGE plpgsql SECURITY DEFINER AS $$
 *   BEGIN EXECUTE sql; END;
 *   $$;
 *
 * If your Supabase project doesn't have that function you can create it once
 * in the SQL editor, or switch to the pg REST endpoint approach below.
 */
async function execSQL(sql: string, label: string): Promise<void> {
  const { error } = await supabase.rpc('exec_sql', { sql })
  if (error) {
    throw new Error(`Migration failed [${label}]: ${error.message}`)
  }
  console.log(`  ✔  ${label}`)
}

// ---------------------------------------------------------------------------
// Migration definitions
// ---------------------------------------------------------------------------

const migrations: Array<{ label: string; sql: string }> = [
  {
    label: 'affiliate_programs',
    sql: `
      CREATE TABLE IF NOT EXISTS affiliate_programs (
        id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        name             text        NOT NULL,
        slug             text        UNIQUE NOT NULL,
        commission_type  text        NOT NULL CHECK (commission_type IN ('recurring','one-time','mixed')),
        commission_rate  text        NOT NULL,
        cookie_days      int         NOT NULL,
        affiliate_url    text        NOT NULL,
        active           boolean     NOT NULL DEFAULT true,
        language_support text[]      DEFAULT '{es}',
        last_verified    date        NOT NULL DEFAULT current_date,
        notes            text,
        created_at       timestamptz DEFAULT now()
      );
    `,
  },
  {
    label: 'keywords',
    sql: `
      CREATE TABLE IF NOT EXISTS keywords (
        id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        keyword               text        NOT NULL,
        search_intent         text        CHECK (search_intent IN ('commercial','informational','navigational','transactional')),
        monthly_volume        int,
        difficulty            int         CHECK (difficulty BETWEEN 1 AND 100),
        priority_score        int         CHECK (priority_score BETWEEN 1 AND 10),
        status                text        DEFAULT 'pending_approval'
                                          CHECK (status IN ('pending_approval','approved','rejected','in_progress','published')),
        affiliate_program_ids uuid[],
        category              text,
        created_at            timestamptz DEFAULT now()
      );
    `,
  },
  {
    label: 'articles',
    sql: `
      CREATE TABLE IF NOT EXISTS articles (
        id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        title                text        NOT NULL,
        slug                 text        UNIQUE NOT NULL,
        category             text        NOT NULL,
        type                 text        NOT NULL CHECK (type IN ('review','comparison','top-list','how-to','alternatives')),
        keyword_id           uuid        REFERENCES keywords(id),
        meta_title           text,
        meta_description     text,
        schema_markup        jsonb,
        quality_score        numeric(3,1),
        quality_feedback     text,
        aeo_warnings         jsonb,
        status               text        DEFAULT 'draft'
                                         CHECK (status IN ('draft','qa_review','seo_review','ready_to_publish','published','unpublished','failed','awaiting_human')),
        author               text        DEFAULT 'Equipo PymesTools',
        reading_time_minutes int,
        tools                text[],
        keywords_primary     text,
        published_at         timestamptz,
        updated_at           timestamptz DEFAULT now(),
        created_at           timestamptz DEFAULT now()
      );
    `,
  },
  {
    label: 'affiliate_links',
    sql: `
      CREATE TABLE IF NOT EXISTS affiliate_links (
        id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        program_id   uuid        NOT NULL REFERENCES affiliate_programs(id),
        url          text        NOT NULL,
        anchor_text  text        NOT NULL,
        article_id   uuid        REFERENCES articles(id),
        clicks       int         DEFAULT 0,
        created_at   timestamptz DEFAULT now()
      );
    `,
  },
  {
    label: 'pipeline_queue',
    sql: `
      CREATE TABLE IF NOT EXISTS pipeline_queue (
        id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        keyword_id    uuid        REFERENCES keywords(id),
        article_id    uuid        REFERENCES articles(id),
        type          text        NOT NULL,
        status        text        DEFAULT 'pending'
                                  CHECK (status IN ('pending','researching','drafting','qa_review','seo_review','awaiting_human','ready_to_publish','published','failed')),
        priority      int         DEFAULT 5,
        error_message text,
        created_at    timestamptz DEFAULT now(),
        updated_at    timestamptz DEFAULT now(),
        completed_at  timestamptz
      );
    `,
  },
  {
    label: 'content_metrics',
    sql: `
      CREATE TABLE IF NOT EXISTS content_metrics (
        id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        article_id        uuid        NOT NULL REFERENCES articles(id),
        impressions       int         DEFAULT 0,
        clicks            int         DEFAULT 0,
        avg_position      numeric(4,1),
        affiliate_clicks  int         DEFAULT 0,
        estimated_revenue numeric(8,2) DEFAULT 0,
        recorded_at       date        NOT NULL DEFAULT current_date
      );
    `,
  },
  {
    label: 'agent_logs',
    sql: `
      CREATE TABLE IF NOT EXISTS agent_logs (
        id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_name  text        NOT NULL,
        task        text        NOT NULL,
        status      text        NOT NULL,
        score       numeric(3,1),
        feedback    text,
        duration_ms int,
        created_at  timestamptz DEFAULT now()
      );
    `,
  },
  {
    label: 'tool_candidates',
    sql: `
      CREATE TABLE IF NOT EXISTS tool_candidates (
        id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        name                text        NOT NULL,
        url                 text        NOT NULL,
        description         text,
        category            text,
        has_affiliate       boolean     DEFAULT false,
        affiliate_url       text,
        affiliate_commission text,
        score               int         CHECK (score BETWEEN 1 AND 10),
        source              text,
        raw_data            jsonb,
        status              text        DEFAULT 'pending_approval',
        created_at          timestamptz DEFAULT now()
      );
    `,
  },
]

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function migrate(): Promise<void> {
  console.log('\n🗄️   PymesTools — DB Migration\n')

  for (const { label, sql } of migrations) {
    await execSQL(sql.trim(), label)
  }

  console.log('\n✅  All tables created (or already exist).\n')
}

async function main(): Promise<void> {
  try {
    await migrate()
    process.exit(0)
  } catch (err) {
    console.error('\n❌  Migration error:', err)
    process.exit(1)
  }
}

main()
