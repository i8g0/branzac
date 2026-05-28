import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { stripEmojis } from '../lib/utils'

export default function AdminMenu() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '', name_en: '', description: '', price: '', category: '', image: ''
  })

  const fetchData = async () => {
    setLoading(true)
    const [itemsRes, catsRes] = await Promise.all([
      supabase.from('menu_items').select('*').order('created_at', { ascending: true }),
      supabase.from('menu_categories').select('*').order('created_at', { ascending: true })
    ])
    if (itemsRes.data) {
      const filteredItems = itemsRes.data.filter(item => !item.category.startsWith('__'))
      setItems(filteredItems)
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
      name_en: item.name_en,
      description: item.description || '',
      price: item.price,
      category: item.category,
      image: item.image
    })
  }

  const handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
      await supabase.from('menu_items').delete().eq('id', id)
      fetchData()
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.category) {
      alert('الرجاء اختيار القسم')
      return
    }
    if (editingItem === 'new') {
      await supabase.from('menu_items').insert([formData])
    } else {
      await supabase.from('menu_items').update(formData).eq('id', editingItem)
    }
    setEditingItem(null)
    fetchData()
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `uploads/${fileName}`

    const { error: uploadError } = await supabase.storage.from('menu-images').upload(filePath, file)

    if (uploadError) {
      alert('حدث خطأ أثناء رفع الصورة: تأكد من تفعيل Storage في Supabase')
      console.error(uploadError)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('menu-images').getPublicUrl(filePath)
    setFormData(prev => ({ ...prev, image: publicUrl }))
    setUploading(false)
  }

  const startNew = () => {
    setEditingItem('new')
    setFormData({
      name: '', name_en: '', description: '', price: '', 
      category: categories.length > 0 ? categories[0].name : '', 
      image: ''
    })
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>جاري تحميل المنيو...</div>

  return (
    <div className="admin-menu-manager">
      <div className="admin-menu-header">
        <h2>إدارة المنيو</h2>
        <button className="add-item-btn" onClick={startNew}>+ إضافة صنف جديد</button>
      </div>

      {editingItem && (
        <div className="admin-menu-form-overlay">
          <div className="admin-menu-form-modal">
            <h3>{editingItem === 'new' ? 'إضافة صنف جديد' : 'تعديل الصنف'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>الاسم (عربي)</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>الاسم (إنجليزي)</label>
                <input required type="text" value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} />
              </div>
              <div className="form-group">
                <label>الوصف</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label>السعر (ر.س)</label>
                <input required type="number" step="0.5" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div className="form-group">
                <label>القسم</label>
                <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="" disabled>اختر القسم</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{stripEmojis(cat.name)}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>صورة المنتج</label>
                {formData.image && <img src={formData.image} alt="preview" style={{width: '60px', height: '60px', borderRadius: '8px', marginBottom: '10px', objectFit: 'cover'}} />}
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                {uploading && <small style={{color: 'var(--gold-dark)', display: 'block', marginTop: '5px'}}>جاري رفع الصورة...</small>}
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setEditingItem(null)} className="cancel-btn">إلغاء</button>
                <button type="submit" className="save-btn">حفظ الصنف</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
          {items.map(item => (
            <tr key={item.id}>
              <td><img src={item.image} alt={item.name} width="50" style={{borderRadius: '8px'}} /></td>
              <td>
                <strong>{item.name}</strong><br/>
                <small dir="ltr">{item.name_en}</small>
              </td>
              <td>{stripEmojis(item.category)}</td>
              <td>{item.price} ر.س</td>
              <td>
                <button onClick={() => handleEdit(item)} className="edit-btn">تعديل</button>
                <button onClick={() => handleDelete(item.id)} className="delete-btn">حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
