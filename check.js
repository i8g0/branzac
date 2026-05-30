import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://yjgtablerdbkzuwxkmyp.supabase.co', 'sb_publishable_ZeQ_IIQ26DFUCb5KYFlovQ_45rH0Jd1')

async function run() {
  const { data, error } = await supabase.from('menu_items').select('id, name, category').order('created_at', { ascending: true })
  console.log('Items:', data?.filter(i => !i.category.startsWith('__')))
}
run()
