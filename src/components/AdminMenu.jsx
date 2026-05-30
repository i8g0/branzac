import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { uploadImage } from '../lib/uploadImage'
import { stripEmojis } from '../lib/utils'
import AdminModal from './ui/AdminModal'

const EMPTY_FORM = {
  name: '',
  name_en: '',
  description: '',
  price: '',
  category: '',
  image: '',
  blur_data: '',
  calories: 0,
}

export default function AdminMenu() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)

  const fetchData = async () => {
    setLoading(true)
    const [itemsRes, catsRes] = await Promise.all([
      supabase.from('menu_items').select('*').order('created_at', { ascending: true }),
      supabase.from('menu_categories').select('*').order('created_at', { ascending: true }),
    ])
    if (itemsRes.data) {
      setItems(itemsRes.data.filter((item) => !item.category.startsWith('__')))
    }
    if (catsRes.data) setCategories(catsRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleEdit = (item) => {
    setEditingItem(item.id)
    setFormData({
      name: item.name,
      name_en: item.name_en || '',
      description: item.description || '',
      price: item.price,
      category: item.category,
      image: item.image,
      blur_data: item.blur_data || '',
      calories: item.calories || 0,
    })
  }

  const handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
      await supabase.from('menu_items').delete().eq('id', id)
      fetchData()
    }
  }

  const buildPayload = () => {
    const payload = {
      name: formData.name,
      name_en: formData.name_en,
      description: formData.description,
      price: Number(formData.price),
      category: formData.category,
      image: formData.image,
      calories: Number(formData.calories) || 0,
    }
    if (formData.blur_data) payload.blur_data = formData.blur_data
    return payload
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.category) {
      alert('الرجاء اختيار القسم')
      return
    }

    const payload = buildPayload()

    if (editingItem === 'new') {
      let { error } = await supabase.from('menu_items').insert([payload])
      if (error) {
        delete payload.blur_data
        delete payload.calories
        const retry = await supabase.from('menu_items').insert([payload])
        if (retry.error) {
          alert('حدث خطأ أثناء الحفظ: ' + retry.error.message)
          return
        }
      }
    } else {
      let { error } = await supabase.from('menu_items').update(payload).eq('id', editingItem)
      if (error) {
        delete payload.blur_data
        const retry = await supabase.from('menu_items').update(payload).eq('id', editingItem)
        if (retry.error) {
          delete payload.calories
          const retry2 = await supabase.from('menu_items').update(payload).eq('id', editingItem)
          if (retry2.error) {
            alert('حدث خطأ أثناء الحفظ: ' + retry2.error.message)
            return
          }
        }
      }
    }

    setEditingItem(null)
    fetchData()
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const { error, publicUrl, blurData } = await uploadImage(file, 'uploads')
    setUploading(false)

    if (error) {
      alert('حدث خطأ أثناء رفع الصورة: تأكد من تفعيل Storage في Supabase')
      return
    }

    setFormData((prev) => ({
      ...prev,
      image: publicUrl,
      blur_data: blurData || prev.blur_data,
    }))
  }

  const startNew = () => {
    setEditingItem('new')
    setFormData({
      ...EMPTY_FORM,
      category: categories.length > 0 ? categories[0].name : '',
    })
  }

  if (loading) {
    return <div className="settings-loading"><div className="admin-spinner"></div><p>جاري تحميل المنيو...</p></div>
  }

  return (
    <div className="admin-menu-manager">
      <div className="admin-menu-header">
        <h2>إدارة المنيو</h2>
        <button type="button" className="settings-btn-primary" onClick={startNew}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          إضافة صنف جديد
        </button>
      </div>

      <AdminModal
        open={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title={editingItem === 'new' ? 'إضافة صنف جديد' : 'تعديل الصنف'}
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>الاسم (عربي)</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: لاتيه مانتشا"
            />
          </div>
          <div className="form-group">
            <label>الاسم (إنجليزي)</label>
            <input
              required
              type="text"
              dir="ltr"
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              placeholder="e.g. Matcha Latte"
            />
          </div>
          <div className="form-group">
            <label>الوصف (اختياري)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف مختصر للصنف..."
              rows={3}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label>السعر (ر.س)</label>
              <input
                required
                type="number"
                step="0.5"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>السعرات (cal)</label>
              <input
                type="number"
                min="0"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>القسم</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="" disabled>اختر القسم</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {stripEmojis(cat.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* قسم رفع الصورة */}
          <div className="form-group">
            <label>صورة المنتج</label>
            <div className="modal-image-section">
              {formData.image && (
                <img src={formData.image} alt="معاينة" className="image-preview" />
              )}
              <label className="upload-btn" style={{ cursor: 'pointer' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                {uploading ? 'جاري الرفع...' : 'اختر صورة'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </label>
              {uploading && <p className="upload-loading">جاري رفع الصورة...</p>}
              {!formData.image && !uploading && <span className="upload-hint"> PNG أو JPG — يفضل صورة مربعة</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setEditingItem(null)} className="cancel-btn">
              إلغاء
            </button>
            <button type="submit" className="save-btn">
              حفظ الصنف
            </button>
          </div>
        </form>
      </AdminModal>

      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table className="admin-menu-table">
          <thead>
            <tr>
              <th style={{ width: '70px' }}>الصورة</th>
              <th>الاسم</th>
              <th>القسم</th>
              <th>السعر</th>
              <th style={{ width: '150px' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.image ? (
                    <img src={item.image} alt="" className="admin-table-thumb" />
                  ) : (
                    <div style={{ width: 56, height: 56, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                  )}
                </td>
                <td>
                  <span className="item-name">{item.name}</span>
                  <span className="item-name-en">{item.name_en}</span>
                </td>
                <td><span className="item-category">{stripEmojis(item.category)}</span></td>
                <td><span className="item-price">{item.price} ر.س</span></td>
                <td>
                  <div className="item-actions">
                    <button type="button" onClick={() => handleEdit(item)} className="edit-btn">تعديل</button>
                    <button type="button" onClick={() => handleDelete(item.id)} className="delete-btn">حذف</button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="5" className="admin-menu-empty">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  <p>لا توجد عناصر في المنيو بعد</p>
                  <button type="button" onClick={startNew} className="settings-btn-primary" style={{ margin: '0 auto' }}>
                    + أضف أول صنف
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
