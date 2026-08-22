import { authenticatedApiRequest } from '../utils/api'

export const CART_EVENT = 'laundrygo:cart-updated'

const unwrapData = (payload) => payload?.data ?? payload

const emitCartUpdate = () => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(CART_EVENT))
}

const unitToPricingType = (item = {}) => {
  const raw = String(item.unit || item.serviceUnit || '').toLowerCase()
  if (raw.includes('kg') || raw.includes('kilo')) return 'kg'
  if (raw.includes('meter') || raw === 'm') return 'meter'
  return 'item'
}

export const mapCartItemToView = (item = {}) => {
  const label = item.serviceName || `Service #${item.serviceId || item.cartItemId || ''}`
  const price = Number(item.unitPrice ?? item.pricePerKg ?? 0)

  return {
    cartItemId: item.cartItemId,
    serviceId: item.serviceId,
    label,
    count: Number(item.quantity || 0),
    price,
    pricingType: unitToPricingType(item),
    lineTotal: Number(item.lineTotal || 0),
    shopId: item.shopId,
    shopName: item.shopName,
    description: item.serviceDescription || '',
  }
}

export const mapCartToView = (payload) => {
  const cart = unwrapData(payload) || {}
  const items = Array.isArray(cart.items) ? cart.items.map(mapCartItemToView) : []
  const keyedCart = items.reduce((acc, item) => {
    acc[item.label] = item
    return acc
  }, {})

  return {
    cartId: cart.cartId,
    accountId: cart.accountId,
    shopId: cart.shopId ?? items[0]?.shopId,
    shopName: cart.shopName ?? items[0]?.shopName,
    subtotal: Number(cart.subtotal || items.reduce((total, item) => total + item.count * item.price, 0)),
    expiresAt: cart.expiresAt,
    totalServices: Number(cart.totalServices || items.length),
    totalItems: Number(cart.totalItems || items.reduce((total, item) => total + item.count, 0)),
    items,
    cart: keyedCart,
  }
}

export async function getCart() {
  const payload = await authenticatedApiRequest('/api/v1/cart')
  return mapCartToView(payload)
}

export async function addCartItem(serviceId, quantity = 1) {
  const payload = await authenticatedApiRequest('/api/v1/cart/items', {
    method: 'POST',
    body: JSON.stringify({ serviceId, quantity }),
  })
  const cart = mapCartToView(payload)
  emitCartUpdate()
  return cart
}

export async function updateCartItemQuantity(cartItemId, quantity) {
  const payload = await authenticatedApiRequest(`/api/v1/cart/items/${cartItemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  })
  const cart = mapCartToView(payload)
  emitCartUpdate()
  return cart
}

export async function updateCartItemService(cartItemId, serviceId) {
  const payload = await authenticatedApiRequest('/api/v1/cart/services', {
    method: 'PUT',
    body: JSON.stringify({ cartItemId, serviceId }),
  })
  const cart = mapCartToView(payload)
  emitCartUpdate()
  return cart
}

export async function deleteCartItem(cartItemId) {
  const payload = await authenticatedApiRequest(`/api/v1/cart/items/${cartItemId}`, {
    method: 'DELETE',
  })
  const cart = mapCartToView(payload)
  emitCartUpdate()
  return cart
}

export async function clearCart() {
  const payload = await authenticatedApiRequest('/api/v1/cart', { method: 'DELETE' })
  const cart = mapCartToView(payload)
  emitCartUpdate()
  return cart
}

export async function createOrderFromCart(order) {
  const payload = await authenticatedApiRequest('/api/v1/cart/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  })
  emitCartUpdate()
  return unwrapData(payload)
}
