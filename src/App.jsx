import { lazy, Suspense, useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { useAnchorScroll } from './hooks/useAnchorScroll'
import CartToast from './components/ui/CartToast'
import SplashScreen from './components/SplashScreen'

import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Menu from './components/Menu'
import About from './components/About'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Cart from './components/Cart'
import Footer from './components/Footer'

const Admin = lazy(() => import('./pages/Admin'))
const AdminGuard = lazy(() => import('./components/AdminGuard'))

function HomePage() {
  useAnchorScroll()

  return (
    <div className="app">
      <Navbar />
      <main id="main-content">
        <Hero />
        <Menu />
        <About />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <Cart />
      <CartToast />
    </div>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const handleSplashDone = useCallback(() => setShowSplash(false), [])

  return (
    <BrowserRouter>
      {showSplash && <SplashScreen onComplete={handleSplashDone} />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/admin"
          element={
            <Suspense fallback={<div className="admin-loading">جاري التحميل...</div>}>
              <AdminGuard>
                <Admin />
              </AdminGuard>
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
