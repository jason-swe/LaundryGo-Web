import { useState } from 'react'
import ShopSidebar from './components/ShopSidebar'
import ShopHeader from './components/ShopHeader'
import ShopOverview from './Overview/ShopOverview'
import ShopOrderManagement from './OrderManagement/ShopOrderManagement'
import ShopOperations from './Operations/ShopOperations'
import ShopStaffManagement from './StaffManagement/ShopStaffManagement'
import ShopRevenue from './Revenue/ShopRevenue'
import ShopDocuments from './Documents/ShopDocuments'
import ShopIncidentReport from './IncidentReport/ShopIncidentReport'
import ShopNotifications from './Notifications/ShopNotifications'
import ShopSettings from './Settings/ShopSettings'
import ChatButton from '../components/ChatButton'
import './ShopDashboard.css'

function ShopDashboard() {
    const [activeView, setActiveView] = useState('overview')
    const [showNotifications, setShowNotifications] = useState(false)

    const renderContent = () => {
        switch (activeView) {
            case 'overview':
                return <ShopOverview />
            case 'orders':
                return <ShopOrderManagement />
            case 'operations':
                return <ShopOperations />
            case 'staff':
                return <ShopStaffManagement />
            case 'revenue':
                return <ShopRevenue />
            case 'documents':
                return <ShopDocuments />
            case 'incidents':
                return <ShopIncidentReport />
            case 'settings':
                return <ShopSettings />
            default:
                return <ShopOverview />
        }
    }

    return (
        <div className="shop-dashboard">
            <ShopSidebar activeView={activeView} onViewChange={setActiveView} />

            <div className="shop-dashboard-main">
                <ShopHeader onNotificationClick={() => setShowNotifications(!showNotifications)} />

                <div className="shop-dashboard-content">
                    {renderContent()}
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
