import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'
import { AnimatePresence, motion } from 'framer-motion'
import FocusTrap from 'focus-trap-react'

const STEPS = [
  { key: 'new', icon: '📋', label: 'تم استلام الطلب' },
  { key: 'preparing', icon: '🔥', label: 'قيد التحضير' },
  { key: 'ready', icon: '✅', label: 'جاهز للتقديم' },
  { key: 'done', icon: '🎉', label: 'تم التقديم' }
]

function OrderTracker({ status, orderRef, onClose }) {
  const statusIndex = STEPS.findIndex(s => s.key === status)
  return (
    <div className="order-tracker">
      <div style={{textAlign: 'center', marginBottom: '20px'}}>
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#2d6847" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <h3 style={{marginTop: '8px', fontSize: '1.2rem'}}>تم إرسال طلبك! ☕</h3>
        <p style={{color: 'var(--green-700)', fontSize: '1.1rem', fontWeight: 'bold', margin: '4px 0'}}>طلب رقم #{orderRef}</p>
      </div>
      <div className="order-stepper">
        {STEPS.map((step, i) => {
          const isActive = i <= statusIndex
          const isCurrent = i === statusIndex
          return (
            <div key={step.key} className={`order-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}>
              <div className="order-step-icon" style={{
                background: isActive ? 'var(--green-700)' : '#e0e0e0',
                color: isActive ? 'white' : '#999',
                transform: isCurrent ? 'scale(1.2)' : 'scale(1)',
                boxShadow: isCurrent ? '0 0 0 4px rgba(45,104,71,0.2)' : 'none'
              }}>{step.icon}</div>
              <span className="order-step-label" style={{
                color: isActive ? 'var(--green-700)' : '#999',
                fontWeight: isCurrent ? 800 : 500
              }}>{step.label}</span>
              {i < STEPS.length - 1 && (
                <div className="order-step-line" style={{background: i < statusIndex ? 'var(--green-700)' : '#e0e0e0'}} />
              )}
            </div>
          )
        })}
      </div>
      <div style={{background: 'var(--cream)', padding: '14px', borderRadius: '12px', textAlign: 'center', marginTop: '20px'}}>
        <p style={{fontWeight: 700, fontSize: '1rem'}}>💰 الدفع عند استلام الطلب</p>
        <p style={{fontSize: '0.82rem', color: 'var(--text-light)', marginTop: '4px'}}>كاش أو شبكة</p>
      </div>
      <button onClick={onClose} style={{
        width: '100%', padding: '14px', marginTop: '16px',
        background: status === 'done' ? 'var(--green-700)' : 'var(--beige-dark)',
        color: status === 'done' ? 'white' : 'var(--text-primary)',
        border: 'none', borderRadius: '12px', fontWeight: 700,
        fontSize: '1rem', cursor: 'pointer', fontFamily: 'var(--font-arabic)'
      }}>{status === 'done' ? '🎉 شكراً لك!' : 'إغلاق'}</button>
    </div>
  )
}

export default function Cart() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart()
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutDone, setCheckoutDone] = useState(false)
  const [orderRef, setOrderRef] = useState('')
  const [selectedTable, setSelectedTable] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [trackingOrder, setTrackingOrder] = useState(null)

  // Load from localStorage on mount
  useEffect(() => {
    const savedId = localStorage.getItem('branzac_order_id')
    if (savedId) {
      supabase.from('orders').select('*').eq('id', savedId).single().then(({data}) => {
        if (data && data.status !== 'done') {
          setTrackingOrder(data)
          setOrderRef(data.order_ref)
        } else {
          localStorage.removeItem('branzac_order_id')
        }
      })
    }
  }, [])

  // Real-time order tracking
  useEffect(() => {
    if (!trackingOrder?.id) return
    const channel = supabase
      .channel('order-track-' + trackingOrder.id)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'orders',
        filter: `id=eq.${trackingOrder.id}`
      }, (payload) => {
        setTrackingOrder(payload.new)
        if (payload.new.status === 'done') {
          localStorage.removeItem('branzac_order_id')
        }
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [trackingOrder?.id])

  const handleCheckout = () => {
    setShowCheckout(true)
  }

  const handleConfirmOrder = async (e) => {
    e.preventDefault()
    if (!selectedTable || submitting) return
    setSubmitting(true)

    const nameInput = document.getElementById('checkout-name')
    const notesInput = document.getElementById('checkout-notes')

    const orderData = {
      table_number: selectedTable,
      customer_name: nameInput?.value || null,
      notes: notesInput?.value || null,
      items: items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
      total_price: totalPrice,
      status: 'new'
    }

    const { data, error } = await supabase.from('orders').insert([orderData]).select()
    
    if (error) {
      console.error('Order error:', error)
      alert('حدث خطأ في إرسال الطلب. حاول مرة أخرى.')
      setSubmitting(false)
      return
    }

    const generatedRef = data && data[0] ? data[0].order_ref : '1000'
    setOrderRef(generatedRef)
    setCheckoutDone(true)
    setSubmitting(false)
    clearCart()
    if (data && data[0]) {
      setTrackingOrder(data[0])
      localStorage.setItem('branzak_order_id', data[0].id)
    }
  }

  const closeTracker = () => {
    setShowCheckout(false)
    setCheckoutDone(false)
    setSelectedTable(null)
    setTrackingOrder(null)
    setIsOpen(false)
  }

  return (
    <>
      {/* Floating Track Button */}
      <AnimatePresence>
        {!showCheckout && trackingOrder && trackingOrder.status !== 'done' && (
          <motion.button 
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="floating-track-btn" 
            onClick={() => { setShowCheckout(true); setCheckoutDone(true) }}
          >
            <span className="track-icon">🔍</span>
            <span>تتبع طلبك</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
      {isOpen && (
        <FocusTrap active={isOpen && !showCheckout}>
          <div className="cart-portal-wrapper">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="cart-overlay" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
              className="cart-sidebar"
            >
              <div className="cart-header">
                <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            سلة المشتريات
            <span className="cart-count">({totalItems})</span>
          </h2>
          <button className="cart-close" onClick={() => setIsOpen(false)} aria-label="إغلاق السلة">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <p>السلة فارغة</p>
            <span>امسح QR Code على طاولتك واختر طلبك</span>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <span className="cart-item-price">{item.price} ر.س</span>
                  </div>
                  <div className="cart-item-controls">
                    <div className="qty-controls">
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)} aria-label="تقليل الكمية">−</button>
                      <span className="qty-value">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)} aria-label="زيادة الكمية">+</button>
                    </div>
                    <span className="cart-item-total">{item.price * item.quantity} ر.س</span>
                    <button className="remove-btn" onClick={() => removeItem(item.id)} aria-label="حذف المنتج">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <button className="clear-cart-btn" onClick={clearCart}>
                إفراغ السلة
              </button>
              <div className="cart-total-row">
                <span>المجموع الكلي</span>
                <span className="cart-total-price">{totalPrice} ر.س</span>
              </div>
              <button className="checkout-btn" onClick={handleCheckout}>
                إتمام الطلب
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                </svg>
              </button>
            </div>
          </>
        )}
        </motion.div>
      </div>
    </FocusTrap>
  )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
      {showCheckout && (
        <FocusTrap active={showCheckout}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="checkout-overlay"
          >
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="checkout-modal"
            >
            {checkoutDone ? (
              <OrderTracker
                status={trackingOrder?.status || 'new'}
                orderRef={orderRef}
                onClose={closeTracker}
              />
            ) : (
              <>
                <div className="checkout-header">
                  <h3>تأكيد الطلب</h3>
                  <button className="cart-close" onClick={() => setShowCheckout(false)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                {/* ملخص الطلب */}
                <div className="checkout-summary">
                  {items.map(item => (
                    <div key={item.id} className="checkout-item">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{item.price * item.quantity} ر.س</span>
                    </div>
                  ))}
                  <div className="checkout-total">
                    <span>المجموع</span>
                    <span>{totalPrice} ر.س</span>
                  </div>
                </div>

                <form className="checkout-form" onSubmit={handleConfirmOrder}>
                  {/* اختيار الطاولة */}
                  <div className="form-group">
                    <label>اختر طاولتك</label>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '8px'}}>
                      {[1,2,3,4,5,6,7].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setSelectedTable(num)}
                          style={{
                            padding: '14px 0',
                            borderRadius: '12px',
                            border: selectedTable === num ? '2px solid var(--green-700)' : '2px solid var(--beige-dark)',
                            background: selectedTable === num ? 'var(--green-700)' : 'var(--white)',
                            color: selectedTable === num ? 'white' : 'var(--text-primary)',
                            fontWeight: 800,
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span style={{fontSize: '1.3rem'}}>🪑</span>
                          {num}
                        </button>
                      ))}
                    </div>
                    {!selectedTable && <p style={{color: '#e74c3c', fontSize: '0.82rem', marginTop: '6px', textAlign: 'center'}}>اختر رقم طاولتك</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="checkout-name">الاسم (اختياري)</label>
                    <input type="text" id="checkout-name" placeholder="اسمك للطلب" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="checkout-notes">ملاحظات (اختياري)</label>
                    <textarea id="checkout-notes" placeholder="مثال: بدون سكر، حليب لوز..." rows="2"></textarea>
                  </div>

                  {/* طريقة الدفع */}
                  <div style={{background: 'var(--cream)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <span style={{fontSize: '1.5rem'}}>💵</span>
                    <div>
                      <strong style={{fontSize: '0.95rem', color: 'var(--text-primary)'}}>الدفع عند الاستلام</strong>
                      <p style={{fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '2px'}}>ادفع كاش أو شبكة عند وصول طلبك للطاولة</p>
                    </div>
                  </div>

                  <button type="submit" className="confirm-order-btn" disabled={submitting || !selectedTable}>
                    {submitting ? 'جاري الإرسال...' : `أرسل الطلب - ${totalPrice} ر.س`}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
        </FocusTrap>
      )}
      </AnimatePresence>
    </>
  )
}
