import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yjgtablerdbkzuwxkmyp.supabase.co'
const supabaseKey = 'sb_publishable_ZeQ_IIQ26DFUCb5KYFlovQ_45rH0Jd1'
const supabase = createClient(supabaseUrl, supabaseKey)

// أوصاف افتراضية لكل صنف بناءً على الاسم
const DESCRIPTIONS = {
  'ماتشا لاتيه': 'قهوة ماتشا يابانية أصلية مع حليب كريمي، غنية بالمضادات الأكسدة والطاقة المستدامة',
  'ريد اسبريسو': 'قهوة اسبريسو قوية مقدمة مع ثلج وشراب رمان منعش، مزيج مثالي للصيف',
  'كركديه': 'مشروب كركديه طبيعي منعش بارد، غني بالفيتامينات والمعادن',
  'ماء': 'مياه معدنية نقية',
  'سبانش لاتيه': 'قهوة لاتيه مع حليب مبخر وشراب حلو إسباني، نكهة فريدة ومميزة',
  'اسبريسو': 'قهوة اسبريسو أصلية إيطالية، قوية ومركزة بطعم بن محمّص مميز',
  'لاتيه': 'قهوة لاتيه كريمية مع حليب مبخر وأسبريسو، توازن مثالي بين القهوة والحليب',
  'كابتشينو': 'كابتشينو كلاسيكي بطبقة رغوة حليب كثيفة، مثالي لبداية اليوم',
  'موكا': 'مزيج من القهوة والشوكولاتة والحليب، حلو ودافئ ومميز',
  'آيس لاتيه': 'لاتيه بارد مع ثلج وحليب طازج، منعش في الأيام الحارة',
  'Americano': 'قهوة أميريكانو كلاسيكية، خفيفة ومريحة للشرب على مدار اليوم',
  'فلات وايت': 'فلات وايت أسترالي بطبقة رغوة حليب ناعمة و concentrate اسبريسو',
  'كورتادو': 'كورتادو إسباني بكمية متساوية من الاسبريسو والحليب المبخر',
  'قهوة اليوم': 'قهوة اليوم المحمّصة طازجة، تتغير يومياً لتقدم أفضل أنواع البن',
  'كورفيتو': 'كورفيتو برازيلي بحليب مبخر واسبريسو وسكر بني، حلو ومضاد للأكسدة',
  'نيترو': 'قهوة نيترو باردة بتقنية الغازات الطبيعية، ناعمة كالمخمل',
  'شاي أحمر': 'شاي أحمر تقليدي عطري، منعش ومريح',
  'شاي أخضر': 'شاي أخضر ياباني غني بالفيتامينات والمضادات الأكسدة',
  'عصير برتقال': 'عصير برتقال طازج معصور يومياً، غني بفيتامين سي',
  'عصير ليمون': 'عصير ليمون منعش مع نعناع طازج وسكر',
  'سفن أب': 'بيبسي كلاسيكية منعشة',
  'ريد بول': 'مشروب طاقة منعش',
}

// أوصاف الإنجليزي
const DESCRIPTIONS_EN = {
  'Matcha Latte': 'Authentic Japanese matcha with creamy steamed milk, rich in antioxidants',
  'Red Espresso': 'Strong espresso served with ice and pomegranate, perfect summer blend',
  'Hibiscus': 'Natural refreshing hibiscus drink, rich in vitamins and minerals',
  'Water': 'Pure mineral water',
  'Spanish Latte': 'Latte with steamed milk and sweet Spanish syrup, unique flavor',
  'Espresso': 'Original Italian espresso, strong and concentrated',
  'Latte': 'Creamy latte with steamed milk and espresso',
  'Cappuccino': 'Classic cappuccino with thick milk foam layer',
  'Mocha': 'Blend of coffee, chocolate and milk, sweet and warm',
  'Iced Latte': 'Cold latte with ice and fresh milk',
  'Americano': 'Classic Americano, light and easy to drink',
  'Flat White': 'Australian flat white with silky milk foam',
  'Cortado': 'Spanish cortado with equal parts espresso and steamed milk',
  'Coffee of the Day': 'Freshly roasted daily coffee, featuring the best beans',
  'Corretto': 'Brazilian corretto with steamed milk, espresso and brown sugar',
  'Nitro': 'Cold brew nitro with natural carbonation, smooth as velvet',
  'Red Tea': 'Traditional aromatic red tea',
  'Green Tea': 'Japanese green tea rich in vitamins',
  'Orange Juice': 'Freshly squeezed orange juice',
  'Lemon Juice': 'Refreshing lemon juice with fresh mint',
  '7up': 'Classic refreshing Pepsi',
  'Red Bull': 'Refreshing energy drink',
}

// سعرات تقريبية لكل صنف
const CALORIES = {
  'ماتشا لاتيه': 120,
  'Matcha Latte': 120,
  'ريد اسبريسو': 149,
  'Red Espresso': 149,
  'كركديه': 99,
  'Hibiscus': 99,
  'ماء': 0,
  'Water': 0,
  'سبانش لاتيه': 180,
  'Spanish Latte': 180,
  'اسبريسو': 5,
  'Espresso': 5,
  'لاتيه': 150,
  'Latte': 150,
  'كابتشينو': 120,
  'Cappuccino': 120,
  'موكا': 250,
  'Mocha': 250,
  'آيس لاتيه': 130,
  'Iced Latte': 130,
  'Americano': 10,
  'فلات وايت': 140,
  'Flat White': 140,
  'كورتادو': 60,
  'Cortado': 60,
  'قهوة اليوم': 5,
  'Coffee of the Day': 5,
  'كورفيتو': 200,
  'Corretto': 200,
  'نيترو': 5,
  'Nitro': 5,
  'شاي أحمر': 2,
  'Red Tea': 2,
  'شاي أخضر': 3,
  'Green Tea': 3,
  'عصير برتقال': 110,
  'Orange Juice': 110,
  'عصير ليمون': 80,
  'Lemon Juice': 80,
  'سفن أب': 140,
  '7up': 140,
  'ريد بول': 110,
  'Red Bull': 110,
}

function extractCaloriesFromDescription(desc) {
  if (!desc) return 0
  const match = desc.match(/(\d+)\s*cal/i)
  if (match) return parseInt(match[1], 10)
  return 0
}

function cleanDescription(desc) {
  if (!desc) return desc
  return desc.replace(/\d+\s*cal/gi, '').trim()
}

async function migrate() {
  console.log('🔄 Starting migration...\n')

  // 1. Get all menu items
  const { data: items, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('❌ Error fetching items:', error.message)
    return
  }

  // Filter out internal items
  const menuItems = items.filter(item => !item.category.startsWith('__'))
  console.log(`📦 Found ${menuItems.length} menu items\n`)

  let updated = 0
  let descriptionsAdded = 0
  let caloriesFixed = 0

  for (const item of menuItems) {
    const updates = {}
    let needsUpdate = false

    // 1. Extract calories from description if calories field is empty
    let currentCalories = item.calories || 0
    let description = item.description || ''

    // Check if calories are in description (e.g., "120cal")
    const calFromDesc = extractCaloriesFromDescription(description)
    if (calFromDesc > 0 && currentCalories === 0) {
      currentCalories = calFromDesc
      description = cleanDescription(description)
      updates.calories = calFromDesc
      updates.description = description
      needsUpdate = true
      caloriesFixed++
      console.log(`  ✅ Moved ${calFromDesc}cal from description for: ${item.name}`)
    }

    // 2. If still no calories, check our lookup
    if (currentCalories === 0) {
      const cal = CALORIES[item.name] || CALORIES[item.name_en] || 0
      if (cal > 0) {
        updates.calories = cal
        needsUpdate = true
        caloriesFixed++
        console.log(`  ✅ Set ${cal}cal from lookup for: ${item.name}`)
      }
    }

    // 3. Add description if empty
    if (!description || description.trim() === '' || /^\d+\s*cal/i.test(description.trim())) {
      const desc = DESCRIPTIONS[item.name] || DESCRIPTIONS_EN[item.name_en] || ''
      if (desc) {
        updates.description = desc
        needsUpdate = true
        descriptionsAdded++
        console.log(`  📝 Added description for: ${item.name}`)
      }
    }

    // 4. Save updates
    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', item.id)

      if (updateError) {
        console.error(`  ❌ Error updating ${item.name}:`, updateError.message)
      } else {
        updated++
      }
    }
  }

  console.log('\n' + '='.repeat(40))
  console.log(`✅ Migration complete!`)
  console.log(`   📊 Items updated: ${updated}`)
  console.log(`   🔢 Calories fixed: ${caloriesFixed}`)
  console.log(`   📝 Descriptions added: ${descriptionsAdded}`)
}

migrate().catch(console.error)
