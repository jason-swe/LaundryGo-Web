import { NavLink, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    ClipboardList,
    History,
    DollarSign,
    Bell,
    Settings,
    LogOut,
    User,
} from 'lucide-react'
import './DriverSidebar.css'
import { logout } from '../../utils/auth'
import { useTranslation, localizePath } from '../../shared/lib/i18n'

const NAV_ITEMS = [
    { id: 'overview', labelKey: 'dashboard.overview', icon: LayoutDashboard },
    { id: 'tasks', labelKey: 'dashboard.myTasks', icon: ClipboardList },
    { id: 'history', labelKey: 'dashboard.history', icon: History },
    { id: 'earnings', labelKey: 'dashboard.earnings', icon: DollarSign },
    { id: 'notifications', labelKey: 'profile.notifications', icon: Bell },
]

function DriverSidebar({ isOpen, onClose }) {
    const navigate = useNavigate()
    const { language, t } = useTranslation()

    const handleLogout = () => {
        logout()
        onClose()
        navigate(localizePath('/login', language), { replace: true })
    }

    return (
        <aside className={`driver-sidebar${isOpen ? ' driver-sidebar-open' : ''}`}>

            {/* ── Logo ── */}
            <div className="driver-sidebar-logo-wrap">
                <NavLink to={localizePath('/driver/overview', language)} className="driver-sidebar-logo" onClick={onClose}>
                    <span className="driver-sidebar-logo-text">
                        Laundry<span>Go</span>
                    </span>
                    <span className="driver-sidebar-logo-bubbles">
                        <span className="driver-bubble driver-bubble-lg" />
                        <span className="driver-bubble driver-bubble-md" />
                        <span className="driver-bubble driver-bubble-sm" />
                    </span>
                </NavLink>
            </div>

            {/* ── Navigation ── */}
            <nav className="driver-sidebar-nav">
                {NAV_ITEMS.map(item => {
                    const Icon = item.icon
                    return (
                        <NavLink
                            key={item.id}
                            to={localizePath(`/driver/${item.id}`, language)}
                            className={({ isActive }) =>
                                `driver-sidebar-item${isActive ? ' driver-sidebar-item-active' : ''}`
                            }
                            onClick={onClose}
                        >
                            <span className="driver-sidebar-item-icon"><Icon size={18} /></span>
                            <span className="driver-sidebar-item-label">{t(item.labelKey)}</span>
                        </NavLink>
                    )
                })}
            </nav>

            {/* ── Bottom / Footer ── */}
            <div className="driver-sidebar-footer">
                <NavLink
                    to={localizePath('/driver/settings', language)}
                    className={({ isActive }) =>
                        `driver-sidebar-item${isActive ? ' driver-sidebar-item-active' : ''}`
                    }
                    onClick={onClose}
                >
                    <span className="driver-sidebar-item-icon"><Settings size={18} /></span>
                    <span className="driver-sidebar-item-label">{t('dashboard.accountSettings')}</span>
                </NavLink>

                <button
                    className="driver-sidebar-item driver-sidebar-logout"
                    type="button"
                    onClick={handleLogout}
                >
                    <span className="driver-sidebar-item-icon"><LogOut size={18} /></span>
                    <span className="driver-sidebar-item-label">{t('nav.logout')}</span>
                </button>

                {/* Driver mini profile */}
                <NavLink
                    to={localizePath('/driver/profile', language)}
                    className={({ isActive }) =>
                        `driver-sidebar-profile-mini${isActive ? ' driver-sidebar-profile-mini-active' : ''}`
                    }
                    onClick={onClose}
                >
                    <div className="driver-sidebar-avatar-mini"><User size={18} /></div>
                    <div className="driver-sidebar-profile-mini-info">
                        <div className="driver-sidebar-profile-mini-name">Nguyễn Văn A</div>
                        <div className="driver-sidebar-profile-mini-role">{t('dashboard.driverOnline')}</div>
                    </div>
                    <span className="driver-sidebar-online-dot" />
                </NavLink>
            </div>

        </aside>
    )
}

export default DriverSidebar
