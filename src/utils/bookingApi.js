import { api } from './api'

const FALLBACK_IMAGES = [
  '/laundryshop1.jpg',
  '/laundryshop2.jpg',
  '/laundryshop3.jpg',
  '/laundryshop4.jpg',
  '/laundryshop5.jpg',
]

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const buildQuery = (params = {}) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.set(key, String(value))
  })

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

const getFallbackImage = (id, index = 0) => {
  const numericId = Number(String(id ?? '').replace(/\D/g, ''))
  const imageIndex = Number.isFinite(numericId) && numericId > 0 ? numericId - 1 : index
  return FALLBACK_IMAGES[Math.abs(imageIndex) % FALLBACK_IMAGES.length]
}

const normalizeHours = (hours) => {
  if (hours && typeof hours === 'object') {
    return {
      'Mon-Fri': hours['Mon-Fri'] || hours.weekdays || hours.weekday || '7AM-9PM',
      'Sat-Sun': hours['Sat-Sun'] || hours.weekend || '6AM-10PM',
    }
  }

  return { 'Mon-Fri': '7AM-9PM', 'Sat-Sun': '6AM-10PM' }
}

export const normalizeShopListItem = (shop = {}, index = 0) => {
  const id = shop.id ?? shop.shopId ?? shop.accountId ?? `shop-${index + 1}`
  const distanceKm = toNumber(shop.distanceKm ?? shop.distance, 0)
  const deliveryHours = toNumber(shop.deliveryHours ?? shop.turnaround, 24)
  const price = toNumber(shop.startingPrice ?? shop.price, 0)
  const rating = toNumber(shop.rating, 0)

  return {
    ...shop,
    id: String(id),
    name: shop.name || shop.shopName || 'Laundry partner',
    image: shop.imageUrl || shop.image || getFallbackImage(id, index),
    rating,
    price,
    address: shop.address || shop.deliveryLabel || '',
    distanceKm,
    deliveryHours,
    deliveryLabel: shop.deliveryLabel || (deliveryHours ? `${deliveryHours}h` : ''),
  }
}

export const normalizeShopDetail = (shop = {}, fallback = {}, index = 0) => {
  const id = shop.id ?? shop.shopId ?? fallback.id ?? `shop-${index + 1}`
  const base = normalizeShopListItem({ ...fallback, ...shop, id }, index)

  return {
    ...base,
    address: shop.address || fallback.address || 'Updating address data',
    distance: shop.distance || (base.distanceKm ? `${base.distanceKm.toFixed(1)} km` : fallback.distance || '2.5 km'),
    delivery: shop.delivery || fallback.delivery || `${base.deliveryHours || 24}h Delivery`,
    hours: normalizeHours(shop.hours || fallback.hours),
    turnaround: shop.turnaround || shop.deliveryLabel || fallback.turnaround || `${base.deliveryHours || 24} Hours`,
    promo: fallback.promo || {
      text: 'Welcome offer! 10% off your first order with code:',
      code: `WELCOME-${String(id).slice(-3)}`,
    },
    reviews: fallback.reviews || [
      { author: 'Customer A', rating: 5, text: 'Good service and quick support.' },
      { author: 'Customer B', rating: 4, text: 'Delivery is on time and clothes are clean.' },
    ],
  }
}

const normalizePricingType = (service = {}) => {
  const pricingType = String(service.pricingType || '').toLowerCase()
  if (pricingType) return pricingType

  const unit = String(service.serviceUnit || service.unit || service.categoryName || '').toLowerCase()
  if (unit.includes('kg')) return 'kg'
  if (unit.includes('meter')) return 'meter'
  return 'item'
}

export const normalizeServiceItem = (service = {}, categoryName = '') => ({
  id: service.id ?? service.serviceId,
  serviceId: service.id ?? service.serviceId,
  label: service.serviceName || service.name || service.label || 'Laundry service',
  price: toNumber(service.price ?? service.unitPrice, 0),
  notes: service.description || service.notes || '',
  description: service.description || service.notes || '',
  category: categoryName || service.categoryName || service.category || '',
  estimatedTime: service.estimatedTime || '24 hours',
  minOrder: toNumber(service.minOrder, 1),
  pricingType: normalizePricingType(service),
  serviceUnit: service.serviceUnit || service.unit || '',
  available: service.available ?? true,
  tags: service.tags || [],
})

export const normalizeServiceSections = (categories = []) => {
  if (!Array.isArray(categories) || categories.length === 0) return []

  return categories
    .map((category, index) => ({
      id: String(category.id ?? category.serviceCategoryId ?? `category-${index + 1}`),
      name: category.name || category.categoryName || `Category ${index + 1}`,
      services: (category.services || []).map((service) =>
        normalizeServiceItem(service, category.name || category.categoryName)
      ),
    }))
    .filter((category) => category.services.length > 0)
}

export const bookingApi = {
  listShops: (params) => api.get(`/api/v1/shops${buildQuery(params)}`),
  getShop: (shopId, params) => api.get(`/api/v1/shops/${shopId}${buildQuery(params)}`),
  getShopServiceCategories: (shopId) => api.get(`/api/v1/shops/${shopId}/service-categories`),
  getService: (serviceId) => api.get(`/api/v1/services/${serviceId}`),
}
