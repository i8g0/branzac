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

  if (loading) return <div className="admin-panel-loading">جاري تحميل الخدمات...</div>

  return (
    <div className="admin-menu-manager">
      <div className="admin-menu-header">
        <h2>إدارة قسم الخدمات</h2>
        <button type="button" className="add-item-btn" onClick={startNew}>
          + إضافة خدمة جديدة
        </button>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
        قم بإضافة أو تعديل الخدمات التي تظهر في الصفحة الرئيسية (مثل: قهوة مختصة، أجواء هادئة، واي فاي مجاني).
      </p>

      <AdminModal
        open={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title={editingItem === 'new' ? 'إضافة خدمة جديدة' : 'تعديل الخدمة'}
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>عنوان الخدمة (مثال: قهوة مختصة)</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label>وصف الخدمة</label>
            <textarea
              required
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--green-900)', color: 'white', fontFamily: 'inherit' }}
            />
          </div>

          <div className="form-group">
            <label>أيقونة الخدمة (SVG أو PNG)</label>
            {formData.image && (
              <div style={{ marginBottom: '10px' }}>
                <img src={formData.image} alt="Service Icon" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImg} />
            {uploadingImg && <small style={{ color: 'var(--gold-dark)', display: 'block', marginTop: '5px' }}>جاري رفع الأيقونة...</small>}
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setEditingItem(null)} className="cancel-btn">إلغاء</button>
            <button type="submit" className="save-btn" disabled={uploadingImg}>حفظ الخدمة</button>
          </div>
        </form>
      </AdminModal>

      <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
        <table className="admin-menu-table">
          <thead>
            <tr>
              <th>الأيقونة</th>
              <th>الخدمة</th>
              <th>الوصف</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {services.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ color: 'var(--gray-500)' }}>لا يوجد</span>
                  )}
                </td>
                <td><strong>{item.name}</strong></td>
                <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</td>
                <td>
                  <button type="button" onClick={() => handleEdit(item)} className="edit-btn">تعديل</button>
                  <button type="button" onClick={() => handleDelete(item.id)} className="delete-btn">حذف</button>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>لا توجد خدمات حالياً.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
