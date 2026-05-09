import { createClient } from '@supabase/supabase-js';
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
const { data, error } = await s.from('articles').insert({ title: 'ActiveCampaign: ¿Vale la pena para tu pyme?', slug: 'review-activecampaign', category: 'email_marketing', type: 'review', tools: ['activecampaign'], author: 'Equipo PymesTools', status: 'draft', keywords_primary: 'activecampaign review español pymes', updated_at: new Date().toISOString() }).select().single();
console.log(JSON.stringify({data, error}, null, 2));
