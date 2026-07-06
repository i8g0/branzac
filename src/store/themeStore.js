import { create } from 'zustand'
import { generatePalette, applyPaletteToDocument, THEME_PRESETS } from '../lib/colorPalette'
import { fetchSiteSettings, updateSiteSettings, applyTheme, DEFAULT_SETTINGS, buildPaletteFromSettings } from '../lib/siteSettings'

const COLOR_FIELDS = [
  'primary_color', 'secondary_color', 'accent_color',
  'success_color', 'warning_color', 'danger_color', 'info_color',
  'navbar_color', 'sidebar_color', 'card_color',
]

const useThemeStore = create((set, get) => ({
  settings: { ...DEFAULT_SETTINGS },
  palette: null,
  isLoaded: false,
  isLoading: false,
  error: null,

  loadSettings: async () => {
    set({ isLoading: true, error: null })
    try {
      const settings = await fetchSiteSettings()
      const colors = buildPaletteFromSettings(settings)
      const palette = generatePalette(colors)
      applyPaletteToDocument(palette)
      applyTheme(settings)
      try { localStorage.setItem('site_settings_cache', JSON.stringify(settings)) } catch(e) {}
      set({ settings, palette, isLoaded: true, isLoading: false })
    } catch (e) {
      set({ error: e.message, isLoading: false })
      const colors = buildPaletteFromSettings(DEFAULT_SETTINGS)
      const palette = generatePalette(colors)
      applyPaletteToDocument(palette)
      set({ settings: { ...DEFAULT_SETTINGS }, palette, isLoaded: true })
    }
  },

  updateSetting: (key, value) => {
    const settings = { ...get().settings, [key]: value }
    set({ settings })

    if (COLOR_FIELDS.includes(key) || key === 'theme_preset') {
      const colors = buildPaletteFromSettings(settings)
      const palette = generatePalette(colors)
      applyPaletteToDocument(palette)
      set({ palette })
    }
  },

  applyPreset: async (presetKey) => {
    const preset = THEME_PRESETS[presetKey]
    if (!preset) return

    const settings = {
      ...get().settings,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      accent_color: preset.accent,
      success_color: preset.success,
      warning_color: preset.warning,
      danger_color: preset.danger,
      info_color: preset.info,
      navbar_color: preset.navbar,
      sidebar_color: preset.sidebar,
      card_color: preset.card,
      theme_preset: presetKey,
    }

    // Apply locally first for instant feedback
    const colors = buildPaletteFromSettings(settings)
    const palette = generatePalette(colors)
    applyPaletteToDocument(palette)
    set({ settings, palette })

    // Save to DB
    try {
      await updateSiteSettings(settings)
      try { localStorage.setItem('site_settings_cache', JSON.stringify(settings)) } catch(e) {}
    } catch (e) {
      console.error('Failed to save preset:', e)
    }
  },

  saveSettings: async () => {
    set({ isLoading: true, error: null })
    try {
      const settings = get().settings
      const saved = await updateSiteSettings(settings)
      try { localStorage.setItem('site_settings_cache', JSON.stringify(saved)) } catch(e) {}
      set({ settings: saved, isLoading: false })
      return saved
    } catch (e) {
      set({ error: e.message, isLoading: false })
      throw e
    }
  },

  resetToDefaults: async () => {
    const settings = { ...DEFAULT_SETTINGS }
    const colors = buildPaletteFromSettings(settings)
    const palette = generatePalette(colors)
    applyPaletteToDocument(palette)
    set({ settings, palette })
    try {
      await updateSiteSettings(settings)
    } catch (e) {
      console.error('Failed to reset:', e)
    }
  },
}))

export default useThemeStore
