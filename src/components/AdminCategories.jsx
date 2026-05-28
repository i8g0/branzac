import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import IconRenderer from './IconRenderer'
import { stripEmojis } from '../lib/utils'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingCat, setEditingCat] = useState(null)
  const [formData, setFormData] = useState({ name: '', icon: '' })

  const fetchCategories = async () => {
    setLoading(true)
    const { data } = await supabase.from('menu_categories').select('*').order('created_at', { ascending: true })
    if (data) setCategories(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleEdit = (cat) => {
    setEditingCat(cat.id)
    setFormData({ name: cat.name, icon: cat.icon || '' })
  }

  const handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا القسم؟ إذا كان هناك منتجات فيه قد تختفي من العرض.')) {
      await supabase.from('menu_categories').delete().eq('id', id)
      fetchCategories()
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (editingCat === 'new') {
      await supabase.from('menu_categories').insert([formData])
    } else {
      await supabase.from('menu_categories').update(formData).eq('id', editingCat)
    }
    setEditingCat(null)
    fetchCategories()
  }

  const startNew = () => {
    setEditingCat('new')
    setFormData({ name: '', icon: '' })
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>جاري تحميل الأقسام...</div>

  return (
    <div className="admin-menu-manager">
      <div className="admin-menu-header">
        <h2>إدارة الأقسام (Categories)</h2>
        <button className="add-item-btn" onClick={startNew}>+ إضافة قسم جديد</button>
      </div>

      {editingCat && (
        <div className="admin-menu-form-overlay">
          <div className="admin-menu-form-modal">
            <h3>{editingCat === 'new' ? 'إضافة قسم جديد' : 'تعديل القسم'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>اسم القسم (مثل: مشروبات باردة)</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>أيقونة أو إيموجي (اختياري)</label>
                <input type="text" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} placeholder="مثال: ☕ أو مسار صورة" />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setEditingCat(null)} className="cancel-btn">إلغاء</button>
                <button type="submit" className="save-btn">حفظ القسم</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="admin-menu-table">
        <thead>
          <tr>
            <th>الأيقونة</th>
            <th>اسم القسم</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.id}>
              <td>
                <span style={{ fontSize: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <IconRenderer iconStr={cat.icon} size={24} color="var(--green-700)" />
                </span>
              </td>
              <td><strong>{stripEmojis(cat.name)}</strong></td>
              <td>
                <button onClick={() => handleEdit(cat)} className="edit-btn">تعديل</button>
                <button onClick={() => handleDelete(cat.id)} className="delete-btn">حذف</button>
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr>
              <td colSpan="3" style={{textAlign: 'center'}}>لا توجد أقسام حالياً.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
