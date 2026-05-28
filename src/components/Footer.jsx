import { useState, useEffect } from 'react'
import { workingHours } from '../data/menuData'
import { supabase } from '../lib/supabase'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [logo, setLogo] = useState('/images/logo-bg.png')

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
      .channel('footer-logo-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items', filter: 'category=eq.__site_logo__' }, () => {
        fetchLogo()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <footer className="footer" id="footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60L48 54C96 48 192 36 288 42C384 48 480 72 576 78C672 84 768 72 864 60C960 48 1056 36 1152 36C1248 36 1344 48 1392 54L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V60Z" fill="#0d1f17"/>
        </svg>
      </div>
      <div className="footer-content">
        <div className="footer-grid">
          {/* Logo & About */}
          <div className="footer-col">
            <img src={logo} alt="BRANZAC Logo" className="footer-logo" />
            <p className="footer-about">
              نقدّم لكم أجود أنواع القهوة المختصة في أجواء فريدة تجمع بين الفخامة والراحة. 
              برانزاك... حيث كل رشفة تحكي قصة.
            </p>
            <div className="footer-social">
              <a href="https://www.instagram.com/branzac_/" target="_blank" rel="noopener noreferrer" aria-label="انستغرام">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@branzac_" target="_blank" rel="noopener noreferrer" aria-label="تيك توك">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .56.04.81.13v-3.5a6.37 6.37 0 0 0-.81-.05A6.34 6.34 0 0 0 3.15 15.4a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.27a8.16 8.16 0 0 0 4.76 1.51v-3.45a4.85 4.85 0 0 1-1-.64z"/>
                </svg>
              </a>
              <a href="https://wa.me/966533004327" target="_blank" rel="noopener noreferrer" aria-label="واتساب">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h3>روابط سريعة</h3>
            <ul className="footer-links">
              <li><a href="#home">الرئيسية</a></li>
              <li><a href="#menu">المنيو</a></li>
              <li><a href="#about">قصتنا</a></li>
              <li><a href="#services">خدماتنا</a></li>
              <li><a href="#contact">تواصل معنا</a></li>
            </ul>
          </div>

          {/* Working Hours */}
          <div className="footer-col">
            <h3>أوقات العمل</h3>
            <ul className="footer-hours">
              {workingHours.map((item, index) => (
                <li key={index}>
                  <span className="hour-day">{item.day}</span>
                  <span className="hour-time">{item.hours}</span>
                </li>
              ))}
            </ul>
            <div className="footer-contact-info">
              <p>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                الرياض، المملكة العربية السعودية
              </p>
              <p>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span dir="ltr">+966 53 300 4327</span>
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} BRANZAC | برانزاك - جميع الحقوق محفوظة</p>
          <p className="footer-credit">صُمّم بـ ☕ و ❤️</p>
        </div>
      </div>
    </footer>
  )
}
