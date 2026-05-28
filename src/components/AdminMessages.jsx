import { supabase } from '../lib/supabase'

export default function AdminMessages({ messages, setMessages }) {
  const deleteMessage = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return
    
    // Optimistic update
    setMessages(prev => prev.filter(m => m.id !== id))
    await supabase.from('contact_messages').delete().eq('id', id)
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    return new Date(dateString).toLocaleDateString('ar-SA', options)
  }

  return (
    <div className="admin-messages-container" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', color: 'var(--green-900)' }}>رسائل العملاء ✉️</h2>
      {messages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', border: '1px solid #ddd' }}>لا توجد رسائل حالياً</div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <strong style={{ fontSize: '1.1rem', color: 'var(--green-700)' }}>{msg.name || 'عميل'}</strong>
                <span style={{ fontSize: '0.85rem', color: '#999' }}>{formatDate(msg.created_at)}</span>
              </div>
              
              {msg.phone && (
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  📞 <strong>رقم التواصل:</strong> <span dir="ltr">{msg.phone}</span>
                </div>
              )}
              
              <div style={{ background: 'var(--cream)', padding: '15px', borderRadius: '8px', fontSize: '1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {msg.message}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button 
                  onClick={() => deleteMessage(msg.id)}
                  style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  حذف الرسالة 🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
