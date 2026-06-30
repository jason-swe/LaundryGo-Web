import { authenticatedApiRequest } from '../utils/api'

function unwrap(payload, fallback) {
  return payload?.data ?? fallback
}

const MACHINE_STATUS_TO_VIEW = {
  AVAILABLE: 'empty',
  IN_USE: 'washing',
  MAINTENANCE: 'maintenance',
  OUT_OF_ORDER: 'maintenance',
}

const MACHINE_STATUS_TO_API = {
  empty: 'AVAILABLE',
  washing: 'IN_USE',
  drying: 'IN_USE',
  ironing: 'IN_USE',
  maintenance: 'MAINTENANCE',
}

function toNumeric(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export function mapShopService(item = {}) {
  return {
    id: `S-${String(item.id).padStart(2, '0')}`,
    apiId: item.id,
    name: item.serviceName || item.name || '',
    categoryId: item.serviceCategoryId ?? null,
    category: item.categoryName || '',
    pricingType: item.pricingType || 'kg',
    price: Number(item.price || 0),
    minOrder: Number(item.minOrder || 0),
    estimatedTime: item.estimatedTime || '',
    description: item.description || '',
    available: item.available !== false,
  }
}

export function mapShopMachine(item = {}) {
  const viewStatus = MACHINE_STATUS_TO_VIEW[item.status] || 'empty'
  return {
    id: `M-${String(item.id).padStart(2, '0')}`,
    apiId: item.id,
    name: item.name || '',
    type: item.machineType || 'Washer',
    status: viewStatus,
    location: item.location || '',
    capacity: item.capacity || '',
    model: item.model || '',
    purchaseDate: item.purchaseDate || '',
    nextMaintenance: item.nextMaintenance || '',
    totalCycles: item.totalCycles || 0,
  }
}

export function mapShopInventory(item = {}) {
  return {
    id: `SUP-${String(item.id).padStart(2, '0')}`,
    apiId: item.id,
    name: item.name || '',
    current: Number(item.current || 0),
    max: Number(item.max || 0),
    unit: item.unit || 'L',
    reorderPoint: Number(item.reorderPoint || 0),
    supplier: item.supplier || '',
    category: item.category || '',
    storageLocation: item.storageLocation || '',
    lastReorder: item.lastReorder || '',
  }
}

export function mapShopCategory(item = {}) {
  return {
    id: item.id,
    name: item.name || '',
  }
}

function servicePayload(form = {}) {
  return {
    serviceName: form.name?.trim(),
    serviceCategoryId: form.categoryId ? Number(form.categoryId) : null,
    price: toNumeric(form.price),
    minOrder: toNumeric(form.minOrder),
    pricingType: form.pricingType || 'kg',
    estimatedTime: form.estimatedTime?.trim(),
    description: form.description?.trim() || '',
    available: Boolean(form.available),
  }
}

function machinePayload(form = {}) {
  return {
    name: form.name?.trim(),
    machineType: form.type || 'Washer',
    status: MACHINE_STATUS_TO_API[form.status] || 'AVAILABLE',
    location: form.location?.trim() || '',
    capacity: form.capacity?.trim() || '',
    model: form.model?.trim() || '',
    purchaseDate: form.purchaseDate || null,
    nextMaintenance: form.nextMaintenance || null,
  }
}

function inventoryPayload(form = {}) {
  return {
    name: form.name?.trim(),
    quantity: toNumeric(form.current),
    unit: form.unit || '',
    maxQuantity: toNumeric(form.max),
    reorderPoint: toNumeric(form.reorderPoint),
    supplier: form.supplier?.trim() || '',
    category: form.category?.trim() || '',
    storageLocation: form.storageLocation?.trim() || '',
    lastReorder: form.lastReorder || null,
  }
}

export async function getShopOwnerOperations() {
  const [categoriesPayload, servicesPayload, machinesPayload, inventoryPayload] = await Promise.all([
    authenticatedApiRequest('/api/v1/shop-owner/services/categories'),
    authenticatedApiRequest('/api/v1/shop-owner/services'),
    authenticatedApiRequest('/api/v1/shop-owner/machines'),
    authenticatedApiRequest('/api/v1/shop-owner/inventory'),
  ])

  return {
    categories: unwrap(categoriesPayload, []).map(mapShopCategory),
    services: unwrap(servicesPayload, []).map(mapShopService),
    machines: unwrap(machinesPayload, []).map(mapShopMachine),
    supplies: unwrap(inventoryPayload, []).map(mapShopInventory),
  }
}

export async function createShopService(form) {
  const payload = await authenticatedApiRequest('/api/v1/shop-owner/services', {
    method: 'POST',
    body: JSON.stringify(servicePayload(form)),
  })
  return mapShopService(unwrap(payload, {}))
}

export async function updateShopService(serviceId, form) {
  const payload = await authenticatedApiRequest(`/api/v1/shop-owner/services/${serviceId}`, {
    method: 'PUT',
    body: JSON.stringify(servicePayload(form)),
  })
  return mapShopService(unwrap(payload, {}))
}

export async function setShopServiceAvailability(serviceId, available) {
  const payload = await authenticatedApiRequest(`/api/v1/shop-owner/services/${serviceId}/availability`, {
    method: 'PATCH',
    body: JSON.stringify({ available }),
  })
  return mapShopService(unwrap(payload, {}))
}

export async function deleteShopService(serviceId) {
  await authenticatedApiRequest(`/api/v1/shop-owner/services/${serviceId}`, { method: 'DELETE' })
}

export async function createShopMachine(form) {
  const payload = await authenticatedApiRequest('/api/v1/shop-owner/machines', {
    method: 'POST',
    body: JSON.stringify(machinePayload(form)),
  })
  return mapShopMachine(unwrap(payload, {}))
}

export async function updateShopMachine(machineId, form) {
  const payload = await authenticatedApiRequest(`/api/v1/shop-owner/machines/${machineId}`, {
    method: 'PUT',
    body: JSON.stringify(machinePayload(form)),
  })
  return mapShopMachine(unwrap(payload, {}))
}

export async function deleteShopMachine(machineId) {
  await authenticatedApiRequest(`/api/v1/shop-owner/machines/${machineId}`, { method: 'DELETE' })
}

export async function createShopInventoryItem(form) {
  const payload = await authenticatedApiRequest('/api/v1/shop-owner/inventory', {
    method: 'POST',
    body: JSON.stringify(inventoryPayload(form)),
  })
  return mapShopInventory(unwrap(payload, {}))
}

export async function updateShopInventoryItem(itemId, form) {
  const payload = await authenticatedApiRequest(`/api/v1/shop-owner/inventory/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(inventoryPayload(form)),
  })
  return mapShopInventory(unwrap(payload, {}))
}

export async function deleteShopInventoryItem(itemId) {
  await authenticatedApiRequest(`/api/v1/shop-owner/inventory/${itemId}`, { method: 'DELETE' })
}
