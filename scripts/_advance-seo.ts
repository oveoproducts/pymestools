import { supabase } from '../lib/db/client'

async function main() {
  await supabase.from('articles')
    .update({ status: 'seo_review', updated_at: new Date().toISOString() })
    .eq('slug', 'hubspot-vs-activecampaign-pymes')
  await supabase.from('pipeline_queue')
    .update({ status: 'seo_review', updated_at: new Date().toISOString() })
    .eq('id', '2e515eab-b89c-4435-8fa1-0ce528bdd422')
  console.log('✅ Avanzado a seo_review')
}
main()
