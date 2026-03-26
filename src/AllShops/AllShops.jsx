import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  Clock,
  Star,
  User,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Zap,
  ArrowUpNarrowWide,
  Navigation,
  PackageSearch,
  X,
} from 'lucide-react'
import AppNavbar from '../components/AppNavbar'
import shopsData from '../data/allShops.json'
import '../LandingPage/LandingPage.css'
import './AllShops.css'

const SORT_OPTIONS = [
  { id: 'top-rated', label: 'Top Rated', Icon: TrendingUp },
  { id: 'nearest', label: 'Nearest', Icon: Navigation },
  { id: 'fastest', label: 'Fastest', Icon: Zap },
  { id: 'price', label: 'Price: Low → High', Icon: ArrowUpNarrowWide },
]

const DROPDOWN_OPTIONS = {
  nearby: [1, 2, 3, 5, 10],
  express: [14, 16, 18, 20, 24],
  budget: [6000, 7000, 8000, 10000, 12000],
}

const getFilterLabel = (id, value) => {
  if (id === 'nearby') return value === null ? 'Distance' : `Within ${value} km`
  if (id === 'express') return value === null ? 'Speed' : `Max ${value}h`
  if (id === 'budget') return value === null ? 'Budget' : `≤${value / 1000}k/kg`
  return ''
}

const formatOptionLabel = (id, value) => {
  if (id === 'nearby') return `${value} km`
  if (id === 'express') return `${value} hours`
  if (id === 'budget') return `≤${value / 1000}k VND/kg`
  return String(value)
}

function AllShops() {
  const navigate = useNavigate()
  const [activeSort, setActiveSort] = useState('top-rated')
  const [filterValues, setFilterValues] = useState({
    'top-star': false,
    nearby: null,
    express: null,
    budget: null,
  })
  const [openDropdown, setOpenDropdown] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const toggleStarFilter = () => {
    setFilterValues((prev) => ({ ...prev, 'top-star': !prev['top-star'] }))
  }

  const toggleDropdown = (id) => {
    setOpenDropdown((prev) => (prev === id ? null : id))
  }

  const selectDropdownValue = (id, value) => {
    setFilterValues((prev) => ({ ...prev, [id]: value }))
    setOpenDropdown(null)
  }

  const clearDropdownFilter = (e, id) => {
    e.stopPropagation()
    setFilterValues((prev) => ({ ...prev, [id]: null }))
  }

  const clearFilters = () => {
    setFilterValues({ 'top-star': false, nearby: null, express: null, budget: null })
    setOpenDropdown(null)
  }

  const displayedShops = useMemo(() => {
    let result = [...shops]

    // ── Apply filters (combinable) ──
    if (filterValues['top-star']) result = result.filter((s) => s.rating >= 5)
    if (filterValues.nearby !== null) result = result.filter((s) => s.distanceKm <= filterValues.nearby)
    if (filterValues.express !== null) result = result.filter((s) => s.deliveryHours <= filterValues.express)
    if (filterValues.budget !== null) result = result.filter((s) => s.price <= filterValues.budget)

    // ── Apply sort ──
    if (activeSort === 'top-rated')
      result.sort((a, b) => b.rating - a.rating || a.distanceKm - b.distanceKm)
    if (activeSort === 'nearest')
      result.sort((a, b) => a.distanceKm - b.distanceKm || b.rating - a.rating)
    if (activeSort === 'fastest')
      result.sort((a, b) => a.deliveryHours - b.deliveryHours || a.distanceKm - b.distanceKm)
    if (activeSort === 'price')
      result.sort((a, b) => a.price - b.price || a.distanceKm - b.distanceKm)

    return result
  }, [activeSort, filterValues, shops])

  const formatVnd = (value) =>
    value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={13} className={i < rating ? 'star-filled' : 'star-empty'} />
    ))

  const hasActiveFilters =
    filterValues['top-star'] ||
    filterValues.nearby !== null ||
    filterValues.express !== null ||
    filterValues.budget !== null

  return (
    <div className="allshops-page with-app-navbar">
      <AppNavbar />

      <main className="allshops-main">
        <header className="allshops-header">
          <h1 className="allshops-title">Find laundry services near you</h1>
          <p className="allshops-subtitle">Professional cleaning, delivered to your doorstep</p>

          {/* ── Sort row ── */}
          <div className="allshops-sort-row">
            <span className="filter-section-label">Sort by</span>
            <div className="allshops-sort-chips">
              {SORT_OPTIONS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  className={`sort-chip ${activeSort === id ? 'sort-chip-active' : ''}`}
                  onClick={() => setActiveSort(id)}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Filter row ── */}
          <div className="allshops-filter-row">
            <span className="filter-section-label">Filter</span>
            <div className="allshops-filter-chips" ref={dropdownRef}>
              {/* 5-Star Only — simple toggle */}
              <button
                className={`filter-toggle ${filterValues['top-star'] ? 'filter-toggle-active' : ''}`}
                onClick={toggleStarFilter}
              >
                <Star size={13} />
                5-Star Only
                {filterValues['top-star'] && (
                  <X
                    size={10}
                    className="filter-toggle-close"
                    onClick={(e) => { e.stopPropagation(); toggleStarFilter() }}
                  />
                )}
              </button>

              {/* Dropdown filters */}
              {['nearby', 'express', 'budget'].map((id) => {
                const isActive = filterValues[id] !== null
                const isOpen = openDropdown === id
                const Icon = id === 'nearby' ? MapPin : id === 'express' ? Zap : ArrowUpNarrowWide
                return (
                  <div key={id} className="filter-dropdown-wrapper">
                    <button
                      className={`filter-toggle ${isActive ? 'filter-toggle-active' : ''}`}
                      onClick={() => toggleDropdown(id)}
                    >
                      <Icon size={13} />
                      {getFilterLabel(id, filterValues[id])}
                      {isActive ? (
                        <X
                          size={10}
                          className="filter-toggle-close"
                          onClick={(e) => clearDropdownFilter(e, id)}
                        />
                      ) : (
                        <ChevronDown
                          size={11}
                          className={`filter-chevron${isOpen ? ' filter-chevron-open' : ''}`}
                        />
                      )}
                    </button>
                    {isOpen && (
                      <div className="filter-dropdown">
                        {DROPDOWN_OPTIONS[id].map((value) => (
                          <button
                            key={value}
                            className={`filter-dropdown-item ${filterValues[id] === value ? 'filter-dropdown-item-active' : ''}`}
                            onClick={() => selectDropdownValue(id, value)}
                          >
                            {formatOptionLabel(id, value)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </header>

        {/* ── Results bar ── */}
        <div className="allshops-results-bar">
          <span className="results-count">
            Showing <strong>{displayedShops.length}</strong> of {shops.length} shops
          </span>
          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              <X size={13} />
              Clear filters
            </button>
          )}
        </div>

        {/* ── Grid ── */}
        {displayedShops.length === 0 ? (
          <div className="allshops-empty">
            <PackageSearch size={48} strokeWidth={1.2} className="empty-icon" />
            <p>No shops match the current filters.</p>
            <button className="clear-filters-btn" onClick={clearFilters}>
              <X size={13} />
              Clear filters
            </button>
          </div>
        ) : (
          <section className="allshops-grid">
            {displayedShops.map((shop) => (
              <article
                key={shop.id}
                className="shop-card"
                onClick={() => navigate(`/all-shops/${shop.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') navigate(`/all-shops/${shop.id}`)
                }}
              >
                <div className="shop-card-image-wrapper">
                  <img src={shop.image} alt={shop.name} className="shop-card-image" />
                  <div className="shop-card-image-overlay" />
                </div>

                <div className="shop-card-body">
                  <div className="shop-card-rating">
                    {renderStars(shop.rating)}
                    <span className="shop-card-rating-value">{shop.rating}.0</span>
                  </div>

                  <h2 className="shop-card-name">{shop.name}</h2>

                  <div className="shop-card-meta">
                    <span className="shop-card-meta-item">
                      <MapPin size={12} />
                      {shop.distanceKm.toFixed(1)} km
                    </span>
                    <span className="shop-card-meta-item">
                      <Clock size={12} />
                      {shop.deliveryLabel}
                    </span>
                  </div>

                  <div className="shop-card-footer">
                    <div className="shop-card-price">
                      <span className="shop-card-price-label">Starting from</span>
                      <span className="shop-card-price-value">
                        {formatVnd(shop.price)}
                        <span className="shop-card-price-unit"> VND/kg</span>
                      </span>
                    </div>
                    <span className="shop-card-arrow">
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        <nav className="allshops-pagination">
          <button className="page-dot page-dot-active">1</button>
          <button className="page-dot">2</button>
          <button className="page-dot">3</button>
          <button className="page-dot">4</button>
          <button className="page-next">
            <ChevronRight size={16} />
          </button>
        </nav>
      </main>
    </div>
  )
}

export default AllShops
