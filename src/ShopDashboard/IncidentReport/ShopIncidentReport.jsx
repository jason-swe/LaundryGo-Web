import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle, Clock, Eye, Plus, Search, X } from 'lucide-react'
import './ShopIncidentReport.css'
import toast from '../../utils/toast'
import { createIncidentReport, getShopIncidents } from '../../services/incidentApi'

const defaultForm = {
  title: '',
  category: 'app-error',
  priority: 'medium',
  description: '',
  affectedOrders: '',
}

const statusIcon = {
  pending: <AlertCircle size={14} />,
  'in-progress': <Clock size={14} />,
  resolved: <CheckCircle size={14} />,
}

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString()
}

const formatStatus = (status) => String(status || '').replace(/-/g, ' ')

function ShopIncidentReport() {
  const [incidents, setIncidents] = useState([])
  const [reportForm, setReportForm] = useState(defaultForm)
  const [viewIncident, setViewIncident] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadError, setLoadError] = useState('')

  const loadIncidents = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')
    try {
      setIncidents(await getShopIncidents())
    } catch (error) {
      setIncidents([])
      setLoadError(error?.message || 'Could not load incident reports.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadIncidents()
  }, [loadIncidents])

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return incidents.filter((incident) => {
      const matchesStatus = filterStatus === 'all' || incident.status === filterStatus
      const searchable = [incident.id, incident.title, incident.description, incident.category].join(' ').toLowerCase()
      return matchesStatus && (!query || searchable.includes(query))
    })
  }, [filterStatus, incidents, searchQuery])

  const counts = {
    total: incidents.length,
    pending: incidents.filter((incident) => incident.status === 'pending').length,
    inProgress: incidents.filter((incident) => incident.status === 'in-progress').length,
    resolved: incidents.filter((incident) => incident.status === 'resolved').length,
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!reportForm.title.trim() || !reportForm.description.trim()) {
      toast.warning('Title and description are required.')
      return
    }

    setIsSubmitting(true)
    try {
      await createIncidentReport({
        ...reportForm,
        title: reportForm.title.trim(),
        description: reportForm.description.trim(),
        affectedOrders: reportForm.affectedOrders.trim(),
      })
      setReportForm(defaultForm)
      await loadIncidents()
      toast.success('Incident report submitted.')
    } catch (error) {
      toast.error(error?.message || 'Could not submit incident report.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="shop-incidents">
      <div className="shop-incidents-header">
        <div>
          <h1 className="shop-incidents-title"><AlertTriangle size={18} style={{ marginRight: 8 }} />Incident reports</h1>
          <p className="shop-incidents-subtitle">Report issues and follow the resolution progress for your shop.</p>
        </div>
      </div>

      <div className="inc-stats-row">
        {[
          { label: 'Total', value: counts.total, type: 'info' },
          { label: 'Pending', value: counts.pending, type: 'warning' },
          { label: 'In progress', value: counts.inProgress, type: 'info' },
          { label: 'Resolved', value: counts.resolved, type: 'success' },
        ].map((stat) => (
          <div key={stat.label} className={`inc-stat-card inc-stat-${stat.type}`}>
            <div className="inc-stat-value">{stat.value}</div>
            <div className="inc-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="shop-incidents-content">
        <div className="shop-incidents-form-section">
          <h2 className="shop-incidents-section-title"><Plus size={16} />New incident report</h2>
          <form className="shop-incidents-form" onSubmit={handleSubmit}>
            <div className="shop-incidents-field">
              <label className="shop-incidents-label" htmlFor="incident-title">Title *</label>
              <input id="incident-title" className="shop-incidents-input" placeholder="Brief description of the issue" value={reportForm.title} onChange={(event) => setReportForm((current) => ({ ...current, title: event.target.value }))} />
            </div>

            <div className="shop-incidents-field-row">
              <div className="shop-incidents-field">
                <label className="shop-incidents-label" htmlFor="incident-category">Category</label>
                <select id="incident-category" className="shop-incidents-select" value={reportForm.category} onChange={(event) => setReportForm((current) => ({ ...current, category: event.target.value }))}>
                  <option value="app-error">Application error</option>
                  <option value="payment-issue">Payment issue</option>
                  <option value="notification-issue">Notification issue</option>
                  <option value="ui-bug">UI bug</option>
                  <option value="feature-bug">Feature issue</option>
                  <option value="data-issue">Data issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="shop-incidents-field">
                <label className="shop-incidents-label" htmlFor="incident-priority">Priority</label>
                <select id="incident-priority" className="shop-incidents-select" value={reportForm.priority} onChange={(event) => setReportForm((current) => ({ ...current, priority: event.target.value }))}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="shop-incidents-field">
              <label className="shop-incidents-label" htmlFor="incident-orders">Affected orders</label>
              <input id="incident-orders" className="shop-incidents-input" placeholder="#ORD-10234, #ORD-10235" value={reportForm.affectedOrders} onChange={(event) => setReportForm((current) => ({ ...current, affectedOrders: event.target.value }))} />
            </div>

            <div className="shop-incidents-field">
              <label className="shop-incidents-label" htmlFor="incident-description">Description *</label>
              <textarea id="incident-description" className="shop-incidents-textarea" rows={5} placeholder="Describe the issue, its impact, and the expected resolution." value={reportForm.description} onChange={(event) => setReportForm((current) => ({ ...current, description: event.target.value }))} />
            </div>

            <button type="submit" className="shop-incidents-submit-btn" disabled={isSubmitting}>
              <Plus size={16} />{isSubmitting ? 'Submitting…' : 'Submit report'}
            </button>
          </form>
        </div>

        <div className="shop-incidents-list-section">
          <div className="inc-list-header">
            <h2 className="shop-incidents-section-title">All reports</h2>
            <div className="inc-list-controls">
              <div className="inc-search-wrap">
                <Search size={15} />
                <input className="inc-search-input" placeholder="Search incidents" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
              </div>
              <div className="inc-filter-tabs">
                {[['all', 'All'], ['pending', 'Pending'], ['in-progress', 'In progress'], ['resolved', 'Resolved']].map(([value, label]) => (
                  <button type="button" key={value} className={`inc-filter-btn ${filterStatus === value ? 'active' : ''}`} onClick={() => setFilterStatus(value)}>{label}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="shop-incidents-list">
            {isLoading && <div className="inc-empty">Loading incident reports…</div>}
            {!isLoading && loadError && <div className="inc-empty"><p>{loadError}</p><button type="button" className="shop-incidents-view-btn" onClick={() => void loadIncidents()}>Retry</button></div>}
            {!isLoading && !loadError && filtered.length === 0 && <div className="inc-empty">No incident reports match the current filters.</div>}
            {!isLoading && !loadError && filtered.map((incident) => (
              <div key={incident.id} className="shop-incidents-report-card">
                <div className="shop-incidents-report-header">
                  <span className="shop-incidents-report-id">#{incident.id}</span>
                  <span className={`shop-incidents-priority shop-incidents-priority-${incident.priority}`}>{incident.priority}</span>
                </div>
                <h3 className="shop-incidents-report-title">{incident.title}</h3>
                <div className="shop-incidents-report-meta">
                  <span className="shop-incidents-report-category">{incident.category.replace(/-/g, ' ')}</span>
                  <span className="shop-incidents-report-date">{formatDate(incident.createdAt)}</span>
                </div>
                <div className="shop-incidents-report-footer">
                  <span className={`shop-incidents-status shop-incidents-status-${incident.status}`}>{statusIcon[incident.status]} {formatStatus(incident.status)}</span>
                  <button type="button" className="shop-incidents-view-btn" onClick={() => setViewIncident(incident)}><Eye size={14} />View</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {viewIncident && (
        <div className="inc-modal-overlay" onClick={() => setViewIncident(null)}>
          <div className="inc-modal" onClick={(event) => event.stopPropagation()}>
            <div className="inc-modal-header">
              <div><span className="shop-incidents-report-id">#{viewIncident.id}</span><h2>{viewIncident.title}</h2></div>
              <button type="button" className="inc-modal-close" aria-label="Close" onClick={() => setViewIncident(null)}><X size={18} /></button>
            </div>
            <div className="inc-modal-body">
              <div className="inc-detail-grid">
                <div className="inc-detail-item"><span className="inc-dl">Status</span><span className={`shop-incidents-status shop-incidents-status-${viewIncident.status}`}>{statusIcon[viewIncident.status]} {formatStatus(viewIncident.status)}</span></div>
                <div className="inc-detail-item"><span className="inc-dl">Priority</span><span className={`shop-incidents-priority shop-incidents-priority-${viewIncident.priority}`}>{viewIncident.priority}</span></div>
                <div className="inc-detail-item"><span className="inc-dl">Category</span><span className="inc-dv">{viewIncident.category.replace(/-/g, ' ')}</span></div>
                <div className="inc-detail-item"><span className="inc-dl">Reported</span><span className="inc-dv">{formatDate(viewIncident.createdAt)}</span></div>
                <div className="inc-detail-item"><span className="inc-dl">Assigned to</span><span className="inc-dv">{viewIncident.assignedTo || '—'}</span></div>
                {viewIncident.resolvedAt && <div className="inc-detail-item"><span className="inc-dl">Resolved</span><span className="inc-dv">{formatDate(viewIncident.resolvedAt)}</span></div>}
                {viewIncident.affectedOrders && <div className="inc-detail-item" style={{ gridColumn: '1/-1' }}><span className="inc-dl">Affected orders</span><span className="inc-dv">{viewIncident.affectedOrders}</span></div>}
                <div className="inc-detail-item" style={{ gridColumn: '1/-1' }}><span className="inc-dl">Description</span><span className="inc-dv">{viewIncident.description}</span></div>
                {viewIncident.resolution && <div className="inc-detail-item" style={{ gridColumn: '1/-1' }}><span className="inc-dl">Resolution</span><span className="inc-dv inc-resolution-value">{viewIncident.resolution}</span></div>}
              </div>
            </div>
            <div className="inc-modal-footer"><button type="button" className="inc-close-btn" onClick={() => setViewIncident(null)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShopIncidentReport
