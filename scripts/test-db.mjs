import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yjgtablerdbkzuwxkmyp.supabase.co'
const supabaseKey = 'sb_publishable_ZeQ_IIQ26DFUCb5KYFlovQ_45rH0Jd1'
const supabase = createClient(supabaseUrl, supabaseKey)

// 1. Check if calories column exists
console.log('=== Test 1: Read calories from DB ===')
const { data: items, error: readErr } = await supabase
  .from('menu_items')
  .select('id, name, calories, description')
  .limit(5)

if (readErr) {
  console.log('❌ READ ERROR:', readErr.message)
} else {
  items.forEach(i => console.log(`  ${i.name} → cal: ${i.calories} | desc: ${(i.description||'').substring(0,40)}`))
}

// 2. Try to UPDATE calories
console.log('\n=== Test 2: Try UPDATE calories ===')
const testItem = items[0]
if (testItem) {
  const { error: updateErr } = await supabase
    .from('menu_items')
    .update({ calories: 999 })
    .eq('id', testItem.id)
  
  if (updateErr) {
    console.log('❌ UPDATE ERROR:', updateErr.message)
  } else {
    console.log('✅ UPDATE SUCCESS for:', testItem.name)
    
    // Verify
    const { data: check } = await supabase
      .from('menu_items')
      .select('calories')
      .eq('id', testItem.id)
      .single()
    console.log('  Verified value:', check?.calories)
    
    // Reset back
    await supabase.from('menu_items').update({ calories: testItem.calories }).eq('id', testItem.id)
    console.log('  Reset back to:', testItem.calories)
  }
}

// 3. Try to UPDATE description
console.log('\n=== Test 3: Try UPDATE description ===')
const { error: descErr } = await supabase
  .from('menu_items')
  .update({ description: 'test description' })
  .eq('id', testItem.id)

if (descErr) {
  console.log('❌ UPDATE ERROR:', descErr.message)
} else {
  console.log('✅ UPDATE SUCCESS for:', testItem.name)
  const { data: check } = await supabase.from('menu_items').select('description').eq('id', testItem.id).single()
  console.log('  Verified:', check?.description)
  await supabase.from('menu_items').update({ description: testItem.description || '' }).eq('id', testItem.id)
  console.log('  Reset back')
}
