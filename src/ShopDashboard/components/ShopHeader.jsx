import './ShopHeader.css'
import { SearchOutlined, BellOutlined, UserOutlined } from '@ant-design/icons'
import { useState } from 'react'

function ShopHeader({ onNotificationClick }) {
    const [showProfileMenu, setShowProfileMenu] = useState(false)

    return (
        <header className="shop-header">
            <div className="shop-header-search">
                <SearchOutlined className="shop-header-search-icon" />
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
                <BellOutlined className="shop-header-notification-icon" />
                <span className="shop-header-notification-badge">3</span>
            </button>

            <div className="shop-header-profile">
                <button
                    className="shop-header-profile-btn"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    aria-label="Profile Menu"
                >
                    <UserOutlined className="shop-header-profile-icon" />
                </button>

                {showProfileMenu && (
                    <div className="shop-header-profile-dropdown">
                        <button className="shop-header-profile-option">
                            <UserOutlined />
                            <span>Xem hồ sơ cá nhân</span>
                        </button>
                        <button className="shop-header-profile-option logout">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor" />
                            </svg>
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    )
}

export default ShopHeader
