const DEFAULT_API_BASE_URL = 'https://laundrygo-be.onrender.com'
const AUTH_STORAGE_KEY = 'laundrygo_auth'

let refreshPromise = null

export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || DEFAULT_API_BASE_URL

export async function apiRequest(path, options = {}) {
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
            ...(options.headers || {}),
        },
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok || payload?.success === false) {
        const error = new Error(payload?.message || 'Request failed')
        error.status = response.status
        error.code = payload?.errorCode
        throw error
    }

    return payload
}

export async function authenticatedApiRequest(path, options = {}) {
    const session = readSession()

    try {
        return await requestWithAccessToken(path, options, session?.accessToken)
    } catch (error) {
        if (!isAuthenticationFailure(error)) {
            throw error
        }

        try {
            const refreshedSession = await refreshSession(session)
            return await requestWithAccessToken(path, options, refreshedSession.accessToken)
        } catch {
            clearExpiredSession()
            const sessionError = new Error('Your session has expired. Please sign in again.')
            sessionError.status = 401
            sessionError.code = 'UNAUTHENTICATED'
            throw sessionError
        }
    }
}

function readSession() {
    try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY)
        return stored ? JSON.parse(stored) : null
    } catch {
        return null
    }
}

function requestWithAccessToken(path, options, accessToken) {
    return apiRequest(path, {
        ...options,
        headers: {
            ...(options.headers || {}),
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
    })
}

function isAuthenticationFailure(error) {
    return error?.status === 401 || error?.status === 403
}

async function refreshSession(session) {
    if (!session?.refreshToken) {
        throw new Error('No refresh token available')
    }

    if (!refreshPromise) {
        refreshPromise = apiRequest('/api/v1/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken: session.refreshToken }),
        })
            .then((payload) => {
                const data = payload?.data
                if (!data?.accessToken || !data?.refreshToken) {
                    throw new Error('Invalid refresh response')
                }

                const account = data.account || {}
                const refreshedSession = {
                    ...session,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                    id: account.accountId ?? session.id,
                    accountId: account.accountId ?? session.accountId,
                    email: account.email ?? session.email,
                    name: account.fullName ?? session.name,
                    fullName: account.fullName ?? session.fullName,
                    phone: account.phone ?? session.phone,
                    role: account.role ?? session.role,
                    status: account.status ?? session.status,
                }
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(refreshedSession))
                return refreshedSession
            })
            .finally(() => {
                refreshPromise = null
            })
    }

    return refreshPromise
}

function clearExpiredSession() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(AUTH_STORAGE_KEY)
    window.dispatchEvent(new Event('laundrygo:auth-expired'))
}

// Compatibility client for the service wrappers introduced on main. The
// primary request helpers above keep their throwing semantics; this facade
// exposes the `{ data, error }` shape those wrappers expect.
async function requestWithStoredSession(path, options = {}) {
    const session = readSession()

    try {
        const payload = await apiRequest(path, {
            ...options,
            headers: {
                ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
                ...(options.headers || {}),
            },
        })

        return { data: payload?.data ?? payload, error: null }
    } catch (error) {
        return { data: null, error: error?.message || 'Network error' }
    }
}

export const api = {
    get: (path) => requestWithStoredSession(path, { method: 'GET' }),
    post: (path, body) => requestWithStoredSession(path, {
        method: 'POST',
        body: body === undefined ? undefined : JSON.stringify(body),
    }),
    put: (path, body) => requestWithStoredSession(path, {
        method: 'PUT',
        body: JSON.stringify(body),
    }),
    patch: (path, body) => requestWithStoredSession(path, {
        method: 'PATCH',
        body: JSON.stringify(body),
    }),
    delete: (path) => requestWithStoredSession(path, { method: 'DELETE' }),
}
