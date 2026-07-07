import { authenticatedApiRequest } from '../utils/api'

const unwrapData = (payload) => payload?.data ?? payload

export const getDeliveryAddresses = async () => {
  const payload = await authenticatedApiRequest('/api/v1/delivery-addresses')
  return unwrapData(payload) || []
}

export const createDeliveryAddress = async (address) => {
  const payload = await authenticatedApiRequest('/api/v1/delivery-addresses', {
    method: 'POST',
    body: JSON.stringify(address),
  })
  return unwrapData(payload)
}

export const getDeliveryAddress = async (addressId) => {
  const payload = await authenticatedApiRequest(`/api/v1/delivery-addresses/${addressId}`)
  return unwrapData(payload)
}

export const updateDeliveryAddress = async (addressId, address) => {
  const payload = await authenticatedApiRequest(`/api/v1/delivery-addresses/${addressId}`, {
    method: 'PUT',
    body: JSON.stringify(address),
  })
  return unwrapData(payload)
}

export const deleteDeliveryAddress = async (addressId) => {
  const payload = await authenticatedApiRequest(`/api/v1/delivery-addresses/${addressId}`, {
    method: 'DELETE',
  })
  return unwrapData(payload)
}

export const getPickupDates = async () => {
  const payload = await authenticatedApiRequest('/api/v1/schedules/pickup-dates')
  return unwrapData(payload) || []
}

export const getPickupSlots = async (pickupDate) => {
  const query = new URLSearchParams({ pickupDate })
  const payload = await authenticatedApiRequest(`/api/v1/schedules/pickup-slots?${query}`)
  return unwrapData(payload) || []
}

export const getDeliveryDates = async (pickupDate, pickupSlot) => {
  const query = new URLSearchParams({ pickupDate, pickupSlot })
  const payload = await authenticatedApiRequest(`/api/v1/schedules/delivery-dates?${query}`)
  return unwrapData(payload) || []
}

export const getDeliverySlots = async (pickupDate, pickupSlot, deliveryDate) => {
  const query = new URLSearchParams({ pickupDate, pickupSlot, deliveryDate })
  const payload = await authenticatedApiRequest(`/api/v1/schedules/delivery-slots?${query}`)
  return unwrapData(payload) || []
}

export const getOrderSummary = async (items) => {
  const payload = await authenticatedApiRequest('/api/v1/orders/summary', {
    method: 'POST',
    body: JSON.stringify({ items }),
  })
  return unwrapData(payload)
}

export const getPaymentMethods = async () => {
  const payload = await authenticatedApiRequest('/api/v1/orders/payment-methods')
  return unwrapData(payload) || []
}

export const createOrder = async (order) => {
  const payload = await authenticatedApiRequest('/api/v1/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  })
  return unwrapData(payload)
}

export const getOrderDetail = async (orderId) => {
  const payload = await authenticatedApiRequest(`/api/v1/orders/${orderId}`)
  return unwrapData(payload)
}

export const updateOrder = async (orderId, order) => {
  const payload = await authenticatedApiRequest(`/api/v1/orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify(order),
  })
  return unwrapData(payload)
}

export const updateOrderPaymentMethod = async (orderId, paymentMethod) => {
  const payload = await authenticatedApiRequest(`/api/v1/orders/${orderId}/payment-method`, {
    method: 'PUT',
    body: JSON.stringify({ paymentMethod }),
  })
  return unwrapData(payload)
}

export const cancelOrder = async (orderId) => {
  const payload = await authenticatedApiRequest(`/api/v1/orders/${orderId}/cancel`, {
    method: 'POST',
  })
  return unwrapData(payload)
}

export const getMyOrders = async ({ page = 0, size = 20 } = {}) => {
  const query = new URLSearchParams({ page: String(page), size: String(size) })
  const payload = await authenticatedApiRequest(`/api/v1/orders?${query}`)
  return unwrapData(payload) || { items: [] }
}
