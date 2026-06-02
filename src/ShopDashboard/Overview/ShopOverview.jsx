import { createElement, useState } from 'react'
import './ShopOverview.css'
import {
    AlertTriangle,
    CalendarClock,
    CheckCircle,
    Clock,
    DollarSign,
    PackageSearch,
    Shirt,
    ShoppingBag,
    Timer,
    TrendingUp,
    Wrench,
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
    const [today] = useState(() => new Date())

    const liveOrders = loadOrders(ordersDefault)
    const liveMachines = loadMachines(machinesDefault)
    const liveSupplies = loadSupplies(suppliesDefault)
    const overview = statistics.overview

    const pendingPickup = liveOrders.filter(order => order.status === 'pending-checkin').length
    const activeWashing = liveOrders.filter(order => ['washing', 'drying', 'ironing'].includes(order.status)).length
    const readyOrders = liveOrders.filter(order => order.status === 'ready').length
    const completedToday = statistics.ordersByStatus.completedToday
    const lowSupplies = liveSupplies.filter(supply => supply.current <= supply.reorderPoint)
    const maintenanceMachines = liveMachines.filter(machine => machine.status === 'maintenance')

    const kpis = [
        {
            label: t('shopOverview.todayRevenue'),
            value: overview.todayRevenue,
            meta: overview.revenueChange,
            tone: 'teal',
            Icon: DollarSign,
        },
        {
            label: t('shopOverview.pendingPickup'),
            value: String(pendingPickup),
            meta: t('shopOverview.needsCheckin'),
            tone: 'amber',
            Icon: PackageSearch,
        },
        {
            label: t('shopOverview.activeWashing'),
            value: String(activeWashing),
            meta: t('shopOverview.inProduction'),
            tone: 'blue',
            Icon: Shirt,
        },
        {
            label: t('shopOverview.readyForDelivery'),
            value: String(readyOrders),
            meta: t('shopOverview.awaitingRunner'),
            tone: 'navy',
            Icon: CheckCircle,
        },
    ]

    const recentOrders = [...liveOrders]
        .sort((a, b) => new Date(b.completedTime || b.pickupTime || 0) - new Date(a.completedTime || a.pickupTime || 0))
        .slice(0, 6)
        .map(order => ({
            id: order.id,
            customer: order.customer,
            service: order.service,
            status: toDisplayStatus(order.status),
            phone: order.phone,
            paymentStatus: order.paymentStatus,
            pickupTime: order.pickupTime,
            priority: order.priority,
        }))

    const peakHoursData = statistics.peakHours
    const maxOrders = Math.max(...peakHoursData.map(item => item.orders), 1)

    const machineStats = [
        {
            label: t('shopOverview.available'),
            value: liveMachines.filter(machine => machine.status === 'empty').length,
            tone: 'teal',
        },
        {
            label: t('shopOverview.inUse'),
            value: liveMachines.filter(machine => ['washing', 'drying', 'ironing'].includes(machine.status)).length,
            tone: 'blue',
        },
        {
            label: t('shopOverview.maintenance'),
            value: maintenanceMachines.length,
            tone: 'red',
        },
    ]

    const topServices = statistics.topServices.slice(0, 5).map((service, index, arr) => ({
        name: service.name,
        orders: service.orders,
        revenue: `${(service.revenue / 1000000).toFixed(1)}M VND`,
        percentage: arr[0] ? Math.round((service.orders / arr[0].orders) * 100) : 100,
    }))

    const supplies = liveSupplies.slice(0, 5).map(supply => {
        const pct = Math.min(100, (supply.current / supply.max) * 100)
        const level = supply.current <= supply.reorderPoint ? 'critical' : pct < 50 ? 'low' : 'ok'
        return { ...supply, pct, level }
    })

    const alerts = [
        {
            title: t('shopOverview.lowSupplyAlert'),
            detail: lowSupplies.length > 0
                ? t('shopOverview.lowSupplyDetail').replace('{count}', lowSupplies.length)
                : t('shopOverview.noLowSupply'),
            tone: lowSupplies.length > 0 ? 'amber' : 'teal',
            Icon: AlertTriangle,
        },
        {
            title: t('shopOverview.machineAlert'),
            detail: maintenanceMachines.length > 0
                ? t('shopOverview.machineDetail').replace('{count}', maintenanceMachines.length)
                : t('shopOverview.noMachineIssue'),
            tone: maintenanceMachines.length > 0 ? 'red' : 'teal',
            Icon: Wrench,
        },
        {
            title: t('shopOverview.todayCompletion'),
            detail: t('shopOverview.completedToday').replace('{count}', completedToday),
            tone: 'blue',
            Icon: Timer,
        },
    ]

    const dateLabel = new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(today)

    const renderOrdersTable = (orders, isModal = false) => (
        <div className="shop-overview-table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>{t('shopOverview.orderId')}</th>
                        <th>{t('shopOverview.customer')}</th>
                        {isModal && <th>{t('shopOverview.phone')}</th>}
                        <th>{t('shopOverview.service')}</th>
                        <th>{t('shopOverview.status')}</th>
                        <th>{t('shopOverview.pickupTime')}</th>
                        {isModal && <th>{t('shopOverview.payment')}</th>}
                    </tr>
                </thead>
                <tbody>
                    {orders.length === 0 && (
                        <tr>
                            <td colSpan={isModal ? 7 : 5} className="shop-overview-empty-row">
                                {t('shopOverview.noOrders')}
                            </td>
                        </tr>
                    )}
                    {orders.map((order, index) => {
                        const meta = getOrderStatusMeta(toDisplayStatus(order.status))
                        return (
                            <tr key={`${order.id}-${index}`}>
                                <td className="shop-order-id">{order.id}</td>
                                <td>{order.customer}</td>
                                {isModal && <td>{order.phone}</td>}
                                <td>{order.service}</td>
                                <td>
                                    <span className={`shop-status-badge tone-${meta.tone}`}>
                                        {meta.label}
                                    </span>
                                </td>
                                <td className="shop-order-time">{order.pickupTime}</td>
                                {isModal && (
                                    <td>
                                        <span className={`shop-payment-badge ${order.paymentStatus}`}>
                                            {order.paymentStatus === 'paid' ? t('shopOverview.paid') : t('shopOverview.pending')}
                                        </span>
                                    </td>
                                )}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )

    return (
        <div className="shop-overview">
            <header className="shop-overview-header">
                <div>
                    <span className="shop-overview-eyebrow">{t('shopOverview.eyebrow')}</span>
                    <h1 className="shop-overview-title">{t('shopOverview.title')}</h1>
                    <p className="shop-overview-subtitle">{t('shopOverview.subtitle')}</p>
                </div>
                <div className="shop-overview-date">
                    <CalendarClock size={15} strokeWidth={1.9} />
                    {dateLabel}
                </div>
            </header>

            <section className="shop-overview-kpis">
                {kpis.map(({ label, value, meta, tone, Icon }) => (
                    <article className={`shop-kpi-card tone-${tone}`} key={label}>
                        <div className="shop-kpi-icon">
                            {createElement(Icon, { size: 19, strokeWidth: 1.9 })}
                        </div>
                        <span>{label}</span>
                        <strong>{value}</strong>
                        <p>{meta}</p>
                    </article>
                ))}
            </section>

            <section className="shop-overview-workspace">
                <div className="shop-overview-primary">
                    <article className="shop-overview-card recent-orders-card">
                        <div className="shop-overview-card-header">
                            <div>
                                <span className="shop-card-kicker">{t('shopOverview.highPriority')}</span>
                                <h2>{t('shopOverview.recentOrders')}</h2>
                            </div>
                            <button className="shop-overview-view-all" type="button" onClick={() => setShowAllOrders(true)}>
                                {t('shopOverview.viewAll')}
                            </button>
                        </div>
                        {renderOrdersTable(recentOrders)}
                    </article>

                    <article className="shop-overview-card peak-hours-card">
                        <div className="shop-overview-card-header">
                            <div>
                                <span className="shop-card-kicker">{t('shopOverview.live')}</span>
                                <h2>{t('shopOverview.peakHours')}</h2>
                            </div>
                            <span className="shop-live-badge">{t('shopOverview.today')}</span>
                        </div>
                        <div className="shop-peak-chart">
                            {peakHoursData.map((item) => (
                                <div className="shop-peak-bar-item" key={item.hour}>
                                    <div className="shop-peak-bar-track">
                                        <span style={{ height: `${(item.orders / maxOrders) * 100}%` }} />
                                    </div>
                                    <small>{item.hour}</small>
                                </div>
                            ))}
                        </div>
                    </article>
                </div>

                <aside className="shop-overview-side">
                    <article className="shop-overview-card alerts-card">
                        <div className="shop-overview-card-header">
                            <div>
                                <span className="shop-card-kicker">{t('shopOverview.actionNeeded')}</span>
                                <h2>{t('shopOverview.operationalAlerts')}</h2>
                            </div>
                        </div>
                        <div className="shop-alert-list">
                            {alerts.map(({ title, detail, tone, Icon }) => (
                                <div className={`shop-alert-item tone-${tone}`} key={title}>
                                    <div className="shop-alert-icon">
                                        {createElement(Icon, { size: 16, strokeWidth: 1.9 })}
                                    </div>
                                    <div>
                                        <strong>{title}</strong>
                                        <p>{detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </article>

                    <article className="shop-overview-card machines-card">
                        <div className="shop-overview-card-header">
                            <div>
                                <span className="shop-card-kicker">{t('shopOverview.capacity')}</span>
                                <h2>{t('shopOverview.machineStatus')}</h2>
                            </div>
                            <span className="shop-muted-pill">{liveMachines.length} {t('shopOverview.total')}</span>
                        </div>
                        <div className="machine-status-grid">
                            {machineStats.map((item) => (
                                <div className={`machine-status-card tone-${item.tone}`} key={item.label}>
                                    <strong>{item.value}</strong>
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </article>

                    <article className="shop-overview-card top-services-card">
                        <div className="shop-overview-card-header">
                            <div>
                                <span className="shop-card-kicker">{t('shopOverview.thisMonth')}</span>
                                <h2>{t('shopOverview.topServices')}</h2>
                            </div>
                        </div>
                        <div className="top-services-list">
                            {topServices.map((service, index) => (
                                <div className="top-service-item" key={service.name}>
                                    <span className="top-service-rank">{index + 1}</span>
                                    <div>
                                        <strong>{service.name}</strong>
                                        <p>{service.orders} {t('shopOverview.orders')} · {service.revenue}</p>
                                        <div className="top-service-bar">
                                            <span style={{ width: `${service.percentage}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </article>

                    <article className="shop-overview-card supplies-card">
                        <div className="shop-overview-card-header">
                            <div>
                                <span className="shop-card-kicker">{t('shopOverview.inventory')}</span>
                                <h2>{t('shopOverview.supplies')}</h2>
                            </div>
                        </div>
                        <div className="supply-list">
                            {supplies.map((supply) => (
                                <div className="supply-item" key={supply.id}>
                                    <div className="supply-head">
                                        <strong>{supply.name}</strong>
                                        <span className={`supply-amount ${supply.level}`}>
                                            {supply.current}/{supply.max} {supply.unit}
                                        </span>
                                    </div>
                                    <div className="supply-track">
                                        <span className={supply.level} style={{ width: `${supply.pct}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </article>
                </aside>
            </section>

            {showAllOrders && (
                <div className="shop-overview-modal-overlay" onClick={() => setShowAllOrders(false)}>
                    <div className="shop-overview-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="shop-overview-modal-header">
                            <div>
                                <span className="shop-card-kicker">{t('shopOverview.allOrders')}</span>
                                <h2>{t('shopOverview.allOrders')} ({liveOrders.length})</h2>
                            </div>
                            <button
                                className="shop-overview-modal-close"
                                type="button"
                                aria-label={t('common.close')}
                                onClick={() => setShowAllOrders(false)}
                            >
                                <X size={18} strokeWidth={1.9} />
                            </button>
                        </div>
                        <div className="shop-overview-modal-content">
                            {renderOrdersTable(liveOrders, true)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ShopOverview
