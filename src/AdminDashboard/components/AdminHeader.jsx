import './AdminHeader.css'
import { SearchOutlined, BellOutlined, UserOutlined, MenuOutlined } from '@ant-design/icons'
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from '../../shared/lib/i18n'

function AdminHeader({ onNotificationClick, onMenuClick }) {
    const { t } = useTranslation()
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const dropdownRef = useRef(null)

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
        <header className="admin-header">
            <button className="admin-header-menu-btn" onClick={onMenuClick} aria-label={t('dashboard.toggleMenu')}>
                <MenuOutlined />
            </button>
            <div className="admin-header-search">
                <SearchOutlined className="admin-header-search-icon" />
                <input
                    type="text"
                    className="admin-header-search-input"
                    placeholder={t('dashboard.searchAdmin')}
                />
            </div>

            <button
                className="admin-header-notification-btn"
                onClick={onNotificationClick}
                aria-label={t('profile.notifications')}
            >
                <BellOutlined className="admin-header-notification-icon" />
                <span className="admin-header-notification-badge">8</span>
            </button>

            <div className="admin-header-profile" ref={dropdownRef}>
                <button
                    className="admin-header-profile-btn"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    aria-label={t('dashboard.profileMenu')}
                >
                    <UserOutlined className="admin-header-profile-icon" />
                </button>

                {showProfileMenu && (
                    <div className="admin-header-profile-dropdown">
                        <button className="admin-header-profile-option">
                            <UserOutlined />
                            <span>{t('profile.viewProfile')}</span>
                        </button>
                        <button className="admin-header-profile-option logout">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor" />
                            </svg>
                            <span>{t('nav.logout')}</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    )
}

export default AdminHeader
