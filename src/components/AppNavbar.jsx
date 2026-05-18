import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation, localizePath, stripLocalePrefix } from '../shared/lib/i18n'
import { getLoggedInUser, logout } from '../utils/auth'
import './AppNavbar.css'

function AppNavbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const { language, t } = useTranslation()
    const navigateLocalized = (path) => navigate(localizePath(path, language))

    const menuRef = useRef(null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const user = useMemo(() => getLoggedInUser(), [location.pathname])
    const displayName = user?.name?.trim() || user?.email || t('nav.login')

    // Determine active nav link
    const currentPath = stripLocalePrefix(location.pathname)
    const isTrackOrder = currentPath.includes('/track')
    const isAllShops = currentPath.startsWith('/all-shops') && !isTrackOrder

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        // Close menu on route change
        setIsMenuOpen(false)
    }, [location.pathname])

    const handleProfileClick = () => {
        if (!user) {
            navigateLocalized('/login')
            return
        }
        setIsMenuOpen((prev) => !prev)
    }

    const handleLogout = () => {
        logout()
        setIsMenuOpen(false)
        navigateLocalized('/login')
    }

    return (
        <header className="app-navbar">
            <div className="app-navbar-inner">
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

                <nav className="app-nav">
                    <button
                        className={`app-nav-link ${isAllShops ? 'app-nav-link-active' : ''}`}
                        onClick={() => navigateLocalized('/all-shops')}
                    >
                        {t('nav.allShops')}
                    </button>
                    <button
                        className={`app-nav-link ${isTrackOrder ? 'app-nav-link-active' : ''}`}
                        onClick={() => navigateLocalized('/all-shops/AS-001/track')}
                    >
                        {t('nav.trackOrder')}
                    </button>
                </nav>

                <div className="app-navbar-right">
                    <div className="app-navbar-user-wrapper" ref={menuRef}>
                        <div
                            className={`app-navbar-user ${user ? 'app-navbar-user-auth' : 'app-navbar-user-guest'}`}
                            role="button"
                            tabIndex={0}
                            aria-haspopup={user ? 'menu' : undefined}
                            aria-expanded={user ? isMenuOpen : undefined}
                            onClick={handleProfileClick}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault()
                                    handleProfileClick()
                                }
                                if (event.key === 'Escape') {
                                    setIsMenuOpen(false)
                                }
                            }}
                        >
                            <div className="app-navbar-user-icon">👤</div>
                            <span className="app-navbar-user-name">{displayName}</span>
                        </div>

                        {user && (
                            <div
                                className={`app-navbar-user-menu ${isMenuOpen ? 'app-navbar-user-menu-open' : ''}`}
                                role="menu"
                            >
                                <button
                                    type="button"
                                    className="app-navbar-user-menu-item"
                                    role="menuitem"
                                    onClick={() => navigateLocalized('/information')}
                                >
                                    {t('profile.userInformation')}
                                </button>
                                <button
                                    type="button"
                                    className="app-navbar-user-menu-item"
                                    role="menuitem"
                                    onClick={() => navigateLocalized('/settings')}
                                >
                                    {t('profile.settings')}
                                </button>
                                <button
                                    type="button"
                                    className="app-navbar-user-menu-item app-navbar-user-menu-item-danger"
                                    role="menuitem"
                                    onClick={handleLogout}
                                >
                                    {t('nav.logout')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default AppNavbar
