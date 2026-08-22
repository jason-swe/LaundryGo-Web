import { Fragment, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { TranslationProvider } from './shared/lib/i18n'
import LandingPage from './LandingPage/LandingPage'
import AllShops from './AllShops/AllShops'
import AllShopsDetail from './AllShops/AllShopsDetail'
import PicanDeli from './PicanDeli/PicanDeli'
import ConfirmOrder from './ConfirmOrder/ConfirmOrder'
import TrackOrder from './TrackOrder/TrackOrder'
import SignUp from './SignUp/SignUp'
import VerifyPin from './SignUp/VerifyPin'
import Login from './Login/Login'
import UserInformation from './Information/UserInformation'
import ShopDashboard from './ShopDashboard/ShopDashboard'
import AdminDashboard from './AdminDashboard/AdminDashboard'
import ToastContainer from './components/Toast/ToastContainer'

// Shop Dashboard Pages
import ShopOverview from './ShopDashboard/Overview/ShopOverview'
import ShopOrderManagement from './ShopDashboard/OrderManagement/ShopOrderManagement'
import ShopOperations from './ShopDashboard/Operations/ShopOperations'
import ShopRevenue from './ShopDashboard/Revenue/ShopRevenue'
import ShopDocuments from './ShopDashboard/Documents/ShopDocuments'
import ShopIncidentReport from './ShopDashboard/IncidentReport/ShopIncidentReport'
import ShopSettings from './ShopDashboard/Settings/ShopSettings'
import ShopSettlement from './ShopDashboard/Settlement/ShopSettlement'

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
import { getDefaultPathForRole, getLoggedInUser, hasRole } from './utils/auth'
import { getLanguageFromPath, localizePath } from './shared/lib/i18n'

function RequireAuth({ children, roles }) {
    const user = getLoggedInUser()
    const location = useLocation()
    const language = getLanguageFromPath(location.pathname)

    if (!user?.accessToken) {
        return (
            <Navigate
                to={localizePath('/login', language)}
                replace
                state={{ returnTo: `${location.pathname}${location.search}${location.hash}` }}
            />
        )
    }

    if (roles?.length && !hasRole(roles)) {
        return <Navigate to={localizePath(getDefaultPathForRole(user.role), language)} replace />
    }

    return children
}

export default App

function PublicOnly({ children }) {
    const user = getLoggedInUser()
    const language = getLanguageFromPath(window.location.pathname)

    if (user?.accessToken) {
        return <Navigate to={localizePath(getDefaultPathForRole(user.role), language)} replace />
    }

    return children
}

function SessionExpiryRedirect() {
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const redirectToLogin = () => {
            const language = getLanguageFromPath(location.pathname)
            navigate(localizePath('/login', language), {
                replace: true,
                state: { returnTo: `${location.pathname}${location.search}${location.hash}` },
            })
        }

        window.addEventListener('laundrygo:auth-expired', redirectToLogin)
        return () => window.removeEventListener('laundrygo:auth-expired', redirectToLogin)
    }, [location.hash, location.pathname, location.search, navigate])

    return null
}

function App() {
    const localePrefixes = ['', '/vn']

    return (
        <>
            <BrowserRouter>
                <TranslationProvider>
                    <SessionExpiryRedirect />
                    <Routes>
                        {localePrefixes.map((prefix) => (
                            <Fragment key={prefix || 'en'}>
                                <Route path={prefix || '/'} element={<LandingPage />} />
                                <Route path={`${prefix}/all-shops`} element={<AllShops />} />
                                <Route path={`${prefix}/all-shops/:id`} element={<AllShopsDetail />} />
                                <Route
                                    path={`${prefix}/all-shops/:id/schedule`}
                                    element={<RequireAuth roles={['CUSTOMER']}><PicanDeli /></RequireAuth>}
                                />
                                <Route
                                    path={`${prefix}/all-shops/:id/confirm`}
                                    element={<RequireAuth roles={['CUSTOMER']}><ConfirmOrder /></RequireAuth>}
                                />
                                <Route
                                    path={`${prefix}/all-shops/:id/track`}
                                    element={<RequireAuth roles={['CUSTOMER']}><TrackOrder /></RequireAuth>}
                                />

                                <Route
                                    path={`${prefix}/information`}
                                    element={
                                        <RequireAuth roles={['CUSTOMER']}>
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
                                    path={`${prefix}/shop-signup`}
                                    element={
                                        <PublicOnly>
                                            <SignUp />
                                        </PublicOnly>
                                    }
                                />
                                <Route
                                    path={`${prefix}/signup/verify`}
                                    element={
                                        <PublicOnly>
                                            <VerifyPin />
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
                                        <RequireAuth roles={['SHOP_OWNER']}>
                                            <ShopDashboard />
                                        </RequireAuth>
                                    }
                                >
                                    <Route index element={<Navigate to="overview" replace />} />
                                    <Route path="overview" element={<ShopOverview />} />
                                    <Route path="orders" element={<ShopOrderManagement />} />
                                    <Route path="operations" element={<ShopOperations />} />
                                    <Route path="revenue" element={<ShopRevenue />} />
                                    <Route path="settlements" element={<ShopSettlement />} />
                                    <Route path="documents" element={<ShopDocuments />} />
                                    <Route path="incidents" element={<ShopIncidentReport />} />
                                    <Route path="settings" element={<ShopSettings />} />
                                </Route>

                                <Route
                                    path={`${prefix}/admin`}
                                    element={
                                        <RequireAuth roles={['ADMIN']}>
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
                                        <RequireAuth roles={['SHIPPER']}>
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


