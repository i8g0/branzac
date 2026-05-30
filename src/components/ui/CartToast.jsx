import { AnimatePresence, motion } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'
import { springToast } from '../../lib/motion'
import { useCartUi } from '../../store/cartStore'

export default function CartToast() {
  const { toast } = useCartUi()
  const reduceMotion = useReducedMotion()

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      <AnimatePresence mode="popLayout">
        {toast && (
          <motion.div
            key={toast.id}
            className="toast"
            role="status"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -40, scale: 0.96 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -24, scale: 0.98 }}
            transition={springToast}
            layout
          >
            <span className="toast-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span className="toast-message">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
