import { useState } from 'react'
import {
    ClipboardList,
    Truck,
    PackageOpen,
    MapPin,
    Phone,
    Clock,
    CheckCircle2,
    Circle,
    Loader2,
    ChevronDown,
    ChevronUp,
    Filter,
} from 'lucide-react'
import { driverTasks, driverTasksDate } from '../../data/index'
import './DriverTasks.css'

const STATUS_LABEL = {
    completed: { label: 'Completed', cls: 'dt-status-done' },
    'in-progress': { label: 'In Progress', cls: 'dt-status-active' },
    pending: { label: 'Pending', cls: 'dt-status-pending' },
    cancelled: { label: 'Cancelled', cls: 'dt-status-cancelled' },
}

const FILTERS = ['All', 'Pending', 'In Progress', 'Completed']

function TaskCard({ task }) {
    const [expanded, setExpanded] = useState(false)
    const isDelivery = task.type === 'delivery'
    const statusInfo = STATUS_LABEL[task.status] ?? { label: task.status, cls: '' }

    return (
        <div className={`dt-card${expanded ? ' dt-card-expanded' : ''} ${task.status === 'in-progress' ? 'dt-card-inprogress' : ''}`}>
            {/* ── Header row ── */}
            <div className="dt-card-header" onClick={() => setExpanded(v => !v)}>
                <div className="dt-card-status-icon">
                    {task.status === 'completed' && <CheckCircle2 size={20} />}
                    {task.status === 'in-progress' && <Loader2 size={20} className="dt-spin" />}
                    {task.status === 'pending' && <Circle size={20} />}
                </div>

                <div className="dt-card-main">
                    <div className="dt-card-top">
                        <span className={`dt-type-badge ${isDelivery ? 'dt-type-delivery' : 'dt-type-pickup'}`}>
                            {isDelivery ? <Truck size={12} /> : <PackageOpen size={12} />}
                            {isDelivery ? 'Delivery' : 'Pickup'}
                        </span>
                        <span className="dt-order-id">{task.orderId}</span>
                        <span className="dt-time">
                            <Clock size={12} /> {task.scheduledTime}
                        </span>
                    </div>
                    <div className="dt-customer-name">{task.customer.name}</div>
                    <div className="dt-address">
                        <MapPin size={12} />
                        <span>{task.customer.address}</span>
                    </div>
                </div>

                <div className="dt-card-right">
                    <span className={`dt-status-badge ${statusInfo.cls}`}>{statusInfo.label}</span>
                    <button className="dt-expand-btn" aria-label="toggle">
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>
            </div>

            {/* ── Expanded detail ── */}
            {expanded && (
                <div className="dt-card-detail">
                    <div className="dt-detail-grid">
                        <div className="dt-detail-row">
                            <Phone size={13} />
                            <span>{task.customer.phone}</span>
                        </div>
                        <div className="dt-detail-row">
                            <MapPin size={13} />
                            <span>Shop: {task.shop.name} · {task.shop.address}</span>
                        </div>
                        <div className="dt-detail-row">
                            <ClipboardList size={13} />
                            <span>Service: <strong>{task.service}</strong>
                                {task.estimatedWeight && ` · ${task.estimatedWeight}`}
                                {task.actualWeight && ` · ${task.actualWeight}`}
                            </span>
                        </div>
                        {task.notes && (
                            <div className="dt-detail-note">
                                📝 {task.notes}
                            </div>
                        )}
                    </div>

                    <div className="dt-detail-footer">
                        <span className="dt-fee">Fee: <strong>{task.fee.toLocaleString('vi-VN')}đ</strong></span>
                        {task.status === 'pending' && (
                            <div className="dt-actions">
                                <button className="dt-btn dt-btn-outline">
                                    <Phone size={13} /> Call
                                </button>
                                <button className="dt-btn dt-btn-primary">
                                    <Truck size={13} /> Start
                                </button>
                            </div>
                        )}
                        {task.status === 'in-progress' && (
                            <div className="dt-actions">
                                <button className="dt-btn dt-btn-outline">
                                    <Phone size={13} /> Call
                                </button>
                                <button className="dt-btn dt-btn-success">
                                    <CheckCircle2 size={13} /> Confirm Complete
                                </button>
                            </div>
                        )}
                        {task.status === 'completed' && task.completedAt && (
                            <span className="dt-completed-time">
                                <CheckCircle2 size={13} /> Completed at {task.completedAt}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function DriverTasks() {
    const [activeFilter, setActiveFilter] = useState('All')
    const allTasks = driverTasks ?? []

    const filterMap = {
        'All': allTasks,
        'Pending': allTasks.filter(t => t.status === 'pending'),
        'In Progress': allTasks.filter(t => t.status === 'in-progress'),
        'Completed': allTasks.filter(t => t.status === 'completed'),
    }
    const shown = filterMap[activeFilter] ?? allTasks

    const counts = {
        total: allTasks.length,
        done: allTasks.filter(t => t.status === 'completed').length,
        active: allTasks.filter(t => t.status === 'in-progress').length,
        pending: allTasks.filter(t => t.status === 'pending').length,
    }

    return (
        <div className="dt-page">

            {/* ── Page title ── */}
            <div className="dt-page-header">
                <div className="dt-page-title-wrap">
                    <ClipboardList size={22} />
                    <div>
                        <h1 className="dt-page-title">Today's Tasks</h1>
                        <p className="dt-page-subtitle">{driverTasksDate}</p>
                    </div>
                </div>

                {/* Summary chips */}
                <div className="dt-summary-chips">
                    <div className="dt-chip">
                        <span className="dt-chip-num">{counts.total}</span>
                        <span className="dt-chip-label">Total</span>
                    </div>
                    <div className="dt-chip dt-chip-active">
                        <span className="dt-chip-num">{counts.active}</span>
                        <span className="dt-chip-label">Active</span>
                    </div>
                    <div className="dt-chip dt-chip-done">
                        <span className="dt-chip-num">{counts.done}</span>
                        <span className="dt-chip-label">Done</span>
                    </div>
                    <div className="dt-chip dt-chip-pending">
                        <span className="dt-chip-num">{counts.pending}</span>
                        <span className="dt-chip-label">Remaining</span>
                    </div>
                </div>
            </div>

            {/* ── Progress bar ── */}
            <div className="dt-progress-wrap">
                <div className="dt-progress-bar">
                    <div
                        className="dt-progress-fill"
                        style={{ width: `${counts.total ? (counts.done / counts.total) * 100 : 0}%` }}
                    />
                </div>
                <span className="dt-progress-label">
                    {counts.done}/{counts.total} tasks completed
                </span>
            </div>

            {/* ── Filter tabs ── */}
            <div className="dt-filters">
                <Filter size={14} className="dt-filter-icon" />
                {FILTERS.map(f => (
                    <button
                        key={f}
                        className={`dt-filter-btn${activeFilter === f ? ' dt-filter-active' : ''}`}
                        onClick={() => setActiveFilter(f)}
                    >
                        {f}
                        {f !== 'All' && (
                            <span className="dt-filter-count">
                                {filterMap[f].length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Task list ── */}
            <div className="dt-list">
                {shown.length === 0 ? (
                    <div className="dt-empty">
                        <CheckCircle2 size={40} />
                        <p>No tasks found</p>
                    </div>
                ) : (
                    shown.map(task => <TaskCard key={task.id} task={task} />)
                )}
            </div>

        </div>
    )
}

export default DriverTasks
