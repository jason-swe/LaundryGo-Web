import './AdminHeader.css'
import { Bell, LogOut, Menu, Search, ShieldCheck, User, Activity, CalendarDays } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation, localizePath } from '../../shared/lib/i18n'
import LanguageSwitcher from '../../shared/ui/LanguageSwitcher/LanguageSwitcher'
import { logout } from '../../utils/auth'

function AdminHeader({ onNotificationClick, onMenuClick }) {
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const dropdownRef = useRef(null)
    const navigate = useNavigate()
    const { language, t } = useTranslation()

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowProfileMenu(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleLogout = async () => {
        try {
            await logout()
        } catch {
            // ignore storage errors
        }
        setShowProfileMenu(false)
        navigate(localizePath('/login', language), { replace: true })
    }

    return (
        <header className="admin-header">
            <div className="admin-header-left">
                <button className="admin-header-menu-btn" onClick={onMenuClick} aria-label={t('adminShell.menu')}>
                    <Menu size={20} strokeWidth={1.9} />
                </button>

                <div className="admin-header-title-block">
                    <span>{t('adminShell.commandCenter')}</span>
                    <strong>{t('adminShell.platformOps')}</strong>
                </div>

                <label className="admin-header-search">
                    <Search className="admin-header-search-icon" size={17} strokeWidth={1.9} />
                    <input
                        type="text"
                        className="admin-header-search-input"
                        placeholder={t('adminShell.searchPlaceholder')}
                    />
                </label>
            </div>

            <div className="admin-header-actions">
                <div className="admin-header-date">
                    <CalendarDays size={15} strokeWidth={1.9} />
                    {t('adminShell.today')}
                </div>

                <div className="admin-header-health">
                    <Activity size={15} strokeWidth={1.9} />
                    {t('adminShell.systemHealthy')}
                </div>

                <LanguageSwitcher />

                <button
                    className="admin-header-notification-btn"
                    onClick={onNotificationClick}
                    aria-label={t('adminShell.notifications')}
                >
                    <Bell className="admin-header-notification-icon" size={20} strokeWidth={1.9} />
                    <span className="admin-header-notification-badge">8</span>
                </button>

                <div className="admin-header-profile" ref={dropdownRef}>
                    <button
                        className="admin-header-profile-btn"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        aria-label={t('adminShell.profileMenu')}
                    >
                        <span>SA</span>
                    </button>

                    {showProfileMenu && (
                        <div className="admin-header-profile-dropdown">
                            <div className="admin-header-profile-card">
                                <div className="admin-header-profile-avatar">SA</div>
                                <div>
                                    <strong>{t('adminShell.adminName')}</strong>
                                    <span>
                                        <ShieldCheck size={12} strokeWidth={2} />
                                        {t('adminShell.adminRole')}
                                    </span>
                                </div>
                            </div>
                            <button className="admin-header-profile-option">
                                <User size={16} strokeWidth={1.9} />
                                <span>{t('adminShell.viewProfile')}</span>
                            </button>
                            <button className="admin-header-profile-option logout" onClick={handleLogout}>
                                <LogOut size={16} strokeWidth={1.9} />
                                <span>{t('adminShell.logout')}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default AdminHeader
