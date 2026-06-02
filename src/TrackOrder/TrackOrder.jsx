import { createElement } from 'react'
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

    const hasOrder = Boolean(state?.orderId)
    const orderId = state?.orderId || '#LG-98234'
    const pickupDate = state?.pickupDate || t('confirm.defaultPickupDate')
    const pickupTime = state?.pickupTime || '09:00 AM-11:00 AM'
    const deliveryDate = state?.deliveryDate || t('confirm.defaultDeliveryDate')
    const deliveryTime = state?.deliveryTime || '01:00 PM-03:00 PM'
    const address = state?.address
    const cartEntries = Object.entries(state?.cart || {})
    const subtotal = cartEntries.reduce((total, [, item]) => total + (item.count || 0) * (item.price || 0), 0)
    const deliveryFee = cartEntries.length > 0 ? 15000 : 0
    const total = subtotal + deliveryFee
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
                            {cartEntries.length === 0 ? (
                                <p className="summary-empty">{t('track.emptySummary')}</p>
                            ) : (
                                <div className="summary-lines">
                                    {cartEntries.map(([label, item]) => (
                                        <div className="sum-row" key={label}>
                                            <span><b>{item.count}x</b> {translateServiceCopy(t, label, 'label', label)}</span>
                                            <span>{formatVnd(item.price || 0)} đ/{item.pricingType === 'kg' ? t('shopDetail.unitKg') : t('shopDetail.unitItem')}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="sum-row">
                                <span>{t('track.subtotal')}</span>
                                <span>{formatVnd(subtotal)} đ</span>
                            </div>
                            <div className="sum-row">
                                <span>{t('track.delivery')}</span>
                                <span>{formatVnd(deliveryFee)} đ</span>
                            </div>
                            <div className="sum-row total">
                                <span>{t('track.total')}</span>
                                <span>{formatVnd(total)} đ</span>
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
