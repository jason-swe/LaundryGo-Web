import { createElement, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
    CheckCircle,
    Clock,
    Droplets,
    Headphones,
    Home,
    MapPin,
    Package,
    PackageCheck,
    Shirt,
    Store,
    Truck,
} from 'lucide-react'
import UserNavbar from '../components/UserNavbar'
import './TrackOrder.css'
import { useTranslation, localizePath } from '../shared/lib/i18n'
import { getMyOrders, getOrderDetail } from '../services/bookingApi'
import { readRecentOrder } from '../utils/recentOrder'

const LIFECYCLE_STEPS = [
    { status: 'PENDING', labelKey: 'track.statusPending', descKey: 'track.statusPendingDesc', Icon: CheckCircle },
    { status: 'CONFIRMED', labelKey: 'track.statusConfirmed', descKey: 'track.statusConfirmedDesc', Icon: Store },
    { status: 'PICKING_UP', labelKey: 'track.statusPickingUp', descKey: 'track.statusPickingUpDesc', Icon: Truck },
    { status: 'AT_STORE', labelKey: 'track.statusLaundrying', descKey: 'track.statusLaundryingDesc', Icon: Droplets },
    { status: 'READY_FOR_PICKUP', labelKey: 'track.statusReadyForPickup', descKey: 'track.statusReadyForPickupDesc', Icon: PackageCheck },
    { status: 'DELIVERING', labelKey: 'track.statusDelivering', descKey: 'track.statusDeliveringDesc', Icon: Truck },
    { status: 'COMPLETED', labelKey: 'track.statusCompleted', descKey: 'track.statusCompletedDesc', Icon: CheckCircle },
]

const CANCELLED_STEP = {
    status: 'CANCELLED',
    labelKey: 'track.statusCancelled',
    descKey: 'track.statusCancelledDesc',
    Icon: Package,
}

const normalizeStatus = (status) => String(status || 'PENDING').trim().toUpperCase().replace(/-/g, '_')

const CUSTOMER_STATUS_BY_BACKEND_STATUS = {
    WASHING: 'AT_STORE',
    DRYING: 'AT_STORE',
    IRONING: 'AT_STORE',
}

const firstDefined = (...values) => values.find((value) => value !== undefined && value !== null && value !== '')

const toNumericOrderId = (value) => {
    const numeric = Number(value)
    return Number.isInteger(numeric) && numeric > 0 ? numeric : null
}

const formatAddressLine = (address) => {
    if (!address) return ''
    if (typeof address === 'string') return address

    return [
        address.addressLine,
        address.ward,
        address.district,
        address.city,
    ].filter(Boolean).join(', ')
}

const getAddressView = (order) => {
    const address = firstDefined(
        order?.deliveryAddress,
        order?.pickupAddress,
        order?.deliveryAddressResponse,
        order?.pickupAddressResponse,
    )
    const line = formatAddressLine(address) || firstDefined(
        order?.deliveryAddressLine,
        order?.pickupAddressLine,
        order?.address,
    )

    return {
        title: firstDefined(address?.receiverName, address?.title, order?.receiverName),
        line,
        phone: firstDefined(address?.phone, order?.receiverPhone),
    }
}

const getDriverView = (order) => {
    const driver = firstDefined(order?.shipper, order?.driver, order?.assignedShipper, order?.assignedDriver)
    const name = typeof driver === 'string' ? driver : firstDefined(driver?.fullName, driver?.name, order?.shipperName, order?.driverName)

    if (!name) return null

    return {
        name,
        meta: firstDefined(driver?.vehicle, driver?.vehicleType, order?.shipperVehicle, order?.driverVehicle, driver?.phone),
        phone: firstDefined(driver?.phone, order?.shipperPhone, order?.driverPhone),
    }
}

const normalizeOrder = (order) => {
    const items = Array.isArray(order?.items) ? order.items : []
    const subtotal = Number(firstDefined(
        order?.subtotal,
        order?.subTotal,
        order?.itemsSubtotal,
        items.reduce((total, item) => total + Number(item.lineTotal || item.totalPrice || item.quantity * item.unitPrice || 0), 0),
    ) || 0)
    const deliveryFee = firstDefined(order?.deliveryFee, order?.shippingFee, order?.serviceFee)
    const totalAmount = Number(firstDefined(order?.totalAmount, order?.total, order?.grandTotal, subtotal) || 0)

    return {
        ...order,
        status: normalizeStatus(order?.status),
        items,
        subtotal,
        deliveryFee: deliveryFee === undefined ? null : Number(deliveryFee || 0),
        totalAmount,
        address: getAddressView(order),
        driver: getDriverView(order),
    }
}

const buildTimeline = (status) => {
    if (status === 'CANCELLED') {
        return {
            steps: [LIFECYCLE_STEPS[0], CANCELLED_STEP],
            currentIndex: 1,
        }
    }

    const customerStatus = CUSTOMER_STATUS_BY_BACKEND_STATUS[status] || status
    const currentIndex = Math.max(0, LIFECYCLE_STEPS.findIndex((step) => step.status === customerStatus))
    return {
        steps: LIFECYCLE_STEPS,
        currentIndex,
    }
}

function TrackOrder() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { state } = useLocation()
    const { language, t } = useTranslation()
    const storedOrder = readRecentOrder()
    const restoredState = state?.orderId ? state : storedOrder?.shopId && String(storedOrder.shopId) === String(id) ? storedOrder : null
    const lookupOrderId = firstDefined(
        restoredState?.orderNumericId,
        toNumericOrderId(restoredState?.orderId),
        restoredState?.order?.orderId,
    )
    const initialOrder = restoredState?.order?.orderId ? normalizeOrder(restoredState.order) : null
    const [ordersPage, setOrdersPage] = useState({ items: [], totalElements: 0, currentPage: 0, totalPages: 0, pageSize: 20 })
    const [isLoadingOrders, setIsLoadingOrders] = useState(true)
    const [ordersError, setOrdersError] = useState('')
    const [selectedOrderId, setSelectedOrderId] = useState(toNumericOrderId(lookupOrderId))
    const [remoteOrder, setRemoteOrder] = useState(initialOrder)
    const [isLoading, setIsLoading] = useState(Boolean(selectedOrderId && !initialOrder))
    const [remoteError, setRemoteError] = useState('')

    useEffect(() => {
        let active = true

        getMyOrders({ page: 0, size: 50 })
            .then((page) => {
                if (!active) return
                const items = Array.isArray(page?.items) ? page.items.map(normalizeOrder) : []
                setOrdersPage({
                    items,
                    totalElements: Number(page?.totalElements ?? items.length),
                    currentPage: Number(page?.currentPage ?? 0),
                    totalPages: Number(page?.totalPages ?? 1),
                    pageSize: Number(page?.pageSize ?? items.length),
                })
                setOrdersError('')

                const preferredOrderId = toNumericOrderId(lookupOrderId)
                const preferredOrder = items.find((item) => item.orderId === preferredOrderId)
                const nextOrder = preferredOrder || items[0]
                if (!selectedOrderId && nextOrder?.orderId) {
                    setSelectedOrderId(nextOrder.orderId)
                    setRemoteOrder(nextOrder)
                }
            })
            .catch((error) => {
                if (active) setOrdersError(error?.message || t('track.ordersLoadFailed'))
            })
            .finally(() => {
                if (active) setIsLoadingOrders(false)
            })

        return () => {
            active = false
        }
    }, [lookupOrderId, selectedOrderId, t])

    useEffect(() => {
        if (!selectedOrderId) return
        let active = true
        getOrderDetail(selectedOrderId)
            .then((order) => {
                if (active) {
                    setRemoteOrder(normalizeOrder(order))
                    setRemoteError('')
                }
            })
            .catch((error) => {
                if (active) setRemoteError(error?.message || t('track.loadFailed'))
            })
            .finally(() => {
                if (active) setIsLoading(false)
            })

        return () => {
            active = false
        }
    }, [selectedOrderId, t])

    const order = remoteOrder
    const hasOrder = Boolean(order?.orderId)
    const timeline = useMemo(() => buildTimeline(order?.status), [order?.status])
    const orderDisplayId = order?.orderCode || order?.orderId
    const pickupDate = order?.pickupDate || t('track.notAvailable')
    const pickupTime = order?.pickupSlotLabel || order?.pickupSlot || t('track.notAvailable')
    const deliveryDate = order?.deliveryDate || t('track.notAvailable')
    const deliveryTime = order?.deliverySlotLabel || order?.deliverySlot || t('track.notAvailable')
    const address = order?.address || {}
    const canShowDriverRoute = Boolean(order?.driver && ['PICKING_UP', 'DELIVERING'].includes(order.status))

    const formatVnd = (value) => Number(value || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    const translatedStatusLabel = order?.status ? t(`track.statusLabel.${order.status}`) : ''
    const statusLabel = translatedStatusLabel.startsWith('track.statusLabel.') ? order.status : translatedStatusLabel
    const operationalStatusNote = ['AT_STORE', 'WASHING', 'DRYING', 'IRONING'].includes(order?.status)
        ? t('track.operationalStatusNote').replace('{status}', statusLabel)
        : ''
    const heroCopy = order?.status === 'COMPLETED'
        ? t('track.completedHero')
        : order?.status === 'CANCELLED'
            ? t('track.cancelledHero')
            : t('track.activeHero')
    const ordersList = ordersPage.items
    const selectedShopId = order?.shopId || id

    if (!hasOrder && (isLoading || isLoadingOrders)) {
        return (
            <div className="track-page">
                <UserNavbar />
                <main className="track-main track-empty-main">
                    <section className="no-order-box">
                        <div className="no-order-icon">
                            <Clock size={30} strokeWidth={1.6} />
                        </div>
                        <span className="track-eyebrow">{t('track.eyebrow')}</span>
                        <h1 className="no-order-title">{t('common.loading')}</h1>
                        <p className="no-order-desc">{t('track.loadingOrder')}</p>
                    </section>
                </main>
            </div>
        )
    }

    if (!hasOrder) {
        return (
            <div className="track-page">
                <UserNavbar />
                <main className="track-main track-empty-main">
                    <section className="no-order-box">
                        <div className="no-order-icon">
                            <Package size={30} strokeWidth={1.6} />
                        </div>
                        <span className="track-eyebrow">{t('track.emptyEyebrow')}</span>
                        <h1 className="no-order-title">{t('track.noOrdersTitle')}</h1>
                        <p className="no-order-desc">{remoteError || ordersError || t('track.noOrdersDesc')}</p>
                        <button
                            className="track-primary-btn"
                            type="button"
                            onClick={() => navigate(localizePath('/all-shops', language))}
                        >
                            {t('track.backToShop')}
                        </button>
                    </section>
                </main>
            </div>
        )
    }

    return (
        <div className="track-page">
            <UserNavbar />

            <main className="track-main">
                <section className="track-hero">
                    <div>
                        <span className="track-eyebrow">{t('track.eyebrow')}</span>
                        <p className="track-order-id">{t('track.orderId')}: {orderDisplayId}</p>
                        <h1 className="track-title">
                            {statusLabel}: <span>{heroCopy}</span>
                        </h1>
                        <p className="track-updated">{isLoading ? t('track.refreshing') : t('track.syncedFromBackend')}</p>
                        {remoteError && <p className="track-updated track-error-text">{remoteError}</p>}
                    </div>
                    <div className="track-hero-stat">
                        <Clock size={19} strokeWidth={1.8} />
                        <span>{t('track.estimatedDelivery')}</span>
                        <strong>{deliveryDate} - {deliveryTime}</strong>
                    </div>
                </section>

                <section className="track-grid">
                    <div className="track-left">
                        <section className="track-card track-orders-card">
                            <div className="track-card-head track-orders-head">
                                <Package size={18} strokeWidth={1.8} />
                                <div>
                                    <h2>{t('track.allOrders')}</h2>
                                    <p>{isLoadingOrders ? t('track.loadingOrders') : t('track.ordersCount').replace('{count}', ordersPage.totalElements)}</p>
                                </div>
                            </div>
                            {ordersError && <p className="track-list-error">{ordersError}</p>}
                            <div className="track-orders-list">
                                {ordersList.map((item) => {
                                    const itemStatusLabel = t(`track.statusLabel.${item.status}`)
                                    const safeStatusLabel = itemStatusLabel.startsWith('track.statusLabel.') ? item.status : itemStatusLabel
                                    return (
                                        <button
                                            className={`track-order-item${item.orderId === order.orderId ? ' is-selected' : ''}`}
                                            type="button"
                                            key={item.orderId}
                                            onClick={() => {
                                                setRemoteOrder(item)
                                                if (item.orderId !== selectedOrderId) {
                                                    setIsLoading(true)
                                                    setSelectedOrderId(item.orderId)
                                                }
                                            }}
                                        >
                                            <span>
                                                <strong>{item.orderCode || item.orderId}</strong>
                                                <small>{item.shopName || t('track.shop')} - {item.pickupDate || t('track.notAvailable')}</small>
                                            </span>
                                            <b>{safeStatusLabel}</b>
                                        </button>
                                    )
                                })}
                            </div>
                        </section>

                        <section className="track-card track-timeline-card">
                            <div className="track-card-head">
                                <PackageCheck size={18} strokeWidth={1.8} />
                                <h2>{t('track.timelineTitle')}</h2>
                            </div>
                            <div className="track-timeline">
                                {timeline.steps.map((step, index) => {
                                    const done = index <= timeline.currentIndex
                                    const active = index === timeline.currentIndex
                                    return (
                                        <div className={`track-timeline-row${done ? ' is-done' : ''}${active ? ' is-active' : ''}`} key={step.status}>
                                            <div className="track-timeline-icon">
                                                {createElement(step.Icon, { size: 17, strokeWidth: 1.8 })}
                                            </div>
                                            <div className="track-timeline-copy">
                                                <h3>{t(step.labelKey)}</h3>
                                                <p>{t(step.descKey)}</p>
                                                {active && step.status === 'AT_STORE' && operationalStatusNote && (
                                                    <p className="track-timeline-note">{operationalStatusNote}</p>
                                                )}
                                            </div>
                                            <time>{active ? t('track.current') : done ? t('track.done') : t('track.pending')}</time>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>

                        {canShowDriverRoute && (
                            <section className="track-card track-map-card">
                                <div className="track-card-head">
                                    <MapPin size={18} strokeWidth={1.8} />
                                    <h2>{t('track.routeTitle')}</h2>
                                </div>
                                <div className="track-map">
                                    <div className="track-map-grid" />
                                    <svg className="track-map-route" viewBox="0 0 640 300" preserveAspectRatio="none">
                                        <path
                                            className="track-route-shadow"
                                            d="M 82 214 C 165 214 160 112 270 112 C 368 112 374 198 514 198"
                                        />
                                        <path
                                            className="track-route-line"
                                            d="M 82 214 C 165 214 160 112 270 112 C 368 112 374 198 514 198"
                                        />
                                    </svg>
                                    <div className="track-map-pin shop">
                                        <Store size={16} strokeWidth={1.9} />
                                        <span>{t('track.shop')}</span>
                                    </div>
                                    <div className="track-map-driver">
                                        <span className="track-map-pulse" />
                                        <Truck size={18} strokeWidth={1.9} />
                                    </div>
                                    <div className="track-map-pin home">
                                        <Home size={16} strokeWidth={1.9} />
                                        <span>{t('track.home')}</span>
                                    </div>
                                    <div className="track-route-chip">
                                        <Clock size={14} strokeWidth={1.8} />
                                        {t('track.liveRoute')}
                                    </div>
                                </div>
                            </section>
                        )}

                        <section className="track-card track-care-card">
                            <div className="fresh-icon">
                                <Droplets size={24} strokeWidth={1.6} />
                            </div>
                            <div>
                                <p className="fresh-title">{t('track.makingThemFresh')}</p>
                                <p className="fresh-desc">{t('track.freshDesc')}</p>
                            </div>
                        </section>
                    </div>

                    <aside className="track-right">
                        <section className="track-card compact-card">
                            <p className="compact-title">{t('confirm.pickupDate')}</p>
                            <p className="compact-value">{pickupDate}</p>
                            <p className="compact-sub">{pickupTime}</p>
                        </section>

                        <section className="track-card compact-card">
                            <p className="compact-title">{t('track.home')}</p>
                            <p className="compact-value small">{address.title || t('track.addressUnavailable')}</p>
                            <p className="compact-sub">{address.line || t('track.addressUnavailableDesc')}</p>
                        </section>

                        <section className="track-card driver-card">
                            <div className="driver-avatar">
                                <Truck size={18} strokeWidth={1.8} />
                            </div>
                            <div>
                                <p className="driver-name">{order.driver?.name || t('track.driverUnassigned')}</p>
                                <p className="driver-meta">{order.driver?.meta || t('track.driverUnassignedMeta')}</p>
                            </div>
                        </section>

                        <section className="track-card summary-card">
                            <div className="track-card-head">
                                <Shirt size={17} strokeWidth={1.8} />
                                <h2>{t('track.orderSummary')}</h2>
                            </div>
                            {order.items.length === 0 ? (
                                <p className="summary-empty">{t('track.emptySummary')}</p>
                            ) : (
                                <div className="summary-lines">
                                    {order.items.map((item) => (
                                        <div className="sum-row" key={item.orderItemId || item.serviceId || item.serviceName}>
                                            <span><b>{item.quantity}x</b> {item.serviceName || t('track.unknownService')}</span>
                                            <span>{formatVnd(Number(item.unitPrice || 0))} VND/{String(item.serviceUnit || item.unit || '').toLowerCase().includes('kg') ? t('shopDetail.unitKg') : t('shopDetail.unitItem')}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="sum-row">
                                <span>{t('track.subtotal')}</span>
                                <span>{formatVnd(order.subtotal)} VND</span>
                            </div>
                            {order.deliveryFee !== null && (
                                <div className="sum-row">
                                    <span>{t('track.delivery')}</span>
                                    <span>{formatVnd(order.deliveryFee)} VND</span>
                                </div>
                            )}
                            <div className="sum-row total">
                                <span>{t('track.total')}</span>
                                <span>{formatVnd(order.totalAmount)} VND</span>
                            </div>
                        </section>

                        <button className="support-btn filled" type="button">
                            <Headphones size={16} strokeWidth={1.8} />
                            {t('track.contactSupport')}
                        </button>
                        <button className="support-btn" type="button" onClick={() => navigate(localizePath(`/all-shops/${selectedShopId}`, language))}>
                            {t('track.viewOrder')}
                        </button>
                    </aside>
                </section>
            </main>
        </div>
    )
}

export default TrackOrder
