import { create } from 'zustand'
import { generatePalette, applyPaletteToDocument, THEME_PRESETS } from '../lib/colorPalette'
import { fetchSiteSettings, updateSiteSettings, applyTheme, DEFAULT_SETTINGS } from '../lib/siteSettings'

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
      const palette = generatePalette(
        settings.primary_color,
        settings.secondary_color,
        settings.accent_color
      )
      applyPaletteToDocument(palette)
      applyTheme(settings)
      // Cache to localStorage for anti-FOUC script
      try { localStorage.setItem('site_settings_cache', JSON.stringify(settings)) } catch(e) {}
      set({ settings, palette, isLoaded: true, isLoading: false })
    } catch (e) {
      set({ error: e.message, isLoading: false })
      // Apply defaults on error
      const palette = generatePalette(
        DEFAULT_SETTINGS.primary_color,
        DEFAULT_SETTINGS.secondary_color,
        DEFAULT_SETTINGS.accent_color
      )
      applyPaletteToDocument(palette)
      set({ settings: { ...DEFAULT_SETTINGS }, palette, isLoaded: true })
    }
  },

  updateSetting: (key, value) => {
    const settings = { ...get().settings, [key]: value }
    set({ settings })

    // Live preview: regenerate palette if color changed
    if (key.endsWith('_color')) {
      const palette = generatePalette(
        settings.primary_color,
        settings.secondary_color,
        settings.accent_color
      )
      applyPaletteToDocument(palette)
      set({ palette })
    }
  },

  applyPreset: (presetKey) => {
    const preset = THEME_PRESETS[presetKey]
    if (!preset) return

    const settings = {
      ...get().settings,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      accent_color: preset.accent,
      theme_preset: presetKey,
    }

    const palette = generatePalette(preset.primary, preset.secondary, preset.accent)
    applyPaletteToDocument(palette)
    set({ settings, palette })
  },

  saveSettings: async () => {
    set({ isLoading: true, error: null })
    try {
      const settings = get().settings
      const saved = await updateSiteSettings(settings)
      set({ settings: saved, isLoading: false })
      return saved
    } catch (e) {
      set({ error: e.message, isLoading: false })
      throw e
    }
  },

  resetToDefaults: () => {
    const settings = { ...DEFAULT_SETTINGS }
    const palette = generatePalette(
      settings.primary_color,
      settings.secondary_color,
      settings.accent_color
    )
    applyPaletteToDocument(palette)
    set({ settings, palette })
  },
}))

export default useThemeStore
