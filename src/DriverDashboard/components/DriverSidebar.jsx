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

const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'tasks', label: 'My Tasks', icon: ClipboardList },
    { id: 'history', label: 'History', icon: History },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'notifications', label: 'Notifications', icon: Bell },
]

function DriverSidebar({ isOpen, onClose }) {
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        onClose()
        navigate('/login', { replace: true })
    }

    return (
        <aside className={`driver-sidebar${isOpen ? ' driver-sidebar-open' : ''}`}>

            {/* ── Logo ── */}
            <div className="driver-sidebar-logo-wrap">
                <NavLink to="/driver/overview" className="driver-sidebar-logo" onClick={onClose}>
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
                            to={`/driver/${item.id}`}
                            className={({ isActive }) =>
                                `driver-sidebar-item${isActive ? ' driver-sidebar-item-active' : ''}`
                            }
                            onClick={onClose}
                        >
                            <span className="driver-sidebar-item-icon"><Icon size={18} /></span>
                            <span className="driver-sidebar-item-label">{item.label}</span>
                        </NavLink>
                    )
                })}
            </nav>

            {/* ── Bottom / Footer ── */}
            <div className="driver-sidebar-footer">
                <NavLink
                    to="/driver/settings"
                    className={({ isActive }) =>
                        `driver-sidebar-item${isActive ? ' driver-sidebar-item-active' : ''}`
                    }
                    onClick={onClose}
                >
                    <span className="driver-sidebar-item-icon"><Settings size={18} /></span>
                    <span className="driver-sidebar-item-label">Account Settings</span>
                </NavLink>

                <button
                    className="driver-sidebar-item driver-sidebar-logout"
                    type="button"
                    onClick={handleLogout}
                >
                    <span className="driver-sidebar-item-icon"><LogOut size={18} /></span>
                    <span className="driver-sidebar-item-label">Log Out</span>
                </button>

                {/* Driver mini profile */}
                <NavLink
                    to="/driver/profile"
                    className={({ isActive }) =>
                        `driver-sidebar-profile-mini${isActive ? ' driver-sidebar-profile-mini-active' : ''}`
                    }
                    onClick={onClose}
                >
                    <div className="driver-sidebar-avatar-mini"><User size={18} /></div>
                    <div className="driver-sidebar-profile-mini-info">
                        <div className="driver-sidebar-profile-mini-name">Nguyễn Văn A</div>
                        <div className="driver-sidebar-profile-mini-role">Driver · Online</div>
                    </div>
                    <span className="driver-sidebar-online-dot" />
                </NavLink>
            </div>

        </aside>
    )
}

export default DriverSidebar
