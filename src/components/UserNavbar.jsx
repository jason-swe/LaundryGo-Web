import { useLocation, useNavigate } from 'react-router-dom'
import { UserCircle } from 'lucide-react'
import { localizePath, stripLocalePrefix, useTranslation } from '../shared/lib/i18n'
import { getLoggedInUser, logout } from '../utils/auth'
import LanguageSwitcher from '../shared/ui/LanguageSwitcher/LanguageSwitcher'
import PendingCartWidget from './PendingCartWidget'
import './UserNavbar.css'

function UserNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { language, t } = useTranslation()
  const basePath = stripLocalePrefix(location.pathname)
  const currentUser = getLoggedInUser()

  const scrollToServices = () => {
    const services = document.getElementById('landing-services')
    if (services) {
      services.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    navigate(localizePath('/', language))
  }

  const handleLogout = () => {
    logout()
    navigate(localizePath('/', language))
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
            {currentUser ? (
              <>
                <button className="user-navbar-auth filled" onClick={() => navigate(localizePath('/information', language))}>
                  <UserCircle size={16} strokeWidth={1.8} />
                  {currentUser.name || t('nav.profile')}
                </button>
                <button className="user-navbar-auth ghost" onClick={handleLogout}>
                  {t('nav.logout')}
                </button>
              </>
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
