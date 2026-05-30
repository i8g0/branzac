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
      const { error } = await supabase.from('menu_items').insert([payload])
      if (error?.message?.includes('blur_data')) {
        delete payload.blur_data
        await supabase.from('menu_items').insert([payload])
      }
    } else {
      const { error } = await supabase.from('menu_items').update(payload).eq('id', editingItem)
      if (error?.message?.includes('blur_data')) {
        delete payload.blur_data
        await supabase.from('menu_items').update(payload).eq('id', editingItem)
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
    return <div className="admin-panel-loading">جاري تحميل المنيو...</div>
  }

  return (
    <div className="admin-menu-manager">
      <div className="admin-menu-header">
        <h2>إدارة المنيو</h2>
        <button type="button" className="add-item-btn" onClick={startNew}>
          + إضافة صنف جديد
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
            />
          </div>
          <div className="form-group">
            <label>الوصف</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
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
            <label>القسم</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="" disabled>
                اختر القسم
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {stripEmojis(cat.name)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>صورة المنتج</label>
            {formData.image && (
              <img
                src={formData.image}
                alt=""
                className="admin-preview-thumb"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            {uploading && <small className="admin-upload-hint">جاري رفع الصورة...</small>}
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

      <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
        <table className="admin-menu-table">
          <thead>
            <tr>
              <th>الصورة</th>
              <th>الاسم</th>
              <th>القسم</th>
              <th>السعر</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <img src={item.image} alt="" width="50" className="admin-table-thumb" />
                </td>
                <td>
                  <strong>{item.name}</strong>
                  <br />
                  <small dir="ltr">{item.name_en}</small>
                </td>
                <td>{stripEmojis(item.category)}</td>
                <td>{item.price} ر.س</td>
                <td>
                  <button type="button" onClick={() => handleEdit(item)} className="edit-btn">
                    تعديل
                  </button>
                  <button type="button" onClick={() => handleDelete(item.id)} className="delete-btn">
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
