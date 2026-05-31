import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../LandingPage/LandingPage.css'
import './SignUp.css'
import { signup, logout } from '../utils/auth'
import { useTranslation, localizePath } from '../shared/lib/i18n'

function SignUp() {
  const navigate = useNavigate()
  const location = useLocation()
  const { language, t } = useTranslation()
  const isShopSignup = location.pathname.includes('/shop-signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password || !confirmPassword) {
      setError(t('auth.fillAllFields'))
      return
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'))
      return
    }
    if (password.length < 6) {
      setError(t('auth.passwordTooShort'))
      return
    }
    setLoading(true)
    const result = signup(email, password)
    setLoading(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    if (isShopSignup) {
      navigate(localizePath('/shop/overview', language))
      return
    }

    // After successful signup, ensure user is not treated as logged-in
    // (signup seeds the session for demo purposes), then navigate to verification page
    try {
      logout()
    } catch {}
    navigate(localizePath('/signup/verify', language), { state: { email } })
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
          <h1 className="auth-title">{isShopSignup ? t('auth.shopSignupTitle') : t('nav.signup')}</h1>

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

            <label className="auth-field">
              <span className="auth-label">{t('auth.confirmPassword')}</span>
              <input
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                className="auth-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>

            {error && <p className="auth-error">{error}</p>}

            <div className="auth-actions">
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? t('common.loading') : isShopSignup ? t('auth.shopSignupTitle') : t('nav.signup')}
              </button>
            </div>
          </form>

          <div className="auth-footer-links">
            {isShopSignup ? (
              <button
                type="button"
                className="auth-link-button plain bold"
                onClick={() => navigate(localizePath('/signup', language))}
              >
                {t('auth.createOne')}
              </button>
            ) : (
              <button
                type="button"
                className="auth-link-button plain bold"
                onClick={() => navigate(localizePath('/shop-signup', language))}
              >
                {t('auth.becomeShop')}
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default SignUp

