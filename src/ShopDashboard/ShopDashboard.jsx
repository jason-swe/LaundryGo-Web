import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import ShopSidebar from './components/ShopSidebar'
import ShopHeader from './components/ShopHeader'
import ShopNotifications from './Notifications/ShopNotifications'
import ChatButton from '../components/ChatButton'
import { notifications as notificationsData } from '../data'
import './ShopDashboard.css'

function ShopDashboard() {
    const [showNotifications, setShowNotifications] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [notificationCount, setNotificationCount] = useState(
        () => notificationsData.filter(n => !n.read).length
    )

    return (
        <div className="shop-dashboard dashboard-theme">
            <ShopSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="shop-dashboard-main">
                <ShopHeader
                    onNotificationClick={() => setShowNotifications(!showNotifications)}
                    onMenuClick={() => setSidebarOpen(prev => !prev)}
                    notificationCount={notificationCount}
                />

                <div className="shop-dashboard-content">
                    <Outlet />
                </div>
            </div>

            {sidebarOpen && (
                <div className="shop-dashboard-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            {showNotifications && (
                <ShopNotifications
                    onClose={() => setShowNotifications(false)}
                    onAllRead={() => setNotificationCount(0)}
                />
            )}

            <ChatButton />
        </div>
    )
}

export default ShopDashboard
