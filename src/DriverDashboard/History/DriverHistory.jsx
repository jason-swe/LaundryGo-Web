import { useState, useMemo } from 'react'
import {
    History,
    Truck,
    PackageOpen,
    MapPin,
    Clock,
    CheckCircle2,
    XCircle,
    Star,
    ChevronLeft,
    ChevronRight,
    Calendar,
} from 'lucide-react'
import { driverTaskHistory } from '../../data/index'
import './DriverHistory.css'

const PAGE_SIZE = 5

function StarRating({ value }) {
    if (!value) return null
    return (
        <span className="dh-stars">
            {[1, 2, 3, 4, 5].map(i => (
                <Star
                    key={i}
                    size={13}
                    className={i <= value ? 'dh-star-filled' : 'dh-star-empty'}
                />
            ))}
        </span>
    )
}

// Group history items by date
function groupByDate(items) {
    return items.reduce((acc, item) => {
        const d = item.date
        if (!acc[d]) acc[d] = []
        acc[d].push(item)
        return acc
    }, {})
}

function formatDate(dateStr) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { weekday: 'long', month: '2-digit', day: '2-digit', year: 'numeric' })
}

export default function DriverHistory() {
    const [filterStatus, setFilterStatus] = useState('all')
    const [page, setPage] = useState(1)

    const history = driverTaskHistory ?? []

    const filtered = useMemo(() => {
        if (filterStatus === 'all') return history
        return history.filter(t => t.status === filterStatus)
    }, [history, filterStatus])

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    const grouped = groupByDate(paginated)
    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a))

    // Summary stats
    const totalFee = history.filter(t => t.status === 'completed').reduce((s, t) => s + t.fee, 0)
    const avgRating = (() => {
        const rated = history.filter(t => t.customerRating)
        if (!rated.length) return 0
        return (rated.reduce((s, t) => s + t.customerRating, 0) / rated.length).toFixed(1)
    })()

    function handleFilter(v) {
        setFilterStatus(v)
        setPage(1)
    }

    return (
        <div className="dh-page">

            {/* ── Page header ── */}
            <div className="dh-page-header">
                <div className="dh-title-wrap">
                    <History size={22} className="dh-title-icon" />
                    <div>
                        <h1 className="dh-page-title">Trip History</h1>
                        <p className="dh-page-subtitle">{history.length} trips completed</p>
                    </div>
                </div>

                <div className="dh-summary-chips">
                    <div className="dh-chip">
                        <span className="dh-chip-num">{history.filter(t => t.status === 'completed').length}</span>
                        <span className="dh-chip-label">Completed</span>
                    </div>
                    <div className="dh-chip">
                        <span className="dh-chip-num">{history.filter(t => t.status === 'cancelled').length}</span>
                        <span className="dh-chip-label">Cancelled</span>
                    </div>
                    <div className="dh-chip dh-chip-fee">
                        <span className="dh-chip-num">{totalFee.toLocaleString('vi-VN')}đ</span>
                        <span className="dh-chip-label">Total Fees</span>
                    </div>
                    <div className="dh-chip dh-chip-star">
                        <span className="dh-chip-num">⭐ {avgRating}</span>
                        <span className="dh-chip-label">Avg Rating</span>
                    </div>
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="dh-filters">
                {[
                    { value: 'all', label: 'All' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'cancelled', label: 'Cancelled' },
                ].map(f => (
                    <button
                        key={f.value}
                        className={`dh-filter-btn${filterStatus === f.value ? ' dh-filter-active' : ''}`}
                        onClick={() => handleFilter(f.value)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* ── History list grouped by date ── */}
            {sortedDates.length === 0 ? (
                <div className="dh-empty">
                    <History size={40} />
                    <p>No history found</p>
                </div>
            ) : (
                sortedDates.map(date => (
                    <div key={date} className="dh-group">
                        <div className="dh-group-label">
                            <Calendar size={13} />
                            {formatDate(date)}
                        </div>

                        <div className="dh-group-list">
                            {grouped[date].map(item => {
                                const isDelivery = item.type === 'delivery'
                                const isDone = item.status === 'completed'
                                return (
                                    <div key={item.id} className={`dh-item${isDone ? '' : ' dh-item-cancelled'}`}>
                                        <div className={`dh-type-icon ${isDelivery ? 'dh-icon-delivery' : 'dh-icon-pickup'}`}>
                                            {isDelivery ? <Truck size={16} /> : <PackageOpen size={16} />}
                                        </div>

                                        <div className="dh-item-body">
                                            <div className="dh-item-top">
                                                <span className="dh-customer">{item.customer.name}</span>
                                                <span className="dh-order-id">{item.orderId}</span>
                                            </div>
                                            <div className="dh-item-meta">
                                                <span className="dh-meta-row">
                                                    <MapPin size={11} />
                                                    {item.customer.address}
                                                </span>
                                                <span className="dh-meta-row">
                                                    <Clock size={11} />
                                                    {item.completedAt}
                                                </span>
                                            </div>
                                            {item.cancelReason && (
                                                <div className="dh-cancel-reason">
                                                    Reason: {item.cancelReason}
                                                </div>
                                            )}
                                        </div>

                                        <div className="dh-item-right">
                                            <span className={`dh-status-dot ${isDone ? 'dh-dot-done' : 'dh-dot-cancelled'}`}>
                                                {isDone
                                                    ? <><CheckCircle2 size={13} /> Completed</>
                                                    : <><XCircle size={13} /> Cancelled</>}
                                            </span>
                                            {isDone && (
                                                <span className="dh-fee">+{item.fee.toLocaleString('vi-VN')}đ</span>
                                            )}
                                            <StarRating value={item.customerRating} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))
            )}

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="dh-pagination">
                    <button
                        className="dh-page-btn"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="dh-page-info">Page {page} / {totalPages}</span>
                    <button
                        className="dh-page-btn"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    )
}
