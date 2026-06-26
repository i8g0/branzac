import { supabase } from './supabase'
import { generatePalette, applyPaletteToDocument, THEME_PRESETS } from './colorPalette'

const DEFAULT_PRESET = THEME_PRESETS.forest

const DEFAULT_SETTINGS = {
  site_name: 'محاصيل الشاي',
  site_name_en: 'Mahaseel Tea',
  logo_light_url: '/images/logo-transparent.png',
  logo_dark_url: '/images/logo-bg.png',
  font_family: 'Tajawal',
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
  hero_title: 'حيث تلتقي أصالة الشاي بالتجربة الاستثنائية',
  footer_text: 'نقدّم لكم أجود أنواع الشاي المغربي والكرك في أجواء تراثية دافئة.',
  theme_preset: 'forest',
}

let cachedSettings = null

export async function fetchSiteSettings() {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error) {
      console.warn('Fetch settings error:', error.message)
      return { ...DEFAULT_SETTINGS }
    }
    if (!data) return { ...DEFAULT_SETTINGS }

    cachedSettings = { ...DEFAULT_SETTINGS, ...data }
    return cachedSettings
  } catch (e) {
    console.warn('Settings fetch failed:', e)
    return { ...DEFAULT_SETTINGS }
  }
}

export async function updateSiteSettings(updates) {
  console.log('Saving via RPC:', updates)

  try {
    const { data, error } = await supabase
      .rpc('update_site_settings', { payload: updates })

    if (error) {
      console.error('RPC error:', error)
      throw error
    }

    console.log('RPC success:', data)
    cachedSettings = { ...DEFAULT_SETTINGS, ...data }
    applyTheme(cachedSettings)
    return cachedSettings
  } catch (e) {
    console.error('Save failed:', e)
    throw e
  }
}

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
    document.body.style.fontFamily = `'${settings.font_family}', sans-serif`
  }
}

export function getCachedSettings() {
  return cachedSettings || { ...DEFAULT_SETTINGS }
}

export { DEFAULT_SETTINGS, DEFAULT_PRESET, buildPaletteFromSettings }
