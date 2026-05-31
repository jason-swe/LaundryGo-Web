import { useNavigate, useLocation } from 'react-router-dom'
import './AppNavbar.css'
import { useTranslation, localizePath, stripLocalePrefix } from '../shared/lib/i18n'
import LanguageSwitcher from '../shared/ui/LanguageSwitcher/LanguageSwitcher'

function AppNavbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const { language, t } = useTranslation()

    // Determine active nav link
    const basePath = stripLocalePrefix(location.pathname)
    const isTrackOrder = basePath.includes('/track')
    const isAllShops = basePath.startsWith('/all-shops') && !isTrackOrder

    return (
        <header className="app-navbar">
            <div className="app-navbar-inner">
                <div className="logo" onClick={() => navigate(localizePath('/', language))} style={{ cursor: 'pointer' }}>
                    <span className="logo-text">
                        Laundry<span>Go</span>
                    </span>
                    <span className="logo-bubbles">
                        <span className="bubble bubble-lg" />
                        <span className="bubble bubble-md" />
                        <span className="bubble bubble-sm" />
                    </span>
                </div>

                <nav className="app-nav">
                    <button
                        className={`app-nav-link ${isAllShops ? 'app-nav-link-active' : ''}`}
                        onClick={() => navigate(localizePath('/all-shops', language))}
                    >
                        {t('nav.allShops')}
                    </button>
                    <button
                        className={`app-nav-link ${isTrackOrder ? 'app-nav-link-active' : ''}`}
                        onClick={() => navigate(localizePath('/all-shops/AS-001/track', language))}
                    >
                        {t('nav.trackOrder')}
                    </button>
                </nav>

                <LanguageSwitcher />

                <div
                    className="app-navbar-user"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(localizePath('/information', language))}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            navigate(localizePath('/information', language))
                        }
                    }}
                >
                    <div className="app-navbar-user-icon">👤</div>
                    <span className="app-navbar-user-name">EXE101</span>
                </div>
            </div>
        </header>
    )
}

export default AppNavbar
