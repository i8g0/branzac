import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('Application UI error:', error, info)
  }

  handleClearCacheAndReload = () => {
    try {
      localStorage.clear()
      sessionStorage.clear()
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name))
        })
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((r) => r.unregister())
        })
      }
    } catch (e) {
      console.warn('Cache clear error:', e)
    }
    window.location.href = window.location.origin + '?v=' + Date.now()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert" style={{ textAlign: 'center', padding: '3rem 1.5rem', fontFamily: 'sans-serif' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#1a2e1a' }}>حدث خطأ غير متوقع</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>قد تكون هناك ملفات قديمة مخزنة مؤقتاً في متصفحك.</p>
          <button
            type="button"
            onClick={this.handleClearCacheAndReload}
            style={{
              padding: '12px 28px',
              backgroundColor: '#d4a843',
              color: '#ffffff',
              border: 'none',
              borderRadius: '30px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(212, 168, 67, 0.3)',
            }}
          >
            تحديث وتفريغ الكاش
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

