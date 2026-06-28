import { lazy, Suspense, useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { useAnchorScroll } from './hooks/useAnchorScroll'
import CartToast from './components/ui/CartToast'
import SplashScreen from './components/SplashScreen'

const Navbar = lazy(() => import('./components/Navbar'))
const Hero = lazy(() => import('./components/Hero'))
const Menu = lazy(() => import('./components/Menu'))
const About = lazy(() => import('./components/About'))
const Testimonials = lazy(() => import('./components/Testimonials'))
const Contact = lazy(() => import('./components/Contact'))
const Cart = lazy(() => import('./components/Cart'))
const Footer = lazy(() => import('./components/Footer'))
const Admin = lazy(() => import('./pages/Admin'))
const AdminGuard = lazy(() => import('./components/AdminGuard'))

function SectionFallback({ minHeight = '40vh' }) {
  return (
    <div
      className="section-fallback"
      style={{ minHeight }}
      aria-hidden="true"
    />
  )
}

function HomePage() {

  useAnchorScroll()

  return (
    <div className="app">
      <Suspense fallback={<SectionFallback minHeight="72px" />}>
        <Navbar />
      </Suspense>
      <main id="main-content">
        <Suspense fallback={<SectionFallback minHeight="100vh" />}>
          <Hero />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Menu />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <About />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Testimonials />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Contact />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <Suspense fallback={null}>
        <Cart />
      </Suspense>
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
