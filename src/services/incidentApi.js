import { authenticatedApiRequest } from '../utils/api'

const unwrapData = (payload) => payload?.data ?? payload

const STATUS_TO_VIEW = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  RESOLVED: 'resolved',
}

export function mapShopIncident(incident = {}) {
  const status = STATUS_TO_VIEW[String(incident.status || '').toUpperCase()] || 'pending'

  return {
    id: String(incident.id ?? ''),
    title: incident.title || 'Untitled incident',
    category: incident.category || 'other',
    priority: String(incident.priority || 'medium').toLowerCase(),
    description: incident.description || '',
    affectedOrders: incident.affectedOrders || '',
    status,
    resolution: incident.resolution || '',
    assignedTo: incident.assignedTo || '',
    createdAt: incident.createdAt || incident.reportedDate || '',
    resolvedAt: incident.resolvedAt || incident.resolvedDate || '',
  }
}

export async function getShopIncidents() {
  const payload = await authenticatedApiRequest('/api/v1/shop-owner/incidents')
  const incidents = unwrapData(payload)
  return Array.isArray(incidents) ? incidents.map(mapShopIncident) : []
}

export async function createIncidentReport(report) {
  const payload = await authenticatedApiRequest('/api/v1/incidents', {
    method: 'POST',
    body: JSON.stringify(report),
  })
  return unwrapData(payload)
}
