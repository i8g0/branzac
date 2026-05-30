import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AdminModal from './ui/AdminModal'

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({ name: '', role: '', text: '', rating: 5 })

  const fetchTestimonials = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category', '__site_testimonial__')
      .order('created_at', { ascending: true })
    if (data) setTestimonials(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const handleEdit = (item) => {
    setEditingItem(item.id)
    setFormData({ name: item.name, role: item.name_en || '', text: item.description || '', rating: item.price > 0 ? item.price : 5 })
  }

  const handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا الرأي؟')) {
      await supabase.from('menu_items').delete().eq('id', id)
      fetchTestimonials()
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const payload = {
      name: formData.name,
      name_en: formData.role, // We use name_en to store the Role
      description: formData.text,
      price: formData.rating, // Store rating in price
      category: '__site_testimonial__',
      image: '',
    }

    if (editingItem === 'new') {
      await supabase.from('menu_items').insert([payload])
    } else {
      await supabase.from('menu_items').update(payload).eq('id', editingItem)
    }
    
    setEditingItem(null)
    fetchTestimonials()
  }

  const startNew = () => {
    setEditingItem('new')
    setFormData({ name: '', role: '', text: '', rating: 5 })
  }

  if (loading) return <div className="admin-panel-loading">جاري تحميل الآراء...</div>

  return (
    <div className="admin-menu-manager">
      <div className="admin-menu-header">
        <h2>إدارة آراء العملاء</h2>
        <button type="button" className="add-item-btn" onClick={startNew}>
          + إضافة رأي جديد
        </button>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
        قم بإضافة أو تعديل آراء العملاء المعروضة في الصفحة الرئيسية.
      </p>

      <AdminModal
        open={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title={editingItem === 'new' ? 'إضافة رأي جديد' : 'تعديل الرأي'}
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>اسم العميل</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label>المسمى أو الوصف (مثال: عميل دائم، خبير قهوة)</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>التقييم (النجوم)</label>
            <select
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--green-900)', color: 'white', fontFamily: 'inherit' }}
            >
              <option value={5}>⭐⭐⭐⭐⭐ (5 نجوم)</option>
              <option value={4}>⭐⭐⭐⭐ (4 نجوم)</option>
              <option value={3}>⭐⭐⭐ (3 نجوم)</option>
              <option value={2}>⭐⭐ (نجمتين)</option>
              <option value={1}>⭐ (نجمة واحدة)</option>
            </select>
          </div>

          <div className="form-group">
            <label>نص التقييم</label>
            <textarea
              required
              rows="4"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--green-900)', color: 'white', fontFamily: 'inherit' }}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setEditingItem(null)} className="cancel-btn">إلغاء</button>
            <button type="submit" className="save-btn">حفظ الرأي</button>
          </div>
        </form>
      </AdminModal>

      <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
        <table className="admin-menu-table">
          <thead>
            <tr>
              <th>اسم العميل</th>
              <th>الوصف</th>
              <th>التقييم</th>
              <th>نص التقييم</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.name}</strong></td>
                <td><span style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>{item.name_en}</span></td>
                <td>
                  <span style={{ color: 'var(--gold)' }}>
                    {'★'.repeat(item.price > 0 ? item.price : 5)}
                    <span style={{ color: 'rgba(255,255,255,0.1)' }}>{'★'.repeat(5 - (item.price > 0 ? item.price : 5))}</span>
                  </span>
                </td>
                <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</td>
                <td>
                  <button type="button" onClick={() => handleEdit(item)} className="edit-btn">تعديل</button>
                  <button type="button" onClick={() => handleDelete(item.id)} className="delete-btn">حذف</button>
                </td>
              </tr>
            ))}
            {testimonials.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>لا توجد آراء مسجلة حالياً.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
