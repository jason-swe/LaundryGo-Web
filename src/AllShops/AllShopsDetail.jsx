import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import shopsData from '../data/shopDetails.json'
import allShopsData from '../data/allShops.json'
import '../LandingPage/LandingPage.css'
import './AllShops.css'

function AllShopsDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const baseShop = allShopsData.shops.find((s) => s.id === id)
  const shopFromDetails = shopsData.shops.find((s) => s.id === id)
  const getMockDeliveryHours = (shopId) => {
    const hash = shopId
      .split('')
      .reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 5), 0)
    return 12 + (hash % 13)
  }
  const mockDeliveryHours = baseShop ? getMockDeliveryHours(baseShop.id) : 20

  const shop =
    shopFromDetails ||
    (baseShop
      ? {
          id: baseShop.id,
          name: `${baseShop.name} ${baseShop.id}`,
          rating: baseShop.rating,
          address: 'Updating address data',
          distance: baseShop.distance,
          delivery: `${mockDeliveryHours}h Delivery`,
          hours: {
            'Mon-Fri': '7AM-9PM',
            'Sat-Sun': '6AM-10PM',
          },
          turnaround: `${mockDeliveryHours} Hours`,
          image: baseShop.image,
          services: {
            washFold: [
              {
                label: 'Everyday Wear (per kg)',
                price: baseShop.price,
                notes: 'T-shirts, socks, jeans etc.',
              },
              {
                label: 'Bedding & Linen (per kg)',
                price: Math.round(baseShop.price * 1.4),
                notes: 'Sheets, pillowcases, towels etc.',
              },
            ],
            dryCleaning: [
              {
                label: 'Two-piece Suit',
                price: 35000,
                notes: 'Jacket and trousers/skirt etc.',
              },
              {
                label: 'Dress Shirt (Pressed)',
                price: 15000,
                notes: 'Machine pressed and hung.',
              },
            ],
            ironing: {
              label: 'Individual Item',
              price: 4000,
              notes: 'Priced per garment.',
            },
          },
          promo: {
            text: 'Welcome offer! 10% off for this shop with code:',
            code: `WELCOME-${baseShop.id.slice(-3)}`,
          },
          reviews: [
            {
              author: 'Customer A',
              rating: 5,
              text: 'Good service and quick support.',
            },
            {
              author: 'Customer B',
              rating: 4,
              text: 'Delivery is on time and clothes are clean.',
            },
          ],
        }
      : null)

  const formatVnd = (value) =>
    value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  const [cart, setCart] = useState({})

  const addToCart = (item) => {
    setCart((c) => {
      const key = item.label
      const prev = c[key] || { count: 0, price: item.price }
      return {
        ...c,
        [key]: { count: prev.count + 1, price: item.price },
      }
    })
  }

  const removeFromCart = (item) => {
    setCart((c) => {
      const key = item.label
      const prev = c[key]
      if (!prev) return c
      if (prev.count <= 1) {
        const { [key]: _, ...rest } = c
        return rest
      }
      return {
        ...c,
        [key]: { count: prev.count - 1, price: item.price },
      }
    })
  }

  if (!shop) {
    return <div>Shop not found</div>
  }

  const bannerImage = baseShop?.image || shop.image

  const cartEntries = Object.entries(cart)
  const subtotal = cartEntries.reduce(
    (sum, [, { count, price }]) => sum + count * price,
    0
  )
  const pickupFee = subtotal > 0 ? 15000 : 0
  const estimated = subtotal + pickupFee

  return (
    <div className="allshops-page">
      <header className="allshops-topbar">
        <div className="allshops-topbar-inner">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span className="logo-text">
              Laundry<span>Go</span>
            </span>
            <span className="logo-bubbles">
              <span className="bubble bubble-lg" />
              <span className="bubble bubble-md" />
              <span className="bubble bubble-sm" />
            </span>
          </div>

          <nav className="allshops-nav">
            <button className="allshops-nav-link" onClick={() => navigate('/all-shops')}>
              All Shops
            </button>
            <button
              className="allshops-nav-link"
              onClick={() => navigate('/all-shops/AS-001/track')}
            >
              In Track Order
            </button>
          </nav>

          <div
            className="allshops-user"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/information')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                navigate('/information')
              }
            }}
          >
            <div className="allshops-user-icon">👤</div>
            <span className="allshops-user-name">EXE101</span>
          </div>
        </div>
      </header>

      <main className="allshops-main shop-detail">
        {/* banner image */}
        <div className="shop-detail-banner">
          <img
            src={bannerImage}
            alt={shop.name}
            onError={(e) => {
              e.target.onerror = null
              e.target.src = 'https://via.placeholder.com/800x280?text=No+Image'
            }}
          />
        </div>

        <section className="shop-detail-info">
          <div className="shop-detail-main">
            <div className="shop-detail-header">
              <div className="shop-detail-rating">
                {'★'.repeat(shop.rating)}
              </div>
              <h1 className="shop-detail-name">{shop.name}</h1>
              <p className="shop-detail-address">{shop.address}</p>
            </div>

            <div className="shop-detail-meta">
              <div className="shop-detail-meta-item">
                <p className="meta-label">OPERATION TIME</p>
                <p className="meta-value">Mon-Fri: {shop.hours['Mon-Fri']}</p>
                <p className="meta-value">Sat-Sun: {shop.hours['Sat-Sun']}</p>
              </div>
              <div className="shop-detail-meta-item">
                <p className="meta-label">TURNAROUND TIME</p>
                <p className="meta-value">
                  <span className="meta-icon">⏱</span> {shop.turnaround}
                </p>
              </div>
            </div>

            {/* services & pricing cards */}
            <div className="shop-detail-services">
            <div className="service-card">
              <p className="service-title">WASH & FOLD</p>
              <table className="service-table">
                <tbody>
                  {shop.services.washFold.map((item, idx) => {
                    const count = cart[item.label]?.count || 0
                    return (
                      <tr key={idx}>
                        <td className="service-item">
                          <strong>{item.label}</strong>
                          <div className="service-notes">{item.notes}</div>
                        </td>
                        <td className="service-price">
                          {formatVnd(item.price)}VND
                        </td>
                        <td>
                          <div className="qty-controls">
                            <button
                              className="minus-btn"
                              onClick={() => removeFromCart(item)}
                              disabled={count === 0}
                            >
                              –
                            </button>
                            <span className="count">{count}</span>
                            <button
                              className="add-btn"
                              onClick={() => addToCart(item)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="service-card">
              <p className="service-title">DRY CLEANING</p>
              <table className="service-table">
                <tbody>
                  {shop.services.dryCleaning.map((item, idx) => {
                    const count = cart[item.label]?.count || 0
                    return (
                      <tr key={idx}>
                        <td className="service-item">
                          <strong>{item.label}</strong>
                          <div className="service-notes">{item.notes}</div>
                        </td>
                        <td className="service-price">
                          {formatVnd(item.price)}VND
                        </td>
                        <td>
                          <div className="qty-controls">
                            <button
                              className="minus-btn"
                              onClick={() => removeFromCart(item)}
                              disabled={count === 0}
                            >
                              –
                            </button>
                            <span className="count">{count}</span>
                            <button
                              className="add-btn"
                              onClick={() => addToCart(item)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="service-card">
              <p className="service-title">IRONING ONLY</p>
              <table className="service-table">
                <tbody>
                  <tr>
                    <td className="service-item">
                      <strong>{shop.services.ironing.label}</strong>
                      <div className="service-notes">
                        {shop.services.ironing.notes}
                      </div>
                    </td>
                    <td className="service-price">
                      {formatVnd(shop.services.ironing.price)}VND
                    </td>
                    <td>
                      <div className="qty-controls">
                      <button
                        className="minus-btn"
                        onClick={() => removeFromCart(shop.services.ironing)}
                        disabled={!cart[shop.services.ironing.label]?.count}
                      >
                        –
                      </button>
                      <span className="count">{cart[shop.services.ironing.label]?.count || 0}</span>
                      <button
                        className="add-btn"
                        onClick={() => addToCart(shop.services.ironing)}
                      >
                        +
                      </button>
                    </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* order summary & promo */}
          </div> {/* end main */}

          <div className="shop-detail-sidebar">
            {cartEntries.length > 0 && (
              <div className="order-summary">
                <h3>ORDER SUMMARY</h3>
                {cartEntries.map(([label, { count, price }]) => (
                  <p key={label}>
                    {count}x {label} {formatVnd(price)}VND
                  </p>
                ))}
                <hr />
                <p>Subtotal {formatVnd(subtotal)}VND</p>
                <p>Pickup & Delivery {formatVnd(pickupFee)}VND</p>
                <p>
                  <strong>
                    Estimated Total {formatVnd(estimated)}VND
                  </strong>
                </p>
                <button
                  className="schedule-btn"
                  onClick={() =>
                    navigate(`/all-shops/${id}/schedule`, {
                      state: { cart, subtotal, pickupFee, estimated },
                    })
                  }
                >
                  Schedule Pickup →
                </button>
              </div>
            )}

            <div className="promo-box">
              <p>{shop.promo.text}</p>
              <button className="promo-code">{shop.promo.code}</button>
            </div>
          </div>

          {/* reviews */}
          <div className="shop-detail-reviews">
            <h2>What customers say</h2>
            <div className="reviews-list">
              {shop.reviews.map((r, i) => (
                <div key={i} className="review-item">
                  <div className="review-rating">{'★'.repeat(r.rating)}</div>
                  <p className="review-text">"{r.text}"</p>
                  <div className="review-author">
                    <span>👤</span> {r.author}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default AllShopsDetail
