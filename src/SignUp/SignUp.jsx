import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../LandingPage/LandingPage.css'
import './SignUp.css'
import { signup, signupShop } from '../utils/auth'
import { useTranslation, localizePath } from '../shared/lib/i18n'

function SignUp() {
  const navigate = useNavigate()
  const location = useLocation()
  const { language, t } = useTranslation()
  const isShopSignup = location.pathname.includes('/shop-signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [shopName, setShopName] = useState('')
  const [shopDescription, setShopDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword || !phoneNumber.trim() || (isShopSignup && !shopName.trim())) {
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
    try {
      const result = isShopSignup
        ? await signupShop({ email, password, fullName, phoneNumber, shopName, description: shopDescription })
        : await signup(email, password, fullName.trim(), phoneNumber.trim())

      if (!result.success) {
        setError(result.errorKey ? t(result.errorKey) : result.error)
        return
      }

      if (isShopSignup) {
        navigate(localizePath('/login', language))
        return
      }

      navigate(localizePath('/signup/verify', language), {
        state: { email, returnTo: location.state?.returnTo },
      })
    } finally {
      setLoading(false)
    }
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
              <span className="auth-label">{t('auth.fullName')}</span>
              <input
                type="text"
                placeholder={t('auth.fullNamePlaceholder')}
                className="auth-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </label>

            <label className="auth-field">
              <span className="auth-label">{t('auth.phoneNumber')}</span>
              <input
                type="tel"
                placeholder={t('auth.phoneNumberPlaceholder')}
                className="auth-input"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </label>

            {isShopSignup && (
              <>
                <label className="auth-field">
                  <span className="auth-label">{t('auth.shopName')}</span>
                  <input
                    type="text"
                    placeholder={t('auth.shopNamePlaceholder')}
                    className="auth-input"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                  />
                </label>

                <label className="auth-field">
                  <span className="auth-label">{t('auth.shopDescription')}</span>
                  <input
                    type="text"
                    placeholder={t('auth.shopDescriptionPlaceholder')}
                    className="auth-input"
                    value={shopDescription}
                    onChange={(e) => setShopDescription(e.target.value)}
                  />
                </label>
              </>
            )}

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

