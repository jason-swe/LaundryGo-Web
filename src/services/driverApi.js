import { authenticatedApiRequest } from '../utils/api'

const STATUS_TO_VIEW = {
  ASSIGNED: 'pending',
  ACCEPTED: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  FAILED: 'cancelled',
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

function formatHistoryDate(value) {
  if (!value) return new Date().toISOString().slice(0, 10)
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10)
  return date.toISOString().slice(0, 10)
}

export function mapDriverTask(item = {}) {
  const status = mapStatus(item.taskStatus)
  return {
    id: item.taskId,
    taskId: item.taskId,
    type: String(item.taskType || 'pickup').toLowerCase(),
    orderId: item.orderCode || `#${item.orderId}`,
    customer: {
      name: item.customerName || 'Customer',
      phone: item.customerPhone || '',
      address: item.taskAddress || '',
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
    rawStatus: item.taskStatus,
    orderStatus: item.orderStatus,
  }
}

export function mapDriverHistoryDay(day = {}) {
  return {
    date: day.date,
    label: day.label,
    items: (day.items || []).map((item) => ({
      id: item.taskId,
      taskId: item.taskId,
      type: String(item.taskType || 'pickup').toLowerCase(),
      orderId: item.orderCode || `#${item.orderId}`,
      customer: {
        name: item.customerName || 'Customer',
        address: item.taskAddress || '',
      },
      date: item.serviceDate || day.date,
      completedAt: item.timeSlotLabel || item.timeSlot || '',
      status: mapStatus(item.taskStatus),
      fee: Number(item.fee || 0),
      customerRating: item.rating || null,
      cancelReason: mapStatus(item.taskStatus) === 'cancelled' ? 'Cancelled' : '',
    })),
  }
}

function mapDriverHistoryItem(item = {}) {
  return {
    id: item.taskId,
    taskId: item.taskId,
    type: String(item.taskType || 'pickup').toLowerCase(),
    orderId: item.orderCode || `#${item.orderId}`,
    customer: {
      name: item.customerName || 'Customer',
      address: item.taskAddress || '',
    },
    date: formatHistoryDate(item.handledAt),
    completedAt: formatCompletedTime(item.handledAt) || item.timeSlotLabel || item.timeSlot || '',
    status: mapStatus(item.taskStatus),
    fee: Number(item.fee || item.orderAmount || 0),
    customerRating: item.rating || null,
    cancelReason: mapStatus(item.taskStatus) === 'cancelled' ? 'Failed' : '',
  }
}

function groupHistoryItems(items = []) {
  const groups = items.map(mapDriverHistoryItem).reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = []
    acc[item.date].push(item)
    return acc
  }, {})

  return Object.entries(groups)
    .sort(([a], [b]) => new Date(b) - new Date(a))
    .map(([date, items]) => ({ date, label: date, items }))
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
  const taskPage = data.items ? data : data.tasks || {}

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
  const historyPage = data.items ? data : data.history || {}

  return {
    summary: data.summary || null,
    days: data.history ? (historyPage.items || []).map(mapDriverHistoryDay) : groupHistoryItems(historyPage.items || []),
    pagination: {
      totalElements: historyPage.totalElements || 0,
      totalPages: historyPage.totalPages || 0,
      currentPage: historyPage.currentPage || 0,
      pageSize: historyPage.pageSize || size,
    },
  }
}

export async function acceptDriverTask(taskId) {
  const payload = await authenticatedApiRequest(`/api/v1/shippers/tasks/${taskId}/accept`, {
    method: 'PUT',
  })
  return mapDriverTask(unwrap(payload, {}))
}

export async function updateDriverTaskStatus(taskId, status) {
  const payload = await authenticatedApiRequest(`/api/v1/shippers/tasks/${taskId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
  return mapDriverTask(unwrap(payload, {}))
}
