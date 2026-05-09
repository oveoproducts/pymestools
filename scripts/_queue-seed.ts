import { supabase } from '../lib/db/client'

async function main() {
  const { data: kw, error: kwErr } = await supabase
    .from('keywords')
    .insert({
      keyword: 'hubspot vs activecampaign pymes',
      search_intent: 'commercial',
      priority_score: 8,
      status: 'approved',
      category: 'email_marketing',
    })
    .select('id, keyword')
    .single()

  if (kwErr) { console.error('Keyword error:', kwErr.message); process.exit(1) }
  console.log('Keyword:', kw.keyword, '→', kw.id)

  const { error: qErr } = await supabase
    .from('pipeline_queue')
    .insert({ keyword_id: kw.id, type: 'comparison', status: 'pending', priority: 8 })

  if (qErr) { console.error('Queue error:', qErr.message); process.exit(1) }
  console.log('✅ Añadido a pipeline_queue')
}

main()
