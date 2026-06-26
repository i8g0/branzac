import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yjgtablerdbkzuwxkmyp.supabase.co'
const supabaseKey = 'sb_publishable_ZeQ_IIQ26DFUCb5KYFlovQ_45rH0Jd1'
const supabase = createClient(supabaseUrl, supabaseKey)

async function migrate() {
  console.log('1️⃣ إضافة عمود sizes...')
  
  const sizesMap = {
    'شاي الوردة':       [{ name: 'كوب صغير', price: 4 }, { name: 'كوب كبير', price: 6 }],
    'شاي السمار':       [{ name: 'كوب صغير', price: 4 }, { name: 'كوب كبير', price: 6 }],
    'شاي اليمام':       [{ name: 'كوب صغير', price: 4 }, { name: 'كوب كبير', price: 6 }],
    'شاي الربع':        [{ name: 'كوب صغير', price: 4 }, { name: 'كوب كبير', price: 6 }],
    'شاي الزهور':       [{ name: 'كوب صغير', price: 4 }, { name: 'كوب كبير', price: 6 }],
    'كرك':              [{ name: 'كوب صغير', price: 5 }, { name: 'كوب كبير', price: 6 }],
    'حليب بالزنجبيل':   [{ name: 'كوب صغير', price: 5 }, { name: 'كوب كبير', price: 7 }],
    'كركديجة':          [{ name: 'كوب صغير', price: 4 }, { name: 'كوب كبير', price: 7 }],
    'كمون':             [{ name: 'كوب صغير', price: 4 }, { name: 'كوب كبير', price: 6 }],
    'تجيبيل بالليمون':  [{ name: 'كوب صغير', price: 4 }, { name: 'كوب كبير', price: 6 }],
    'متناج':            [{ name: 'كوب صغير', price: 4 }, { name: 'كوب كبير', price: 6 }],
    'وردجينا':          [{ name: 'كوب صغير', price: 4 }, { name: 'كوب كبير', price: 6 }],
  }

  const { data: items, error: fetchErr } = await supabase.from('menu_items').select('id, name')
  if (fetchErr) { console.error('Fetch error:', fetchErr.message); return }

  for (const item of items) {
    const sizes = sizesMap[item.name]
    if (sizes) {
      const basePrice = sizes[0].price
      const { error } = await supabase.from('menu_items').update({ sizes, price: basePrice }).eq('id', item.id)
      if (error) console.error(`Error updating ${item.name}:`, error.message)
      else console.log(`✅ ${item.name}: ${JSON.stringify(sizes)}`)
    }
  }

  console.log('\n🎉 Migration done!')
}

migrate()
