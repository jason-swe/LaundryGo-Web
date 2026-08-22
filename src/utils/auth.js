import { apiRequest } from './api'

const AUTH_KEY = 'laundrygo_auth'

export function getLoggedInUser() {
    try {
        const stored = localStorage.getItem(AUTH_KEY)
        return stored ? JSON.parse(stored) : null
    } catch {
        return null
    }
}

export function getAccessToken() {
    return getLoggedInUser()?.accessToken || null
}

export function normalizeRole(role) {
    return String(role || '').replace(/^ROLE_/, '').toUpperCase()
}

export function hasRole(allowedRoles = []) {
    const userRole = normalizeRole(getLoggedInUser()?.role)
    return allowedRoles.map(normalizeRole).includes(userRole)
}

export function getDefaultPathForRole(role) {
    switch (normalizeRole(role)) {
        case 'ADMIN':
            return '/admin'
        case 'SHOP_OWNER':
            return '/shop'
        case 'SHIPPER':
            return '/driver'
        default:
            return '/all-shops'
    }
}

export function logout() {
    localStorage.removeItem(AUTH_KEY)
}

export async function logoutFromApi() {
    const token = getAccessToken()
    if (!token) {
        logout()
        return
    }

    try {
        await apiRequest('/api/v1/auth/logout', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
    } finally {
        logout()
    }
}

export async function login(email, password) {
    try {
        const payload = await apiRequest('/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: email.trim(),
                password,
            }),
        })

        const data = payload?.data
        const account = data?.account

        if (!data?.accessToken || !account) {
            return { success: false, errorKey: 'auth.loginFailed' }
        }

        const session = {
            id: account.accountId,
            accountId: account.accountId,
            email: account.email,
            name: account.fullName || '',
            fullName: account.fullName || '',
            phone: account.phone || '',
            role: account.role || '',
            status: account.status || '',
            accessToken: data.accessToken,
            refreshToken: data.refreshToken || '',
        }

        localStorage.setItem(AUTH_KEY, JSON.stringify(session))
        return { success: true, user: session }
    } catch (error) {
        return {
            success: false,
            error: error.message,
            errorCode: error.code,
            errorKey: error.status ? 'auth.loginFailed' : 'auth.networkError',
        }
    }
}

export async function signup(email, password, fullName = '', phoneNumber = '') {
    try {
        const payload = await apiRequest('/api/v1/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
                password,
                fullName: fullName.trim(),
                phoneNumber: phoneNumber.trim(),
            }),
        })

        return { success: true, user: payload?.data || null, message: payload?.message || '' }
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Registration failed',
            errorCode: error.code,
            errorKey: error.status ? 'auth.signupFailed' : 'auth.networkError',
        }
    }
}

export async function signupShop({ email, password, fullName = '', phoneNumber = '', shopName = '', description = '' }) {
    try {
        const payload = await apiRequest('/api/v1/auth/shops/register', {
            method: 'POST',
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
                password,
                fullName: fullName.trim(),
                phoneNumber: phoneNumber.trim(),
                shopName: shopName.trim(),
                description: description.trim(),
            }),
        })

        return { success: true, shop: payload?.data || null, message: payload?.message || '' }
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Shop registration failed',
            errorCode: error.code,
            errorKey: error.status ? 'auth.signupFailed' : 'auth.networkError',
        }
    }
}

export async function verifyEmail(email, otp) {
    try {
        const payload = await apiRequest('/api/v1/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
                otp: otp.trim(),
            }),
        })

        return { success: true, message: payload?.message || '' }
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Email verification failed',
            errorCode: error.code,
            errorKey: error.status ? 'auth.verifyFailed' : 'auth.networkError',
        }
    }
}

export async function resendOtp(email) {
    try {
        const payload = await apiRequest('/api/v1/auth/resend-otp', {
            method: 'POST',
            body: JSON.stringify({ email: email.trim().toLowerCase() }),
        })

        return { success: true, message: payload?.message || '' }
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Could not resend verification code',
            errorCode: error.code,
            errorKey: error.status ? 'auth.resendFailed' : 'auth.networkError',
        }
    }
}
