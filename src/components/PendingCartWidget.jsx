import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ShoppingCart, Trash2, X } from 'lucide-react'
import { localizePath, useTranslation } from '../shared/lib/i18n'
import { CART_EVENT, clearCart, getCart } from '../services/cartApi'
import './PendingCartWidget.css'

function PendingCartWidget({ inline = false }) {
  const navigate = useNavigate()
  const { language, t } = useTranslation()
  const [cartPayload, setCartPayload] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    let active = true

    const syncCart = () => {
      getCart()
        .then((nextCart) => {
          if (!active) return
          setCartPayload(nextCart?.totalItems > 0 ? nextCart : null)
          if (!nextCart?.totalItems) setIsOpen(false)
        })
        .catch(() => {
          if (!active) return
          setCartPayload(null)
          setIsOpen(false)
        })
    }

    syncCart()
    window.addEventListener(CART_EVENT, syncCart)
    window.addEventListener('storage', syncCart)
    return () => {
      active = false
      window.removeEventListener(CART_EVENT, syncCart)
      window.removeEventListener('storage', syncCart)
    }
  }, [])

  const items = useMemo(() => cartPayload?.items || [], [cartPayload])
  const itemCount = Number(cartPayload?.totalItems || 0)
  const subtotal = Number(cartPayload?.subtotal || 0)

  const formatVnd = (value) => String(Math.round(Number(value || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  if (!cartPayload || itemCount === 0) return null

  const expiryDate = cartPayload.expiresAt ? new Date(cartPayload.expiresAt) : null
  const expiryLabel = expiryDate && !Number.isNaN(expiryDate.getTime())
    ? language === 'vi'
      ? expiryDate.toLocaleDateString('vi-VN')
      : expiryDate.toLocaleDateString('en-US')
    : ''

  const continueSchedule = () => {
    setIsOpen(false)
    navigate(localizePath(`/all-shops/${cartPayload.shopId}/schedule`, language))
  }

  const handleClearCart = async () => {
    await clearCart().catch(() => null)
    setCartPayload(null)
    setIsOpen(false)
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
          {expiryLabel && <p className="pending-cart-expiry">{t('pendingCart.expiresOn')} {expiryLabel}</p>}

          <div className="pending-cart-lines">
            {items.map((item) => (
              <div className="pending-cart-line" key={item.cartItemId || item.serviceId}>
                <span className="pending-cart-line-name">{item.label}</span>
                <span className="pending-cart-line-meta">
                  {item.count} x {formatVnd(item.price)} VND
                </span>
              </div>
            ))}
          </div>

          <div className="pending-cart-total">
            <span>{t('track.subtotal')}</span>
            <span>{formatVnd(subtotal)} VND</span>
          </div>

          <div className="pending-cart-actions">
            <button className="pending-cart-clear" type="button" onClick={handleClearCart}>
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
