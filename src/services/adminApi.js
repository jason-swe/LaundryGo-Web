import { authenticatedApiRequest } from '../utils/api'

const unwrapData = (payload) => payload?.data ?? payload

const buildQueryString = (params = {}) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value))
    }
  })

  return query.toString()
}

const unwrapListData = (payload) => {
  const data = unwrapData(payload)
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.content)) return data.content
  if (Array.isArray(data?.data)) return data.data
  return []
}

export async function getAdminVouchers(params = {}) {
  const query = buildQueryString(params)
  const path = query ? `/api/v1/admin/vouchers?${query}` : '/api/v1/admin/vouchers'
  const payload = await authenticatedApiRequest(path)
  return unwrapData(payload) || { items: [] }
}

export async function getAdminAccounts(params = {}) {
  const query = buildQueryString(params)
  const path = query ? `/api/v1/admin/accounts?${query}` : '/api/v1/admin/accounts'
  const payload = await authenticatedApiRequest(path)
  return unwrapData(payload) || { items: [] }
}

export async function getAdminVoucherById(voucherId) {
  const payload = await authenticatedApiRequest(`/api/v1/admin/vouchers/${voucherId}`)
  return unwrapData(payload)
}

export async function createAdminVoucher(voucher) {
  const payload = await authenticatedApiRequest('/api/v1/admin/vouchers', {
    method: 'POST',
    body: JSON.stringify(voucher),
  })
  return unwrapData(payload)
}

export async function updateAdminVoucher(voucherId, voucher) {
  const payload = await authenticatedApiRequest(`/api/v1/admin/vouchers/${voucherId}`, {
    method: 'PUT',
    body: JSON.stringify(voucher),
  })
  return unwrapData(payload)
}

export async function deleteAdminVoucher(voucherId) {
  const payload = await authenticatedApiRequest(`/api/v1/admin/vouchers/${voucherId}`, {
    method: 'DELETE',
  })
  return unwrapData(payload)
}

export async function toggleAdminVoucherStatus(voucherId) {
  const payload = await authenticatedApiRequest(`/api/v1/admin/vouchers/${voucherId}/toggle`, {
    method: 'PATCH',
  })
  return unwrapData(payload)
}

export async function deleteAdminAccount(accountId) {
  const payload = await authenticatedApiRequest(`/api/v1/admin/accounts/${accountId}`, {
    method: 'DELETE',
  })
  return unwrapData(payload)
}

export async function reactivateAdminAccount(accountId) {
  const payload = await authenticatedApiRequest(`/api/v1/admin/accounts/${accountId}/reactivate`, {
    method: 'POST',
  })
  return unwrapData(payload)
}