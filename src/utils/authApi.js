/**
 * authApi.js — API service functions for Authentication endpoints.
 *
 * Follows the same pattern as shopOwnerApi.js: thin wrappers around the
 * shared `api` client so every auth call goes through the same base URL,
 * headers, and { data, error } response shape.
 *
 * Endpoints:
 *   POST /api/v1/auth/login          — email + password login
 *   POST /api/v1/auth/register       — customer registration
 *   POST /api/v1/auth/verify-email   — OTP email verification
 *   POST /api/v1/auth/resend-otp     — resend verification OTP
 *   POST /api/v1/auth/logout         — invalidate current JWT
 *   GET  /api/v1/auth/me             — get current authenticated user
 */

import { api } from './api'

const BASE = '/api/v1/auth'

export const authApi = {
    /** POST /api/v1/auth/login */
    login: (payload) => api.post(`${BASE}/login`, payload),

    /** POST /api/v1/auth/register */
    register: (payload) => api.post(`${BASE}/register`, payload),

    /** POST /api/v1/auth/verify-email */
    verifyEmail: (payload) => api.post(`${BASE}/verify-email`, payload),

    /** POST /api/v1/auth/resend-otp */
    resendOtp: (payload) => api.post(`${BASE}/resend-otp`, payload),

    /** POST /api/v1/auth/logout */
    logout: () => api.post(`${BASE}/logout`),

    /** GET /api/v1/auth/me */
    me: () => api.get(`${BASE}/me`),
}
