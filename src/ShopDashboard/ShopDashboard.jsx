import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import ShopSidebar from './components/ShopSidebar'
import ShopHeader from './components/ShopHeader'
import ShopNotifications from './Notifications/ShopNotifications'
import ChatButton from '../components/ChatButton'
import './ShopDashboard.css'

function ShopDashboard() {
    const [showNotifications, setShowNotifications] = useState(false)

    return (
        <div className="shop-dashboard">
            <ShopSidebar />

            <div className="shop-dashboard-main">
                <ShopHeader onNotificationClick={() => setShowNotifications(!showNotifications)} />

                <div className="shop-dashboard-content">
                    <Outlet />
                </div>
            </div>

            {showNotifications && (
                <ShopNotifications onClose={() => setShowNotifications(false)} />
            )}

            <ChatButton />
        </div>
    )
}

export default ShopDashboard
