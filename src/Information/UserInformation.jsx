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
import { getLoggedInUser, logout } from '../utils/auth'
import { authenticatedApiRequest } from '../utils/api'

const STORAGE_KEY = 'exe101-user-information'

const defaultUser = {
  id: 'USR-001',
  fullName: 'EXE101 User',
  email: 'user@exe101.local',
  phone: '0900000000',
  address: 'Thu Duc, Ho Chi Minh City',
  city: 'Ho Chi Minh City',
  district: 'Thu Duc',
}

const defaultSummary = {
  activeOrderCount: 0,
  savedAddressCount: 0,
  totalCleanedKg: 0,
  recentOrder: null,
}

const normalizeProfile = (profile, fallback = defaultUser) => ({
  id: profile?.accountId || fallback.id || defaultUser.id,
  accountId: profile?.accountId || fallback.accountId || '',
  fullName: profile?.fullName || fallback.fullName || '',
  email: profile?.email || fallback.email || '',
  phone: profile?.phone || fallback.phone || '',
  address: profile?.address || fallback.address || '',
  city: profile?.city || fallback.city || '',
  district: profile?.district || fallback.district || '',
  role: profile?.role || fallback.role || '',
  status: profile?.status || fallback.status || '',
})

const getInitialUser = () => {
  const session = getLoggedInUser()
  if (session) {
    return normalizeProfile({
      accountId: session.accountId || session.id,
      fullName: session.fullName || session.name,
      email: session.email,
      phone: session.phone,
      city: session.city || '',
      district: session.district || '',
      role: session.role,
      status: session.status,
    })
  }

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
  const [profileError, setProfileError] = useState('')
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [summary, setSummary] = useState(defaultSummary)

  useEffect(() => {
    let ignore = false

    const loadProfile = async () => {
      setIsProfileLoading(true)
      setProfileError('')

      try {
        const [profilePayload, summaryPayload] = await Promise.all([
          authenticatedApiRequest('/api/v1/users/profile'),
          authenticatedApiRequest('/api/v1/users/profile/summary'),
        ])
        if (ignore) return

        const nextUser = normalizeProfile(profilePayload?.data, user)
        setUser(nextUser)
        setForm(nextUser)
        setSummary({ ...defaultSummary, ...(summaryPayload?.data || {}) })
        setSaveState('idle')
      } catch (err) {
        if (!ignore) {
          // If API fails (backend down or unauthorized), fall back to the locally stored session
          const session = getLoggedInUser()
          if (session) {
            const sessionProfile = normalizeProfile({
              accountId: session.accountId || session.id,
              fullName: session.fullName || session.name,
              email: session.email,
              phone: session.phone,
              city: session.city || '',
              district: session.district || '',
            }, user)
            setUser(sessionProfile)
            setForm(sessionProfile)
          } else {
            setProfileError(t('information.loadFailed'))
          }
        }
      } finally {
        if (!ignore) setIsProfileLoading(false)
      }
    }

    loadProfile()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  }, [user])

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

  const syncAuthSession = (profile) => {
    const currentSession = getLoggedInUser()
    if (!currentSession) return

    const nextSession = {
      ...currentSession,
      id: profile.accountId || currentSession.id,
      accountId: profile.accountId || currentSession.accountId,
      email: profile.email,
      name: profile.fullName,
      fullName: profile.fullName,
      phone: profile.phone,
      city: profile.city || currentSession.city || '',
      district: profile.district || currentSession.district || '',
      role: profile.role || currentSession.role,
      status: profile.status || currentSession.status,
      accessToken: profile.accessToken || currentSession.accessToken,
      refreshToken: profile.refreshToken || currentSession.refreshToken,
    }

    localStorage.setItem('laundrygo_auth', JSON.stringify(nextSession))
  }

  const onSubmit = async (event) => {
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

    try {
      setSaveState('saving')
      const response = await authenticatedApiRequest('/api/v1/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
          fullName: payload.fullName,
          email: payload.email,
          phone: payload.phone,
          address: payload.address,
          city: payload.city || user.city || '',
          district: payload.district || user.district || '',
        }),
      })

      const nextUser = normalizeProfile(response?.data, payload)
      syncAuthSession(response?.data || nextUser)
      setUser(nextUser)
      setForm(nextUser)
      setProfileError('')
      setSaveState('saved')
    } catch {
      setProfileError(t('information.updateFailed'))
      setSaveState('error')
    }
  }

  const handleLogout = () => {
    try {
      logout()
    } catch {
      // Prototype auth can be absent during testing.
    }
    navigate(localizePath('/login', language))
  }

  const formatCleanedKg = (value) => {
    const numericValue = Number(value || 0)
    return `${numericValue % 1 === 0 ? numericValue.toFixed(0) : numericValue.toFixed(1)} kg`
  }

  const statCards = [
    { label: t('information.activeOrders'), value: String(summary.activeOrderCount || 0), Icon: CalendarClock },
    { label: t('information.savedAddress'), value: String(summary.savedAddressCount || 0), Icon: MapPin },
    { label: t('information.totalCleaned'), value: formatCleanedKg(summary.totalCleanedKg), Icon: Shirt },
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

        {profileError && <p className="user-info-alert">{profileError}</p>}

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
                  {isProfileLoading ? t('common.loading') : saveState === 'saving' ? t('information.saving') : saveState === 'saved' ? t('information.saved') : saveState === 'error' ? t('information.needsFix') : isDirty ? t('information.unsaved') : t('information.upToDate')}
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

                <label>
                  <span>City</span>
                  <div className="user-input-wrap">
                    <MapPin size={16} strokeWidth={1.8} />
                    <input
                      value={form.city || ''}
                      onChange={(event) => onChange('city', event.target.value)}
                      placeholder="City"
                    />
                  </div>
                </label>

                <label>
                  <span>District</span>
                  <div className="user-input-wrap">
                    <Home size={16} strokeWidth={1.8} />
                    <input
                      value={form.district || ''}
                      onChange={(event) => onChange('district', event.target.value)}
                      placeholder="District"
                    />
                  </div>
                </label>

                <div className="user-form-actions">
                  <button type="submit" disabled={!isDirty || saveState === 'saving'}>
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
              <p className="address-card-title">{[user.address, user.district, user.city].filter(Boolean).join(', ')}</p>
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
              {summary.recentOrder ? (
                <>
                  <p className="recent-order-id">#{summary.recentOrder.orderCode}</p>
                  <p className="recent-order-copy">{t('information.recentOrderCopy')}</p>
                  <button
                    type="button"
                    className="user-info-secondary"
                    onClick={() => navigate(localizePath('/all-shops/AS-001/track', language))}
                  >
                    {t('information.trackRecent')}
                  </button>
                </>
              ) : (
                <p className="recent-order-copy">{t('information.noRecentOrder')}</p>
              )}
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
