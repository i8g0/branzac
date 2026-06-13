import { useState, useEffect, useCallback, useMemo } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import FocusTrap from 'focus-trap-react'
import {
  useCartItems,
  useCartTotals,
  useCartUi,
  useCartActions,
} from '../store/cartStore'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../lib/utils'
import { springDrawer, springModal, fade } from '../lib/motion'
import PremiumImage from './ui/PremiumImage'
import MyFatoorahCheckout from './MyFatoorahCheckout'

const ORDER_STORAGE_KEY = 'branzac_order_id'

const STEPS = [
  { key: 'new', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>), label: 'تم استلام الطلب' },
  { key: 'preparing', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>), label: 'قيد التحضير' },
  { key: 'ready', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>), label: 'جاهز للتقديم' },
  { key: 'done', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>), label: 'تم التقديم' },
]

function OrderTracker({ status, orderRef, onClose }) {
  const statusIndex = STEPS.findIndex((s) => s.key === status)
  return (
    <div className="order-tracker">
      <div className="order-tracker__header">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <h3>تم إرسال طلبك!</h3>
        <p className="order-tracker__ref">طلب رقم #{orderRef}</p>
      </div>
      <ol className="order-stepper">
        {STEPS.map((step, i) => {
          const isActive = i <= statusIndex
          const isCurrent = i === statusIndex
          return (
            <li
              key={step.key}
              className={`order-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
            >
              <div
                className="order-step-icon"
                style={{
                  background: isActive ? 'var(--green-700)' : 'var(--beige-dark)',
                  color: isActive ? 'var(--white)' : 'var(--text-light)',
                }}
              >
                {step.icon}
              </div>
              <span className="order-step-label">{step.label}</span>
              {i < STEPS.length - 1 && (
                <div
                  className="order-step-line"
                  style={{
                    background: i < statusIndex ? 'var(--green-700)' : 'var(--beige-dark)',
                  }}
                />
              )}
            </li>
          )
        })}
      </ol>
      <div className="order-tracker__payment">
        <p>الدفع عند استلام الطلب</p>
        <span>كاش أو شبكة</span>
      </div>
      <button
        type="button"
        className={`order-tracker__close ${status === 'done' ? 'order-tracker__close--done' : ''}`}
        onClick={onClose}
      >
        {status === 'done' ? 'شكراً لك!' : 'إغلاق'}
      </button>
    </div>
  )
}

export default function Cart() {
  const items = useCartItems()
  const { totalItems, totalPrice } = useCartTotals()
  const { isOpen, setIsOpen } = useCartUi()
  const { removeItem, updateQuantity, clearCart } = useCartActions()

  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutDone, setCheckoutDone] = useState(false)
  const [orderRef, setOrderRef] = useState('')
  const [selectedTable, setSelectedTable] = useState(null)
  const [customerName, setCustomerName] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [trackingOrder, setTrackingOrder] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const reduceMotion = useReducedMotion()

  const drawerTransition = reduceMotion ? { duration: 0.2 } : springDrawer
  const modalTransition = reduceMotion ? { duration: 0.2 } : springModal

  useEffect(() => {
    const savedId = localStorage.getItem(ORDER_STORAGE_KEY)
    if (!savedId) return

    supabase
      .from('orders')
      .select('*')
      .eq('id', savedId)
      .single()
      .then(({ data }) => {
        if (data && data.status !== 'done') {
          setTrackingOrder(data)
          setOrderRef(data.order_ref)
        } else {
          localStorage.removeItem(ORDER_STORAGE_KEY)
        }
      })
  }, [])

  useEffect(() => {
    if (!trackingOrder?.id) return

    const channel = supabase
      .channel(`order-track-${trackingOrder.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${trackingOrder.id}`,
        },
        (payload) => {
          setTrackingOrder(payload.new)
          if (payload.new.status === 'done') {
            localStorage.removeItem(ORDER_STORAGE_KEY)
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [trackingOrder?.id])

  const handleCheckout = () => setShowCheckout(true)

  const handleConfirmOrder = async (e) => {
    e.preventDefault()
    if (!selectedTable || submitting || items.length === 0) return

    setSubmitting(true)

    const orderData = {
      table_number: selectedTable,
      customer_name: customerName.trim() || null,
      notes: notes.trim() || null,
      items: items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      total_price: totalPrice,
      status: 'new',
    }

    const { data, error } = await supabase.from('orders').insert([orderData]).select()

    setSubmitting(false)

    if (error) {
      console.error('Order error:', error)
      alert('حدث خطأ في إرسال الطلب. حاول مرة أخرى.')
      return
    }

    const order = data?.[0]
    setOrderRef(order?.order_ref ?? '—')
    setCheckoutDone(true)
    clearCart()

    if (order) {
      setTrackingOrder(order)
      localStorage.setItem(ORDER_STORAGE_KEY, order.id)
    }
  }

  const closeTracker = useCallback(() => {
    setShowCheckout(false)
    setCheckoutDone(false)
    setSelectedTable(null)
    setCustomerName('')
    setNotes('')
    if (trackingOrder?.status === 'done') {
      setTrackingOrder(null)
    }
    setIsOpen(false)
  }, [setIsOpen, trackingOrder])

  const openTracking = () => {
    setShowCheckout(true)
    setCheckoutDone(true)
  }

  return (
    <>
      <AnimatePresence>
        {!showCheckout && trackingOrder && trackingOrder.status !== 'done' && (
          <motion.button
            type="button"
            className="floating-track-btn"
            onClick={openTracking}
            initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={springDrawer}
            whileHover={reduceMotion ? undefined : { scale: 1.04 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>تتبع طلبك</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <FocusTrap active={isOpen && !showCheckout}>
            <div className="cart-portal-wrapper">
              <motion.button
                type="button"
                className="cart-overlay"
                aria-label="إغلاق السلة"
                onClick={() => setIsOpen(false)}
                {...fade}
              />
              <motion.aside
                className="cart-sidebar"
                role="dialog"
                aria-modal="true"
                aria-label="سلة المشتريات"
                initial={reduceMotion ? false : { x: '-100%' }}
                animate={{ x: 0 }}
                exit={reduceMotion ? undefined : { x: '-100%' }}
                transition={drawerTransition}
              >
                <div className="cart-header">
                  <h2>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    سلة المشتريات
                    <span className="cart-count">({totalItems})</span>
                  </h2>
                  <button
                    type="button"
                    className="cart-close"
                    onClick={() => setIsOpen(false)}
                    aria-label="إغلاق السلة"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {items.length === 0 ? (
                  <div className="cart-empty">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    <p>السلة فارغة</p>
                    <span>امسح QR Code على طاولتك واختر طلبك</span>
                  </div>
                ) : (
                  <>
                    <ul className="cart-items">
                      {items.map((item) => (
                        <li key={item.id} className="cart-item">
                          <div className="cart-item-img">
                            <PremiumImage
                              src={item.image}
                              alt=""
                              aspectRatio="1"
                              wrapperClassName="cart-item-image-wrap"
                            />
                          </div>
                          <div className="cart-item-info">
                            <h4>{item.name}</h4>
                            <span className="cart-item-price">
                              {formatPrice(item.price)} ر.س
                            </span>
                          </div>
                          <div className="cart-item-controls">
                            <div className="qty-controls">
                              <button
                                type="button"
                                className="qty-btn"
                                onClick={() => updateQuantity(item.id, -1)}
                                aria-label="تقليل الكمية"
                              >
                                −
                              </button>
                              <span className="qty-value" aria-live="polite">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                className="qty-btn"
                                onClick={() => updateQuantity(item.id, 1)}
                                aria-label="زيادة الكمية"
                              >
                                +
                              </button>
                            </div>
                            <span className="cart-item-total">
                              {formatPrice(item.price * item.quantity)} ر.س
                            </span>
                            <button
                              type="button"
                              className="remove-btn"
                              onClick={() => removeItem(item.id)}
                              aria-label={`حذف ${item.name}`}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="cart-footer">
                      <button type="button" className="clear-cart-btn" onClick={clearCart}>
                        إفراغ السلة
                      </button>
                      <div className="cart-total-row">
                        <span>المجموع الكلي</span>
                        <span className="cart-total-price">{formatPrice(totalPrice)} ر.س</span>
                      </div>
                      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-light, #999)', margin: '4px 0 0', fontWeight: 500 }}>شامل الضريبة المضافة</p>
                      <button type="button" className="checkout-btn" onClick={handleCheckout}>
                        إتمام الطلب
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <line x1="12" y1="19" x2="12" y2="5" />
                          <polyline points="5 12 12 5 19 12" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </motion.aside>
            </div>
          </FocusTrap>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCheckout && (
          <FocusTrap active={showCheckout}>
            <motion.div
              className="checkout-overlay"
              role="dialog"
              aria-modal="true"
              aria-label="تأكيد الطلب"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="checkout-modal"
                initial={reduceMotion ? false : { opacity: 0, y: 40, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 20, scale: 0.96 }}
                transition={modalTransition}
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
                      <button
                        type="button"
                        className="cart-close"
                        onClick={() => setShowCheckout(false)}
                        aria-label="إغلاق"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>

                    <div className="checkout-summary">
                      {items.map((item) => (
                        <div key={item.id} className="checkout-item">
                          <span>
                            {item.name} × {item.quantity}
                          </span>
                          <span>{formatPrice(item.price * item.quantity)} ر.س</span>
                        </div>
                      ))}
                      <div className="checkout-total">
                        <span>المجموع</span>
                        <span>{formatPrice(totalPrice)} ر.س</span>
                      </div>
                    </div>

                    <form className="checkout-form" onSubmit={handleConfirmOrder}>
                      <fieldset className="form-group">
                        <legend>اختر طاولتك</legend>
                        <div className="table-picker">
                          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                            <button
                              key={num}
                              type="button"
                              className={`table-picker__btn ${selectedTable === num ? 'table-picker__btn--active' : ''}`}
                              onClick={() => setSelectedTable(num)}
                              aria-pressed={selectedTable === num}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="12" rx="2"/><line x1="7" y1="15" x2="7" y2="21"/><line x1="17" y1="15" x2="17" y2="21"/></svg>
                              {num}
                            </button>
                          ))}
                        </div>
                        {!selectedTable && (
                          <p className="form-error" role="alert">
                            اختر رقم طاولتك
                          </p>
                        )}
                      </fieldset>

                      <div className="form-group">
                        <label htmlFor="checkout-name">الاسم (اختياري)</label>
                        <input
                          type="text"
                          id="checkout-name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="اسمك للطلب"
                          autoComplete="name"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="checkout-notes">ملاحظات (اختياري)</label>
                        <textarea
                          id="checkout-notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="مثال: بدون سكر، حليب لوز..."
                          rows={2}
                        />
                      </div>

                      <div className="payment-methods">
                        <label className="payment-methods__label">اختر طريقة الدفع</label>
                        <div className="payment-methods__grid">
                          <button
                            type="button"
                            className={`payment-method-btn ${paymentMethod === 'apple_pay' ? 'payment-method-btn--active' : ''}`}
                            onClick={() => setPaymentMethod('apple_pay')}
                          >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                            </svg>
                            <span>Apple Pay</span>
                          </button>
                          <button
                            type="button"
                            className={`payment-method-btn ${paymentMethod === 'card' ? 'payment-method-btn--active' : ''}`}
                            onClick={() => setPaymentMethod('card')}
                          >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                              <line x1="1" y1="10" x2="23" y2="10"/>
                            </svg>
                            <span>بطاقه ائتمان</span>
                          </button>
                        </div>
                      </div>

                      {paymentMethod === 'cash' && (
                        <div className="checkout-payment-note">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                          <div>
                            <strong>الدفع عند الاستلام</strong>
                            <p>ادفع كاش أو شبكة عند وصول طلبك للطاولة</p>
                          </div>
                        </div>
                      )}

                      {(paymentMethod === 'apple_pay' || paymentMethod === 'card') && (
                        <MyFatoorahCheckout
                          amount={totalPrice}
                          customerName={customerName}
                          orderId={`BRZ-${Date.now()}`}
                          onSuccess={(data) => {
                            handleConfirmOrder({ preventDefault: () => {} })
                          }}
                          onError={(err) => console.error('Payment error:', err)}
                        />
                      )}

                      <button
                        type="submit"
                        className="confirm-order-btn"
                        disabled={submitting || !selectedTable || items.length === 0}
                      >
                        {submitting
                          ? 'جاري الإرسال...'
                          : `أرسل الطلب - ${formatPrice(totalPrice)} ر.س`}
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
