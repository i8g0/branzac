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
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
)
const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
)
const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
)

const FONT_OPTIONS = [
  { value: 'Tajawal', label: 'Tajawal' },
  { value: 'Outfit', label: 'Outfit' },
  { value: 'Cairo', label: 'Cairo' },
  { value: 'Almarai', label: 'Almarai' },
  { value: 'IBM Plex Sans Arabic', label: 'IBM Plex Sans Arabic' },
  { value: 'Noto Kufi Arabic', label: 'Noto Kufi Arabic' },
]

const COLOR_SECTIONS = [
  {
    title: 'الألوان الأساسية',
    desc: 'الهوية البصرية الرئيسية',
    fields: [
      { key: 'primary_color', label: 'اللون الأساسي', hint: 'اللون الرئيسي للموقع' },
      { key: 'secondary_color', label: 'اللون الثانوي', hint: 'للعناصر المساعدة' },
      { key: 'accent_color', label: 'لون التمييز', hint: 'للروابط والأيقونات' },
    ],
  },
  {
    title: 'ألوان الحالة',
    desc: 'للرسائل والأزرار والتنبيهات',
    fields: [
      { key: 'success_color', label: 'نجاح', hint: 'أخضر — للرسائل الإيجابية' },
      { key: 'warning_color', label: 'تحذير', hint: 'برتقالي — للتنبيهات' },
      { key: 'danger_color', label: 'خطأ / حذف', hint: 'أحمر — للإجراءات الخطيرة' },
      { key: 'info_color', label: 'معلومات', hint: 'أزرق — للمعلومات' },
    ],
  },
  {
    title: 'ألوان العناصر',
    desc: 'شريط التنقل والجوانب والبطاقات',
    fields: [
      { key: 'navbar_color', label: 'شريط التنقل', hint: 'الهيدر العلوي' },
      { key: 'sidebar_color', label: 'الشريط الجانبي', hint: 'لوحة التحكم' },
      { key: 'card_color', label: 'خلفية البطاقات', hint: 'خلفية عناصر المنيو' },
    ],
  },
]

const PRESET_ICONS = {
  forest: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V8"/><path d="M5 12l7-8 7 8"/><path d="M8 16l4-5 4 5"/></svg>,
  desertGold: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  warmCafe: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>,
  darkElegance: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  ocean: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0 4 3 6 0"/><path d="M2 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0 4 3 6 0"/><path d="M2 7c2-3 4-3 6 0s4 3 6 0 4-3 6 0 4 3 6 0"/></svg>,
  sunset: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><line x1="16" y1="5" x2="19" y2="2"/><line x1="2" y1="2" x2="5" y2="5"/></svg>,
  minimal: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>,
  lavender: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c-4.97 0-9-2.03-9-9V4c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v1c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V4c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v9c0 6.97-4.03 9-9 9z"/></svg>,
  sage: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c-4.97 0-9-2.03-9-9V4c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v1c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V4c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v9c0 6.97-4.03 9-9 9z"/></svg>,
  royal: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4l3 12h14l3-12-5 4-5-4-5 4z"/><path d="M5 16h14v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2z"/></svg>,
  roseGold: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c-4.97 0-9-2.03-9-9V4c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v1c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V4c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v9c0 6.97-4.03 9-9 9z"/></svg>,
  turquoise: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  mocha: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>,
}

export default function AdminTheme() {
  const { settings, isLoading, updateSetting, applyPreset, saveSettings, resetToDefaults } = useThemeStore()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const autoSave = useCallback(async () => {
    setSaving(true)
    setSaveError(null)
    try {
      await saveSettings()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setSaveError(e.message || 'خطأ')
    }
    setSaving(false)
  }, [saveSettings])

  const handleColorChange = useCallback((key, value) => {
    updateSetting(key, value)
    autoSave()
  }, [updateSetting, autoSave])

  const handleSave = useCallback(async () => {
    setSaving(true)
    setSaved(false)
    setSaveError(null)
    try {
      await saveSettings()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      setSaveError(e.message || 'خطأ غير معروف')
    }
    setSaving(false)
  }, [saveSettings])

  const handlePresetClick = useCallback(async (presetKey) => {
    applyPreset(presetKey)
    // Auto-save when selecting a preset
    setSaving(true)
    setSaveError(null)
    try {
      await saveSettings()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      setSaveError(e.message || 'خطأ غير معروف')
    }
    setSaving(false)
  }, [applyPreset, saveSettings])

  return (
    <div className="admin-settings">
      <div className="admin-settings-header">
        <h2>إعدادات المظهر</h2>
        <p>تحكم كامل في الهوية البصرية — الألوان، الأزرار، الشعارات، والخطوط.</p>
      </div>

      {/* Status messages */}
      {saved && (
        <div className="theme-status-bar theme-status-success">
          <CheckCircleIcon /> تم الحفظ بنجاح
        </div>
      )}
      {saveError && (
        <div className="theme-status-bar theme-status-error">
          <AlertIcon /> فشل الحفظ: {saveError}
        </div>
      )}

      {/* Presets */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-icon green"><PaletteIcon /></div>
          <div>
            <h3>قوالب الهوية البصرية الجاهزة</h3>
            <span>اختر قالباً — يُحفظ تلقائياً</span>
          </div>
        </div>
        <div className="settings-section-body">
          <div className="theme-presets-grid">
            {Object.entries(THEME_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                className={`theme-preset-card ${settings.theme_preset === key ? 'active' : ''}`}
                onClick={() => handlePresetClick(key)}
                disabled={saving}
              >
                <span className="theme-preset-icon">{PRESET_ICONS[key]}</span>
                <div className="theme-preset-colors">
                  <span style={{ background: preset.primary }} />
                  <span style={{ background: preset.secondary }} />
                  <span style={{ background: preset.accent }} />
                  <span style={{ background: preset.navbar }} />
                  <span style={{ background: preset.danger }} />
                </div>
                <span className="theme-preset-name">{preset.name}</span>
                <span className="theme-preset-name-en">{preset.nameEn}</span>
                {settings.theme_preset === key && (
                  <span className="theme-preset-active-badge"><CheckIcon /> مفعّل</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Full Color Customization */}
      {COLOR_SECTIONS.map((section) => (
        <div className="settings-section" key={section.title}>
          <div className="settings-section-header">
            <div className="settings-section-icon gold"><PaletteIcon /></div>
            <div>
              <h3>{section.title}</h3>
              <span>{section.desc}</span>
            </div>
          </div>
          <div className="settings-section-body">
            <div className="theme-color-grid-full">
              {section.fields.map((field) => (
                <div className="theme-color-field" key={field.key}>
                  <label>{field.label}</label>
                  <div className="theme-color-input-wrap">
                    <input
                      type="color"
                      value={settings[field.key] || '#000000'}
                      onChange={e => handleColorChange(field.key, e.target.value)}
                      className="theme-color-input"
                    />
                    <input
                      type="text"
                      value={settings[field.key] || ''}
                      onChange={e => handleColorChange(field.key, e.target.value)}
                      className="theme-color-text"
                      dir="ltr"
                    />
                  </div>
                  {field.hint && <span className="theme-color-hint">{field.hint}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Live Preview */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-icon green"><PaletteIcon /></div>
          <div>
            <h3>معاينة مباشرة</h3>
            <span>كيف سيبدو الموقع بالألوان المحددة</span>
          </div>
        </div>
        <div className="settings-section-body">
          <div className="theme-preview-full">
            <div className="theme-preview-navbar" style={{ background: settings.navbar_color }}>
              <span className="theme-preview-logo-sm" style={{ background: settings.primary_color + '30', color: settings.primary_color }}>M</span>
              <span style={{ color: '#fff', fontWeight: 700 }}>{settings.site_name}</span>
              <div className="theme-preview-nav-btns">
                <span className="preview-nav-btn" style={{ background: settings.primary_color, color: '#fff' }}>المنيو</span>
                <span className="preview-nav-btn" style={{ background: settings.secondary_color, color: '#fff' }}>تواصل</span>
              </div>
            </div>
            <div className="theme-preview-content">
              <div className="theme-preview-hero" style={{ background: `linear-gradient(135deg, ${settings.primary_color}, ${settings.secondary_color})` }}>
                <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>عنوان رئيسي</span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem' }}>نص فرعي تجريبي</span>
              </div>
              <div className="theme-preview-card-row">
                <div className="theme-preview-mini-card" style={{ borderColor: settings.card_color }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: settings.accent_color + '20' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>عنصر المنيو</span>
                  <span style={{ color: settings.primary_color, fontWeight: 700, fontSize: '0.85rem' }}>15 ر.س</span>
                </div>
                <div className="theme-preview-mini-card" style={{ borderColor: settings.card_color }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: settings.info_color + '20' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>عنصر آخر</span>
                  <span style={{ color: settings.primary_color, fontWeight: 700, fontSize: '0.85rem' }}>20 ر.س</span>
                </div>
              </div>
            </div>
            <div className="theme-preview-buttons">
              <h4>الأزرار</h4>
              <div className="theme-preview-btn-row">
                <span className="preview-btn" style={{ background: settings.primary_color, color: '#fff' }}>أساسي</span>
                <span className="preview-btn" style={{ background: settings.secondary_color, color: '#fff' }}>ثانوي</span>
                <span className="preview-btn" style={{ background: settings.accent_color, color: '#fff' }}>تمييز</span>
                <span className="preview-btn" style={{ border: `2px solid ${settings.primary_color}`, color: settings.primary_color, background: 'transparent' }}>مخطط</span>
                <span className="preview-btn" style={{ background: 'transparent', color: settings.primary_color }}>شبح</span>
              </div>
              <h4>الألوان والتنبيهات</h4>
              <div className="theme-preview-btn-row">
                <span className="preview-badge" style={{ background: settings.success_color + '18', color: settings.success_color }}>نجاح</span>
                <span className="preview-badge" style={{ background: settings.warning_color + '18', color: settings.warning_color }}>تحذير</span>
                <span className="preview-badge" style={{ background: settings.danger_color + '18', color: settings.danger_color }}>خطأ</span>
                <span className="preview-badge" style={{ background: settings.info_color + '18', color: settings.info_color }}>معلومة</span>
              </div>
              <h4>شريط التنقل السفلي</h4>
              <div className="theme-preview-bottombar" style={{ background: settings.navbar_color }}>
                <span style={{ color: '#fff', fontSize: '0.75rem' }}>الرئيسية</span>
                <span style={{ color: settings.accent_color, fontSize: '0.75rem' }}>السلة</span>
                <span style={{ color: '#fff', fontSize: '0.75rem' }}>تواصل</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-icon blue"><TypeIcon /></div>
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
          <div className="settings-section-icon green"><TypeIcon /></div>
          <div>
            <h3>المحتوى</h3>
            <span>اسم الموقع والبانر والتذييل</span>
          </div>
        </div>
        <div className="settings-section-body">
          <div className="settings-form-grid">
            <div className="settings-field">
              <label>اسم الموقع (عربي)</label>
              <input type="text" value={settings.site_name} onChange={e => updateSetting('site_name', e.target.value)} />
            </div>
            <div className="settings-field">
              <label>اسم الموقع (إنجليزي)</label>
              <input type="text" value={settings.site_name_en} onChange={e => updateSetting('site_name_en', e.target.value)} dir="ltr" />
            </div>
            <div className="settings-field full-width">
              <label>عنوان البانر الرئيسي</label>
              <input type="text" value={settings.hero_title} onChange={e => updateSetting('hero_title', e.target.value)} />
            </div>
            <div className="settings-field full-width">
              <label>نص التذييل</label>
              <textarea value={settings.footer_text} onChange={e => updateSetting('footer_text', e.target.value)} rows={2} />
            </div>
          </div>
        </div>
      </div>

      {/* Logos */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-icon gold"><ImageIcon /></div>
          <div>
            <h3>الشعارات</h3>
            <span>رابط الشعار الخفيف والداكن</span>
          </div>
        </div>
        <div className="settings-section-body">
          <div className="settings-form-grid">
            <div className="settings-field">
              <label>رابط الشعار (خلفية شفافة)</label>
              <input type="text" value={settings.logo_light_url} onChange={e => updateSetting('logo_light_url', e.target.value)} dir="ltr" placeholder="/images/logo-transparent.png" />
            </div>
            <div className="settings-field">
              <label>رابط الشعار (خلفية داكنة)</label>
              <input type="text" value={settings.logo_dark_url} onChange={e => updateSetting('logo_dark_url', e.target.value)} dir="ltr" placeholder="/images/logo-bg.png" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="settings-footer">
        <button type="button" onClick={resetToDefaults} className="settings-btn-secondary">إعادة تعيين</button>
        <button type="button" onClick={handleSave} disabled={saving} className="settings-btn-primary">
          <SaveIcon />
          {saving ? 'جاري الحفظ...' : saved ? 'تم الحفظ' : 'حفظ يدوياً'}
        </button>
      </div>
    </div>
  )
}
