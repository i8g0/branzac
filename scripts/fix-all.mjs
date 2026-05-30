import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yjgtablerdbkzuwxkmyp.supabase.co'
const supabaseKey = 'sb_publishable_ZeQ_IIQ26DFUCb5KYFlovQ_45rH0Jd1'
const supabase = createClient(supabaseUrl, supabaseKey)

const { data: items } = await supabase
  .from('menu_items')
  .select('id, name, name_en, category, calories, description, image, created_at')
  .order('created_at', { ascending: true })

const menuItems = items.filter(i => !String(i.category).startsWith('__'))

// Find duplicates by name+category
const seen = {}
const duplicates = []

for (const item of menuItems) {
  const key = `${item.name}|||${item.category}`
  if (seen[key]) {
    duplicates.push({ keep: seen[key], remove: item })
  } else {
    seen[key] = item
  }
}

console.log(`Found ${duplicates.length} duplicate pairs:\n`)
for (const d of duplicates) {
  console.log(`  KEEP:    ${d.keep.name} (${d.keep.id}) — cal: ${d.keep.calories}, desc: ${(d.keep.description||'').substring(0,30)}`)
  console.log(`  REMOVE:  ${d.remove.name} (${d.remove.id}) — cal: ${d.remove.calories}, desc: ${(d.remove.description||'').substring(0,30)}`)
  console.log('')
}

// Now delete duplicates and fix descriptions/calories
console.log('🗑️ Deleting duplicates...\n')
let deleted = 0
for (const d of duplicates) {
  const { error } = await supabase.from('menu_items').delete().eq('id', d.remove.id)
  if (error) console.log(`  ❌ ${d.remove.name}: ${error.message}`)
  else { deleted++; console.log(`  ✅ Deleted: ${d.remove.name} (${d.remove.id})`) }
}
console.log(`\nDeleted ${deleted} duplicates\n`)

// Now update ALL remaining items with correct data
console.log('📝 Updating descriptions and calories...\n')

const { data: remaining } = await supabase
  .from('menu_items')
  .select('id, name, description, calories')
  .order('created_at', { ascending: true })

const toFix = remaining.filter(i => !String(i.category).startsWith('__'))

const CAL_MAP = {
  'إسبرسو': 8, 'Espresso': 8,
  'كابتشينو': 80, 'Cappuccino': 80,
  'لاتيه': 70, 'Latte': 70,
  'سبانيش لاتيه': 140, 'سبانش لاتيه': 140, 'Spanish Latte': 140,
  'فلات وايت': 40, 'Flat White': 40,
  'قهوة اليوم': 5, 'Coffee of the Day': 5,
  'هوت شوكلت': 250, 'Hot Chocolate': 250,
  'ماتشا لاتيه': 120, 'Matcha Latte': 120,
  'ماتشا برانزاك': 170, 'Matcha Branzac': 170,
  'كركديه': 99, 'Hibiscus': 99,
  'ماء': 0, 'Water': 0,
  'رد اسبريسو': 149, 'Red Espresso': 149,
  'برانزاك سبيشل': 170, 'Branzac Special': 170,
  'بيكايك': 260, 'Bikake': 260,
  'كيو كيك': 300, 'Q Cake': 300,
  'تشيز كيك': 269, 'Cheesecake': 269,
  'تراميسو': 250, 'Tiramisu': 250,
  'سان سباستيان': 250, 'San Sebastian': 250,
  'بودينغ': 300, 'Pudding': 300,
  'كوكيز': 190, 'Cookies': 190,
  'براونيز كوكيز': 199, 'Brownie Cookies': 199,
  'كويكز مارشميلو': 250, 'Marshmallow Cookies': 250,
}

const DESC_MAP = {
  'إسبرسو': 'قهوة إسبريسو إيطالية أصلية قوية ومركزة، بطعم بن محمّص غامق مميز',
  'كابتشينو': 'كابتشينو كلاسيكي بطبقة رغوة حليب كثيفة، مثالي لبداية اليوم',
  'لاتيه': 'قهوة لاتيه كريمية مع حليب مبخر وأسبريسو، توازن مثالي بين القهوة والحليب',
  'سبانيش لاتيه': 'لاتيه مميز مع حليب مبخر وشراب حلو إسباني، نكهة فريدة غنية',
  'سبانش لاتيه': 'لاتيه بارد مع حليب طازج وشراب حلو إسباني وثلج، منعش ومميز',
  'فلات وايت': 'فلات وايت أسترالي بطبقة رغوة حليب ناعمة وكثيفة مع اسبريسو مركّز',
  'قهوة اليوم': 'قهوة محمّصة طازجة يومياً، تقدم أفضل أنواع البن المحمّص',
  'هوت شوكلت': 'شوكولاتة ساخنة كريمية بحليب طازج وشوكولاتة بلجيكية أصلية، دافئة ومريحة',
  'V60 محصول فاخر وادي السيل': 'قهوة V60 مختصة بحبوب فاخرة من وادي السيل السعودية، تحضير يدوي دقيق',
  'V60 اثيوبي . كولومبي . أوغندي': 'مزيج فاخر من حبوب القهوة الإثيوبية والكولومبية والأوغندية بنكهة فواكهية متوازنة',
  'ماتشا لاتيه': 'قهوة ماتشا يابانية أصلية مع حليب كريمي بارد، غنية بالمضادات الأكسدة والطاقة',
  'ماتشا برانزاك': 'مزيج برانزاك المميز من الماتشا اليابانية مع الحليب والعسل، نكهة فريدة',
  'كركديه': 'مشروب كركديه طبيعي بارد منعش، غني بالفيتامينات والمعادن الطبيعية',
  'ماء': 'مياه معدنية نقية منعشة',
  'رد اسبريسو': 'قهوة اسبريسو قوية مع ثلج وشراب رمان طبيعي، مزيج منعش للصيف',
  'برانزاك سبيشل': 'مشروب برانزاك الحصري، مزيج سري بارد وفاخر لا يُقدم في أي مكان آخر',
  'بيكايك': 'كيكة بان كيك ساخنة طازجة مع صوص شوكولاتة وكريمة',
  'كيو كيك': 'كيكة يابانية خفيفة كالسحاب بملمس هشّ ولذيذ، محضّرة يومياً',
  'تشيز كيك': 'كيكة جبنة كريمية كلاسيكية بطبقة ذهبية مكرملة على قاعدة بسكويت',
  'تراميسو': 'حلوى إيطالية كلاسيكية بطبقات من البسكويت المنقوع بالقهوة وكريمة الماسكاربوني',
  'سان سباستيان': 'تشيز كيك إسباني محمّص من الخارج وكريمي من الداخل، بملمس فريد',
  'بودينغ': 'بودينغ كريمي ناعم بطعم حليب غني، مقدّم مع صوص كراميل طازج',
  'كوكيز': 'كوكيز طازج محضّر يومياً بشرائح شوكولاتة بلجيكية ساخنة وهشّة',
  'براونيز كوكيز': 'مزيج لذيذ من البراونيز الغامق والكوكيز الهشّ، حلو وممتع',
  'كويكز مارشميلو': 'كوكيز طازج محشوّ بمارشميلو ملون ومكرمل على السطح',
}

let fixed = 0
for (const item of toFix) {
  const updates = {}
  let need = false

  const cal = CAL_MAP[item.name]
  if (cal !== undefined && item.calories !== cal) {
    updates.calories = cal
    need = true
  }

  const desc = DESC_MAP[item.name]
  if (desc && (!item.description || item.description === '0cal' || item.description.trim() === '')) {
    updates.description = desc
    need = true
  }

  if (need) {
    const { error } = await supabase.from('menu_items').update(updates).eq('id', item.id)
    if (error) console.log(`  ❌ ${item.name}: ${error.message}`)
    else { fixed++; console.log(`  ✅ ${item.name} → cal: ${updates.calories ?? '-'}, desc: ${(updates.description||'').substring(0,30)}`) }
  }
}

console.log(`\n✅ Fixed ${fixed} items`)
