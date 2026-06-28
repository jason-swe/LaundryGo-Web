// Auth utility. Login uses the Spring Boot API; signup remains local mock data
// until the registration flow is connected.

import defaultCustomers from '../data/customers.json'
import { apiRequest } from './api'

const CUSTOMERS_KEY = 'laundrygo_customers'
const AUTH_KEY = 'laundrygo_auth'

function getCustomers() {
    try {
        const stored = localStorage.getItem(CUSTOMERS_KEY)
        if (stored) return JSON.parse(stored)
        localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(defaultCustomers))
        return defaultCustomers
    } catch {
        return defaultCustomers
    }
}

function saveCustomerList(customers) {
    try {
        localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers))
    } catch {
        // ignore storage errors
    }
}

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
        // If backend login fails, allow local/demo login fallback so users created
        // by the local signup flow can still authenticate.
        try {
            const customers = getCustomers()
            const trimmed = email.trim().toLowerCase()
            const matched = customers.find((c) => c.email && c.email.toLowerCase() === trimmed && c.password === password)
            if (matched) {
                const session = {
                    id: matched.id,
                    accountId: matched.id,
                    email: matched.email,
                    name: matched.fullName || matched.name || '',
                    fullName: matched.fullName || matched.name || '',
                    phone: matched.phone || '',
                    role: matched.role || '',
                    status: matched.status || '',
                    accessToken: 'demo',
                    refreshToken: 'demo',
                }
                localStorage.setItem(AUTH_KEY, JSON.stringify(session))
                return { success: true, user: session }
            }
        } catch (e) {
            // ignore local fallback errors
        }

        return {
            success: false,
            error: error.message,
            errorCode: error.code,
            errorKey: error.status ? 'auth.loginFailed' : 'auth.networkError',
        }
    }
}

export async function signup(email, password, fullName = '', phoneNumber = '') {
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedFullName = (fullName || '').trim()
    const trimmedPhone = (phoneNumber || '').trim()

    // Try backend registration first (if API reachable). If it fails, fall back to local demo logic.
    try {
        const payload = await apiRequest('/api/v1/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email: trimmedEmail, password, fullName: trimmedFullName, phoneNumber: trimmedPhone }),
        })

        // If backend responded with success, return its data (shape may vary by backend)
        if (payload && payload.success !== false) {
            return { success: true, user: payload.data || null }
        }
    } catch (err) {
        // If backend responded with an error (4xx/5xx), propagate that message to UI
        if (err && err.status) {
            return { success: false, error: err.message || 'Đăng ký thất bại' }
        }
        // otherwise (network error / no response) fall back to local signup
    }

    // Local/demo signup (existing behaviour)
    const customers = getCustomers()

    if (customers.find((c) => c.email.toLowerCase() === trimmedEmail)) {
        return { success: false, error: 'Email này đã được đăng ký.' }
    }

    const maxNum = customers.reduce((max, c) => {
        const num = parseInt(c.id.replace('CUS-', ''), 10)
        return isNaN(num) ? max : Math.max(max, num)
    }, 1000)
    const newId = `CUS-${maxNum + 1}`

    const newCustomer = {
        id: newId,
        name: trimmedFullName || '',
        fullName: trimmedFullName || '',
        phone: trimmedPhone || '',
        email: trimmedEmail,
        password,
        address: '',
        city: '',
        district: '',
        joinDate: new Date().toISOString().slice(0, 10),
        status: 'active',
        loyaltyTier: 'bronze',
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        lastOrderDate: null,
        preferredServices: [],
        notes: '',
        rating: null,
    }

    saveCustomerList([...customers, newCustomer])

    const session = { id: newId, email: trimmedEmail, name: trimmedFullName || '', fullName: trimmedFullName || '', phone: trimmedPhone || '', accessToken: 'demo', refreshToken: 'demo' }
    localStorage.setItem(AUTH_KEY, JSON.stringify(session))
    return { success: true, user: session }
}
