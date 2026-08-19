import { createElement, useEffect, useState } from 'react'
import './ShopOrderManagement.css'
import {
    AlertTriangle,
    Check,
    ChevronRight,
    Clock,
    Download,
    Eye,
    ExternalLink,
    PackageCheck,
    PackageSearch,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    Shirt,
    Trash2,
    Truck,
    X,
} from 'lucide-react'
import toast from '../../utils/toast'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import { getNextOrderStatusInfo, getOrderStatusMeta } from '../../components/OrderStatusBadge/orderStatus'
import { useTranslation } from '../../shared/lib/i18n'
import {
    confirmShopOwnerPayment,
    getShopOwnerOrderDetail,
    getShopOwnerOrderInspection,
    getShopOwnerOrders,
    saveShopOwnerOrderInspectionDraft,
    rejectShopOwnerPayment,
    submitShopOwnerOrderInspection,
    updateShopOwnerOrderStatus,
} from '../../services/shopOwnerOrderApi'

const PRODUCTION_STATUSES = ['washing', 'drying', 'ironing']
const ACTIVE_OPERATION_STATUSES = [
    'waiting-customer-confirmation',
    ...PRODUCTION_STATUSES,
    'delivering',
]
const NEEDS_ACTION_STATUSES = ['pending', 'confirmed', 'picking-up', 'at-store', 'ready']
const STATUS_OPTIONS = [
    'pending',
    'confirmed',
    'picking-up',
    'at-store',
    'waiting-customer-confirmation',
    'washing',
    'drying',
    'ironing',
    'ready',
    'delivering',
    'completed',
    'cancelled',
    'cancelled-after-weight-confirmation',
]
const SERVICE_OPTIONS = ['Wash & Dry', 'Dry Clean', 'Express Wash', 'Wash & Iron', 'Iron Only']

const emptyOrderForm = {
    customer: '',
    phone: '',
    service: 'Wash & Dry',
    estimatedWeight: '',
    estimatedPrice: '',
    notes: '',
    items: [],
}

function formatPriceInput(value) {
    const digits = String(value).replace(/\D/g, '')
    if (!digits) return ''
    return Number(digits).toLocaleString('en-US')
}

function makeTimestamp() {
    return new Date()
        .toLocaleString('sv-SE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        })
        .replace(',', '')
}

function getNextOrderId(orders) {
    const maxId = orders.reduce((max, order) => {
        const numeric = Number(String(order.id).replace(/\D/g, ''))
        return Number.isFinite(numeric) ? Math.max(max, numeric) : max
    }, 10234)
    return `#ORD-${maxId + 1}`
}

function mapInspectionItems(order, inspection) {
    const source = inspection?.items?.length ? inspection.items : order?.items || []

    return source.map((item, index) => ({
        key: item.orderItemId ?? item.id ?? `inspection-item-${index}`,
        orderItemId: item.orderItemId ?? item.id ?? null,
        serviceName: item.serviceName || item.type || `Item ${index + 1}`,
        quantity: item.quantity || null,
        actualWeight: item.actualWeight ?? '',
        note: item.note || '',
    }))
}

function formatInspectionAmount(value) {
    const amount = Number(value)
    return Number.isFinite(amount) ? `${amount.toLocaleString()}đ` : ''
}

function formatPaymentAmount(value) {
    if (value === null || value === undefined || value === '') return '—'
    const amount = Number(value)
    return Number.isFinite(amount) ? `${amount.toLocaleString()}đ` : '—'
}

function formatPaymentDate(value) {
    if (!value) return ''
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString()
}

function getShopOrderAction(order) {
    if (order?.status === 'pending') return { type: 'status', status: 'confirmed' }
    if (['confirmed', 'picking-up'].includes(order?.status)) return { type: 'status', status: 'at-store' }
    if (order?.status === 'at-store') return { type: 'inspection' }
    if (order?.status === 'ready') return { type: 'status', status: 'delivering' }
    if (order?.status === 'delivering' && order?.paymentStatus === 'paid') {
        return { type: 'status', status: 'completed' }
    }

    const next = getNextOrderStatusInfo(order?.status)
    return next ? { type: 'status', status: next.status } : null
}

function ShopOrderManagement() {
    const { t } = useTranslation()
    const [orders, setOrders] = useState([])
    const [isLoadingOrders, setIsLoadingOrders] = useState(true)
    const [orderLoadError, setOrderLoadError] = useState('')
    const [updatingOrderId, setUpdatingOrderId] = useState(null)
    const [activeTab, setActiveTab] = useState('all')
    const [paymentFilter, setPaymentFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showCheckIn, setShowCheckIn] = useState(false)
    const [showNewOrderModal, setShowNewOrderModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingOrder, setEditingOrder] = useState(null)
    const [newOrderForm, setNewOrderForm] = useState(emptyOrderForm)
    const [checkinForm, setCheckinForm] = useState({ items: [] })
    const [inspection, setInspection] = useState(null)
    const [isLoadingInspection, setIsLoadingInspection] = useState(false)
    const [inspectionLoadError, setInspectionLoadError] = useState('')
    const [inspectionAction, setInspectionAction] = useState('')
    const [paymentAction, setPaymentAction] = useState('')
    const [paymentConfirmationNote, setPaymentConfirmationNote] = useState('')
    const [paymentRejectionReason, setPaymentRejectionReason] = useState('')
    const [confirmDialog, setConfirmDialog] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null,
        type: 'warning',
    })

    const loadShopOrders = async () => {
        setIsLoadingOrders(true)
        setOrderLoadError('')
        try {
            const page = await getShopOwnerOrders({ page: 0, size: 100 })
            setOrders(page.items || [])
        } catch (error) {
            setOrderLoadError(error?.message || 'Could not load shop orders')
            setOrders([])
        } finally {
            setIsLoadingOrders(false)
        }
    }

    useEffect(() => {
        loadShopOrders()
    }, [])

    const needsActionCount = orders.filter(order => (
        NEEDS_ACTION_STATUSES.includes(order.status) ||
        (order.status === 'delivering' && order.paymentStatus === 'paid')
    )).length
    const inProgressCount = orders.filter(order => ACTIVE_OPERATION_STATUSES.includes(order.status)).length
    const readyCount = orders.filter(order => order.status === 'ready').length
    const paymentPendingCount = orders.filter(order => order.paymentStatus !== 'paid').length

    const statusLabel = (status) => {
        const labels = {
            pending: t('shopOrders.statusPendingAcceptance'),
            confirmed: t('shopOrders.statusConfirmed'),
            'picking-up': t('shopOrders.statusPickingUp'),
            'at-store': t('shopOrders.statusPendingCheckin'),
            'waiting-customer-confirmation': t('shopOrders.statusWaitingCustomerConfirmation'),
            washing: t('shopOrders.statusWashing'),
            drying: t('shopOrders.statusDrying'),
            ironing: t('shopOrders.statusIroning'),
            ready: t('shopOrders.statusReady'),
            delivering: t('shopOrders.statusDelivering'),
            completed: t('shopOrders.statusCompleted'),
            cancelled: t('shopOrders.statusCancelled'),
            'cancelled-after-weight-confirmation': t('shopOrders.statusCancelledAfterWeightConfirmation'),
        }
        return labels[status] || status
    }

    const priorityLabel = (priority) => priority === 'high' ? t('shopOrders.high') : t('shopOrders.normal')
    const paymentLabel = (paymentStatus) => paymentStatus === 'paid' ? t('shopOrders.paid') : t('shopOrders.pending')
    const paymentRecordStatusLabel = (status) => t(`shopOrders.paymentStatusLabel.${status}`)

    const actionLabel = (order) => {
        if (order.status === 'pending') return t('shopOrders.acceptOrder')
        if (order.status === 'confirmed' || order.status === 'picking-up') return t('shopOrders.confirmLaundryReceived')
        if (order.status === 'at-store') return t('shopOrders.checkin')
        if (order.status === 'waiting-customer-confirmation') return t('shopOrders.waitingCustomerAction')
        if (order.status === 'ready') return t('shopOrders.confirmCustomerReceived')
        if (order.status === 'delivering') {
            return order.paymentStatus === 'paid'
                ? t('shopOrders.completeOrder')
                : t('shopOrders.waitingForBankTransfer')
        }

        const action = getShopOrderAction(order)
        const labels = {
            drying: t('shopOrders.moveToDrying'),
            ironing: t('shopOrders.moveToIroning'),
            ready: t('shopOrders.markReady'),
            delivering: t('shopOrders.confirmCustomerReceived'),
            completed: t('shopOrders.completeOrder'),
        }
        return action ? labels[action.status] : t('shopOrders.noAction')
    }

    const filteredOrders = orders.filter(order => {
        const query = searchTerm.trim().toLowerCase()
        const matchesSearch = !query ||
            order.id.toLowerCase().includes(query) ||
            order.customer.toLowerCase().includes(query) ||
            order.phone.includes(query) ||
            order.service.toLowerCase().includes(query)

        const matchesStatus =
            activeTab === 'all' ||
            (activeTab === 'progress' && ACTIVE_OPERATION_STATUSES.includes(order.status)) ||
            (activeTab === 'pending' && (NEEDS_ACTION_STATUSES.includes(order.status) ||
                (order.status === 'delivering' && order.paymentStatus === 'paid'))) ||
            (activeTab === 'ready' && order.status === 'ready')

        const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter
        return matchesSearch && matchesStatus && matchesPayment
    })

    const queueCards = [
        { key: 'all', label: t('shopOrders.allOrders'), value: orders.length, Icon: PackageSearch, tone: 'navy' },
        { key: 'pending', label: t('shopOrders.needsAction'), value: needsActionCount, Icon: Clock, tone: 'amber' },
        { key: 'progress', label: t('shopOrders.inProduction'), value: inProgressCount, Icon: Shirt, tone: 'blue' },
        { key: 'ready', label: t('shopOrders.ready'), value: readyCount, Icon: Truck, tone: 'teal' },
    ]

    const handleCreateOrder = () => {
        if (!newOrderForm.customer || !newOrderForm.phone || !newOrderForm.estimatedWeight) {
            toast.warning(t('shopOrders.requiredCreate'))
            return
        }

        const newOrder = {
            id: getNextOrderId(orders),
            ...newOrderForm,
            estimatedWeight: `${newOrderForm.estimatedWeight}kg`,
            estimatedPrice: `${newOrderForm.estimatedPrice || '0'}đ`,
            actualWeight: null,
            actualPrice: null,
            status: 'pending',
            pickupTime: makeTimestamp(),
            checkinTime: null,
            completedTime: null,
            deliveryStartTime: null,
            deliveredTime: null,
            priority: 'normal',
            paymentStatus: 'pending',
            paymentMethod: null,
            items: newOrderForm.items.length > 0 ? newOrderForm.items : [{ type: 'General', quantity: 1, condition: 'Good' }],
        }

        setOrders([newOrder, ...orders])
        setSelectedOrder(newOrder)
        setNewOrderForm(emptyOrderForm)
        setShowNewOrderModal(false)
        toast.success(t('shopOrders.orderCreated').replace('{id}', newOrder.id))
    }

    const handleSaveEdit = () => {
        if (!editingOrder.customer || !editingOrder.phone) {
            toast.warning(t('shopOrders.requiredCustomer'))
            return
        }

        const updatedOrders = orders.map(order => order.id === editingOrder.id ? editingOrder : order)
        setOrders(updatedOrders)
        setSelectedOrder(editingOrder)
        setEditingOrder(null)
        setShowEditModal(false)
        toast.success(t('shopOrders.orderUpdated').replace('{id}', editingOrder.id))
    }

    const closeConfirmDialog = () => {
        setConfirmDialog(prev => ({ ...prev, show: false }))
    }

    const selectOrder = async (order) => {
        setSelectedOrder(order)
        setShowCheckIn(false)
        setPaymentAction('')
        setPaymentConfirmationNote('')
        setPaymentRejectionReason('')
        const orderId = order.apiId || String(order.id || '').replace(/\D/g, '')
        if (!orderId) return

        try {
            const detail = await getShopOwnerOrderDetail(orderId)
            setSelectedOrder({ ...order, ...detail, apiId: orderId })
        } catch (error) {
            toast.error(error?.message || 'Could not load order detail')
        }
    }

    const handlePaymentDecision = async (decision) => {
        const paymentId = selectedOrder?.payment?.paymentId
        const orderId = selectedOrder?.apiId || String(selectedOrder?.id || '').replace(/\D/g, '')
        if (!paymentId || !orderId || paymentAction) return

        setPaymentAction(decision)
        try {
            if (decision === 'confirm') {
                await confirmShopOwnerPayment(paymentId, paymentConfirmationNote)
            } else {
                await rejectShopOwnerPayment(paymentId, paymentRejectionReason)
            }

            const detail = await getShopOwnerOrderDetail(orderId)
            setSelectedOrder((current) => ({ ...current, ...detail, apiId: orderId }))
            setPaymentConfirmationNote('')
            setPaymentRejectionReason('')
            await loadShopOrders()
            toast.success(decision === 'confirm' ? t('shopOrders.paymentConfirmed') : t('shopOrders.paymentRejected'))
        } catch (error) {
            toast.error(error?.message || t('shopOrders.paymentActionFailed'))
        } finally {
            setPaymentAction('')
        }
    }

    const requestPaymentDecision = (decision) => {
        if (decision === 'reject' && !paymentRejectionReason.trim()) {
            toast.warning(t('shopOrders.rejectReasonRequired'))
            return
        }

        const isConfirm = decision === 'confirm'
        setConfirmDialog({
            show: true,
            title: isConfirm ? t('shopOrders.confirmPaymentTitle') : t('shopOrders.rejectPaymentTitle'),
            message: isConfirm ? t('shopOrders.confirmPaymentConfirm') : t('shopOrders.rejectPaymentConfirm'),
            confirmText: isConfirm ? t('shopOrders.confirmPayment') : t('shopOrders.rejectPayment'),
            type: isConfirm ? 'info' : 'danger',
            onConfirm: async () => {
                closeConfirmDialog()
                await handlePaymentDecision(decision)
            },
        })
    }

    const handleDeleteOrder = (orderId) => {
        void orderId
        toast.info('Delete order API is not available yet')
    }

    const handleCancelOrder = (orderId) => {
        setConfirmDialog({
            show: true,
            title: t('shopOrders.cancelOrder'),
            message: t('shopOrders.cancelMessage'),
            type: 'warning',
            onConfirm: async () => {
                const order = orders.find((item) => item.id === orderId)
                if (order) await handleStatusChange(order, 'cancelled')
                closeConfirmDialog()
            },
        })
    }

    const handleExportOrders = () => {
        toast.info('Export is disabled while using live backend orders')
    }

    const handleResetOrders = () => {
        loadShopOrders()
    }

    const openCheckInFlow = async (order) => {
        if (order?.status !== 'at-store') {
            toast.warning(t('shopOrders.inspectionRequiresAtStore'))
            return
        }

        const orderId = order.apiId || String(order.id || '').replace(/\D/g, '')
        setSelectedOrder(order)
        setShowCheckIn(true)
        setInspection(null)
        setInspectionLoadError('')
        setInspectionAction('')
        setCheckinForm({ items: mapInspectionItems(order) })

        if (!orderId) {
            setInspectionLoadError(t('shopOrders.inspectionUnavailable'))
            return
        }

        setIsLoadingInspection(true)
        const [detailResult, inspectionResult] = await Promise.allSettled([
            getShopOwnerOrderDetail(orderId),
            getShopOwnerOrderInspection(orderId),
        ])

        const detail = detailResult.status === 'fulfilled'
            ? { ...order, ...detailResult.value, apiId: orderId }
            : order

        setSelectedOrder(detail)

        if (inspectionResult.status === 'fulfilled') {
            setInspection(inspectionResult.value)
            setCheckinForm({ items: mapInspectionItems(detail, inspectionResult.value) })
        } else {
            setCheckinForm({ items: mapInspectionItems(detail) })
            if (inspectionResult.reason?.status !== 404) {
                setInspectionLoadError(inspectionResult.reason?.message || t('shopOrders.inspectionLoadFailed'))
            }
        }

        if (detailResult.status === 'rejected') {
            setInspectionLoadError((current) => current || detailResult.reason?.message || t('shopOrders.inspectionLoadFailed'))
        }

        setIsLoadingInspection(false)
    }

    const buildInspectionItems = () => {
        const items = checkinForm.items || []

        if (items.length === 0) {
            toast.warning(t('shopOrders.inspectionUnavailable'))
            return null
        }

        if (items.some((item) => !Number.isInteger(Number(item.orderItemId)) || Number(item.orderItemId) <= 0)) {
            toast.error(t('shopOrders.inspectionItemsUnavailable'))
            return null
        }

        if (items.some((item) => !Number.isFinite(Number(item.actualWeight)) || Number(item.actualWeight) <= 0)) {
            toast.warning(t('shopOrders.requiredCheckin'))
            return null
        }

        return items.map((item) => ({
            orderItemId: Number(item.orderItemId),
            actualWeight: Number(item.actualWeight),
            note: item.note?.trim() || '',
        }))
    }

    const applyInspectionResponse = (response) => {
        setInspection(response)
        setCheckinForm({ items: mapInspectionItems(selectedOrder, response) })
    }

    const handleSaveInspectionDraft = async () => {
        const orderId = selectedOrder?.apiId || String(selectedOrder?.id || '').replace(/\D/g, '')
        const items = buildInspectionItems()
        if (!orderId || !items) return

        setInspectionAction('draft')
        try {
            applyInspectionResponse(await saveShopOwnerOrderInspectionDraft(orderId, items))
            toast.success(t('shopOrders.inspectionSaved'))
        } catch (error) {
            toast.error(error?.message || t('shopOrders.inspectionSaveFailed'))
        } finally {
            setInspectionAction('')
        }
    }

    const handleSubmitInspection = async () => {
        const orderId = selectedOrder?.apiId || String(selectedOrder?.id || '').replace(/\D/g, '')
        const items = buildInspectionItems()
        if (!orderId || !items) return

        setInspectionAction('submit')
        try {
            applyInspectionResponse(await submitShopOwnerOrderInspection(orderId, items))
            await loadShopOrders()
            setShowCheckIn(false)
            toast.success(t('shopOrders.inspectionSubmitted'))
        } catch (error) {
            toast.error(error?.message || t('shopOrders.inspectionSubmitFailed'))
        } finally {
            setInspectionAction('')
        }
    }

    const handleStatusChange = async (order, newStatus) => {
        const orderId = order.apiId || String(order.id || '').replace(/\D/g, '')
        if (!orderId) {
            toast.error('Missing backend order id')
            return
        }

        const statusTimeFields = {
            washing: 'checkinTime',
            drying: 'dryingStartTime',
            ironing: 'ironingStartTime',
            ready: 'completedTime',
            delivering: 'deliveryStartTime',
            completed: 'deliveredTime',
        }
        const timeField = statusTimeFields[newStatus]
        const updatedOrder = {
            ...order,
            status: newStatus,
            ...(timeField ? { [timeField]: order[timeField] || makeTimestamp() } : {}),
        }

        setUpdatingOrderId(orderId)
        try {
            await updateShopOwnerOrderStatus(orderId, newStatus)
            setOrders(orders.map(item => item.id === order.id ? updatedOrder : item))
            setSelectedOrder(updatedOrder)
            await loadShopOrders()
            toast.success(t('shopOrders.statusUpdated').replace('{id}', order.id).replace('{status}', statusLabel(newStatus)))
        } catch (error) {
            toast.error(error?.message || 'Could not update order status')
        } finally {
            setUpdatingOrderId(null)
        }
    }

    const handleNextAction = (order) => {
        const action = getShopOrderAction(order)
        if (!action) return

        if (action.type === 'inspection') {
            openCheckInFlow(order)
            return
        }

        handleStatusChange(order, action.status)
    }

    const renderStatusPill = (status) => {
        const tone = getOrderStatusMeta(status).tone
        return <span className={`shop-order-status-pill tone-${tone}`}>{statusLabel(status)}</span>
    }

    const timeline = selectedOrder ? [
        { label: t('shopOrders.orderReceived'), value: selectedOrder.pickupTime, done: true },
        { label: t('shopOrders.checkedInLabel'), value: selectedOrder.checkinTime, done: Boolean(selectedOrder.checkinTime) },
        { label: t('shopOrders.completed'), value: selectedOrder.completedTime, done: Boolean(selectedOrder.completedTime) },
        { label: t('shopOrders.deliveryStarted'), value: selectedOrder.deliveryStartTime, done: Boolean(selectedOrder.deliveryStartTime) },
        { label: t('shopOrders.delivered'), value: selectedOrder.deliveredTime, done: Boolean(selectedOrder.deliveredTime) },
    ] : []

    const renderOrderForm = (form, setForm, isEdit = false) => (
        <div className="shop-order-form-grid">
            <label>
                <span>{t('shopOrders.customerName')}</span>
                <input value={form.customer || ''} onChange={(event) => setForm({ ...form, customer: event.target.value })} />
            </label>
            <label>
                <span>{t('shopOrders.phoneNumber')}</span>
                <input value={form.phone || ''} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            </label>
            <label>
                <span>{t('shopOrders.serviceType')}</span>
                <select value={form.service || SERVICE_OPTIONS[0]} onChange={(event) => setForm({ ...form, service: event.target.value })}>
                    {SERVICE_OPTIONS.map(service => <option value={service} key={service}>{service}</option>)}
                </select>
            </label>
            {isEdit && (
                <label>
                    <span>{t('shopOrders.status')}</span>
                    <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                        {STATUS_OPTIONS.map(status => <option value={status} key={status}>{statusLabel(status)}</option>)}
                    </select>
                </label>
            )}
            <label>
                <span>{t('shopOrders.estimatedWeight')}</span>
                <input value={form.estimatedWeight || ''} onChange={(event) => setForm({ ...form, estimatedWeight: event.target.value })} />
            </label>
            {isEdit && (
                <label>
                    <span>{t('shopOrders.actualWeight')}</span>
                    <input value={form.actualWeight || ''} onChange={(event) => setForm({ ...form, actualWeight: event.target.value })} />
                </label>
            )}
            <label>
                <span>{t('shopOrders.estimatedPrice')}</span>
                <input
                    value={(form.estimatedPrice || '').replace('đ', '')}
                    onChange={(event) => setForm({ ...form, estimatedPrice: `${formatPriceInput(event.target.value)}${isEdit ? 'đ' : ''}` })}
                />
            </label>
            {isEdit && (
                <label>
                    <span>{t('shopOrders.actualPrice')}</span>
                    <input
                        value={(form.actualPrice || '').replace('đ', '')}
                        onChange={(event) => setForm({ ...form, actualPrice: `${formatPriceInput(event.target.value)}đ` })}
                    />
                </label>
            )}
            <label className="shop-order-form-wide">
                <span>{t('shopOrders.notes')}</span>
                <textarea rows="3" value={form.notes || ''} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </label>
        </div>
    )

    return (
        <div className="shop-orders-page">
            <header className="shop-orders-header">
                <div>
                    <span className="shop-orders-eyebrow">{t('shopOrders.eyebrow')}</span>
                    <h1>{t('shopOrders.title')}</h1>
                    <p>{t('shopOrders.subtitle')}</p>
                </div>
                <div className="shop-orders-actions">
                    <button type="button" className="shop-orders-ghost-btn" onClick={handleExportOrders} disabled={isLoadingOrders}>
                        <Download size={16} strokeWidth={1.9} />
                        {t('shopOrders.export')}
                    </button>
                    <button type="button" className="shop-orders-ghost-btn" onClick={handleResetOrders} disabled={isLoadingOrders}>
                        <RotateCcw size={16} strokeWidth={1.9} />
                        {t('shopOrders.reset')}
                    </button>
                    <button type="button" className="shop-orders-primary-btn" onClick={() => toast.info('Create order API for shop owner is not available yet')} disabled={isLoadingOrders}>
                        <Plus size={16} strokeWidth={1.9} />
                        {t('shopOrders.newOrder')}
                    </button>
                </div>
            </header>

            <section className="shop-orders-kpis">
                {queueCards.map(({ key, label, value, Icon, tone }) => (
                    <button
                        type="button"
                        className={`shop-orders-kpi tone-${tone}${activeTab === key ? ' active' : ''}`}
                        key={key}
                        onClick={() => setActiveTab(key)}
                    >
                        <span className="shop-orders-kpi-icon">{createElement(Icon, { size: 18, strokeWidth: 1.9 })}</span>
                        <span>{label}</span>
                        <strong>{value}</strong>
                    </button>
                ))}
                <article className="shop-orders-kpi tone-red passive">
                    <span className="shop-orders-kpi-icon"><AlertTriangle size={18} strokeWidth={1.9} /></span>
                    <span>{t('shopOrders.paymentPending')}</span>
                    <strong>{paymentPendingCount}</strong>
                </article>
            </section>

            <section className="shop-orders-workspace">
                <article className="shop-orders-table-card">
                    <div className="shop-orders-toolbar">
                        <label className="shop-orders-search">
                            <Search size={17} strokeWidth={1.9} />
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder={t('shopOrders.searchPlaceholder')}
                            />
                        </label>
                        <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)} aria-label={t('shopOrders.payment')}>
                            <option value="all">{t('shopOrders.allPayments')}</option>
                            <option value="paid">{t('shopOrders.paid')}</option>
                            <option value="pending">{t('shopOrders.pending')}</option>
                        </select>
                        <button
                            type="button"
                            className="shop-orders-clear-btn"
                            onClick={() => {
                                setSearchTerm('')
                                setPaymentFilter('all')
                                setActiveTab('all')
                            }}
                        >
                            {t('shopOrders.clearFilters')}
                        </button>
                    </div>

                    <div className="shop-orders-table-meta">
                        <div>
                            <span className="shop-orders-eyebrow">{t('shopOrders.liveQueue')}</span>
                            <h2>{isLoadingOrders ? '...' : filteredOrders.length} {t('shopOrders.results')}</h2>
                            {orderLoadError && <span>{orderLoadError}</span>}
                        </div>
                    </div>

                    <div className="shop-orders-table-wrap">
                        <table className="shop-orders-table">
                            <thead>
                                <tr>
                                    <th>{t('shopOrders.orderId')}</th>
                                    <th>{t('shopOrders.customer')}</th>
                                    <th>{t('shopOrders.service')}</th>
                                    <th>{t('shopOrders.status')}</th>
                                    <th>{t('shopOrders.pickup')}</th>
                                    <th>{t('shopOrders.payment')}</th>
                                    <th>{t('shopOrders.nextAction')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="shop-orders-empty">
                                            <PackageSearch size={26} strokeWidth={1.8} />
                                            <strong>{t('shopOrders.noOrders')}</strong>
                                            <span>{t('shopOrders.noOrdersHint')}</span>
                                        </td>
                                    </tr>
                                )}
                                {filteredOrders.map(order => (
                                    <tr key={order.id} className={selectedOrder?.id === order.id ? 'selected' : ''}>
                                        <td>
                                            <button type="button" className="shop-orders-id-btn" onClick={() => selectOrder(order)}>
                                                {order.id}
                                            </button>
                                            <span className={`shop-orders-priority ${order.priority === 'high' ? 'high' : ''}`}>
                                                {priorityLabel(order.priority)}
                                            </span>
                                        </td>
                                        <td>
                                            <strong>{order.customer}</strong>
                                            <span>{order.phone}</span>
                                        </td>
                                        <td>
                                            <strong>{order.service}</strong>
                                            <span>{order.actualWeight || `~${order.estimatedWeight}`}</span>
                                        </td>
                                        <td>{renderStatusPill(order.status)}</td>
                                        <td className="shop-orders-time">{order.pickupTime}</td>
                                        <td>
                                            <span className={`shop-orders-payment ${order.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
                                                {paymentLabel(order.paymentStatus)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="shop-orders-row-actions">
                                                <button
                                                    type="button"
                                                    className="shop-orders-next-btn"
                                                    disabled={updatingOrderId === (order.apiId || String(order.id || '').replace(/\D/g, '')) || !getShopOrderAction(order)}
                                                    onClick={() => handleNextAction(order)}
                                                >
                                                    {actionLabel(order)}
                                                    <ChevronRight size={15} strokeWidth={2} />
                                                </button>
                                                <button type="button" className="shop-orders-icon-btn" aria-label={t('shopOrders.view')} onClick={() => selectOrder(order)}>
                                                    <Eye size={15} strokeWidth={1.9} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </article>

                <aside className={`shop-orders-drawer${selectedOrder ? ' open' : ''}`}>
                    {selectedOrder ? (
                        <>
                            <div className="shop-orders-drawer-header">
                                <div>
                                    <span className="shop-orders-eyebrow">{t('shopOrders.details')}</span>
                                    <h2>{selectedOrder.id}</h2>
                                </div>
                                <button type="button" aria-label={t('shopOrders.closeDetails')} onClick={() => setSelectedOrder(null)}>
                                    <X size={18} strokeWidth={1.9} />
                                </button>
                            </div>

                            <div className="shop-orders-drawer-status">
                                {renderStatusPill(selectedOrder.status)}
                                <button
                                    type="button"
                                    disabled={updatingOrderId === (selectedOrder.apiId || String(selectedOrder.id || '').replace(/\D/g, '')) || !getShopOrderAction(selectedOrder)}
                                    onClick={() => handleNextAction(selectedOrder)}
                                >
                                    {actionLabel(selectedOrder)}
                                </button>
                            </div>

                            <section className="shop-orders-detail-section">
                                <h3>{t('shopOrders.customerInfo')}</h3>
                                <div className="shop-orders-detail-grid">
                                    <span>{t('shopOrders.customer')}</span><strong>{selectedOrder.customer}</strong>
                                    <span>{t('shopOrders.contact')}</span><strong>{selectedOrder.phone}</strong>
                                    <span>{t('shopOrders.address')}</span><strong>{selectedOrder.address || t('shopOrders.notYet')}</strong>
                                </div>
                            </section>

                            <section className="shop-orders-detail-section">
                                <h3>{t('shopOrders.paymentInfo')}</h3>
                                <div className="shop-orders-price-grid">
                                    <div><span>{t('shopOrders.estimatedWeight')}</span><strong>{selectedOrder.estimatedWeight}</strong></div>
                                    <div><span>{t('shopOrders.actualWeight')}</span><strong>{selectedOrder.actualWeight || t('shopOrders.notYet')}</strong></div>
                                    <div><span>{t('shopOrders.estimatedPrice')}</span><strong>{selectedOrder.estimatedPrice}</strong></div>
                                    <div><span>{t('shopOrders.actualPrice')}</span><strong>{selectedOrder.actualPrice || t('shopOrders.notYet')}</strong></div>
                                </div>

                                {selectedOrder.payment ? (
                                    <div className="shop-payment-record">
                                        <div className="shop-payment-record-head">
                                            <div>
                                                <span>{t('shopOrders.paymentRecord')}</span>
                                                <strong>{selectedOrder.payment.transactionReference || `#${selectedOrder.payment.paymentId}`}</strong>
                                            </div>
                                            <span className={`shop-payment-status status-${String(selectedOrder.payment.status || '').toLowerCase()}`}>
                                                {paymentRecordStatusLabel(selectedOrder.payment.status)}
                                            </span>
                                        </div>

                                        <div className="shop-payment-detail-grid">
                                            <span>{t('shopOrders.paymentMethod')}</span><strong>{selectedOrder.payment.paymentMethod || t('shopOrders.notYet')}</strong>
                                            <span>{t('shopOrders.paymentAmount')}</span><strong>{formatPaymentAmount(selectedOrder.payment.amount)}</strong>
                                            <span>{t('shopOrders.originalAmount')}</span><strong>{formatPaymentAmount(selectedOrder.payment.originalAmount)}</strong>
                                            <span>{t('shopOrders.discountAmount')}</span><strong>{formatPaymentAmount(selectedOrder.payment.discountAmount)}</strong>
                                            {selectedOrder.payment.voucherCode && <><span>{t('shopOrders.voucherCode')}</span><strong>{selectedOrder.payment.voucherCode}</strong></>}
                                            {selectedOrder.payment.transferCode && <><span>{t('shopOrders.transferCode')}</span><strong>{selectedOrder.payment.transferCode}</strong></>}
                                            {selectedOrder.payment.customerReportedPaidAt && <><span>{t('shopOrders.reportedAt')}</span><strong>{formatPaymentDate(selectedOrder.payment.customerReportedPaidAt)}</strong></>}
                                            {selectedOrder.payment.customerReportNote && <><span>{t('shopOrders.customerNote')}</span><strong>{selectedOrder.payment.customerReportNote}</strong></>}
                                        </div>

                                        {selectedOrder.payment.paymentProofUrl && (
                                            <a
                                                className="shop-payment-proof"
                                                href={selectedOrder.payment.paymentProofUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <img src={selectedOrder.payment.paymentProofUrl} alt={t('shopOrders.paymentProof')} />
                                                <span>{t('shopOrders.openPaymentProof')} <ExternalLink size={14} strokeWidth={1.9} /></span>
                                            </a>
                                        )}

                                        {selectedOrder.payment.status === 'CUSTOMER_REPORTED_PAID' && (
                                            <div className="shop-payment-review-form">
                                                <label>
                                                    <span>{t('shopOrders.confirmationNote')}</span>
                                                    <textarea
                                                        rows="2"
                                                        value={paymentConfirmationNote}
                                                        placeholder={t('shopOrders.confirmationNotePlaceholder')}
                                                        onChange={(event) => setPaymentConfirmationNote(event.target.value)}
                                                    />
                                                </label>
                                                <label>
                                                    <span>{t('shopOrders.rejectReason')}</span>
                                                    <textarea
                                                        rows="2"
                                                        value={paymentRejectionReason}
                                                        placeholder={t('shopOrders.rejectReasonPlaceholder')}
                                                        onChange={(event) => setPaymentRejectionReason(event.target.value)}
                                                    />
                                                </label>
                                                <div className="shop-payment-review-actions">
                                                    <button
                                                        type="button"
                                                        className="reject"
                                                        disabled={Boolean(paymentAction)}
                                                        onClick={() => requestPaymentDecision('reject')}
                                                    >
                                                        {paymentAction === 'reject' ? t('common.loading') : t('shopOrders.rejectPayment')}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="confirm"
                                                        disabled={Boolean(paymentAction)}
                                                        onClick={() => requestPaymentDecision('confirm')}
                                                    >
                                                        {paymentAction === 'confirm' ? t('common.loading') : t('shopOrders.confirmPayment')}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="shop-orders-note shop-payment-empty">{t('shopOrders.noPaymentRecord')}</p>
                                )}
                            </section>

                            <section className="shop-orders-detail-section">
                                <h3>{t('shopOrders.items')}</h3>
                                <div className="shop-orders-items">
                                    {(selectedOrder.items || []).map((item, index) => (
                                        <div key={`${item.type}-${index}`}>
                                            <span>{item.type} x {item.quantity}</span>
                                            <small>{item.condition}</small>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="shop-orders-detail-section">
                                <h3>{t('shopOrders.timeline')}</h3>
                                <div className="shop-orders-timeline">
                                    {timeline.map(item => (
                                        <div className={item.done ? 'done' : ''} key={item.label}>
                                            <span>{item.done ? <Check size={13} strokeWidth={2.1} /> : <Clock size={13} strokeWidth={2} />}</span>
                                            <div>
                                                <strong>{item.label}</strong>
                                                <small>{item.value || t('shopOrders.notYet')}</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {selectedOrder.notes && (
                                <section className="shop-orders-detail-section">
                                    <h3>{t('shopOrders.notes')}</h3>
                                    <p className="shop-orders-note">{selectedOrder.notes}</p>
                                </section>
                            )}

                            <div className="shop-orders-drawer-actions">
                                <button type="button" onClick={() => toast.info('Edit order API is not available yet')}>
                                    <Pencil size={15} strokeWidth={1.9} />
                                    {t('shopOrders.edit')}
                                </button>
                                <button
                                    type="button"
                                    className="danger"
                                    disabled={!['pending', 'confirmed'].includes(selectedOrder.status)}
                                    onClick={() => handleCancelOrder(selectedOrder.id)}
                                >
                                    {t('shopOrders.cancelOrder')}
                                </button>
                                <button type="button" className="danger ghost" onClick={() => handleDeleteOrder(selectedOrder.id)} disabled>
                                    <Trash2 size={15} strokeWidth={1.9} />
                                    {t('shopOrders.delete')}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="shop-orders-drawer-empty">
                            <PackageCheck size={34} strokeWidth={1.7} />
                            <strong>{t('shopOrders.selectOrder')}</strong>
                            <span>{t('shopOrders.selectOrderHint')}</span>
                        </div>
                    )}
                </aside>
            </section>

            {showCheckIn && selectedOrder && (
                <div className="shop-orders-modal-overlay" onClick={() => setShowCheckIn(false)}>
                    <div className="shop-orders-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="shop-orders-modal-header">
                            <div>
                                <span className="shop-orders-eyebrow">{t('shopOrders.checkin')}</span>
                                <h2>{selectedOrder.id}</h2>
                            </div>
                            <button type="button" aria-label={t('common.close')} onClick={() => setShowCheckIn(false)}><X size={18} /></button>
                        </div>
                        <div className="shop-orders-modal-body">
                            <div className="shop-orders-checkin-summary">
                                <div><span>{t('shopOrders.customer')}</span><strong>{selectedOrder.customer}</strong></div>
                                <div><span>{t('shopOrders.service')}</span><strong>{selectedOrder.service}</strong></div>
                                <div><span>{t('shopOrders.estimatedWeight')}</span><strong>{selectedOrder.estimatedWeight}</strong></div>
                                <div><span>{t('shopOrders.estimatedPrice')}</span><strong>{selectedOrder.estimatedPrice}</strong></div>
                            </div>
                            {isLoadingInspection && <p className="shop-orders-note">{t('shopOrders.inspectionLoading')}</p>}
                            {inspectionLoadError && <p className="shop-orders-note">{inspectionLoadError}</p>}
                            {!isLoadingInspection && (
                                <>
                                    {inspection && (
                                        <div className="shop-orders-checkin-summary">
                                            {inspection.estimatedAmount !== undefined && <div><span>{t('shopOrders.inspectionEstimatedAmount')}</span><strong>{formatInspectionAmount(inspection.estimatedAmount)}</strong></div>}
                                            {inspection.actualAmount !== undefined && <div><span>{t('shopOrders.inspectionActualAmount')}</span><strong>{formatInspectionAmount(inspection.actualAmount)}</strong></div>}
                                        </div>
                                    )}
                                    <div className="shop-orders-checkin-items">
                                        {(checkinForm.items || []).map((item, index) => (
                                            <div key={item.key} className="shop-order-form-grid">
                                                <label>
                                                    <span>{item.serviceName}{item.quantity ? ` x ${item.quantity}` : ''}</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.actualWeight}
                                                        placeholder={t('shopOrders.actualWeight')}
                                                        onChange={(event) => setCheckinForm((current) => ({
                                                            ...current,
                                                            items: current.items.map((currentItem, currentIndex) => currentIndex === index
                                                                ? { ...currentItem, actualWeight: event.target.value }
                                                                : currentItem),
                                                        }))}
                                                    />
                                                </label>
                                                <label>
                                                    <span>{t('shopOrders.inspectionItemNote')}</span>
                                                    <input
                                                        value={item.note}
                                                        onChange={(event) => setCheckinForm((current) => ({
                                                            ...current,
                                                            items: current.items.map((currentItem, currentIndex) => currentIndex === index
                                                                ? { ...currentItem, note: event.target.value }
                                                                : currentItem),
                                                        }))}
                                                    />
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="shop-orders-modal-footer">
                            <button type="button" className="shop-orders-ghost-btn" onClick={() => setShowCheckIn(false)}>{t('common.cancel')}</button>
                            <button type="button" className="shop-orders-ghost-btn" disabled={isLoadingInspection || Boolean(inspectionAction)} onClick={handleSaveInspectionDraft}>{inspectionAction === 'draft' ? t('common.loading') : t('shopOrders.saveDraft')}</button>
                            <button type="button" className="shop-orders-primary-btn" disabled={isLoadingInspection || Boolean(inspectionAction)} onClick={handleSubmitInspection}>{inspectionAction === 'submit' ? t('common.loading') : t('shopOrders.submitInspection')}</button>
                        </div>
                    </div>
                </div>
            )}

            {showNewOrderModal && (
                <div className="shop-orders-modal-overlay" onClick={() => setShowNewOrderModal(false)}>
                    <div className="shop-orders-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="shop-orders-modal-header">
                            <div>
                                <span className="shop-orders-eyebrow">{t('shopOrders.newOrder')}</span>
                                <h2>{t('shopOrders.createOrder')}</h2>
                            </div>
                            <button type="button" aria-label={t('common.close')} onClick={() => setShowNewOrderModal(false)}><X size={18} /></button>
                        </div>
                        <div className="shop-orders-modal-body">
                            {renderOrderForm(newOrderForm, setNewOrderForm)}
                        </div>
                        <div className="shop-orders-modal-footer">
                            <button type="button" className="shop-orders-ghost-btn" onClick={() => setShowNewOrderModal(false)}>{t('common.cancel')}</button>
                            <button type="button" className="shop-orders-primary-btn" onClick={handleCreateOrder}>{t('shopOrders.createOrder')}</button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && editingOrder && (
                <div className="shop-orders-modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="shop-orders-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="shop-orders-modal-header">
                            <div>
                                <span className="shop-orders-eyebrow">{t('shopOrders.edit')}</span>
                                <h2>{editingOrder.id}</h2>
                            </div>
                            <button type="button" aria-label={t('common.close')} onClick={() => setShowEditModal(false)}><X size={18} /></button>
                        </div>
                        <div className="shop-orders-modal-body">
                            {renderOrderForm(editingOrder, setEditingOrder, true)}
                        </div>
                        <div className="shop-orders-modal-footer">
                            <button type="button" className="shop-orders-ghost-btn" onClick={() => setShowEditModal(false)}>{t('common.cancel')}</button>
                            <button type="button" className="shop-orders-primary-btn" onClick={handleSaveEdit}>{t('shopOrders.saveChanges')}</button>
                        </div>
                    </div>
                </div>
            )}

            {confirmDialog.show && (
                <ConfirmDialog
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    type={confirmDialog.type}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={closeConfirmDialog}
                    confirmText={confirmDialog.confirmText || t('common.ok')}
                    cancelText={t('common.cancel')}
                />
            )}
        </div>
    )
}

export default ShopOrderManagement
