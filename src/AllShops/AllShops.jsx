import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import shopsData from '../data/allShops.json'
import '../LandingPage/LandingPage.css'
import './AllShops.css'

function AllShops() {
  const navigate = useNavigate()
  const [activeSort, setActiveSort] = useState('top-rated')
  const [moreFiltersEnabled, setMoreFiltersEnabled] = useState(false)

  const getMockDistance = (shopId) => {
    const hash = shopId
      .split('')
      .reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 3), 0)
    const normalized = 0.8 + (hash % 70) / 10
    return Number(normalized.toFixed(1))
  }

  const getMockDeliveryHours = (shopId) => {
    const hash = shopId
      .split('')
      .reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 5), 0)
    return 12 + (hash % 13)
  }

  const shops = useMemo(
    () =>
      shopsData.shops.map((shop) => ({
        ...shop,
        distanceKm: getMockDistance(shop.id),
        deliveryHours: getMockDeliveryHours(shop.id),
        deliveryLabel: `${getMockDeliveryHours(shop.id)}h Delivery`,
      })),
    []
  )

  const displayedShops = useMemo(() => {
    let result = [...shops]

    if (moreFiltersEnabled) {
      result = result.filter((shop) => shop.rating >= 4 && shop.distanceKm <= 4.5)
    }

    if (activeSort === 'top-rated') {
      result.sort(
        (a, b) => b.rating - a.rating || a.distanceKm - b.distanceKm || a.price - b.price
      )
    }

    if (activeSort === 'fastest') {
      result.sort(
        (a, b) =>
          a.deliveryHours - b.deliveryHours ||
          a.distanceKm - b.distanceKm ||
          b.rating - a.rating
      )
    }

    if (activeSort === 'price') {
      result.sort((a, b) => a.price - b.price || a.distanceKm - b.distanceKm)
    }

    return result
  }, [activeSort, moreFiltersEnabled, shops])

  const formatVnd = (value) =>
    value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

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
            <button className="allshops-nav-link allshops-nav-link-active">
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

      <main className="allshops-main">
        <header className="allshops-header">
          <h1 className="allshops-title">Find a laundry services near you</h1>
          <p className="allshops-subtitle">
            Professional cleaning, delivered to your doorstep
          </p>

          <div className="allshops-filters">
            <button
              className={`filter-chip ${activeSort === 'top-rated' ? 'filter-chip-active' : ''}`}
              onClick={() => setActiveSort('top-rated')}
            >
              Top Rated
            </button>
            <button
              className={`filter-chip ${activeSort === 'fastest' ? 'filter-chip-active' : ''}`}
              onClick={() => setActiveSort('fastest')}
            >
              Fastest Delivery
            </button>
            <button
              className={`filter-chip ${activeSort === 'price' ? 'filter-chip-active' : ''}`}
              onClick={() => setActiveSort('price')}
            >
              Price: Low to High
            </button>
            <button
              className={`filter-chip ${moreFiltersEnabled ? 'filter-chip-active' : ''}`}
              onClick={() => setMoreFiltersEnabled((prev) => !prev)}
            >
              More Filters
            </button>
          </div>
        </header>

        <section className="allshops-grid">
          {displayedShops.map((shop) => (
            <article key={shop.id} className="shop-card">
              <div className="shop-card-image-wrapper">
                <img
                  src={shop.image}
                  alt={shop.name}
                  className="shop-card-image"
                />
              </div>

              <div className="shop-card-body">
                <div className="shop-card-rating">
                  {'★'.repeat(shop.rating)}
                </div>
                <h2 className="shop-card-name">{shop.name}</h2>

                <div className="shop-card-meta">
                  <span>📍 {shop.distanceKm.toFixed(1)}km</span>
                  <span>⏱ {shop.deliveryLabel}</span>
                </div>

                <div className="shop-card-footer">
                  <div className="shop-card-price">
                    <span>Starting From</span>
                    <span className="shop-card-price-value">
                      {formatVnd(shop.price)} VND/kg
                    </span>
                  </div>

                  <button
                    className="shop-card-arrow"
                    type="button"
                    onClick={() => navigate(`/all-shops/${shop.id}`)}
                  >
                    →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <nav className="allshops-pagination">
          <button className="page-dot page-dot-active">1</button>
          <button className="page-dot">2</button>
          <button className="page-dot">3</button>
          <button className="page-dot">4</button>
          <button className="page-next">→</button>
        </nav>
      </main>
    </div>
  )
}

export default AllShops

