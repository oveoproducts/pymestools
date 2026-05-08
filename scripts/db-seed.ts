/**
 * db-seed.ts
 * Seeds affiliate_programs with the 7 core programs.
 * Upserts on slug conflict so it is safe to re-run.
 * Usage: npx tsx scripts/db-seed.ts
 */

import 'dotenv/config'
import { supabase } from '../lib/db/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AffiliateProgramSeed {
  name: string
  slug: string
  commission_type: 'recurring' | 'one-time' | 'mixed'
  commission_rate: string
  cookie_days: number
  affiliate_url: string
  active: boolean
  language_support: string[]
  notes: string
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const PROGRAMS: AffiliateProgramSeed[] = [
  {
    name: 'GetResponse',
    slug: 'getresponse',
    commission_type: 'recurring',
    commission_rate: '33%',
    cookie_days: 120,
    affiliate_url: 'https://www.getresponse.com/affiliates',
    active: true,
    language_support: ['es', 'en'],
    notes: '33% recurrente mensual. Uno de los mejores programas del sector.',
  },
  {
    name: 'HubSpot',
    slug: 'hubspot',
    commission_type: 'recurring',
    commission_rate: '30%',
    cookie_days: 180,
    affiliate_url: 'https://www.hubspot.com/partners/affiliates',
    active: true,
    language_support: ['es', 'en'],
    notes: '30% hasta 12 meses. Muy alta comisión por plan Pro.',
  },
  {
    name: 'ActiveCampaign',
    slug: 'activecampaign',
    commission_type: 'recurring',
    commission_rate: '20-30%',
    cookie_days: 90,
    affiliate_url: 'https://www.activecampaign.com/affiliate',
    active: true,
    language_support: ['es', 'en'],
    notes: '20-30% según nivel. Aumenta con volumen de referidos.',
  },
  {
    name: 'Brevo',
    slug: 'brevo',
    commission_type: 'mixed',
    commission_rate: '5€ lead + 100€ venta',
    cookie_days: 90,
    affiliate_url: 'https://www.brevo.com/partners/',
    active: true,
    language_support: ['es', 'en'],
    notes: 'Modelo mixto: 5€ por lead + 100€ por venta. Ex Sendinblue.',
  },
  {
    name: 'Semrush',
    slug: 'semrush',
    commission_type: 'one-time',
    commission_rate: '$200/venta',
    cookie_days: 120,
    affiliate_url: 'https://www.semrush.com/partner/affiliate/',
    active: true,
    language_support: ['es', 'en'],
    notes: '$200 por venta. Alta comisión unitaria.',
  },
  {
    name: 'Hostinger',
    slug: 'hostinger',
    commission_type: 'one-time',
    commission_rate: '60%',
    cookie_days: 30,
    affiliate_url: 'https://www.hostinger.es/afiliados',
    active: true,
    language_support: ['es', 'en'],
    notes: '60% de venta anual. Muy alta conversión en España y LATAM.',
  },
  {
    name: 'Notion',
    slug: 'notion',
    commission_type: 'recurring',
    commission_rate: '50%',
    cookie_days: 90,
    affiliate_url: 'https://www.notion.so/affiliates',
    active: true,
    language_support: ['es', 'en'],
    notes: '50% primeros 12 meses. Notion AI incluido.',
  },
]

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function seed(): Promise<void> {
  console.log('\n🌱  PymesTools — DB Seed\n')
  console.log(`Upserting ${PROGRAMS.length} affiliate programs…\n`)

  const { data, error } = await supabase
    .from('affiliate_programs')
    .upsert(PROGRAMS, { onConflict: 'slug', ignoreDuplicates: false })
    .select('id, name, slug, commission_type, commission_rate')

  if (error) {
    throw new Error(`Seed failed: ${error.message}`)
  }

  // Summary
  console.log('Inserted / updated programs:')
  console.log('─'.repeat(60))
  for (const row of data ?? []) {
    console.log(
      `  • ${row.name.padEnd(20)} [${row.commission_type.padEnd(10)}]  ${row.commission_rate}`
    )
  }
  console.log('─'.repeat(60))
  console.log(`\n✅  Seed complete. ${(data ?? []).length} programs upserted.\n`)
}

async function main(): Promise<void> {
  try {
    await seed()
    process.exit(0)
  } catch (err) {
    console.error('\n❌  Seed error:', err)
    process.exit(1)
  }
}

main()
