import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
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
  const [cart, setCart] = useState({})
  const [copied, setCopied] = useState(false)

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
          code: `WELCOME-${baseShop.id.slice(-3)}`,
        },
        reviews: [
          { author: 'Customer A', rating: 5, text: 'Good service and quick support.' },
          { author: 'Customer B', rating: 4, text: 'Delivery is on time and clothes are clean.' },
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
    setCart((c) => {
      const prev = c[item.label] || { count: 0, price: item.price }
      return { ...c, [item.label]: { count: prev.count + 1, price: item.price } }
    })
  }

  const removeFromCart = (item) => {
    setCart((c) => {
      const prev = c[item.label]
      if (!prev) return c
      if (prev.count <= 1) {
        const { [item.label]: _, ...rest } = c
        return rest
      }
      return { ...c, [item.label]: { count: prev.count - 1, price: item.price } }
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
        <p style={{ color: '#64748b', fontSize: '15px' }}>Shop not found.</p>
      </div>
    )
  }

  const bannerImage = baseShop?.image || shop.image
  const cartEntries = Object.entries(cart)
  const subtotal = cartEntries.reduce((sum, [, { count, price }]) => sum + count * price, 0)
  const pickupFee = subtotal > 0 ? 15000 : 0
  const estimated = subtotal + pickupFee

  const SERVICE_SECTIONS = [
    { id: 'wash', title: 'Wash & Fold', Icon: Shirt, items: shop.services.washFold },
    { id: 'dry', title: 'Dry Cleaning', Icon: Wind, items: shop.services.dryCleaning },
    { id: 'iron', title: 'Ironing Only', Icon: Flame, items: [shop.services.ironing] },
  ]

  return (
    <div className="allshops-page">
      {/* ── Topbar ── */}
      <header className="allshops-topbar">
        <div className="allshops-topbar-inner">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span className="logo-text">Laundry<span>Go</span></span>
            <span className="logo-bubbles">
              <span className="bubble bubble-lg" />
              <span className="bubble bubble-md" />
              <span className="bubble bubble-sm" />
            </span>
          </div>
          <nav className="allshops-nav">
            <button className="allshops-nav-link allshops-nav-link-active" onClick={() => navigate('/all-shops')}>
              All Shops
            </button>
            <button className="allshops-nav-link" onClick={() => navigate(`/all-shops/${id}/track`)}>
              Track Order
            </button>
          </nav>
          <button className="allshops-user" onClick={() => navigate('/information')}>
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
        <button className="detail-hero-back" onClick={() => navigate('/all-shops')}>
          <ArrowLeft size={14} />
          Back to shops
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
              <span className="detail-meta-card-label">Distance</span>
              <MapPin size={16} className="detail-meta-card-icon" />
              <span className="detail-meta-card-value">{shop.distance}</span>
            </div>
            <div className="detail-meta-card">
              <span className="detail-meta-card-label">Turnaround</span>
              <Clock size={16} className="detail-meta-card-icon" />
              <span className="detail-meta-card-value">{shop.turnaround}</span>
            </div>
            <div className="detail-meta-card">
              <span className="detail-meta-card-label">Mon – Fri</span>
              <Clock size={16} className="detail-meta-card-icon" />
              <span className="detail-meta-card-value">{shop.hours['Mon-Fri']}</span>
            </div>
            <div className="detail-meta-card">
              <span className="detail-meta-card-label">Sat – Sun</span>
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
                    const count = cart[item.label]?.count || 0
                    return (
                      <div key={idx} className="detail-service-row">
                        <div className="detail-svc-info">
                          <div className="detail-svc-label">{item.label}</div>
                          <div className="detail-svc-notes">{item.notes}</div>
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
              Order Summary
            </div>
            {cartEntries.length === 0 ? (
              <div className="detail-order-empty">
                <ShoppingCart size={28} strokeWidth={1.4} />
                <span>Add services to get started</span>
              </div>
            ) : (
              <>
                <div className="detail-order-items">
                  {cartEntries.map(([label, { count, price }]) => (
                    <div key={label} className="detail-order-line">
                      <span className="detail-order-line-label">
                        <span className="detail-order-line-count">{count}× </span>
                        {label}
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
                    <span>Subtotal</span>
                    <span>{formatVnd(subtotal)} đ</span>
                  </div>
                  <div className="detail-order-fee-row">
                    <span>Pickup & Delivery</span>
                    <span>{formatVnd(pickupFee)} đ</span>
                  </div>
                  <div className="detail-order-fee-row detail-order-total">
                    <span>Estimated Total</span>
                    <span className="detail-order-total-price">{formatVnd(estimated)} đ</span>
                  </div>
                </div>
                <button
                  className="detail-order-cta"
                  onClick={() =>
                    navigate(`/all-shops/${id}/schedule`, {
                      state: { cart, subtotal, pickupFee, estimated },
                    })
                  }
                >
                  Schedule Pickup
                  <ArrowRight size={15} />
                </button>
              </>
            )}
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
            <p className="detail-promo-copied">{copied ? 'Copied to clipboard!' : '\u00a0'}</p>
          </div>
        </div>

        {/* Reviews full-width */}
        <div className="detail-reviews">
          <h2 className="detail-reviews-heading">What customers say</h2>
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
