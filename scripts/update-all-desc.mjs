import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yjgtablerdbkzuwxkmyp.supabase.co'
const supabaseKey = 'sb_publishable_ZeQ_IIQ26DFUCb5KYFlovQ_45rH0Jd1'
const supabase = createClient(supabaseUrl, supabaseKey)

const ALL_DESCRIPTIONS = {
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

console.log('🔄 Updating ALL descriptions...\n')

// Get ALL items without any filter
const { data: items, error } = await supabase
  .from('menu_items')
  .select('id, name, category')
  .order('created_at', { ascending: true })

if (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}

console.log(`📦 Total items in DB: ${items.length}`)

const menuItems = items.filter(i => !String(i.category).startsWith('__'))
console.log(`📦 Menu items (non-internal): ${menuItems.length}\n`)

let updated = 0

for (const item of menuItems) {
  const newDesc = ALL_DESCRIPTIONS[item.name]
  if (!newDesc) {
    console.log(`  ⏭️  ${item.name} — no description mapping`)
    continue
  }

  const { error: updateErr } = await supabase
    .from('menu_items')
    .update({ description: newDesc })
    .eq('id', item.id)

  if (updateErr) {
    console.log(`  ❌ ${item.name}: ${updateErr.message}`)
  } else {
    updated++
    console.log(`  ✅ ${item.name}`)
  }
}

console.log(`\n✅ Updated ${updated} items`)
