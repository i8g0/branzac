import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yjgtablerdbkzuwxkmyp.supabase.co'
const supabaseKey = 'sb_publishable_ZeQ_IIQ26DFUCb5KYFlovQ_45rH0Jd1'
const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanDescriptions() {
  console.log('🧹 تنظيف الأوصاف...')

  const { data: items, error } = await supabase.from('menu_items').select('id, name, description')
  if (error) { console.error('Fetch error:', error.message); return }

  for (const item of items) {
    if (!item.category || item.category.startsWith('__')) continue

    const cleanDesc = item.description
      .replace(/كوب صغير \d+ ريال \| كوب كبير \d+ ريال/g, '')
      .trim()

    if (cleanDesc !== item.description) {
      const { error: updErr } = await supabase.from('menu_items').update({ description: cleanDesc }).eq('id', item.id)
      if (updErr) console.error(`Error: ${item.name}: ${updErr.message}`)
      else console.log(`✅ ${item.name}: "${cleanDesc || '(فارغ)'}"`)
    }
  }

  console.log('\n🎉 Done!')
}

cleanDescriptions()
