import { supabase } from '../lib/db/client'

async function main() {
  // Reset queue item to qa_review
  const { data: qData, error: qErr } = await supabase
    .from('pipeline_queue')
    .update({ status: 'qa_review', updated_at: new Date().toISOString() })
    .eq('status', 'awaiting_human')
    .select('id, status')

  if (qErr) { console.error('Queue error:', qErr.message); process.exit(1) }
  console.log('Queue items reset:', qData)

  // Reset article status too
  const { data: aData, error: aErr } = await supabase
    .from('articles')
    .update({ status: 'qa_review', updated_at: new Date().toISOString() })
    .eq('slug', 'hubspot-vs-activecampaign-pymes')
    .select('id, slug, status')

  if (aErr) { console.error('Article error:', aErr.message); process.exit(1) }
  console.log('Article reset:', aData)
}

main()
