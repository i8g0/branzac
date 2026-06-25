import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useSiteLogo } from '../hooks/useSiteLogo'

export default function AdminGuard({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('login') // 'login' | 'forgot' | 'change-password'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const logo = useSiteLogo()

  useEffect(() => {
    // Check if this is a password recovery attempt via URL hash
    const checkRecovery = () => {
      const hash = window.location.hash
      if (hash && hash.includes('type=recovery')) {
        setView('change-password')
        // Optional: clear the hash so it doesn't stay in the URL
        window.history.replaceState(null, document.title, window.location.pathname)
      }
    }

    checkRecovery()

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setLoading(false)
    })

    // Listen for auth changes (including password recovery)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, s) => {
        setSession(s)
        if (event === 'PASSWORD_RECOVERY') {
          setView('change-password')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setSubmitting(false)
    if (loginError) {
      if (loginError.message.includes('Invalid login')) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      } else {
        setError(loginError.message)
      }
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/admin` }
    )

    setSubmitting(false)
    if (resetError) {
      if (resetError.message.includes('rate limit')) {
        setError('تجاوزت الحد المسموح. يرجى المحاولة بعد قليل (الحد الاقصى للرسائل وصل).')
      } else {
        setError(resetError.message)
      }
    } else {
      setSuccess('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('كلمة المرور غير متطابقة')
      return
    }

    setSubmitting(true)
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    setSubmitting(false)
    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess('تم تغيير كلمة المرور بنجاح')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setView('login'), 2000)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  if (loading) {
    return (
      <div className="admin-guard">
        <div className="admin-guard__card">
          <div className="admin-spinner" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>جاري التحقق...</p>
        </div>
      </div>
    )
  }

  // Authorized - show admin with logout button context
  if (session && view !== 'change-password') {
    return (
      <AdminSessionContext.Provider value={{ session, handleLogout, setView }}>
        {children}
      </AdminSessionContext.Provider>
    )
  }

  return (
    <div className="admin-guard">
      {view === 'login' && (
        <form className="admin-guard__card" onSubmit={handleLogin}>
          <img src={logo} alt="" width={120} height={120} className="admin-guard__logo" />
          <h1>لوحة تحكم محاصيل الشاي</h1>
          <p>سجّل دخولك للمتابعة</p>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="البريد الإلكتروني"
            aria-label="البريد الإلكتروني"
            autoComplete="email"
            required
            style={{ letterSpacing: 'normal', textAlign: 'right', direction: 'ltr' }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            aria-label="كلمة المرور"
            autoComplete="current-password"
            required
            style={{ letterSpacing: 'normal' }}
          />

          {error && <p className="form-error" role="alert">{error}</p>}

          <button type="submit" className="admin-guard__submit" disabled={submitting}>
            {submitting ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>

          <button
            type="button"
            onClick={() => { setView('forgot'); setError(''); setSuccess('') }}
            className="admin-guard__link"
          >
            نسيت كلمة المرور؟
          </button>
        </form>
      )}

      {view === 'forgot' && (
        <form className="admin-guard__card" onSubmit={handleForgotPassword}>
          <img src={logo} alt="" width={120} height={120} className="admin-guard__logo" />
          <h1>استعادة كلمة المرور</h1>
          <p>أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="البريد الإلكتروني"
            aria-label="البريد الإلكتروني"
            autoComplete="email"
            required
            autoFocus
            style={{ letterSpacing: 'normal', textAlign: 'right', direction: 'ltr' }}
          />

          {error && <p className="form-error" role="alert">{error}</p>}
          {success && <p className="admin-guard__success" role="status">{success}</p>}

          <button type="submit" className="admin-guard__submit" disabled={submitting}>
            {submitting ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
          </button>

          <button
            type="button"
            onClick={() => { setView('login'); setError(''); setSuccess('') }}
            className="admin-guard__link"
          >
            العودة لتسجيل الدخول
          </button>
        </form>
      )}

      {view === 'change-password' && (
        <form className="admin-guard__card" onSubmit={handleChangePassword}>
          <img src={logo} alt="" width={120} height={120} className="admin-guard__logo" />
          <h1>تغيير كلمة المرور</h1>
          <p>اختر كلمة مرور جديدة</p>

          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="كلمة المرور الجديدة"
            aria-label="كلمة المرور الجديدة"
            autoComplete="new-password"
            required
            autoFocus
            style={{ letterSpacing: 'normal' }}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="تأكيد كلمة المرور"
            aria-label="تأكيد كلمة المرور"
            autoComplete="new-password"
            required
            style={{ letterSpacing: 'normal' }}
          />

          {error && <p className="form-error" role="alert">{error}</p>}
          {success && <p className="admin-guard__success" role="status">{success}</p>}

          <button type="submit" className="admin-guard__submit" disabled={submitting}>
            {submitting ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
          </button>
        </form>
      )}
    </div>
  )
}

// Context to share session/logout with Admin page
import { createContext, useContext } from 'react'
export const AdminSessionContext = createContext(null)
export const useAdminSession = () => useContext(AdminSessionContext)
