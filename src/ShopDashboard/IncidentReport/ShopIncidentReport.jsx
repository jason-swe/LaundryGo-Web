import { useState } from 'react'
import { AlertTriangle, Plus, Eye, Pencil, Trash2, X, CheckCircle, Clock, AlertCircle, Search } from 'lucide-react'
import './ShopIncidentReport.css'
import { incidents as incidentsData } from '../../data'
import toast from '../../utils/toast'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import { useTranslation } from '../../shared/lib/i18n'

const defaultForm = { title: '', category: 'app-error', priority: 'medium', description: '', affectedOrders: '' }

const statusIcon = { resolved: <CheckCircle size={14} />, 'in-progress': <Clock size={14} />, pending: <AlertCircle size={14} /> }

const categoryKey = {
    'app-error': 'appError',
    'payment-issue': 'paymentIssue',
    'notification-issue': 'notificationIssue',
    'ui-bug': 'uiBug',
    'feature-bug': 'featureBug',
    'data-issue': 'dataIssue',
    'other': 'other'
}

const statusKey = {
    'pending': 'pending',
    'in-progress': 'inProgress',
    'resolved': 'resolved'
}

const priorityKey = {
    'low': 'low',
    'medium': 'medium',
    'high': 'high',
    'urgent': 'urgent'
}

function ShopIncidentReport() {
    const { t } = useTranslation()
    const [incidents, setIncidents] = useState(incidentsData)
    const [reportForm, setReportForm] = useState(defaultForm)
    const [viewIncident, setViewIncident] = useState(null)
    const [editIncident, setEditIncident] = useState(null)
    const [filterStatus, setFilterStatus] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [confirmDialog, setConfirmDialog] = useState({ show: false })

    const getCategoryLabel = (value) => {
        const key = categoryKey[value]
        return key ? t(`shop.incidents.category.${key}`) : (value || '').replace(/-/g, ' ')
    }

    const getStatusLabel = (value) => {
        const key = statusKey[value]
        return key ? t(`shop.incidents.status.${key}`) : (value || '').replace(/-/g, ' ')
    }

    const getPriorityLabel = (value) => {
        const key = priorityKey[value]
        return key ? t(`shop.incidents.priority.${key}`) : value
    }

    const filtered = incidents.filter(i => {
        const matchStatus = filterStatus === 'all' || i.status === filterStatus
        const q = searchQuery.toLowerCase()
        const matchSearch = !q ||
            i.id.toLowerCase().includes(q) ||
            i.title.toLowerCase().includes(q) ||
            (i.description || '').toLowerCase().includes(q) ||
            (i.type || '').toLowerCase().includes(q)
        return matchStatus && matchSearch
    })

    const counts = {
        total: incidents.length,
        pending: incidents.filter(i => i.status === 'pending').length,
        inProgress: incidents.filter(i => i.status === 'in-progress').length,
        resolved: incidents.filter(i => i.status === 'resolved').length,
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!reportForm.title.trim() || !reportForm.description.trim()) {
            toast.warning(t('shop.incidents.toasts.titleAndDescriptionRequired'))
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
        toast.success(`${t('shop.incidents.toasts.submittedPrefix')} ${newIncident.id} ${t('shop.incidents.toasts.submittedSuffix')}`)
        setReportForm(defaultForm)
    }

    const handleStatusChange = (id, newStatus) => {
        setIncidents(prev => prev.map(i => i.id === id ? {
            ...i,
            status: newStatus,
            resolvedDate: newStatus === 'resolved' ? new Date().toISOString().replace('T', ' ').slice(0, 16) : i.resolvedDate
        } : i))
        if (viewIncident?.id === id) setViewIncident(p => ({ ...p, status: newStatus }))
        toast.success(`${t('shop.incidents.toasts.statusUpdatedPrefix')} "${getStatusLabel(newStatus)}"`)
    }

    const handleSaveEdit = () => {
        if (!editIncident.title.trim()) { toast.warning(t('shop.incidents.toasts.titleRequired')); return }
        setIncidents(prev => prev.map(i => i.id === editIncident.id ? { ...i, ...editIncident } : i))
        toast.success(t('shop.incidents.toasts.updated'))
        setEditIncident(null)
    }

    const handleDelete = (incident) => {
        setConfirmDialog({
            show: true,
            title: t('shop.incidents.confirm.deleteTitle'),
            message: `${t('shop.incidents.confirm.deleteMessagePrefix')} "${incident.title}"? ${t('shop.incidents.confirm.deleteMessageSuffix')}`,
            type: 'danger',
            onConfirm: () => {
                setIncidents(prev => prev.filter(i => i.id !== incident.id))
                toast.success(`${incident.id} ${t('shop.incidents.toasts.deletedSuffix')}`)
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
                        <AlertTriangle size={18} style={{ marginRight: 8 }} />{t('shop.incidents.title')}
                    </h1>
                    <p className="shop-incidents-subtitle">{t('shop.incidents.subtitle')}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="inc-stats-row">
                {[
                    { label: t('shop.incidents.stats.total'), value: counts.total, type: 'info' },
                    { label: t('shop.incidents.stats.pending'), value: counts.pending, type: 'warning' },
                    { label: t('shop.incidents.stats.inProgress'), value: counts.inProgress, type: 'info' },
                    { label: t('shop.incidents.stats.resolved'), value: counts.resolved, type: 'success' },
                ].map(s => (
                    <div key={s.label} className={`inc-stat-card inc-stat-${s.type}`}>
                        <div className="inc-stat-value">{s.value}</div>
                        <div className="inc-stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="shop-incidents-content">
                {/* Submit Form */}
                <div className="shop-incidents-form-section">
                    <h2 className="shop-incidents-section-title"><Plus size={16} /> {t('shop.incidents.form.title')}</h2>
                    <form className="shop-incidents-form" onSubmit={handleSubmit}>
                        <div className="shop-incidents-field">
                            <label className="shop-incidents-label">{t('shop.incidents.form.fields.title')} *</label>
                            <input type="text" className="shop-incidents-input"
                                placeholder={t('shop.incidents.form.placeholders.title')}
                                value={reportForm.title}
                                onChange={e => setReportForm(p => ({ ...p, title: e.target.value }))} />
                        </div>

                        <div className="shop-incidents-field-row">
                            <div className="shop-incidents-field">
                                <label className="shop-incidents-label">{t('shop.incidents.form.fields.category')}</label>
                                <select className="shop-incidents-select" value={reportForm.category}
                                    onChange={e => setReportForm(p => ({ ...p, category: e.target.value }))}>
                                    {Object.keys(categoryKey).map(value => (
                                        <option key={value} value={value}>{getCategoryLabel(value)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="shop-incidents-field">
                                <label className="shop-incidents-label">{t('shop.incidents.form.fields.priority')}</label>
                                <select className="shop-incidents-select" value={reportForm.priority}
                                    onChange={e => setReportForm(p => ({ ...p, priority: e.target.value }))}>
                                    {Object.keys(priorityKey).map(value => (
                                        <option key={value} value={value}>{getPriorityLabel(value)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="shop-incidents-field">
                            <label className="shop-incidents-label">{t('shop.incidents.form.fields.affectedOrders')}</label>
                            <input type="text" className="shop-incidents-input"
                                placeholder={t('shop.incidents.form.placeholders.affectedOrders')}
                                value={reportForm.affectedOrders}
                                onChange={e => setReportForm(p => ({ ...p, affectedOrders: e.target.value }))} />
                        </div>

                        <div className="shop-incidents-field">
                            <label className="shop-incidents-label">{t('shop.incidents.form.fields.description')} *</label>
                            <textarea className="shop-incidents-textarea" rows={5}
                                placeholder={t('shop.incidents.form.placeholders.description')}
                                value={reportForm.description}
                                onChange={e => setReportForm(p => ({ ...p, description: e.target.value }))} />
                        </div>

                        <button type="submit" className="shop-incidents-submit-btn">
                            <Plus size={16} /> {t('shop.incidents.form.submit')}
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="shop-incidents-list-section">
                    <div className="inc-list-header">
                        <h2 className="shop-incidents-section-title">{t('shop.incidents.list.title')}</h2>
                        <div className="inc-list-controls">
                            <div className="inc-search-wrapper">
                                <Search className="inc-search-icon" size={16} />
                                <input
                                    type="text"
                                    className="inc-search-input"
                                    placeholder={t('shop.incidents.list.searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="inc-filter-tabs">
                                {['all', 'pending', 'in-progress', 'resolved'].map(v => (
                                    <button
                                        key={v}
                                        className={`inc-filter-btn ${filterStatus === v ? 'active' : ''}`}
                                        onClick={() => setFilterStatus(v)}
                                    >
                                        {v === 'all' ? t('shop.incidents.filters.all') : getStatusLabel(v)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="shop-incidents-list">
                        {filtered.length === 0 && <div className="inc-empty">{t('shop.incidents.empty.noIncidentsFound')}</div>}
                        {filtered.map(incident => (
                            <div key={incident.id} className="shop-incidents-report-card">
                                <div className="shop-incidents-report-header">
                                    <span className="shop-incidents-report-id">{incident.id}</span>
                                    <span className={`shop-incidents-priority shop-incidents-priority-${incident.priority}`}>
                                        {getPriorityLabel(incident.priority)}
                                    </span>
                                </div>
                                <h3 className="shop-incidents-report-title">{incident.title}</h3>
                                <div className="shop-incidents-report-meta">
                                    <span className="shop-incidents-report-category">{getCategoryLabel(incident.type)}</span>
                                    <span className="shop-incidents-report-date">{incident.reportedDate?.split(' ')[0]}</span>
                                    {incident.cost > 0 && <span className="inc-cost">{t('shop.incidents.labels.cost')}: {incident.cost.toLocaleString()}đ</span>}
                                </div>
                                <div className="shop-incidents-report-footer">
                                    <span className={`shop-incidents-status shop-incidents-status-${incident.status}`}>
                                        {statusIcon[incident.status]} {getStatusLabel(incident.status)}
                                    </span>
                                    <div className="inc-card-actions">
                                        <button className="shop-incidents-view-btn" onClick={() => setViewIncident(incident)}>
                                            <Eye size={14} /> {t('shop.incidents.actions.view')}
                                        </button>
                                        <button className="inc-edit-btn" onClick={() => setEditIncident({ ...incident })}>
                                            <Pencil size={14} />
                                        </button>
                                        <button className="inc-delete-btn" onClick={() => handleDelete(incident)}>
                                            <Trash2 size={14} />
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
                            <button className="inc-modal-close" onClick={() => setViewIncident(null)}><X size={18} /></button>
                        </div>
                        <div className="inc-modal-body">
                            <div className="inc-detail-grid">
                                <div className="inc-detail-item"><span className="inc-dl">{t('shop.incidents.detail.status')}</span>
                                    <span className={`shop-incidents-status shop-incidents-status-${viewIncident.status}`}>
                                        {statusIcon[viewIncident.status]} {getStatusLabel(viewIncident.status)}
                                    </span>
                                </div>
                                <div className="inc-detail-item"><span className="inc-dl">{t('shop.incidents.detail.priority')}</span>
                                    <span className={`shop-incidents-priority shop-incidents-priority-${viewIncident.priority}`}>{getPriorityLabel(viewIncident.priority)}</span>
                                </div>
                                <div className="inc-detail-item"><span className="inc-dl">{t('shop.incidents.detail.category')}</span><span className="inc-dv">{getCategoryLabel(viewIncident.type)}</span></div>
                                <div className="inc-detail-item"><span className="inc-dl">{t('shop.incidents.detail.reportedBy')}</span><span className="inc-dv">{viewIncident.reportedBy}</span></div>
                                <div className="inc-detail-item"><span className="inc-dl">{t('shop.incidents.detail.reportedDate')}</span><span className="inc-dv">{viewIncident.reportedDate}</span></div>
                                <div className="inc-detail-item"><span className="inc-dl">{t('shop.incidents.detail.assignedTo')}</span><span className="inc-dv">{viewIncident.assignedTo || '—'}</span></div>
                                {viewIncident.resolvedDate && (
                                    <div className="inc-detail-item"><span className="inc-dl">{t('shop.incidents.detail.resolvedDate')}</span><span className="inc-dv">{viewIncident.resolvedDate}</span></div>
                                )}
                                {viewIncident.downtime && (
                                    <div className="inc-detail-item"><span className="inc-dl">{t('shop.incidents.detail.downtime')}</span><span className="inc-dv">{viewIncident.downtime}</span></div>
                                )}
                                {viewIncident.cost > 0 && (
                                    <div className="inc-detail-item"><span className="inc-dl">{t('shop.incidents.detail.cost')}</span><span className="inc-dv inc-cost-value">{viewIncident.cost.toLocaleString()}đ</span></div>
                                )}
                                {viewIncident.affectedOrders?.length > 0 && (
                                    <div className="inc-detail-item" style={{ gridColumn: '1/-1' }}>
                                        <span className="inc-dl">{t('shop.incidents.detail.affectedOrders')}</span>
                                        <div className="inc-orders">{viewIncident.affectedOrders.map(o => <span key={o} className="inc-order-badge">{o}</span>)}</div>
                                    </div>
                                )}
                                <div className="inc-detail-item" style={{ gridColumn: '1/-1' }}>
                                    <span className="inc-dl">{t('shop.incidents.detail.description')}</span>
                                    <span className="inc-dv">{viewIncident.description}</span>
                                </div>
                                {viewIncident.resolution && (
                                    <div className="inc-detail-item" style={{ gridColumn: '1/-1' }}>
                                        <span className="inc-dl">{t('shop.incidents.detail.resolution')}</span>
                                        <span className="inc-dv inc-resolution-value">{viewIncident.resolution}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="inc-modal-footer">
                            {viewIncident.status === 'pending' && (
                                <button className="inc-status-btn inprogress" onClick={() => handleStatusChange(viewIncident.id, 'in-progress')}>
                                    {t('shop.incidents.actions.markInProgress')}
                                </button>
                            )}
                            {viewIncident.status === 'in-progress' && (
                                <button className="inc-status-btn resolved" onClick={() => handleStatusChange(viewIncident.id, 'resolved')}>
                                    <CheckCircle size={14} /> {t('shop.incidents.actions.markResolved')}
                                </button>
                            )}
                            <button className="inc-close-btn" onClick={() => setViewIncident(null)}>{t('common.close')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editIncident && (
                <div className="inc-modal-overlay" onClick={() => setEditIncident(null)}>
                    <div className="inc-modal" onClick={e => e.stopPropagation()}>
                        <div className="inc-modal-header">
                            <h2><Pencil size={16} /> {t('shop.incidents.edit.title')}</h2>
                            <button className="inc-modal-close" onClick={() => setEditIncident(null)}><X size={18} /></button>
                        </div>
                        <div className="inc-modal-body">
                            <div className="shop-incidents-form" style={{ gap: 14 }}>
                                <div className="shop-incidents-field">
                                    <label className="shop-incidents-label">{t('shop.incidents.form.fields.title')}</label>
                                    <input className="shop-incidents-input" value={editIncident.title}
                                        onChange={e => setEditIncident(p => ({ ...p, title: e.target.value }))} />
                                </div>
                                <div className="shop-incidents-field-row">
                                    <div className="shop-incidents-field">
                                        <label className="shop-incidents-label">{t('shop.incidents.form.fields.priority')}</label>
                                        <select className="shop-incidents-select" value={editIncident.priority}
                                            onChange={e => setEditIncident(p => ({ ...p, priority: e.target.value }))}>
                                            {Object.keys(priorityKey).map(value => (
                                                <option key={value} value={value}>{getPriorityLabel(value)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="shop-incidents-field">
                                        <label className="shop-incidents-label">{t('shop.incidents.form.fields.status')}</label>
                                        <select className="shop-incidents-select" value={editIncident.status}
                                            onChange={e => setEditIncident(p => ({ ...p, status: e.target.value }))}>
                                            {Object.keys(statusKey).map(value => (
                                                <option key={value} value={value}>{getStatusLabel(value)}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="shop-incidents-field">
                                    <label className="shop-incidents-label">{t('shop.incidents.form.fields.assignedTo')}</label>
                                    <input className="shop-incidents-input" value={editIncident.assignedTo || ''}
                                        onChange={e => setEditIncident(p => ({ ...p, assignedTo: e.target.value }))}
                                        placeholder={t('shop.incidents.form.placeholders.assignedTo')} />
                                </div>
                                <div className="shop-incidents-field">
                                    <label className="shop-incidents-label">{t('shop.incidents.form.fields.description')}</label>
                                    <textarea className="shop-incidents-textarea" rows={4} value={editIncident.description}
                                        onChange={e => setEditIncident(p => ({ ...p, description: e.target.value }))} />
                                </div>
                                <div className="shop-incidents-field">
                                    <label className="shop-incidents-label">{t('shop.incidents.edit.resolutionLabel')}</label>
                                    <textarea className="shop-incidents-textarea" rows={3} value={editIncident.resolution || ''}
                                        onChange={e => setEditIncident(p => ({ ...p, resolution: e.target.value }))}
                                        placeholder={t('shop.incidents.edit.resolutionPlaceholder')} />
                                </div>
                            </div>
                        </div>
                        <div className="inc-modal-footer">
                            <button className="inc-close-btn" onClick={() => setEditIncident(null)}>{t('common.cancel')}</button>
                            <button className="inc-save-btn" onClick={handleSaveEdit}>{t('common.saveChanges')}</button>
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
