import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './LandingPage/LandingPage'
import AllShops from './AllShops/AllShops'
import SignUp from './SignUp/SignUp'
import Login from './Login/Login'
import ShopDashboard from './ShopDashboard/ShopDashboard'
import AdminDashboard from './AdminDashboard/AdminDashboard'
import ToastContainer from './components/Toast/ToastContainer'

// Shop Dashboard Pages
import ShopOverview from './ShopDashboard/Overview/ShopOverview'
import ShopOrderManagement from './ShopDashboard/OrderManagement/ShopOrderManagement'
import ShopOperations from './ShopDashboard/Operations/ShopOperations'
import ShopStaffManagement from './ShopDashboard/StaffManagement/ShopStaffManagement'
import ShopRevenue from './ShopDashboard/Revenue/ShopRevenue'
import ShopDocuments from './ShopDashboard/Documents/ShopDocuments'
import ShopIncidentReport from './ShopDashboard/IncidentReport/ShopIncidentReport'
import ShopSettings from './ShopDashboard/Settings/ShopSettings'

// Admin Dashboard Pages
import AdminOverview from './AdminDashboard/Overview/AdminOverview'
import AdminOrderManagement from './AdminDashboard/OrderManagement/AdminOrderManagement'
import AdminShopManagement from './AdminDashboard/ShopManagement/AdminShopManagement'
import AdminShipperManagement from './AdminDashboard/ShipperManagement/AdminShipperManagement'
import AdminCustomerManagement from './AdminDashboard/CustomerManagement/AdminCustomerManagement'
import AdminFinanceManagement from './AdminDashboard/FinanceManagement/AdminFinanceManagement'
import AdminPromotionManagement from './AdminDashboard/PromotionManagement/AdminPromotionManagement'
import AdminSettings from './AdminDashboard/Settings/AdminSettings'
import AdminAnalytics from './AdminDashboard/Analytics/AdminAnalytics'

function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/all-shops" element={<AllShops />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/login" element={<Login />} />

                    {/* Shop Dashboard Routes */}
                    <Route path="/shop" element={<ShopDashboard />}>
                        <Route index element={<Navigate to="overview" replace />} />
                        <Route path="overview" element={<ShopOverview />} />
                        <Route path="orders" element={<ShopOrderManagement />} />
                        <Route path="operations" element={<ShopOperations />} />
                        <Route path="staff" element={<ShopStaffManagement />} />
                        <Route path="revenue" element={<ShopRevenue />} />
                        <Route path="documents" element={<ShopDocuments />} />
                        <Route path="incidents" element={<ShopIncidentReport />} />
                        <Route path="settings" element={<ShopSettings />} />
                    </Route>

                    {/* Admin Dashboard Routes */}
                    <Route path="/admin" element={<AdminDashboard />}>
                        <Route index element={<Navigate to="overview" replace />} />
                        <Route path="overview" element={<AdminOverview />} />
                        <Route path="orders" element={<AdminOrderManagement />} />
                        <Route path="shops" element={<AdminShopManagement />} />
                        <Route path="shippers" element={<AdminShipperManagement />} />
                        <Route path="customers" element={<AdminCustomerManagement />} />
                        <Route path="finance" element={<AdminFinanceManagement />} />
                        <Route path="promotions" element={<AdminPromotionManagement />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                        <Route path="settings" element={<AdminSettings />} />
                    </Route>

                    {/* Future routes */}
                    {/* <Route path="/user/dashboard" element={<UserDashboard />} /> */}
                </Routes>
            </BrowserRouter>
            <ToastContainer />
        </>
    )
}

export default App

