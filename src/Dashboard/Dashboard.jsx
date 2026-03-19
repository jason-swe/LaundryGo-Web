import { useState } from 'react'
import './Dashboard.css'
import Sidebar from './Sidebar'
import Overview from './Overview/Overview'
import Orders from './Orders/Orders'
import Staff from './Staff/Staff'
import Document from './Document/Document'
import Operation from './Operation/Operation'
import IncidentReport from './Support/IncidentReport'
import Notifications from './Support/Notifications'
import Settings from './Settings/Settings'
import SearchBar from './components/SearchBar'
import ChatButton from './components/ChatButton'

function Dashboard() {
    const [currentPage, setCurrentPage] = useState('overview')
    const [showNotifications, setShowNotifications] = useState(false)
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const renderPage = () => {
        switch (currentPage) {
            case 'overview':
                return <Overview />
            case 'orders':
                return <Orders />
            case 'staff':
                return <Staff />
            case 'document':
                return <Document />
            case 'operation':
                return <Operation />
            case 'incident':
                return <IncidentReport />
            case 'notifications':
                return <Notifications />
            case 'settings':
                return <Settings />
            default:
                return <Overview />
        }
    }

    return (
        <div className="dashboard">
            <Sidebar
                currentPage={currentPage}
                onNavigate={setCurrentPage}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <button
                        className="dashboard-menu-btn"
                        onClick={() => setSidebarOpen(prev => !prev)}
                        aria-label="Toggle menu"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                    <SearchBar />
                    <button
                        className="dashboard-notification-btn"
                        onClick={() => setShowNotifications(!showNotifications)}
                        aria-label="Notifications"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="currentColor" />
                        </svg>
                        <span className="dashboard-notification-badge">5</span>
                    </button>

                    <div className="dashboard-profile">
                        <button
                            className="dashboard-profile-btn"
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            aria-label="Profile Menu"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
                            </svg>
                        </button>

                        {showProfileMenu && (
                            <div className="dashboard-profile-dropdown">
                                <button className="dashboard-profile-option">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
                                    </svg>
                                    <span>Xem hồ sơ cá nhân</span>
                                </button>
                                <button className="dashboard-profile-option logout">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor" />
                                    </svg>
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <div className="dashboard-content">
                    {renderPage()}
                </div>
            </main>

            {showNotifications && (
                <Notifications onClose={() => setShowNotifications(false)} />
            )}

            <ChatButton />

            {sidebarOpen && (
                <div className="dashboard-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            {showNotifications && (
                <Notifications onClose={() => setShowNotifications(false)} />
            )}
        </div>
    )
}

export default Dashboard
