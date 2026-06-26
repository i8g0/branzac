import { supabase } from './supabase'
import { generatePalette, applyPaletteToDocument } from './colorPalette'

const DEFAULT_SETTINGS = {
  site_name: 'محاصيل الشاي',
  site_name_en: 'Mahaseel Tea',
  logo_light_url: '/images/logo-transparent.png',
  logo_dark_url: '/images/logo-bg.png',
  favicon_url: '/favicon.ico',
  font_family: 'Tajawal',
  primary_color: '#2d6a4f',
  secondary_color: '#8a7850',
  accent_color: '#d4a843',
  background_color: '#f5f0e8',
  surface_color: '#ffffff',
  text_base_color: '#1a1a2e',
  hero_title: 'حيث تلتقي أصالة الشاي بالتجربة الاستثنائية',
  hero_subtitle: 'مرحباً بكم في',
  hero_tagline: 'استمتع بتشكيلة فريدة من الشاي المغربي',
  footer_text: 'نقدّم لكم أجود أنواع الشاي المغربي والكرك في أجواء تراثية دافئة.',
  social_links: {},
  is_hero_image_enabled: true,
  layout_style: 'default',
  theme_preset: 'forest',
}

let cachedSettings = null

export async function fetchSiteSettings() {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.warn('Failed to fetch site settings, using defaults:', error.message)
      return { ...DEFAULT_SETTINGS }
    }

    cachedSettings = { ...DEFAULT_SETTINGS, ...data }
    return cachedSettings
  } catch (e) {
    console.warn('Settings fetch error:', e)
    return { ...DEFAULT_SETTINGS }
  }
}

export async function updateSiteSettings(updates) {
  try {
    // Get current row ID
    const { data: existing } = await supabase
      .from('site_settings')
      .select('id')
      .limit(1)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('site_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      cachedSettings = { ...DEFAULT_SETTINGS, ...data }
    } else {
      const { data, error } = await supabase
        .from('site_settings')
        .insert({ ...DEFAULT_SETTINGS, ...updates })
        .select()
        .single()

      if (error) throw error
      cachedSettings = { ...DEFAULT_SETTINGS, ...data }
    }

    applyTheme(cachedSettings)
    return cachedSettings
  } catch (e) {
    console.error('Failed to update settings:', e)
    throw e
  }
}

export function applyTheme(settings) {
  const palette = generatePalette(
    settings.primary_color,
    settings.secondary_color,
    settings.accent_color
  )
  applyPaletteToDocument(palette)

  // Apply font family
  if (settings.font_family) {
    document.documentElement.style.setProperty('--font-family', settings.font_family)
    document.body.style.fontFamily = `'${settings.font_family}', sans-serif`
  }
}

export function getCachedSettings() {
  return cachedSettings || { ...DEFAULT_SETTINGS }
}

export { DEFAULT_SETTINGS }
