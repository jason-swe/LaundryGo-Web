import { createElement, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarClock,
  CheckCircle,
  Home,
  LogOut,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Save,
  Shirt,
  User,
} from 'lucide-react'
import UserNavbar from '../components/UserNavbar'
import './UserInformation.css'
import { localizePath, useTranslation } from '../shared/lib/i18n'
import { getAccount, getLoggedInUser, logout, subscribeAuthChanged } from '../utils/auth'

const STORAGE_KEY = 'exe101-user-information'

const defaultUser = {
  id: 'USR-001',
  fullName: 'EXE101 User',
  email: 'user@exe101.local',
  phone: '0900000000',
  address: 'Thu Duc, Ho Chi Minh City',
}

const mapAccountToUser = (account) => ({
  id: account?.accountId || account?.id || defaultUser.id,
  fullName: account?.fullName || account?.name || defaultUser.fullName,
  email: account?.email || defaultUser.email,
  phone: account?.phone || account?.phoneNumber || defaultUser.phone,
  address: defaultUser.address,
  role: account?.role || 'CUSTOMER',
  status: account?.status || 'ACTIVE',
})

const getInitialUser = () => {
  const account = getAccount(getLoggedInUser())
  if (account) return mapAccountToUser(account)

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUser))
  return defaultUser
}

function UserInformation() {
  const navigate = useNavigate()
  const { language, t } = useTranslation()
  const [user, setUser] = useState(getInitialUser)
  const [form, setForm] = useState(() => getInitialUser())
  const [errors, setErrors] = useState({})
  const [saveState, setSaveState] = useState('idle')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  }, [user])

  useEffect(() => subscribeAuthChanged((session) => {
    const account = getAccount(session)
    if (!account) return
    const nextUser = mapAccountToUser(account)
    setUser(nextUser)
    setForm(nextUser)
    setSaveState('idle')
  }), [])

  const isDirty = useMemo(
    () =>
      ['fullName', 'email', 'phone', 'address'].some(
        (field) => (form[field] || '') !== (user[field] || '')
      ),
    [form, user]
  )

  const validate = (nextForm) => {
    const nextErrors = {}
    if (!nextForm.fullName.trim()) nextErrors.fullName = t('information.fullNameRequired')
    if (!nextForm.email.trim()) {
      nextErrors.email = t('information.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextForm.email.trim())) {
      nextErrors.email = t('information.emailInvalid')
    }
    if (!nextForm.phone.trim()) nextErrors.phone = t('information.phoneRequired')
    if (!nextForm.address.trim()) nextErrors.address = t('information.addressRequired')
    return nextErrors
  }

  const resetForm = () => {
    setForm(user)
    setErrors({})
    setSaveState('idle')
  }

  const onChange = (field, value) => {
    setSaveState('idle')
    setErrors((prev) => ({ ...prev, [field]: '' }))
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const onSubmit = (event) => {
    event.preventDefault()

    const payload = {
      ...user,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
    }

    const nextErrors = validate(payload)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setSaveState('error')
      return
    }

    setUser(payload)
    setForm(payload)
    setSaveState('saved')
  }

  const handleLogout = async () => {
    await logout()
    navigate(localizePath('/login', language))
  }

  const statCards = [
    { label: t('information.activeOrders'), value: user.status || 'ACTIVE', Icon: CalendarClock },
    { label: t('information.savedAddress'), value: user.role || 'CUSTOMER', Icon: MapPin },
    { label: t('information.totalCleaned'), value: '18 kg', Icon: Shirt },
  ]

  return (
    <div className="user-info-page">
      <UserNavbar />

      <main className="user-info-main">
        <section className="user-info-hero">
          <div>
            <span className="user-info-eyebrow">{t('information.eyebrow')}</span>
            <h1>{t('information.title')}</h1>
            <p>{t('information.subtitle')}</p>
          </div>
          <button className="user-info-logout" type="button" onClick={handleLogout}>
            <LogOut size={16} strokeWidth={1.9} />
            {t('information.logout')}
          </button>
        </section>

        <section className="user-info-stats">
          {statCards.map(({ label, value, Icon }) => (
            <div className="user-info-stat" key={label}>
              <div className="user-info-stat-icon">
                {createElement(Icon, { size: 18, strokeWidth: 1.8 })}
              </div>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </section>

        <section className="user-info-layout">
          <div className="user-info-left">
            <section className="user-info-card profile-card">
              <div className="user-info-card-head">
                <div>
                  <span className="user-info-section-kicker">{user.id}</span>
                  <h2>{t('information.personalInfo')}</h2>
                </div>
                <span className={`save-pill ${saveState}`}>
                  {saveState === 'saved' ? t('information.saved') : saveState === 'error' ? t('information.needsFix') : isDirty ? t('information.unsaved') : t('information.upToDate')}
                </span>
              </div>

              <form className="user-form" onSubmit={onSubmit}>
                <label>
                  <span>{t('information.fullName')}</span>
                  <div className="user-input-wrap">
                    <User size={16} strokeWidth={1.8} />
                    <input
                      value={form.fullName}
                      onChange={(event) => onChange('fullName', event.target.value)}
                      placeholder={t('information.fullNamePlaceholder')}
                    />
                  </div>
                  {errors.fullName && <small>{errors.fullName}</small>}
                </label>

                <label>
                  <span>{t('information.email')}</span>
                  <div className="user-input-wrap">
                    <Mail size={16} strokeWidth={1.8} />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => onChange('email', event.target.value)}
                      placeholder={t('information.emailPlaceholder')}
                    />
                  </div>
                  {errors.email && <small>{errors.email}</small>}
                </label>

                <label>
                  <span>{t('information.phone')}</span>
                  <div className="user-input-wrap">
                    <Phone size={16} strokeWidth={1.8} />
                    <input
                      value={form.phone}
                      onChange={(event) => onChange('phone', event.target.value)}
                      placeholder={t('information.phonePlaceholder')}
                    />
                  </div>
                  {errors.phone && <small>{errors.phone}</small>}
                </label>

                <label>
                  <span>{t('information.defaultAddress')}</span>
                  <div className="user-input-wrap">
                    <MapPin size={16} strokeWidth={1.8} />
                    <input
                      value={form.address}
                      onChange={(event) => onChange('address', event.target.value)}
                      placeholder={t('information.addressPlaceholder')}
                    />
                  </div>
                  {errors.address && <small>{errors.address}</small>}
                </label>

                <div className="user-form-actions">
                  <button type="submit" disabled={!isDirty}>
                    <Save size={16} strokeWidth={1.8} />
                    {t('information.saveChanges')}
                  </button>
                  <button type="button" onClick={resetForm} className="ghost-btn" disabled={!isDirty}>
                    <RotateCcw size={16} strokeWidth={1.8} />
                    {t('information.reset')}
                  </button>
                </div>
              </form>
            </section>
          </div>

          <aside className="user-info-right">
            <section className="user-info-card address-card">
              <div className="user-info-card-head">
                <div>
                  <span className="user-info-section-kicker">{t('information.primary')}</span>
                  <h2>{t('information.defaultAddress')}</h2>
                </div>
                <Home size={18} strokeWidth={1.8} />
              </div>
              <p className="address-card-title">{user.address}</p>
              <p className="address-card-note">{t('information.addressNote')}</p>
            </section>

            <section className="user-info-card recent-order-card">
              <div className="user-info-card-head">
                <div>
                  <span className="user-info-section-kicker">{t('information.recent')}</span>
                  <h2>{t('information.recentOrder')}</h2>
                </div>
                <CheckCircle size={18} strokeWidth={1.8} />
              </div>
              <p className="recent-order-id">#LG-00120</p>
              <p className="recent-order-copy">{t('information.recentOrderCopy')}</p>
              <button
                type="button"
                className="user-info-secondary"
                onClick={() => navigate(localizePath('/all-shops/AS-001/track', language))}
              >
                {t('information.trackRecent')}
              </button>
            </section>

            <section className="user-info-card shortcut-card">
              <h2>{t('information.quickActions')}</h2>
              <button type="button" onClick={() => navigate(localizePath('/all-shops', language))}>
                {t('landing.heroPrimaryCta')}
              </button>
            </section>
          </aside>
        </section>
      </main>
    </div>
  )
}

export default UserInformation
