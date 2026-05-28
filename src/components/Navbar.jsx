import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logo, setLogo] = useState('/images/logo-bg.png')
  const { totalItems, setIsOpen } = useCart()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const fetchLogo = async () => {
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .eq('category', '__site_logo__')
        .maybeSingle()
      if (data && data.image) {
        setLogo(data.image)
      }
    }
    fetchLogo()

    const channel = supabase
      .channel('navbar-logo-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items', filter: 'category=eq.__site_logo__' }, () => {
        fetchLogo()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const navLinks = [
    { label: 'الرئيسية', href: '#home' },
    { label: 'المنيو', href: '#menu' },
    { label: 'قصتنا', href: '#about' },
    { label: 'خدماتنا', href: '#services' },
    { label: 'تواصل', href: '#contact' }
  ]

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <a href="#home" className="navbar-logo">
          <img src={logo} alt="BRANZAC" />
        </a>

        <div className={`nav-links ${mobileOpen ? 'active' : ''}`}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="navbar-actions">
          <button
            className="nav-cart"
            onClick={() => setIsOpen(true)}
            aria-label="سلة التسوق"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {totalItems > 0 && <span className="badge">{totalItems}</span>}
          </button>

          <button
            className={`hamburger ${mobileOpen ? 'active' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="القائمة"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  )
}
