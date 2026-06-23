import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../LandingPage/LandingPage.css'
import './VerifyPin.css'
import { localizePath, getLanguageFromPath } from '../shared/lib/i18n'
import { authApi } from '../utils/authApi'

function VerifyPin() {
  const navigate = useNavigate()
  const location = useLocation()
  const language = getLanguageFromPath(location.pathname)

  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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
    if (!sentEmail) {
      setError('Email address is missing. Please sign up again.')
      return
    }
    if (!/^[0-9]{6}$/.test(pin)) {
      setError('Please enter a valid 6-digit code')
      return
    }

    setLoading(true)
    try {
      const { error: apiError } = await authApi.verifyEmail({ email: sentEmail, otp: pin })
      setLoading(false)
      
      if (apiError) {
        setError(apiError)
        return
      }
      
      // Navigate to login upon successful verification
      navigate(localizePath('/login', language))
    } catch (err) {
      setLoading(false)
      setError('Verification failed. Please try again.')
    }
  }

  const onResend = async () => {
    if (!sentEmail) {
      setError('Email address is missing.')
      return
    }
    
    setError('')
    try {
      const { error: apiError } = await authApi.resendOtp({ email: sentEmail })
      if (apiError) {
        setError(apiError)
        return
      }
      setResendTimer(30)
    } catch (err) {
      setError('Failed to resend OTP. Please try again later.')
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
              <h2 className="auth-heading">Verify your email</h2>
              <p className="auth-text">Enter the code we sent to your email to complete registration.</p>
            </div>
          </div>
        </section>

        <section className="auth-right">
          <h1 className="auth-title">Enter verification code</h1>

          <form className="auth-form" onSubmit={onSubmit}>
            <label className="auth-field">
              <span className="auth-label">Verification code</span>
              <input
                className="auth-input"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                inputMode="numeric"
                placeholder="Enter code"
              />
            </label>

            {sentEmail && <p className="auth-small">Code was sent to: <strong>{sentEmail}</strong></p>}

            {error && <p className="auth-error">{error}</p>}

            <div className="auth-row-bottom auth-row-verify">
              <div className="auth-actions-buttons">
                <button type="submit" className="btn btn-primary" disabled={loading || pin.length !== 6}>
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => navigate(localizePath('/', language))} disabled={loading}>Cancel</button>
              </div>
            </div>
          </form>

          <div className="auth-footer-links">
            {resendTimer > 0 ? (
              <p className="auth-small">Resend code in {resendTimer}s</p>
            ) : (
              <button className="auth-link-button plain" onClick={onResend}>Resend code</button>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default VerifyPin
