import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react'
import { supabase } from '../lib/supabase'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useSiteLogo } from '../hooks/useSiteLogo'
import { useAdminSession } from '../components/AdminGuard'
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  defaultDropAnimationSideEffects,
  useDroppable,
  useDraggable
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

const AdminMenu = lazy(() => import('../components/AdminMenu'))
const AdminCategories = lazy(() => import('../components/AdminCategories'))
const AdminMessages = lazy(() => import('../components/AdminMessages'))
const AdminHero = lazy(() => import('../components/AdminHero'))
const AdminServices = lazy(() => import('../components/AdminServices'))
const AdminTestimonials = lazy(() => import('../components/AdminTestimonials'))
const AdminSettings = lazy(() => import('../components/AdminSettings'))

const STATUS_CONFIG = {
  new: { label: 'جديد', color: '#e74c3c', next: 'preparing' },
  preparing: { label: 'قيد التحضير', color: '#f39c12', next: 'ready' },
  ready: { label: 'جاهز', color: '#27ae60', next: 'done' },
  done: { label: 'مكتمل', color: '#95a5a6', next: null }
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
  const [activeDragOrder, setActiveDragOrder] = useState(null)
  const logo = useSiteLogo()
  const adminSession = useAdminSession()
  const debouncedSearch = useDebouncedValue(searchQuery, 280)
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

    return () => {
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(messagesChannel)
      dismissAlert()
    }
  }, [])

  const fetchData = async () => {
    const [{ data: ordersData }, { data: messagesData }] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
    ])
    if (ordersData) setOrders(ordersData)
    if (messagesData) setMessages(messagesData)
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
    stopSound()
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

      // Stop sound after 5 seconds, but keep the visual alert
      alarmTimeout.current = setTimeout(() => {
        stopSound()
      }, 5000)
    } catch(e) { console.error(e) }
  }

  // Stops only the audio, keeps the visual alert banner
  const stopSound = () => {
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
  }

  // Dismisses everything: sound + visual alert
  const dismissAlert = () => {
    stopSound()
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

  const activeOrders = orders.filter(o => o.status !== 'done')
  const baseOrders = filter === 'active' ? activeOrders : orders
  const displayOrders = useMemo(() => baseOrders.filter(o => {
    if (!debouncedSearch.trim()) return true
    const q = debouncedSearch.toLowerCase().trim()
    const matchRef = o.order_ref && String(o.order_ref).toLowerCase().includes(q)
    const matchTable = o.table_number && String(o.table_number).includes(q)
    const matchName = o.customer_name && String(o.customer_name).toLowerCase().includes(q)
    return matchRef || matchTable || matchName
  }), [baseOrders, debouncedSearch])
  const columns = ['new', 'preparing', 'ready', 'done']

  const newOrdersCount = orders.filter(o => o.status === 'new').length
  const newMessagesCount = messages.length

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
  })
  
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 100,
      tolerance: 15,
    },
  })

  const sensors = useSensors(mouseSensor, touchSensor)

  const handleDragStart = (event) => {
    const { active } = event
    if (active.data.current?.order) {
      setActiveDragOrder(active.data.current.order)
    }
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveDragOrder(null)
    if (!over) return
    
    const orderId = active.id
    const newStatus = over.id
    const oldStatus = active.data.current?.status

    if (newStatus && oldStatus !== newStatus && columns.includes(newStatus)) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      await updateStatus(orderId, newStatus)
    }
  }

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
          <h2 style={{fontSize: '2rem'}}>تفعيل التنبيهات</h2>
          <p>يرجى الضغط في أي مكان على الشاشة للسماح بصوت التنبيهات</p>
        </div>
      )}

      {alertOrder && (
        <div className="admin-alert-banner">
          <div className="admin-alert-content">
            <span className="admin-alert-icon"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></span>
            <div>
              <h2>طلب جديد #{alertOrder.order_ref}!</h2>
              <p><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginLeft:'4px'}} aria-hidden="true"><rect x="3" y="3" width="18" height="12" rx="2"/><line x1="7" y1="15" x2="7" y2="21"/><line x1="17" y1="15" x2="17" y2="21"/></svg> طاولة {alertOrder.table_number} — {alertOrder.total_price} ر.س</p>
            </div>
            <button className="admin-alert-dismiss" onClick={(e) => { e.stopPropagation(); dismissAlert(); }}>تم</button>
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
            <button className={`admin-tab-btn ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
              الخدمات
            </button>
            <button className={`admin-tab-btn ${activeTab === 'testimonials' ? 'active' : ''}`} onClick={() => setActiveTab('testimonials')}>
              آراء العملاء
            </button>
            <button className={`admin-tab-btn ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
              الرسائل {newMessagesCount > 0 && <span className="tab-badge">{newMessagesCount}</span>}
            </button>
            <button className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
              الإعدادات
            </button>
          </div>
        </div>
        {adminSession && (
          <div className="admin-header-user">
            <button
              type="button"
              className="admin-user-btn"
              onClick={() => adminSession.setView('change-password')}
              title="تغيير كلمة المرور"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </button>
            <button
              type="button"
              className="admin-logout-btn"
              onClick={adminSession.handleLogout}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              خروج
            </button>
          </div>
        )}
        
        {activeTab === 'orders' && (
          <div className="admin-header-actions">
            <div className="admin-search-container">
              <span className="admin-search-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
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

      {activeTab !== 'orders' ? (
        <Suspense fallback={<div className="admin-loading"><div className="admin-spinner"></div></div>}>
          {activeTab === 'menu' && <AdminMenu />}
          {activeTab === 'categories' && <AdminCategories />}
          {activeTab === 'messages' && <AdminMessages messages={messages} fetchOrdersAndMessages={fetchData} />}
          {activeTab === 'hero' && <AdminHero />}
          {activeTab === 'services' && <AdminServices />}
          {activeTab === 'testimonials' && <AdminTestimonials />}
          {activeTab === 'settings' && <AdminSettings />}
        </Suspense>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveDragOrder(null)}
        >
          <div className="admin-board">
            {columns.map(status => {
              const colOrders = displayOrders.filter(o => o.status === status)
              const config = STATUS_CONFIG[status]
              return (
                <DroppableColumn
                  key={status}
                  id={status}
                  status={status}
                  config={config}
                  colOrders={colOrders}
                  updateStatus={updateStatus}
                  deleteOrder={deleteOrder}
                />
              )
            })}
          </div>

          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }),
            }}
          >
            {activeDragOrder ? (
              <DraggableOrderCard
                order={activeDragOrder}
                status={activeDragOrder.status}
                config={STATUS_CONFIG[activeDragOrder.status]}
                updateStatus={updateStatus}
                deleteOrder={deleteOrder}
                isOverlay={true}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}

function DroppableColumn({ id, status, config, colOrders, updateStatus, deleteOrder }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className={`admin-column ${isOver ? 'admin-column-over' : ''}`} ref={setNodeRef}>
      <div className="admin-column-header" style={{borderBottomColor: config.color}}>
        <span>{config.label}</span>
        <span className="admin-column-count" style={{background: config.color}}>{colOrders.length}</span>
      </div>
      <div className="admin-column-body">
        {colOrders.length === 0 ? (
          <div className="admin-empty">لا توجد طلبات</div>
        ) : (
          colOrders.map(order => (
            <DraggableOrderCard
              key={order.id}
              order={order}
              status={status}
              config={config}
              updateStatus={updateStatus}
              deleteOrder={deleteOrder}
            />
          ))
        )}
      </div>
    </div>
  )
}

function DraggableOrderCard({ order, status, config, updateStatus, deleteOrder, isOverlay = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id,
    data: { order, status }
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  const finalStyle = isOverlay ? {
    cursor: 'grabbing',
    boxShadow: 'var(--shadow-xl)',
    transform: 'scale(1.02) rotate(-1deg)'
  } : style;

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={finalStyle}
      {...(!isOverlay ? listeners : {})}
      {...(!isOverlay ? attributes : {})}
      className={`admin-card ${status === 'new' ? 'admin-card-new' : ''}`}
    >
      <div className="admin-card-top">
        <span className="admin-table-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginLeft:'4px'}} aria-hidden="true"><rect x="3" y="3" width="18" height="12" rx="2"/><line x1="7" y1="15" x2="7" y2="21"/><line x1="17" y1="15" x2="17" y2="21"/></svg> طاولة {order.table_number}</span>
        <span className="admin-time"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginLeft:'4px'}} aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> <LiveTimeAgo date={order.created_at} /></span>
      </div>
      <div className="admin-card-ref">طلب رقم #{order.order_ref}</div>
      {order.customer_name && <div className="admin-card-name"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginLeft:'4px'}} aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> {order.customer_name}</div>}
      <div className="admin-card-items">
        {(order.items || []).map((item, i) => (
          <div key={i} className="admin-card-item">
            <span>{item.name} × {item.quantity}</span>
            <span>{item.price * item.quantity} ر.س</span>
          </div>
        ))}
      </div>
      {order.notes && <div className="admin-card-notes"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginLeft:'4px'}} aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> {order.notes}</div>}
      <div className="admin-card-total">
        <span>المجموع</span>
        <span>{order.total_price} ر.س</span>
      </div>
      <div className="admin-card-actions">
        {config.next && (
          <button
            className="admin-action-btn"
            style={{background: STATUS_CONFIG[config.next].color}}
            onPointerDown={(e) => e.stopPropagation()} 
            onClick={() => updateStatus(order.id, config.next)}
          >
            {STATUS_CONFIG[config.next].label}
          </button>
        )}
        <button
          className="admin-delete-btn"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => deleteOrder(order.id)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    </div>
  )
}

function LiveTimeAgo({ date }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  if (!date) return null

  const s = Math.max(0, Math.floor((now - new Date(date).getTime()) / 1000))
  if (s < 60) return `${s} ثانية`
  if (s < 3600) return `${Math.floor(s / 60)} دقيقة`
  return `${Math.floor(s / 3600)} ساعة`
}
