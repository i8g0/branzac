import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yjgtablerdbkzuwxkmyp.supabase.co'
const supabaseKey = 'sb_publishable_ZeQ_IIQ26DFUCb5KYFlovQ_45rH0Jd1'

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  const seedCategories = [
    { name: 'مشروبات ساخنة 🍵', icon: '🍵' }
  ]

  const seedItems = [
    { name: 'شاي الوردة', name_en: 'Rose Tea', description: '', price: 4, category: 'مشروبات ساخنة 🍵', image: '/images/tea-default.png' },
    { name: 'شاي السمار', name_en: 'Sammar Tea', description: '', price: 4, category: 'مشروبات ساخنة 🍵', image: '/images/tea-default.png' },
    { name: 'شاي اليمام', name_en: 'Yamam Tea', description: '', price: 4, category: 'مشروبات ساخنة 🍵', image: '/images/tea-default.png' },
    { name: 'شاي الربع', name_en: 'Rabba Tea', description: '', price: 4, category: 'مشروبات ساخنة 🍵', image: '/images/tea-default.png' },
    { name: 'شاي الزهور', name_en: 'Flowers Tea', description: '', price: 4, category: 'مشروبات ساخنة 🍵', image: '/images/tea-default.png' },
    { name: 'كرك', name_en: 'Karak', description: '', price: 5, category: 'مشروبات ساخنة 🍵', image: '/images/tea-default.png' },
    { name: 'حليب بالزنجبيل', name_en: 'Ginger Milk', description: '', price: 5, category: 'مشروبات ساخنة 🍵', image: '/images/tea-default.png' },
    { name: 'كركديجة', name_en: 'Karkadeja', description: '', price: 4, category: 'مشروبات ساخنة 🍵', image: '/images/tea-default.png' },
    { name: 'كمون', name_en: 'Cumin Tea', description: '', price: 4, category: 'مشروبات ساخنة 🍵', image: '/images/tea-default.png' },
    { name: 'تجيبيل بالليمون', name_en: 'Tajibil with Lemon', description: '', price: 4, category: 'مشروبات ساخنة 🍵', image: '/images/tea-default.png' },
    { name: 'متناج', name_en: 'Mutanaj', description: '', price: 4, category: 'مشروبات ساخنة 🍵', image: '/images/tea-default.png' },
    { name: 'وردجينا', name_en: 'Wardjina', description: '', price: 4, category: 'مشروبات ساخنة 🍵', image: '/images/tea-default.png' },

    {
      name: 'حيث تلتقي تقاليد الشاي بالتجربة الاستثنائية',
      name_en: 'Hero Slide',
      description: '/images/logo-bg.png',
      price: 0,
      category: '__hero_slide__',
      image: '/images/hero-bg.png'
    },
    {
      name: 'شغفنا بالشاي والتقليد',
      name_en: 'About Settings',
      description: 'في محاصيل الشاي، نؤمن بأن الشاي أكثر من مشروب — إنه تجربة تربطنا بتقاليدنا وأصالتنا. نختار أجود أنواع الشاي العطري والكرك والمشروبات التقليدية لنقدم لك تجربة فريدة.',
      price: 0,
      category: '__site_about__',
      image: '/images/cafe-interior.png'
    }
  ]

  console.log('Inserting categories...')
  for (const cat of seedCategories) {
    const { error } = await supabase.from('menu_categories').insert([cat])
    if (error) console.error('Error inserting category:', cat.name, error.message)
  }

  console.log('Inserting items...')
  const { error } = await supabase.from('menu_items').insert(seedItems)
  if (error) console.error('Error inserting items:', error.message)

  console.log('Done seeding the database!')
}

seed()
