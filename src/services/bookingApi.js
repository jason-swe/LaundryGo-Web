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
