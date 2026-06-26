import { supabase } from './supabase'
import { generatePalette, applyPaletteToDocument, THEME_PRESETS } from './colorPalette'

const DEFAULT_PRESET = THEME_PRESETS.forest

const DEFAULT_SETTINGS = {
  site_name: 'محاصيل الشاي',
  site_name_en: 'Mahaseel Tea',
  logo_light_url: '/images/logo-transparent.png',
  logo_dark_url: '/images/logo-bg.png',
  favicon_url: '/favicon.ico',
  font_family: 'Tajawal',

  // Full brand identity colors
  primary_color: DEFAULT_PRESET.primary,
  secondary_color: DEFAULT_PRESET.secondary,
  accent_color: DEFAULT_PRESET.accent,
  success_color: DEFAULT_PRESET.success,
  warning_color: DEFAULT_PRESET.warning,
  danger_color: DEFAULT_PRESET.danger,
  info_color: DEFAULT_PRESET.info,
  navbar_color: DEFAULT_PRESET.navbar,
  sidebar_color: DEFAULT_PRESET.sidebar,
  card_color: DEFAULT_PRESET.card,

  // Legacy / fallback
  background_color: '#f5f0e8',
  surface_color: '#ffffff',
  text_base_color: '#1a1a2e',

  // Content
  hero_title: 'حيث تلتقي أصالة الشاي بالتجربة الاستثنائية',
  hero_subtitle: 'مرحباً بكم في',
  hero_tagline: 'استمتع بتشكيلة فريدة من الشاي المغربي',
  footer_text: 'نقدّم لكم أجود أنواع الشاي المغربي والكرك في أجواء تراثية دافئة.',
  social_links: {},

  // UI Flags
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

/**
 * Build a full palette object from settings, falling back to preset defaults.
 */
function buildPaletteFromSettings(settings) {
  const preset = THEME_PRESETS[settings.theme_preset] || DEFAULT_PRESET

  return {
    primary: settings.primary_color || preset.primary,
    secondary: settings.secondary_color || preset.secondary,
    accent: settings.accent_color || preset.accent,
    success: settings.success_color || preset.success,
    warning: settings.warning_color || preset.warning,
    danger: settings.danger_color || preset.danger,
    info: settings.info_color || preset.info,
    navbar: settings.navbar_color || preset.navbar,
    sidebar: settings.sidebar_color || preset.sidebar,
    card: settings.card_color || preset.card,
  }
}

export function applyTheme(settings) {
  const colors = buildPaletteFromSettings(settings)
  const palette = generatePalette(colors)
  applyPaletteToDocument(palette)

  if (settings.font_family) {
    document.documentElement.style.setProperty('--font-family', settings.font_family)
    document.body.style.fontFamily = `'${settings.font_family}', sans-serif`
  }
}

export function getCachedSettings() {
  return cachedSettings || { ...DEFAULT_SETTINGS }
}

export { DEFAULT_SETTINGS, DEFAULT_PRESET, buildPaletteFromSettings }
