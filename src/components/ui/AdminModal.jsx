import { AnimatePresence, motion } from 'framer-motion'
import FocusTrap from 'focus-trap-react'
import { springModal } from '../../lib/motion'

export default function AdminModal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <FocusTrap active={open}>
          <motion.div
            className="admin-menu-form-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'admin-modal-title' : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="admin-menu-form-modal"
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={springModal}
              onClick={(e) => e.stopPropagation()}
            >
              {title && <h3 id="admin-modal-title">{title}</h3>}
              {children}
            </motion.div>
          </motion.div>
        </FocusTrap>
      )}
    </AnimatePresence>
  )
}
