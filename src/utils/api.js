const DEFAULT_API_BASE_URL = 'http://localhost:8080'

export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || DEFAULT_API_BASE_URL

export async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
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
    let session = null
    try {
        const stored = localStorage.getItem('laundrygo_auth')
        session = stored ? JSON.parse(stored) : null
    } catch {
        session = null
    }
    const token = session?.accessToken

    // If we're in demo/local mode (token === 'demo'), short-circuit some
    // authenticated endpoints and return mock data from localStorage so the
    // app doesn't spam 401/403 requests in demo mode.
    if (token === 'demo') {
        // Provide a minimal response shape similar to backend
        // session -> contains accountId/fullName/email/phone/city/district
        const makeProfilePayload = () => ({
            success: true,
            data: {
                accountId: session.accountId || session.id,
                fullName: session.fullName || session.name || '',
                email: session.email || '',
                phone: session.phone || '',
                address: session.address || '',
                city: session.city || '',
                district: session.district || '',
            },
        })

        const defaultSummary = { activeOrderCount: 0, savedAddressCount: 0, totalCleanedKg: 0, recentOrder: null }

        // Normalize path without query
        const p = path.split('?')[0]
        if (p === '/api/v1/users/profile') return makeProfilePayload()
        if (p === '/api/v1/users/profile/summary') return { success: true, data: defaultSummary }

        // For other authenticated endpoints, return a generic success with null data
        return { success: true, data: null }
    }

    return apiRequest(path, {
        ...options,
        headers: {
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    })
}
