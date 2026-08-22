import { authenticatedApiRequest } from '../utils/api'

const unwrapData = (payload) => payload?.data ?? payload

export async function getPaymentByOrderId(orderId) {
  const payload = await authenticatedApiRequest(`/api/v1/payments/${orderId}`)
  return unwrapData(payload)
}

export async function createBankTransferPayment(orderId, { idempotencyKey } = {}) {
  const payload = await authenticatedApiRequest(`/api/v1/payments/${orderId}/bank-transfer`, {
    method: 'POST',
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
    body: JSON.stringify({}),
  })
  return unwrapData(payload)
}

export async function reportPaymentPaid(paymentId, { evidenceFile, note, transactionReference } = {}) {
  const formData = new FormData()
  if (evidenceFile) formData.append('evidenceFile', evidenceFile)
  if (note?.trim()) formData.append('note', note.trim())
  if (transactionReference?.trim()) formData.append('transactionReference', transactionReference.trim())

  const payload = await authenticatedApiRequest(`/api/v1/payments/${paymentId}/report-paid`, {
    method: 'POST',
    body: formData,
  })
  return unwrapData(payload)
}
