import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { testimonials as staticTestimonials } from '../data/menuData'

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
)

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
)

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
)

const TiktokIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
)

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
)

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
)

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
)

const DatabaseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
)

export default function AdminSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    phone: '+966 53 300 4327',
    whatsapp: '966533004327',
    instagram: 'https://www.instagram.com/branzac_/',
    tiktok: 'https://www.tiktok.com/@branzac_',
    address: 'الرياض، المملكة العربية السعودية',
    hours: [
      { day: 'الأحد - الأربعاء', hours: '4:00 م - 12:00 ص' },
      { day: 'الخميس - السبت', hours: '4:00 م - 1:00 ص' }
    ]
  })
  const [dbRecords, setDbRecords] = useState([])

  const fetchSettings = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category', '__site_settings__')

    if (data && data.length > 0) {
      setDbRecords(data)
      const newSettings = { ...settings }
      data.forEach(item => {
        if (item.name === 'hours') {
          try {
            newSettings.hours = JSON.parse(item.description)
          } catch (e) {
            console.error('Failed to parse hours', e)
          }
        } else {
          newSettings[item.name] = item.description
        }
      })
      setSettings(newSettings)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleHourChange = (index, field, value) => {
    const newHours = [...settings.hours]
    newHours[index][field] = value
    setSettings(prev => ({ ...prev, hours: newHours }))
  }

  const addHourRow = () => {
    setSettings(prev => ({ ...prev, hours: [...prev.hours, { day: '', hours: '' }] }))
  }

  const removeHourRow = (index) => {
    const newHours = settings.hours.filter((_, i) => i !== index)
    setSettings(prev => ({ ...prev, hours: newHours }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    for (const key of Object.keys(settings)) {
      const value = key === 'hours' ? JSON.stringify(settings[key]) : settings[key]

      const existing = dbRecords.find(r => r.name === key)
      if (existing) {
        await supabase.from('menu_items').update({ description: value }).eq('id', existing.id)
      } else {
        await supabase.from('menu_items').insert([{
          name: key,
          name_en: 'Site Setting',
          description: value,
          category: '__site_settings__',
          price: 0,
          image: ''
        }])
      }
    }

    setSaving(false)
    alert('تم حفظ الإعدادات العامة بنجاح!')
    fetchSettings()
  }

  const handleSeedData = async () => {
    if (!confirm('هل أنت متأكد من إضافة البيانات الافتراضية (الخدمات وآراء العملاء) لقاعدة البيانات؟')) return

    setSaving(true)

    const defaultServices = [
      {
        name: 'اطلب عبر QR Code',
        name_en: 'Site Service',
        description: 'امسح الكود على طاولتك، تصفّح المنيو، واطلب مباشرة من جوالك. طلبك يوصلك على طاولتك بدون انتظار.',
        price: 0,
        category: '__site_service__',
        image: ''
      },
      {
        name: 'مساحة عمل مشتركة',
        name_en: 'Site Service',
        description: 'بيئة عمل مثالية مع إنترنت فائق السرعة، منافذ شحن متعددة، ومناطق هادئة مصممة للإنتاجية والإبداع.',
        price: 0,
        category: '__site_service__',
        image: ''
      }
    ]

    const defaultTestimonials = staticTestimonials.map(t => ({
      name: t.name,
      name_en: 'عميل',
      description: t.text,
      price: 0,
      category: '__site_testimonial__',
      image: ''
    }))

    const { error: sErr } = await supabase.from('menu_items').insert([...defaultServices, ...defaultTestimonials])

    setSaving(false)
    if (sErr) {
      alert('حدث خطأ أثناء إضافة البيانات الافتراضية.')
    } else {
      alert('تمت إضافة الخدمات وآراء العملاء بنجاح! يمكنك الآن تعديلها من الأقسام المخصصة.')
    }
  }

  if (loading) return (
    <div className="settings-loading">
      <div className="admin-spinner"></div>
      <p>جاري تحميل الإعدادات...</p>
    </div>
  )

  return (
    <div className="admin-settings">
      <div className="admin-settings-header">
        <h2>الإعدادات العامة</h2>
        <p>تحكم في معلومات التواصل، روابط الشبكات الاجتماعية، وأوقات العمل المعروضة في الموقع.</p>
      </div>

      <form onSubmit={handleSave}>
        {/* معلومات الاتصال */}
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="settings-section-icon green">
              <PhoneIcon />
            </div>
            <div>
              <h3>معلومات الاتصال</h3>
              <span>رقم الجوال، الواتساب، والعنوان</span>
            </div>
          </div>
          <div className="settings-section-body">
            <div className="settings-form-grid">
              <div className="settings-field">
                <label>
                  <PhoneIcon /> رقم الجوال (للاتصال)
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  dir="ltr"
                  placeholder="+966 53 300 4327"
                />
              </div>
              <div className="settings-field">
                <label>
                  <WhatsAppIcon /> رقم الواتساب (للرابط المباشر)
                </label>
                <input
                  type="text"
                  value={settings.whatsapp}
                  onChange={e => handleChange('whatsapp', e.target.value)}
                  dir="ltr"
                  placeholder="966533004327"
                />
                <span className="field-hint">بدون + أو فراغات</span>
              </div>
              <div className="settings-field full-width">
                <label>
                  <MapPinIcon /> العنوان المعروض
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={e => handleChange('address', e.target.value)}
                  placeholder="الرياض، المملكة العربية السعودية"
                />
              </div>
            </div>
          </div>
        </div>

        {/* الشبكات الاجتماعية */}
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="settings-section-icon gold">
              <InstagramIcon />
            </div>
            <div>
              <h3>الشبكات الاجتماعية</h3>
              <span>روابط انستغرام وتيك توك</span>
            </div>
          </div>
          <div className="settings-section-body">
            <div className="settings-form-grid">
              <div className="settings-field">
                <label>
                  <InstagramIcon /> رابط انستغرام
                </label>
                <input
                  type="url"
                  value={settings.instagram}
                  onChange={e => handleChange('instagram', e.target.value)}
                  dir="ltr"
                  placeholder="https://www.instagram.com/..."
                />
              </div>
              <div className="settings-field">
                <label>
                  <TiktokIcon /> رابط تيك توك
                </label>
                <input
                  type="url"
                  value={settings.tiktok}
                  onChange={e => handleChange('tiktok', e.target.value)}
                  dir="ltr"
                  placeholder="https://www.tiktok.com/@..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* أوقات العمل */}
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="settings-section-icon blue">
              <ClockIcon />
            </div>
            <div>
              <h3>أوقات العمل</h3>
              <span>حدد أيام وساعات العمل</span>
            </div>
          </div>
          <div className="settings-section-body">
            <div className="settings-hours-list">
              {settings.hours.map((hour, index) => (
                <div key={index} className="settings-hour-row">
                  <input
                    type="text"
                    value={hour.day}
                    onChange={e => handleHourChange(index, 'day', e.target.value)}
                    placeholder="الأيام (مثال: الأحد - الأربعاء)"
                  />
                  <input
                    type="text"
                    value={hour.hours}
                    onChange={e => handleHourChange(index, 'hours', e.target.value)}
                    placeholder="الوقت (مثال: 4:00 م - 12:00 ص)"
                  />
                  <button
                    type="button"
                    onClick={() => removeHourRow(index)}
                    className="settings-hour-remove"
                    title="حذف الفترة"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addHourRow} className="settings-add-hour">
              + إضافة فترة عمل
            </button>
          </div>
        </div>

        {/* أزرار الحفظ */}
        <div className="settings-footer">
          <button
            type="button"
            onClick={handleSeedData}
            disabled={saving}
            className="settings-btn-secondary"
          >
            <DatabaseIcon /> استيراد البيانات الافتراضية
          </button>
          <button type="submit" className="settings-btn-primary" disabled={saving}>
            <SaveIcon />
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      </form>
    </div>
  )
}
