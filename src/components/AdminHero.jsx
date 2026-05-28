import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminHero() {
  const [slides, setSlides] = useState([])
  const [aboutData, setAboutData] = useState(null)
  const [logoData, setLogoData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploadingBg, setUploadingBg] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingAboutImg, setUploadingAboutImg] = useState(false)
  
  const [editingSlide, setEditingSlide] = useState(null)
  const [editingAbout, setEditingAbout] = useState(false)

  const [formData, setFormData] = useState({
    name: '', image: '', description: ''
  })
  
  const [aboutForm, setAboutForm] = useState({
    name: '', description: '', image: ''
  })

  const fetchSlidesAndAbout = async () => {
    setLoading(true)
    const { data: slideData, error: slideError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category', '__hero_slide__')
      .order('created_at', { ascending: true })
    if (slideData) setSlides(slideData)

    const { data: aboutRecord } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category', '__site_about__')
      .maybeSingle()
    if (aboutRecord) setAboutData(aboutRecord)

    const { data: logoRecord } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category', '__site_logo__')
      .maybeSingle()
    if (logoRecord) setLogoData(logoRecord)
    
    setLoading(false)
  }

  useEffect(() => {
    fetchSlidesAndAbout()
  }, [])

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0]
    if (!file) return

    if (type === 'bg') setUploadingBg(true)
    else setUploadingLogo(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `hero/${fileName}`

    const { error: uploadError } = await supabase.storage.from('menu-images').upload(filePath, file)

    if (uploadError) {
      alert('حدث خطأ أثناء رفع الصورة: تأكد من تفعيل Storage في Supabase')
      console.error(uploadError)
      if (type === 'bg') setUploadingBg(false)
      else setUploadingLogo(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('menu-images').getPublicUrl(filePath)
    
    setFormData(prev => ({
      ...prev,
      [type === 'bg' ? 'image' : 'description']: publicUrl
    }))

    if (type === 'bg') setUploadingBg(false)
    else setUploadingLogo(false)
  }

  const handleAboutImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingAboutImg(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `about/${fileName}`

    const { error: uploadError } = await supabase.storage.from('menu-images').upload(filePath, file)

    if (uploadError) {
      alert('حدث خطأ أثناء رفع الصورة: تأكد من تفعيل Storage في Supabase')
      console.error(uploadError)
      setUploadingAboutImg(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('menu-images').getPublicUrl(filePath)
    setAboutForm(prev => ({ ...prev, image: publicUrl }))
    setUploadingAboutImg(false)
  }

  const handleGlobalLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingLogo(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `logo/${fileName}`

    const { error: uploadError } = await supabase.storage.from('menu-images').upload(filePath, file)

    if (uploadError) {
      alert('حدث خطأ أثناء رفع الشعار: تأكد من تفعيل Storage في Supabase')
      console.error(uploadError)
      setUploadingLogo(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('menu-images').getPublicUrl(filePath)
    
    const payload = {
      name: 'شعار الموقع الرئيسي',
      name_en: 'Site Logo',
      description: 'Site Logo URL',
      price: 0,
      category: '__site_logo__',
      image: publicUrl
    }

    if (logoData) {
      await supabase.from('menu_items').update(payload).eq('id', logoData.id)
    } else {
      await supabase.from('menu_items').insert([payload])
    }

    setUploadingLogo(false)
    fetchSlidesAndAbout()
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.image) {
      alert('الرجاء رفع صورة خلفية واحدة على الأقل!')
      return
    }

    const payload = {
      name: formData.name || 'شريحة ترحيبية',
      name_en: 'Hero Slide',
      description: '',
      price: 0,
      category: '__hero_slide__',
      image: formData.image
    }

    if (editingSlide === 'new') {
      await supabase.from('menu_items').insert([payload])
    } else {
      await supabase.from('menu_items').update(payload).eq('id', editingSlide)
    }

    setEditingSlide(null)
    fetchSlidesAndAbout()
  }

  const handleSaveAbout = async (e) => {
    e.preventDefault()
    const payload = {
      name: aboutForm.name || 'شغفنا بالقهوة المختصة',
      name_en: 'About Settings',
      description: aboutForm.description,
      price: 0,
      category: '__site_about__',
      image: aboutForm.image
    }

    if (aboutData) {
      await supabase.from('menu_items').update(payload).eq('id', aboutData.id)
    } else {
      await supabase.from('menu_items').insert([payload])
    }

    setEditingAbout(false)
    fetchSlidesAndAbout()
  }

  const handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذه الشريحة الترحيبية؟')) {
      await supabase.from('menu_items').delete().eq('id', id)
      fetchSlidesAndAbout()
    }
  }

  const handleEdit = (slide) => {
    setEditingSlide(slide.id)
    setFormData({
      name: slide.name,
      image: slide.image,
      description: slide.description || ''
    })
  }

  const handleEditAbout = () => {
    setEditingAbout(true)
    setAboutForm({
      name: aboutData?.name || 'شغفنا بالقهوة المختصة',
      description: aboutData?.description || '',
      image: aboutData?.image || '/images/cafe-interior.png'
    })
  }

  const startNew = () => {
    setEditingSlide('new')
    setFormData({ name: '', image: '', description: '' })
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>جاري تحميل البيانات...</div>

  return (
    <div className="admin-menu-manager">
      {/* 0. Global Logo Section */}
      <div className="admin-menu-header" style={{ marginBottom: '10px' }}>
        <h2>شعار الموقع الرئيسي (Global Website Logo)</h2>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
        قم برفع شعار برانزاك هنا ليتم تعميمه تلقائياً على كامل الموقع (الهيدر، الفوتر، وقسم الترحيب).
      </p>

      <div style={{ 
        background: 'rgba(255, 255, 255, 0.02)', 
        padding: '24px', 
        borderRadius: '12px', 
        border: '1px solid rgba(255,255,255,0.05)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '24px',
        marginBottom: '40px'
      }}>
        <div style={{ 
          width: '100px', 
          height: '100px', 
          borderRadius: '12px', 
          background: '#071610', 
          padding: '10px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <img 
            src={logoData?.image || '/images/logo-bg.png'} 
            alt="Current Logo" 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        </div>
        <div>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: 'var(--gold)' }}>تغيير الشعار الرئيسي</h4>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleGlobalLogoUpload} 
            disabled={uploadingLogo} 
            style={{ display: 'none' }}
            id="global-logo-upload"
          />
          <label 
            htmlFor="global-logo-upload" 
            className="add-item-btn" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: 'pointer',
              padding: '10px 20px',
              fontSize: '0.9rem'
            }}
          >
            {uploadingLogo ? 'جاري رفع الشعار...' : '📤 رفع شعار جديد'}
          </label>
          <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '8px', fontSize: '0.8rem' }}>
            يفضل استخدام صورة شفافة بصيغة PNG وبأبعاد مربعة أو مستطيلة متناسقة.
          </small>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '40px 0' }} />

      {/* 1. Hero Slides Section */}
      <div className="admin-menu-header">
        <h2>إدارة شرائح الترحيب والخلفيات (Hero Carousel)</h2>
        <button className="add-item-btn" onClick={startNew}>+ إضافة شريحة جديدة</button>
      </div>

      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
        يمكنك إضافة صور متعددة لخلفية قسم الترحيب الرئيسي مع إمكانية تخصيص العنوان المعروض بالواجهة لكل شريحة.
      </p>

      {editingSlide && (
        <div className="admin-menu-form-overlay">
          <div className="admin-menu-form-modal">
            <h3>{editingSlide === 'new' ? 'إضافة شريحة جديدة' : 'تعديل الشريحة'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>عنوان الشريحة (العنوان الفرعي المعروض بالواجهة)</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="مثال: حيث تلتقي القهوة المختصة بالأجواء الاستثنائية..."
                />
              </div>

              <div className="form-group">
                <label>الصورة الخلفية (Background Image) *</label>
                {formData.image && (
                  <img 
                    src={formData.image} 
                    alt="Background Preview" 
                    style={{ width: '100%', maxHeight: '150px', borderRadius: '8px', marginBottom: '10px', objectFit: 'cover' }} 
                  />
                )}
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'bg')} disabled={uploadingBg} />
                {uploadingBg && <small style={{ color: 'var(--gold-dark)', display: 'block', marginTop: '5px' }}>جاري رفع الخلفية...</small>}
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setEditingSlide(null)} className="cancel-btn">إلغاء</button>
                <button type="submit" className="save-btn" disabled={uploadingBg}>حفظ الشريحة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-menu-table-wrapper" style={{ overflowX: 'auto', marginBottom: '40px' }}>
        <table className="admin-menu-table">
          <thead>
            <tr>
              <th>صورة الخلفية</th>
              <th>العنوان التوضيحي</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {slides.map(slide => (
              <tr key={slide.id}>
                <td>
                  <img 
                    src={slide.image} 
                    alt={slide.name} 
                    style={{ width: '100px', height: '60px', borderRadius: '6px', objectFit: 'cover' }} 
                  />
                </td>
                <td><strong>{slide.name}</strong></td>
                <td>
                  <button onClick={() => handleEdit(slide)} className="edit-btn">تعديل</button>
                  <button onClick={() => handleDelete(slide.id)} className="delete-btn">حذف</button>
                </td>
              </tr>
            ))}
            {slides.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                  لا توجد شرائح مخصصة حالياً. الواجهة الرئيسية تعرض الخلفية الافتراضية.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 2. About Section Management */}
      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '40px 0' }} />
      
      <div className="admin-menu-header" style={{ marginTop: '20px' }}>
        <h2>إدارة محتوى وصور قسم "قصتنا" (About Us)</h2>
        <button className="add-item-btn" onClick={handleEditAbout}>تعديل محتوى قصتنا</button>
      </div>

      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
        تتيح لك إدارة محتوى وصور قسم قصتنا تغيير العنوان الرئيسي للقسم، ونص الوصف، وصورة الكافيه الجانبية المعروضة بالصفحة.
      </p>

      <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '150px 1fr', gap: '24px', alignItems: 'start' }}>
        <div>
          <img 
            src={aboutData?.image || '/images/cafe-interior.png'} 
            alt="About Section" 
            style={{ width: '100%', height: '110px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>
        <div>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '1.15rem', color: 'var(--gold)' }}>{aboutData?.name || 'شغفنا بالقهوة المختصة'}</h4>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>
            {aboutData?.description || 'لا يوجد وصف مخصص حالياً. يتم استخدام النص الافتراضي في الموقع.'}
          </p>
        </div>
      </div>

      {editingAbout && (
        <div className="admin-menu-form-overlay">
          <div className="admin-menu-form-modal" style={{ maxWidth: '600px' }}>
            <h3>تعديل محتوى قسم "قصتنا" (About)</h3>
            <form onSubmit={handleSaveAbout}>
              <div className="form-group">
                <label>العنوان الرئيسي لقسم قصتنا</label>
                <input 
                  required
                  type="text" 
                  value={aboutForm.name} 
                  onChange={e => setAboutForm({...aboutForm, name: e.target.value})} 
                  placeholder="مثال: شغفنا بالقهوة المختصة..."
                />
              </div>

              <div className="form-group">
                <label>نص الوصف (أدخل أسطراً فارغة لإنشاء فقرات متعددة)</label>
                <textarea 
                  required
                  rows="6"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--green-900)', color: 'white', fontFamily: 'inherit', lineHeight: '1.6' }}
                  value={aboutForm.description} 
                  onChange={e => setAboutForm({...aboutForm, description: e.target.value})} 
                  placeholder="اكتب قصة الكافيه والوصف هنا..."
                />
              </div>

              <div className="form-group">
                <label>صورة القسم الرئيسية</label>
                {aboutForm.image && (
                  <img 
                    src={aboutForm.image} 
                    alt="About Preview" 
                    style={{ width: '120px', height: '80px', borderRadius: '8px', marginBottom: '10px', objectFit: 'cover' }} 
                  />
                )}
                <input type="file" accept="image/*" onChange={handleAboutImageUpload} disabled={uploadingAboutImg} />
                {uploadingAboutImg && <small style={{ color: 'var(--gold-dark)', display: 'block', marginTop: '5px' }}>جاري رفع الصورة...</small>}
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setEditingAbout(false)} className="cancel-btn">إلغاء</button>
                <button type="submit" className="save-btn" disabled={uploadingAboutImg}>حفظ التعديلات</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
