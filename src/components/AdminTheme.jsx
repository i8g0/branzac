import { useState, useCallback } from 'react'
import useThemeStore from '../stores/themeStore'
import { THEME_PRESETS } from '../lib/colorPalette'

const PaletteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="12" r="1.5" fill="currentColor"/><circle cx="16" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg>
)

const TypeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
)

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
)

const ImageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
)

const FONT_OPTIONS = [
  { value: 'Tajawal', label: 'Tajawal (الافتراضي)' },
  { value: 'Outfit', label: 'Outfit' },
  { value: 'Cairo', label: 'Cairo' },
  { value: 'Almarai', label: 'Almarai' },
  { value: 'IBM Plex Sans Arabic', label: 'IBM Plex Sans Arabic' },
  { value: 'Noto Kufi Arabic', label: 'Noto Kufi Arabic' },
]

export default function AdminTheme() {
  const { settings, palette, isLoading, updateSetting, applyPreset, saveSettings, resetToDefaults } = useThemeStore()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = useCallback(async () => {
    setSaving(true)
    setSaved(false)
    try {
      await saveSettings()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      alert('حدث خطأ أثناء حفظ الإعدادات')
    }
    setSaving(false)
  }, [saveSettings])

  const handlePresetApply = useCallback((presetKey) => {
    applyPreset(presetKey)
  }, [applyPreset])

  return (
    <div className="admin-settings">
      <div className="admin-settings-header">
        <h2>إعدادات المظهر</h2>
        <p>تحكم في الهوية البصرية للموقع — الألوان، الخطوط، والشعار.</p>
      </div>

      {/* Theme Presets */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-icon green">
            <PaletteIcon />
          </div>
          <div>
            <h3>قوالب الألوان الجاهزة</h3>
            <span>اختر قالباً مسبقاً أو خصّص الألوان يدوياً</span>
          </div>
        </div>
        <div className="settings-section-body">
          <div className="theme-presets-grid">
            {Object.entries(THEME_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                className={`theme-preset-card ${settings.theme_preset === key ? 'active' : ''}`}
                onClick={() => handlePresetApply(key)}
              >
                <div className="theme-preset-colors">
                  <span style={{ background: preset.primary }} />
                  <span style={{ background: preset.secondary }} />
                  <span style={{ background: preset.accent }} />
                </div>
                <span className="theme-preset-name">{preset.name}</span>
                <span className="theme-preset-name-en">{preset.nameEn}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Color Picker */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-icon gold">
            <PaletteIcon />
          </div>
          <div>
            <h3>تخصيص الألوان</h3>
            <span>اختر الألوان الرئيسية والفرعية</span>
          </div>
        </div>
        <div className="settings-section-body">
          <div className="theme-color-grid">
            <div className="theme-color-field">
              <label>اللون الأساسي</label>
              <div className="theme-color-input-wrap">
                <input
                  type="color"
                  value={settings.primary_color}
                  onChange={e => updateSetting('primary_color', e.target.value)}
                  className="theme-color-input"
                />
                <input
                  type="text"
                  value={settings.primary_color}
                  onChange={e => updateSetting('primary_color', e.target.value)}
                  className="theme-color-text"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="theme-color-field">
              <label>اللون الثانوي</label>
              <div className="theme-color-input-wrap">
                <input
                  type="color"
                  value={settings.secondary_color}
                  onChange={e => updateSetting('secondary_color', e.target.value)}
                  className="theme-color-input"
                />
                <input
                  type="text"
                  value={settings.secondary_color}
                  onChange={e => updateSetting('secondary_color', e.target.value)}
                  className="theme-color-text"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="theme-color-field">
              <label>لون التمييز</label>
              <div className="theme-color-input-wrap">
                <input
                  type="color"
                  value={settings.accent_color}
                  onChange={e => updateSetting('accent_color', e.target.value)}
                  className="theme-color-input"
                />
                <input
                  type="text"
                  value={settings.accent_color}
                  onChange={e => updateSetting('accent_color', e.target.value)}
                  className="theme-color-text"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="theme-live-preview">
            <h4>معاينة مباشرة</h4>
            <div className="theme-preview-card">
              <div className="theme-preview-header" style={{ background: settings.primary_color }}>
                <span className="theme-preview-logo">م</span>
                <span style={{ color: '#fff' }}>{settings.site_name}</span>
              </div>
              <div className="theme-preview-body">
                <div className="theme-preview-text" style={{ color: settings.primary_color }}>عنوان قسم</div>
                <p className="theme-preview-desc">هذا نص تجريبي لمعاينة كيف سيبدو المحتوى بالألوان المحددة.</p>
                <div className="theme-preview-btns">
                  <span className="theme-preview-btn primary" style={{ background: settings.primary_color }}>زر أساسي</span>
                  <span className="theme-preview-btn secondary" style={{ background: settings.secondary_color, color: '#fff' }}>زر ثانوي</span>
                </div>
              </div>
              <div className="theme-preview-footer" style={{ borderTopColor: settings.accent_color }}>
                <span style={{ color: settings.accent_color }}>المزيد ←</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-icon blue">
            <TypeIcon />
          </div>
          <div>
            <h3>الخطوط</h3>
            <span>اختر خط العناصر والمحتوى</span>
          </div>
        </div>
        <div className="settings-section-body">
          <div className="theme-font-grid">
            <div className="settings-field">
              <label>خط الموقع</label>
              <select
                value={settings.font_family}
                onChange={e => updateSetting('font_family', e.target.value)}
                className="theme-font-select"
              >
                {FONT_OPTIONS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <div className="theme-font-preview" style={{ fontFamily: `'${settings.font_family}', sans-serif` }}>
                محاصيل الشاي — حيث تلتقي الأصالة بالجودة
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-icon green">
            <TypeIcon />
          </div>
          <div>
            <h3>المحتوى</h3>
            <span>عنوان البانر الرئيسي ونص التذييل</span>
          </div>
        </div>
        <div className="settings-section-body">
          <div className="settings-form-grid">
            <div className="settings-field">
              <label>اسم الموقع (عربي)</label>
              <input
                type="text"
                value={settings.site_name}
                onChange={e => updateSetting('site_name', e.target.value)}
              />
            </div>
            <div className="settings-field">
              <label>اسم الموقع (إنجليزي)</label>
              <input
                type="text"
                value={settings.site_name_en}
                onChange={e => updateSetting('site_name_en', e.target.value)}
                dir="ltr"
              />
            </div>
            <div className="settings-field full-width">
              <label>عنوان البانر الرئيسي</label>
              <input
                type="text"
                value={settings.hero_title}
                onChange={e => updateSetting('hero_title', e.target.value)}
              />
            </div>
            <div className="settings-field full-width">
              <label>نص التذييل</label>
              <textarea
                value={settings.footer_text}
                onChange={e => updateSetting('footer_text', e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logos */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-icon gold">
            <ImageIcon />
          </div>
          <div>
            <h3>الشعارات</h3>
            <span>رابط الشعار الخفيف والداكن</span>
          </div>
        </div>
        <div className="settings-section-body">
          <div className="settings-form-grid">
            <div className="settings-field">
              <label>رابط الشعار (خلفية شفافة)</label>
              <input
                type="text"
                value={settings.logo_light_url}
                onChange={e => updateSetting('logo_light_url', e.target.value)}
                dir="ltr"
                placeholder="/images/logo-transparent.png"
              />
            </div>
            <div className="settings-field">
              <label>رابط الشعار (خلفية داكنة)</label>
              <input
                type="text"
                value={settings.logo_dark_url}
                onChange={e => updateSetting('logo_dark_url', e.target.value)}
                dir="ltr"
                placeholder="/images/logo-bg.png"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="settings-footer">
        <button
          type="button"
          onClick={resetToDefaults}
          className="settings-btn-secondary"
        >
          إعادة تعيين
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="settings-btn-primary"
        >
          <SaveIcon />
          {saving ? 'جاري الحفظ...' : saved ? 'تم الحفظ ✓' : 'حفظ إعدادات المظهر'}
        </button>
      </div>
    </div>
  )
}
