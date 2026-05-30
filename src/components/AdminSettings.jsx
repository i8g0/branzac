import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { testimonials as staticTestimonials } from '../data/menuData'

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
    
    // Save each setting
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
    
    // Seed Services
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

    // Seed Testimonials
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

  if (loading) return <div className="admin-panel-loading">جاري تحميل الإعدادات...</div>

  return (
    <div className="admin-menu-manager">
      <div className="admin-menu-header">
        <h2>الإعدادات العامة ومعلومات التواصل</h2>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
        تحكم في معلومات التواصل، روابط الشبكات الاجتماعية، وأوقات العمل المعروضة في ذيل الصفحة (Footer) وقسم تواصل معنا.
      </p>

      <form onSubmit={handleSave} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ marginTop: 0, color: 'var(--gold)', marginBottom: '16px' }}>معلومات الاتصال</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>رقم الجوال (للاتصال)</label>
            <input 
              type="text" 
              value={settings.phone} 
              onChange={e => handleChange('phone', e.target.value)} 
              dir="ltr"
              placeholder="+966 53 300 4327"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>رقم الواتساب (للرابط المباشر)</label>
            <input 
              type="text" 
              value={settings.whatsapp} 
              onChange={e => handleChange('whatsapp', e.target.value)} 
              dir="ltr"
              placeholder="966533004327"
            />
            <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>بدون + أو فراغات</small>
          </div>
          <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
            <label>العنوان المعروض</label>
            <input 
              type="text" 
              value={settings.address} 
              onChange={e => handleChange('address', e.target.value)} 
            />
          </div>
        </div>

        <h3 style={{ color: 'var(--gold)', marginBottom: '16px' }}>الشبكات الاجتماعية</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>رابط انستغرام</label>
            <input 
              type="url" 
              value={settings.instagram} 
              onChange={e => handleChange('instagram', e.target.value)} 
              dir="ltr"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>رابط تيك توك</label>
            <input 
              type="url" 
              value={settings.tiktok} 
              onChange={e => handleChange('tiktok', e.target.value)} 
              dir="ltr"
            />
          </div>
        </div>

        <h3 style={{ color: 'var(--gold)', marginBottom: '16px' }}>أوقات العمل</h3>
        <div style={{ marginBottom: '32px' }}>
          {settings.hours.map((hour, index) => (
            <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <input 
                  type="text" 
                  value={hour.day} 
                  onChange={e => handleHourChange(index, 'day', e.target.value)} 
                  placeholder="الأيام (مثال: الأحد - الأربعاء)"
                />
              </div>
              <div style={{ flex: 1 }}>
                <input 
                  type="text" 
                  value={hour.hours} 
                  onChange={e => handleHourChange(index, 'hours', e.target.value)} 
                  placeholder="الوقت (مثال: 4:00 م - 12:00 ص)"
                />
              </div>
              <button type="button" onClick={() => removeHourRow(index)} className="delete-btn" style={{ padding: '8px 12px' }}>✕</button>
            </div>
          ))}
          <button type="button" onClick={addHourRow} className="add-item-btn" style={{ fontSize: '0.85rem', padding: '6px 12px', background: 'var(--gray-800)' }}>+ إضافة فترة عمل</button>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" onClick={handleSeedData} disabled={saving} className="add-item-btn" style={{ background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)' }}>
            استيراد البيانات الافتراضية
          </button>
          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      </form>
    </div>
  )
}
