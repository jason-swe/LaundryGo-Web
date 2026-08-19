import { authenticatedApiRequest } from '../utils/api'

const unwrapData = (payload) => payload?.data ?? payload

export async function getPaymentByOrderId(orderId) {
  const payload = await authenticatedApiRequest(`/api/v1/payments/${orderId}`)
  return unwrapData(payload)
}

export async function previewPayment(orderId, voucherCode) {
  const payload = await authenticatedApiRequest('/api/v1/payments/preview', {
    method: 'POST',
    body: JSON.stringify({ orderId, voucherCode: voucherCode || null }),
  })
  return unwrapData(payload)
}

export async function createBankTransferPayment(orderId, { voucherCode, idempotencyKey } = {}) {
  const payload = await authenticatedApiRequest(`/api/v1/payments/${orderId}/bank-transfer`, {
    method: 'POST',
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
    body: JSON.stringify({ voucherCode: voucherCode || null }),
  })
  return unwrapData(payload)
}

export async function uploadPaymentEvidence(paymentId, file) {
  const formData = new FormData()
  formData.append('file', file)
  const payload = await authenticatedApiRequest(`/api/v1/payments/${paymentId}/evidence`, {
    method: 'POST',
    body: formData,
  })
  return unwrapData(payload)
}

export async function reportPaymentPaid(paymentId, { evidenceUrl, note, transactionReference } = {}) {
  const payload = await authenticatedApiRequest(`/api/v1/payments/${paymentId}/report-paid`, {
    method: 'POST',
    body: JSON.stringify({
      evidenceUrl,
      note: note?.trim() || null,
      transactionReference: transactionReference?.trim() || null,
    }),
  })
  return unwrapData(payload)
}
