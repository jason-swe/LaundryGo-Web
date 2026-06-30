import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../LandingPage/LandingPage.css'
import './VerifyPin.css'
import { localizePath, getLanguageFromPath, useTranslation } from '../shared/lib/i18n'
import { resendOtp, verifyEmail } from '../utils/auth'

function VerifyPin() {
  const navigate = useNavigate()
  const location = useLocation()
  const language = getLanguageFromPath(location.pathname)
  const { t } = useTranslation()

  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
  const sentEmail = location.state && location.state.email ? location.state.email : null

  useEffect(() => {
    if (resendTimer <= 0) return
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [resendTimer])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!sentEmail) {
      setError(t('auth.verifyMissingEmail'))
      return
    }
    if (!/^[0-9]{6}$/.test(pin)) {
      setError(t('auth.verifyInvalidCode'))
      return
    }

    setIsVerifying(true)
    try {
      const result = await verifyEmail(sentEmail, pin)
      if (!result.success) {
        setError(result.errorKey ? t(result.errorKey) : result.error)
        return
      }
      navigate(localizePath('/login', language), { state: { verifiedEmail: sentEmail } })
    } finally {
      setIsVerifying(false)
    }
  }

  const onResend = async () => {
    setError('')
    setMessage('')
    if (!sentEmail) {
      setError(t('auth.verifyMissingEmail'))
      return
    }
    setIsResending(true)
    try {
      const result = await resendOtp(sentEmail)
      if (!result.success) {
        setError(result.errorKey ? t(result.errorKey) : result.error)
        return
      }
      setMessage(result.message || t('auth.resendSuccess'))
      setResendTimer(30)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="auth-page">
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
              <img src="/login1.jpg" alt="Folded laundry" className="auth-main-image" />
            </div>

            <div className="auth-copy">
              <h2 className="auth-heading">{t('auth.verifyTitle')}</h2>
              <p className="auth-text">{t('auth.verifySubtitle')}</p>
            </div>
          </div>
        </section>

        <section className="auth-right">
          <h1 className="auth-title">{t('auth.verifyHeading')}</h1>

          <form className="auth-form" onSubmit={onSubmit}>
            <label className="auth-field">
              <span className="auth-label">{t('auth.verificationCode')}</span>
              <input
                className="auth-input"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                inputMode="numeric"
                placeholder={t('auth.verificationCodePlaceholder')}
              />
            </label>

            {sentEmail && <p className="auth-small">{t('auth.codeSentTo')} <strong>{sentEmail}</strong></p>}

            {error && <p className="auth-error">{error}</p>}
            {message && <p className="auth-small">{message}</p>}

            <div className="auth-row-bottom auth-row-verify">
              <div className="auth-actions-buttons">
                <button type="submit" className="btn btn-primary" disabled={isVerifying}>
                  {isVerifying ? t('common.loading') : t('auth.verifyButton')}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => navigate(localizePath('/', language))}>{t('common.cancel')}</button>
              </div>
            </div>
          </form>

          <div className="auth-footer-links">
            {resendTimer > 0 ? (
              <p className="auth-small">{t('auth.resendIn')} {resendTimer}s</p>
            ) : (
              <button className="auth-link-button plain" onClick={onResend} disabled={isResending}>
                {isResending ? t('common.loading') : t('auth.resendCode')}
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default VerifyPin
