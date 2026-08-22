import { createElement, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
    CheckCircle,
    ClipboardCheck,
    Clock,
    CreditCard,
    Droplets,
    Headphones,
    Home,
    ImageUp,
    Landmark,
    MapPin,
    Package,
    PackageCheck,
    PhoneCall,
    QrCode,
    RefreshCw,
    Send,
    Shirt,
    Star,
    Store,
    Truck,
    XCircle,
} from 'lucide-react'
import UserNavbar from '../components/UserNavbar'
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog'
import './TrackOrder.css'
import { useTranslation, localizePath } from '../shared/lib/i18n'
import {
    approveOrderInspection,
    cancelOrder,
    getMyOrders,
    getOrderDetail,
    getOrderInspection,
    rejectOrderInspection,
} from '../services/bookingApi'
import { getOrderRating, submitRating } from '../services/ratingApi'
import {
    createBankTransferPayment,
    getPaymentByOrderId,
    reportPaymentPaid,
} from '../services/paymentApi'
import { clearRecentOrder, readRecentOrder } from '../utils/recentOrder'

const LIFECYCLE_STEPS = [
    { status: 'PENDING', labelKey: 'track.statusPending', descKey: 'track.statusPendingDesc', Icon: CheckCircle },
    { status: 'CONFIRMED', labelKey: 'track.statusConfirmed', descKey: 'track.statusConfirmedDesc', Icon: Store },
    { status: 'PICKING_UP', labelKey: 'track.statusPickingUp', descKey: 'track.statusPickingUpDesc', Icon: Truck },
    { status: 'AT_STORE', labelKey: 'track.statusAtStore', descKey: 'track.statusAtStoreDesc', Icon: PackageCheck },
    { status: 'WASHING', labelKey: 'track.statusWashing', descKey: 'track.statusWashingDesc', Icon: Droplets },
    { status: 'DRYING', labelKey: 'track.statusDrying', descKey: 'track.statusDryingDesc', Icon: Droplets },
    { status: 'IRONING', labelKey: 'track.statusIroning', descKey: 'track.statusIroningDesc', Icon: Shirt },
    { status: 'READY_FOR_DELIVERY', labelKey: 'track.statusReadyForPickup', descKey: 'track.statusReadyForPickupDesc', Icon: PackageCheck },
    { status: 'DELIVERING', labelKey: 'track.statusDelivering', descKey: 'track.statusDeliveringDesc', Icon: Truck },
    { status: 'COMPLETED', labelKey: 'track.statusCompleted', descKey: 'track.statusCompletedDesc', Icon: CheckCircle },
]

const CUSTOMER_CONFIRMATION_STEP = {
    status: 'WAITING_CUSTOMER_CONFIRMATION',
    labelKey: 'track.statusWaitingCustomerConfirmation',
    descKey: 'track.statusWaitingCustomerConfirmationDesc',
    Icon: ClipboardCheck,
}

const CANCELLED_STEP = {
    status: 'CANCELLED',
    labelKey: 'track.statusCancelled',
    descKey: 'track.statusCancelledDesc',
    Icon: Package,
}

const normalizeStatus = (status) => String(status || 'PENDING').trim().toUpperCase().replace(/-/g, '_')

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
    const normalizedStatus = normalizeStatus(order?.status)
    const currentTaskDriver = ['READY_FOR_DELIVERY', 'DELIVERING', 'COMPLETED'].includes(normalizedStatus)
        ? firstDefined(order?.deliveryDriver, order?.pickupDriver)
        : firstDefined(order?.pickupDriver, order?.deliveryDriver)
    const driver = firstDefined(currentTaskDriver, order?.shipper, order?.driver, order?.assignedShipper, order?.assignedDriver)
    const name = typeof driver === 'string' ? driver : firstDefined(driver?.fullName, driver?.name, order?.shipperName, order?.driverName)

    if (!name) return null

    return {
        name,
        vehicleType: firstDefined(driver?.vehicleType, driver?.vehicle, order?.shipperVehicle, order?.driverVehicle),
        licensePlate: firstDefined(driver?.licensePlate, driver?.plateNumber, order?.shipperLicensePlate, order?.driverLicensePlate),
        phone: firstDefined(driver?.phone, order?.shipperPhone, order?.driverPhone),
    }
}

const normalizeOrder = (order) => {
    const items = Array.isArray(order?.items) ? order.items : []
    const orderId = toNumericOrderId(firstDefined(order?.orderId, order?.id))
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
        orderId: orderId || order?.orderId || order?.id,
        status: normalizeStatus(order?.status),
        items,
        subtotal,
        deliveryFee: deliveryFee === undefined ? null : Number(deliveryFee || 0),
        totalAmount,
        address: getAddressView(order),
        driver: getDriverView(order),
    }
}

const getPaymentMethodId = (method) => String(method?.code || method?.paymentMethod || method?.id || method || '').toUpperCase()

const getPaymentMethodLabel = (method, t) => {
    const id = getPaymentMethodId(method)
    const label = method?.displayName || method?.label || method?.name
    if (label) return label
    const translated = t(`track.paymentMethodLabel.${id}`)
    return translated.startsWith('track.paymentMethodLabel.') ? id : translated
}

const isNotFoundError = (error) => {
    const message = String(error?.message || '').toLowerCase()
    return error?.status === 404 || message.includes('not found')
}

const buildTimeline = (status) => {
    if (['CANCELLED', 'CANCELLED_AFTER_WEIGHT_CONFIRMATION'].includes(status)) {
        const cancellationSteps = status === 'CANCELLED_AFTER_WEIGHT_CONFIRMATION'
            ? [...LIFECYCLE_STEPS.slice(0, 4), CANCELLED_STEP]
            : [LIFECYCLE_STEPS[0], CANCELLED_STEP]
        return {
            steps: cancellationSteps,
            currentIndex: cancellationSteps.length - 1,
        }
    }

    const steps = status === 'WAITING_CUSTOMER_CONFIRMATION'
        ? [...LIFECYCLE_STEPS.slice(0, 4), CUSTOMER_CONFIRMATION_STEP, ...LIFECYCLE_STEPS.slice(4)]
        : LIFECYCLE_STEPS
    const currentIndex = Math.max(0, steps.findIndex((step) => step.status === status))
    return {
        steps,
        currentIndex,
    }
}

function RatingEditor({ label, score, comment, onScoreChange, onCommentChange }) {
    return (
        <div className="order-rating-editor">
            <strong>{label}</strong>
            <div className="order-rating-stars" aria-label={`${label} score`}>
                {[1, 2, 3, 4, 5].map((value) => (
                    <button
                        key={value}
                        type="button"
                        className={value <= score ? 'is-selected' : ''}
                        onClick={() => onScoreChange(value)}
                        aria-label={`${value} star${value === 1 ? '' : 's'}`}
                    >
                        <Star size={20} fill="currentColor" />
                    </button>
                ))}
            </div>
            <textarea
                rows="3"
                maxLength="1000"
                value={comment}
                onChange={(event) => onCommentChange(event.target.value)}
                placeholder="Share optional feedback"
            />
        </div>
    )
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
    const [orderReloadKey, setOrderReloadKey] = useState(0)
    const [lastUpdatedAt, setLastUpdatedAt] = useState(null)
    const [paymentReceipt, setPaymentReceipt] = useState(restoredState?.payment || null)
    const [isPaymentLoading, setIsPaymentLoading] = useState(Boolean(selectedOrderId))
    const [isPaymentActionLoading, setIsPaymentActionLoading] = useState(false)
    const [paymentActionMessage, setPaymentActionMessage] = useState('')
    const [paymentEvidenceFile, setPaymentEvidenceFile] = useState(null)
    const [paymentReportNote, setPaymentReportNote] = useState('')
    const [paymentTransactionReference, setPaymentTransactionReference] = useState('')
    const [inspection, setInspection] = useState(null)
    const [inspectionError, setInspectionError] = useState('')
    const [inspectionActionMessage, setInspectionActionMessage] = useState('')
    const [isInspectionLoading, setIsInspectionLoading] = useState(false)
    const [inspectionAction, setInspectionAction] = useState('')
    const [inspectionReloadKey, setInspectionReloadKey] = useState(0)
    const [ratingState, setRatingState] = useState(null)
    const [isRatingLoading, setIsRatingLoading] = useState(false)
    const [isRatingSubmitting, setIsRatingSubmitting] = useState(false)
    const [ratingError, setRatingError] = useState('')
    const [ratingMessage, setRatingMessage] = useState('')
    const [ratingForm, setRatingForm] = useState({ shopScore: 0, shopComment: '', shipperScore: 0, shipperComment: '' })
    const [isCancelLoading, setIsCancelLoading] = useState(false)
    const [confirmDialog, setConfirmDialog] = useState(null)
    const bankTransferRequestRef = useRef({ orderId: null, key: '' })

    useEffect(() => {
        let active = true

        setIsLoadingOrders(true)
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

                if (items.length === 0) {
                    clearRecentOrder()
                    setSelectedOrderId(null)
                    setRemoteOrder(null)
                    setRemoteError('')
                    return
                }

                const preferredOrderId = toNumericOrderId(lookupOrderId)
                setSelectedOrderId((currentOrderId) => {
                    const preferredOrder = items.find((item) => item.orderId === preferredOrderId)
                    const currentOrder = items.find((item) => item.orderId === currentOrderId)
                    const nextOrder = preferredOrder || currentOrder || items[0]

                    if (!nextOrder?.orderId) return currentOrderId

                    setRemoteOrder((currentOrderState) => (
                        currentOrderState?.orderId === nextOrder.orderId ? currentOrderState : nextOrder
                    ))
                    return nextOrder.orderId
                })
            })
            .catch(() => {
                if (active) setOrdersError(t('track.ordersLoadFailedSoft'))
            })
            .finally(() => {
                if (active) setIsLoadingOrders(false)
            })

        return () => {
            active = false
        }
    }, [lookupOrderId, orderReloadKey, t])

    useEffect(() => {
        if (!selectedOrderId) return
        let active = true
        setIsLoading(true)
        getOrderDetail(selectedOrderId)
            .then((order) => {
                if (active) {
                    setRemoteOrder(normalizeOrder(order))
                    setRemoteError('')
                    setLastUpdatedAt(new Date())
                }
            })
            .catch((error) => {
                if (!active) return
                if (isNotFoundError(error)) {
                    clearRecentOrder()
                    setSelectedOrderId(null)
                    setRemoteOrder(null)
                    setRemoteError('')
                    return
                }
                setRemoteError(error?.message || t('track.loadFailed'))
            })
            .finally(() => {
                if (active) setIsLoading(false)
            })

        return () => {
            active = false
        }
    }, [orderReloadKey, selectedOrderId, t])

    useEffect(() => {
        if (!selectedOrderId || ['COMPLETED', 'CANCELLED', 'CANCELLED_AFTER_WEIGHT_CONFIRMATION'].includes(remoteOrder?.status)) {
            return undefined
        }

        const timer = window.setInterval(() => {
            setOrderReloadKey((value) => value + 1)
        }, 15000)

        return () => window.clearInterval(timer)
    }, [remoteOrder?.status, selectedOrderId])

    useEffect(() => {
        if (!selectedOrderId) {
            setPaymentReceipt(null)
            setIsPaymentLoading(false)
            return undefined
        }

        let active = true
        setIsPaymentLoading(true)
        getPaymentByOrderId(selectedOrderId)
            .then((payment) => {
                if (!active) return
                setPaymentReceipt(payment)
                setPaymentActionMessage('')
            })
            .catch((error) => {
                if (!active) return
                setPaymentReceipt(null)
                const method = getPaymentMethodId(remoteOrder?.paymentMethod)
                setPaymentActionMessage(
                    method === 'BANK_TRANSFER' && isNotFoundError(error)
                        ? t('track.bankPaymentNotCreated')
                        : method === 'CASH' && isNotFoundError(error)
                            ? t('track.cashPaymentPendingCollection')
                            : t('track.paymentLoadFailedSoft'),
                )
            })
            .finally(() => {
                if (active) setIsPaymentLoading(false)
            })

        return () => {
            active = false
        }
    }, [orderReloadKey, remoteOrder?.paymentMethod, selectedOrderId, t])

    useEffect(() => {
        setPaymentEvidenceFile(null)
        setPaymentReportNote('')
        setPaymentTransactionReference('')
    }, [selectedOrderId])

    useEffect(() => {
        if (!selectedOrderId || remoteOrder?.status !== 'WAITING_CUSTOMER_CONFIRMATION') {
            setInspection(null)
            setInspectionError('')
            setInspectionActionMessage('')
            setIsInspectionLoading(false)
            return
        }

        let active = true
        setIsInspectionLoading(true)
        setInspectionError('')
        setInspectionActionMessage('')
        getOrderInspection(selectedOrderId)
            .then((result) => {
                if (active) setInspection(result)
            })
            .catch((error) => {
                if (!active) return
                setInspection(null)
                setInspectionError(error?.message || t('track.inspectionLoadFailed'))
            })
            .finally(() => {
                if (active) setIsInspectionLoading(false)
            })

        return () => {
            active = false
        }
    }, [inspectionReloadKey, remoteOrder?.status, selectedOrderId, t])

    useEffect(() => {
        if (!selectedOrderId || remoteOrder?.status !== 'COMPLETED') {
            setRatingState(null)
            setRatingError('')
            setRatingMessage('')
            setIsRatingLoading(false)
            return undefined
        }

        let active = true
        setIsRatingLoading(true)
        setRatingError('')
        setRatingMessage('')
        setRatingForm({ shopScore: 0, shopComment: '', shipperScore: 0, shipperComment: '' })
        getOrderRating(selectedOrderId)
            .then((data) => {
                if (active) setRatingState(data)
            })
            .catch((error) => {
                if (active) {
                    setRatingState(null)
                    setRatingError(error?.message || 'Could not load rating status')
                }
            })
            .finally(() => {
                if (active) setIsRatingLoading(false)
            })

        return () => {
            active = false
        }
    }, [orderReloadKey, remoteOrder?.status, selectedOrderId])

    const order = remoteOrder
    const hasOrder = Boolean(order?.orderId)
    const timeline = useMemo(() => buildTimeline(order?.status), [order?.status])
    const orderDisplayId = order?.orderCode || order?.orderId
    const pickupDate = order?.pickupDate || t('track.notAvailable')
    const pickupTime = order?.pickupSlotLabel || order?.pickupSlot || t('track.notAvailable')
    const deliveryDate = order?.deliveryDate || t('track.notAvailable')
    const deliveryTime = order?.deliverySlotLabel || order?.deliverySlot || t('track.notAvailable')
    const address = order?.address || {}
    const driver = order?.driver
    const canShowDriver = Boolean(driver?.name) && !['CANCELLED', 'CANCELLED_AFTER_WEIGHT_CONFIRMATION'].includes(order?.status)
    const canShowDriverRoute = false

    const formatVnd = (value) => Number(value || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    const formatDateTime = (value) => {
        if (!value) return t('track.notAvailable')
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return value
        return new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(date)
    }
    const translatedStatusLabel = order?.status ? t(`track.statusLabel.${order.status}`) : ''
    const statusLabel = translatedStatusLabel.startsWith('track.statusLabel.') ? order?.status : translatedStatusLabel
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
    const paymentStatus = String(paymentReceipt?.status || order?.paymentStatus || '').toUpperCase()
    const currentPaymentMethod = getPaymentMethodId(paymentReceipt?.paymentMethod || order?.paymentMethod)
    const translatedPaymentStatus = paymentStatus ? t(`track.paymentStatusLabel.${paymentStatus}`) : ''
    const paymentStatusLabel = paymentStatus
        ? (translatedPaymentStatus.startsWith('track.paymentStatusLabel.')
            ? paymentReceipt?.statusLabel || paymentStatus
            : translatedPaymentStatus)
        : t('track.notAvailable')
    const payableOrder = order?.status === 'DELIVERING'
    const bankTransferDetails = paymentReceipt?.bankTransferDetails || null
    const canCreateBankTransfer = hasOrder &&
        payableOrder &&
        currentPaymentMethod === 'BANK_TRANSFER' &&
        !['CUSTOMER_REPORTED_PAID', 'SHOP_CONFIRMED', 'COMPLETED', 'REFUNDED'].includes(paymentStatus) &&
        (!bankTransferDetails || ['EXPIRED', 'FAILED', 'CANCELLED', 'SHOP_REJECTED'].includes(paymentStatus))
    const canReportPaymentPaid = currentPaymentMethod === 'BANK_TRANSFER' &&
        Boolean(paymentReceipt?.paymentId) &&
        ['PENDING', 'SHOP_REJECTED'].includes(paymentStatus)
    const canCancelOrder = hasOrder && ['PENDING', 'CONFIRMED'].includes(order?.status)
    const canRateShop = Boolean(ratingState && !ratingState.shopRated)
    const canRateShipper = Boolean(ratingState?.shipperRatingAvailable && !ratingState.shipperRated)

    const refreshRating = async () => {
        if (!selectedOrderId) return null
        const freshRating = await getOrderRating(selectedOrderId)
        setRatingState(freshRating)
        return freshRating
    }

    const submitOrderRating = async () => {
        if (!selectedOrderId || isRatingSubmitting) return
        const shopScore = canRateShop ? ratingForm.shopScore : null
        const shipperScore = canRateShipper ? ratingForm.shipperScore : null

        if (!shopScore && !shipperScore) {
            setRatingError('Choose a score before submitting your rating.')
            return
        }

        setIsRatingSubmitting(true)
        setRatingError('')
        setRatingMessage('')
        try {
            await submitRating({
                orderId: selectedOrderId,
                shopScore: shopScore || null,
                shopComment: canRateShop ? ratingForm.shopComment : undefined,
                shipperScore: shipperScore || null,
                shipperComment: canRateShipper ? ratingForm.shipperComment : undefined,
            })
            await refreshRating()
            setRatingMessage('Your rating has been saved.')
        } catch (error) {
            if (error?.code === 'RATING_ALREADY_SUBMITTED') {
                await refreshRating().catch(() => null)
                setRatingMessage('This rating was already submitted.')
            } else {
                setRatingError(error?.message || 'Could not submit your rating')
            }
        } finally {
            setIsRatingSubmitting(false)
        }
    }

    const refreshSelectedOrder = async () => {
        if (!selectedOrderId) return null
        const freshOrder = normalizeOrder(await getOrderDetail(selectedOrderId))
        setRemoteOrder(freshOrder)
        setLastUpdatedAt(new Date())
        setOrdersPage((prev) => ({
            ...prev,
            items: prev.items.map((item) => item.orderId === freshOrder.orderId ? freshOrder : item),
        }))
        return freshOrder
    }

    const refreshTracking = () => {
        if (isLoading) return
        setOrderReloadKey((value) => value + 1)
    }

    const openBankTransfer = async () => {
        if (!selectedOrderId || !canCreateBankTransfer) return

        setIsPaymentActionLoading(true)
        setPaymentActionMessage('')
        try {
            if (bankTransferRequestRef.current.orderId !== selectedOrderId) {
                bankTransferRequestRef.current = {
                    orderId: selectedOrderId,
                    key: globalThis.crypto?.randomUUID?.() || `payment-${selectedOrderId}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                }
            }

            const payment = await createBankTransferPayment(selectedOrderId, {
                idempotencyKey: bankTransferRequestRef.current.key,
            })
            setPaymentReceipt(payment)
            setPaymentActionMessage(t('track.bankPaymentCreated'))
        } catch (error) {
            setPaymentActionMessage(error?.message || t('track.bankPaymentCreateFailed'))
        } finally {
            setIsPaymentActionLoading(false)
        }
    }

    const refreshPaymentStatus = async () => {
        if (!selectedOrderId) return

        setIsPaymentActionLoading(true)
        setPaymentActionMessage('')
        try {
            setPaymentReceipt(await getPaymentByOrderId(selectedOrderId))
            setPaymentActionMessage(t('track.paymentStatusRefreshed'))
        } catch (error) {
            setPaymentActionMessage(error?.message || t('track.paymentLoadFailedSoft'))
        } finally {
            setIsPaymentActionLoading(false)
        }
    }

    const selectPaymentEvidence = (file) => {
        if (!file) {
            setPaymentEvidenceFile(null)
            return
        }
        if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
            setPaymentEvidenceFile(null)
            setPaymentActionMessage(t('track.paymentEvidenceInvalid'))
            return
        }
        setPaymentEvidenceFile(file)
        setPaymentActionMessage('')
    }

    const reportPaid = async () => {
        if (!canReportPaymentPaid || !paymentEvidenceFile || isPaymentActionLoading) return

        setIsPaymentActionLoading(true)
        setPaymentActionMessage('')
        try {
            const payment = await reportPaymentPaid(paymentReceipt.paymentId, {
                evidenceFile: paymentEvidenceFile,
                note: paymentReportNote,
                transactionReference: paymentTransactionReference,
            })
            setPaymentReceipt(payment)
            setPaymentEvidenceFile(null)
            setPaymentReportNote('')
            setPaymentTransactionReference('')
            setPaymentActionMessage(t('track.paymentReportedPaid'))
        } catch (error) {
            setPaymentActionMessage(error?.message || t('track.paymentReportFailed'))
        } finally {
            setIsPaymentActionLoading(false)
        }
    }

    const decideInspection = async (decision) => {
        if (!selectedOrderId || inspectionAction) return

        setInspectionAction(decision)
        setInspectionError('')
        setInspectionActionMessage('')
        try {
            const result = decision === 'approve'
                ? await approveOrderInspection(selectedOrderId)
                : await rejectOrderInspection(selectedOrderId)
            setInspection(result)
            setInspectionActionMessage(
                decision === 'approve' ? t('track.inspectionApproved') : t('track.inspectionRejected'),
            )
            await refreshSelectedOrder()
        } catch (error) {
            setInspectionError(error?.message || t('track.inspectionDecisionFailed'))
            await refreshSelectedOrder().catch(() => null)
        } finally {
            setInspectionAction('')
        }
    }

    const requestInspectionDecision = (decision) => {
        const isApprove = decision === 'approve'
        setConfirmDialog({
            title: isApprove ? t('track.approveInspectionTitle') : t('track.rejectInspectionTitle'),
            message: isApprove ? t('track.approveInspectionConfirm') : t('track.rejectInspectionConfirm'),
            confirmText: isApprove ? t('track.approveInspection') : t('track.rejectInspection'),
            cancelText: t('common.cancel'),
            type: isApprove ? 'info' : 'danger',
            onConfirm: async () => {
                setConfirmDialog(null)
                await decideInspection(decision)
            },
        })
    }

    const cancelSelectedOrder = async () => {
        if (!selectedOrderId || !canCancelOrder) return

        setIsCancelLoading(true)
        setRemoteError('')
        try {
            const cancelled = normalizeOrder(await cancelOrder(selectedOrderId))
            setRemoteOrder(cancelled)
            setOrdersPage((prev) => ({
                ...prev,
                items: prev.items.map((item) => item.orderId === cancelled.orderId ? cancelled : item),
            }))
        } catch (error) {
            setRemoteError(error?.message || t('track.cancelFailed'))
            await refreshSelectedOrder().catch(() => null)
        } finally {
            setIsCancelLoading(false)
        }
    }

    const requestCancelOrder = () => {
        setConfirmDialog({
            title: t('track.cancelConfirmTitle'),
            message: t('track.cancelConfirm'),
            confirmText: t('track.cancelOrder'),
            cancelText: t('common.cancel'),
            type: 'danger',
            onConfirm: async () => {
                setConfirmDialog(null)
                await cancelSelectedOrder()
            },
        })
    }

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
                        <div className="track-refresh-row">
                            <p className="track-updated">
                                {isLoading
                                    ? t('track.refreshing')
                                    : lastUpdatedAt
                                        ? t('track.lastUpdatedAt').replace('{time}', formatDateTime(lastUpdatedAt))
                                        : t('track.syncedFromBackend')}
                            </p>
                            <button className="track-refresh-btn" type="button" disabled={isLoading} onClick={refreshTracking}>
                                <RefreshCw size={14} strokeWidth={1.9} className={isLoading ? 'is-spinning' : ''} />
                                {t('track.refreshTracking')}
                            </button>
                        </div>
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
                            {ordersError && <p className="track-list-error track-soft-warning">{ordersError}</p>}
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

                        {order.status === 'WAITING_CUSTOMER_CONFIRMATION' && (
                            <section className="track-card inspection-review-card">
                                <div className="track-card-head">
                                    <ClipboardCheck size={18} strokeWidth={1.8} />
                                    <div>
                                        <h2>{t('track.inspectionReviewTitle')}</h2>
                                        <p>{t('track.inspectionReviewSubtitle')}</p>
                                    </div>
                                </div>

                                {isInspectionLoading && <p className="inspection-review-state">{t('track.inspectionLoading')}</p>}
                                {inspectionError && (
                                    <div className="inspection-review-error track-soft-warning">
                                        <span>{inspectionError}</span>
                                        <button type="button" onClick={() => setInspectionReloadKey((value) => value + 1)}>
                                            {t('track.retryInspection')}
                                        </button>
                                    </div>
                                )}

                                {!isInspectionLoading && inspection && (
                                    <>
                                        <div className="inspection-price-grid">
                                            <div>
                                                <span>{t('track.inspectionEstimatedAmount')}</span>
                                                <strong>{formatVnd(inspection.estimatedAmount)} VND</strong>
                                            </div>
                                            <div>
                                                <span>{t('track.inspectionActualAmount')}</span>
                                                <strong>{formatVnd(inspection.actualAmount)} VND</strong>
                                            </div>
                                            <div>
                                                <span>{t('track.inspectionDifference')}</span>
                                                <strong>{formatVnd(inspection.differenceAmount)} VND</strong>
                                            </div>
                                        </div>

                                        {inspection.items?.length > 0 && (
                                            <div className="inspection-review-items">
                                                {inspection.items.map((item) => (
                                                    <div key={item.orderItemId || item.id}>
                                                        <span>
                                                            <strong>{item.serviceName || t('track.unknownService')}</strong>
                                                            {item.note && <small>{item.note}</small>}
                                                        </span>
                                                        <span>
                                                            {item.actualWeight !== null && item.actualWeight !== undefined
                                                                ? `${item.actualWeight} kg · `
                                                                : ''}
                                                            {formatVnd(item.actualSubtotal)} VND
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <p className="inspection-review-note">{t('track.inspectionDecisionNote')}</p>
                                        <div className="inspection-review-actions">
                                            <button
                                                type="button"
                                                className="inspection-reject-btn"
                                                disabled={Boolean(inspectionAction)}
                                                onClick={() => requestInspectionDecision('reject')}
                                            >
                                                {inspectionAction === 'reject' ? t('common.loading') : t('track.rejectInspection')}
                                            </button>
                                            <button
                                                type="button"
                                                className="inspection-approve-btn"
                                                disabled={Boolean(inspectionAction)}
                                                onClick={() => requestInspectionDecision('approve')}
                                            >
                                                {inspectionAction === 'approve' ? t('common.loading') : t('track.approveInspection')}
                                            </button>
                                        </div>
                                    </>
                                )}
                                {inspectionActionMessage && <p className="inspection-review-success">{inspectionActionMessage}</p>}
                            </section>
                        )}

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

                        {canShowDriver && (
                            <section className="track-card driver-card">
                                <div className="driver-avatar"><Truck size={20} strokeWidth={1.9} /></div>
                                <div>
                                    <p className="driver-label">{t('track.assignedDriver')}</p>
                                    <p className="driver-name">{driver.name}</p>
                                    <p className="driver-meta">
                                        {[driver.vehicleType, driver.licensePlate].filter(Boolean).join(' · ') || t('track.driverVehicleUnavailable')}
                                        {driver.phone && ` · ${driver.phone}`}
                                    </p>
                                </div>
                                {driver.phone && (
                                    <a className="driver-call-link" href={`tel:${driver.phone}`} aria-label={t('track.callDriver')}>
                                        <PhoneCall size={16} strokeWidth={2} />
                                    </a>
                                )}
                            </section>
                        )}

                        {order.status === 'COMPLETED' && (
                            <section className="track-card order-rating-card">
                                <div className="track-card-head">
                                    <Star size={18} strokeWidth={1.8} />
                                    <h2>Rate this order</h2>
                                </div>
                                {isRatingLoading && <p className="track-payment-message">Loading rating status…</p>}
                                {ratingError && (
                                    <div className="track-payment-message track-soft-warning">
                                        <span>{ratingError}</span>
                                        <button type="button" onClick={() => refreshRating().catch((error) => setRatingError(error?.message || 'Could not load rating status'))}>Try again</button>
                                    </div>
                                )}
                                {!isRatingLoading && ratingState && (
                                    <>
                                        {ratingState.shopRated ? (
                                            <p className="order-rating-saved">Shop rating: {ratingState.shopRating?.score || 0}/5</p>
                                        ) : (
                                            <RatingEditor
                                                label="Shop"
                                                score={ratingForm.shopScore}
                                                comment={ratingForm.shopComment}
                                                onScoreChange={(shopScore) => setRatingForm((current) => ({ ...current, shopScore }))}
                                                onCommentChange={(shopComment) => setRatingForm((current) => ({ ...current, shopComment }))}
                                            />
                                        )}
                                        {ratingState.shipperRatingAvailable && (ratingState.shipperRated ? (
                                            <p className="order-rating-saved">Driver rating: {ratingState.shipperRating?.score || 0}/5</p>
                                        ) : (
                                            <RatingEditor
                                                label="Driver"
                                                score={ratingForm.shipperScore}
                                                comment={ratingForm.shipperComment}
                                                onScoreChange={(shipperScore) => setRatingForm((current) => ({ ...current, shipperScore }))}
                                                onCommentChange={(shipperComment) => setRatingForm((current) => ({ ...current, shipperComment }))}
                                            />
                                        ))}
                                        {(canRateShop || canRateShipper) ? (
                                            <button type="button" className="support-btn compact-action filled" onClick={submitOrderRating} disabled={isRatingSubmitting}>
                                                {isRatingSubmitting ? 'Saving rating…' : 'Submit rating'}
                                            </button>
                                        ) : (
                                            <p className="order-rating-saved">Your available ratings have been submitted.</p>
                                        )}
                                        {ratingMessage && <p className="inspection-review-success">{ratingMessage}</p>}
                                    </>
                                )}
                            </section>
                        )}

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

                        <section className="track-card payment-card">
                            <div className="track-card-head">
                                <CreditCard size={17} strokeWidth={1.8} />
                                <h2>{t('track.paymentTitle')}</h2>
                            </div>
                            {isPaymentLoading && <p className="track-payment-message">{t('track.loadingPayment')}</p>}
                            <div className="payment-detail-list">
                                <div className="payment-detail-row">
                                    <span>{t('track.paymentMethod')}</span>
                                    <strong>{getPaymentMethodLabel(paymentReceipt?.paymentMethod || currentPaymentMethod, t)}</strong>
                                </div>
                                <div className="payment-detail-row">
                                    <span>{t('track.paymentStatus')}</span>
                                    <strong>{paymentStatusLabel}</strong>
                                </div>
                                {paymentReceipt?.amount !== undefined && paymentReceipt?.amount !== null && (
                                    <div className="payment-detail-row">
                                        <span>{t('track.paymentAmount')}</span>
                                        <strong>{formatVnd(paymentReceipt.amount)} VND</strong>
                                    </div>
                                )}
                            </div>

                            {bankTransferDetails && (
                                <div className="bank-transfer-details">
                                    <div className="bank-transfer-head">
                                        <Landmark size={17} strokeWidth={1.8} />
                                        <strong>{t('track.bankTransferDetails')}</strong>
                                    </div>
                                    {bankTransferDetails.qrImageUrl && (
                                        <img
                                            className="bank-transfer-qr"
                                            src={bankTransferDetails.qrImageUrl}
                                            alt={t('track.bankTransferQrAlt')}
                                        />
                                    )}
                                    <div className="payment-detail-list">
                                        <div className="payment-detail-row">
                                            <span>{t('track.receiverBank')}</span>
                                            <strong>{bankTransferDetails.receiverBankName || t('track.notAvailable')}</strong>
                                        </div>
                                        <div className="payment-detail-row">
                                            <span>{t('track.accountHolder')}</span>
                                            <strong>{bankTransferDetails.receiverAccountHolder || t('track.notAvailable')}</strong>
                                        </div>
                                        <div className="payment-detail-row">
                                            <span>{t('track.accountNumber')}</span>
                                            <strong>{bankTransferDetails.receiverAccountNumber || t('track.notAvailable')}</strong>
                                        </div>
                                        <div className="payment-detail-row">
                                            <span>{t('track.transferContent')}</span>
                                            <strong>{bankTransferDetails.transferCode || t('track.notAvailable')}</strong>
                                        </div>
                                        <div className="payment-detail-row">
                                            <span>{t('track.transferAmount')}</span>
                                            <strong>{formatVnd(bankTransferDetails.amount || paymentReceipt?.amount)} VND</strong>
                                        </div>
                                        <div className="payment-detail-row">
                                            <span>{t('track.expiresAt')}</span>
                                            <strong>{formatDateTime(bankTransferDetails.expiredAt)}</strong>
                                        </div>
                                    </div>
                                    {canReportPaymentPaid && (
                                        <div className="payment-report-form">
                                            <div className="payment-report-intro">
                                                <ImageUp size={16} strokeWidth={1.8} />
                                                <div>
                                                    <strong>{t('track.reportPaidTitle')}</strong>
                                                    <span>{t('track.reportPaidSubtitle')}</span>
                                                </div>
                                            </div>
                                            <label className="payment-evidence-picker">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(event) => selectPaymentEvidence(event.target.files?.[0])}
                                                    disabled={isPaymentActionLoading}
                                                />
                                                <ImageUp size={15} strokeWidth={1.8} />
                                                <span>{paymentEvidenceFile?.name || t('track.choosePaymentEvidence')}</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentTransactionReference}
                                                onChange={(event) => setPaymentTransactionReference(event.target.value)}
                                                placeholder={t('track.transactionReferencePlaceholder')}
                                                disabled={isPaymentActionLoading}
                                            />
                                            <textarea
                                                rows="2"
                                                value={paymentReportNote}
                                                onChange={(event) => setPaymentReportNote(event.target.value)}
                                                placeholder={t('track.paymentReportNotePlaceholder')}
                                                disabled={isPaymentActionLoading}
                                            />
                                            <button
                                                type="button"
                                                className="support-btn compact-action filled"
                                                onClick={reportPaid}
                                                disabled={!paymentEvidenceFile || isPaymentActionLoading}
                                            >
                                                <Send size={14} strokeWidth={1.9} />
                                                {isPaymentActionLoading ? t('common.loading') : t('track.reportPaymentPaid')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {currentPaymentMethod === 'BANK_TRANSFER' && !payableOrder && !bankTransferDetails && (
                                <p className="track-payment-message track-soft-warning">{t('track.bankPaymentWaitForFinalPrice')}</p>
                            )}

                            {(canCreateBankTransfer || paymentReceipt) && (
                                <div className="payment-actions">
                                    {canCreateBankTransfer && (
                                        <button
                                            type="button"
                                            className="support-btn compact-action filled"
                                            onClick={openBankTransfer}
                                            disabled={isPaymentActionLoading}
                                        >
                                            <QrCode size={15} strokeWidth={1.8} />
                                            {['EXPIRED', 'FAILED', 'CANCELLED', 'SHOP_REJECTED'].includes(paymentStatus)
                                                ? t('track.reopenBankPayment')
                                                : t('track.createBankPayment')}
                                        </button>
                                    )}
                                    {paymentReceipt && (
                                        <button
                                            type="button"
                                            className="support-btn compact-action"
                                            onClick={refreshPaymentStatus}
                                            disabled={isPaymentActionLoading}
                                        >
                                            {t('track.refreshPaymentStatus')}
                                        </button>
                                    )}
                                </div>
                            )}
                            {paymentActionMessage && <p className="track-payment-message track-soft-warning">{paymentActionMessage}</p>}

                            {/* Legacy payment actions are intentionally disabled: payment is handled directly with the shop. */}
                            {/*
                                <div className={`payment-voucher-preview ${includeVoucherInPayment ? '' : 'disabled'}`}>
                                    <div>
                                        <strong>{t('track.savedVoucher')} {savedPaymentVoucherCode}</strong>
                                        {isPaymentPreviewLoading && <span>{t('track.loadingPaymentPreview')}</span>}
                                        {!isPaymentPreviewLoading && paymentPreviewError && <span>{paymentPreviewError}</span>}
                                        {!isPaymentPreviewLoading && paymentPreview?.voucherValid && (
                                            <span>
                                                {t('track.voucherFinalDiscount')} -{formatVnd(paymentPreview.discountAmount)} VND · {t('track.voucherFinalAmount')} {formatVnd(paymentPreview.finalAmount)} VND
                                            </span>
                                        )}
                                        {!isPaymentPreviewLoading && paymentPreview && !paymentPreview.voucherValid && (
                                            <span>{paymentPreview.voucherMessage || t('track.voucherInvalidForFinalAmount')}</span>
                                        )}
                                    </div>
                                    <button type="button" onClick={() => setIncludeVoucherInPayment((value) => !value)}>
                                        {includeVoucherInPayment ? t('track.payWithoutVoucher') : t('track.useSavedVoucher')}
                                    </button>
                                </div>
                            )}

                            {bankTransferDetails && (
                                <div className="bank-transfer-details">
                                    <div className="bank-transfer-head">
                                        <Landmark size={17} strokeWidth={1.8} />
                                        <strong>{t('track.bankTransferDetails')}</strong>
                                    </div>
                                    {bankTransferDetails.qrImageUrl && (
                                        <img
                                            className="bank-transfer-qr"
                                            src={bankTransferDetails.qrImageUrl}
                                            alt={t('track.bankTransferQrAlt')}
                                        />
                                    )}
                                    <div className="payment-detail-list">
                                        <div className="payment-detail-row">
                                            <span>{t('track.receiverBank')}</span>
                                            <strong>{bankTransferDetails.receiverBankName || t('track.notAvailable')}</strong>
                                        </div>
                                        <div className="payment-detail-row">
                                            <span>{t('track.accountHolder')}</span>
                                            <strong>{bankTransferDetails.receiverAccountHolder || t('track.notAvailable')}</strong>
                                        </div>
                                        <div className="payment-detail-row">
                                            <span>{t('track.accountNumber')}</span>
                                            <strong>{bankTransferDetails.receiverAccountNumber || t('track.notAvailable')}</strong>
                                        </div>
                                        <div className="payment-detail-row">
                                            <span>{t('track.transferContent')}</span>
                                            <strong>{bankTransferDetails.transferCode || t('track.notAvailable')}</strong>
                                        </div>
                                        <div className="payment-detail-row">
                                            <span>{t('track.transferAmount')}</span>
                                            <strong>{formatVnd(bankTransferDetails.amount || paymentReceipt?.amount)} VND</strong>
                                        </div>
                                        <div className="payment-detail-row">
                                            <span>{t('track.expiresAt')}</span>
                                            <strong>{formatDateTime(bankTransferDetails.expiredAt)}</strong>
                                        </div>
                                    </div>
                                    {canReportPaymentPaid && (
                                        <div className="payment-report-form">
                                            <div className="payment-report-intro">
                                                <ImageUp size={16} strokeWidth={1.8} />
                                                <div>
                                                    <strong>{t('track.reportPaidTitle')}</strong>
                                                    <span>{t('track.reportPaidSubtitle')}</span>
                                                </div>
                                            </div>
                                            <label className="payment-evidence-picker">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(event) => selectPaymentEvidence(event.target.files?.[0])}
                                                    disabled={isPaymentActionLoading}
                                                />
                                                <ImageUp size={15} strokeWidth={1.8} />
                                                <span>{paymentEvidenceFile?.name || t('track.choosePaymentEvidence')}</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentTransactionReference}
                                                onChange={(event) => setPaymentTransactionReference(event.target.value)}
                                                placeholder={t('track.transactionReferencePlaceholder')}
                                                disabled={isPaymentActionLoading}
                                            />
                                            <textarea
                                                rows="2"
                                                value={paymentReportNote}
                                                onChange={(event) => setPaymentReportNote(event.target.value)}
                                                placeholder={t('track.paymentReportNotePlaceholder')}
                                                disabled={isPaymentActionLoading}
                                            />
                                            <button
                                                type="button"
                                                className="support-btn compact-action filled"
                                                onClick={reportPaid}
                                                disabled={!paymentEvidenceFile || isPaymentActionLoading}
                                            >
                                                <Send size={14} strokeWidth={1.9} />
                                                {isPaymentActionLoading ? t('common.loading') : t('track.reportPaymentPaid')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {currentPaymentMethod === 'BANK_TRANSFER' && !payableOrder && !bankTransferDetails && (
                                <p className="track-payment-message track-soft-warning">{t('track.bankPaymentWaitForFinalPrice')}</p>
                            )}

                            {(canChangePayment || canCreateBankTransfer || paymentReceipt) && (
                                <div className="payment-actions">
                                    {canChangePayment && (
                                        <>
                                            <select
                                                value={selectedPaymentMethod || currentPaymentMethod}
                                                onChange={(event) => setSelectedPaymentMethod(event.target.value)}
                                                disabled={isPaymentActionLoading}
                                            >
                                                {paymentMethodOptions.map((method) => {
                                                    const methodId = getPaymentMethodId(method)
                                                    return (
                                                        <option key={methodId} value={methodId}>
                                                            {getPaymentMethodLabel(method, t)}
                                                        </option>
                                                    )
                                                })}
                                            </select>
                                            <button
                                                type="button"
                                                className="support-btn compact-action"
                                                onClick={changePaymentMethod}
                                                disabled={isPaymentActionLoading || !selectedPaymentMethod || selectedPaymentMethod === currentPaymentMethod}
                                            >
                                                {t('track.updatePaymentMethod')}
                                            </button>
                                        </>
                                    )}
                                    {canCreateBankTransfer && (
                                        <button
                                            type="button"
                                            className="support-btn compact-action filled"
                                            onClick={openBankTransfer}
                                            disabled={isPaymentActionLoading}
                                        >
                                            <QrCode size={15} strokeWidth={1.8} />
                                            {['EXPIRED', 'FAILED', 'CANCELLED', 'SHOP_REJECTED'].includes(paymentStatus)
                                                ? t('track.reopenBankPayment')
                                                : t('track.createBankPayment')}
                                        </button>
                                    )}
                                    {paymentReceipt && (
                                        <button
                                            type="button"
                                            className="support-btn compact-action"
                                            onClick={refreshPaymentStatus}
                                            disabled={isPaymentActionLoading}
                                        >
                                            {t('track.refreshPaymentStatus')}
                                        </button>
                                    )}
                                </div>
                            )}
                            */}
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
                        {canCancelOrder && (
                            <button className="support-btn danger" type="button" onClick={requestCancelOrder} disabled={isCancelLoading}>
                                <XCircle size={16} strokeWidth={1.8} />
                                {isCancelLoading ? t('common.loading') : t('track.cancelOrder')}
                            </button>
                        )}
                        <button className="support-btn" type="button" onClick={() => navigate(localizePath(`/all-shops/${selectedShopId}`, language))}>
                            {t('track.viewOrder')}
                        </button>
                    </aside>
                </section>
            </main>
            {confirmDialog && (
                <ConfirmDialog
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    confirmText={confirmDialog.confirmText}
                    cancelText={confirmDialog.cancelText}
                    type={confirmDialog.type}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={() => setConfirmDialog(null)}
                />
            )}
        </div>
    )
}

export default TrackOrder
