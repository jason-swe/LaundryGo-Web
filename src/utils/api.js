/**
 * api.js — Base HTTP client for the LaundryGo backend.
 *
 * Reads the JWT from localStorage key 'laundrygo_auth' (set when
 * the shop owner logs in via the BE login endpoint).
 *
 * Every function returns { data, error } so callers can handle both
 * success and failure without try/catch boilerplate.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// ── Token helpers ─────────────────────────────────────────────────────────────

/**
 * Returns the stored JWT access token, or null if none exists.
 * The token is stored under 'laundrygo_auth' as { accessToken, ... }
 * by the BE login response handler.
 */
function getToken() {
    try {
        const raw = localStorage.getItem('laundrygo_auth')
        if (!raw) return null
        const parsed = JSON.parse(raw)
        // Support both { accessToken } and { token } shapes
        return parsed?.accessToken || parsed?.token || null
    } catch {
        return null
    }
}

// ── Core request ──────────────────────────────────────────────────────────────

/**
 * Makes a fetch request to the backend.
 *
 * @param {string} path      - API path, e.g. '/api/v1/shop-owner/services'
 * @param {object} [options] - fetch options (method, body, etc.)
 * @returns {Promise<{ data: any|null, error: string|null }>}
 */
async function request(path, options = {}) {
    const token = getToken()
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    }

    try {
        const response = await fetch(`${BASE_URL}${path}`, {
            ...options,
            headers,
        })

        // 204 No Content — success with no body
        if (response.status === 204) {
            return { data: null, error: null }
        }

        const json = await response.json()

        if (!response.ok) {
            // Backend uses { message, code } in error responses
            const message =
                json?.message ||
                json?.error ||
                `Request failed with status ${response.status}`
            return { data: null, error: message }
        }

        // Backend wraps successful responses in { success, message, data }
        return { data: json?.data ?? json, error: null }
    } catch (err) {
        return { data: null, error: err?.message || 'Network error' }
    }
}

// ── Convenience methods ───────────────────────────────────────────────────────

export const api = {
    get: (path) => request(path, { method: 'GET' }),

    post: (path, body) =>
        request(path, { method: 'POST', body: JSON.stringify(body) }),

    put: (path, body) =>
        request(path, { method: 'PUT', body: JSON.stringify(body) }),

    patch: (path, body) =>
        request(path, { method: 'PATCH', body: JSON.stringify(body) }),

    delete: (path) => request(path, { method: 'DELETE' }),
}
