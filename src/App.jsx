import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './LandingPage/LandingPage'
import AllShops from './AllShops/AllShops'
import AllShopsDetail from './AllShops/AllShopsDetail'
import PicanDeli from './PicanDeli/PicanDeli'
import ConfirmOrder from './ConfirmOrder/ConfirmOrder'
import TrackOrder from './TrackOrder/TrackOrder'
import SignUp from './SignUp/SignUp'
import Login from './Login/Login'
import UserInformation from './Information/UserInformation'
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
import AdminShopManagement from './AdminDashboard/ShopManagement/AdminShopManagement'
import AdminShipperManagement from './AdminDashboard/ShipperManagement/AdminShipperManagement'
import AdminCustomerManagement from './AdminDashboard/CustomerManagement/AdminCustomerManagement'
import AdminFinanceManagement from './AdminDashboard/FinanceManagement/AdminFinanceManagement'
import AdminPromotionManagement from './AdminDashboard/PromotionManagement/AdminPromotionManagement'
import AdminSettings from './AdminDashboard/Settings/AdminSettings'
import AdminAnalytics from './AdminDashboard/Analytics/AdminAnalytics'

// Driver Dashboard
import DriverDashboard from './DriverDashboard/DriverDashboard'
import DriverOverview from './DriverDashboard/Overview/DriverOverview'
import DriverTasks from './DriverDashboard/Tasks/DriverTasks'
import DriverHistory from './DriverDashboard/History/DriverHistory'
import DriverEarnings from './DriverDashboard/Earnings/DriverEarnings'
import DriverNotifications from './DriverDashboard/Notifications/DriverNotifications'
import DriverSettings from './DriverDashboard/Settings/DriverSettings'
import DriverProfile from './DriverDashboard/Profile/DriverProfile'
import { getLoggedInUser } from './utils/auth'

function RequireAuth({ children }) {
    return getLoggedInUser() ? children : <Navigate to="/login" replace />
}

function PublicOnly({ children }) {
    return getLoggedInUser() ? <Navigate to="/all-shops" replace /> : children
}

function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/all-shops" element={<AllShops />} />
                    <Route path="/all-shops/:id" element={<AllShopsDetail />} />
                    <Route path="/all-shops/:id/schedule" element={<PicanDeli />} />
                    <Route path="/all-shops/:id/confirm" element={<ConfirmOrder />} />
                    <Route path="/all-shops/:id/track" element={<TrackOrder />} />
                    <Route
                        path="/information"
                        element={
                            <RequireAuth>
                                <UserInformation />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/signup"
                        element={
                            <PublicOnly>
                                <SignUp />
                            </PublicOnly>
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            <PublicOnly>
                                <Login />
                            </PublicOnly>
                        }
                    />

                    {/* Shop Dashboard Routes */}
                    <Route
                        path="/shop"
                        element={
                            <RequireAuth>
                                <ShopDashboard />
                            </RequireAuth>
                        }
                    >
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
                    <Route
                        path="/admin"
                        element={
                            <RequireAuth>
                                <AdminDashboard />
                            </RequireAuth>
                        }
                    >
                        <Route index element={<Navigate to="overview" replace />} />
                        <Route path="overview" element={<AdminOverview />} />
                        <Route path="shops" element={<AdminShopManagement />} />
                        <Route path="shippers" element={<AdminShipperManagement />} />
                        <Route path="customers" element={<AdminCustomerManagement />} />
                        <Route path="finance" element={<AdminFinanceManagement />} />
                        <Route path="promotions" element={<AdminPromotionManagement />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                        <Route path="settings" element={<AdminSettings />} />
                    </Route>

                    {/* Driver Dashboard Routes */}
                    <Route
                        path="/driver"
                        element={
                            <RequireAuth>
                                <DriverDashboard />
                            </RequireAuth>
                        }
                    >
                        <Route index element={<Navigate to="overview" replace />} />
                        <Route path="overview" element={<DriverOverview />} />
                        <Route path="tasks" element={<DriverTasks />} />
                        <Route path="history" element={<DriverHistory />} />
                        <Route path="earnings" element={<DriverEarnings />} />
                        <Route path="notifications" element={<DriverNotifications />} />
                        <Route path="settings" element={<DriverSettings />} />
                        <Route path="profile" element={<DriverProfile />} />
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

