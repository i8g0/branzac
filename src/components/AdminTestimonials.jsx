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
      name_en: formData.role,
      description: formData.text,
      price: formData.rating,
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

  if (loading) return <div className="settings-loading"><div className="admin-spinner"></div><p>جاري تحميل الآراء...</p></div>

  return (
    <div className="admin-menu-manager">
      <div className="admin-menu-header">
        <h2>إدارة آراء العملاء</h2>
        <button type="button" className="settings-btn-primary" onClick={startNew}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          إضافة رأي جديد
        </button>
      </div>

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
              placeholder="مثال: أحمد محمد"
            />
          </div>
          <div className="form-group">
            <label>المسمى (اختياري)</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="مثال: عميل دائم"
            />
          </div>
          <div className="form-group">
            <label>التقييم</label>
            <select
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
              style={{ width: '100%', padding: '11px 14px', background: '#f8f9fa', border: '2px solid transparent', borderRadius: '10px', fontFamily: 'var(--font-arabic)', fontSize: '0.95rem', color: 'var(--text-primary)', transition: 'all 0.25s ease' }}
            >
              <option value={5}>5 نجوم</option>
              <option value={4}>4 نجوم</option>
              <option value={3}>3 نجوم</option>
              <option value={2}>نجمتين</option>
              <option value={1}>نجمة واحدة</option>
            </select>
          </div>
          <div className="form-group">
            <label>نص التقييم</label>
            <textarea
              required
              rows="4"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              placeholder="اكتب تقييم العميل هنا..."
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setEditingItem(null)} className="cancel-btn">إلغاء</button>
            <button type="submit" className="save-btn">حفظ الرأي</button>
          </div>
        </form>
      </AdminModal>

      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table className="admin-menu-table">
          <thead>
            <tr>
              <th>العميل</th>
              <th>التقييم</th>
              <th>النص</th>
              <th style={{ width: '150px' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map((item) => (
              <tr key={item.id}>
                <td>
                  <div>
                    <span className="item-name">{item.name}</span>
                    {item.name_en && <span className="item-name-en">{item.name_en}</span>}
                  </div>
                </td>
                <td>
                  <span style={{ color: '#f59e0b', fontSize: '1rem', letterSpacing: 2 }}>
                    {'★'.repeat(item.price > 0 ? item.price : 5)}
                  </span>
                </td>
                <td style={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-light)', fontSize: '0.88rem' }}>{item.description}</td>
                <td>
                  <div className="item-actions">
                    <button type="button" onClick={() => handleEdit(item)} className="edit-btn">تعديل</button>
                    <button type="button" onClick={() => handleDelete(item.id)} className="delete-btn">حذف</button>
                  </div>
                </td>
              </tr>
            ))}
            {testimonials.length === 0 && (
              <tr><td colSpan={4} className="admin-menu-empty"><p>لا توجد آراء بعد</p></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
