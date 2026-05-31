import './ShopHeader.css'
import { Search, Bell, User, Menu, LogOut } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from '../../shared/lib/i18n'
import LanguageSwitcher from '../../shared/ui/LanguageSwitcher/LanguageSwitcher'

function ShopHeader({ onNotificationClick, onMenuClick, notificationCount = 0 }) {
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const dropdownRef = useRef(null)
    const { t } = useTranslation()

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowProfileMenu(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <header className="shop-header">
            <button className="shop-header-menu-btn" onClick={onMenuClick} aria-label={t('dashboard.menu')}>
                <Menu size={20} />
            </button>
            <div className="shop-header-search">
                <Search className="shop-header-search-icon" size={16} />
                <input
                    type="text"
                    className="shop-header-search-input"
                    placeholder={t('dashboard.searchPlaceholder')}
                />
            </div>

            <LanguageSwitcher />

            <button
                className="shop-header-notification-btn"
                onClick={onNotificationClick}
                aria-label={t('dashboard.notifications')}
            >
                <Bell className="shop-header-notification-icon" size={20} />
                {notificationCount > 0 && (
                    <span className="shop-header-notification-badge">
                        {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                )}
            </button>

            <div className="shop-header-profile" ref={dropdownRef}>
                <button
                    className="shop-header-profile-btn"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    aria-label={t('dashboard.profile')}
                >
                    <User className="shop-header-profile-icon" size={20} />
                </button>

                {showProfileMenu && (
                    <div className="shop-header-profile-dropdown">
                        <button className="shop-header-profile-option">
                            <User size={16} />
                            <span>{t('dashboard.profile')}</span>
                        </button>
                        <button className="shop-header-profile-option logout">
                            <LogOut size={16} />
                            <span>{t('dashboard.logout')}</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    )
}

export default ShopHeader
