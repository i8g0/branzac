import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { uploadImage } from '../lib/uploadImage'
import AdminModal from './ui/AdminModal'

export default function AdminHero() {
  const [slides, setSlides] = useState([])
  const [aboutData, setAboutData] = useState(null)
  const [logoData, setLogoData] = useState(null)
  const [welcomeData, setWelcomeData] = useState(null)
  const [taglineData, setTaglineData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploadingBg, setUploadingBg] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingAboutImg, setUploadingAboutImg] = useState(false)
  const [editingSlide, setEditingSlide] = useState(null)
  const [editingAbout, setEditingAbout] = useState(false)
  const [welcomeForm, setWelcomeForm] = useState({ name: 'مرحباً بكم في' })
  const [taglineForm, setTaglineForm] = useState({ name: 'حيث تلتقي أصالة الشاي بالتجربة الاستثنائية' })
  const [formData, setFormData] = useState({ name: '', image: '', description: '' })
  const [aboutForm, setAboutForm] = useState({ name: '', description: '', image: '', blur_data: '' })
  const [slideBlur, setSlideBlur] = useState('')

  const fetchSlidesAndAbout = async () => {
    setLoading(true)
    const [slideRes, aboutRes, logoRes, welcomeRes, taglineRes] = await Promise.all([
      supabase.from('menu_items').select('*').eq('category', '__hero_slide__').order('created_at', { ascending: true }),
      supabase.from('menu_items').select('*').eq('category', '__site_about__').maybeSingle(),
      supabase.from('menu_items').select('*').eq('category', '__site_logo__').maybeSingle(),
      supabase.from('menu_items').select('*').eq('category', '__site_welcome__').maybeSingle(),
      supabase.from('menu_items').select('*').eq('category', '__site_tagline__').maybeSingle(),
    ])
    if (slideRes.data) setSlides(slideRes.data)
    if (aboutRes.data) setAboutData(aboutRes.data)
    if (logoRes.data) setLogoData(logoRes.data)
    if (welcomeRes.data) { setWelcomeData(welcomeRes.data); setWelcomeForm({ name: welcomeRes.data.name }) }
    if (taglineRes.data) { setTaglineData(taglineRes.data); setTaglineForm({ name: taglineRes.data.name }) }
    setLoading(false)
  }

  useEffect(() => { fetchSlidesAndAbout() }, [])

  const handleGlobalLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    const { error, publicUrl } = await uploadImage(file, 'logo')
    setUploadingLogo(false)
    if (error) { alert('حدث خطأ أثناء رفع الشعار'); return }
    const payload = { name: 'شعار الموقع الرئيسي', name_en: 'Site Logo', description: 'Site Logo URL', price: 0, category: '__site_logo__', image: publicUrl }
    if (logoData) await supabase.from('menu_items').update(payload).eq('id', logoData.id)
    else await supabase.from('menu_items').insert([payload])
    fetchSlidesAndAbout()
  }

  const handleSaveHeroTexts = async (e) => {
    e.preventDefault()
    const wp = { name: welcomeForm.name || 'مرحباً بكم في', name_en: 'Site Welcome', description: 'Site Welcome Phrase', price: 0, category: '__site_welcome__', image: '' }
    if (welcomeData) await supabase.from('menu_items').update(wp).eq('id', welcomeData.id)
    else await supabase.from('menu_items').insert([wp])
    const tp = { name: taglineForm.name || 'حيث تلتقي أصالة الشاي بالتجربة الاستثنائية', name_en: 'Site Tagline', description: 'Site Main Tagline', price: 0, category: '__site_tagline__', image: '' }
    if (taglineData) await supabase.from('menu_items').update(tp).eq('id', taglineData.id)
    else await supabase.from('menu_items').insert([tp])
    alert('تم حفظ النصوص بنجاح!')
    fetchSlidesAndAbout()
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBg(true)
    const { error, publicUrl, blurData } = await uploadImage(file, 'hero')
    setUploadingBg(false)
    if (error) { alert('حدث خطأ أثناء رفع الصورة'); return }
    setSlideBlur(blurData || '')
    setFormData(prev => ({ ...prev, image: publicUrl }))
  }

  const handleSaveSlide = async (e) => {
    e.preventDefault()
    if (!formData.image) { alert('الرجاء رفع صورة'); return }
    const payload = { name: formData.name || 'شريحة ترحيبية', name_en: 'Hero Slide', description: '', price: 0, category: '__hero_slide__', image: formData.image }
    if (slideBlur) payload.blur_data = slideBlur
    if (editingSlide === 'new') {
      let { error } = await supabase.from('menu_items').insert([payload])
      if (error) { delete payload.blur_data; await supabase.from('menu_items').insert([payload]) }
    } else {
      let { error } = await supabase.from('menu_items').update(payload).eq('id', editingSlide)
      if (error) { delete payload.blur_data; await supabase.from('menu_items').update(payload).eq('id', editingSlide) }
    }
    setEditingSlide(null); setSlideBlur(''); setFormData({ name: '', image: '', description: '' })
    fetchSlidesAndAbout()
  }

  const handleAboutImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAboutImg(true)
    const { error, publicUrl, blurData } = await uploadImage(file, 'about')
    setUploadingAboutImg(false)
    if (error) { alert('حدث خطأ أثناء رفع الصورة'); return }
    setAboutForm(prev => ({ ...prev, image: publicUrl, blur_data: blurData || prev.blur_data }))
  }

  const handleSaveAbout = async (e) => {
    e.preventDefault()
    const payload = { name: aboutForm.name || 'شغفنا بالشاي المغربي الأصيل', name_en: 'About Settings', description: aboutForm.description, price: 0, category: '__site_about__', image: aboutForm.image }
    if (aboutForm.blur_data) payload.blur_data = aboutForm.blur_data
    if (aboutData) {
      let { error } = await supabase.from('menu_items').update(payload).eq('id', aboutData.id)
      if (error?.message?.includes('blur_data')) { delete payload.blur_data; await supabase.from('menu_items').update(payload).eq('id', aboutData.id) }
    } else {
      let { error } = await supabase.from('menu_items').insert([payload])
      if (error?.message?.includes('blur_data')) { delete payload.blur_data; await supabase.from('menu_items').insert([payload]) }
    }
    setEditingAbout(false); fetchSlidesAndAbout()
  }

  const handleDeleteSlide = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذه الشريحة؟')) {
      await supabase.from('menu_items').delete().eq('id', id)
      fetchSlidesAndAbout()
    }
  }

  if (loading) return <div className="settings-loading"><div className="admin-spinner"></div><p>جاري تحميل البيانات...</p></div>

  return (
    <div className="admin-settings">

      {/* شعار الموقع */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-icon green">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
          <div>
            <h3>شعار الموقع الرئيسي</h3>
            <span>يظهر في الهيدر والفوتر وقسم الترحيب</span>
          </div>
        </div>
        <div className="settings-section-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ width: 80, height: 80, borderRadius: 12, background: '#071610', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src={logoData?.image || '/images/logo-bg.png'} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <label className="settings-btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                {uploadingLogo ? 'جاري الرفع...' : 'رفع شعار جديد'}
                <input type="file" accept="image/*" onChange={handleGlobalLogoUpload} disabled={uploadingLogo} style={{ display: 'none' }} />
              </label>
              <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light)', marginTop: 6 }}>PNG شفافة مفضلة</span>
            </div>
          </div>
        </div>
      </div>

      {/* نصوص الترحيب */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-icon gold">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </div>
          <div>
            <h3>نصوص قسم الترحيب</h3>
            <span>النصوص التي تظهر فوق وتحت الشعار</span>
          </div>
        </div>
        <div className="settings-section-body">
          <form onSubmit={handleSaveHeroTexts}>
            <div className="settings-form-grid">
              <div className="settings-field">
                <label>النص الترحيبي (فوق الشعار)</label>
                <input type="text" value={welcomeForm.name} onChange={(e) => setWelcomeForm({ ...welcomeForm, name: e.target.value })} placeholder="مرحباً بكم في" />
              </div>
              <div className="settings-field">
                <label>العبارة الرئيسية (تحت الشعار)</label>
                <input type="text" value={taglineForm.name} onChange={(e) => setTaglineForm({ ...taglineForm, name: e.target.value })} placeholder="حيث تلتقي أصالة الشاي بالتجربة الاستثنائية" />
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="settings-btn-primary">حفظ النصوص</button>
            </div>
          </form>
        </div>
      </div>

      {/* شرائح الخلفية */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-icon blue">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
          <div>
            <h3>شرائح الخلفية</h3>
            <span>صور خلفية قسم الترحيب الرئيسية</span>
          </div>
        </div>
        <div className="settings-section-body">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className="settings-btn-primary" onClick={() => { setEditingSlide('new'); setSlideBlur(''); setFormData({ name: '', image: '', description: '' }) }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              إضافة شريحة
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-menu-table">
              <thead>
                <tr>
                  <th style={{ width: 120 }}>الصورة</th>
                  <th>العنوان</th>
                  <th style={{ width: 150 }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {slides.map(slide => (
                  <tr key={slide.id}>
                    <td><img src={slide.image} alt="" style={{ width: 100, height: 60, borderRadius: 8, objectFit: 'cover' }} /></td>
                    <td><span className="item-name">{slide.name}</span></td>
                    <td>
                      <div className="item-actions">
                        <button className="edit-btn" onClick={() => { setEditingSlide(slide.id); setSlideBlur(slide.blur_data || ''); setFormData({ name: slide.name, image: slide.image, description: '' }) }}>تعديل</button>
                        <button className="delete-btn" onClick={() => handleDeleteSlide(slide.id)}>حذف</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {slides.length === 0 && <tr><td colSpan={3} className="admin-menu-empty"><p>لا توجد شرائح بعد</p></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* قسم قصتنا */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-icon green">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div>
            <h3>قسم "قصتنا"</h3>
            <span>إدارة محتوى وصورة قسم قصتنا</span>
          </div>
        </div>
        <div className="settings-section-body">
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 20, alignItems: 'start', marginBottom: 16 }}>
            <img src={aboutData?.image || '/images/cafe-interior.png'} alt="" style={{ width: '100%', height: 100, borderRadius: 10, objectFit: 'cover' }} />
            <div>
              <h4 style={{ margin: '0 0 8px', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>{aboutData?.name || 'شغفنا بالشاي المغربي الأصيل'}</h4>
              <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.88rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{aboutData?.description || 'لا يوجد وصف مخصص.'}</p>
            </div>
          </div>
          <button className="settings-btn-primary" onClick={() => { setEditingAbout(true); setAboutForm({ name: aboutData?.name || 'شغفنا بالشاي المغربي الأصيل', description: aboutData?.description || '', image: aboutData?.image || '', blur_data: aboutData?.blur_data || '' }) }}>تعديل المحتوى</button>
        </div>
      </div>

      {/* مودال الشريحة */}
      <AdminModal open={Boolean(editingSlide)} onClose={() => setEditingSlide(null)} title={editingSlide === 'new' ? 'إضافة شريحة جديدة' : 'تعديل الشريحة'}>
        <form onSubmit={handleSaveSlide}>
          <div className="form-group">
            <label>عنوان الشريحة</label>
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="عنوان فرعي اختياري..." />
          </div>
          <div className="form-group">
            <label>صورة الخلفية *</label>
            <div className="modal-image-section">
              {formData.image && <img src={formData.image} alt="" className="image-preview" />}
              <label className="upload-btn" style={{ cursor: 'pointer' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                {uploadingBg ? 'جاري الرفع...' : 'اختر صورة'}
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingBg} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setEditingSlide(null)} className="cancel-btn">إلغاء</button>
            <button type="submit" className="save-btn" disabled={uploadingBg}>حفظ الشريحة</button>
          </div>
        </form>
      </AdminModal>

      {/* مودال قصتنا */}
      <AdminModal open={editingAbout} onClose={() => setEditingAbout(false)} title="تعديل قسم قصتنا">
        <form onSubmit={handleSaveAbout}>
          <div className="form-group">
            <label>العنوان الرئيسي</label>
            <input required type="text" value={aboutForm.name} onChange={e => setAboutForm({ ...aboutForm, name: e.target.value })} placeholder="شغفنا بالشاي المغربي الأصيل..." />
          </div>
          <div className="form-group">
            <label>الوصف</label>
            <textarea required rows="5" value={aboutForm.description} onChange={e => setAboutForm({ ...aboutForm, description: e.target.value })} placeholder="اكتب قصة الكافيه هنا..." />
          </div>
          <div className="form-group">
            <label>الصورة</label>
            <div className="modal-image-section">
              {aboutForm.image && <img src={aboutForm.image} alt="" className="image-preview" />}
              <label className="upload-btn" style={{ cursor: 'pointer' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                {uploadingAboutImg ? 'جاري الرفع...' : 'اختر صورة'}
                <input type="file" accept="image/*" onChange={handleAboutImageUpload} disabled={uploadingAboutImg} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setEditingAbout(false)} className="cancel-btn">إلغاء</button>
            <button type="submit" className="save-btn" disabled={uploadingAboutImg}>حفظ التعديلات</button>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}
