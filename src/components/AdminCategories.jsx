import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import IconRenderer from './IconRenderer'
import { stripEmojis } from '../lib/utils'
import AdminModal from './ui/AdminModal'
import { uploadImage } from '../lib/uploadImage'

const AVAILABLE_ICONS = [
  { id: 'hot', label: 'ساخن' },
  { id: 'cold', label: 'بارد' },
  { id: 'dessert', label: 'حلى' },
  { id: 'croissant', label: 'مخبوزات' },
  { id: 'icecream', label: 'آيس كريم' },
  { id: 'cookie', label: 'كوكيز' },
  { id: 'bean', label: 'قهوة' },
]

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingCat, setEditingCat] = useState(null)
  const [formData, setFormData] = useState({ name: '', icon: '' })
  const [uploadingIcon, setUploadingIcon] = useState(false)

  const handleIconUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingIcon(true)
    const { error, publicUrl } = await uploadImage(file, 'categories')
    setUploadingIcon(false)

    if (error) {
      alert('حدث خطأ أثناء رفع الأيقونة: تأكد من تفعيل Storage في Supabase')
      return
    }

    setFormData((prev) => ({ ...prev, icon: publicUrl }))
  }

  const fetchCategories = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('menu_categories')
      .select('*')
      .order('created_at', { ascending: true })
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
    if (
      confirm(
        'هل أنت متأكد من حذف هذا القسم؟ إذا كان هناك منتجات فيه قد تختفي من العرض.'
      )
    ) {
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

  if (loading) {
    return <div className="admin-panel-loading">جاري تحميل الأقسام...</div>
  }

  return (
    <div className="admin-menu-manager">
      <div className="admin-menu-header">
        <h2>إدارة الأقسام</h2>
        <button type="button" className="add-item-btn" onClick={startNew}>
          + إضافة قسم جديد
        </button>
      </div>

      <AdminModal
        open={Boolean(editingCat)}
        onClose={() => setEditingCat(null)}
        title={editingCat === 'new' ? 'إضافة قسم جديد' : 'تعديل القسم'}
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>اسم القسم (مثل: مشروبات باردة)</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>شكل أيقونة القسم (اختياري)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '8px', marginTop: '8px' }}>
              {AVAILABLE_ICONS.map((iconOpt) => (
                <button
                  key={iconOpt.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: iconOpt.id })}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '8px', border: formData.icon === iconOpt.id ? '2px solid #d4af37' : '1px solid #e5e7eb',
                    borderRadius: '8px', background: formData.icon === iconOpt.id ? '#fdf8e7' : '#fff',
                    cursor: 'pointer', transition: 'all 0.2s ease', gap: '4px'
                  }}
                  title={iconOpt.label}
                >
                  <IconRenderer iconStr={iconOpt.id} size={24} color={formData.icon === iconOpt.id ? '#b48530' : '#4b5563'} />
                  <span style={{ fontSize: '10px', color: '#4b5563', textAlign: 'center' }}>{iconOpt.label}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, icon: '' })}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '8px', border: !formData.icon ? '2px solid #9ca3af' : '1px solid #e5e7eb',
                  borderRadius: '8px', background: !formData.icon ? '#f9fafb' : '#fff',
                  cursor: 'pointer', transition: 'all 0.2s ease', gap: '4px'
                }}
              >
                <div style={{width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280'}}>✕</div>
                <span style={{ fontSize: '10px', color: '#4b5563', textAlign: 'center' }}>بدون</span>
              </button>
            </div>
            
            <div style={{ marginTop: '16px', borderTop: '1px solid var(--gray-200)', paddingTop: '16px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>أو قم برفع أيقونة مخصصة (SVG, PNG):</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                {formData.icon && (formData.icon.startsWith('http') || formData.icon.startsWith('/')) && (
                  <div style={{ width: '40px', height: '40px', background: 'var(--gray-50)', borderRadius: '8px', border: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={formData.icon} alt="Custom Icon" style={{ maxWidth: '24px', maxHeight: '24px', objectFit: 'contain' }} />
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleIconUpload} 
                  disabled={uploadingIcon} 
                  style={{ display: 'none' }}
                  id="category-icon-upload"
                />
                <label 
                  htmlFor="category-icon-upload" 
                  className="add-item-btn" 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    background: 'var(--gray-100)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--gray-300)'
                  }}
                >
                  {uploadingIcon ? 'جاري الرفع...' : '📤 اختيار ملف'}
                </label>
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setEditingCat(null)} className="cancel-btn">
              إلغاء
            </button>
            <button type="submit" className="save-btn">
              حفظ القسم
            </button>
          </div>
        </form>
      </AdminModal>

      <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
        <table className="admin-menu-table">
          <thead>
            <tr>
              <th>الأيقونة</th>
              <th>اسم القسم</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>
                  <IconRenderer iconStr={cat.icon} size={24} color="var(--green-700)" />
                </td>
                <td>
                  <strong>{stripEmojis(cat.name)}</strong>
                </td>
                <td>
                  <button type="button" onClick={() => handleEdit(cat)} className="edit-btn">
                    تعديل
                  </button>
                  <button type="button" onClick={() => handleDelete(cat.id)} className="delete-btn">
                    حذف
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center' }}>
                  لا توجد أقسام حالياً.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
