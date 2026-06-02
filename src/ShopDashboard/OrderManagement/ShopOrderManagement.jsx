import { createElement, useEffect, useState } from 'react'
import './ShopOrderManagement.css'
import {
    AlertTriangle,
    Check,
    ChevronRight,
    Clock,
    Download,
    Eye,
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
import { orders as ordersData } from '../../data'
import { clearData, exportOrders, loadOrders, saveOrders } from '../../utils/dataManager'
import toast from '../../utils/toast'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import { getNextOrderStatusInfo, getOrderStatusMeta } from '../../components/OrderStatusBadge/OrderStatusBadge'
import { useTranslation } from '../../shared/lib/i18n'

const PRODUCTION_STATUSES = ['washing', 'drying', 'ironing']
const STATUS_OPTIONS = ['pending-checkin', 'washing', 'drying', 'ironing', 'ready', 'delivering', 'completed', 'cancelled']
const SERVICE_OPTIONS = ['Wash & Dry', 'Dry Clean', 'Express Wash', 'Wash & Iron', 'Iron Only']
const CONDITION_OPTIONS = ['Good', 'Minor stains', 'Heavy stains', 'Damaged']

const emptyOrderForm = {
    customer: '',
    phone: '',
    service: 'Wash & Dry',
    estimatedWeight: '',
    estimatedPrice: '',
    shipper: '',
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

function ShopOrderManagement() {
    const { t } = useTranslation()
    const [orders, setOrders] = useState(() => loadOrders(ordersData))
    const [activeTab, setActiveTab] = useState('all')
    const [paymentFilter, setPaymentFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showCheckIn, setShowCheckIn] = useState(false)
    const [showNewOrderModal, setShowNewOrderModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingOrder, setEditingOrder] = useState(null)
    const [newOrderForm, setNewOrderForm] = useState(emptyOrderForm)
    const [checkinForm, setCheckinForm] = useState({
        actualWeight: '',
        itemConditions: {},
        notes: '',
        finalPrice: '',
    })
    const [confirmDialog, setConfirmDialog] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null,
        type: 'warning',
    })

    useEffect(() => {
        saveOrders(orders)
    }, [orders])

    const pendingCheckinCount = orders.filter(order => order.status === 'pending-checkin').length
    const inProgressCount = orders.filter(order => PRODUCTION_STATUSES.includes(order.status)).length
    const readyCount = orders.filter(order => order.status === 'ready').length
    const paymentPendingCount = orders.filter(order => order.paymentStatus !== 'paid').length

    const statusLabel = (status) => {
        const labels = {
            'pending-checkin': t('shopOrders.statusPendingCheckin'),
            washing: t('shopOrders.statusWashing'),
            drying: t('shopOrders.statusDrying'),
            ironing: t('shopOrders.statusIroning'),
            ready: t('shopOrders.statusReady'),
            delivering: t('shopOrders.statusDelivering'),
            completed: t('shopOrders.statusCompleted'),
            cancelled: t('shopOrders.statusCancelled'),
        }
        return labels[status] || status
    }

    const priorityLabel = (priority) => priority === 'high' ? t('shopOrders.high') : t('shopOrders.normal')
    const paymentLabel = (paymentStatus) => paymentStatus === 'paid' ? t('shopOrders.paid') : t('shopOrders.pending')

    const actionLabel = (order) => {
        if (order.status === 'pending-checkin') return t('shopOrders.acceptOrder')
        const next = getNextOrderStatusInfo(order.status)
        const labels = {
            drying: t('shopOrders.moveToDrying'),
            ironing: t('shopOrders.moveToIroning'),
            ready: t('shopOrders.markReady'),
            delivering: t('shopOrders.startDelivery'),
            completed: t('shopOrders.completeOrder'),
        }
        return next ? labels[next.status] : t('shopOrders.noAction')
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
            (activeTab === 'progress' && PRODUCTION_STATUSES.includes(order.status)) ||
            (activeTab === 'pending' && order.status === 'pending-checkin') ||
            (activeTab === 'ready' && order.status === 'ready')

        const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter
        return matchesSearch && matchesStatus && matchesPayment
    })

    const queueCards = [
        { key: 'all', label: t('shopOrders.allOrders'), value: orders.length, Icon: PackageSearch, tone: 'navy' },
        { key: 'pending', label: t('shopOrders.pendingCheckin'), value: pendingCheckinCount, Icon: Clock, tone: 'amber' },
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
            status: 'pending-checkin',
            shipperId: `SHP-${String(1000 + orders.length + 1)}`,
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

    const handleEditOrder = (order) => {
        setEditingOrder({ ...order })
        setShowEditModal(true)
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

    const handleDeleteOrder = (orderId) => {
        setConfirmDialog({
            show: true,
            title: t('shopOrders.deleteOrder'),
            message: t('shopOrders.deleteMessage'),
            type: 'danger',
            onConfirm: () => {
                setOrders(orders.filter(order => order.id !== orderId))
                setSelectedOrder(null)
                toast.success(t('shopOrders.orderDeleted').replace('{id}', orderId))
                closeConfirmDialog()
            },
        })
    }

    const handleCancelOrder = (orderId) => {
        setConfirmDialog({
            show: true,
            title: t('shopOrders.cancelOrder'),
            message: t('shopOrders.cancelMessage'),
            type: 'warning',
            onConfirm: () => {
                const updatedOrders = orders.map(order => order.id === orderId ? { ...order, status: 'cancelled' } : order)
                setOrders(updatedOrders)
                setSelectedOrder(null)
                toast.warning(t('shopOrders.orderCancelled').replace('{id}', orderId))
                closeConfirmDialog()
            },
        })
    }

    const handleExportOrders = () => {
        if (exportOrders(orders)) {
            toast.success(t('shopOrders.exported').replace('{count}', orders.length))
        } else {
            toast.error(t('shopOrders.exportFailed'))
        }
    }

    const handleResetOrders = () => {
        setConfirmDialog({
            show: true,
            title: t('shopOrders.resetOrders'),
            message: t('shopOrders.resetMessage'),
            type: 'warning',
            onConfirm: () => {
                clearData('ORDERS')
                setOrders(ordersData)
                setSelectedOrder(null)
                toast.info(t('shopOrders.resetDone'))
                closeConfirmDialog()
            },
        })
    }

    const openCheckInFlow = (order) => {
        setSelectedOrder(order)
        setShowCheckIn(true)
        setCheckinForm({
            actualWeight: '',
            itemConditions: {},
            notes: order.notes || '',
            finalPrice: formatPriceInput(order.estimatedPrice),
        })
    }

    const handleConfirmCheckin = () => {
        if (!checkinForm.actualWeight || !checkinForm.finalPrice) {
            toast.warning(t('shopOrders.requiredCheckin'))
            return
        }

        const updatedOrder = {
            ...selectedOrder,
            actualWeight: `${checkinForm.actualWeight}kg`,
            actualPrice: `${checkinForm.finalPrice}đ`,
            status: 'washing',
            checkinTime: makeTimestamp(),
            notes: checkinForm.notes || selectedOrder.notes,
            items: selectedOrder.items.map((item, index) => ({
                ...item,
                condition: checkinForm.itemConditions[index] || item.condition,
            })),
        }
        setOrders(orders.map(order => order.id === selectedOrder.id ? updatedOrder : order))
        setSelectedOrder(updatedOrder)
        setShowCheckIn(false)
        toast.success(t('shopOrders.checkedIn').replace('{id}', selectedOrder.id))
    }

    const handleStatusChange = (order, newStatus) => {
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
        setOrders(orders.map(item => item.id === order.id ? updatedOrder : item))
        setSelectedOrder(updatedOrder)
        toast.success(t('shopOrders.statusUpdated').replace('{id}', order.id).replace('{status}', statusLabel(newStatus)))
    }

    const handleNextAction = (order) => {
        if (order.status === 'pending-checkin') {
            openCheckInFlow(order)
            return
        }
        const next = getNextOrderStatusInfo(order.status)
        if (next) handleStatusChange(order, next.status)
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
            <label>
                <span>{t('shopOrders.assignedRunner')}</span>
                <input value={form.shipper || ''} onChange={(event) => setForm({ ...form, shipper: event.target.value })} />
            </label>
            {isEdit && (
                <label>
                    <span>{t('shopOrders.runnerId')}</span>
                    <input value={form.shipperId || ''} onChange={(event) => setForm({ ...form, shipperId: event.target.value })} />
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
                    <button type="button" className="shop-orders-ghost-btn" onClick={handleExportOrders}>
                        <Download size={16} strokeWidth={1.9} />
                        {t('shopOrders.export')}
                    </button>
                    <button type="button" className="shop-orders-ghost-btn" onClick={handleResetOrders}>
                        <RotateCcw size={16} strokeWidth={1.9} />
                        {t('shopOrders.reset')}
                    </button>
                    <button type="button" className="shop-orders-primary-btn" onClick={() => setShowNewOrderModal(true)}>
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
                            <h2>{filteredOrders.length} {t('shopOrders.results')}</h2>
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
                                            <button type="button" className="shop-orders-id-btn" onClick={() => { setSelectedOrder(order); setShowCheckIn(false) }}>
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
                                                    disabled={!getNextOrderStatusInfo(order.status) && order.status !== 'pending-checkin'}
                                                    onClick={() => handleNextAction(order)}
                                                >
                                                    {actionLabel(order)}
                                                    <ChevronRight size={15} strokeWidth={2} />
                                                </button>
                                                <button type="button" className="shop-orders-icon-btn" aria-label={t('shopOrders.view')} onClick={() => { setSelectedOrder(order); setShowCheckIn(false) }}>
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
                                    disabled={!getNextOrderStatusInfo(selectedOrder.status) && selectedOrder.status !== 'pending-checkin'}
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
                                    <span>{t('shopOrders.assignedRunner')}</span><strong>{selectedOrder.shipper || t('shopOrders.notYet')}</strong>
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
                            </section>

                            <section className="shop-orders-detail-section">
                                <h3>{t('shopOrders.items')}</h3>
                                <div className="shop-orders-items">
                                    {selectedOrder.items.map((item, index) => (
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
                                <button type="button" onClick={() => handleEditOrder(selectedOrder)}>
                                    <Pencil size={15} strokeWidth={1.9} />
                                    {t('shopOrders.edit')}
                                </button>
                                <button type="button" className="danger" onClick={() => handleCancelOrder(selectedOrder.id)}>
                                    {t('shopOrders.cancelOrder')}
                                </button>
                                <button type="button" className="danger ghost" onClick={() => handleDeleteOrder(selectedOrder.id)}>
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
                            <div className="shop-order-form-grid">
                                <label>
                                    <span>{t('shopOrders.actualWeight')}</span>
                                    <input type="number" step="0.1" value={checkinForm.actualWeight} onChange={(event) => setCheckinForm({ ...checkinForm, actualWeight: event.target.value })} />
                                </label>
                                <label>
                                    <span>{t('shopOrders.actualPrice')}</span>
                                    <input value={checkinForm.finalPrice} onChange={(event) => setCheckinForm({ ...checkinForm, finalPrice: formatPriceInput(event.target.value) })} />
                                </label>
                            </div>
                            <div className="shop-orders-checkin-items">
                                {selectedOrder.items.map((item, index) => (
                                    <label key={`${item.type}-${index}`}>
                                        <span>{item.type} x {item.quantity}</span>
                                        <select
                                            value={checkinForm.itemConditions[index] || item.condition}
                                            onChange={(event) => setCheckinForm({
                                                ...checkinForm,
                                                itemConditions: { ...checkinForm.itemConditions, [index]: event.target.value },
                                            })}
                                        >
                                            {CONDITION_OPTIONS.map(condition => <option value={condition} key={condition}>{condition}</option>)}
                                        </select>
                                    </label>
                                ))}
                            </div>
                            <label className="shop-orders-textarea-label">
                                <span>{t('shopOrders.notes')}</span>
                                <textarea rows="3" value={checkinForm.notes} onChange={(event) => setCheckinForm({ ...checkinForm, notes: event.target.value })} />
                            </label>
                        </div>
                        <div className="shop-orders-modal-footer">
                            <button type="button" className="shop-orders-ghost-btn" onClick={() => setShowCheckIn(false)}>{t('common.cancel')}</button>
                            <button type="button" className="shop-orders-primary-btn" onClick={handleConfirmCheckin}>{t('shopOrders.confirmCheckin')}</button>
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
                    confirmText={t('common.ok')}
                    cancelText={t('common.cancel')}
                />
            )}
        </div>
    )
}

export default ShopOrderManagement
