import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import FocusTrap from 'focus-trap-react'
import { useCartTotals, useCartUi } from '../store/cartStore'
import { useSiteLogo } from '../hooks/useSiteLogo'
import { useScrolled } from '../hooks/useThrottledScroll'
import { springDrawer } from '../lib/motion'

const NAV_LINKS = [
  { label: 'الرئيسية', href: '#home' },
  { label: 'المنيو', href: '#menu' },
  { label: 'قصتنا', href: '#about' },
  { label: 'تواصل', href: '#contact' },
]

export default function Navbar() {
  const scrolled = useScrolled()
  const [mobileOpen, setMobileOpen] = useState(false)
  const logo = useSiteLogo()
  const { totalItems } = useCartTotals()
  const { setIsOpen } = useCartUi()
  const reduceMotion = useReducedMotion()

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeMobile()
    }
    if (mobileOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen, closeMobile])

  return (
    <header>
      <nav
        className={`navbar ${scrolled ? 'scrolled' : ''}`}
        aria-label="التنقل الرئيسي"
      >
        <div className="container">
          <a href="#home" className="navbar-logo">
            <img src={logo} alt="BRANZAG | برانزاك" width={42} height={42} decoding="async" />
          </a>

          <FocusTrap
            active={mobileOpen}
            focusTrapOptions={{
              clickOutsideDeactivates: true,
              allowOutsideClick: true,
            }}
          >
            <div className="nav-mobile-container">
              <AnimatePresence>
                {mobileOpen && (
                  <motion.button
                    type="button"
                    className="nav-overlay active"
                    aria-label="إغلاق القائمة"
                    style={{
                      display: 'block',
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      padding: 0,
                      outline: 'none',
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                    }}
                    onClick={closeMobile}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>

              <ul
                id="mobile-nav"
                className={`nav-links ${mobileOpen ? 'active' : ''}`}
                style={{ position: 'fixed' }}
              >
                {mobileOpen && (
                  <button
                    type="button"
                    onClick={closeMobile}
                    aria-label="إغلاق القائمة"
                    style={{
                      position: 'absolute',
                      top: '20px',
                      left: '20px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--gold)',
                      fontSize: '1.8rem',
                      cursor: 'pointer',
                      padding: '4px',
                      lineHeight: 1,
                      zIndex: 100,
                    }}
                  >
                    ✕
                  </button>
                )}
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} onClick={closeMobile}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </FocusTrap>

          <div className="navbar-actions">
            <button
              type="button"
              className="nav-cart"
              onClick={() => setIsOpen(true)}
              aria-label={`سلة التسوق، ${totalItems} عناصر`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="badge-slot" aria-hidden={totalItems === 0}>
                {totalItems > 0 && (
                  <motion.span
                    className="badge"
                    key={totalItems}
                    initial={reduceMotion ? false : { scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={springDrawer}
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </motion.span>
                )}
              </span>
            </button>

            {!mobileOpen && (
              <button
                type="button"
                className="hamburger"
                onClick={() => setMobileOpen(true)}
                aria-expanded={false}
                aria-controls="mobile-nav"
                aria-label="فتح القائمة"
              >
                <span />
                <span />
                <span />
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
