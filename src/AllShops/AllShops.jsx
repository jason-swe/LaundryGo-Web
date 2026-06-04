import { createElement, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  Clock,
  Star,
  ArrowRight,
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
import '../LandingPage/LandingPage.css'
import './AllShops.css'
import { useTranslation, localizePath } from '../shared/lib/i18n'
import { apiRequest } from '../utils/api'

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

const DEFAULT_USER_LOCATION = {
  lat: 10.7769,
  lng: 106.7009,
}

const FALLBACK_IMAGES = [
  '/laundryshop1.jpg',
  '/laundryshop2.jpg',
  '/laundryshop3.jpg',
  '/laundryshop4.jpg',
  '/laundryshop5.jpg',
]

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
  const [shops, setShops] = useState([])
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 100,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
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

  useEffect(() => {
    let ignore = false

    const loadShops = async () => {
      const params = new URLSearchParams({
        page: '0',
        size: '100',
        sort: activeSort,
        topStar: String(filterValues['top-star']),
        userLat: String(DEFAULT_USER_LOCATION.lat),
        userLng: String(DEFAULT_USER_LOCATION.lng),
      })

      if (filterValues.nearby !== null) params.set('nearby', String(filterValues.nearby))
      if (filterValues.express !== null) params.set('express', String(filterValues.express))
      if (filterValues.budget !== null) params.set('budget', String(filterValues.budget))

      setIsLoading(true)
      setLoadError('')

      try {
        const response = await apiRequest(`/api/v1/shops?${params.toString()}`)
        if (ignore) return

        const data = response?.data || {}
        const normalizedShops = (data.items || []).map((shop, index) => ({
          id: shop.id,
          name: shop.name || '',
          rating: Number(shop.rating || 0),
          image: shop.imageUrl || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
          price: Number(shop.startingPrice || 0),
          distanceKm: typeof shop.distanceKm === 'number' ? shop.distanceKm : null,
          deliveryHours: typeof shop.deliveryHours === 'number' ? shop.deliveryHours : null,
          deliveryLabel: shop.deliveryLabel || '',
        }))

        setShops(normalizedShops)
        setPagination({
          totalElements: Number(data.totalElements || normalizedShops.length),
          totalPages: Number(data.totalPages || 1),
          currentPage: Number(data.currentPage || 0),
          pageSize: Number(data.pageSize || 100),
        })
      } catch {
        if (!ignore) {
          setShops([])
          setPagination((prev) => ({ ...prev, totalElements: 0, totalPages: 0 }))
          setLoadError(t('shops.loadFailed'))
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadShops()

    return () => {
      ignore = true
    }
  }, [activeSort, filterValues, t])

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
        [shop.name, shop.deliveryLabel, String(shop.price)]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery))
      )
    }

    if (activeSort === 'top-rated')
      result.sort((a, b) => b.rating - a.rating || (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
    if (activeSort === 'nearest')
      result.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity) || b.rating - a.rating)
    if (activeSort === 'fastest')
      result.sort((a, b) => (a.deliveryHours ?? Infinity) - (b.deliveryHours ?? Infinity) || (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
    if (activeSort === 'price')
      result.sort((a, b) => a.price - b.price || (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))

    return result
  }, [activeSort, filterValues, searchQuery, shops])

  const formatVnd = (value) =>
    Math.round(value || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

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
              <span className="allshops-hero-stat">{pagination.totalElements}</span>
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
            {isLoading ? (
              t('common.loading')
            ) : (
              <>
                {t('shops.showing')} <strong>{displayedShops.length}</strong> {t('shops.of')} {pagination.totalElements} {t('shops.shops')}
              </>
            )}
          </span>
          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              <X size={13} />
              {t('shops.clearFilters')}
            </button>
          )}
        </div>

        {/* ── Grid ── */}
        {loadError ? (
          <div className="allshops-empty">
            <PackageSearch size={48} strokeWidth={1.2} className="empty-icon" />
            <p>{loadError}</p>
            <span>{t('shops.noResultsHint')}</span>
          </div>
        ) : isLoading ? (
          <section className="allshops-grid" aria-busy="true">
            {Array.from({ length: 6 }, (_, index) => (
              <article className="shop-card shop-card-skeleton" key={index}>
                <div className="shop-card-image-wrapper" />
                <div className="shop-card-body">
                  <span />
                  <strong />
                  <p />
                  <p />
                </div>
              </article>
            ))}
          </section>
        ) : displayedShops.length === 0 ? (
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
                      {shop.distanceKm !== null ? `${shop.distanceKm.toFixed(1)} km` : t('shops.distance')}
                    </span>
                    <span className="shop-card-meta-item">
                      <Clock size={12} />
                      {shop.deliveryHours !== null ? `${shop.deliveryHours} ${t('shops.hourShort')} · ${t('shops.delivery')}` : shop.deliveryLabel || t('shops.delivery')}
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
      </main>
    </div>
  )
}

export default AllShops

