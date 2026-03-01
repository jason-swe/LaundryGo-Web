import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage/LandingPage'
import SignUp from './SignUp/SignUp'
import Login from './Login/Login'
import ShopDashboard from './ShopDashboard/ShopDashboard'
import AdminDashboard from './AdminDashboard/AdminDashboard'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                <Route path="/shop/dashboard" element={<ShopDashboard />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                {/* Future routes */}
                {/* <Route path="/user/dashboard" element={<UserDashboard />} /> */}
            </Routes>
        </BrowserRouter>
    )
}

export default App

