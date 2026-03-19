import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import './AdminDashboard.css'
import AdminSidebar from './components/AdminSidebar'
import AdminHeader from './components/AdminHeader'
import AdminNotifications from './Notifications/AdminNotifications'
import ChatButton from '../components/ChatButton'

function AdminDashboard() {
    const [showNotifications, setShowNotifications] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="admin-dashboard dashboard-theme">
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="admin-dashboard-main">
                <AdminHeader
                    onNotificationClick={() => setShowNotifications(!showNotifications)}
                    onMenuClick={() => setSidebarOpen(prev => !prev)}
                />

                <main className="admin-dashboard-content">
                    <Outlet />
                </main>
            </div>

            {sidebarOpen && (
                <div className="admin-dashboard-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            {showNotifications && (
                <AdminNotifications onClose={() => setShowNotifications(false)} />
            )}

            <ChatButton />
        </div>
    )
}

export default AdminDashboard
