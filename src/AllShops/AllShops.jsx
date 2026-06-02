import { createElement, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  Clock,
  Star,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Zap,
  ArrowUpNarrowWide,
  Navigation,
  PackageSearch,
  X,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import UserNavbar from '../components/UserNavbar'
import shopsData from '../data/allShops.json'
import '../LandingPage/LandingPage.css'
import './AllShops.css'
import { useTranslation, localizePath } from '../shared/lib/i18n'

const SORT_OPTIONS = [
  { id: 'top-rated', labelKey: 'shops.topRated', Icon: TrendingUp },
  { id: 'nearest', labelKey: 'shops.nearest', Icon: Navigation },
  { id: 'fastest', labelKey: 'shops.fastest', Icon: Zap },
  { id: 'price', labelKey: 'shops.price', Icon: ArrowUpNarrowWide },
]

const DROPDOWN_OPTIONS = {
  nearby: [1, 2, 3, 5, 10],
  express: [14, 16, 18, 20, 24],
  budget: [6000, 7000, 8000, 10000, 12000],
}

const getFilterLabel = (id, value, t) => {
  if (id === 'nearby') return value === null ? t('shops.distance') : `${t('shops.within')} ${value} km`
  if (id === 'express') return value === null ? t('shops.speed') : `${t('shops.max')} ${value}${t('shops.hours')}`
  if (id === 'budget') return value === null ? t('shops.budget') : `≤${value / 1000}k/kg`
  return ''
}

const formatOptionLabel = (id, value, t) => {
  if (id === 'nearby') return `${value} km`
  if (id === 'express') return `${value} ${t('shops.hours')}`
  if (id === 'budget') return `≤${value / 1000}k VND/kg`
  return String(value)
}

function AllShops() {
  const navigate = useNavigate()
  const { language, t } = useTranslation()
  const [activeSort, setActiveSort] = useState('top-rated')
  const [searchQuery, setSearchQuery] = useState('')
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
    setSearchQuery('')
    setFilterValues({ 'top-star': false, nearby: null, express: null, budget: null })
    setOpenDropdown(null)
  }

  const displayedShops = useMemo(() => {
    let result = [...shops]
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (normalizedQuery) {
      result = result.filter((shop) =>
        [shop.name, shop.address, String(shop.price)]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery))
      )
    }

    if (filterValues['top-star']) result = result.filter((s) => s.rating >= 5)
    if (filterValues.nearby !== null) result = result.filter((s) => s.distanceKm <= filterValues.nearby)
    if (filterValues.express !== null) result = result.filter((s) => s.deliveryHours <= filterValues.express)
    if (filterValues.budget !== null) result = result.filter((s) => s.price <= filterValues.budget)

    if (activeSort === 'top-rated')
      result.sort((a, b) => b.rating - a.rating || a.distanceKm - b.distanceKm)
    if (activeSort === 'nearest')
      result.sort((a, b) => a.distanceKm - b.distanceKm || b.rating - a.rating)
    if (activeSort === 'fastest')
      result.sort((a, b) => a.deliveryHours - b.deliveryHours || a.distanceKm - b.distanceKm)
    if (activeSort === 'price')
      result.sort((a, b) => a.price - b.price || a.distanceKm - b.distanceKm)

    return result
  }, [activeSort, filterValues, searchQuery, shops])

  const formatVnd = (value) =>
    value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={13} className={i < rating ? 'star-filled' : 'star-empty'} />
    ))

  const hasActiveFilters =
    searchQuery.trim() ||
    filterValues['top-star'] ||
    filterValues.nearby !== null ||
    filterValues.express !== null ||
    filterValues.budget !== null

  return (
    <div className="allshops-page">
      <UserNavbar />

      <main className="allshops-main">
        <section className="allshops-hero">
          <div className="allshops-hero-copy">
            <span className="allshops-eyebrow">{t('shops.heroEyebrow')}</span>
            <h1 className="allshops-title">{t('shops.title')}</h1>
            <p className="allshops-subtitle">{t('shops.subtitle')}</p>
          </div>
          <div className="allshops-hero-panel">
            <div>
              <span className="allshops-hero-stat">{shops.length}</span>
              <span className="allshops-hero-label">{t('shops.partnerShops')}</span>
            </div>
            <div>
              <span className="allshops-hero-stat">24h</span>
              <span className="allshops-hero-label">{t('shops.averageTurnaround')}</span>
            </div>
          </div>
        </section>

        <section className="allshops-control-panel">
          <label className="allshops-search">
            <Search size={18} strokeWidth={1.8} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t('shops.searchPlaceholder')}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} aria-label={t('shops.clearSearch')}>
                <X size={15} strokeWidth={1.8} />
              </button>
            )}
          </label>

          <div className="allshops-sort-row">
            <span className="filter-section-label">{t('shops.sortBy')}</span>
            <div className="allshops-sort-chips">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  className={`sort-chip ${activeSort === option.id ? 'sort-chip-active' : ''}`}
                  onClick={() => setActiveSort(option.id)}
                >
                  {createElement(option.Icon, { size: 14, strokeWidth: 1.8 })}
                  {t(option.labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div className="allshops-filter-row">
            <span className="filter-section-label">
              <SlidersHorizontal size={13} strokeWidth={1.8} />
              {t('shops.filter')}
            </span>
            <div className="allshops-filter-chips" ref={dropdownRef}>
              <button
                className={`filter-toggle ${filterValues['top-star'] ? 'filter-toggle-active' : ''}`}
                onClick={toggleStarFilter}
              >
                <Star size={13} />
                {t('shops.fiveStarOnly')}
                {filterValues['top-star'] && (
                  <X
                    size={10}
                    className="filter-toggle-close"
                    onClick={(e) => { e.stopPropagation(); toggleStarFilter() }}
                  />
                )}
              </button>

              {['nearby', 'express', 'budget'].map((id) => {
                const isActive = filterValues[id] !== null
                const isOpen = openDropdown === id
                const FilterIcon = id === 'nearby' ? MapPin : id === 'express' ? Zap : ArrowUpNarrowWide
                return (
                  <div key={id} className="filter-dropdown-wrapper">
                    <button
                      className={`filter-toggle ${isActive ? 'filter-toggle-active' : ''}`}
                      onClick={() => toggleDropdown(id)}
                    >
                      {createElement(FilterIcon, { size: 13, strokeWidth: 1.8 })}
                      {getFilterLabel(id, filterValues[id], t)}
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
                            {formatOptionLabel(id, value, t)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <div className="allshops-results-bar">
          <span className="results-count">
            {t('shops.showing')} <strong>{displayedShops.length}</strong> {t('shops.of')} {shops.length} {t('shops.shops')}
          </span>
          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              <X size={13} />
              {t('shops.clearFilters')}
            </button>
          )}
        </div>

        {/* ── Grid ── */}
        {displayedShops.length === 0 ? (
          <div className="allshops-empty">
            <PackageSearch size={48} strokeWidth={1.2} className="empty-icon" />
            <p>{t('shops.noResults')}</p>
            <span>{t('shops.noResultsHint')}</span>
            <button className="clear-filters-btn" onClick={clearFilters}>
              <X size={13} />
              {t('shops.clearFilters')}
            </button>
          </div>
        ) : (
          <section className="allshops-grid">
            {displayedShops.map((shop) => (
              <article
                key={shop.id}
                className="shop-card"
                onClick={() => navigate(localizePath(`/all-shops/${shop.id}`, language))}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') navigate(localizePath(`/all-shops/${shop.id}`, language))
                }}
              >
                <div className="shop-card-image-wrapper">
                  <img src={shop.image} alt={shop.name} className="shop-card-image" />
                  <div className="shop-card-image-overlay" />
                  <span className="shop-card-badge">{t('shops.openToday')}</span>
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
                      {shop.deliveryHours} {t('shops.hourShort')} · {t('shops.delivery')}
                    </span>
                  </div>

                  <div className="shop-card-footer">
                    <div className="shop-card-price">
                      <span className="shop-card-price-label">{t('shops.startingFrom')}</span>
                      <span className="shop-card-price-value">
                        {formatVnd(shop.price)}
                        <span className="shop-card-price-unit"> VND/kg</span>
                      </span>
                    </div>
                    <span className="shop-card-arrow">
                      <ArrowRight size={16} />
                    </span>
                  </div>
                  <span className="shop-card-cta">{t('shops.viewServices')}</span>
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

