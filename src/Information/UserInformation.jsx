import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../LandingPage/LandingPage.css'
import './UserInformation.css'

const STORAGE_KEY = 'exe101-user-information'

const defaultUser = {
  id: 'USR-001',
  fullName: 'EXE101 User',
  email: 'user@exe101.local',
  phone: '0900000000',
  address: 'Thu Duc, Ho Chi Minh City',
}

function UserInformation() {
  const navigate = useNavigate()
  const [user, setUser] = useState(defaultUser)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  })

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      setUser(parsed)
      setForm({
        fullName: parsed.fullName || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        address: parsed.address || '',
      })
      return
    }
    setUser(defaultUser)
    setForm({
      fullName: defaultUser.fullName,
      email: defaultUser.email,
      phone: defaultUser.phone,
      address: defaultUser.address,
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUser))
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  }, [user])

  const resetForm = () => {
    setForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      address: user.address,
    })
  }

  const onChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const onSubmit = (event) => {
    event.preventDefault()

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
    }

    if (!payload.fullName || !payload.email || !payload.phone || !payload.address) {
      return
    }

    setUser((prev) => {
      const updated = {
        ...prev,
        ...payload,
      }
      return updated
    })
  }

  return (
    <div className="user-info-page">
      <header className="user-info-topbar">
        <div className="user-info-topbar-inner">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span className="logo-text">
              Laundry<span>Go</span>
            </span>
            <span className="logo-bubbles">
              <span className="bubble bubble-lg" />
              <span className="bubble bubble-md" />
              <span className="bubble bubble-sm" />
            </span>
          </div>

          <button className="back-allshops-btn" onClick={() => navigate('/all-shops')}>
            Back to All Shops
          </button>
        </div>
      </header>

      <main className="user-info-main">
        <section className="user-info-card">
          <h1>User Information</h1>
          <p>User ID: {user.id}</p>

          <form className="user-form" onSubmit={onSubmit}>
            <label>
              Full Name
              <input
                value={form.fullName}
                onChange={(event) => onChange('fullName', event.target.value)}
                placeholder="Enter full name"
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => onChange('email', event.target.value)}
                placeholder="Enter email"
              />
            </label>

            <label>
              Phone
              <input
                value={form.phone}
                onChange={(event) => onChange('phone', event.target.value)}
                placeholder="Enter phone"
              />
            </label>

            <label>
              Address
              <input
                value={form.address}
                onChange={(event) => onChange('address', event.target.value)}
                placeholder="Enter address"
              />
            </label>

            <div className="user-form-actions">
              <button type="submit">Update Information</button>
              <button type="button" onClick={resetForm} className="ghost-btn">
                Reset
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}

export default UserInformation
