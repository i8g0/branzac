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
  { id: 'bean', label: 'شاي' },
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
      alert('حدث خطأ أثناء رفع الأيقونة')
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
    if (confirm('هل أنت متأكد من حذف هذا القسم؟')) {
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

  if (loading) return <div className="settings-loading"><div className="admin-spinner"></div><p>جاري تحميل الأقسام...</p></div>

  return (
    <div className="admin-menu-manager">
      <div className="admin-menu-header">
        <h2>إدارة الأقسام</h2>
        <button type="button" className="settings-btn-primary" onClick={startNew}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          إضافة قسم جديد
        </button>
      </div>

      <AdminModal
        open={Boolean(editingCat)}
        onClose={() => setEditingCat(null)}
        title={editingCat === 'new' ? 'إضافة قسم جديد' : 'تعديل القسم'}
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>اسم القسم</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: مشروبات باردة"
            />
          </div>
          <div className="form-group">
            <label>الأيقونة</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '8px', marginTop: '8px' }}>
              {AVAILABLE_ICONS.map((iconOpt) => (
                <button
                  key={iconOpt.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: iconOpt.id })}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '8px', border: formData.icon === iconOpt.id ? '2px solid var(--gold)' : '1px solid #e5e7eb',
                    borderRadius: '8px', background: formData.icon === iconOpt.id ? '#fdf8e7' : '#fff',
                    cursor: 'pointer', transition: 'all 0.2s ease', gap: '4px'
                  }}
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
                <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>✕</div>
                <span style={{ fontSize: '10px', color: '#4b5563', textAlign: 'center' }}>بدون</span>
              </button>
            </div>
            <div style={{ marginTop: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>أو رفع أيقونة مخصصة:</label>
              <div className="modal-image-section" style={{ marginTop: 8 }}>
                <label className="upload-btn" style={{ cursor: 'pointer' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  {uploadingIcon ? 'جاري الرفع...' : 'اختر ملف'}
                  <input type="file" accept="image/*" onChange={handleIconUpload} disabled={uploadingIcon} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setEditingCat(null)} className="cancel-btn">إلغاء</button>
            <button type="submit" className="save-btn">حفظ القسم</button>
          </div>
        </form>
      </AdminModal>

      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table className="admin-menu-table">
          <thead>
            <tr>
              <th style={{ width: '70px' }}>الأيقونة</th>
              <th>اسم القسم</th>
              <th style={{ width: '150px' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconRenderer iconStr={cat.icon} size={22} color="var(--green-700)" />
                  </div>
                </td>
                <td><span className="item-name">{stripEmojis(cat.name)}</span></td>
                <td>
                  <div className="item-actions">
                    <button type="button" onClick={() => handleEdit(cat)} className="edit-btn">تعديل</button>
                    <button type="button" onClick={() => handleDelete(cat.id)} className="delete-btn">حذف</button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={3} className="admin-menu-empty"><p>لا توجد أقسام بعد</p></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
