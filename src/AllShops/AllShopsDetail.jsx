import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation, localizePath } from '../shared/lib/i18n'
import {
  ArrowLeft,
  MapPin,
  Clock,
  Star,
  User,
  Shirt,
  Wind,
  Flame,
  ShoppingCart,
  Tag,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react'
import shopsData from '../data/shopDetails.json'
import allShopsData from '../data/allShops.json'
import '../LandingPage/LandingPage.css'
import './AllShops.css'
import './AllShopsDetail.css'

function AllShopsDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language, t } = useTranslation()
  const navigateLocalized = (path, options) => navigate(localizePath(path, language), options)
  const [cart, setCart] = useState({})
  const [copied, setCopied] = useState(false)

  const getItemKey = (item) => item.id || item.labelKey || item.label
  const getItemLabel = (item) => (item.labelKey ? t(item.labelKey) : item.label)
  const getItemNotes = (item) => (item.notesKey ? t(item.notesKey) : item.notes)

  const formatHoursValue = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) return `${value} ${t('common.hours')}`
    if (typeof value !== 'string') return value
    const match = value.match(/(\d+)\s*(hours?|h)\b/i)
    if (!match) return value
    return `${match[1]} ${t('common.hours')}`
  }

  const baseShop = allShopsData.shops.find((s) => s.id === id)
  const shopFromDetails = shopsData.shops.find((s) => s.id === id)

  const getMockDeliveryHours = (shopId) => {
    const hash = shopId
      .split('')
      .reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 5), 0)
    return 12 + (hash % 13)
  }

  const getMockDistance = (shopId) => {
    const hash = shopId
      .split('')
      .reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 3), 0)
    return Number((0.8 + (hash % 70) / 10).toFixed(1))
  }

  const mockDeliveryHours = baseShop ? getMockDeliveryHours(baseShop.id) : 20
  const mockDistance = baseShop ? getMockDistance(baseShop.id) : 2.5

  const shop =
    shopFromDetails ||
    (baseShop
      ? {
        id: baseShop.id,
        name: baseShop.name,
        rating: baseShop.rating,
        address: t('shopDetail.updatingAddress'),
        distance: `${mockDistance} km`,
        delivery: `${mockDeliveryHours}h ${t('shops.delivery')}`,
        hours: { 'Mon-Fri': '7AM-9PM', 'Sat-Sun': '6AM-10PM' },
        turnaround: formatHoursValue(mockDeliveryHours),
        image: baseShop.image,
        services: {
          washFold: [
            { id: 'everyday_wear_kg', labelKey: 'shopDetail.items.everydayWearKg', price: baseShop.price, notesKey: 'shopDetail.notes.everydayWear' },
            { id: 'bedding_linen_kg', labelKey: 'shopDetail.items.beddingLinenKg', price: Math.round(baseShop.price * 1.4), notesKey: 'shopDetail.notes.beddingLinen' },
          ],
          dryCleaning: [
            { id: 'two_piece_suit', labelKey: 'shopDetail.items.twoPieceSuit', price: 35000, notesKey: 'shopDetail.notes.twoPieceSuit' },
            { id: 'dress_shirt_pressed', labelKey: 'shopDetail.items.dressShirtPressed', price: 15000, notesKey: 'shopDetail.notes.dressShirtPressed' },
          ],
          ironing: { id: 'individual_item', labelKey: 'shopDetail.items.individualItem', price: 4000, notesKey: 'shopDetail.notes.individualItem' },
        },
        promo: {
          textKey: 'shopDetail.promo.welcome10',
          code: `WELCOME-${baseShop.id.slice(-3)}`,
        },
        reviews: [
          { author: t('shopDetail.sampleReviews.author1'), rating: 5, text: t('shopDetail.sampleReviews.text1') },
          { author: t('shopDetail.sampleReviews.author2'), rating: 4, text: t('shopDetail.sampleReviews.text2') },
        ],
      }
      : null)

  const formatVnd = (value) =>
    value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  const renderStars = (rating, size = 14) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={size} className={i < rating ? 'star-filled' : 'star-empty'} />
    ))

  const addToCart = (item) => {
    const key = getItemKey(item)
    setCart((c) => {
      const prev = c[key] || { count: 0, price: item.price, item }
      return { ...c, [key]: { count: prev.count + 1, price: item.price, item } }
    })
  }

  const removeFromCart = (item) => {
    const key = getItemKey(item)
    setCart((c) => {
      const prev = c[key]
      if (!prev) return c
      if (prev.count <= 1) {
        const { [key]: _, ...rest } = c
        return rest
      }
      return { ...c, [key]: { ...prev, count: prev.count - 1, price: item.price } }
    })
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(shop.promo.code).catch(() => { })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!shop) {
    return (
      <div className="allshops-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: '#64748b', fontSize: '15px' }}>{t('shopDetail.shopNotFound')}</p>
      </div>
    )
  }

  const bannerImage = baseShop?.image || shop.image
  const cartEntries = Object.entries(cart)
  const subtotal = cartEntries.reduce((sum, [, { count, price }]) => sum + count * price, 0)
  const pickupFee = subtotal > 0 ? 15000 : 0
  const estimated = subtotal + pickupFee

  const SERVICE_SECTIONS = [
    { id: 'wash', title: t('shopDetail.washFold'), Icon: Shirt, items: shop.services.washFold },
    { id: 'dry', title: t('shopDetail.dryCleaning'), Icon: Wind, items: shop.services.dryCleaning },
    { id: 'iron', title: t('shopDetail.ironingOnly'), Icon: Flame, items: [shop.services.ironing] },
  ]

  return (
    <div className="allshops-page">
      {/* ── Topbar ── */}
      <header className="allshops-topbar">
        <div className="allshops-topbar-inner">
          <div className="logo" onClick={() => navigateLocalized('/')} style={{ cursor: 'pointer' }}>
            <span className="logo-text">Laundry<span>Go</span></span>
            <span className="logo-bubbles">
              <span className="bubble bubble-lg" />
              <span className="bubble bubble-md" />
              <span className="bubble bubble-sm" />
            </span>
          </div>
          <nav className="allshops-nav">
            <button className="allshops-nav-link allshops-nav-link-active" onClick={() => navigateLocalized('/all-shops')}>
              {t('nav.allShops')}
            </button>
            <button className="allshops-nav-link" onClick={() => navigateLocalized(`/all-shops/${id}/track`)}>
              {t('nav.trackOrder')}
            </button>
          </nav>
          <button className="allshops-user" onClick={() => navigateLocalized('/information')}>
            <span className="allshops-user-icon">👤</span>
            <span className="allshops-user-name">EXE101</span>
          </button>
        </div>
      </header>

      {/* ── Hero banner ── */}
      <div className="detail-hero">
        <img
          src={bannerImage}
          alt={shop.name}
          className="detail-hero-img"
          onError={(e) => { e.target.onerror = null; e.target.src = '/laundryshop1.jpg' }}
        />
        <div className="detail-hero-overlay" />
        <button className="detail-hero-back" onClick={() => navigateLocalized('/all-shops')}>
          <ArrowLeft size={14} />
          {t('common.back')} {t('nav.allShops').toLowerCase()}
        </button>
        <div className="detail-hero-content">
          <div className="detail-hero-stars">
            {renderStars(shop.rating, 15)}
            <span className="detail-hero-star-value">{shop.rating}.0</span>
          </div>
          <h1 className="detail-hero-name">{shop.name}</h1>
          <span className="detail-hero-address">
            <MapPin size={13} />
            {shop.address}
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="detail-body">

        {/* Left column */}
        <div>
          <div className="detail-meta-row">
            <div className="detail-meta-card">
              <span className="detail-meta-card-label">{t('shops.distance')}</span>
              <MapPin size={16} className="detail-meta-card-icon" />
              <span className="detail-meta-card-value">{shop.distance}</span>
            </div>
            <div className="detail-meta-card">
              <span className="detail-meta-card-label">{t('shopDetail.turnaround')}</span>
              <Clock size={16} className="detail-meta-card-icon" />
              <span className="detail-meta-card-value">{formatHoursValue(shop.turnaround)}</span>
            </div>
            <div className="detail-meta-card">
              <span className="detail-meta-card-label">{t('shopDetail.monFri')}</span>
              <Clock size={16} className="detail-meta-card-icon" />
              <span className="detail-meta-card-value">{shop.hours['Mon-Fri']}</span>
            </div>
            <div className="detail-meta-card">
              <span className="detail-meta-card-label">{t('shopDetail.satSun')}</span>
              <Clock size={16} className="detail-meta-card-icon" />
              <span className="detail-meta-card-value">{shop.hours['Sat-Sun']}</span>
            </div>
          </div>

          <div className="detail-services">
            {SERVICE_SECTIONS.map(({ id: sId, title, Icon, items }) => (
              <div key={sId} className="detail-service-card">
                <div className="detail-service-header">
                  <div className="detail-service-icon">
                    <Icon size={16} />
                  </div>
                  <span className="detail-service-title">{title}</span>
                </div>
                <div className="detail-service-body">
                  {items.map((item, idx) => {
                    const key = getItemKey(item)
                    const count = cart[key]?.count || 0
                    return (
                      <div key={idx} className="detail-service-row">
                        <div className="detail-svc-info">
                          <div className="detail-svc-label">{getItemLabel(item)}</div>
                          <div className="detail-svc-notes">{getItemNotes(item)}</div>
                        </div>
                        <div className="detail-svc-price">
                          {formatVnd(item.price)}
                          <span className="detail-svc-price-unit"> VND</span>
                        </div>
                        <div className="detail-qty">
                          <button
                            className="detail-qty-btn minus"
                            onClick={() => removeFromCart(item)}
                            disabled={count === 0}
                          >
                            −
                          </button>
                          <span className="detail-qty-val">{count}</span>
                          <button
                            className="detail-qty-btn plus"
                            onClick={() => addToCart(item)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="detail-sidebar">
          <div className="detail-order-box">
            <div className="detail-order-header">
              <ShoppingCart size={15} />
              {t('shopDetail.orderSummary')}
            </div>
            {cartEntries.length === 0 ? (
              <div className="detail-order-empty">
                <ShoppingCart size={28} strokeWidth={1.4} />
                <span>{t('shopDetail.addServices')}</span>
              </div>
            ) : (
              <>
                <div className="detail-order-items">
                  {cartEntries.map(([key, { count, price, item }]) => (
                    <div key={key} className="detail-order-line">
                      <span className="detail-order-line-label">
                        <span className="detail-order-line-count">{count}× </span>
                        {item ? getItemLabel(item) : key}
                      </span>
                      <span className="detail-order-line-price">
                        {formatVnd(count * price)} đ
                      </span>
                    </div>
                  ))}
                </div>
                <div className="detail-order-divider" />
                <div className="detail-order-fees">
                  <div className="detail-order-fee-row">
                    <span>{t('shopDetail.subtotal')}</span>
                    <span>{formatVnd(subtotal)} đ</span>
                  </div>
                  <div className="detail-order-fee-row">
                    <span>{t('shopDetail.pickupDelivery')}</span>
                    <span>{formatVnd(pickupFee)} đ</span>
                  </div>
                  <div className="detail-order-fee-row detail-order-total">
                    <span>{t('shopDetail.estimatedTotal')}</span>
                    <span className="detail-order-total-price">{formatVnd(estimated)} đ</span>
                  </div>
                </div>
                <button
                  className="detail-order-cta"
                  onClick={() =>
                    navigateLocalized(`/all-shops/${id}/schedule`, {
                      state: { cart, subtotal, pickupFee, estimated },
                    })
                  }
                >
                  {t('shopDetail.schedulePickup')}
                  <ArrowRight size={15} />
                </button>
              </>
            )}
          </div>

          <div className="detail-promo-box">
            <div className="detail-promo-icon">
              <Tag size={20} strokeWidth={1.8} />
            </div>
            <p className="detail-promo-text">{shop.promo.textKey ? t(shop.promo.textKey) : shop.promo.text}</p>
            <button className="detail-promo-code-btn" onClick={handleCopyCode}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {shop.promo.code}
            </button>
            <p className="detail-promo-copied">{copied ? t('common.copied') : '\u00a0'}</p>
          </div>
        </div>

        {/* Reviews full-width */}
        <div className="detail-reviews">
          <h2 className="detail-reviews-heading">{t('shopDetail.reviewsTitle')}</h2>
          <div className="detail-reviews-grid">
            {shop.reviews.map((r, i) => (
              <div key={i} className="detail-review-card">
                <div className="detail-review-stars">{renderStars(r.rating, 13)}</div>
                <p className="detail-review-text">"{r.text}"</p>
                <div className="detail-review-author">
                  <span className="detail-review-avatar">
                    <User size={14} />
                  </span>
                  <span className="detail-review-name">{r.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllShopsDetail
