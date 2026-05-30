import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://yjgtablerdbkzuwxkmyp.supabase.co', 'sb_publishable_ZeQ_IIQ26DFUCb5KYFlovQ_45rH0Jd1')

function strip(str) {
  return str.replace(/[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu, '').trim();
}

async function run() {
  console.log('Fixing categories in menu_categories...')
  const { data: cats } = await supabase.from('menu_categories').select('*')
  
  for (const cat of cats) {
    const cleanName = strip(cat.name)
    if (cleanName !== cat.name) {
      console.log(`Updating category: "${cat.name}" -> "${cleanName}"`)
      await supabase.from('menu_categories').update({ name: cleanName }).eq('id', cat.id)
    }
  }

  console.log('Fixing categories in menu_items...')
  const { data: items } = await supabase.from('menu_items').select('*')
  
  for (const item of items) {
    if (!item.category) continue;
    const cleanCat = strip(item.category)
    if (cleanCat !== item.category) {
      console.log(`Updating item ${item.name} category: "${item.category}" -> "${cleanCat}"`)
      await supabase.from('menu_items').update({ category: cleanCat }).eq('id', item.id)
    }
  }
  
  console.log('Done fixing database!')
}
run()
