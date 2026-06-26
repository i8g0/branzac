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

// Only these columns exist in the DB
const DB_COLUMNS = [
  'id', 'site_name', 'site_name_en', 'logo_light_url', 'logo_dark_url', 'font_family',
  'primary_color', 'secondary_color', 'accent_color',
  'success_color', 'warning_color', 'danger_color', 'info_color',
  'navbar_color', 'sidebar_color', 'card_color',
  'hero_title', 'footer_text', 'theme_preset',
  'created_at', 'updated_at',
]

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
  // Only send known columns
  const payload = {}
  for (const key of DB_COLUMNS) {
    if (key === 'id' || key === 'created_at') continue
    if (updates[key] !== undefined) {
      payload[key] = updates[key]
    }
  }
  payload.updated_at = new Date().toISOString()

  console.log('Saving settings:', payload)

  try {
    // Get existing row
    const { data: existing, error: fetchErr } = await supabase
      .from('site_settings')
      .select('id')
      .limit(1)
      .maybeSingle()

    if (fetchErr) {
      console.error('Fetch existing error:', fetchErr)
      throw fetchErr
    }

    let result

    if (existing) {
      // Update existing row
      const { data, error } = await supabase
        .from('site_settings')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('Update error:', error)
        throw error
      }
      result = data
      console.log('Updated successfully:', result)
    } else {
      // Insert new row
      const { data, error } = await supabase
        .from('site_settings')
        .insert({ ...DEFAULT_SETTINGS, ...payload })
        .select()
        .single()

      if (error) {
        console.error('Insert error:', error)
        throw error
      }
      result = data
      console.log('Inserted successfully:', result)
    }

    cachedSettings = { ...DEFAULT_SETTINGS, ...result }
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
