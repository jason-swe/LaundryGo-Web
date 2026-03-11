import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import ShopSidebar from './components/ShopSidebar'
import ShopHeader from './components/ShopHeader'
import ShopNotifications from './Notifications/ShopNotifications'
import ChatButton from '../components/ChatButton'
import './ShopDashboard.css'

function ShopDashboard() {
    const [showNotifications, setShowNotifications] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="shop-dashboard">
            <ShopSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="shop-dashboard-main">
                <ShopHeader
                    onNotificationClick={() => setShowNotifications(!showNotifications)}
                    onMenuClick={() => setSidebarOpen(prev => !prev)}
                />

                <div className="shop-dashboard-content">
                    <Outlet />
                </div>
            </div>

            {sidebarOpen && (
                <div className="shop-dashboard-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            {showNotifications && (
                <ShopNotifications onClose={() => setShowNotifications(false)} />
            )}

            <ChatButton />
        </div>
    )
}

export default ShopDashboard
