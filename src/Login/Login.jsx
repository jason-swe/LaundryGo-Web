import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation, localizePath } from '../shared/lib/i18n'
import '../LandingPage/LandingPage.css'
import './Login.css'
import { login } from '../utils/auth'

function Login() {
  const navigate = useNavigate()
  const { language, t } = useTranslation()
  const navigateLocalized = (path) => navigate(localizePath(path, language))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError(t('auth.emailRequired'))
      return
    }
    setLoading(true)
    const result = login(email, password)
    setLoading(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    navigateLocalized('/all-shops')
  }

  return (
    <div className="auth-page">
      <button className="auth-back-button" onClick={() => navigateLocalized('/')}>
        ← {t('common.back')}
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
          <h1 className="auth-title">{t('auth.login')}</h1>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span className="auth-label">{t('auth.email')}</span>
              <input
                type="email"
                placeholder={t('auth.email')}
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="auth-field">
              <span className="auth-label">{t('auth.password')}</span>
              <input
                type="password"
                placeholder={t('auth.password')}
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
                {loading ? t('common.loading') : `${t('auth.login')} →`}
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
                onClick={() => navigateLocalized('/signup')}
              >
                {t('auth.signup')}
              </button>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Login

