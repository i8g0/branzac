import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import AdminMenu from '../components/AdminMenu'
import AdminCategories from '../components/AdminCategories'
import AdminMessages from '../components/AdminMessages'
import AdminHero from '../components/AdminHero'

const STATUS_CONFIG = {
  new: { label: '🆕 جديد', color: '#e74c3c', next: 'preparing' },
  preparing: { label: '🔥 قيد التحضير', color: '#f39c12', next: 'ready' },
  ready: { label: '✅ جاهز', color: '#27ae60', next: 'done' },
  done: { label: '✔️ مكتمل', color: '#95a5a6', next: null }
}

export default function Admin() {
  const [orders, setOrders] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('active')
  const [searchQuery, setSearchQuery] = useState('')
  const [alertOrder, setAlertOrder] = useState(null)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [activeTab, setActiveTab] = useState('orders')
  const [logo, setLogo] = useState('/images/logo-bg.png')
  const alarmRef = useRef(null)
  const alarmTimeout = useRef(null)
  const beepInterval = useRef(null)

  useEffect(() => {
    try {
      const testCtx = new (window.AudioContext || window.webkitAudioContext)()
      if (testCtx.state === 'running') {
        setAudioEnabled(true)
      } else {
        const unlock = () => {
          setAudioEnabled(true)
          window.removeEventListener('click', unlock)
        }
        window.addEventListener('click', unlock)
      }
    } catch(e) {}

    fetchData()
    const ordersChannel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [payload.new, ...prev])
          startAlarm(payload.new)
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new : o))
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id))
        }
      })
      .subscribe()

    const messagesChannel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages(prev => [payload.new, ...prev])
          playMessageBeep()
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id))
        }
      })
      .subscribe()

    const logoChannel = supabase
      .channel('admin-logo-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items', filter: 'category=eq.__site_logo__' }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(messagesChannel)
      supabase.removeChannel(logoChannel)
      stopAlarm()
    }
  }, [])

  const fetchData = async () => {
    const [{ data: ordersData }, { data: messagesData }, { data: logoData }] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      supabase.from('menu_items').select('*').eq('category', '__site_logo__').maybeSingle()
    ])
    if (ordersData) setOrders(ordersData)
    if (messagesData) setMessages(messagesData)
    if (logoData && logoData.image) setLogo(logoData.image)
    setLoading(false)
  }

  const playMessageBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = 800 // high pitch short beep
      gain.gain.value = 0.5
      gain.gain.setValueAtTime(0.5, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    } catch(e) {}
  }

  const startAlarm = (order) => {
    stopAlarm()
    setAlertOrder(order)
    
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      alarmRef.current = { ctx, playing: true }
      
      const playBeep = () => {
        if (!alarmRef.current?.playing) return
        const time = ctx.currentTime
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.type = 'square'
          osc.frequency.value = i % 2 === 0 ? 880 : 1100
          gain.gain.value = 0.5
          gain.gain.setValueAtTime(0.5, time + i * 0.15)
          gain.gain.exponentialRampToValueAtTime(0.01, time + i * 0.15 + 0.12)
          osc.start(time + i * 0.15)
          osc.stop(time + i * 0.15 + 0.12)
        }
      }

      playBeep()
      
      beepInterval.current = setInterval(() => {
        playBeep()
      }, 1500)

      alarmTimeout.current = setTimeout(() => {
        stopAlarm()
      }, 10000)
    } catch(e) { console.error(e) }
  }

  const stopAlarm = () => {
    if (alarmRef.current) {
      alarmRef.current.playing = false
      try { alarmRef.current.ctx.close() } catch(e) {}
      alarmRef.current = null
    }
    if (beepInterval.current) {
      clearInterval(beepInterval.current)
      beepInterval.current = null
    }
    if (alarmTimeout.current) {
      clearTimeout(alarmTimeout.current)
      alarmTimeout.current = null
    }
    setAlertOrder(null)
  }

  const updateStatus = async (id, newStatus) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', id)
  }

  const deleteOrder = async (id) => {
    if (confirm('حذف هذا الطلب؟')) {
      await supabase.from('orders').delete().eq('id', id)
    }
  }

  const getTimeAgo = (d) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
    if (s < 60) return `${s} ثانية`
    if (s < 3600) return `${Math.floor(s/60)} دقيقة`
    return `${Math.floor(s/3600)} ساعة`
  }

  const activeOrders = orders.filter(o => o.status !== 'done')
  const baseOrders = filter === 'active' ? activeOrders : orders
  const displayOrders = baseOrders.filter(o => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    const matchRef = o.order_ref && String(o.order_ref).toLowerCase().includes(q)
    const matchTable = o.table_number && String(o.table_number).includes(q)
    const matchName = o.customer_name && String(o.customer_name).toLowerCase().includes(q)
    return matchRef || matchTable || matchName
  })
  const columns = ['new', 'preparing', 'ready', 'done']

  const newOrdersCount = orders.filter(o => o.status === 'new').length
  const newMessagesCount = messages.length

  if (loading) return (
    <div className="admin-loading">
      <div className="admin-spinner"></div>
      <p>جاري تحميل الطلبات...</p>
    </div>
  )

  return (
    <div className="admin-page">
      {!audioEnabled && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 10000,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: 'white', gap: '20px'
        }}>
          <h2 style={{fontSize: '2rem'}}>تفعيل التنبيهات 🔔</h2>
          <p>يرجى الضغط في أي مكان على الشاشة للسماح بصوت التنبيهات</p>
        </div>
      )}

      {alertOrder && (
        <div className="admin-alert-banner" onClick={(e) => { e.stopPropagation(); stopAlarm(); }}>
          <div className="admin-alert-content">
            <span className="admin-alert-icon">🔔</span>
            <div>
              <h2>طلب جديد #{alertOrder.order_ref}!</h2>
              <p>🪑 طاولة {alertOrder.table_number} — {alertOrder.total_price} ر.س</p>
            </div>
            <button className="admin-alert-dismiss">✕ تم</button>
          </div>
        </div>
      )}

      <header className="admin-header">
        <div className="admin-header-title">
          <img src={logo} alt="Branzac Logo" className="admin-logo" />
          <div className="admin-tabs">
            <button className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
              الطلبات {newOrdersCount > 0 && <span className="tab-badge">{newOrdersCount}</span>}
            </button>
            <button className={`admin-tab-btn ${activeTab === 'hero' ? 'active' : ''}`} onClick={() => setActiveTab('hero')}>
              الصور
            </button>
            <button className={`admin-tab-btn ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
              إدارة المنيو
            </button>
            <button className={`admin-tab-btn ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
              إدارة الأقسام
            </button>
            <button className={`admin-tab-btn ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
              الرسائل {newMessagesCount > 0 && <span className="tab-badge">{newMessagesCount}</span>}
            </button>
          </div>
        </div>
        
        {activeTab === 'orders' && (
          <div className="admin-header-actions">
            <div className="admin-search-container">
              <span className="admin-search-icon">🔍</span>
              <input
                type="text"
                placeholder="ابحث برقم الطلب، الطاولة، الاسم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-search-input"
              />
              {searchQuery && (
                <button className="admin-search-clear" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>

            <div className="admin-filter">
              <button className={filter === 'active' ? 'active' : ''} onClick={() => setFilter('active')}>النشطة</button>
              <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>الكل</button>
            </div>
            <button className="admin-refresh" onClick={fetchData}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              تحديث
            </button>
          </div>
        )}
      </header>

      {activeTab === 'menu' ? (
        <AdminMenu />
      ) : activeTab === 'categories' ? (
        <AdminCategories />
      ) : activeTab === 'hero' ? (
        <AdminHero />
      ) : activeTab === 'messages' ? (
        <AdminMessages messages={messages} setMessages={setMessages} />
      ) : (
        <div className="admin-board">
          {columns.map(status => {
            const colOrders = displayOrders.filter(o => o.status === status)
            const config = STATUS_CONFIG[status]
            return (
              <div key={status} className="admin-column">
                <div className="admin-column-header" style={{borderBottomColor: config.color}}>
                  <span>{config.label}</span>
                  <span className="admin-column-count" style={{background: config.color}}>{colOrders.length}</span>
                </div>
                <div className="admin-column-body">
                  {colOrders.length === 0 ? (
                    <div className="admin-empty">لا توجد طلبات</div>
                  ) : (
                    colOrders.map(order => (
                      <div key={order.id} className={`admin-card ${status === 'new' ? 'admin-card-new' : ''}`}>
                        <div className="admin-card-top">
                          <span className="admin-table-badge">🪑 طاولة {order.table_number}</span>
                          <span className="admin-time">⏱ {getTimeAgo(order.created_at)}</span>
                        </div>
                        <div className="admin-card-ref">طلب رقم #{order.order_ref}</div>
                        {order.customer_name && <div className="admin-card-name">👤 {order.customer_name}</div>}
                        <div className="admin-card-items">
                          {(order.items || []).map((item, i) => (
                            <div key={i} className="admin-card-item">
                              <span>{item.name} × {item.quantity}</span>
                              <span>{item.price * item.quantity} ر.س</span>
                            </div>
                          ))}
                        </div>
                        {order.notes && <div className="admin-card-notes">📝 {order.notes}</div>}
                        <div className="admin-card-total">
                          <span>المجموع</span>
                          <span>{order.total_price} ر.س</span>
                        </div>
                        <div className="admin-card-actions">
                          {config.next && (
                            <button className="admin-action-btn" style={{background: STATUS_CONFIG[config.next].color}} onClick={() => updateStatus(order.id, config.next)}>
                              {STATUS_CONFIG[config.next].label}
                            </button>
                          )}
                          <button className="admin-delete-btn" onClick={() => deleteOrder(order.id)}>🗑️</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
