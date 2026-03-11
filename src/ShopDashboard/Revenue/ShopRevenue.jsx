import { useState } from 'react'
import {
    DollarOutlined,
    CalendarOutlined,
    FileTextOutlined,
    DownloadOutlined,
    RiseOutlined,
    ShoppingOutlined,
    CloseOutlined,
    CreditCardOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    BarChartOutlined
} from '@ant-design/icons'
import './ShopRevenue.css'
import { revenue as revenueData, orders as ordersData } from '../../data'
import toast from '../../utils/toast'

const parsePrice = (str) => {
    if (!str) return 0
    return parseInt(String(str).replace(/[^0-9]/g, '')) || 0
}

function ShopRevenue() {
    const [selectedPeriod, setSelectedPeriod] = useState('month')
    const [orderFilter, setOrderFilter] = useState('all')
    const [showAllOrders, setShowAllOrders] = useState(false)
    const [showSubModal, setShowSubModal] = useState(false)

    // ── Chart data ────────────────────────────────────────────────────────────
    const getChartData = () => {
        switch (selectedPeriod) {
            case 'week':
                return revenueData.daily.map(d => ({
                    label: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
                    revenue: d.revenue, net: d.profit, orders: d.orders
                }))
            case 'month':
                return revenueData.weekly.map(w => ({
                    label: w.week.replace(/\(.*\)/, '').trim(),
                    revenue: w.revenue, net: w.profit, orders: w.orders
                }))
            case 'quarter':
                return revenueData.monthly.slice(-3).map(m => ({
                    label: new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                    revenue: m.revenue, net: m.profit, orders: m.orders
                }))
            case 'year':
                return revenueData.monthly.map(m => ({
                    label: new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
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
        week: 'This Week', month: 'This Month',
        quarter: 'This Quarter', year: 'This Year'
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
    const serviceColors = ['#719FC2', '#4d9e84', '#5492b4', '#719FC2', '#c05a50', '#5492b4']
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
        const headers = ['Label', 'Revenue (đ)', 'Net Revenue (đ)', 'Commission (đ)', 'Orders']
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
        toast.success('Report exported successfully!')
    }

    const subscriptionInfo = {
        plan: 'Professional',
        monthlyFee: 500000,
        commissionRate: 15,
        nextBillingDate: '2026-04-01',
        status: 'active',
        features: [
            'Unlimited orders per month',
            'Priority customer support',
            'Analytics & revenue dashboard',
            'Staff management module',
            'Promotion & coupon tools',
            'Incident report management'
        ]
    }

    const statusLabel = {
        'pending-checkin': 'Pending Checkin', 'washing': 'Washing',
        'washing-completed': 'Wash Done', 'delivering': 'Delivering',
        'delivered': 'Delivered', 'cancelled': 'Cancelled', 'completed': 'Completed'
    }

    return (
        <div className="shop-revenue">

            {/* Header */}
            <div className="shop-revenue-header">
                <div>
                    <h1 className="shop-revenue-title">
                        <DollarOutlined style={{ marginRight: '8px' }} />
                        Revenue & Finance
                    </h1>
                    <p className="shop-revenue-subtitle">
                        Track your earnings, commission breakdown, and payment history
                    </p>
                </div>
                <button className="shop-revenue-export-btn" onClick={handleExport}>
                    <DownloadOutlined /> Export CSV
                </button>
            </div>

            {/* Stats */}
            <div className="shop-revenue-stats">
                <div className="revenue-stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(113,159,194,0.1)' }}>
                        <RiseOutlined style={{ fontSize: '24px', color: '#719FC2' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Revenue ({periodLabel})</div>
                        <div className="stat-value">{(stats.totalRevenue / 1000000).toFixed(1)}M đ</div>
                    </div>
                </div>
                <div className="revenue-stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(184,137,42,0.1)' }}>
                        <FileTextOutlined style={{ fontSize: '24px', color: '#5492b4' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Platform Fee (15%)</div>
                        <div className="stat-value" style={{ color: '#5492b4' }}>
                            -{(stats.commission / 1000000).toFixed(1)}M đ
                        </div>
                    </div>
                </div>
                <div className="revenue-stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(77,158,132,0.1)' }}>
                        <DollarOutlined style={{ fontSize: '24px', color: '#4d9e84' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Net Revenue</div>
                        <div className="stat-value" style={{ color: '#4d9e84' }}>
                            {(stats.netRevenue / 1000000).toFixed(1)}M đ
                        </div>
                    </div>
                </div>
                <div className="revenue-stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(113,159,194,0.1)' }}>
                        <ShoppingOutlined style={{ fontSize: '24px', color: '#719FC2' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Orders</div>
                        <div className="stat-value">{stats.totalOrders.toLocaleString()}</div>
                        <div className="stat-sublabel">
                            Avg: {stats.totalOrders > 0
                                ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString()
                                : 0}đ / order
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="shop-revenue-section">
                <div className="section-header-row">
                    <h2 className="section-title">Revenue Trend</h2>
                    <div className="shop-revenue-period">
                        {['week', 'month', 'quarter', 'year'].map(p => (
                            <button
                                key={p}
                                className={`period-btn ${selectedPeriod === p ? 'active' : ''}`}
                                onClick={() => setSelectedPeriod(p)}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="revenue-chart-card">
                    <div className="chart-legend">
                        <span className="legend-item revenue-legend">■ Revenue</span>
                        <span className="legend-item net-legend">■ Net Revenue</span>
                    </div>
                    <div className="revenue-chart">
                        {chartData.map((data, i) => {
                            const revH = (data.revenue / maxRevenue) * 100
                            const netH = (data.net / maxRevenue) * 100
                            return (
                                <div key={i} className="chart-bar-group">
                                    <div className="bar-tooltip">
                                        <div><strong>{data.label}</strong></div>
                                        <div>Revenue: {(data.revenue / 1000000).toFixed(2)}M đ</div>
                                        <div>Net: {(data.net / 1000000).toFixed(2)}M đ</div>
                                        <div>Orders: {data.orders}</div>
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
                        <BarChartOutlined style={{ marginRight: 8 }} />Revenue by Service
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
                        <CreditCardOutlined style={{ marginRight: 8 }} />Payment Methods
                    </h2>
                    <div className="payment-method-list">
                        {Object.entries(paymentMap).length === 0 ? (
                            <p className="no-data-msg">No paid orders yet</p>
                        ) : (
                            Object.entries(paymentMap).map(([method, count]) => (
                                <div key={method} className="payment-method-row">
                                    <CreditCardOutlined style={{ color: '#719FC2' }} />
                                    <span className="pm-name">{method}</span>
                                    <span className="pm-count">{count} orders</span>
                                    <span className="pm-pct">{Math.round(count / totalPaid * 100)}%</span>
                                </div>
                            ))
                        )}
                        <div className="payment-summary">
                            <span>
                                <CheckCircleOutlined style={{ color: '#4d9e84' }} />
                                {' '}Paid: {allOrders.filter(o => o.paymentStatus === 'paid').length}
                            </span>
                            <span>
                                <ClockCircleOutlined style={{ color: '#5492b4' }} />
                                {' '}Pending: {allOrders.filter(o => o.paymentStatus === 'pending').length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="shop-revenue-section">
                <div className="section-header-row">
                    <h2 className="section-title">Order Revenue Details</h2>
                    <div className="order-filter-tabs">
                        {[['all', 'All'], ['paid', 'Paid'], ['pending', 'Pending']].map(([v, l]) => (
                            <button
                                key={v}
                                className={`order-filter-btn ${orderFilter === v ? 'active' : ''}`}
                                onClick={() => { setOrderFilter(v); setShowAllOrders(false) }}
                            >
                                {l} ({v === 'all' ? allOrders.length : allOrders.filter(o => o.paymentStatus === v).length})
                            </button>
                        ))}
                    </div>
                </div>
                <div className="revenue-table-container">
                    <table className="revenue-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Service</th>
                                <th>Amount</th>
                                <th>Fee (15%)</th>
                                <th>Net</th>
                                <th>Order Status</th>
                                <th>Payment</th>
                                <th>Method</th>
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
                                            {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="order-method">{order.paymentMethod}</td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={10} style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>
                                        No orders found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {filteredOrders.length > 8 && (
                        <div className="show-more-row">
                            <button className="show-more-btn" onClick={() => setShowAllOrders(p => !p)}>
                                {showAllOrders ? 'Show Less' : `Show All (${filteredOrders.length} orders)`}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Subscription */}
            <div className="shop-revenue-section">
                <h2 className="section-title">Subscription Plan</h2>
                <div className="subscription-card">
                    <div className="subscription-info">
                        <div className="subscription-plan">
                            <CalendarOutlined style={{ fontSize: '20px' }} />
                            <div>
                                <div className="plan-name">{subscriptionInfo.plan} Plan</div>
                                <div className="plan-status">
                                    Status: <span className="status-active">Active</span>
                                </div>
                            </div>
                        </div>
                        <div className="subscription-details">
                            <div><strong>Monthly Fee:</strong> {subscriptionInfo.monthlyFee.toLocaleString()}đ</div>
                            <div><strong>Commission:</strong> {subscriptionInfo.commissionRate}% per order</div>
                            <div><strong>Next Billing:</strong> {subscriptionInfo.nextBillingDate}</div>
                        </div>
                    </div>
                    <button className="subscription-btn" onClick={() => setShowSubModal(true)}>
                        Manage Subscription
                    </button>
                </div>
            </div>

            {/* Subscription Modal */}
            {showSubModal && (
                <div className="rev-modal-overlay" onClick={() => setShowSubModal(false)}>
                    <div className="rev-modal" onClick={e => e.stopPropagation()}>
                        <div className="rev-modal-header">
                            <h2>Subscription Details</h2>
                            <button className="rev-modal-close" onClick={() => setShowSubModal(false)}>
                                <CloseOutlined />
                            </button>
                        </div>
                        <div className="rev-modal-body">
                            <div className="sub-plan-badge">{subscriptionInfo.plan} Plan</div>
                            <div className="sub-detail-grid">
                                <div className="sub-detail-item">
                                    <span className="sub-detail-label">Monthly Fee</span>
                                    <span className="sub-detail-value">{subscriptionInfo.monthlyFee.toLocaleString()}đ</span>
                                </div>
                                <div className="sub-detail-item">
                                    <span className="sub-detail-label">Commission Rate</span>
                                    <span className="sub-detail-value">{subscriptionInfo.commissionRate}%</span>
                                </div>
                                <div className="sub-detail-item">
                                    <span className="sub-detail-label">Current Status</span>
                                    <span className="sub-detail-value" style={{ color: '#4d9e84' }}>Active</span>
                                </div>
                                <div className="sub-detail-item">
                                    <span className="sub-detail-label">Next Billing</span>
                                    <span className="sub-detail-value">{subscriptionInfo.nextBillingDate}</span>
                                </div>
                            </div>
                            <div className="sub-features">
                                <div className="sub-features-title">Included Features</div>
                                {subscriptionInfo.features.map(f => (
                                    <div key={f} className="sub-feature-item">
                                        <CheckCircleOutlined style={{ color: '#4d9e84' }} /> {f}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rev-modal-footer">
                            <button className="btn-cancel" onClick={() => setShowSubModal(false)}>Close</button>
                            <button className="btn-confirm" onClick={() => {
                                toast.info('Contact support@laundrygo.vn to upgrade your plan')
                                setShowSubModal(false)
                            }}>
                                Upgrade Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ShopRevenue
