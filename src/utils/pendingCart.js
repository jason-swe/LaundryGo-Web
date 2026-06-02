const STORAGE_KEY = 'laundrygo_pending_cart'
const TTL_MS = 7 * 24 * 60 * 60 * 1000
export const PENDING_CART_EVENT = 'laundrygo:pending-cart-updated'

const isBrowser = () => typeof window !== 'undefined'

const emitPendingCartUpdate = () => {
  if (!isBrowser()) return
  window.dispatchEvent(new Event(PENDING_CART_EVENT))
}

export const readPendingCart = () => {
  if (!isBrowser()) return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const payload = JSON.parse(raw)
    if (!payload?.expiresAt || Date.now() > payload.expiresAt) {
      window.localStorage.removeItem(STORAGE_KEY)
      emitPendingCartUpdate()
      return null
    }

    return payload
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    emitPendingCartUpdate()
    return null
  }
}

export const savePendingCart = ({ shopId, shopName, cart }) => {
  if (!isBrowser()) return null

  const payload = {
    shopId,
    shopName,
    cart,
    updatedAt: Date.now(),
    expiresAt: Date.now() + TTL_MS,
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  emitPendingCartUpdate()
  return payload
}

export const clearPendingCart = () => {
  if (!isBrowser()) return
  window.localStorage.removeItem(STORAGE_KEY)
  emitPendingCartUpdate()
}

export const getPendingCartCount = (payload) =>
  Object.values(payload?.cart || {}).reduce((total, item) => total + (item.count || 0), 0)

export const getPendingCartSubtotal = (payload) =>
  Object.values(payload?.cart || {}).reduce(
    (total, item) => total + (item.count || 0) * (item.price || 0),
    0
  )
