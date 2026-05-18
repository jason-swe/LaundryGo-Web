import { useState } from 'react'
import { DollarSign, Calendar, FileText, Download, TrendingUp, ShoppingBag, X, CreditCard, CheckCircle, Clock, BarChart2 } from 'lucide-react'
import './ShopRevenue.css'
import { revenue as revenueData, orders as ordersData } from '../../data'
import toast from '../../utils/toast'
import { useTranslation } from '../../shared/lib/i18n'

const parsePrice = (str) => {
    if (!str) return 0
    return parseInt(String(str).replace(/[^0-9]/g, '')) || 0
}

function ShopRevenue() {
    const { t, language } = useTranslation()
    const [selectedPeriod, setSelectedPeriod] = useState('month')
    const [orderFilter, setOrderFilter] = useState('all')
    const [showAllOrders, setShowAllOrders] = useState(false)
    const [showSubModal, setShowSubModal] = useState(false)

    const dateLocale = language === 'vi' ? 'vi-VN' : 'en-US'

    // ── Chart data ────────────────────────────────────────────────────────────
    const getChartData = () => {
        switch (selectedPeriod) {
            case 'week':
                return revenueData.daily.map(d => ({
                    label: new Date(d.date).toLocaleDateString(dateLocale, { weekday: 'short' }),
                    revenue: d.revenue, net: d.profit, orders: d.orders
                }))
            case 'month':
                return revenueData.weekly.map(w => ({
                    label: w.week.replace(/\(.*\)/, '').trim(),
                    revenue: w.revenue, net: w.profit, orders: w.orders
                }))
            case 'quarter':
                return revenueData.monthly.slice(-3).map(m => ({
                    label: new Date(m.month + '-01').toLocaleDateString(dateLocale, { month: 'short', year: '2-digit' }),
                    revenue: m.revenue, net: m.profit, orders: m.orders
                }))
            case 'year':
                return revenueData.monthly.map(m => ({
                    label: new Date(m.month + '-01').toLocaleDateString(dateLocale, { month: 'short' }),
                    revenue: m.revenue, net: m.profit, orders: m.orders
                }))
            default:
                return []
        }
    }

    const chartData = getChartData()
    const maxRevenue = chartData.length > 0 ? Math.max(...chartData.map(d => d.revenue)) : 1

    const stats = chartData.length > 0 ? {
        totalRevenue: chartData.reduce((s, d) => s + d.revenue, 0),
        netRevenue: chartData.reduce((s, d) => s + d.net, 0),
        commission: chartData.reduce((s, d) => s + (d.revenue - d.net), 0),
        totalOrders: chartData.reduce((s, d) => s + d.orders, 0),
    } : { totalRevenue: 0, netRevenue: 0, commission: 0, totalOrders: 0 }

    const periodLabel = {
        week: t('shop.revenue.period.thisWeek'),
        month: t('shop.revenue.period.thisMonth'),
        quarter: t('shop.revenue.period.thisQuarter'),
        year: t('shop.revenue.period.thisYear'),
    }[selectedPeriod]

    // ── Orders table ─────────────────────────────────────────────────────────
    const allOrders = ordersData.map(order => ({
        id: order.id,
        customer: typeof order.customer === 'object' ? order.customer.name : order.customer,
        date: (order.completedTime || order.pickupTime || '').split(' ')[0],
        service: order.service || (order.items || []).map(i => i.type).join(', '),
        amount: parsePrice(order.actualPrice || order.estimatedPrice),
        paymentStatus: order.paymentStatus || 'pending',
        orderStatus: order.status,
        paymentMethod: order.paymentMethod || '—',
    }))

    const filteredOrders = orderFilter === 'all'
        ? allOrders
        : allOrders.filter(o => o.paymentStatus === orderFilter)

    const displayOrders = showAllOrders ? filteredOrders : filteredOrders.slice(0, 8)

    // ── Service breakdown ──────────────────────────────────────────────────────
    const serviceMap = ordersData.reduce((acc, o) => {
        const svc = o.service || 'Other'
        const price = parsePrice(o.actualPrice || o.estimatedPrice)
        acc[svc] = (acc[svc] || 0) + price
        return acc
    }, {})
    const serviceTotal = Object.values(serviceMap).reduce((s, v) => s + v, 0) || 1
    const serviceColors = [
        'var(--brand-primary)',
        'var(--status-success)',
        'var(--brand-primary-hover)',
        'var(--status-info)',
        'var(--status-danger)',
        'var(--status-warning)',
    ]
    const serviceEntries = Object.entries(serviceMap).sort((a, b) => b[1] - a[1])

    // ── Payment method breakdown ────────────────────────────────────────────
    const paymentMap = ordersData.reduce((acc, o) => {
        if (o.paymentStatus === 'paid') {
            const method = o.paymentMethod || 'Cash'
            acc[method] = (acc[method] || 0) + 1
        }
        return acc
    }, {})
    const totalPaid = Object.values(paymentMap).reduce((s, v) => s + v, 0) || 1

    // ── Export CSV ─────────────────────────────────────────────────────────────
    const handleExport = () => {
        const headers = [
            t('shop.revenue.export.headers.label'),
            t('shop.revenue.export.headers.revenue'),
            t('shop.revenue.export.headers.netRevenue'),
            t('shop.revenue.export.headers.commission'),
            t('shop.revenue.export.headers.orders'),
        ]
        const rows = chartData.map(d => [
            d.label, d.revenue, d.net, d.revenue - d.net, d.orders
        ])
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `revenue-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
        toast.success(t('shop.revenue.toasts.exported'))
    }

    const subscriptionInfo = {
        plan: t('shop.revenue.subscription.plan.professional'),
        monthlyFee: 500000,
        commissionRate: 15,
        nextBillingDate: '2026-04-01',
        status: 'active',
        features: [
            t('shop.revenue.subscription.features.unlimitedOrders'),
            t('shop.revenue.subscription.features.prioritySupport'),
            t('shop.revenue.subscription.features.analyticsDashboard'),
            t('shop.revenue.subscription.features.staffManagement'),
            t('shop.revenue.subscription.features.promotionTools'),
            t('shop.revenue.subscription.features.incidentManagement'),
        ]
    }

    const statusLabel = {
        'pending-checkin': t('orderStatus.pendingCheckin'),
        'washing': t('orderStatus.washing'),
        'washing-completed': t('orderStatus.washingCompleted'),
        'delivering': t('orderStatus.outForDelivery'),
        'delivered': t('orderStatus.delivered'),
        'cancelled': t('orderStatus.cancelled'),
        'completed': t('orderStatus.completed'),
    }

    return (
        <div className="shop-revenue">

            {/* Header */}
            <div className="shop-revenue-header">
                <div>
                    <h1 className="shop-revenue-title">
                        <DollarSign size={18} style={{ marginRight: '8px' }} />
                        {t('shop.revenue.title')}
                    </h1>
                    <p className="shop-revenue-subtitle">
                        {t('shop.revenue.subtitle')}
                    </p>
                </div>
                <button className="shop-revenue-export-btn" onClick={handleExport}>
                    <Download size={16} /> {t('shop.revenue.exportCta')}
                </button>
            </div>

            {/* Stats */}
            <div className="shop-revenue-stats">
                <div className="revenue-stat-card">
                    <div className="stat-icon stat-icon-primary">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('shop.revenue.stats.totalRevenue')} ({periodLabel})</div>
                        <div className="stat-value">{(stats.totalRevenue / 1000000).toFixed(1)}M đ</div>
                    </div>
                </div>
                <div className="revenue-stat-card">
                    <div className="stat-icon stat-icon-warning">
                        <FileText size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('shop.revenue.stats.platformFee')} (15%)</div>
                        <div className="stat-value stat-value-warning">
                            -{(stats.commission / 1000000).toFixed(1)}M đ
                        </div>
                    </div>
                </div>
                <div className="revenue-stat-card">
                    <div className="stat-icon stat-icon-success">
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('shop.revenue.stats.netRevenue')}</div>
                        <div className="stat-value stat-value-success">
                            {(stats.netRevenue / 1000000).toFixed(1)}M đ
                        </div>
                    </div>
                </div>
                <div className="revenue-stat-card">
                    <div className="stat-icon stat-icon-primary">
                        <ShoppingBag size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('shop.revenue.stats.totalOrders')}</div>
                        <div className="stat-value">{stats.totalOrders.toLocaleString()}</div>
                        <div className="stat-sublabel">
                            {t('shop.revenue.stats.avgPrefix')} {stats.totalOrders > 0
                                ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString()
                                : 0}đ {t('shop.revenue.stats.avgSuffix')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="shop-revenue-section">
                <div className="section-header-row">
                    <h2 className="section-title">{t('shop.revenue.sections.revenueTrend')}</h2>
                    <div className="shop-revenue-period">
                        {['week', 'month', 'quarter', 'year'].map(p => (
                            <button
                                key={p}
                                className={`period-btn ${selectedPeriod === p ? 'active' : ''}`}
                                onClick={() => setSelectedPeriod(p)}
                            >
                                {t(`shop.revenue.periodButtons.${p}`)}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="revenue-chart-card">
                    <div className="chart-legend">
                        <span className="legend-item revenue-legend">■ {t('shop.revenue.chart.legend.revenue')}</span>
                        <span className="legend-item net-legend">■ {t('shop.revenue.chart.legend.netRevenue')}</span>
                    </div>
                    <div className="revenue-chart">
                        {chartData.map((data, i) => {
                            const revH = (data.revenue / maxRevenue) * 100
                            const netH = (data.net / maxRevenue) * 100
                            return (
                                <div key={i} className="chart-bar-group">
                                    <div className="bar-tooltip">
                                        <div><strong>{data.label}</strong></div>
                                        <div>{t('shop.revenue.chart.tooltip.revenue')}: {(data.revenue / 1000000).toFixed(2)}M đ</div>
                                        <div>{t('shop.revenue.chart.tooltip.net')}: {(data.net / 1000000).toFixed(2)}M đ</div>
                                        <div>{t('shop.revenue.chart.tooltip.orders')}: {data.orders}</div>
                                    </div>
                                    <div className="bars-wrapper">
                                        <div className="bar-fill revenue-bar" style={{ height: `${revH}%` }} />
                                        <div className="bar-fill net-bar" style={{ height: `${netH}%` }} />
                                    </div>
                                    <div className="bar-label">{data.label}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Service + Payment Breakdown */}
            <div className="revenue-breakdown-row">
                <div className="shop-revenue-section revenue-breakdown-card">
                    <h2 className="section-title">
                        <BarChart2 size={16} style={{ marginRight: 8 }} />{t('shop.revenue.sections.revenueByService')}
                    </h2>
                    <div className="service-list">
                        {serviceEntries.map(([name, amount], i) => (
                            <div key={name} className="service-bar-row">
                                <div className="service-bar-label">{name}</div>
                                <div className="service-bar-track">
                                    <div
                                        className="service-bar-fill"
                                        style={{
                                            width: `${(amount / serviceTotal) * 100}%`,
                                            background: serviceColors[i % serviceColors.length]
                                        }}
                                    />
                                </div>
                                <div className="service-bar-value">{(amount / 1000).toFixed(0)}K đ</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="shop-revenue-section revenue-breakdown-card">
                    <h2 className="section-title">
                        <CreditCard size={16} style={{ marginRight: 8 }} />{t('shop.revenue.sections.paymentMethods')}
                    </h2>
                    <div className="payment-method-list">
                        {Object.entries(paymentMap).length === 0 ? (
                            <p className="no-data-msg">{t('shop.revenue.empty.noPaidOrdersYet')}</p>
                        ) : (
                            Object.entries(paymentMap).map(([method, count]) => (
                                <div key={method} className="payment-method-row">
                                    <CreditCard size={16} style={{ color: 'var(--brand-primary)' }} />
                                    <span className="pm-name">{method}</span>
                                    <span className="pm-count">{count} {t('shop.revenue.units.orders')}</span>
                                    <span className="pm-pct">{Math.round(count / totalPaid * 100)}%</span>
                                </div>
                            ))
                        )}
                        <div className="payment-summary">
                            <span>
                                <CheckCircle size={14} style={{ color: 'var(--status-success)' }} />
                                {' '}{t('shop.revenue.paymentSummary.paid')}: {allOrders.filter(o => o.paymentStatus === 'paid').length}
                            </span>
                            <span>
                                <Clock size={14} style={{ color: 'var(--brand-primary-hover)' }} />
                                {' '}{t('shop.revenue.paymentSummary.pending')}: {allOrders.filter(o => o.paymentStatus === 'pending').length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="shop-revenue-section">
                <div className="section-header-row">
                    <h2 className="section-title">{t('shop.revenue.sections.orderRevenueDetails')}</h2>
                    <div className="order-filter-tabs">
                        {['all', 'paid', 'pending'].map(v => (
                            <button
                                key={v}
                                className={`order-filter-btn ${orderFilter === v ? 'active' : ''}`}
                                onClick={() => { setOrderFilter(v); setShowAllOrders(false) }}
                            >
                                {t(`shop.revenue.filters.${v}`)} ({v === 'all' ? allOrders.length : allOrders.filter(o => o.paymentStatus === v).length})
                            </button>
                        ))}
                    </div>
                </div>
                <div className="revenue-table-container">
                    <table className="revenue-table">
                        <thead>
                            <tr>
                                <th>{t('shop.revenue.table.orderId')}</th>
                                <th>{t('shop.revenue.table.customer')}</th>
                                <th>{t('shop.revenue.table.date')}</th>
                                <th>{t('shop.revenue.table.service')}</th>
                                <th>{t('shop.revenue.table.amount')}</th>
                                <th>{t('shop.revenue.table.fee')} (15%)</th>
                                <th>{t('shop.revenue.table.net')}</th>
                                <th>{t('shop.revenue.table.orderStatus')}</th>
                                <th>{t('shop.revenue.table.payment')}</th>
                                <th>{t('shop.revenue.table.method')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayOrders.map(order => (
                                <tr key={order.id}>
                                    <td className="order-id">{order.id}</td>
                                    <td>{order.customer}</td>
                                    <td>{order.date}</td>
                                    <td>{order.service}</td>
                                    <td className="order-total">
                                        {order.amount > 0 ? order.amount.toLocaleString() + 'đ' : '—'}
                                    </td>
                                    <td className="order-commission">
                                        {order.amount > 0 ? '-' + Math.round(order.amount * 0.15).toLocaleString() + 'đ' : '—'}
                                    </td>
                                    <td className="order-net">
                                        {order.amount > 0 ? Math.round(order.amount * 0.85).toLocaleString() + 'đ' : '—'}
                                    </td>
                                    <td>
                                        <span className={`order-status-badge order-status-${order.orderStatus?.replace(/[^a-z]/g, '-')}`}>
                                            {statusLabel[order.orderStatus] || order.orderStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${order.paymentStatus}`}>
                                            {order.paymentStatus === 'paid'
                                                ? t('shop.revenue.filters.paid')
                                                : t('shop.revenue.filters.pending')}
                                        </span>
                                    </td>
                                    <td className="order-method">{order.paymentMethod}</td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={10} style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>
                                        {t('shop.revenue.empty.noOrdersFound')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {filteredOrders.length > 8 && (
                        <div className="show-more-row">
                            <button className="show-more-btn" onClick={() => setShowAllOrders(p => !p)}>
                                {showAllOrders
                                    ? t('shop.revenue.pagination.showLess')
                                    : `${t('shop.revenue.pagination.showAll')} (${filteredOrders.length} ${t('shop.revenue.units.orders')})`}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Subscription */}
            <div className="shop-revenue-section">
                <h2 className="section-title">{t('shop.revenue.sections.subscriptionPlan')}</h2>
                <div className="subscription-card">
                    <div className="subscription-info">
                        <div className="subscription-plan">
                            <Calendar size={20} />
                            <div>
                                <div className="plan-name">{subscriptionInfo.plan} {t('shop.revenue.subscription.planSuffix')}</div>
                                <div className="plan-status">
                                    {t('shop.revenue.subscription.statusLabel')}: <span className="status-active">{t('shop.revenue.subscription.status.active')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="subscription-details">
                            <div><strong>{t('shop.revenue.subscription.monthlyFee')}:</strong> {subscriptionInfo.monthlyFee.toLocaleString()}đ</div>
                            <div><strong>{t('shop.revenue.subscription.commission')}:</strong> {subscriptionInfo.commissionRate}% {t('shop.revenue.subscription.perOrder')}</div>
                            <div><strong>{t('shop.revenue.subscription.nextBilling')}:</strong> {subscriptionInfo.nextBillingDate}</div>
                        </div>
                    </div>
                    <button className="subscription-btn" onClick={() => setShowSubModal(true)}>
                        {t('shop.revenue.subscription.manage')}
                    </button>
                </div>
            </div>

            {/* Subscription Modal */}
            {showSubModal && (
                <div className="rev-modal-overlay" onClick={() => setShowSubModal(false)}>
                    <div className="rev-modal" onClick={e => e.stopPropagation()}>
                        <div className="rev-modal-header">
                            <h2>{t('shop.revenue.subscription.modal.title')}</h2>
                            <button className="rev-modal-close" onClick={() => setShowSubModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="rev-modal-body">
                            <div className="sub-plan-badge">{subscriptionInfo.plan} {t('shop.revenue.subscription.planSuffix')}</div>
                            <div className="sub-detail-grid">
                                <div className="sub-detail-item">
                                    <span className="sub-detail-label">{t('shop.revenue.subscription.monthlyFee')}</span>
                                    <span className="sub-detail-value">{subscriptionInfo.monthlyFee.toLocaleString()}đ</span>
                                </div>
                                <div className="sub-detail-item">
                                    <span className="sub-detail-label">{t('shop.revenue.subscription.commissionRate')}</span>
                                    <span className="sub-detail-value">{subscriptionInfo.commissionRate}%</span>
                                </div>
                                <div className="sub-detail-item">
                                    <span className="sub-detail-label">{t('shop.revenue.subscription.currentStatus')}</span>
                                    <span className="sub-detail-value" style={{ color: '#4d9e84' }}>{t('shop.revenue.subscription.status.active')}</span>
                                </div>
                                <div className="sub-detail-item">
                                    <span className="sub-detail-label">{t('shop.revenue.subscription.nextBilling')}</span>
                                    <span className="sub-detail-value">{subscriptionInfo.nextBillingDate}</span>
                                </div>
                            </div>
                            <div className="sub-features">
                                <div className="sub-features-title">{t('shop.revenue.subscription.includedFeatures')}</div>
                                {subscriptionInfo.features.map(f => (
                                    <div key={f} className="sub-feature-item">
                                        <CheckCircle size={14} style={{ color: '#4d9e84' }} /> {f}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rev-modal-footer">
                            <button className="btn-cancel" onClick={() => setShowSubModal(false)}>{t('common.close')}</button>
                            <button className="btn-confirm" onClick={() => {
                                toast.info(t('shop.revenue.toasts.upgradeContact'))
                                setShowSubModal(false)
                            }}>
                                {t('shop.revenue.subscription.upgrade')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ShopRevenue
