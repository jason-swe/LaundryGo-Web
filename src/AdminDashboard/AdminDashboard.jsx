import { useState } from 'react'
import './AdminDashboard.css'
import AdminSidebar from './components/AdminSidebar'
import AdminHeader from './components/AdminHeader'
import AdminOverview from './Overview/AdminOverview'
import AdminOrderManagement from './OrderManagement/AdminOrderManagement'
import AdminShopManagement from './ShopManagement/AdminShopManagement'
import AdminShipperManagement from './ShipperManagement/AdminShipperManagement'
import AdminCustomerManagement from './CustomerManagement/AdminCustomerManagement'
import AdminFinanceManagement from './FinanceManagement/AdminFinanceManagement'
import AdminPromotionManagement from './PromotionManagement/AdminPromotionManagement'
import AdminNotifications from './Notifications/AdminNotifications'
import AdminSettings from './Settings/AdminSettings'
import ChatButton from '../components/ChatButton'

function AdminDashboard() {
    const [activeView, setActiveView] = useState('overview')
    const [showNotifications, setShowNotifications] = useState(false)

    const renderContent = () => {
        switch (activeView) {
            case 'overview':
                return <AdminOverview />
            case 'orders':
                return <AdminOrderManagement />
            case 'shops':
                return <AdminShopManagement />
            case 'shippers':
                return <AdminShipperManagement />
            case 'customers':
                return <AdminCustomerManagement />
            case 'finance':
                return <AdminFinanceManagement />
            case 'promotions':
                return <AdminPromotionManagement />
            case 'settings':
                return <AdminSettings />
            default:
                return <AdminOverview />
        }
    }

    return (
        <div className="admin-dashboard">
            <AdminSidebar activeView={activeView} onViewChange={setActiveView} />

            <div className="admin-dashboard-main">
                <AdminHeader onNotificationClick={() => setShowNotifications(!showNotifications)} />

                <main className="admin-dashboard-content">
                    {renderContent()}
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
