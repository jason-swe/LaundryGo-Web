import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../LandingPage/LandingPage.css'
import './Login.css'
import { login } from '../utils/auth'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Vui lòng nhập email và mật khẩu.')
      return
    }
    setLoading(true)
    const result = login(email, password)
    setLoading(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    navigate('/all-shops')
  }

  return (
    <div className="auth-page">
      <button className="auth-back-button" onClick={() => navigate('/')}>
        ← Back
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
                Your Laundry,
                <br />
                <span>Our Priority.</span>
              </h2>
              <p className="auth-text">Professional care delivered to</p>
              <p className="auth-text">your doorstep.</p>
              <p className="auth-text">
                Stop doing laundry and start living. We&apos;ll handle the rest.
              </p>
              <p className="auth-text">Fresh clothes, fresh start.</p>
            </div>
          </div>
        </section>

        <section className="auth-right">
          <h1 className="auth-title">Login</h1>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span className="auth-label">Email</span>
              <input
                type="email"
                placeholder="Enter your Email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="auth-field">
              <span className="auth-label">Password</span>
              <input
                type="password"
                placeholder="Enter your Password"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            {error && <p className="auth-error">{error}</p>}

            <label className="auth-remember">
              <input type="checkbox" className="auth-checkbox" />
              <span>Remember me</span>
            </label>

            <div className="auth-row-bottom">
              <button type="submit" className="auth-link-button" disabled={loading}>
                {loading ? 'Đang đăng nhập...' : 'Login →'}
              </button>
            </div>
          </form>

          <div className="auth-footer-links">
            <button className="auth-link-button plain">Forgot password?</button>
            <p className="auth-small">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                className="auth-link-button plain bold"
                onClick={() => navigate('/signup')}
              >
                Create one
              </button>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Login

