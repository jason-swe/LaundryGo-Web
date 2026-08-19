import { apiRequest, authenticatedApiRequest } from '../utils/api'

const unwrapData = (payload) => payload?.data ?? payload

export async function getShopVouchers(shopId) {
  const payload = await apiRequest(`/api/v1/vouchers/shops/${encodeURIComponent(shopId)}`)
  const vouchers = unwrapData(payload)
  return Array.isArray(vouchers) ? vouchers : []
}

export async function validateVoucher({ code, shopId, orderSubtotal }) {
  const payload = await authenticatedApiRequest('/api/v1/vouchers/validate', {
    method: 'POST',
    body: JSON.stringify({ code, shopId, orderSubtotal }),
  })
  return unwrapData(payload)
}
