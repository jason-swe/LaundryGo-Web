import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation, localizePath } from '../shared/lib/i18n'
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
  const { language, t } = useTranslation()
  const navigateLocalized = (path) => navigate(localizePath(path, language))
  const [user, setUser] = useState(defaultUser)
  const [isEditing, setIsEditing] = useState(false)
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

  const startEditing = () => {
    resetForm()
    setIsEditing(true)
  }

  const cancelEditing = () => {
    resetForm()
    setIsEditing(false)
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

    setIsEditing(false)
  }

  return (
    <div className="user-info-page">
      <header className="user-info-topbar">
        <div className="user-info-topbar-inner">
          <div className="logo" onClick={() => navigateLocalized('/')} style={{ cursor: 'pointer' }}>
            <span className="logo-text">
              Laundry<span>Go</span>
            </span>
            <span className="logo-bubbles">
              <span className="bubble bubble-lg" />
              <span className="bubble bubble-md" />
              <span className="bubble bubble-sm" />
            </span>
          </div>

          <button className="back-allshops-btn" onClick={() => navigateLocalized('/all-shops')}>
            {t('common.back')} {t('nav.allShops')}
          </button>
        </div>
      </header>

      <main className="user-info-main">
        <section className="user-info-card">
          <h1>{t('profile.userInformation')}</h1>
          <p>{t('profile.userId')}: {user.id}</p>

          {!isEditing ? (
            <div className="user-info-view">
              <div className="user-info-row">
                <div className="user-info-label">{t('profile.name')}</div>
                <div className="user-info-value">{user.fullName}</div>
              </div>
              <div className="user-info-row">
                <div className="user-info-label">{t('profile.email')}</div>
                <div className="user-info-value">{user.email}</div>
              </div>
              <div className="user-info-row">
                <div className="user-info-label">{t('profile.phone')}</div>
                <div className="user-info-value">{user.phone}</div>
              </div>
              <div className="user-info-row">
                <div className="user-info-label">{t('profile.address')}</div>
                <div className="user-info-value">{user.address}</div>
              </div>

              <div className="user-form-actions">
                <button type="button" onClick={startEditing}>
                  {t('common.edit')}
                </button>
              </div>
            </div>
          ) : (
            <form className="user-form" onSubmit={onSubmit}>
              <label>
                {t('profile.name')}
                <input
                  value={form.fullName}
                  onChange={(event) => onChange('fullName', event.target.value)}
                  placeholder={t('profile.enterFullName')}
                />
              </label>

              <label>
                {t('profile.email')}
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => onChange('email', event.target.value)}
                  placeholder={t('profile.enterEmail')}
                />
              </label>

              <label>
                {t('profile.phone')}
                <input
                  value={form.phone}
                  onChange={(event) => onChange('phone', event.target.value)}
                  placeholder={t('profile.enterPhone')}
                />
              </label>

              <label>
                {t('profile.address')}
                <input
                  value={form.address}
                  onChange={(event) => onChange('address', event.target.value)}
                  placeholder={t('profile.enterAddress')}
                />
              </label>

              <div className="user-form-actions">
                <button type="submit">{t('common.save')}</button>
                <button type="button" onClick={cancelEditing} className="ghost-btn">
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  )
}

export default UserInformation
