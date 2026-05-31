import { Fragment } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { TranslationProvider, getLanguageFromPath, localizePath } from './shared/lib/i18n'
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
    const location = useLocation()
    const language = getLanguageFromPath(location.pathname)
    return getLoggedInUser() ? children : <Navigate to={localizePath('/login', language)} replace />
}

export default App

function PublicOnly({ children }) {
    const location = useLocation()
    const language = getLanguageFromPath(location.pathname)
    return getLoggedInUser() ? <Navigate to={localizePath('/all-shops', language)} replace /> : children
}

function App() {
    const localePrefixes = ['', '/vn']

    return (
        <>
            <BrowserRouter>
                <TranslationProvider>
                    <Routes>
                        {localePrefixes.map((prefix) => (
                            <Fragment key={prefix || 'en'}>
                                <Route path={prefix || '/'} element={<LandingPage />} />
                                <Route path={`${prefix}/all-shops`} element={<AllShops />} />
                                <Route path={`${prefix}/all-shops/:id`} element={<AllShopsDetail />} />
                                <Route path={`${prefix}/all-shops/:id/schedule`} element={<PicanDeli />} />
                                <Route path={`${prefix}/all-shops/:id/confirm`} element={<ConfirmOrder />} />
                                <Route path={`${prefix}/all-shops/:id/track`} element={<TrackOrder />} />

                                <Route
                                    path={`${prefix}/information`}
                                    element={
                                        <RequireAuth>
                                            <UserInformation />
                                        </RequireAuth>
                                    }
                                />

                                <Route
                                    path={`${prefix}/signup`}
                                    element={
                                        <PublicOnly>
                                            <SignUp />
                                        </PublicOnly>
                                    }
                                />

                                <Route
                                    path={`${prefix}/login`}
                                    element={
                                        <PublicOnly>
                                            <Login />
                                        </PublicOnly>
                                    }
                                />

                                <Route
                                    path={`${prefix}/shop`}
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

                                <Route
                                    path={`${prefix}/admin`}
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

                                <Route
                                    path={`${prefix}/driver`}
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
                            </Fragment>
                        ))}
                    </Routes>
                </TranslationProvider>
            </BrowserRouter>
            <ToastContainer />
        </>
    )
}


