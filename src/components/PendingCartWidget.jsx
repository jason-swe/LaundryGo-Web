import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ShoppingCart, Trash2, X } from 'lucide-react'
import { localizePath, useTranslation } from '../shared/lib/i18n'
import {
  clearPendingCart,
  getPendingCartCount,
  getPendingCartSubtotal,
  PENDING_CART_EVENT,
  readPendingCart,
} from '../utils/pendingCart'
import './PendingCartWidget.css'

function PendingCartWidget({ inline = false }) {
  const navigate = useNavigate()
  const { language, t } = useTranslation()
  const [cartPayload, setCartPayload] = useState(() => readPendingCart())
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const syncCart = () => {
      const nextCart = readPendingCart()
      setCartPayload(nextCart)
      if (!nextCart) setIsOpen(false)
    }

    window.addEventListener(PENDING_CART_EVENT, syncCart)
    window.addEventListener('storage', syncCart)
    return () => {
      window.removeEventListener(PENDING_CART_EVENT, syncCart)
      window.removeEventListener('storage', syncCart)
    }
  }, [])

  const items = useMemo(() => Object.entries(cartPayload?.cart || {}), [cartPayload])
  const itemCount = getPendingCartCount(cartPayload)
  const subtotal = getPendingCartSubtotal(cartPayload)

  const formatVnd = (value) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  if (!cartPayload || itemCount === 0) return null

  const expiryDate = new Date(cartPayload.expiresAt)
  const expiryLabel =
    language === 'vi'
      ? expiryDate.toLocaleDateString('vi-VN')
      : expiryDate.toLocaleDateString('en-US')

  const continueSchedule = () => {
    setIsOpen(false)
    navigate(localizePath(`/all-shops/${cartPayload.shopId}/schedule`, language), {
      state: { cart: cartPayload.cart },
    })
  }

  const clearCart = () => {
    clearPendingCart()
    setCartPayload(null)
  }

  return (
    <div className={`pending-cart-widget${isOpen ? ' is-open' : ''}${inline ? ' is-inline' : ''}`}>
      <button
        className="pending-cart-fab"
        type="button"
        aria-label={t('pendingCart.open')}
        onClick={() => setIsOpen((value) => !value)}
      >
        <ShoppingCart size={21} strokeWidth={1.9} />
        <span className="pending-cart-count">{itemCount}</span>
      </button>

      {isOpen && (
        <section className="pending-cart-panel" aria-label={t('pendingCart.title')}>
          <div className="pending-cart-head">
            <div>
              <p className="pending-cart-eyebrow">{t('pendingCart.pending')}</p>
              <h2>{t('pendingCart.title')}</h2>
            </div>
            <button
              className="pending-cart-icon-btn"
              type="button"
              aria-label={t('common.close')}
              onClick={() => setIsOpen(false)}
            >
              <X size={17} strokeWidth={1.9} />
            </button>
          </div>

          <p className="pending-cart-shop">{cartPayload.shopName}</p>
          <p className="pending-cart-expiry">{t('pendingCart.expiresOn')} {expiryLabel}</p>

          <div className="pending-cart-lines">
            {items.map(([label, item]) => (
              <div className="pending-cart-line" key={label}>
                <span className="pending-cart-line-name">{label}</span>
                <span className="pending-cart-line-meta">
                  {item.count} x {formatVnd(item.price || 0)} đ
                </span>
              </div>
            ))}
          </div>

          <div className="pending-cart-total">
            <span>{t('track.subtotal')}</span>
            <span>{formatVnd(subtotal)} đ</span>
          </div>

          <div className="pending-cart-actions">
            <button className="pending-cart-clear" type="button" onClick={clearCart}>
              <Trash2 size={15} strokeWidth={1.8} />
              {t('pendingCart.clear')}
            </button>
            <button className="pending-cart-continue" type="button" onClick={continueSchedule}>
              {t('pendingCart.continue')}
              <ArrowRight size={15} strokeWidth={1.8} />
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

export default PendingCartWidget
