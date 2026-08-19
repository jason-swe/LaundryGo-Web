import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
    ArrowRight,
    Calendar,
    CheckCircle,
    Clock,
    CreditCard,
    Home,
    MapPin,
    PackageCheck,
    RotateCcw,
    Shirt,
    Sparkles,
} from 'lucide-react'
import UserNavbar from '../components/UserNavbar'
import './ConfirmOrder.css'
import { useTranslation, localizePath } from '../shared/lib/i18n'
import { translateServiceCopy } from '../shared/lib/i18n/serviceCopy'
import { saveRecentOrder } from '../utils/recentOrder'

function ConfirmOrder() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { state } = useLocation()
    const { language, t } = useTranslation()

    const order = state?.order
    const pickupDate = order?.pickupDate || state?.pickupDate || t('confirm.defaultPickupDate')
    const pickupTime = order?.pickupSlotLabel || state?.pickupTime || '09:00 AM-11:00 AM'
    const deliveryDate = order?.deliveryDate || state?.deliveryDate || t('confirm.defaultDeliveryDate')
    const deliveryTime = order?.deliverySlotLabel || state?.deliveryTime || '01:00 PM-03:00 PM'
    const address = state?.address
    const addressType = state?.addressType || address?.type || 'HOME'
    const paymentMethod = order?.paymentMethod || state?.paymentMethod || 'BANK_TRANSFER'
    const paymentMethodLabel = state?.payment?.paymentMethodLabel || state?.paymentMethodLabel || order?.paymentMethodLabel
    const orderId = order?.orderCode || order?.orderId || state?.orderId || null
    const orderDisplayId = orderId || t('track.notAvailable')
    const orderNumericId = order?.orderId || state?.orderNumericId
    const cartEntries = Object.entries(state?.cart || {})
    const orderItems = order?.items || state?.summary?.items || []
    const subtotal = Number(order?.subtotal || state?.summary?.subtotal || 0) ||
        cartEntries.reduce((total, [, item]) => total + (item.count || 0) * (item.price || 0), 0)
    const voucher = state?.voucher
    const voucherCode = state?.voucherCode || voucher?.code || null
    const voucherDiscount = Number(voucher?.discountAmount)
    const voucherEstimatedTotal = Number(voucher?.finalAmount)
    const hasVoucherEstimate = Boolean(
        voucherCode &&
        voucher?.valid &&
        Number.isFinite(voucherDiscount) &&
        Number.isFinite(voucherEstimatedTotal),
    )

    const formatVnd = (value) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

    const paymentLabels = {
        card: t('schedule.card'),
        wallet: t('schedule.wallet'),
        cash: t('schedule.cash'),
        CREDIT_CARD: t('schedule.card'),
        DEBIT_CARD: t('schedule.card'),
        E_WALLET: t('schedule.wallet'),
        BANK_TRANSFER: t('schedule.bankTransfer'),
        CASH: t('schedule.cash'),
    }

    const trackingState = useMemo(() => ({
                orderId,
                pickupDate,
                pickupTime,
                deliveryDate,
                deliveryTime,
                addressType,
                address,
                paymentMethod,
                paymentMethodLabel,
                orderNumericId,
                order,
                cart: state?.cart || null,
                summary: state?.summary || null,
                voucherCode,
                voucher: hasVoucherEstimate ? voucher : null,
                shopId: id,
            }), [address, addressType, deliveryDate, deliveryTime, hasVoucherEstimate, id, order, orderId, orderNumericId, paymentMethod, paymentMethodLabel, pickupDate, pickupTime, state?.cart, state?.summary, voucher, voucherCode])

    useEffect(() => {
        saveRecentOrder(trackingState)
    }, [trackingState])

    const trackOrder = () => {
        navigate(localizePath(`/all-shops/${id}/track`, language), {
            state: trackingState,
        })
    }

    return (
        <div className="confirm-page">
            <UserNavbar />

            <main className="confirm-main">
                <section className="confirm-hero">
                    <div className="confirm-success-wrap">
                        <div className="confirm-success-ring" />
                        <div className="confirm-success-icon">
                            <CheckCircle size={46} strokeWidth={1.8} />
                        </div>
                    </div>

                    <span className="confirm-eyebrow">{t('confirm.eyebrow')}</span>
                    <h1 className="confirm-title">{t('confirm.successTitle')}</h1>
                    <p className="confirm-subtitle">{t('confirm.successSubtitle')}</p>

                    <div className="confirm-order-badge">
                        <span className="confirm-badge-label">{t('confirm.orderId')}</span>
                        <span className="confirm-badge-value">{orderDisplayId}</span>
                    </div>

                    <div className="confirm-actions hero-actions">
                        <button className="confirm-btn-primary" type="button" onClick={trackOrder}>
                            {t('confirm.trackOrder')}
                            <ArrowRight size={16} strokeWidth={1.9} />
                        </button>
                        <button className="outline-btn" type="button" onClick={() => navigate(localizePath('/all-shops', language))}>
                            <RotateCcw size={16} strokeWidth={1.9} />
                            {t('confirm.bookAnother')}
                        </button>
                    </div>
                </section>

                <section className="confirm-grid">
                    <div className="confirm-card confirm-detail-card">
                        <div className="confirm-card-head">
                            <PackageCheck size={18} strokeWidth={1.8} />
                            <h2>{t('confirm.orderDetails')}</h2>
                        </div>

                        <div className="confirm-details">
                            <div className="confirm-detail-item">
                                <Calendar size={17} className="confirm-detail-icon" />
                                <div>
                                    <p className="confirm-detail-label">{t('confirm.pickupDate')}</p>
                                    <p className="confirm-detail-value">{pickupDate}</p>
                                    <span>{pickupTime}</span>
                                </div>
                            </div>
                            <div className="confirm-detail-item">
                                <Clock size={17} className="confirm-detail-icon" />
                                <div>
                                    <p className="confirm-detail-label">{t('confirm.deliveryDate')}</p>
                                    <p className="confirm-detail-value">{deliveryDate}</p>
                                    <span>{deliveryTime}</span>
                                </div>
                            </div>
                            <div className="confirm-detail-item">
                                <MapPin size={17} className="confirm-detail-icon" />
                                <div>
                                    <p className="confirm-detail-label">{t('confirm.address')}</p>
                                    <p className="confirm-detail-value">{address?.title || addressType}</p>
                                    <span>{address?.line || t('confirm.addressFallback')}</span>
                                </div>
                            </div>
                            <div className="confirm-detail-item">
                                <CreditCard size={17} className="confirm-detail-icon" />
                                <div>
                                    <p className="confirm-detail-label">{t('confirm.paymentMethod')}</p>
                                    <p className="confirm-detail-value">{paymentMethodLabel || paymentLabels[paymentMethod] || paymentMethod}</p>
                                    <span>{t('confirm.paymentNote')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <aside className="confirm-card confirm-summary-card">
                        <div className="confirm-card-head">
                            <Shirt size={18} strokeWidth={1.8} />
                            <h2>{t('track.orderSummary')}</h2>
                        </div>

                        {cartEntries.length === 0 && orderItems.length === 0 ? (
                            <div className="confirm-empty-summary">
                                <Shirt size={28} strokeWidth={1.4} />
                                <p>{t('confirm.emptySummary')}</p>
                            </div>
                        ) : (
                            <div className="confirm-summary-lines">
                                {orderItems.length > 0 ? orderItems.map((item) => (
                                    <div key={item.orderItemId || item.serviceId} className="confirm-summary-line">
                                        <span><b>{item.quantity}x</b> {item.serviceName}</span>
                                        <span>{formatVnd(Number(item.unitPrice || 0))} VND/{String(item.serviceUnit || '').toLowerCase().includes('kg') ? t('shopDetail.unitKg') : t('shopDetail.unitItem')}</span>
                                    </div>
                                )) : cartEntries.map(([label, item]) => (
                                    <div key={label} className="confirm-summary-line">
                                        <span><b>{item.count}x</b> {translateServiceCopy(t, label, 'label', label)}</span>
                                        <span>{formatVnd(item.price || 0)} VND/{item.pricingType === 'kg' ? t('shopDetail.unitKg') : t('shopDetail.unitItem')}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className={`confirm-summary-total ${hasVoucherEstimate ? 'with-voucher' : ''}`}>
                            <span>{t('track.subtotal')}</span>
                            <span>{formatVnd(subtotal)} VND</span>
                        </div>
                        {hasVoucherEstimate && (
                            <>
                                <div className="confirm-summary-discount">
                                    <span>{t('schedule.voucherDiscount')} ({voucherCode})</span>
                                    <span>-{formatVnd(voucherDiscount)} VND</span>
                                </div>
                                <div className="confirm-summary-total voucher-total">
                                    <span>{t('schedule.estimatedTotal')}</span>
                                    <span>{formatVnd(voucherEstimatedTotal)} VND</span>
                                </div>
                            </>
                        )}
                        <p className="confirm-price-note">
                            {hasVoucherEstimate ? t('schedule.voucherEstimateNote') : t('shopDetail.priceNote')}
                        </p>
                    </aside>
                </section>

                <section className="confirm-next-card">
                    <div className="confirm-card-head">
                        <Sparkles size={18} strokeWidth={1.8} />
                        <h2>{t('confirm.nextSteps')}</h2>
                    </div>
                    <div className="confirm-next-steps">
                        <div>
                            <span>1</span>
                            <p>{t('confirm.nextStepOne')}</p>
                        </div>
                        <div>
                            <span>2</span>
                            <p>{t('confirm.nextStepTwo')}</p>
                        </div>
                        <div>
                            <span>3</span>
                            <p>{t('confirm.nextStepThree')}</p>
                        </div>
                    </div>
                    <button className="confirm-home-link" type="button" onClick={() => navigate(localizePath('/', language))}>
                        <Home size={15} strokeWidth={1.8} />
                        {t('confirm.home')}
                    </button>
                </section>
            </main>
        </div>
    )
}

export default ConfirmOrder
