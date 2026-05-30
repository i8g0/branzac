import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { uploadImage } from '../lib/uploadImage'
import AdminModal from './ui/AdminModal'

export default function AdminServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState(null)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', image: '' })

  const fetchServices = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category', '__site_service__')
      .order('created_at', { ascending: true })
    if (data) setServices(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const handleEdit = (item) => {
    setEditingItem(item.id)
    setFormData({ name: item.name, description: item.description, image: item.image || '' })
  }

  const handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
      await supabase.from('menu_items').delete().eq('id', id)
      fetchServices()
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImg(true)
    const { error, publicUrl } = await uploadImage(file, 'services')
    setUploadingImg(false)

    if (error) {
      alert('حدث خطأ أثناء رفع الأيقونة: تأكد من تفعيل Storage في Supabase')
      return
    }

    setFormData((prev) => ({ ...prev, image: publicUrl }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const payload = {
      name: formData.name,
      name_en: 'Site Service',
      description: formData.description,
      price: 0,
      category: '__site_service__',
      image: formData.image,
    }

    if (editingItem === 'new') {
      await supabase.from('menu_items').insert([payload])
    } else {
      await supabase.from('menu_items').update(payload).eq('id', editingItem)
    }

    setEditingItem(null)
    fetchServices()
  }

  const startNew = () => {
    setEditingItem('new')
    setFormData({ name: '', description: '', image: '' })
  }

  if (loading) return <div className="settings-loading"><div className="admin-spinner"></div><p>جاري تحميل الخدمات...</p></div>

  return (
    <div className="admin-menu-manager">
      <div className="admin-menu-header">
        <h2>إدارة قسم الخدمات</h2>
        <button type="button" className="settings-btn-primary" onClick={startNew}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          إضافة خدمة جديدة
        </button>
      </div>

      <AdminModal
        open={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title={editingItem === 'new' ? 'إضافة خدمة جديدة' : 'تعديل الخدمة'}
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>عنوان الخدمة</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: قهوة مختصة"
            />
          </div>
          <div className="form-group">
            <label>وصف الخدمة</label>
            <textarea
              required
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف مختصر للخدمة..."
            />
          </div>
          <div className="form-group">
            <label>أيقونة الخدمة</label>
            <div className="modal-image-section">
              {formData.image && (
                <img src={formData.image} alt="معاينة" style={{ width: 48, height: 48, objectFit: 'contain', marginBottom: 10, borderRadius: 8 }} />
              )}
              <label className="upload-btn" style={{ cursor: 'pointer' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                {uploadingImg ? 'جاري الرفع...' : 'اختر أيقونة'}
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImg} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setEditingItem(null)} className="cancel-btn">إلغاء</button>
            <button type="submit" className="save-btn" disabled={uploadingImg}>حفظ الخدمة</button>
          </div>
        </form>
      </AdminModal>

      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table className="admin-menu-table">
          <thead>
            <tr>
              <th style={{ width: '70px' }}>الأيقونة</th>
              <th>الخدمة</th>
              <th>الوصف</th>
              <th style={{ width: '150px' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {services.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.image ? (
                    <img src={item.image} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'contain' }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
                    </div>
                  )}
                </td>
                <td><span className="item-name">{item.name}</span></td>
                <td style={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-light)', fontSize: '0.88rem' }}>{item.description}</td>
                <td>
                  <div className="item-actions">
                    <button type="button" onClick={() => handleEdit(item)} className="edit-btn">تعديل</button>
                    <button type="button" onClick={() => handleDelete(item.id)} className="delete-btn">حذف</button>
                  </div>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr><td colSpan={4} className="admin-menu-empty"><p>لا توجد خدمات بعد</p></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
