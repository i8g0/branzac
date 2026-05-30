import { supabase } from '../lib/supabase'

export default function AdminMessages({ messages, fetchOrdersAndMessages }) {
  const deleteMessage = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return
    await supabase.from('contact_messages').delete().eq('id', id)
    if (fetchOrdersAndMessages) fetchOrdersAndMessages()
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    return new Date(dateString).toLocaleDateString('ar-SA', options)
  }

  return (
    <div className="admin-menu-manager">
      <div className="admin-menu-header">
        <h2>رسائل العملاء</h2>
        <span style={{ background: 'var(--green-700)', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
          {messages.length} رسالة
        </span>
      </div>

      {messages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16, opacity: 0.3 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <p style={{ color: 'var(--text-light)', fontSize: '1rem' }}>لا توجد رسائل حالياً</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              background: 'white', padding: '20px', borderRadius: '14px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)',
              transition: 'all 0.2s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--green-700), var(--green-600))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1rem' }}>
                    {(msg.name || 'ع')[0]}
                  </div>
                  <div>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'block' }}>{msg.name || 'عميل'}</strong>
                    {msg.phone && <span style={{ fontSize: '0.82rem', color: 'var(--text-light)', direction: 'ltr', display: 'block' }}>{msg.phone}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>{formatDate(msg.created_at)}</span>
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    className="delete-btn"
                    style={{ padding: '6px 12px' }}
                  >
                    حذف
                  </button>
                </div>
              </div>
              <div style={{ background: '#f8f9fa', padding: '14px', borderRadius: '10px', fontSize: '0.95rem', lineHeight: '1.8', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                {msg.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
