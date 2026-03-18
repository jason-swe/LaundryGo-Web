import './ShopHeader.css'
import { Search, Bell, User, Menu, LogOut } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

function ShopHeader({ onNotificationClick, onMenuClick, notificationCount = 0 }) {
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
        <header className="shop-header">
            <button className="shop-header-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
                <Menu size={20} />
            </button>
            <div className="shop-header-search">
                <Search className="shop-header-search-icon" size={16} />
                <input
                    type="text"
                    className="shop-header-search-input"
                    placeholder="Search for orders, machines, supplies, ..."
                />
            </div>

            <button
                className="shop-header-notification-btn"
                onClick={onNotificationClick}
                aria-label="Notifications"
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
                    aria-label="Profile Menu"
                >
                    <User className="shop-header-profile-icon" size={20} />
                </button>

                {showProfileMenu && (
                    <div className="shop-header-profile-dropdown">
                        <button className="shop-header-profile-option">
                            <User size={16} />
                            <span>Xem hồ sơ cá nhân</span>
                        </button>
                        <button className="shop-header-profile-option logout">
                            <LogOut size={16} />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    )
}

export default ShopHeader
