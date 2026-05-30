import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yjgtablerdbkzuwxkmyp.supabase.co'
const supabaseKey = 'sb_publishable_ZeQ_IIQ26DFUCb5KYFlovQ_45rH0Jd1'
const supabase = createClient(supabaseUrl, supabaseKey)

const { data: items } = await supabase
  .from('menu_items')
  .select('id, name, name_en, category, description, calories')
  .order('created_at', { ascending: true })

const menuItems = items.filter(i => !i.category.startsWith('__'))
console.log(`Found ${menuItems.length} items:\n`)
menuItems.forEach(i => {
  console.log(`"${i.name}" | "${i.name_en}" | cat: "${i.category}" | cal: ${i.calories} | desc: ${(i.description||'').substring(0,50)}`)
})
