import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import DriverSidebar from './components/DriverSidebar'
import DriverHeader from './components/DriverHeader'
import ChatButton from '../components/ChatButton'
import './DriverDashboard.css'

function DriverDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const notificationCount = 3

    return (
        <div className="driver-dashboard dashboard-theme">
            <DriverSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="driver-dashboard-main">
                <DriverHeader
                    onMenuClick={() => setSidebarOpen(prev => !prev)}
                    notificationCount={notificationCount}
                />
                <div className="driver-dashboard-content">
                    <Outlet />
                </div>
            </div>

            {sidebarOpen && (
                <div
                    className="driver-dashboard-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <ChatButton />
        </div>
    )
}

export default DriverDashboard
