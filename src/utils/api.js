const DEFAULT_API_BASE_URL = 'http://localhost:8080'

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
    let session = null
    try {
        const stored = localStorage.getItem('laundrygo_auth')
        session = stored ? JSON.parse(stored) : null
    } catch {
        session = null
    }
    const token = session?.accessToken

    return apiRequest(path, {
        ...options,
        headers: {
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    })
}
