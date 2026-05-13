import { supabase } from '../lib/db/client'

async function main() {
  const { error } = await supabase
    .from('articles')
    .update({ category: 'recursos_humanos' })
    .eq('slug', 'review-factorial')
  if (error) console.error('Error:', error.message)
  else console.log('Fixed review-factorial category → recursos_humanos')
}

main()
