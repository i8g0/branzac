import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('BRANZAG UI error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <h2>حدث خطأ غير متوقع</h2>
          <p>يرجى تحديث الصفحة أو المحاولة لاحقاً.</p>
          <button type="button" onClick={() => window.location.reload()}>
            تحديث الصفحة
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
