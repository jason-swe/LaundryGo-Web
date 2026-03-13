import '../LandingPage/LandingPage.css'
import './AllShops.css'

const mockShops = Array.from({ length: 6 }).map((_, idx) => ({
  id: idx + 1,
  name: 'The Laundry Lab',
  distance: '0.8km',
  delivery: '20h Delivery',
  price: '7.000VND/kg',
}))

function AllShops() {
  return (
    <div className="allshops-page">
      <header className="allshops-topbar">
        <div className="allshops-topbar-inner">
          <div className="logo">
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
            <button className="allshops-nav-link">In Track Order</button>
          </nav>

          <div className="allshops-user">
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
            <button className="filter-chip filter-chip-active">Top Rated</button>
            <button className="filter-chip">Fastest Delivery</button>
            <button className="filter-chip">Price: Low to High</button>
            <button className="filter-chip">More Filters</button>
          </div>
        </header>

        <section className="allshops-grid">
          {mockShops.map((shop) => (
            <article key={shop.id} className="shop-card">
              <div className="shop-card-image-wrapper">
                <img
                  src="/shop1.jpg"
                  alt="Laundry basket"
                  className="shop-card-image"
                />
              </div>

              <div className="shop-card-body">
                <div className="shop-card-rating">★★★★★</div>
                <h2 className="shop-card-name">{shop.name}</h2>

                <div className="shop-card-meta">
                  <span>📍 {shop.distance}</span>
                  <span>⏱ {shop.delivery}</span>
                </div>

                <div className="shop-card-footer">
                  <div className="shop-card-price">
                    <span>Starting From</span>
                    <span className="shop-card-price-value">{shop.price}</span>
                  </div>

                  <button className="shop-card-arrow">→</button>
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

