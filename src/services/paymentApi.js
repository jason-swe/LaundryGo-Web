import { authenticatedApiRequest } from '../utils/api'

const unwrapData = (payload) => payload?.data ?? payload

export async function getPaymentByOrderId(orderId) {
  const payload = await authenticatedApiRequest(`/api/v1/payments/${orderId}`)
  return unwrapData(payload)
}

export async function createCheckoutUrl(orderId) {
  const payload = await authenticatedApiRequest('/api/v1/payments/create-url', {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  })
  return unwrapData(payload)
}

export async function confirmCashPayment(orderId) {
  const payload = await authenticatedApiRequest(`/api/v1/payments/${orderId}/confirm-cash`, {
    method: 'POST',
  })
  return unwrapData(payload)
}
