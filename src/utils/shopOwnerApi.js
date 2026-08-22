/**
 * shopOwnerApi.js — API service functions for the Shop Owner Operations page.
 *
 * All endpoints require a valid SHOP_OWNER JWT (injected automatically by api.js).
 *
 * Services  → GET/POST/PUT/PATCH/DELETE /api/v1/shop-owner/services
 * Machines  → GET/POST/PUT/DELETE        /api/v1/shop-owner/machines
 * Inventory → GET/POST/PUT/DELETE        /api/v1/shop-owner/inventory
 */

import { api } from './api'

const BASE = '/api/v1/shop-owner'

// ── Services ──────────────────────────────────────────────────────────────────

export const serviceApi = {
    /** GET  /api/v1/shop-owner/services */
    list: () => api.get(`${BASE}/services`),

    /** POST /api/v1/shop-owner/services */
    create: (payload) => api.post(`${BASE}/services`, payload),

    /** PUT  /api/v1/shop-owner/services/{id} */
    update: (id, payload) => api.put(`${BASE}/services/${id}`, payload),

    /** PATCH /api/v1/shop-owner/services/{id}/availability */
    toggleAvailability: (id, available) =>
        api.patch(`${BASE}/services/${id}/availability`, { available }),

    /** DELETE /api/v1/shop-owner/services/{id} */
    remove: (id) => api.delete(`${BASE}/services/${id}`),
}

// ── Service Categories ────────────────────────────────────────────────────────

export const categoryApi = {
    /** GET /api/v1/shop-owner/services/categories — returns [{ id, name }] for this shop */
    listMine: () => api.get(`${BASE}/services/categories`),
}

// ── Machines ──────────────────────────────────────────────────────────────────

export const machineApi = {
    /** GET  /api/v1/shop-owner/machines */
    list: () => api.get(`${BASE}/machines`),

    /** POST /api/v1/shop-owner/machines */
    create: (payload) => api.post(`${BASE}/machines`, payload),

    /** PUT  /api/v1/shop-owner/machines/{id} */
    update: (id, payload) => api.put(`${BASE}/machines/${id}`, payload),

    /** DELETE /api/v1/shop-owner/machines/{id} */
    remove: (id) => api.delete(`${BASE}/machines/${id}`),
}

// ── Inventory (Supplies) ──────────────────────────────────────────────────────

export const inventoryApi = {
    /** GET  /api/v1/shop-owner/inventory */
    list: () => api.get(`${BASE}/inventory`),

    /** POST /api/v1/shop-owner/inventory */
    create: (payload) => api.post(`${BASE}/inventory`, payload),

    /** PUT  /api/v1/shop-owner/inventory/{id} */
    update: (id, payload) => api.put(`${BASE}/inventory/${id}`, payload),

    /** DELETE /api/v1/shop-owner/inventory/{id} */
    remove: (id) => api.delete(`${BASE}/inventory/${id}`),
}
