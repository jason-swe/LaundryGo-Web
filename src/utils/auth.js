// Auth utility — customer authentication via localStorage
// Customer data lives in the same key as dataManager.js: 'laundrygo_customers'
// Session data is stored under 'laundrygo_auth'

import defaultCustomers from '../data/customers.json'

const CUSTOMERS_KEY = 'laundrygo_customers'
const AUTH_KEY = 'laundrygo_auth'

// ── Customer list ────────────────────────────────────────────

function getCustomers() {
    try {
        const stored = localStorage.getItem(CUSTOMERS_KEY)
        if (stored) return JSON.parse(stored)
        // Seed localStorage from bundled JSON on first load
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

// ── Session ──────────────────────────────────────────────────

export function getLoggedInUser() {
    try {
        const stored = localStorage.getItem(AUTH_KEY)
        return stored ? JSON.parse(stored) : null
    } catch {
        return null
    }
}

export function logout() {
    localStorage.removeItem(AUTH_KEY)
}

// ── Login ────────────────────────────────────────────────────

export function login(email, password) {
    const trimmedEmail = email.trim().toLowerCase()
    const customers = getCustomers()
    const match = customers.find(
        (c) => c.email.toLowerCase() === trimmedEmail && c.password === password
    )
    if (!match) {
        return { success: false, error: 'Email hoặc mật khẩu không đúng.' }
    }
    const session = { id: match.id, email: match.email, name: match.name || '' }
    localStorage.setItem(AUTH_KEY, JSON.stringify(session))
    return { success: true, user: session }
}

// ── Sign Up ──────────────────────────────────────────────────

export function signup(email, password) {
    const trimmedEmail = email.trim().toLowerCase()
    const customers = getCustomers()

    if (customers.find((c) => c.email.toLowerCase() === trimmedEmail)) {
        return { success: false, error: 'Email này đã được đăng ký.' }
    }

    // Generate next id
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
