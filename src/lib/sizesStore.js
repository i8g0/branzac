import { supabase } from './supabase'

let cachedSizes = null

export async function fetchSizesConfig() {
  if (cachedSizes) return cachedSizes

  const { data } = await supabase
    .from('menu_items')
    .select('description')
    .eq('category', '__sizes_config__')
    .limit(1)
    .single()

  if (data?.description) {
    try {
      cachedSizes = JSON.parse(data.description)
    } catch {
      cachedSizes = {}
    }
  } else {
    cachedSizes = {}
  }

  return cachedSizes
}

export function getSizesForItem(sizesConfig, itemName) {
  return sizesConfig[itemName] || null
}

export function getPriceForSize(sizes, sizeName) {
  if (!sizes) return null
  const found = sizes.find((s) => s.name === sizeName)
  return found ? found.price : null
}

export async function saveSizesConfig(sizesConfig) {
  cachedSizes = sizesConfig

  const { data: existing } = await supabase
    .from('menu_items')
    .select('id')
    .eq('category', '__sizes_config__')
    .limit(1)

  if (existing && existing.length > 0) {
    await supabase
      .from('menu_items')
      .update({ description: JSON.stringify(sizesConfig) })
      .eq('id', existing[0].id)
  } else {
    await supabase.from('menu_items').insert([{
      name: '__sizes_config__',
      name_en: 'Sizes Config',
      description: JSON.stringify(sizesConfig),
      price: 0,
      category: '__sizes_config__',
      image: '',
    }])
  }
}

export function clearSizesCache() {
  cachedSizes = null
}
