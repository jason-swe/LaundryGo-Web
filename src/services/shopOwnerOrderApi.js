import { authenticatedApiRequest } from '../utils/api'

const unwrapData = (payload) => payload?.data ?? payload

const API_TO_VIEW_STATUS = {
  CONFIRMED: 'pending-checkin',
  PENDING: 'pending-checkin',
  WASHING: 'washing',
  DRYING: 'drying',
  IRONING: 'ironing',
  READY_FOR_PICKUP: 'ready',
  PICKING_UP: 'pending-checkin',
  AT_STORE: 'pending-checkin',
  DELIVERING: 'delivering',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

const VIEW_TO_API_STATUS = {
  'pending-checkin': 'CONFIRMED',
  washing: 'WASHING',
  drying: 'DRYING',
  ironing: 'IRONING',
  ready: 'READY_FOR_PICKUP',
  delivering: 'DELIVERING',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
}

const DEFAULT_SHOP_OWNER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PICKING_UP',
  'AT_STORE',
  'WASHING',
  'DRYING',
  'IRONING',
  'READY_FOR_PICKUP',
  'DELIVERING',
  'COMPLETED',
  'CANCELLED',
]

export function toApiOrderStatus(status) {
  return VIEW_TO_API_STATUS[status] || status
}

function toViewStatus(status) {
  return API_TO_VIEW_STATUS[String(status || '').toUpperCase()] || status || 'pending-checkin'
}

export function mapShopOwnerOrder(item = {}) {
  const rawPaymentStatus = String(item.paymentStatus || '').toUpperCase()
  return {
    ...item,
    apiId: String(item.id || '').replace(/\D/g, '') || item.id,
    id: item.id || '',
    customer: item.customer || '',
    phone: item.phone || '',
    service: item.service || '',
    status: toViewStatus(item.status),
    paymentStatus: rawPaymentStatus === 'COMPLETED' || rawPaymentStatus === 'PAID' ? 'paid' : 'pending',
    estimatedPrice: item.estimatedPrice || '',
    priority: item.priority || 'normal',
    pickupTime: item.pickupTime || '',
    items: item.items || [],
  }
}

export async function getShopOwnerOrders({ statuses, keyword, page = 0, size = 50 } = {}) {
  const params = new URLSearchParams()
  const requestedStatuses = statuses?.length ? statuses : DEFAULT_SHOP_OWNER_STATUSES
  requestedStatuses.forEach((status) => params.append('statuses', toApiOrderStatus(status)))
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

export async function updateShopOwnerOrderStatus(orderId, status) {
  const payload = await authenticatedApiRequest(`/api/v1/shop-owner/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ newStatus: toApiOrderStatus(status) }),
  })
  return unwrapData(payload)
}
