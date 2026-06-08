import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../LandingPage/LandingPage.css'
import './SignUp.css'
import { registerCustomer, registerShop } from '../utils/auth'
import { useTranslation, localizePath } from '../shared/lib/i18n'

function SignUp() {
  const navigate = useNavigate()
  const location = useLocation()
  const { language, t } = useTranslation()
  const isShopSignup = location.pathname.includes('/shop-signup')
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    shopName: '',
    description: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const updateField = (field, value) => {
    setError('')
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const validate = () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.phoneNumber.trim() || !form.password || !form.confirmPassword) {
      return t('auth.fillAllRegisterFields')
    }
    if (isShopSignup && (!form.shopName.trim() || !form.description.trim())) {
      return t('auth.fillShopFields')
    }
    if (form.password !== form.confirmPassword) {
      return t('auth.passwordMismatch')
    }
    if (form.password.length < 6) {
      return t('auth.passwordTooShort')
    }
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextError = validate()
    if (nextError) {
      setError(nextError)
      return
    }

    setLoading(true)
    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password,
      phoneNumber: form.phoneNumber.trim(),
    }
    const result = isShopSignup
      ? await registerShop({
          ...payload,
          shopName: form.shopName.trim(),
          description: form.description.trim(),
        })
      : await registerCustomer(payload)
    setLoading(false)

    if (!result.success) {
      setError(result.error || t('auth.registerFailed'))
      return
    }

    navigate(localizePath('/signup/verify', language), {
      state: { email: form.email.trim(), nextPath: isShopSignup ? '/login' : '/login' },
    })
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
                alt={t('auth.laundryImageAlt')}
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
              <span className="auth-label">{t('auth.fullName')}</span>
              <input
                type="text"
                placeholder={t('auth.fullNamePlaceholder')}
                className="auth-input"
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
              />
            </label>

            <label className="auth-field">
              <span className="auth-label">{t('auth.email')}</span>
              <input
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                className="auth-input"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
              />
            </label>

            <label className="auth-field">
              <span className="auth-label">{t('auth.phoneNumber')}</span>
              <input
                type="tel"
                placeholder={t('auth.phoneNumberPlaceholder')}
                className="auth-input"
                value={form.phoneNumber}
                onChange={(e) => updateField('phoneNumber', e.target.value)}
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
                    value={form.shopName}
                    onChange={(e) => updateField('shopName', e.target.value)}
                  />
                </label>

                <label className="auth-field">
                  <span className="auth-label">{t('auth.description')}</span>
                  <textarea
                    className="auth-input auth-textarea"
                    placeholder={t('auth.descriptionPlaceholder')}
                    rows="3"
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
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
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
              />
            </label>

            <label className="auth-field">
              <span className="auth-label">{t('auth.confirmPassword')}</span>
              <input
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                className="auth-input"
                value={form.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
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
