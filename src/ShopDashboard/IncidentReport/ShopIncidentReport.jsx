import { useState } from 'react'
import {
    WarningOutlined,
    PlusOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    CloseOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import './ShopIncidentReport.css'
import { incidents as incidentsData } from '../../data'
import toast from '../../utils/toast'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'

const defaultForm = { title: '', category: 'equipment', priority: 'medium', description: '', affectedOrders: '' }

const statusIcon = { resolved: <CheckCircleOutlined />, 'in-progress': <ClockCircleOutlined />, pending: <ExclamationCircleOutlined /> }

function ShopIncidentReport() {
    const [incidents, setIncidents] = useState(incidentsData)
    const [reportForm, setReportForm] = useState(defaultForm)
    const [viewIncident, setViewIncident] = useState(null)
    const [editIncident, setEditIncident] = useState(null)
    const [filterStatus, setFilterStatus] = useState('all')
    const [confirmDialog, setConfirmDialog] = useState({ show: false })

    const filtered = filterStatus === 'all' ? incidents : incidents.filter(i => i.status === filterStatus)

    const counts = {
        total: incidents.length,
        pending: incidents.filter(i => i.status === 'pending').length,
        inProgress: incidents.filter(i => i.status === 'in-progress').length,
        resolved: incidents.filter(i => i.status === 'resolved').length,
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!reportForm.title.trim() || !reportForm.description.trim()) {
            toast.warning('Title and description are required')
            return
        }
        const newIncident = {
            id: `INC-${String(incidents.length + 1).padStart(3, '0')}`,
            title: reportForm.title,
            type: reportForm.category,
            severity: reportForm.priority === 'urgent' ? 'critical' : reportForm.priority,
            status: 'pending',
            reportedBy: 'Shop Staff',
            reportedDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
            resolvedDate: null,
            assignedTo: null,
            description: reportForm.description,
            resolution: null,
            affectedOrders: reportForm.affectedOrders ? reportForm.affectedOrders.split(',').map(s => s.trim()) : [],
            downtime: null,
            cost: 0,
            priority: reportForm.priority
        }
        setIncidents(prev => [newIncident, ...prev])
        toast.success(`Incident ${newIncident.id} submitted successfully!`)
        setReportForm(defaultForm)
    }

    const handleStatusChange = (id, newStatus) => {
        setIncidents(prev => prev.map(i => i.id === id ? {
            ...i,
            status: newStatus,
            resolvedDate: newStatus === 'resolved' ? new Date().toISOString().replace('T', ' ').slice(0, 16) : i.resolvedDate
        } : i))
        if (viewIncident?.id === id) setViewIncident(p => ({ ...p, status: newStatus }))
        toast.success(`Status updated to "${newStatus}"`)
    }

    const handleSaveEdit = () => {
        if (!editIncident.title.trim()) { toast.warning('Title is required'); return }
        setIncidents(prev => prev.map(i => i.id === editIncident.id ? { ...i, ...editIncident } : i))
        toast.success('Incident updated!')
        setEditIncident(null)
    }

    const handleDelete = (incident) => {
        setConfirmDialog({
            show: true,
            title: 'Delete Incident',
            message: `Delete "${incident.title}"? This cannot be undone.`,
            type: 'danger',
            onConfirm: () => {
                setIncidents(prev => prev.filter(i => i.id !== incident.id))
                toast.success(`${incident.id} deleted.`)
                setConfirmDialog({ show: false })
                if (viewIncident?.id === incident.id) setViewIncident(null)
            }
        })
    }

    return (
        <div className="shop-incidents">
            {/* Header */}
            <div className="shop-incidents-header">
                <div>
                    <h1 className="shop-incidents-title">
                        <WarningOutlined style={{ marginRight: 8 }} />Incident Reports
                    </h1>
                    <p className="shop-incidents-subtitle">Report and track operational issues</p>
                </div>
            </div>

            {/* Stats */}
            <div className="inc-stats-row">
                {[
                    { label: 'Total', value: counts.total, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
                    { label: 'Pending', value: counts.pending, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                    { label: 'In Progress', value: counts.inProgress, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
                    { label: 'Resolved', value: counts.resolved, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
                ].map(s => (
                    <div key={s.label} className="inc-stat-card" style={{ borderLeft: `4px solid ${s.color}` }}>
                        <div className="inc-stat-value" style={{ color: s.color }}>{s.value}</div>
                        <div className="inc-stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="shop-incidents-content">
                {/* Submit Form */}
                <div className="shop-incidents-form-section">
                    <h2 className="shop-incidents-section-title"><PlusOutlined /> New Incident Report</h2>
                    <form className="shop-incidents-form" onSubmit={handleSubmit}>
                        <div className="shop-incidents-field">
                            <label className="shop-incidents-label">Title *</label>
                            <input type="text" className="shop-incidents-input"
                                placeholder="Brief description of the issue"
                                value={reportForm.title}
                                onChange={e => setReportForm(p => ({ ...p, title: e.target.value }))} />
                        </div>

                        <div className="shop-incidents-field-row">
                            <div className="shop-incidents-field">
                                <label className="shop-incidents-label">Category</label>
                                <select className="shop-incidents-select" value={reportForm.category}
                                    onChange={e => setReportForm(p => ({ ...p, category: e.target.value }))}>
                                    <option value="equipment">Equipment</option>
                                    <option value="facility">Facility</option>
                                    <option value="quality-issue">Quality</option>
                                    <option value="safety">Safety</option>
                                    <option value="power-outage">Power Outage</option>
                                    <option value="customer-complaint">Customer Complaint</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="shop-incidents-field">
                                <label className="shop-incidents-label">Priority</label>
                                <select className="shop-incidents-select" value={reportForm.priority}
                                    onChange={e => setReportForm(p => ({ ...p, priority: e.target.value }))}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                        </div>

                        <div className="shop-incidents-field">
                            <label className="shop-incidents-label">Affected Orders (comma-separated, optional)</label>
                            <input type="text" className="shop-incidents-input"
                                placeholder="#ORD-10234, #ORD-10235"
                                value={reportForm.affectedOrders}
                                onChange={e => setReportForm(p => ({ ...p, affectedOrders: e.target.value }))} />
                        </div>

                        <div className="shop-incidents-field">
                            <label className="shop-incidents-label">Description *</label>
                            <textarea className="shop-incidents-textarea" rows={5}
                                placeholder="Detailed description of the incident..."
                                value={reportForm.description}
                                onChange={e => setReportForm(p => ({ ...p, description: e.target.value }))} />
                        </div>

                        <button type="submit" className="shop-incidents-submit-btn">
                            <PlusOutlined /> Submit Report
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="shop-incidents-list-section">
                    <div className="inc-list-header">
                        <h2 className="shop-incidents-section-title">All Reports</h2>
                        <div className="inc-filter-tabs">
                            {[['all', 'All'], ['pending', 'Pending'], ['in-progress', 'In Progress'], ['resolved', 'Resolved']].map(([v, l]) => (
                                <button key={v}
                                    className={`inc-filter-btn ${filterStatus === v ? 'active' : ''}`}
                                    onClick={() => setFilterStatus(v)}>
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="shop-incidents-list">
                        {filtered.length === 0 && <div className="inc-empty">No incidents found.</div>}
                        {filtered.map(incident => (
                            <div key={incident.id} className="shop-incidents-report-card">
                                <div className="shop-incidents-report-header">
                                    <span className="shop-incidents-report-id">{incident.id}</span>
                                    <span className={`shop-incidents-priority shop-incidents-priority-${incident.priority}`}>
                                        {incident.priority}
                                    </span>
                                </div>
                                <h3 className="shop-incidents-report-title">{incident.title}</h3>
                                <div className="shop-incidents-report-meta">
                                    <span className="shop-incidents-report-category">{incident.type?.replace(/-/g, ' ')}</span>
                                    <span className="shop-incidents-report-date">{incident.reportedDate?.split(' ')[0]}</span>
                                    {incident.cost > 0 && <span className="inc-cost">Cost: {incident.cost.toLocaleString()}đ</span>}
                                </div>
                                <div className="shop-incidents-report-footer">
                                    <span className={`shop-incidents-status shop-incidents-status-${incident.status}`}>
                                        {statusIcon[incident.status]} {incident.status?.replace(/-/g, ' ')}
                                    </span>
                                    <div className="inc-card-actions">
                                        <button className="shop-incidents-view-btn" onClick={() => setViewIncident(incident)}>
                                            <EyeOutlined /> View
                                        </button>
                                        <button className="inc-edit-btn" onClick={() => setEditIncident({ ...incident })}>
                                            <EditOutlined />
                                        </button>
                                        <button className="inc-delete-btn" onClick={() => handleDelete(incident)}>
                                            <DeleteOutlined />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* View Modal */}
            {viewIncident && (
                <div className="inc-modal-overlay" onClick={() => setViewIncident(null)}>
                    <div className="inc-modal" onClick={e => e.stopPropagation()}>
                        <div className="inc-modal-header">
                            <div>
                                <span className="shop-incidents-report-id">{viewIncident.id}</span>
                                <h2>{viewIncident.title}</h2>
                            </div>
                            <button className="inc-modal-close" onClick={() => setViewIncident(null)}><CloseOutlined /></button>
                        </div>
                        <div className="inc-modal-body">
                            <div className="inc-detail-grid">
                                <div className="inc-detail-item"><span className="inc-dl">Status</span>
                                    <span className={`shop-incidents-status shop-incidents-status-${viewIncident.status}`}>
                                        {statusIcon[viewIncident.status]} {viewIncident.status?.replace(/-/g, ' ')}
                                    </span>
                                </div>
                                <div className="inc-detail-item"><span className="inc-dl">Priority</span>
                                    <span className={`shop-incidents-priority shop-incidents-priority-${viewIncident.priority}`}>{viewIncident.priority}</span>
                                </div>
                                <div className="inc-detail-item"><span className="inc-dl">Category</span><span className="inc-dv">{viewIncident.type?.replace(/-/g, ' ')}</span></div>
                                <div className="inc-detail-item"><span className="inc-dl">Reported By</span><span className="inc-dv">{viewIncident.reportedBy}</span></div>
                                <div className="inc-detail-item"><span className="inc-dl">Reported Date</span><span className="inc-dv">{viewIncident.reportedDate}</span></div>
                                <div className="inc-detail-item"><span className="inc-dl">Assigned To</span><span className="inc-dv">{viewIncident.assignedTo || '—'}</span></div>
                                {viewIncident.resolvedDate && (
                                    <div className="inc-detail-item"><span className="inc-dl">Resolved Date</span><span className="inc-dv">{viewIncident.resolvedDate}</span></div>
                                )}
                                {viewIncident.downtime && (
                                    <div className="inc-detail-item"><span className="inc-dl">Downtime</span><span className="inc-dv">{viewIncident.downtime}</span></div>
                                )}
                                {viewIncident.cost > 0 && (
                                    <div className="inc-detail-item"><span className="inc-dl">Cost</span><span className="inc-dv" style={{ color: '#ef4444', fontWeight: 700 }}>{viewIncident.cost.toLocaleString()}đ</span></div>
                                )}
                                {viewIncident.affectedOrders?.length > 0 && (
                                    <div className="inc-detail-item" style={{ gridColumn: '1/-1' }}>
                                        <span className="inc-dl">Affected Orders</span>
                                        <div className="inc-orders">{viewIncident.affectedOrders.map(o => <span key={o} className="inc-order-badge">{o}</span>)}</div>
                                    </div>
                                )}
                                <div className="inc-detail-item" style={{ gridColumn: '1/-1' }}>
                                    <span className="inc-dl">Description</span>
                                    <span className="inc-dv">{viewIncident.description}</span>
                                </div>
                                {viewIncident.resolution && (
                                    <div className="inc-detail-item" style={{ gridColumn: '1/-1' }}>
                                        <span className="inc-dl">Resolution</span>
                                        <span className="inc-dv" style={{ color: '#059669' }}>{viewIncident.resolution}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="inc-modal-footer">
                            {viewIncident.status === 'pending' && (
                                <button className="inc-status-btn inprogress" onClick={() => handleStatusChange(viewIncident.id, 'in-progress')}>
                                    Mark In Progress
                                </button>
                            )}
                            {viewIncident.status === 'in-progress' && (
                                <button className="inc-status-btn resolved" onClick={() => handleStatusChange(viewIncident.id, 'resolved')}>
                                    <CheckCircleOutlined /> Mark Resolved
                                </button>
                            )}
                            <button className="inc-close-btn" onClick={() => setViewIncident(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editIncident && (
                <div className="inc-modal-overlay" onClick={() => setEditIncident(null)}>
                    <div className="inc-modal" onClick={e => e.stopPropagation()}>
                        <div className="inc-modal-header">
                            <h2><EditOutlined /> Edit Incident</h2>
                            <button className="inc-modal-close" onClick={() => setEditIncident(null)}><CloseOutlined /></button>
                        </div>
                        <div className="inc-modal-body">
                            <div className="shop-incidents-form" style={{ gap: 14 }}>
                                <div className="shop-incidents-field">
                                    <label className="shop-incidents-label">Title</label>
                                    <input className="shop-incidents-input" value={editIncident.title}
                                        onChange={e => setEditIncident(p => ({ ...p, title: e.target.value }))} />
                                </div>
                                <div className="shop-incidents-field-row">
                                    <div className="shop-incidents-field">
                                        <label className="shop-incidents-label">Priority</label>
                                        <select className="shop-incidents-select" value={editIncident.priority}
                                            onChange={e => setEditIncident(p => ({ ...p, priority: e.target.value }))}>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>
                                    <div className="shop-incidents-field">
                                        <label className="shop-incidents-label">Status</label>
                                        <select className="shop-incidents-select" value={editIncident.status}
                                            onChange={e => setEditIncident(p => ({ ...p, status: e.target.value }))}>
                                            <option value="pending">Pending</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="shop-incidents-field">
                                    <label className="shop-incidents-label">Assigned To</label>
                                    <input className="shop-incidents-input" value={editIncident.assignedTo || ''}
                                        onChange={e => setEditIncident(p => ({ ...p, assignedTo: e.target.value }))}
                                        placeholder="Staff name" />
                                </div>
                                <div className="shop-incidents-field">
                                    <label className="shop-incidents-label">Description</label>
                                    <textarea className="shop-incidents-textarea" rows={4} value={editIncident.description}
                                        onChange={e => setEditIncident(p => ({ ...p, description: e.target.value }))} />
                                </div>
                                <div className="shop-incidents-field">
                                    <label className="shop-incidents-label">Resolution (if resolved)</label>
                                    <textarea className="shop-incidents-textarea" rows={3} value={editIncident.resolution || ''}
                                        onChange={e => setEditIncident(p => ({ ...p, resolution: e.target.value }))}
                                        placeholder="How was it resolved?" />
                                </div>
                            </div>
                        </div>
                        <div className="inc-modal-footer">
                            <button className="inc-close-btn" onClick={() => setEditIncident(null)}>Cancel</button>
                            <button className="inc-save-btn" onClick={handleSaveEdit}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {confirmDialog.show && (
                <ConfirmDialog
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    type={confirmDialog.type}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={() => setConfirmDialog({ show: false })}
                />
            )}
        </div>
    )
}

export default ShopIncidentReport
