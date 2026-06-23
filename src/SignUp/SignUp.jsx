import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../LandingPage/LandingPage.css'
import './SignUp.css'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import { signup, logout } from '../utils/auth'
import { authApi } from '../utils/authApi'
import { validatePassword } from '../utils/validation'
import { useTranslation, localizePath } from '../shared/lib/i18n'

function SignUp() {
  const navigate = useNavigate()
  const location = useLocation()
  const { language, t } = useTranslation()
  const isShopSignup = location.pathname.includes('/shop-signup')
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  const passwordRules = validatePassword(password)
  const isPasswordValid = passwordRules.isValid

  const isFormValid = !isShopSignup 
    ? email.trim() && fullName.trim() && phoneNumber.trim() && isPasswordValid && password === confirmPassword
    : email.trim() && isPasswordValid && password === confirmPassword

  const handleSubmit = async (e) => {
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
    if (!isPasswordValid) {
      setError('Please ensure your password meets all requirements.')
      return
    }
    if (!isShopSignup) {
      if (!fullName.trim() || !phoneNumber.trim()) {
        setError(t('auth.fillAllFields'))
        return
      }
    }

    setLoading(true)
    
    if (isShopSignup) {
      const result = signup(email, password)
      setLoading(false)
      if (!result.success) {
        setError(result.error)
        return
      }
      navigate(localizePath('/shop/overview', language))
      return
    }

    try {
      const { data, error: apiError } = await authApi.register({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
      })

      setLoading(false)

      if (apiError) {
        setError(apiError)
        return
      }
    } catch (err) {
      setLoading(false)
      setError('Registration failed. Please try again.')
      return
    }

    // After successful signup, ensure user is not treated as logged-in
    // (signup seeds the session for demo purposes), then navigate to verification page
    try {
      await logout()
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
            {!isShopSignup && (
              <>
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
                  <span className="auth-label">{t('auth.phone')}</span>
                  <input
                    type="tel"
                    placeholder={t('auth.phonePlaceholder')}
                    className="auth-input"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </label>
              </>
            )}

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
              <div className="password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t('auth.passwordPlaceholder')}
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {(passwordFocused || password.length > 0) && (
                <div className="password-checklist">
                  <div className={`password-rule ${passwordRules.minLength ? 'valid' : 'invalid'}`}>
                    {passwordRules.minLength ? <Check size={14} /> : <X size={14} />}
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`password-rule ${passwordRules.hasUppercase ? 'valid' : 'invalid'}`}>
                    {passwordRules.hasUppercase ? <Check size={14} /> : <X size={14} />}
                    <span>One uppercase letter</span>
                  </div>
                  <div className={`password-rule ${passwordRules.hasLowercase ? 'valid' : 'invalid'}`}>
                    {passwordRules.hasLowercase ? <Check size={14} /> : <X size={14} />}
                    <span>One lowercase letter</span>
                  </div>
                  <div className={`password-rule ${passwordRules.hasNumber ? 'valid' : 'invalid'}`}>
                    {passwordRules.hasNumber ? <Check size={14} /> : <X size={14} />}
                    <span>One number</span>
                  </div>
                  <div className={`password-rule ${passwordRules.hasSpecialChar ? 'valid' : 'invalid'}`}>
                    {passwordRules.hasSpecialChar ? <Check size={14} /> : <X size={14} />}
                    <span>One special character (!@#$...)</span>
                  </div>
                </div>
              )}
            </label>

            <label className="auth-field">
              <span className="auth-label">{t('auth.confirmPassword')}</span>
              <div className="password-wrap">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t('auth.passwordPlaceholder')}
                  className="auth-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <div className="auth-error" style={{ marginTop: '4px', padding: '6px 10px', fontSize: '12px' }}>
                  {t('auth.passwordMismatch')}
                </div>
              )}
            </label>

            {error && <p className="auth-error">{error}</p>}

            <div className="auth-actions">
              <button type="submit" className="auth-submit" disabled={loading || !isFormValid}>
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

