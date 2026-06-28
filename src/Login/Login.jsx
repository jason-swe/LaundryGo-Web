import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../LandingPage/LandingPage.css'
import './Login.css'
import { useTranslation, localizePath } from '../shared/lib/i18n'
import { authApi } from '../utils/authApi'

const AUTH_KEY = 'laundrygo_auth'
const REMEMBER_KEY = 'laundrygo_remember_email'

function Login() {
  const navigate = useNavigate()
  const { language, t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Restore remembered email on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY)
      if (saved) {
        setEmail(saved)
        setRememberMe(true)
      }
    } catch {
      // ignore storage errors
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError(t('auth.fillAllFields'))
      return
    }
    setLoading(true)
    try {
      const { data, error: apiError } = await authApi.login({
        email: email.trim(),
        password,
      })

      if (apiError) {
        setError(apiError || 'Email hoặc mật khẩu không đúng.')
        setLoading(false)
        return
      }

      // Persist or clear remembered email
      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, email.trim())
      } else {
        localStorage.removeItem(REMEMBER_KEY)
      }

      // api.js already unwraps BaseResponse.data, so `data` is the LoginResponse:
      // { accessToken, refreshToken, account: { accountId, role, fullName, email, phone, status } }
      localStorage.setItem(AUTH_KEY, JSON.stringify(data))

      // Route based on the role returned by the backend
      const role = data?.account?.role
      if (role === 'SHOP_OWNER') {
        navigate(localizePath('/shop/overview', language))
      } else if (role === 'SHIPPER') {
        navigate(localizePath('/driver/overview', language))
      } else if (role === 'ADMIN') {
        navigate(localizePath('/admin/overview', language))
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
              <input
                type="checkbox"
                className="auth-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
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
