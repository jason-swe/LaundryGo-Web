import { useState } from 'react'
import './ShopOverview.css'
import {
    DollarSign,
    ShoppingCart,
    User,
    Clock,
    TrendingUp,
    Trophy,
    X
} from 'lucide-react'
import { statistics, orders as ordersDefault, machines as machinesDefault, supplies as suppliesDefault } from '../../data'
import { loadOrders, loadMachines, loadSupplies } from '../../utils/dataManager'
import { getOrderStatusMeta } from '../../components/OrderStatusBadge/OrderStatusBadge'
import { useTranslation } from '../../shared/lib/i18n'

function toDisplayStatus(rawStatus) {
    const map = {
        'pending-checkin': 'pending-checkin',
        washing: 'washing',
        drying: 'drying',
        ironing: 'ironing',
        ready: 'ready',
        delivering: 'delivering',
    }
    return map[rawStatus] || 'completed'
}

function ShopOverview() {
    const { language, t } = useTranslation()
    const [showAllOrders, setShowAllOrders] = useState(false)

    const liveOrders = loadOrders(ordersDefault)
    const liveMachines = loadMachines(machinesDefault)
    const liveSupplies = loadSupplies(suppliesDefault)

    const overview = statistics.overview

    const stats = [
        { label: t('shop.todayRevenue'), value: overview.todayRevenue, change: overview.revenueChange, trend: overview.revenueChangeTrend, icon: DollarSign, iconClass: 'icon-success' },
        { label: t('shop.totalOrders'), value: overview.totalOrders.toString(), change: overview.ordersChange, trend: overview.ordersTrend, icon: ShoppingCart, iconClass: 'icon-primary' },
        { label: t('shop.activeCustomers'), value: overview.activeCustomers.toString(), change: overview.customersChange, trend: overview.customersTrend, icon: User, iconClass: 'icon-info' },
        { label: t('shop.avgOrderTime'), value: overview.avgOrderTime, change: overview.timeChange, trend: overview.timeTrend, icon: Clock, iconClass: 'icon-primary' },
        { label: t('shop.monthlyRevenue'), value: overview.monthlyRevenue, change: overview.monthlyChange, trend: overview.monthlyTrend, icon: TrendingUp, iconClass: 'icon-info' },
        { label: t('shop.customerRating'), value: `${overview.customerRating}/5.0`, change: `${overview.totalReviews.toLocaleString()} ${t('shop.reviews')}`, trend: overview.ratingTrend, icon: Trophy, iconClass: 'icon-warning' }
    ]

    const recentOrders = [...liveOrders]
        .sort((a, b) => new Date(b.completedTime || b.pickupTime || 0) - new Date(a.completedTime || a.pickupTime || 0))
        .slice(0, 5)
        .map(order => ({
            id: order.id,
            customer: order.customer,
            service: order.service,
            status: toDisplayStatus(order.status),
            phone: order.phone,
            paymentStatus: order.paymentStatus,
            pickupTime: order.pickupTime
        }))

    const peakHoursData = statistics.peakHours
    const maxOrders = Math.max(...peakHoursData.map(d => d.orders), 1)

    const machinesAvailable = liveMachines.filter(m => m.status === 'empty').length
    const machinesInUse = liveMachines.filter(m => ['washing', 'drying', 'ironing'].includes(m.status)).length
    const machinesMaintenance = liveMachines.filter(m => m.status === 'maintenance').length
    const totalMachines = liveMachines.length || 1

    const topServices = statistics.topServices.map((service, index, arr) => ({
        name: service.name,
        orders: service.orders,
        revenue: `${(service.revenue / 1000000).toFixed(1)}M VND`,
        percentage: arr[0] ? Math.round((service.orders / arr[0].orders) * 100) : 100
    }))

    const supplies = liveSupplies.slice(0, 6).map(supply => {
        const pct = Math.min(100, (supply.current / supply.max) * 100)
        const level = pct <= 20 ? 'critical' : pct < 50 ? 'low' : 'ok'
        return { ...supply, pct, level }
    })

    return (
        <div className="shop-overview">
            <div className="shop-overview-header">
                <div>
                    <h1 className="shop-overview-title">{t('shop.overviewTitle')}</h1>
                    <p className="shop-overview-subtitle">{t('shop.overviewSubtitle')}</p>
                </div>
                <div className="shop-overview-date">
                    <Clock size={14} />
                    {new Date().toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="shop-overview-stats">
                {stats.map((stat, index) => {
                    const IconComponent = stat.icon
                    return (
                        <div key={index} className="shop-overview-stat-card">
                            <div className={`shop-overview-stat-icon ${stat.iconClass}`}>
                                <IconComponent size={22} color="white" />
                            </div>
                            <div className="shop-overview-stat-content">
                                <div className="shop-overview-stat-label">{stat.label}</div>
                                <div className="shop-overview-stat-value">{stat.value}</div>
                                <div className={`shop-overview-stat-change ${stat.trend}`}>
                                    {stat.change}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Main Content Grid */}
            <div className="shop-overview-grid">
                {/* Peak Hours Chart */}
                <div className="shop-overview-card shop-overview-peak-hours">
                    <div className="shop-overview-card-header">
                        <h2 className="shop-overview-card-title">{t('shop.todayPeakHours')}</h2>
                        <span className="shop-overview-card-badge">{t('shop.live')}</span>
                    </div>
                    <div className="shop-overview-chart">
                        <div className="shop-overview-chart-bars">
                            {peakHoursData.map((data, index) => (
                                <div key={index} className="shop-overview-chart-bar-wrapper">
                                    <div
                                        className="shop-overview-chart-bar"
                                        style={{ height: `${(data.orders / maxOrders) * 100}%` }}
                                        title={`${data.hour}: ${data.orders} ${t('dashboard.orders').toLowerCase()}`}
                                    />
                                    <div className="shop-overview-chart-label">{data.hour}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="shop-overview-card shop-overview-recent-orders">
                    <div className="shop-overview-card-header">
                        <h2 className="shop-overview-card-title">{t('shop.recentOrders')}</h2>
                        <button className="shop-overview-view-all" onClick={() => setShowAllOrders(true)}>{t('shop.viewAll')}</button>
                    </div>
                    <div className="shop-overview-orders-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('shop.orderId')}</th>
                                    <th>{t('shop.customer')}</th>
                                    <th>{t('shop.service')}</th>
                                    <th>{t('shop.status')}</th>
                                    <th>{t('shop.time')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.length === 0 && (
                                    <tr><td colSpan="5" className="shop-overview-empty-row">{t('shop.noOrdersYet')}</td></tr>
                                )}
                                {recentOrders.map((order, index) => {
                                    const meta = getOrderStatusMeta(order.status, t)
                                    return (
                                        <tr key={index}>
                                            <td className="order-id">{order.id}</td>
                                            <td>{order.customer}</td>
                                            <td>{order.service}</td>
                                            <td>
                                                <span className={`order-status-badge tone-${meta.tone}`}>
                                                    {meta.label}
                                                </span>
                                            </td>
                                            <td className="order-time">
                                                {order.pickupTime?.split(' ')[1] || order.pickupTime}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Machine Status */}
                <div className="shop-overview-card shop-overview-machines">
                    <div className="shop-overview-card-header">
                        <h2 className="shop-overview-card-title">{t('shop.machineStatus')}</h2>
                        <span className="shop-overview-total-machines">{totalMachines} {t('shop.total')}</span>
                    </div>

                    {/* Machine Status Cards */}
                    <div className="shop-overview-machine-cards">
                        <div className="shop-overview-machine-status-card available">
                            <div className="machine-card-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="machine-card-number">{machinesAvailable}</div>
                            <div className="machine-card-label">{t('shop.available')}</div>
                            <div className="machine-card-percentage">{Math.round((machinesAvailable / totalMachines) * 100)}% {t('shop.ready')}</div>
                        </div>

                        <div className="shop-overview-machine-status-card in-use">
                            <div className="machine-card-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div className="machine-card-number">{machinesInUse}</div>
                            <div className="machine-card-label">{t('shop.inUse')}</div>
                            <div className="machine-card-percentage">{Math.round((machinesInUse / totalMachines) * 100)}% {t('shop.running')}</div>
                        </div>

                        <div className="shop-overview-machine-status-card maintenance">
                            <div className="machine-card-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="machine-card-number">{machinesMaintenance}</div>
                            <div className="machine-card-label">{t('shop.maintenance')}</div>
                            <div className="machine-card-percentage">{Math.round((machinesMaintenance / totalMachines) * 100)}% {t('shop.offline')}</div>
                        </div>
                    </div>
                </div>

                {/* Top Services */}
                <div className="shop-overview-card shop-overview-top-services">
                    <div className="shop-overview-card-header">
                        <h2 className="shop-overview-card-title">{t('shop.topServices')}</h2>
                        <span className="shop-overview-card-badge">{t('shop.thisMonth')}</span>
                    </div>
                    <div className="shop-overview-services-list">
                        {topServices.map((service, index) => (
                            <div key={index} className="shop-overview-service-item">
                                <div className="shop-overview-service-rank">{index + 1}</div>
                                <div className="shop-overview-service-details">
                                    <div className="shop-overview-service-name">{service.name}</div>
                                    <div className="shop-overview-service-stats">
                                        {service.orders} {t('dashboard.orders').toLowerCase()} • {service.revenue}
                                    </div>
                                    <div className="shop-overview-service-bar">
                                        <div
                                            className="shop-overview-service-fill"
                                            style={{ width: `${service.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Supplies Inventory */}
                <div className="shop-overview-card shop-overview-supplies">
                    <div className="shop-overview-card-header">
                        <h2 className="shop-overview-card-title">{t('shop.suppliesInventory')}</h2>
                        <button className="shop-overview-view-all">{t('shop.manage')}</button>
                    </div>
                    <div className="shop-overview-supplies-list">
                        {supplies.length === 0 && (
                            <div className="shop-overview-empty-text">{t('shop.noSupplyData')}</div>
                        )}
                        {supplies.map((supply, index) => (
                            <div key={index} className="shop-overview-supply-item">
                                <div className="shop-overview-supply-header">
                                    <span className="shop-overview-supply-name">{supply.name}</span>
                                    <span className={`shop-overview-supply-amount ${supply.level}`}>
                                        {supply.current}/{supply.max} {supply.unit}
                                    </span>
                                </div>
                                <div className="shop-overview-supply-bar-container">
                                    <div
                                        className={`shop-overview-supply-bar ${supply.level}`}
                                        style={{ width: `${supply.pct}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* All Orders Modal */}
            {showAllOrders && (
                <div className="shop-overview-modal-overlay" onClick={() => setShowAllOrders(false)}>
                    <div className="shop-overview-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="shop-overview-modal-header">
                            <h2>{t('shop.allOrders')} ({liveOrders.length})</h2>
                            <button className="shop-overview-modal-close" onClick={() => setShowAllOrders(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="shop-overview-modal-content">
                            <div className="shop-overview-orders-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>{t('shop.orderId')}</th>
                                            <th>{t('shop.customer')}</th>
                                            <th>{t('shop.phone')}</th>
                                            <th>{t('shop.service')}</th>
                                            <th>{t('shop.status')}</th>
                                            <th>{t('shop.pickupTime')}</th>
                                            <th>{t('shop.payment')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {liveOrders.length === 0 && (
                                            <tr><td colSpan="7" className="shop-overview-empty-row">{t('shop.noOrders')}</td></tr>
                                        )}
                                        {liveOrders.map((order, index) => {
                                            const meta = getOrderStatusMeta(toDisplayStatus(order.status))
                                            return (
                                                <tr key={index}>
                                                    <td className="order-id">{order.id}</td>
                                                    <td>{order.customer}</td>
                                                    <td>{order.phone}</td>
                                                    <td>{order.service}</td>
                                                    <td>
                                                        <span className={`order-status-badge tone-${meta.tone}`}>
                                                            {meta.label}
                                                        </span>
                                                    </td>
                                                    <td className="order-time">{order.pickupTime}</td>
                                                    <td>
                                                        <span className={`payment-status ${order.paymentStatus}`}>
                                                            {order.paymentStatus === 'paid' ? `✓ ${t('shop.paid')}` : t('shop.pending')}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ShopOverview
