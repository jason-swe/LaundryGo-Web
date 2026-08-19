import { authenticatedApiRequest } from '../utils/api'

const unwrapData = (payload) => payload?.data ?? payload

const API_TO_VIEW_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PICKING_UP: 'picking-up',
  AT_STORE: 'at-store',
  WASHING: 'washing',
  DRYING: 'drying',
  IRONING: 'ironing',
  READY_FOR_DELIVERY: 'ready',
  DELIVERING: 'delivering',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  WAITING_CUSTOMER_CONFIRMATION: 'waiting-customer-confirmation',
  CANCELLED_AFTER_WEIGHT_CONFIRMATION: 'cancelled-after-weight-confirmation',
}

const VIEW_TO_API_STATUS = {
  pending: 'PENDING',
  confirmed: 'CONFIRMED',
  'picking-up': 'PICKING_UP',
  'at-store': 'AT_STORE',
  washing: 'WASHING',
  drying: 'DRYING',
  ironing: 'IRONING',
  ready: 'READY_FOR_DELIVERY',
  delivering: 'DELIVERING',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
  'waiting-customer-confirmation': 'WAITING_CUSTOMER_CONFIRMATION',
  'cancelled-after-weight-confirmation': 'CANCELLED_AFTER_WEIGHT_CONFIRMATION',
}

const PAID_PAYMENT_STATUSES = new Set(['PAID', 'SHOP_CONFIRMED', 'COMPLETED', 'REFUNDED'])

export function toApiOrderStatus(status) {
  return VIEW_TO_API_STATUS[status] || status
}

function toViewStatus(status) {
  const normalizedStatus = String(status || '').toUpperCase().replace(/-/g, '_')
  return API_TO_VIEW_STATUS[normalizedStatus] || status || 'pending'
}

export function mapShopOwnerOrder(item = {}) {
  const rawStatus = String(item.rawStatus || item.status || '').toUpperCase().replace(/-/g, '_')
  const rawPaymentStatus = String(item.paymentStatus || '').toUpperCase()
  return {
    ...item,
    apiId: String(item.id || '').replace(/\D/g, '') || item.id,
    id: item.id || '',
    customer: item.customer || '',
    phone: item.phone || '',
    service: item.service || '',
    rawStatus,
    status: toViewStatus(rawStatus),
    rawPaymentStatus,
    paymentStatus: PAID_PAYMENT_STATUSES.has(rawPaymentStatus) ? 'paid' : 'pending',
    estimatedPrice: item.estimatedPrice || '',
    priority: item.priority || 'normal',
    pickupTime: item.pickupTime || '',
    items: item.items || [],
  }
}

export async function getShopOwnerOrders({ statuses, keyword, page = 0, size = 50 } = {}) {
  const params = new URLSearchParams()
  if (statuses?.length) {
    params.set('statuses', statuses.map(toApiOrderStatus).join(','))
  }
  if (keyword) params.set('keyword', keyword)
  params.set('page', String(page))
  params.set('size', String(size))

  const payload = await authenticatedApiRequest(`/api/v1/shop-owner/orders?${params}`)
  const pageData = unwrapData(payload) || {}
  return {
    ...pageData,
    items: (pageData.items || []).map(mapShopOwnerOrder),
  }
}

export async function getShopOwnerOrderDetail(orderId) {
  const payload = await authenticatedApiRequest(`/api/v1/shop-owner/orders/${orderId}`)
  return mapShopOwnerOrder(unwrapData(payload) || {})
}

export async function getShopOwnerOrderInspection(orderId) {
  const payload = await authenticatedApiRequest(`/api/v1/shop-owner/orders/${orderId}/inspection`)
  return unwrapData(payload)
}

export async function saveShopOwnerOrderInspectionDraft(orderId, items) {
  const payload = await authenticatedApiRequest(`/api/v1/shop-owner/orders/${orderId}/inspection/draft`, {
    method: 'PUT',
    body: JSON.stringify({ items }),
  })
  return unwrapData(payload)
}

export async function submitShopOwnerOrderInspection(orderId, items) {
  const payload = await authenticatedApiRequest(`/api/v1/shop-owner/orders/${orderId}/inspection/submit`, {
    method: 'POST',
    body: JSON.stringify({ items }),
  })
  return unwrapData(payload)
}

export async function updateShopOwnerOrderStatus(orderId, status) {
  const payload = await authenticatedApiRequest(`/api/v1/shop-owner/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ newStatus: toApiOrderStatus(status) }),
  })
  return unwrapData(payload)
}

export async function confirmShopOwnerPayment(paymentId, confirmationNote = '') {
  const payload = await authenticatedApiRequest(`/api/v1/shop-owners/payments/${paymentId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ confirmationNote: confirmationNote.trim() || null }),
  })
  return unwrapData(payload)
}

export async function rejectShopOwnerPayment(paymentId, rejectReason) {
  const payload = await authenticatedApiRequest(`/api/v1/shop-owners/payments/${paymentId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ rejectReason: rejectReason.trim() }),
  })
  return unwrapData(payload)
}
