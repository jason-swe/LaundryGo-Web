import { createElement, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
    CheckCircle,
    Clock,
    Droplets,
    Headphones,
    Home,
    MapPin,
    MessageCircle,
    Package,
    PackageCheck,
    Phone,
    Shirt,
    Sparkles,
    Store,
    Truck,
} from 'lucide-react'
import UserNavbar from '../components/UserNavbar'
import './TrackOrder.css'
import { useTranslation, localizePath } from '../shared/lib/i18n'
import { translateServiceCopy } from '../shared/lib/i18n/serviceCopy'
import { getOrderDetail } from '../services/bookingApi'
import { readRecentOrder } from '../utils/recentOrder'

const STEPS = [
    { labelKey: 'track.placedOrder', descKey: 'track.placedOrderDesc', Icon: CheckCircle, time: '08:40' },
    { labelKey: 'track.pickedUp', descKey: 'track.pickedUpDesc', Icon: Truck, time: '09:10' },
    { labelKey: 'track.inWash', descKey: 'track.inWashDesc', Icon: Droplets, time: '10:05' },
    { labelKey: 'track.ready', descKey: 'track.readyDesc', Icon: Sparkles, time: '12:30' },
    { labelKey: 'track.delivery', descKey: 'track.deliveryDesc', Icon: PackageCheck, time: '13:00' },
]

function TrackOrder() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { state } = useLocation()
    const { language, t } = useTranslation()
    const storedOrder = readRecentOrder()
    const restoredState = state?.orderId ? state : storedOrder?.shopId && String(storedOrder.shopId) === String(id) ? storedOrder : null
    const [remoteOrder, setRemoteOrder] = useState(restoredState?.order || null)
    const [remoteError, setRemoteError] = useState('')

    const lookupOrderId = restoredState?.orderNumericId ||
        (Number.isInteger(Number(restoredState?.orderId)) ? Number(restoredState.orderId) : null)

    useEffect(() => {
        if (!lookupOrderId) return
        let active = true
        getOrderDetail(lookupOrderId)
            .then((order) => {
                if (active) setRemoteOrder(order)
            })
            .catch((error) => {
                if (active) setRemoteError(error?.message || 'track_load_failed')
            })
        return () => {
            active = false
        }
    }, [lookupOrderId])

    const order = remoteOrder
    const hasOrder = Boolean(restoredState?.orderId || order?.orderId)
    const orderId = order?.orderCode || order?.orderId || restoredState?.orderId || '#LG-98234'
    const pickupDate = order?.pickupDate || restoredState?.pickupDate || t('confirm.defaultPickupDate')
    const pickupTime = order?.pickupSlotLabel || restoredState?.pickupTime || '09:00 AM-11:00 AM'
    const deliveryDate = order?.deliveryDate || restoredState?.deliveryDate || t('confirm.defaultDeliveryDate')
    const deliveryTime = order?.deliverySlotLabel || restoredState?.deliveryTime || '01:00 PM-03:00 PM'
    const address = restoredState?.address
    const cartEntries = Object.entries(restoredState?.cart || {})
    const orderItems = order?.items || restoredState?.summary?.items || []
    const subtotal = Number(order?.subtotal || restoredState?.summary?.subtotal || 0) ||
        cartEntries.reduce((total, [, item]) => total + (item.count || 0) * (item.price || 0), 0)
    const deliveryFee = cartEntries.length > 0 ? 15000 : 0
    const total = Number(order?.totalAmount || 0) || subtotal + deliveryFee
    const currentStep = 2

    const formatVnd = (value) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

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
                        <p className="no-order-desc">{t('track.noOrdersDesc')}</p>
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
                        <p className="track-order-id">{t('track.orderId')}: {orderId}</p>
                        <h1 className="track-title">
                            {t('track.inProgress')}: <span>{t('track.washingYourClothes')}</span>
                        </h1>
                        <p className="track-updated">{t('track.lastUpdated')}: {t('track.justNow')}</p>
                        {remoteError && <p className="track-updated">{remoteError}</p>}
                    </div>
                    <div className="track-hero-stat">
                        <Clock size={19} strokeWidth={1.8} />
                        <span>{t('track.estimatedDelivery')}</span>
                        <strong>{deliveryDate} · {deliveryTime}</strong>
                    </div>
                </section>

                <section className="track-grid">
                    <div className="track-left">
                        <section className="track-card track-timeline-card">
                            <div className="track-card-head">
                                <PackageCheck size={18} strokeWidth={1.8} />
                                <h2>{t('track.timelineTitle')}</h2>
                            </div>
                            <div className="track-timeline">
                                {STEPS.map((step, index) => {
                                    const done = index <= currentStep
                                    const active = index === currentStep
                                    return (
                                        <div className={`track-timeline-row${done ? ' is-done' : ''}${active ? ' is-active' : ''}`} key={step.labelKey}>
                                            <div className="track-timeline-icon">
                                                {createElement(step.Icon, { size: 17, strokeWidth: 1.8 })}
                                            </div>
                                            <div className="track-timeline-copy">
                                                <h3>{t(step.labelKey)}</h3>
                                                <p>{t(step.descKey)}</p>
                                            </div>
                                            <time>{step.time}</time>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>

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
                                    {t('track.routeEta')}
                                </div>
                            </div>
                        </section>

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
                            <p className="compact-value small">{address?.title || t('confirm.addressFallback')}</p>
                            <p className="compact-sub">{address?.line || t('track.addressFallback')}</p>
                        </section>

                        <section className="track-card driver-card">
                            <div className="driver-avatar">
                                <Truck size={18} strokeWidth={1.8} />
                            </div>
                            <div>
                                <p className="driver-name">{t('track.driverName')}</p>
                                <p className="driver-meta">{t('track.driverVehicle')}</p>
                            </div>
                            <div className="driver-actions">
                                <button type="button" aria-label={t('track.messageDriver')}>
                                    <MessageCircle size={15} strokeWidth={1.8} />
                                </button>
                                <button type="button" aria-label={t('track.callDriver')}>
                                    <Phone size={15} strokeWidth={1.8} />
                                </button>
                            </div>
                        </section>

                        <section className="track-card summary-card">
                            <div className="track-card-head">
                                <Shirt size={17} strokeWidth={1.8} />
                                <h2>{t('track.orderSummary')}</h2>
                            </div>
                            {cartEntries.length === 0 && orderItems.length === 0 ? (
                                <p className="summary-empty">{t('track.emptySummary')}</p>
                            ) : (
                                <div className="summary-lines">
                                    {orderItems.length > 0 ? orderItems.map((item) => (
                                        <div className="sum-row" key={item.orderItemId || item.serviceId}>
                                            <span><b>{item.quantity}x</b> {item.serviceName}</span>
                                            <span>{formatVnd(Number(item.unitPrice || 0))} VND/{String(item.serviceUnit || '').toLowerCase().includes('kg') ? t('shopDetail.unitKg') : t('shopDetail.unitItem')}</span>
                                        </div>
                                    )) : cartEntries.map(([label, item]) => (
                                        <div className="sum-row" key={label}>
                                            <span><b>{item.count}x</b> {translateServiceCopy(t, label, 'label', label)}</span>
                                            <span>{formatVnd(item.price || 0)} VND/{item.pricingType === 'kg' ? t('shopDetail.unitKg') : t('shopDetail.unitItem')}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="sum-row">
                                <span>{t('track.subtotal')}</span>
                                <span>{formatVnd(subtotal)} VND</span>
                            </div>
                            <div className="sum-row">
                                <span>{t('track.delivery')}</span>
                                <span>{formatVnd(deliveryFee)} VND</span>
                            </div>
                            <div className="sum-row total">
                                <span>{t('track.total')}</span>
                                <span>{formatVnd(total)} VND</span>
                            </div>
                        </section>

                        <button className="support-btn filled" type="button">
                            <Headphones size={16} strokeWidth={1.8} />
                            {t('track.contactSupport')}
                        </button>
                        <button className="support-btn" type="button" onClick={() => navigate(localizePath(`/all-shops/${id}`, language))}>
                            {t('track.viewOrder')}
                        </button>
                    </aside>
                </section>
            </main>
        </div>
    )
}

export default TrackOrder
