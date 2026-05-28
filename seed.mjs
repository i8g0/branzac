import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yjgtablerdbkzuwxkmyp.supabase.co'
const supabaseKey = 'sb_publishable_ZeQ_IIQ26DFUCb5KYFlovQ_45rH0Jd1'

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  const seedCategories = [
    { name: 'مشروبات ساخنة ☕', icon: '☕' },
    { name: 'مشروبات باردة 🧊', icon: '🧊' },
    { name: 'حلويات 🍰', icon: '🍰' }
  ]

  const seedItems = [
    { name: 'برانزاك سبيشل', name_en: 'Branzac Special', description: '170cal', price: 19, category: 'مشروبات باردة 🧊', image: '/images/iced-latte.png' },
    { name: 'V60 محصول فاخر وادي السيل', name_en: 'V60 Premium Wadi Al-Sail Beans', description: '0cal', price: 20, category: 'مشروبات باردة 🧊', image: '/images/v60.png' },
    { name: 'V60 اثيوبي . كولومبي . أوغندي', name_en: 'V60 Ethiopia. Colombia. Uganda', description: '0cal', price: 16, category: 'مشروبات باردة 🧊', image: '/images/v60.png' },
    { name: 'قهوة اليوم', name_en: 'Coffee of the Day', description: '0cal', price: 11, category: 'مشروبات باردة 🧊', image: '/images/iced-latte.png' },
    { name: 'سبانش لاتيه', name_en: 'Spanish Latte', description: '140cal', price: 17, category: 'مشروبات باردة 🧊', image: '/images/spanish-latte.png' },
    { name: 'ماتشا لاتيه', name_en: 'Matcha Latte', description: '120cal', price: 18, category: 'مشروبات باردة 🧊', image: '/images/matcha-latte.png' },
    { name: 'كركديه', name_en: 'Hibiscus', description: '99cal', price: 15, category: 'مشروبات باردة 🧊', image: '/images/cold-brew.png' },
    { name: 'ماء', name_en: 'Water', description: '0cal', price: 1, category: 'مشروبات باردة 🧊', image: '/images/cold-brew.png' },
    { name: 'رد اسبريسو', name_en: 'Red Espresso', description: '149cal', price: 19, category: 'مشروبات باردة 🧊', image: '/images/cold-brew.png' },
    { name: 'ماتشا برانزاك', name_en: 'Matcha Branzac', description: '170cal', price: 21, category: 'مشروبات باردة 🧊', image: '/images/matcha-latte.png' },
    
    { name: 'إسبرسو', name_en: 'Espresso', description: '0cal', price: 10, category: 'مشروبات ساخنة ☕', image: '/images/espresso.png' },
    { name: 'لاتيه', name_en: 'Latte', description: '70cal', price: 14, category: 'مشروبات ساخنة ☕', image: '/images/flat-white.png' },
    { name: 'سبانيش لاتيه', name_en: 'Spanish Latte', description: '140cal', price: 16, category: 'مشروبات ساخنة ☕', image: '/images/spanish-latte.png' },
    { name: 'كابتشينو', name_en: 'Cappuccino', description: '80cal', price: 14, category: 'مشروبات ساخنة ☕', image: '/images/flat-white.png' },
    { name: 'فلات وايت', name_en: 'Flat White', description: '40cal', price: 13, category: 'مشروبات ساخنة ☕', image: '/images/flat-white.png' },
    { name: 'V60 محصول فاخر وادي السيل', name_en: 'V60 Premium Wadi Al-Sail Beans', description: '0cal', price: 20, category: 'مشروبات ساخنة ☕', image: '/images/v60.png' },
    { name: 'V60 اثيوبي . كولومبي . أوغندي', name_en: 'V60 Ethiopia. Colombia. Uganda', description: '0cal', price: 16, category: 'مشروبات ساخنة ☕', image: '/images/v60.png' },
    { name: 'قهوة اليوم', name_en: 'Coffee of the Day', description: '0cal', price: 11, category: 'مشروبات ساخنة ☕', image: '/images/v60.png' },
    { name: 'هوت شوكلت', name_en: 'Hot Chocolate', description: '250cal', price: 18, category: 'مشروبات ساخنة ☕', image: '/images/flat-white.png' },

    { name: 'بيكايك', name_en: 'Bikake', description: '260cal', price: 26, category: 'حلويات 🍰', image: '/images/cheesecake.png' },
    { name: 'كيو كيك', name_en: 'Q Cake', description: '300cal', price: 24, category: 'حلويات 🍰', image: '/images/cheesecake.png' },
    { name: 'تشيز كيك', name_en: 'Cheesecake', description: '269cal', price: 24, category: 'حلويات 🍰', image: '/images/cheesecake.png' },
    { name: 'تراميسو', name_en: 'Tiramisu', description: '250cal', price: 24, category: 'حلويات 🍰', image: '/images/cheesecake.png' },
    { name: 'سان سباستيان', name_en: 'San Sebastian', description: '250cal', price: 23, category: 'حلويات 🍰', image: '/images/cheesecake.png' },
    { name: 'بودينغ', name_en: 'Pudding', description: '300cal', price: 21, category: 'حلويات 🍰', image: '/images/croissant.png' },
    { name: 'كوكيز', name_en: 'Cookies', description: '190cal', price: 10, category: 'حلويات 🍰', image: '/images/croissant.png' },
    { name: 'براونيز كوكيز', name_en: 'Brownie Cookies', description: '199cal', price: 10, category: 'حلويات 🍰', image: '/images/croissant.png' },
    { name: 'كويكز مارشميلو', name_en: 'Marshmallow Cookies', description: '250cal', price: 10, category: 'حلويات 🍰', image: '/images/croissant.png' },
    
    // Default Hero Welcome Slide
    { 
      name: 'حيث تلتقي القهوة المختصة بالأجواء الاستثنائية', 
      name_en: 'Hero Slide', 
      description: '/images/logo-bg.png', 
      price: 0, 
      category: '__hero_slide__', 
      image: '/images/hero-bg.png' 
    },
    
    // Default About Section Content
    { 
      name: 'شغفنا بالقهوة المختصة', 
      name_en: 'About Settings', 
      description: 'في برانزاك، نؤمن بأن القهوة ليست مجرد مشروب — إنها تجربة متكاملة. نختار بعناية أجود حبوب البن من إثيوبيا وكولومبيا والبرازيل، ونحمّصها بأسلوب حرفي يُبرز أفضل نكهاتها.', 
      price: 0, 
      category: '__site_about__', 
      image: '/images/cafe-interior.png' 
    }
  ]

  console.log('Inserting categories...')
  for (const cat of seedCategories) {
    const { error } = await supabase.from('menu_categories').insert([cat])
    if(error) console.error('Error inserting category:', cat.name, error.message)
  }

  console.log('Inserting items...')
  const { error } = await supabase.from('menu_items').insert(seedItems)
  if(error) console.error('Error inserting items:', error.message)

  console.log('Done seeding the database!')
}

seed()
