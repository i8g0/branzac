import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yjgtablerdbkzuwxkmyp.supabase.co'
const supabaseKey = 'sb_publishable_ZeQ_IIQ26DFUCb5KYFlovQ_45rH0Jd1'

const supabase = createClient(supabaseUrl, supabaseKey)

async function replaceMenu() {
  console.log('🗑️  حذف جميع المنتجات القديمة...')
  const { error: delItems } = await supabase.from('menu_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (delItems) console.error('Error deleting items:', delItems.message)
  else console.log('✅ تم حذف جميع المنتجات')

  console.log('🗑️  حذف جميع الأقسام القديمة...')
  const { error: delCats } = await supabase.from('menu_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (delCats) console.error('Error deleting categories:', delCats.message)
  else console.log('✅ تم حذف جميع الأقسام')

  const newCategories = [
    { name: 'مشروبات ساخنة 🍵', icon: '🍵' }
  ]

  console.log('📦 إضافة الأقسام الجديدة...')
  for (const cat of newCategories) {
    const { error } = await supabase.from('menu_categories').insert([cat])
    if (error) console.error('Error inserting category:', cat.name, error.message)
  }
  console.log('✅ تم إضافة الأقسام')

  const newItems = [
    { name: 'شاي الوردة', name_en: 'Rose Tea', description: 'كوب صغير 4 ريال | كوب كبير 6 ريال', price: 4, category: 'مشروبات ساخنة 🍵', image: '/images/tea-default.png' },
    { name: 'شاي السمار', name_en: 'Sammar Tea', description: 'كوب صغير 4 ريال | كوب كبير 6 ريال', price: 4, category: 'مشروبات ساخنة 🍵', image: '/images/tea-default.png' },
    { name: 'شاي اليمام', name_en: 'Yamam Tea', description: 'كوب صغير 4 ريال | كوب كبير 6 ريال', price: 4, category: 'مشروبات ساخنة 🍵', image: '/images/tea-default.png' },
    { name: 'شاي الربع', name_en: 'Rabba Tea', description: 'كوب صغير 4 ريال | كوب كبير 6 ريال', price: 4, category: 'مشروبات ساخنة 🍵', image: '/images/tea-default.png' },
    { name: 'شاي الزهور', name_en: 'Flowers Tea', description: 'كوب صغير 4 ريال | كوب كبير 6 ريال', price: 4, category: 'مشروبات ساخنة 🍵', image: '/images/tea-default.png' },
    { name: 'كرك', name_en: 'Karak', description: 'كوب صغير 5 ريال | كوب كبير 6 ريال', price: 5, category: 'مشروبات ساخنة 🍵', image: '/images/tea-default.png' },
    { name: 'حليب بالزنجبيل', name_en: 'Ginger Milk', description: 'كوب صغير 5 ريال | كوب كبير 7 ريال', price: 5, category: 'مشروبات ساخنة 🍵', image: '/images/tea-default.png' },
    { name: 'كركديجة', name_en: 'Karkadeja', description: 'كوب صغير 4 ريال | كوب كبير 7 ريال', price: 4, category: 'مشروبات ساخنة 🍵', image: '/images/tea-default.png' },
    { name: 'كمون', name_en: 'Cumin Tea', description: 'كوب صغير 4 ريال | كوب كبير 6 ريال', price: 4, category: 'مشروبات ساخنة 🍵', image: '/images/tea-default.png' },
    { name: 'تجيبيل بالليمون', name_en: 'Tajibil with Lemon', description: 'كوب صغير 4 ريال | كوب كبير 6 ريال', price: 4, category: 'مشروبات ساخنة 🍵', image: '/images/tea-default.png' },
    { name: 'متناج', name_en: 'Mutanaj', description: 'كوب صغير 4 ريال | كوب كبير 6 ريال', price: 4, category: 'مشروبات ساخنة 🍵', image: '/images/tea-default.png' },
    { name: 'وردجينا', name_en: 'Wardjina', description: 'كوب صغير 4 ريال | كوب كبير 6 ريال', price: 4, category: 'مشروبات ساخنة 🍵', image: '/images/tea-default.png' },
  ]

  console.log('📦 إضافة المنتجات الجديدة...')
  const { error: insItems } = await supabase.from('menu_items').insert(newItems)
  if (insItems) console.error('Error inserting items:', insItems.message)
  else console.log('✅ تم إضافة جميع منتجات الشاي')

  const heroUpdate = {
    name: 'حيث تلتقي تقاليد الشاي بالتجربة الاستثنائية',
    name_en: 'Hero Slide',
    description: '/images/logo-bg.png',
    price: 0,
    category: '__hero_slide__',
    image: '/images/hero-bg.png'
  }
  console.log('📝 تحديث قسم الهيرو...')
  const { error: heroErr } = await supabase.from('menu_items').insert([heroUpdate])
  if (heroErr) console.error('Error updating hero:', heroErr.message)
  else console.log('✅ تم تحديث الهيرو')

  const aboutUpdate = {
    name: 'شغفنا بالشاي والتقليد',
    name_en: 'About Settings',
    description: 'في محاصيل الشاي، نؤمن بأن الشاي أكثر من مشروب — إنه تجربة تربطنا بتقاليدنا وأصالتنا. نختار أجود أنواع الشاي العطري والكرك والمشروبات التقليدية لنقدم لك تجربة فريدة.',
    price: 0,
    category: '__site_about__',
    image: '/images/cafe-interior.png'
  }
  console.log('📝 تحديث قسم عنا...')
  const { error: aboutErr } = await supabase.from('menu_items').insert([aboutUpdate])
  if (aboutErr) console.error('Error updating about:', aboutErr.message)
  else console.log('✅ تم تحديث قسم عنا')

  console.log('\n🎉 تم استبدال المنيو بنجاح!')
}

replaceMenu()
