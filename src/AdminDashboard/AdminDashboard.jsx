import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import './AdminDashboard.css'
import AdminSidebar from './components/AdminSidebar'
import AdminHeader from './components/AdminHeader'
import AdminNotifications from './Notifications/AdminNotifications'
import ChatButton from '../components/ChatButton'

function AdminDashboard() {
    const [showNotifications, setShowNotifications] = useState(false)

    return (
        <div className="admin-dashboard">
            <AdminSidebar />

            <div className="admin-dashboard-main">
                <AdminHeader onNotificationClick={() => setShowNotifications(!showNotifications)} />

                <main className="admin-dashboard-content">
                    <Outlet />
                </main>
            </div>

            {showNotifications && (
                <AdminNotifications onClose={() => setShowNotifications(false)} />
            )}

            <ChatButton />
        </div>
    )
}

export default AdminDashboard
