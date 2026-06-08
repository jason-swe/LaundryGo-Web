import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../LandingPage/LandingPage.css'
import './VerifyPin.css'
import { localizePath, useTranslation } from '../shared/lib/i18n'
import { getDefaultPathForRole, getPendingVerificationEmail, getRole, resendOtp, verifyEmail } from '../utils/auth'

function VerifyPin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { language, t } = useTranslation()

  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
  const sentEmail = location.state?.email || getPendingVerificationEmail()

  useEffect(() => {
    if (resendTimer <= 0) return
    const id = setTimeout(() => setResendTimer((timer) => timer - 1), 1000)
    return () => clearTimeout(id)
  }, [resendTimer])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!sentEmail) {
      setError(t('auth.verifyMissingEmail'))
      return
    }

    if (!/^[0-9]{4,6}$/.test(pin)) {
      setError(t('auth.verifyInvalidCode'))
      return
    }

    setLoading(true)
    const result = await verifyEmail(sentEmail, pin)
    setLoading(false)

    if (!result.success) {
      setError(result.error || t('auth.verifyFailed'))
      return
    }

    const role = getRole()
    navigate(localizePath(role ? getDefaultPathForRole(role) : '/login', language), { replace: true })
  }

  const onResend = async () => {
    if (!sentEmail) {
      setError(t('auth.verifyMissingEmail'))
      return
    }

    setError('')
    setResending(true)
    const result = await resendOtp(sentEmail)
    setResending(false)

    if (!result.success) {
      setError(result.error || t('auth.resendFailed'))
      return
    }

    setResendTimer(30)
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
              <img src="/login1.jpg" alt={t('auth.laundryImageAlt')} className="auth-main-image" />
            </div>

            <div className="auth-copy">
              <h2 className="auth-heading">{t('auth.verifyHeroTitle')}</h2>
              <p className="auth-text">{t('auth.verifyHeroText')}</p>
            </div>
          </div>
        </section>

        <section className="auth-right">
          <h1 className="auth-title">{t('auth.verifyTitle')}</h1>

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

            {sentEmail && (
              <p className="auth-small">
                {t('auth.codeSentTo')} <strong>{sentEmail}</strong>
              </p>
            )}

            {error && <p className="auth-error">{error}</p>}

            <div className="auth-row-bottom auth-row-verify">
              <div className="auth-actions-buttons">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? t('common.loading') : t('auth.verifyButton')}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => navigate(localizePath('/login', language))}>
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </form>

          <div className="auth-footer-links">
            {resendTimer > 0 ? (
              <p className="auth-small">{t('auth.resendCountdown').replace('{seconds}', resendTimer)}</p>
            ) : (
              <button className="auth-link-button plain" onClick={onResend} disabled={resending}>
                {resending ? t('common.loading') : t('auth.resendCode')}
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default VerifyPin
