import { useParams, useNavigate } from 'react-router-dom'
import { createElement, useEffect, useMemo, useState } from 'react'
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
import servicesCatalog from '../data/services.json'
import UserNavbar from '../components/UserNavbar'
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog'
import '../LandingPage/LandingPage.css'
import './AllShops.css'
import './AllShopsDetail.css'
import { localizePath, useTranslation } from '../shared/lib/i18n'
import { translateServiceCopy } from '../shared/lib/i18n/serviceCopy'
import { clearPendingCart, readPendingCart, savePendingCart } from '../utils/pendingCart'
import { bookingApi, normalizeServiceSections, normalizeShopDetail } from '../utils/bookingApi'

const SERVICE_META_BY_LABEL = servicesCatalog.reduce((acc, service) => {
  acc[service.name] = {
    category: service.category,
    description: service.description,
    estimatedTime: service.estimatedTime,
    minOrder: service.minOrder,
    pricingType: service.pricingType,
    available: service.available,
    tags: service.tags,
  }
  return acc
}, {})

const inferPricingType = (item) => {
  const label = item.label.toLowerCase()
  if (label.includes('per kg') || label.includes('kg')) return 'kg'
  if (label.includes('meter')) return 'meter'
  return 'item'
}

const getMockDeliveryHours = (shopId) => {
  const hash = String(shopId)
    .split('')
    .reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 5), 0)
  return 12 + (hash % 13)
}

const getMockDistance = (shopId) => {
  const hash = String(shopId)
    .split('')
    .reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 3), 0)
  return Number((0.8 + (hash % 70) / 10).toFixed(1))
}

const SERVICE_SECTION_ICONS = [Shirt, Wind, Flame]

const getTrailingNumber = (value) => {
  const match = String(value ?? '').match(/(\d+)$/)
  return match ? Number(match[1]) : null
}

const isSameShopId = (candidateId, routeId) => {
  if (String(candidateId) === String(routeId)) return true

  const candidateNumber = getTrailingNumber(candidateId)
  const routeNumber = getTrailingNumber(routeId)
  return candidateNumber !== null && routeNumber !== null && candidateNumber === routeNumber
}

const readCachedSelectedShop = (routeId) => {
  try {
    const raw = sessionStorage.getItem('laundrygo_selected_shop')
    if (!raw) return null

    const shop = JSON.parse(raw)
    return isSameShopId(shop?.id ?? shop?.shopId, routeId) ? shop : null
  } catch {
    return null
  }
}

function AllShopsDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language, t } = useTranslation()
  const [cart, setCart] = useState(() => {
    const pendingCart = readPendingCart()
    return pendingCart?.shopId === id ? pendingCart.cart || {} : {}
  })
  const [copied, setCopied] = useState(false)
  const [selectedServiceLabel, setSelectedServiceLabel] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState({ show: false })
  const [apiShop, setApiShop] = useState(null)
  const [apiServiceSections, setApiServiceSections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState('')

  const cachedShop = useMemo(() => readCachedSelectedShop(id), [id])
  const baseShop = useMemo(
    () => cachedShop || allShopsData.shops.find((s) => isSameShopId(s.id, id)),
    [cachedShop, id]
  )
  const shopFromDetails = useMemo(
    () => shopsData.shops.find((s) => isSameShopId(s.id, id)),
    [id]
  )

  const mockDeliveryHours = baseShop ? getMockDeliveryHours(baseShop.id) : 20
  const mockDistance = baseShop ? getMockDistance(baseShop.id) : 2.5

  const fallbackShop = useMemo(() =>
    shopFromDetails ||
    (baseShop
      ? {
        id: baseShop.id,
        name: baseShop.name,
        rating: baseShop.rating,
        address: 'Updating address data',
        distance: `${mockDistance} km`,
        delivery: `${mockDeliveryHours}h Delivery`,
        hours: { 'Mon-Fri': '7AM-9PM', 'Sat-Sun': '6AM-10PM' },
        turnaround: `${mockDeliveryHours} Hours`,
        image: baseShop.image,
        services: {
          washFold: [
            { label: 'Everyday Wear (per kg)', price: baseShop.price, notes: 'T-shirts, socks, jeans etc.' },
            { label: 'Bedding & Linen (per kg)', price: Math.round(baseShop.price * 1.4), notes: 'Sheets, pillowcases, towels etc.' },
          ],
          dryCleaning: [
            { label: 'Two-piece Suit', price: 35000, notes: 'Jacket and trousers/skirt etc.' },
            { label: 'Dress Shirt (Pressed)', price: 15000, notes: 'Machine pressed and hung.' },
          ],
          ironing: { label: 'Individual Item', price: 4000, notes: 'Priced per garment.' },
        },
        promo: {
          text: `Welcome offer! 10% off your first order with code:`,
          code: `WELCOME-${String(baseShop.id).slice(-3)}`,
        },
        reviews: [
          { author: 'Customer A', rating: 5, text: 'Good service and quick support.' },
          { author: 'Customer B', rating: 4, text: 'Delivery is on time and clothes are clean.' },
        ],
      }
      : null),
    [baseShop, mockDeliveryHours, mockDistance, shopFromDetails]
  )

  const shop = apiShop || fallbackShop

  useEffect(() => {
    let isMounted = true

    const loadShopDetail = async () => {
      setIsLoading(true)
      setApiError('')

      const [shopResult, servicesResult] = await Promise.all([
        bookingApi.getShop(id),
        bookingApi.getShopServiceCategories(id),
      ])

      if (!isMounted) return

      if (shopResult.error || servicesResult.error) {
        setApiError(shopResult.error || servicesResult.error)
      }

      if (shopResult.data) {
        setApiShop(normalizeShopDetail(shopResult.data, fallbackShop || baseShop))
      } else {
        setApiShop(null)
      }

      if (servicesResult.data) {
        setApiServiceSections(normalizeServiceSections(servicesResult.data))
      } else {
        setApiServiceSections([])
      }

      setIsLoading(false)
    }

    loadShopDetail()

    return () => {
      isMounted = false
    }
  }, [baseShop, fallbackShop, id])

  const enrichServiceItem = (item) => ({
    ...item,
    category: SERVICE_META_BY_LABEL[item.label]?.category || item.category,
    estimatedTime: translateServiceCopy(
      t,
      item.label,
      'estimatedTime',
      item.estimatedTime || SERVICE_META_BY_LABEL[item.label]?.estimatedTime || '24 hours'
    ),
    description: translateServiceCopy(
      t,
      item.label,
      'description',
      item.description || SERVICE_META_BY_LABEL[item.label]?.description || item.notes
    ),
    minOrder: item.minOrder || SERVICE_META_BY_LABEL[item.label]?.minOrder || 1,
    pricingType: item.pricingType || SERVICE_META_BY_LABEL[item.label]?.pricingType || inferPricingType(item),
    available: item.available ?? SERVICE_META_BY_LABEL[item.label]?.available ?? true,
    tags: item.tags || SERVICE_META_BY_LABEL[item.label]?.tags || [],
    displayLabel: translateServiceCopy(t, item.label, 'label', item.label),
    displayNotes: translateServiceCopy(
      t,
      item.label,
      'description',
      item.notes || item.description || SERVICE_META_BY_LABEL[item.label]?.description || ''
    ),
  })

  const formatVnd = (value) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  const formatCurrency = (value) => {
    if (!value) return '0'
    if (language === 'vi') return `${formatVnd(value)} đ`
    return `${new Intl.NumberFormat('en-US').format(value)} VND`
  }
  const shopName = shop?.name

  const renderStars = (rating, size = 14) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={size} className={i < rating ? 'star-filled' : 'star-empty'} />
    ))

  const addToCart = (item) => {
    setCart((c) => {
      const prev = c[item.label] || { count: 0, price: item.price, pricingType: item.pricingType }
      const nextCount = item.pricingType === 'kg' ? 1 : prev.count + 1
      return {
        ...c,
        [item.label]: {
          count: nextCount,
          price: item.price,
          pricingType: item.pricingType,
          serviceId: item.serviceId || item.id,
          serviceName: item.label,
          serviceUnit: item.serviceUnit,
        },
      }
    })
  }

  const closeConfirmDialog = () => {
    setConfirmDialog({ show: false })
  }

  const addToCartWithPendingCheck = (item) => {
    const pendingCart = readPendingCart()
    const hasForeignCart = pendingCart?.shopId && pendingCart.shopId !== id && Object.keys(pendingCart.cart || {}).length > 0

    if (hasForeignCart) {
      setConfirmDialog({
        show: true,
        title: 'Replace current pending cart?',
        message: `You already have a pending cart from ${pendingCart.shopName}. Adding services from ${shopName} will remove that cart and start a new one. Do you want to continue?`,
        cancelText: 'Cancel',
        confirmText: 'Replace Cart',
        type: 'warning',
        onConfirm: () => {
          clearPendingCart()
          addToCart(item)
          setSelectedServiceLabel(item.label)
          closeConfirmDialog()
        },
      })
      return
    }

    addToCart(item)
    setSelectedServiceLabel(item.label)
  }

  const removeFromCart = (item) => {
    setCart((c) => {
      const prev = c[item.label]
      if (!prev) return c
      if (item.pricingType === 'kg' || prev.count <= 1) {
        const { [item.label]: _, ...rest } = c
        return rest
      }
      return {
        ...c,
        [item.label]: {
          count: prev.count - 1,
          price: item.price,
          pricingType: item.pricingType,
          serviceId: item.serviceId || item.id,
          serviceName: item.label,
          serviceUnit: item.serviceUnit,
        },
      }
    })
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(shop.promo.code).catch(() => { })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    if (!shopName) return

    const itemCount = Object.values(cart).reduce((total, item) => total + (item.count || 0), 0)
    if (itemCount === 0) {
      const pendingCart = readPendingCart()
      if (pendingCart?.shopId === id) clearPendingCart()
      return
    }

    savePendingCart({
      shopId: id,
      shopName,
      cart,
    })
  }, [cart, id, shopName])

  if (!shop && isLoading) {
    return (
      <div className="shop-detail-page">
        <UserNavbar />
        <main className="shop-detail-main">
          <section className="detail-loading">
            <div className="detail-loading-media" />
            <div className="detail-loading-copy">
              <span />
              <strong />
              <p />
            </div>
          </section>
        </main>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="allshops-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: '#64748b', fontSize: '15px' }}>{t('shopDetail.notFound')}</p>
      </div>
    )
  }

  const bannerImage = shop.image || baseShop?.image
  const cartEntries = Object.entries(cart)
  const subtotal = cartEntries.reduce((acc, [, { count = 0, price = 0 }]) => acc + count * price, 0)
  const fallbackServices = fallbackShop?.services || shop.services || { washFold: [], dryCleaning: [], ironing: null }

  const SERVICE_SECTIONS = apiServiceSections.length > 0
    ? apiServiceSections.map((section, index) => ({
      id: section.id,
      title: section.name,
      Icon: SERVICE_SECTION_ICONS[index % SERVICE_SECTION_ICONS.length],
      items: section.services.map(enrichServiceItem),
    }))
    : [
      { id: 'wash', titleKey: 'shopDetail.washFold', Icon: Shirt, items: (fallbackServices.washFold || []).map(enrichServiceItem) },
      { id: 'dry', titleKey: 'shopDetail.dryCleaning', Icon: Wind, items: (fallbackServices.dryCleaning || []).map(enrichServiceItem) },
      {
        id: 'iron',
        titleKey: 'shopDetail.ironingOnly',
        Icon: Flame,
        items: fallbackServices.ironing ? [enrichServiceItem(fallbackServices.ironing)] : [],
      },
    ]

  const allServiceItems = SERVICE_SECTIONS.flatMap((section) => section.items)
  const selectedService = allServiceItems.find((item) => item.label === selectedServiceLabel) || allServiceItems[0]

  return (
    <div className="shop-detail-page">
      <UserNavbar />

      <main className="shop-detail-main">
        <section className="detail-hero">
          <img
            src={bannerImage}
            alt={shop.name}
            className="detail-hero-img"
            onError={(e) => { e.target.onerror = null; e.target.src = '/laundryshop1.jpg' }}
          />
          <div className="detail-hero-overlay" />
          <button className="detail-hero-back" onClick={() => navigate(localizePath('/all-shops', language))}>
            <ArrowLeft size={15} strokeWidth={1.8} />
            {t('shopDetail.backToShops')}
          </button>
          <div className="detail-hero-content">
            <span className="detail-hero-eyebrow">{t('shopDetail.partnerShop')}</span>
            <div className="detail-hero-stars">
              {renderStars(shop.rating, 16)}
              <span className="detail-hero-star-value">{shop.rating}.0</span>
            </div>
            <h1 className="detail-hero-name">{shop.name}</h1>
            <span className="detail-hero-address">
              <MapPin size={15} strokeWidth={1.8} />
              {shop.address}
            </span>
          </div>
        </section>

        <section className="detail-body">
          <div className="detail-content">
          {apiError && (
            <div className="detail-api-note">
              {t('shopDetail.apiFallback')}
            </div>
          )}
          <div className="detail-meta-row">
            <div className="detail-meta-card">
              <span className="detail-meta-card-label">{t('shops.distance')}</span>
              <MapPin size={16} className="detail-meta-card-icon" />
              <span className="detail-meta-card-value">{shop.distance}</span>
            </div>
            <div className="detail-meta-card">
              <span className="detail-meta-card-label">{t('shopDetail.turnaround')}</span>
              <Clock size={16} className="detail-meta-card-icon" />
              <span className="detail-meta-card-value">{shop.turnaround}</span>
            </div>
            <div className="detail-meta-card">
              <span className="detail-meta-card-label">{t('shopDetail.weekdays')}</span>
              <Clock size={16} className="detail-meta-card-icon" />
              <span className="detail-meta-card-value">{shop.hours['Mon-Fri']}</span>
            </div>
            <div className="detail-meta-card">
              <span className="detail-meta-card-label">{t('shopDetail.weekend')}</span>
              <Clock size={16} className="detail-meta-card-icon" />
              <span className="detail-meta-card-value">{shop.hours['Sat-Sun']}</span>
            </div>
          </div>

          <div className="detail-service-inspector">
            <div className="detail-service-inspector-header">
              <div>
                <h2 className="detail-service-inspector-title">{t('shopDetail.serviceDetails')}</h2>
                <p className="detail-service-inspector-subtitle">{t('shopDetail.serviceDetailsHint')}</p>
              </div>
              {selectedService && (
                <span className="detail-service-inspector-badge">
                  {selectedService.estimatedTime}
                </span>
              )}
            </div>

            {selectedService && (
              <div className="detail-service-inspector-body">
                <div className="detail-service-inspector-name">{selectedService.displayLabel || selectedService.label}</div>
                <div className="detail-service-inspector-desc">{selectedService.description}</div>
                <div className="detail-service-inspector-grid">
                  <div>
                    <span className="detail-service-inspector-k">{t('shopDetail.estimatedTime')}</span>
                    <span className="detail-service-inspector-v">{selectedService.estimatedTime}</span>
                  </div>
                  <div>
                    <span className="detail-service-inspector-k">{t('shopDetail.minOrder')}</span>
                    <span className="detail-service-inspector-v">
                      {selectedService.minOrder} {selectedService.pricingType === 'kg' ? t('shopDetail.unitKg') : t('shopDetail.unitItems')}
                    </span>
                  </div>
                  <div>
                    <span className="detail-service-inspector-k">{t('shopDetail.price')}</span>
                    <span className="detail-service-inspector-v">{formatVnd(selectedService.price)} VND</span>
                  </div>
                  <div>
                    <span className="detail-service-inspector-k">{t('shopDetail.pricingType')}</span>
                    <span className="detail-service-inspector-v">
                      {selectedService.pricingType === 'kg'
                        ? t('shopDetail.unitKg')
                        : selectedService.pricingType === 'meter'
                          ? t('shopDetail.unitMeter')
                          : t('shopDetail.unitItem')}
                    </span>
                  </div>
                </div>
                <div className="detail-service-inspector-footer">
                  <span className="detail-service-status">
                    {selectedService.available ? t('shopDetail.availableNow') : t('shopDetail.unavailable')}
                  </span>
                  {selectedService.tags.length > 0 && (
                    <div className="detail-service-tags">
                      {selectedService.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="detail-services">
            {SERVICE_SECTIONS.map(({ id: sId, title, titleKey, Icon, items }) => (
              <div key={sId} className="detail-service-card">
                <div className="detail-service-header">
                  <div className="detail-service-icon">
                    {createElement(Icon, { size: 16, strokeWidth: 1.8 })}
                  </div>
                  <span className="detail-service-title">{titleKey ? t(titleKey) : title}</span>
                </div>
                <div className="detail-service-body">
                  {items.map((item, idx) => {
                    const count = cart[item.label]?.count || 0
                    const isKgService = item.pricingType === 'kg'
                    const isSelected = count > 0
                    return (
                      <div
                        key={idx}
                        className={`detail-service-row${selectedServiceLabel === item.label ? ' selected' : ''}`}
                        onClick={() => setSelectedServiceLabel(item.label)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            setSelectedServiceLabel(item.label)
                          }
                        }}
                      >
                        <div className="detail-svc-info">
                          <div className="detail-svc-label">{item.displayLabel || item.label}</div>
                          <div className="detail-svc-notes">{item.displayNotes || item.notes}</div>
                          <div className="detail-svc-duration">{item.estimatedTime} · {t('shopDetail.finalDetailsAfterConfirm')}</div>
                          <span className="detail-svc-more">{t('shopDetail.viewServiceDetails')}</span>
                        </div>
                        <div className="detail-svc-price">
                          {formatVnd(item.price)}
                          <span className="detail-svc-price-unit">
                            {' '}VND/{item.pricingType === 'kg' ? t('shopDetail.unitKg') : item.pricingType === 'meter' ? t('shopDetail.unitMeter') : t('shopDetail.unitItem')}
                          </span>
                        </div>
                        <div className="detail-qty" style={isKgService ? { gridTemplateColumns: '36px' } : undefined}>
                          {isKgService ? (
                            <button
                              className={`detail-qty-btn ${isSelected ? 'minus' : 'plus'}`}
                              aria-label={isSelected ? t('shopDetail.decreaseQuantity') : t('shopDetail.increaseQuantity')}
                              onClick={(event) => {
                                event.stopPropagation()
                                  if (isSelected) {
                                    removeFromCart(item)
                                    return
                                  }
                                  addToCartWithPendingCheck(item)
                              }}
                            >
                              {isSelected ? '−' : '+'}
                            </button>
                          ) : (
                            <>
                              <button
                                className="detail-qty-btn minus"
                                aria-label={t('shopDetail.decreaseQuantity')}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  removeFromCart(item)
                                }}
                                disabled={count === 0}
                              >
                                −
                              </button>
                              <span className="detail-qty-count">{count}</span>
                              <button
                                className="detail-qty-btn plus"
                                aria-label={t('shopDetail.increaseQuantity')}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  addToCartWithPendingCheck(item)
                                }}
                              >
                                +
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="detail-sidebar">
          <div className="detail-order-box">
            <div className="detail-order-header">
              <ShoppingCart size={15} />
              {t('shopDetail.selectedServices')}
            </div>
            {cartEntries.length === 0 ? (
              <div className="detail-order-empty">
                <ShoppingCart size={28} strokeWidth={1.4} />
                <span>{t('shopDetail.emptyCart')}</span>
              </div>
            ) : (
              <div className="detail-order-items">
                {cartEntries.map(([label, { count, price, pricingType }]) => (
                  <div key={label} className="detail-order-line">
                    <span className="detail-order-line-label">{translateServiceCopy(t, label, 'label', label)}</span>
                    <span className="detail-order-line-price">
                      {count} × {formatVnd(price)} đ/{pricingType === 'kg' ? t('shopDetail.unitKg') : t('shopDetail.unitItem')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="detail-order-subtotal">
              <span>{t('track.subtotal')}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <div className="detail-order-note">
              {t('shopDetail.priceNote')}
            </div>

            <button
              className="detail-order-cta"
              disabled={cartEntries.length === 0}
              onClick={() =>
                navigate(localizePath(`/all-shops/${id}/schedule`, language), {
                  state: { cart },
                })
              }
            >
              {t('shopDetail.schedulePickup')}
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="detail-promo-box">
            <div className="detail-promo-icon">
              <Tag size={20} strokeWidth={1.8} />
            </div>
            <p className="detail-promo-text">{shop.promo.text}</p>
            <button className="detail-promo-code-btn" onClick={handleCopyCode}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {shop.promo.code}
            </button>
            <p className="detail-promo-copied">{copied ? t('shopDetail.copied') : '\u00a0'}</p>
          </div>
        </aside>

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
        </section>
      </main>

      {confirmDialog.show && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          confirmText={confirmDialog.confirmText}
          cancelText={confirmDialog.cancelText}
          onConfirm={confirmDialog.onConfirm}
          onCancel={closeConfirmDialog}
        />
      )}
    </div>
  )
}

export default AllShopsDetail
