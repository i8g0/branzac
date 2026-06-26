import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yjgtablerdbkzuwxkmyp.supabase.co'
const supabaseKey = 'sb_publishable_ZeQ_IIQ26DFUCb5KYFlovQ_45rH0Jd1'
const supabase = createClient(supabaseUrl, supabaseKey)

const DEFAULT_SIZES = {
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

async function seedSizes() {
  console.log('🔍 Checking for existing sizes config...')

  const { data: existing } = await supabase
    .from('menu_items')
    .select('id')
    .eq('category', '__sizes_config__')
    .limit(1)

  if (existing && existing.length > 0) {
    console.log('📝 Updating existing sizes config...')
    const { error } = await supabase
      .from('menu_items')
      .update({ description: JSON.stringify(DEFAULT_SIZES) })
      .eq('id', existing[0].id)
    if (error) console.error('Error:', error.message)
    else console.log('✅ Updated!')
  } else {
    console.log('📝 Creating sizes config...')
    const { error } = await supabase.from('menu_items').insert([{
      name: '__sizes_config__',
      name_en: 'Sizes Config',
      description: JSON.stringify(DEFAULT_SIZES),
      price: 0,
      category: '__sizes_config__',
      image: '',
    }])
    if (error) console.error('Error:', error.message)
    else console.log('✅ Created!')
  }

  console.log('🎉 Done!')
}

seedSizes()
