import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, UserCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { localizePath, stripLocalePrefix, useTranslation } from '../shared/lib/i18n'
import LanguageSwitcher from '../shared/ui/LanguageSwitcher/LanguageSwitcher'
import PendingCartWidget from './PendingCartWidget'
import { getAccount, getDefaultPathForRole, getLoggedInUser, getRole, logout, subscribeAuthChanged } from '../utils/auth'
import './UserNavbar.css'

function UserNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { language, t } = useTranslation()
  const basePath = stripLocalePrefix(location.pathname)
  const [session, setSession] = useState(() => getLoggedInUser())
  const account = useMemo(() => getAccount(session), [session])
  const role = useMemo(() => getRole(session), [session])
  const displayName = account?.fullName || account?.email || t('nav.account')
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'LG'

  useEffect(() => subscribeAuthChanged(setSession), [])

  const scrollToServices = () => {
    const services = document.getElementById('landing-services')
    if (services) {
      services.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    navigate(localizePath('/', language))
  }

  const handleLogout = async () => {
    await logout()
    setSession(null)
    navigate(localizePath('/login', language), { replace: true })
  }

  const goToAccountHome = () => {
    if (role === 'CUSTOMER' || !role) {
      navigate(localizePath('/information', language))
      return
    }
    navigate(localizePath(getDefaultPathForRole(role), language))
  }

  return (
    <>
      <header className="user-navbar">
        <div className="user-navbar-inner">
          <button className="user-navbar-logo" onClick={() => navigate(localizePath('/', language))}>
            <span className="logo-text">
              Laundry<span>Go</span>
            </span>
            <span className="logo-bubbles">
              <span className="bubble bubble-lg" />
              <span className="bubble bubble-md" />
              <span className="bubble bubble-sm" />
            </span>
          </button>

          <nav className="user-navbar-links" aria-label="Main user navigation">
            <button
              className={`user-navbar-link ${basePath === '/' ? 'is-active' : ''}`}
              onClick={scrollToServices}
            >
              {t('nav.services')}
            </button>
            <button
              className={`user-navbar-link ${basePath.startsWith('/all-shops') && !basePath.includes('/track') ? 'is-active' : ''}`}
              onClick={() => navigate(localizePath('/all-shops', language))}
            >
              {t('nav.allShops')}
            </button>
            <button
              className={`user-navbar-link ${basePath.includes('/track') ? 'is-active' : ''}`}
              onClick={() => navigate(localizePath('/all-shops/AS-001/track', language))}
            >
              {t('nav.trackOrder')}
            </button>
          </nav>

          <div className="user-navbar-actions">
            <LanguageSwitcher />
            <PendingCartWidget inline />
            {session ? (
              <div className="user-navbar-account">
                <button className="user-navbar-profile" type="button" onClick={goToAccountHome}>
                  <span className="user-navbar-avatar">{initials}</span>
                  <span className="user-navbar-profile-copy">
                    <small>{role || t('nav.customer')}</small>
                    <strong>{displayName}</strong>
                  </span>
                </button>
                {role && role !== 'CUSTOMER' && (
                  <button
                    className="user-navbar-icon-btn"
                    type="button"
                    onClick={() => navigate(localizePath(getDefaultPathForRole(role), language))}
                    aria-label={t('nav.dashboard')}
                  >
                    <LayoutDashboard size={16} strokeWidth={1.9} />
                  </button>
                )}
                <button className="user-navbar-icon-btn" type="button" onClick={handleLogout} aria-label={t('nav.logout')}>
                  <LogOut size={16} strokeWidth={1.9} />
                </button>
              </div>
            ) : (
              <>
                <button className="user-navbar-auth ghost" onClick={() => navigate(localizePath('/login', language))}>
                  {t('nav.login')}
                </button>
                <button className="user-navbar-auth filled" onClick={() => navigate(localizePath('/signup', language))}>
                  <UserCircle size={16} strokeWidth={1.8} />
                  {t('nav.signup')}
                </button>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  )
}

export default UserNavbar
