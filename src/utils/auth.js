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
        return {
            success: false,
            error: error.message,
            errorCode: error.code,
            errorKey: error.status ? 'auth.loginFailed' : 'auth.networkError',
        }
    }
}

export function signup(email, password) {
    const trimmedEmail = email.trim().toLowerCase()
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
        name: '',
        phone: '',
        email: trimmedEmail,
        password,
        address: '',
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

    const session = { id: newId, email: trimmedEmail, name: '' }
    localStorage.setItem(AUTH_KEY, JSON.stringify(session))
    return { success: true, user: session }
}
