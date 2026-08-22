import { createElement, useCallback, useEffect, useMemo, useState } from 'react'
import './ShopOverview.css'
import {
    AlertTriangle,
    CalendarClock,
    CheckCircle,
    PackageSearch,
    RefreshCw,
    Shirt,
    Wrench,
    X,
} from 'lucide-react'
import { getOrderStatusMeta } from '../../components/OrderStatusBadge/orderStatus'
import { getShopOwnerOperations } from '../../services/shopOwnerApi'
import { getShopOwnerOrders } from '../../services/shopOwnerOrderApi'
import { useTranslation } from '../../shared/lib/i18n'

function toDisplayStatus(rawStatus) {
    const normalized = String(rawStatus || '').toLowerCase().replace(/_/g, '-')
    const map = {
        pending: 'pending',
        confirmed: 'confirmed',
        'picking-up': 'picking-up',
        'at-store': 'at-store',
        washing: 'washing',
        drying: 'drying',
        ironing: 'ironing',
        'ready-for-delivery': 'ready',
        ready: 'ready',
        delivering: 'delivering',
        completed: 'completed',
        cancelled: 'cancelled',
        'waiting-customer-confirmation': 'waiting-customer-confirmation',
        'cancelled-after-weight-confirmation': 'cancelled-after-weight-confirmation',
    }
    return map[normalized] || normalized || 'pending'
}

function ShopOverview() {
    const { language, t } = useTranslation()
    const [showAllOrders, setShowAllOrders] = useState(false)
    const [today] = useState(() => new Date())
    const [orders, setOrders] = useState([])
    const [machines, setMachines] = useState([])
    const [supplies, setSupplies] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState('')

    const loadOverview = useCallback(async () => {
        setIsLoading(true)
        setLoadError('')

        try {
            const [orderPage, operations] = await Promise.all([
                getShopOwnerOrders({ page: 0, size: 100 }),
                getShopOwnerOperations(),
            ])

            setOrders(Array.isArray(orderPage?.items) ? orderPage.items : [])
            setMachines(Array.isArray(operations?.machines) ? operations.machines : [])
            setSupplies(Array.isArray(operations?.supplies) ? operations.supplies : [])
        } catch (error) {
            setLoadError(error?.message || t('shopOverview.loadFailed'))
        } finally {
            setIsLoading(false)
        }
    }, [t])

    useEffect(() => {
        void loadOverview()
    }, [loadOverview])

    const displayOrders = useMemo(
        () => orders.map((order) => ({ ...order, status: toDisplayStatus(order.status) })),
        [orders],
    )

    const needsAction = displayOrders.filter((order) => (
        ['pending', 'confirmed', 'picking-up', 'at-store', 'ready'].includes(order.status) ||
        (order.status === 'delivering' && order.paymentStatus === 'paid')
    )).length
    const activeWashing = displayOrders.filter((order) => ['washing', 'drying', 'ironing'].includes(order.status)).length
    const readyOrders = displayOrders.filter((order) => order.status === 'ready').length
    const completedOrders = displayOrders.filter((order) => order.status === 'completed').length
    const lowSupplies = supplies.filter((supply) => supply.current <= supply.reorderPoint)
    const maintenanceMachines = machines.filter((machine) => machine.status === 'maintenance')

    const kpis = [
        {
            label: t('shopOverview.ordersInView'),
            value: String(displayOrders.length),
            meta: t('shopOverview.loadedOrders'),
            tone: 'teal',
            Icon: PackageSearch,
        },
        {
            label: t('shopOrders.needsAction'),
            value: String(needsAction),
            meta: t('shopOverview.needsAcceptanceOrCheckin'),
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

    const recentOrders = displayOrders.slice(0, 6)

    const machineStats = [
        {
            label: t('shopOverview.available'),
            value: machines.filter((machine) => machine.status === 'empty').length,
            tone: 'teal',
        },
        {
            label: t('shopOverview.inUse'),
            value: machines.filter((machine) => ['washing', 'drying', 'ironing'].includes(machine.status)).length,
            tone: 'blue',
        },
        {
            label: t('shopOverview.maintenance'),
            value: maintenanceMachines.length,
            tone: 'red',
        },
    ]

    const serviceDemand = useMemo(() => {
        const counts = displayOrders.reduce((result, order) => {
            const name = order.service || t('shopOverview.unavailable')
            result[name] = (result[name] || 0) + 1
            return result
        }, {})
        const entries = Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
        const largest = entries[0]?.count || 1

        return entries.map((item) => ({ ...item, percentage: Math.round((item.count / largest) * 100) }))
    }, [displayOrders, t])

    const visibleSupplies = supplies.slice(0, 5).map((supply) => {
        const hasCapacity = supply.max > 0
        const pct = hasCapacity ? Math.min(100, (supply.current / supply.max) * 100) : 0
        const level = supply.current <= supply.reorderPoint ? 'critical' : pct < 50 ? 'low' : 'ok'
        return { ...supply, hasCapacity, pct, level }
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
            title: t('shopOverview.completedOrders'),
            detail: t('shopOverview.completedOrdersDetail').replace('{count}', completedOrders),
            tone: 'blue',
            Icon: CheckCircle,
        },
    ]

    const dateLabel = new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(today)

    const renderOrdersTable = (orderRows, isModal = false) => (
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
                    {orderRows.length === 0 && (
                        <tr>
                            <td colSpan={isModal ? 7 : 5} className="shop-overview-empty-row">
                                {t('shopOverview.noOrders')}
                            </td>
                        </tr>
                    )}
                    {orderRows.map((order, index) => {
                        const meta = getOrderStatusMeta(order.status)
                        return (
                            <tr key={`${order.id}-${index}`}>
                                <td className="shop-order-id">{order.id || t('shopOverview.unavailable')}</td>
                                <td>{order.customer || t('shopOverview.unavailable')}</td>
                                {isModal && <td>{order.phone || t('shopOverview.unavailable')}</td>}
                                <td>{order.service || t('shopOverview.unavailable')}</td>
                                <td>
                                    <span className={`shop-status-badge tone-${meta.tone}`}>
                                        {meta.label}
                                    </span>
                                </td>
                                <td className="shop-order-time">{order.pickupTime || t('shopOverview.unavailable')}</td>
                                {isModal && (
                                    <td>
                                        <span className={`shop-payment-badge ${order.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
                                            {String(order.paymentStatus || '').toUpperCase() === 'PAID' || String(order.paymentStatus || '').toUpperCase() === 'COMPLETED'
                                                ? t('shopOverview.paid')
                                                : t('shopOverview.pending')}
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
                <div className="shop-overview-header-actions">
                    <div className="shop-overview-date">
                        <CalendarClock size={15} strokeWidth={1.9} />
                        {dateLabel}
                    </div>
                    <button className="shop-overview-refresh" type="button" onClick={loadOverview} disabled={isLoading}>
                        <RefreshCw size={15} strokeWidth={2} className={isLoading ? 'is-spinning' : ''} />
                        {t('shopOverview.refresh')}
                    </button>
                </div>
            </header>

            {loadError && (
                <section className="shop-overview-feedback error" role="alert">
                    <div>
                        <strong>{t('shopOverview.loadFailed')}</strong>
                        <p>{loadError}</p>
                    </div>
                    <button type="button" onClick={loadOverview}>{t('shopOverview.retry')}</button>
                </section>
            )}

            <section className="shop-overview-data-status" aria-live="polite">
                <span className={isLoading ? 'loading-dot' : 'live-dot'} />
                {isLoading ? t('shopOverview.loadingData') : t('shopOverview.dataFromApi')}
            </section>

            <section className="shop-overview-kpis" aria-busy={isLoading}>
                {kpis.map(({ label, value, meta, tone, Icon }) => (
                    <article className={`shop-kpi-card tone-${tone}`} key={label}>
                        <div className="shop-kpi-icon">
                            {createElement(Icon, { size: 19, strokeWidth: 1.9 })}
                        </div>
                        <span>{label}</span>
                        <strong>{isLoading ? '—' : value}</strong>
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
                            <button className="shop-overview-view-all" type="button" onClick={() => setShowAllOrders(true)} disabled={isLoading}>
                                {t('shopOverview.viewAll')}
                            </button>
                        </div>
                        {isLoading ? <div className="shop-overview-table-skeleton" aria-label={t('shopOverview.loadingData')} /> : renderOrdersTable(recentOrders)}
                    </article>

                    <article className="shop-overview-card service-demand-card">
                        <div className="shop-overview-card-header">
                            <div>
                                <span className="shop-card-kicker">{t('shopOverview.orderMix')}</span>
                                <h2>{t('shopOverview.serviceDemand')}</h2>
                            </div>
                            <span className="shop-live-badge">{t('shopOverview.dataFromApi')}</span>
                        </div>
                        {isLoading ? <div className="shop-overview-list-skeleton" /> : (
                            <div className="top-services-list">
                                {serviceDemand.length === 0 && <p className="shop-overview-empty-copy">{t('shopOverview.noOrders')}</p>}
                                {serviceDemand.map((service, index) => (
                                    <div className="top-service-item" key={service.name}>
                                        <span className="top-service-rank">{index + 1}</span>
                                        <div>
                                            <strong>{service.name}</strong>
                                            <p>{service.count} {t('shopOverview.orders')}</p>
                                            <div className="top-service-bar"><span style={{ width: `${service.percentage}%` }} /></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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
                        {isLoading ? <div className="shop-overview-list-skeleton" /> : (
                            <div className="shop-alert-list">
                                {alerts.map(({ title, detail, tone, Icon }) => (
                                    <div className={`shop-alert-item tone-${tone}`} key={title}>
                                        <div className="shop-alert-icon">{createElement(Icon, { size: 16, strokeWidth: 1.9 })}</div>
                                        <div><strong>{title}</strong><p>{detail}</p></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </article>

                    <article className="shop-overview-card machines-card">
                        <div className="shop-overview-card-header">
                            <div>
                                <span className="shop-card-kicker">{t('shopOverview.capacity')}</span>
                                <h2>{t('shopOverview.machineStatus')}</h2>
                            </div>
                            <span className="shop-muted-pill">{machines.length} {t('shopOverview.total')}</span>
                        </div>
                        {isLoading ? <div className="shop-overview-list-skeleton compact" /> : (
                            <div className="machine-status-grid">
                                {machineStats.map((item) => (
                                    <div className={`machine-status-card tone-${item.tone}`} key={item.label}>
                                        <strong>{item.value}</strong><span>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </article>

                    <article className="shop-overview-card supplies-card">
                        <div className="shop-overview-card-header">
                            <div>
                                <span className="shop-card-kicker">{t('shopOverview.inventory')}</span>
                                <h2>{t('shopOverview.supplies')}</h2>
                            </div>
                        </div>
                        {isLoading ? <div className="shop-overview-list-skeleton" /> : (
                            <div className="supply-list">
                                {visibleSupplies.length === 0 && <p className="shop-overview-empty-copy">{t('shopOverview.noSupplies')}</p>}
                                {visibleSupplies.map((supply) => (
                                    <div className="supply-item" key={supply.id}>
                                        <div className="supply-head">
                                            <strong>{supply.name}</strong>
                                            <span className={`supply-amount ${supply.level}`}>
                                                {supply.current}{supply.hasCapacity ? `/${supply.max}` : ''} {supply.unit}
                                            </span>
                                        </div>
                                        {supply.hasCapacity && <div className="supply-track"><span className={supply.level} style={{ width: `${supply.pct}%` }} /></div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </article>
                </aside>
            </section>

            {showAllOrders && (
                <div className="shop-overview-modal-overlay" onClick={() => setShowAllOrders(false)}>
                    <div className="shop-overview-modal" role="dialog" aria-modal="true" aria-label={t('shopOverview.allOrders')} onClick={(event) => event.stopPropagation()}>
                        <div className="shop-overview-modal-header">
                            <div><span className="shop-card-kicker">{t('shopOverview.allOrders')}</span><h2>{t('shopOverview.allOrders')} ({displayOrders.length})</h2></div>
                            <button className="shop-overview-modal-close" type="button" aria-label={t('common.close')} onClick={() => setShowAllOrders(false)}><X size={18} strokeWidth={1.9} /></button>
                        </div>
                        <div className="shop-overview-modal-content">{renderOrdersTable(displayOrders, true)}</div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ShopOverview
