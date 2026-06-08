const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const AUTH_KEY = 'laundrygo_auth'
const PENDING_EMAIL_KEY = 'laundrygo_pending_verify_email'
const AUTH_EVENT = 'laundrygo_auth_changed'

const endpoints = {
    login: '/api/v1/auth/login',
    logout: '/api/v1/auth/logout',
    me: '/api/v1/auth/me',
    registerCustomer: '/api/v1/auth/register',
    registerShop: '/api/v1/auth/shops/register',
    registerShipper: '/api/v1/auth/shippers/register',
    verifyEmail: '/api/v1/auth/verify-email',
    resendOtp: '/api/v1/auth/resend-otp',
    reactivationRequest: '/api/v1/auth/reactivation-requests',
}

function readJson(key, storage = localStorage) {
    try {
        const stored = storage.getItem(key)
        return stored ? JSON.parse(stored) : null
    } catch {
        return null
    }
}

function unwrapResponse(json) {
    return json?.data ?? json
}

function getErrorMessage(json, status) {
    return (
        json?.message ||
        json?.error ||
        json?.data?.message ||
        `Request failed with status ${status}`
    )
}

function normalizeSession(payload, previous = {}) {
    const data = unwrapResponse(payload)
    const token =
        typeof data === 'string'
            ? data
            : data?.accessToken || data?.token || data?.jwt || data?.access_token
    const refreshToken =
        typeof data === 'object'
            ? data?.refreshToken || data?.refresh_token || previous.refreshToken
            : previous.refreshToken
    const account =
        typeof data === 'object'
            ? data?.account || data?.user || data?.profile || previous.account
            : previous.account

    return {
        ...previous,
        ...(typeof data === 'object' && data ? data : {}),
        ...(token ? { accessToken: token, token } : {}),
        ...(refreshToken ? { refreshToken } : {}),
        ...(account ? { account } : {}),
    }
}

export function getLoggedInUser() {
    return readJson(AUTH_KEY)
}

export function getAccessToken(session = getLoggedInUser()) {
    return session?.accessToken || session?.token || null
}

export function getAccount(session = getLoggedInUser()) {
    return session?.account || session?.user || session?.profile || null
}

export function getRole(session = getLoggedInUser()) {
    return getAccount(session)?.role || session?.role || null
}

export function isAuthenticated() {
    return Boolean(getAccessToken())
}

export function saveSession(payload) {
    const nextSession = normalizeSession(payload, getLoggedInUser() || {})
    localStorage.setItem(AUTH_KEY, JSON.stringify(nextSession))
    notifyAuthChanged()
    return nextSession
}

export function clearSession() {
    localStorage.removeItem(AUTH_KEY)
    notifyAuthChanged()
}

async function request(path, { method = 'POST', body, token } = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    try {
        const response = await fetch(`${BASE_URL}${path}`, {
            method,
            headers,
            ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        })

        if (response.status === 204) {
            return { success: true, data: null, error: null, status: response.status }
        }

        const json = await response.json().catch(() => null)

        if (!response.ok) {
            return { success: false, data: null, error: getErrorMessage(json, response.status), status: response.status }
        }

        return { success: true, data: unwrapResponse(json), error: null, raw: json, status: response.status }
    } catch (error) {
        return { success: false, data: null, error: error?.message || 'Network error' }
    }
}

export async function getMe() {
    const token = getAccessToken()
    if (!token) return { success: false, data: null, error: 'Missing access token' }

    const result = await request(endpoints.me, { method: 'GET', token })
    if (result.success) {
        const current = getLoggedInUser() || {}
        saveSession({ ...current, account: result.data })
    } else if (result.status === 401 || result.status === 403) {
        clearSession()
    }
    return result
}

export async function login(email, password) {
    const result = await request(endpoints.login, {
        body: { email: email.trim(), password },
    })

    if (!result.success) return result

    const session = saveSession(result.data)
    if (getAccessToken(session)) {
        await getMe()
    }

    return { ...result, data: getLoggedInUser() }
}

export async function registerCustomer(payload) {
    const result = await request(endpoints.registerCustomer, { body: payload })
    if (result.success) {
        setPendingVerificationEmail(payload.email)
    }
    return result
}

export async function registerShop(payload) {
    const result = await request(endpoints.registerShop, { body: payload })
    if (result.success) {
        setPendingVerificationEmail(payload.email)
    }
    return result
}

export async function registerShipper(payload) {
    return request(endpoints.registerShipper, { body: payload })
}

export async function verifyEmail(email, otp) {
    const result = await request(endpoints.verifyEmail, {
        body: { email: email.trim(), otp },
    })

    if (result.success) {
        sessionStorage.removeItem(PENDING_EMAIL_KEY)
        if (result.data && (typeof result.data === 'string' || result.data.accessToken || result.data.token)) {
            saveSession(result.data)
            await getMe()
        }
    }

    return result
}

export async function resendOtp(email) {
    return request(endpoints.resendOtp, { body: { email: email.trim() } })
}

export async function requestReactivation(payload) {
    return request(endpoints.reactivationRequest, { body: payload })
}

export async function logout() {
    const token = getAccessToken()
    clearSession()

    if (!token) return { success: true, data: null, error: null }
    return request(endpoints.logout, { token })
}

export function getDefaultPathForRole(role) {
    if (role === 'ADMIN') return '/admin/overview'
    if (role === 'SHOP_OWNER') return '/shop/overview'
    if (role === 'SHIPPER') return '/driver/overview'
    return '/all-shops'
}

export function setPendingVerificationEmail(email) {
    if (email) sessionStorage.setItem(PENDING_EMAIL_KEY, JSON.stringify(email))
}

export function getPendingVerificationEmail() {
    return readJson(PENDING_EMAIL_KEY, sessionStorage)
}

export function notifyAuthChanged() {
    window.dispatchEvent(new Event(AUTH_EVENT))
}

export function subscribeAuthChanged(callback) {
    const handler = () => callback(getLoggedInUser())
    window.addEventListener(AUTH_EVENT, handler)
    window.addEventListener('storage', handler)
    return () => {
        window.removeEventListener(AUTH_EVENT, handler)
        window.removeEventListener('storage', handler)
    }
}
