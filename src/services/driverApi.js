import { authenticatedApiRequest } from '../utils/api'

const STATUS_TO_VIEW = {
  PENDING: 'pending',
  CONFIRMED: 'pending',
  PROCESSING: 'in-progress',
  READY_FOR_PICKUP: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

function unwrap(payload, fallback) {
  return payload?.data ?? fallback
}

function mapStatus(status) {
  return STATUS_TO_VIEW[String(status || '').toUpperCase()] || 'pending'
}

function formatCompletedTime(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function mapDriverTask(item = {}) {
  const status = mapStatus(item.orderStatus)
  return {
    id: `${item.taskType || 'task'}-${item.orderId}`,
    type: String(item.taskType || 'pickup').toLowerCase(),
    orderId: item.orderCode || `#${item.orderId}`,
    customer: {
      name: item.customerName || 'Customer',
      phone: item.customerPhone || '',
      address: item.address || '',
    },
    shop: {
      name: item.shopName || '',
      address: item.shopAddress || '',
    },
    service: item.serviceSummary || 'Laundry service',
    scheduledTime: item.timeSlotLabel || item.timeSlot || '',
    status,
    completedAt: formatCompletedTime(item.completedAt),
    notes: '',
    fee: Number(item.fee || 0),
    rawStatus: item.orderStatus,
  }
}

export function mapDriverHistoryDay(day = {}) {
  return {
    date: day.date,
    label: day.label,
    items: (day.items || []).map((item) => ({
      id: `${item.taskType || 'history'}-${item.orderId}`,
      type: String(item.taskType || 'pickup').toLowerCase(),
      orderId: item.orderCode || `#${item.orderId}`,
      customer: {
        name: item.customerName || 'Customer',
        address: item.address || '',
      },
      date: item.serviceDate || day.date,
      completedAt: item.timeSlotLabel || item.timeSlot || '',
      status: mapStatus(item.orderStatus),
      fee: Number(item.fee || 0),
      customerRating: item.rating || null,
      cancelReason: mapStatus(item.orderStatus) === 'cancelled' ? 'Cancelled' : '',
    })),
  }
}

export async function getDriverProfile() {
  const payload = await authenticatedApiRequest('/api/v1/shippers/profile')
  return unwrap(payload, null)
}

export async function getTodayDriverTasks({ status, page = 0, size = 50 } = {}) {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  params.set('page', String(page))
  params.set('size', String(size))

  const payload = await authenticatedApiRequest(`/api/v1/shippers/tasks/today?${params}`)
  const data = unwrap(payload, {})
  const taskPage = data.tasks || {}

  return {
    date: data.date,
    counts: data.counts || null,
    tasks: (taskPage.items || []).map(mapDriverTask),
    pagination: {
      totalElements: taskPage.totalElements || 0,
      totalPages: taskPage.totalPages || 0,
      currentPage: taskPage.currentPage || 0,
      pageSize: taskPage.pageSize || size,
    },
  }
}

export async function getDriverHistory({ status, page = 0, size = 20 } = {}) {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  params.set('page', String(page))
  params.set('size', String(size))

  const payload = await authenticatedApiRequest(`/api/v1/shippers/history?${params}`)
  const data = unwrap(payload, {})
  const historyPage = data.history || {}

  return {
    summary: data.summary || null,
    days: (historyPage.items || []).map(mapDriverHistoryDay),
    pagination: {
      totalElements: historyPage.totalElements || 0,
      totalPages: historyPage.totalPages || 0,
      currentPage: historyPage.currentPage || 0,
      pageSize: historyPage.pageSize || size,
    },
  }
}
