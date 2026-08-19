import { authenticatedApiRequest } from '../utils/api'

function unwrap(payload, fallback = null) {
    return payload?.data ?? fallback
}

export async function getOrderRating(orderId) {
    const payload = await authenticatedApiRequest(`/api/v1/ratings/orders/${orderId}`)
    return unwrap(payload)
}

export async function submitRating({ orderId, shopScore, shopComment, shipperScore, shipperComment }) {
    const payload = await authenticatedApiRequest('/api/v1/ratings', {
        method: 'POST',
        body: JSON.stringify({
            orderId,
            shopScore: shopScore || null,
            shopComment: shopComment?.trim() || null,
            shipperScore: shipperScore || null,
            shipperComment: shipperComment?.trim() || null,
        }),
    })
    return unwrap(payload)
}

export async function getShopRatingSummary(shopId) {
    const payload = await authenticatedApiRequest(`/api/v1/ratings/shops/${shopId}/summary`)
    return unwrap(payload, { average: 0, totalReviews: 0 })
}
