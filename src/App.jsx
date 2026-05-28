import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useCart } from './context/CartContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Menu from './components/Menu'
import About from './components/About'
import Services from './components/Services'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Cart from './components/Cart'
import Footer from './components/Footer'
import Admin from './pages/Admin'

function HomePage() {
  const { toast } = useCart()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('revealed')
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    const els = document.querySelectorAll('.reveal')
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest('a[href^="#"]')
      if (!target) return
      e.preventDefault()
      const el = document.getElementById(target.getAttribute('href').slice(1))
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return (
    <div className="app">
      <Navbar />
      <main>
        <Hero />
        <Menu />
        <About />
        <Services />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <Cart />
      {toast && (
        <div className="toast" key={toast.id}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2d6847" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
