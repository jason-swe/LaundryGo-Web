import { authenticatedApiRequest } from '../utils/api'

const unwrapData = (payload) => payload?.data ?? payload

export async function getShopStatements() {
  const payload = await authenticatedApiRequest('/api/v1/shop-owners/statements')
  const data = unwrapData(payload)
  return Array.isArray(data) ? data : []
}

export async function getShopStatement(statementId) {
  const payload = await authenticatedApiRequest(`/api/v1/shop-owners/statements/${statementId}`)
  return unwrapData(payload)
}

export async function uploadSettlementEvidence(statementId, file) {
  const formData = new FormData()
  formData.append('file', file)
  const payload = await authenticatedApiRequest(`/api/v1/shop-owners/statements/${statementId}/evidence`, {
    method: 'POST',
    body: formData,
  })
  return unwrapData(payload)
}

export async function submitSettlement(statementId, data) {
  const payload = await authenticatedApiRequest(`/api/v1/shop-owners/statements/${statementId}/settlements`, {
    method: 'POST',
    body: JSON.stringify({
      amount: data.amount,
      transactionReference: data.transactionReference?.trim() || null,
      payerBankName: data.payerBankName?.trim() || null,
      proofImageUrl: data.proofImageUrl,
    }),
  })
  return unwrapData(payload)
}
