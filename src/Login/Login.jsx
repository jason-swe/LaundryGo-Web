import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../LandingPage/LandingPage.css'
import './Login.css'
import { useTranslation, localizePath } from '../shared/lib/i18n'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const AUTH_KEY = 'laundrygo_auth'

function Login() {
  const navigate = useNavigate()
  const { language, t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError(t('auth.fillAllFields'))
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json?.message || 'Email hoặc mật khẩu không đúng.')
        setLoading(false)
        return
      }
      // BE wraps the payload under "data", not "result"
      // json = { success, message, data: { accessToken, refreshToken, account: { role, ... } } }
      const loginData = json?.data ?? json
      // Save full response (including accessToken) so api.js can pick up the JWT
      localStorage.setItem(AUTH_KEY, JSON.stringify(loginData))

      // Route based on the role returned by the backend
      const role = loginData?.account?.role
      if (role === 'SHOP_OWNER') {
        navigate(localizePath('/shop/overview', language))
      } else if (role === 'SHIPPER') {
        navigate(localizePath('/driver/overview', language))
      } else {
        // CUSTOMER or any other role → customer-facing area
        navigate(localizePath('/all-shops', language))
      }
    } catch {
      setError('Không thể kết nối máy chủ. Vui lòng thử lại.')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <button className="auth-back-button" onClick={() => navigate(localizePath('/', language))}>
        ← {t('auth.back')}
      </button>
      <div className="auth-card">
        <section className="auth-left">
          <header className="auth-header">
            <div className="logo">
              <span className="logo-text">
                Laundry<span>Go</span>
              </span>
              <span className="logo-bubbles">
                <span className="bubble bubble-lg" />
                <span className="bubble bubble-md" />
                <span className="bubble bubble-sm" />
              </span>
            </div>
          </header>

          <div className="auth-left-content">
            <div className="auth-image-wrapper">
              <img
                src="/login1.jpg"
                alt="Folded laundry"
                className="auth-main-image"
              />
            </div>

            <div className="auth-copy">
              <h2 className="auth-heading">
                {t('auth.heroHeadingLine1')}
                <br />
                <span>{t('auth.heroHeadingLine2')}</span>
              </h2>
              <p className="auth-text">{t('auth.heroText1')}</p>
              <p className="auth-text">{t('auth.heroText2')}</p>
              <p className="auth-text">{t('auth.heroText3')}</p>
              <p className="auth-text">{t('auth.heroText4')}</p>
            </div>
          </div>
        </section>

        <section className="auth-right">
          <h1 className="auth-title">{t('auth.loginTitle')}</h1>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span className="auth-label">{t('auth.email')}</span>
              <input
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="auth-field">
              <span className="auth-label">{t('auth.password')}</span>
              <input
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            {error && <p className="auth-error">{error}</p>}

            <label className="auth-remember">
              <input type="checkbox" className="auth-checkbox" />
              <span>{t('auth.rememberMe')}</span>
            </label>

            <div className="auth-row-bottom">
              <button type="submit" className="auth-link-button" disabled={loading}>
                {loading ? t('auth.loading') : `${t('auth.loginButton')} →`}
              </button>
            </div>
          </form>

          <div className="auth-footer-links">
            <button className="auth-link-button plain">{t('auth.forgotPassword')}</button>
            <p className="auth-small">
              {t('auth.dontHaveAccount')}{' '}
              <button
                type="button"
                className="auth-link-button plain bold"
                onClick={() => navigate(localizePath('/signup', language))}
              >
                {t('auth.createOne')}
              </button>
            </p>
            <button
              type="button"
              className="auth-link-button plain bold"
              onClick={() => navigate(localizePath('/shop-signup', language))}
            >
              {t('auth.becomeShop')}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Login
