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
import { getShopCoverImage, getShopFallbackImage } from '../data/shopMedia'

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

const hasNumber = (value) => typeof value === 'number' && Number.isFinite(value)

const toNullableNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const isShopOpenToday = (shop) => {
  if (typeof shop.isOpenToday === 'boolean') return shop.isOpenToday
  const status = String(shop.openingStatus || shop.statusLabel || '').toLowerCase()
  return status.includes('open') || status.includes('m?')
}

const normalizeUnit = (value, fallbackLabel = '') => {
  const raw = String(value || fallbackLabel).toLowerCase()
  if (raw.includes('kg') || raw.includes('kilo')) return 'kg'
  if (raw.includes('meter') || raw === 'm') return 'meter'
  return 'item'
}

const isWashAndFoldCategory = (categoryName = '') => {
  const name = categoryName.toLowerCase()
  const mentionsWash = name.includes('wash') || name.includes('fold') || name.includes('laundry') || name.includes('gi?t')
  const excluded = name.includes('dry') || name.includes('iron') || name.includes('press') || name.includes('khô') || name.includes('?i')
  return mentionsWash && !excluded
}

const getServicesFromCategory = (category) =>
  Array.isArray(category?.services) ? category.services : []

const getServiceName = (service) =>
  service?.serviceName || service?.name || service?.label || ''

const getWashAndFoldStartingPrice = (categories = []) => {
  const washFoldServices = categories.flatMap((category) => {
    const categoryName = category?.name || category?.categoryName || ''
    const services = getServicesFromCategory(category)
    if (isWashAndFoldCategory(categoryName)) return services

    return services.filter((service) => isWashAndFoldCategory(getServiceName(service)))
  })

  const pricedServices = washFoldServices
    .map((service) => {
      const amount = toNullableNumber(service?.price)
      if (amount === null) return null
      const label = getServiceName(service)
      return {
        amount,
        unit: normalizeUnit(service?.pricingType || service?.serviceUnit, label),
        serviceName: label,
      }
    })
    .filter(Boolean)

  if (pricedServices.length === 0) return null
  return pricedServices.reduce((lowest, current) => (current.amount < lowest.amount ? current : lowest))
}

const loadWashAndFoldStartingPrice = async (shopId) => {
  try {
    const response = await apiRequest(`/api/v1/shops/${shopId}/service-categories`)
    const categories = Array.isArray(response?.data) ? response.data : []
    return getWashAndFoldStartingPrice(categories)
  } catch {
    return null
  }
}

const getFilterLabel = (id, value, t) => {
  if (id === 'nearby') return value === null ? t('shops.distance') : `${t('shops.within')} ${value} km`
  if (id === 'express') return value === null ? t('shops.speed') : `${t('shops.max')} ${value}${t('shops.hours')}`
  if (id === 'budget') return value === null ? t('shops.budget') : `â‰¤${value / 1000}k/kg`
  return ''
}

const formatOptionLabel = (id, value, t) => {
  if (id === 'nearby') return `${value} km`
  if (id === 'express') return `${value} ${t('shops.hours')}`
  if (id === 'budget') return `â‰¤${value / 1000}k VND/kg`
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
        const normalizedShops = await Promise.all((data.items || []).map(async (shop, index) => {
          const cover = getShopCoverImage(shop, index)
          const startingService = await loadWashAndFoldStartingPrice(shop.id)

          return {
            id: shop.id,
            name: shop.name || '',
            rating: toNullableNumber(shop.rating),
            ratingCount: toNullableNumber(shop.ratingCount || shop.reviewCount),
            image: cover.image,
            hasRealImage: cover.hasRealImage,
            startingService,
            distanceKm: toNullableNumber(shop.distanceKm),
            deliveryHours: toNullableNumber(shop.deliveryHours),
            deliveryLabel: shop.deliveryLabel || shop.turnaround || '',
            isOpenToday: isShopOpenToday(shop),
            address: shop.address || '',
          }
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
        [
          shop.name,
          shop.address,
          shop.deliveryLabel,
          shop.startingService?.serviceName,
          shop.startingService?.amount !== undefined ? String(shop.startingService.amount) : '',
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery))
      )
    }

    if (activeSort === 'top-rated')
      result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
    if (activeSort === 'nearest')
      result.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity) || (b.rating ?? 0) - (a.rating ?? 0))
    if (activeSort === 'fastest')
      result.sort((a, b) => (a.deliveryHours ?? Infinity) - (b.deliveryHours ?? Infinity) || (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
    if (activeSort === 'price')
      result.sort((a, b) => (a.startingService?.amount ?? Infinity) - (b.startingService?.amount ?? Infinity) || (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))

    return result
  }, [activeSort, filterValues, searchQuery, shops])

  const formatVnd = (value) =>
    Math.round(value || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  const formatStartingService = (service) => {
    if (!service) return t('shopDetail.unavailable')
    return formatVnd(service.amount)
  }

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={13} className={rating !== null && i < Math.round(rating) ? 'star-filled' : 'star-empty'} />
    ))

  const averageTurnaround = useMemo(() => {
    const deliveryHours = shops.map((shop) => shop.deliveryHours).filter(hasNumber)
    if (deliveryHours.length === 0) return null
    const average = deliveryHours.reduce((sum, value) => sum + value, 0) / deliveryHours.length
    return `${Math.round(average)}${t('shops.hourShort')}`
  }, [shops, t])

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
              <span className="allshops-hero-stat">{averageTurnaround || 'â€”'}</span>
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

        {/* â”€â”€ Grid â”€â”€ */}
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
                  <img
                    src={shop.image}
                    alt={shop.name}
                    className="shop-card-image"
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = getShopFallbackImage(shop.id)
                    }}
                  />
                  <div className="shop-card-image-overlay" />
                  {shop.isOpenToday && <span className="shop-card-badge">{t('shops.openToday')}</span>}
                </div>

                <div className="shop-card-body">
                  <div className="shop-card-rating">
                    {renderStars(shop.rating)}
                    <span className="shop-card-rating-value">
                      {shop.rating !== null ? shop.rating.toFixed(1) : t('shopDetail.unavailable')}
                    </span>
                  </div>

                  <h2 className="shop-card-name">{shop.name}</h2>

                  <div className="shop-card-meta">
                    <span className="shop-card-meta-item">
                      <MapPin size={12} />
                      {shop.distanceKm !== null ? `${shop.distanceKm.toFixed(1)} km` : t('shopDetail.unavailable')}
                    </span>
                    <span className="shop-card-meta-item">
                      <Clock size={12} />
                      {shop.deliveryHours !== null ? `${shop.deliveryHours} ${t('shops.hourShort')} - ${t('shops.delivery')}` : shop.deliveryLabel || t('shopDetail.unavailable')}
                    </span>
                  </div>

                  <div className="shop-card-footer">
                    <div className="shop-card-price">
                      <span className="shop-card-price-label">{t('shops.startingFrom')}</span>
                      <span className="shop-card-price-value">
                        {formatStartingService(shop.startingService)}
                        {shop.startingService && <span className="shop-card-price-unit"> VND/{shop.startingService.unit}</span>}
                      </span>
                      {shop.startingService && <span className="shop-card-price-source">Wash and Fold</span>}
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


