const RECENT_ORDER_KEY = 'laundrygo_recent_order'

const isBrowser = () => typeof window !== 'undefined'

export const saveRecentOrder = (orderState) => {
  if (!isBrowser() || !orderState?.orderId) return

  window.localStorage.setItem(
    RECENT_ORDER_KEY,
    JSON.stringify({
      ...orderState,
      savedAt: Date.now(),
    }),
  )
}

export const readRecentOrder = () => {
  if (!isBrowser()) return null

  try {
    const raw = window.localStorage.getItem(RECENT_ORDER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    window.localStorage.removeItem(RECENT_ORDER_KEY)
    return null
  }
}

export const clearRecentOrder = () => {
  if (!isBrowser()) return
  window.localStorage.removeItem(RECENT_ORDER_KEY)
}
