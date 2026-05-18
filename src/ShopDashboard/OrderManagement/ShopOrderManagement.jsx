import { useState, useEffect } from 'react'
import './ShopOrderManagement.css'
import {
    ShoppingCart,
    Clock,
    RefreshCw,
    CheckCircle,
    Truck,
    QrCode,
    Search,
    Plus,
    Eye,
    CheckSquare,
    Pencil,
    Trash2,
    Download,
    RotateCcw
} from 'lucide-react'
import { orders as ordersData } from '../../data'
import { loadOrders, saveOrders, exportOrders, clearData } from '../../utils/dataManager'
import toast from '../../utils/toast'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import OrderStatusBadge, {
    getNextOrderStatusInfo,
    getOrderStatusMeta,
} from '../../components/OrderStatusBadge/OrderStatusBadge'
import { useTranslation } from '../../shared/lib/i18n'

function ShopOrderManagement() {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState('all')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showCheckIn, setShowCheckIn] = useState(false)
    const [showNewOrderModal, setShowNewOrderModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingOrder, setEditingOrder] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    // Confirm dialog state
    const [confirmDialog, setConfirmDialog] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null,
        type: 'warning'
    })

    // Check-in form state
    const [checkinForm, setCheckinForm] = useState({
        actualWeight: '',
        itemConditions: {},
        notes: '',
        finalPrice: ''
    })

    // New order form state
    const [newOrderForm, setNewOrderForm] = useState({
        customer: '',
        phone: '',
        service: 'Wash & Dry',
        estimatedWeight: '',
        estimatedPrice: '',
        shipper: '',
        notes: '',
        items: []
    })

    // Initialize orders from localStorage or data file
    const [orders, setOrders] = useState(() => loadOrders(ordersData))

    const serviceOptions = [
        { value: 'Wash & Dry', label: t('shop.serviceOptions.washDry') },
        { value: 'Dry Clean', label: t('shop.serviceOptions.dryClean') },
        { value: 'Express Wash', label: t('shop.serviceOptions.expressWash') },
        { value: 'Wash & Iron', label: t('shop.serviceOptions.washIron') },
        { value: 'Iron Only', label: t('shop.serviceOptions.ironOnly') },
    ]

    const statusOptions = [
        { value: 'pending-checkin', label: t('orderStatus.pendingCheckin') },
        { value: 'washing', label: t('orderStatus.washing') },
        { value: 'drying', label: t('orderStatus.drying') },
        { value: 'ironing', label: t('orderStatus.ironing') },
        { value: 'ready', label: t('orderStatus.readyForDelivery') },
        { value: 'delivering', label: t('orderStatus.outForDelivery') },
        { value: 'completed', label: t('orderStatus.completed') },
        { value: 'cancelled', label: t('orderStatus.cancelled') },
    ]

    // Save orders to localStorage whenever they change
    useEffect(() => {
        saveOrders(orders)
    }, [orders])

    // Calculate dynamic stats
    const pendingCheckinCount = orders.filter(o => o.status === 'pending-checkin').length
    const inProgressCount = orders.filter(o => o.status === 'washing' || o.status === 'drying' || o.status === 'ironing').length
    const readyCount = orders.filter(o => o.status === 'ready').length
    const today = new Date().toISOString().split('T')[0]
    const completedTodayCount = orders.filter(o => {
        if (o.status === 'completed' && o.deliveredTime) {
            return o.deliveredTime.startsWith(today)
        }
        return false
    }).length

    const stats = [
        { label: t('shop.pendingCheckin'), value: String(pendingCheckinCount), icon: Clock, color: '#5492b4' },
        { label: t('shop.inProgress'), value: String(inProgressCount), icon: RefreshCw, color: '#719FC2' },
        { label: t('shop.readyForDelivery'), value: String(readyCount), icon: Truck, color: '#4d9e84' },
        { label: t('shop.completedToday'), value: String(completedTodayCount), icon: CheckCircle, color: '#6b7280' }
    ]

    // Filter orders based on search and tab
    const filteredOrders = orders.filter(order => {
        if (!searchTerm) return true
        return order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.phone.includes(searchTerm)
    })

    const pendingOrders = filteredOrders.filter(o => o.status === 'pending-checkin')
    const inProgressOrders = filteredOrders.filter(o => o.status === 'washing' || o.status === 'drying' || o.status === 'ironing')
    const readyOrders = filteredOrders.filter(o => o.status === 'ready')

    // CRUD Handlers
    const handleCreateOrder = () => {
        if (!newOrderForm.customer || !newOrderForm.phone || !newOrderForm.estimatedWeight) {
            toast.warning(t('shop.toast.fillRequiredFields'))
            return
        }

        const newOrder = {
            id: `#ORD-${10235 + orders.length}`,
            ...newOrderForm,
            estimatedWeight: `${newOrderForm.estimatedWeight}kg`,
            estimatedPrice: `${newOrderForm.estimatedPrice}đ`,
            actualWeight: null,
            actualPrice: null,
            status: 'pending-checkin',
            shipperId: 'SHP-' + Math.floor(1000 + Math.random() * 9000),
            pickupTime: new Date().toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', ''),
            items: newOrderForm.items.length > 0 ? newOrderForm.items : [{ type: 'General', quantity: 1, condition: 'Good' }]
        }

        const updatedOrders = [newOrder, ...orders]
        setOrders(updatedOrders)
        saveOrders(updatedOrders)
        setShowNewOrderModal(false)
        setNewOrderForm({
            customer: '',
            phone: '',
            service: 'Wash & Dry',
            estimatedWeight: '',
            estimatedPrice: '',
            shipper: '',
            notes: '',
            items: []
        })
        toast.success(`${t('shop.order')} ${newOrder.id} ${t('shop.toast.createdSuccessSuffix')}`)
    }

    const handleEditOrder = (order) => {
        setEditingOrder({ ...order })
        setShowEditModal(true)
    }

    const handleSaveEdit = () => {
        if (!editingOrder.customer || !editingOrder.phone) {
            toast.warning(t('shop.toast.customerPhoneRequired'))
            return
        }

        const updatedOrders = orders.map(o => o.id === editingOrder.id ? editingOrder : o)
        setOrders(updatedOrders)
        saveOrders(updatedOrders)
        setShowEditModal(false)
        setEditingOrder(null)
        toast.success(`${t('shop.order')} ${editingOrder.id} ${t('shop.toast.updatedSuccessSuffix')}`)
    }

    const handleDeleteOrder = (orderId) => {
        setConfirmDialog({
            show: true,
            title: t('shop.confirm.deleteOrderTitle'),
            message: t('shop.confirm.deleteOrderMessage'),
            type: 'danger',
            onConfirm: () => {
                const updatedOrders = orders.filter(o => o.id !== orderId)
                setOrders(updatedOrders)
                saveOrders(updatedOrders)
                setSelectedOrder(null)
                toast.success(`${t('shop.order')} ${orderId} ${t('shop.toast.deletedSuccessSuffix')}`)
                setConfirmDialog({ ...confirmDialog, show: false })
            }
        })
    }

    // Export orders to JSON file
    const handleExportOrders = () => {
        if (exportOrders(orders)) {
            toast.success(`${t('shop.toast.exportedPrefix')} ${orders.length} ${t('shop.toast.exportedSuffix')}`)
        } else {
            toast.error(t('shop.toast.exportFailed'))
        }
    }

    // Reset orders to default data
    const handleResetOrders = () => {
        setConfirmDialog({
            show: true,
            title: t('shop.confirm.resetOrdersTitle'),
            message: t('shop.confirm.resetOrdersMessage'),
            type: 'warning',
            onConfirm: () => {
                clearData('ORDERS')
                setOrders(ordersData)
                saveOrders(ordersData)
                toast.info(t('shop.toast.resetSuccess'))
                setConfirmDialog({ ...confirmDialog, show: false })
            }
        })
    }

    // Check-in Handlers
    const handleConfirmCheckin = () => {
        if (!checkinForm.actualWeight) {
            toast.warning(t('shop.toast.pleaseEnterActualWeight'))
            return
        }
        if (!checkinForm.finalPrice) {
            toast.warning(t('shop.toast.pleaseConfirmFinalPrice'))
            return
        }

        const updatedOrder = {
            ...selectedOrder,
            actualWeight: `${checkinForm.actualWeight}kg`,
            actualPrice: `${checkinForm.finalPrice}đ`,
            status: 'washing',
            checkinTime: new Date().toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', ''),
            notes: checkinForm.notes || selectedOrder.notes,
            items: selectedOrder.items.map((item, idx) => ({
                ...item,
                condition: checkinForm.itemConditions[idx] || item.condition
            }))
        }

        const updatedOrders = orders.map(o => o.id === selectedOrder.id ? updatedOrder : o)
        setOrders(updatedOrders)
        saveOrders(updatedOrders)
        setSelectedOrder(null)
        setShowCheckIn(false)
        setCheckinForm({
            actualWeight: '',
            itemConditions: {},
            notes: '',
            finalPrice: ''
        })
        toast.success(`${t('shop.order')} ${selectedOrder.id} ${t('shop.toast.checkedInSuccessSuffix')}`)
    }

    const handleCheckinChange = (field, value) => {
        setCheckinForm(prev => ({ ...prev, [field]: value }))
    }

    // Format number with thousand separators (e.g., 150000 → 150,000)
    const formatPriceInput = (value) => {
        const digits = String(value).replace(/\D/g, '')
        if (!digits) return ''
        return Number(digits).toLocaleString('en-US')
    }

    const handleItemConditionChange = (index, condition) => {
        setCheckinForm(prev => ({
            ...prev,
            itemConditions: { ...prev.itemConditions, [index]: condition }
        }))
    }

    const openCheckInFlow = (order) => {
        setSelectedOrder(order)
        setShowCheckIn(true)
        setCheckinForm({
            actualWeight: '',
            itemConditions: {},
            notes: order.notes || '',
            finalPrice: formatPriceInput(order.estimatedPrice)
        })
    }

    const handleScanQr = () => {
        setActiveTab('pending')

        if (pendingOrders.length === 0) {
            toast.info(t('shop.toast.noPendingCheckinOrders'))
            return
        }

        openCheckInFlow(pendingOrders[0])
        toast.success(`${t('shop.toast.readyToScanPrefix')} ${pendingOrders[0].id}`)
    }

    // Status Management
    const handleStatusChange = (orderId, newStatus) => {
        const statusTimeFields = {
            'washing': 'checkinTime',
            'drying': 'dryingStartTime',
            'ironing': 'ironingStartTime',
            'ready': 'completedTime',
            'delivering': 'deliveryStartTime',
            'completed': 'deliveredTime'
        }

        const updatedOrder = orders.find(o => o.id === orderId)
        if (updatedOrder) {
            const timeField = statusTimeFields[newStatus]
            const updates = {
                ...updatedOrder,
                status: newStatus,
            }
            if (timeField) {
                updates[timeField] = new Date().toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')
            }
            const updatedOrders = orders.map(o => o.id === orderId ? updates : o)
            setOrders(updatedOrders)
            saveOrders(updatedOrders)
            setSelectedOrder(updates)
            toast.success(`${t('shop.order')} ${orderId} ${t('shop.toast.statusUpdatedTo')} ${getStatusText(newStatus)}!`)
        }
    }

    const handleUpdateToNextStatus = (order) => {
        const nextStatusInfo = getNextOrderStatusInfo(order.status)
        if (nextStatusInfo) {
            handleStatusChange(order.id, nextStatusInfo.status)
        }
    }

    const renderStatusBadge = (order, compact = false) => {
        if (order.status === 'pending-checkin') {
            return (
                <OrderStatusBadge
                    status={order.status}
                    compact={compact}
                    quickActionLabel={t('shop.checkIn')}
                    onQuickAction={() => openCheckInFlow(order)}
                />
            )
        }

        const nextStatusInfo = getNextOrderStatusInfo(order.status, t)

        return (
            <OrderStatusBadge
                status={order.status}
                compact={compact}
                quickActionLabel={nextStatusInfo?.label}
                onQuickAction={nextStatusInfo ? () => handleUpdateToNextStatus(order) : undefined}
            />
        )
    }

    const handleCancelOrder = (orderId) => {
        setConfirmDialog({
            show: true,
            title: t('shop.confirm.cancelOrderTitle'),
            message: t('shop.confirm.cancelOrderMessage'),
            type: 'warning',
            onConfirm: () => {
                const updatedOrders = orders.map(o =>
                    o.id === orderId ? { ...o, status: 'cancelled' } : o
                )
                setOrders(updatedOrders)
                saveOrders(updatedOrders)
                setSelectedOrder(null)
                toast.warning(`${t('shop.order')} ${orderId} ${t('shop.toast.cancelledSuffix')}`)
                setConfirmDialog({ ...confirmDialog, show: false })
            }
        })
    }

    const getStatusText = (status) => {
        return getOrderStatusMeta(status, t).label
    }

    const activeOrders =
        activeTab === 'pending' ? pendingOrders :
            activeTab === 'progress' ? inProgressOrders :
                activeTab === 'ready' ? readyOrders : filteredOrders

    const activeTabLabel =
        activeTab === 'pending' ? t('shop.pendingCheckinQueue') :
            activeTab === 'progress' ? t('shop.processingQueue') :
                activeTab === 'ready' ? t('shop.readyForDeliveryQueue') : t('shop.allOrders')

    const renderOrderTable = (data) => (
        <div className="shop-order-table-container">
            <table className="shop-order-table">
                <thead>
                    <tr>
                        <th>{t('shop.orderId')}</th>
                        <th>{t('shop.customer')}</th>
                        <th>{t('shop.service')}</th>
                        <th>{t('shop.weight')}</th>
                        <th>{t('shop.price')}</th>
                        <th>{t('shop.status')}</th>
                        <th>{t('shop.time')}</th>
                        <th>{t('shop.actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((order) => (
                        <tr key={order.id}>
                            <td>
                                <div className="shop-order-id-block">
                                    <span className="shop-order-kicker">{t('shop.orderId')}</span>
                                    <div className="shop-order-id">{order.id}</div>
                                </div>
                            </td>
                            <td>
                                <div className="shop-order-customer">
                                    <div>{order.customer}</div>
                                    <div className="shop-order-phone">{order.phone}</div>
                                </div>
                            </td>
                            <td>{order.service}</td>
                            <td>
                                <div className="shop-order-weight">
                                    {order.actualWeight ? (
                                        <span className="weight-confirmed">{order.actualWeight}</span>
                                    ) : (
                                        <span className="weight-estimated">~{order.estimatedWeight}</span>
                                    )}
                                </div>
                            </td>
                            <td>
                                <div className="shop-order-price">
                                    {order.actualPrice || order.estimatedPrice}
                                </div>
                            </td>
                            <td>
                                <div className="shop-order-status-block">
                                    <span className="shop-order-kicker">{t('shop.status')}</span>
                                    {renderStatusBadge(order, true)}
                                </div>
                            </td>
                            <td>
                                <div className="shop-order-time">{order.pickupTime}</div>
                            </td>
                            <td>
                                <div className="shop-order-actions">
                                    <button
                                        className="shop-order-btn btn-view"
                                        onClick={() => {
                                            setSelectedOrder(order)
                                            setShowCheckIn(false)
                                        }}
                                    >
                                        <Eye size={14} /> {t('shop.view')}
                                    </button>
                                    <button
                                        className="shop-order-btn btn-edit"
                                        onClick={() => handleEditOrder(order)}
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        className="shop-order-btn btn-delete"
                                        onClick={() => handleDeleteOrder(order.id)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )

    return (
        <div className="shop-order-management">
            <div className="shop-order-shell">
                <section className="shop-order-card shop-order-header-card">
                    <div className="shop-order-header">
                        <div>
                            <div className="shop-order-eyebrow">{t('shop.operationsDashboard')}</div>
                            <h1 className="shop-order-title">{t('shop.orderManagement')}</h1>
                            <p className="shop-order-subtitle">{t('shop.orderManagementSubtitle')}</p>
                        </div>
                        <div className="shop-order-header-actions">
                            <button className="shop-order-export-btn" onClick={handleExportOrders} title={t('shop.exportOrdersTitle')}>
                                <Download size={16} /> {t('shop.exportData')}
                            </button>
                            <button className="shop-order-reset-btn" onClick={handleResetOrders} title={t('shop.resetTitle')}>
                                <RotateCcw size={16} /> {t('profile.reset')}
                            </button>
                            <button className="shop-order-new-btn" onClick={() => setShowNewOrderModal(true)}>
                                <Plus size={16} /> {t('shop.newOrder')}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Filter Tiles — standalone row */}
                <div className="shop-order-filter-tiles">
                    <button
                        className={`shop-order-filter-tile ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        <div className="filter-tile-icon filter-tile-icon-all">
                            <ShoppingCart size={20} />
                        </div>
                        <div className="filter-tile-body">
                            <div className="filter-tile-label">{t('shop.allOrders')}</div>
                            <div className="filter-tile-count">{orders.length}</div>
                        </div>
                    </button>
                    <button
                        className={`shop-order-filter-tile ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        <div className="filter-tile-icon filter-tile-icon-pending">
                            <Clock size={20} />
                        </div>
                        <div className="filter-tile-body">
                            <div className="filter-tile-label">{t('shop.pendingCheckin')}</div>
                            <div className="filter-tile-count">{pendingCheckinCount}</div>
                        </div>
                    </button>
                    <button
                        className={`shop-order-filter-tile ${activeTab === 'progress' ? 'active' : ''}`}
                        onClick={() => setActiveTab('progress')}
                    >
                        <div className="filter-tile-icon filter-tile-icon-progress">
                            <RefreshCw size={20} />
                        </div>
                        <div className="filter-tile-body">
                            <div className="filter-tile-label">{t('shop.inProgress')}</div>
                            <div className="filter-tile-count">{inProgressCount}</div>
                        </div>
                    </button>
                    <button
                        className={`shop-order-filter-tile ${activeTab === 'ready' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ready')}
                    >
                        <div className="filter-tile-icon filter-tile-icon-ready">
                            <CheckCircle size={20} />
                        </div>
                        <div className="filter-tile-body">
                            <div className="filter-tile-label">{t('shop.ready')}</div>
                            <div className="filter-tile-count">{readyCount}</div>
                        </div>
                    </button>
                </div>

                <section className="shop-order-card shop-order-main-panel">
                    {/* Search */}
                    <div className="shop-order-search-bar">
                        <Search className="search-icon" size={16} />
                        <input
                            type="text"
                            placeholder={t('shop.searchOrdersPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Table header */}
                    <div className="shop-order-panel-header">
                        <div>
                            <div className="shop-order-eyebrow">{activeTabLabel}</div>
                            <h2 className="shop-order-panel-title">{t('shop.liveOrderQueue')}</h2>
                        </div>
                        <div className="shop-order-panel-count">{activeOrders.length} {t('shop.results')}</div>
                    </div>

                    {renderOrderTable(activeOrders)}
                </section>
            </div>

            <button
                className="shop-order-fab"
                onClick={handleScanQr}
                title={t('shop.openQrFlow')}
                aria-label={t('shop.scanQr')}
            >
                <QrCode size={20} />
                <span>{t('shop.scanQr')}</span>
            </button>

            {/* Check-in Modal */}
            {selectedOrder && showCheckIn && (
                <div className="shop-order-modal-overlay" onClick={() => { setSelectedOrder(null); setShowCheckIn(false) }}>
                    <div className="shop-order-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><CheckSquare size={20} /> {t('shop.orderCheckin')} - {selectedOrder.id}</h2>
                            <button className="modal-close" onClick={() => { setSelectedOrder(null); setShowCheckIn(false) }}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="checkin-section">
                                <h3>{t('shop.customerInformation')}</h3>
                                <div className="checkin-info">
                                    <div><strong>{t('shop.name')}:</strong> {selectedOrder.customer}</div>
                                    <div><strong>{t('shop.phone')}:</strong> {selectedOrder.phone}</div>
                                    <div><strong>{t('shop.service')}:</strong> {selectedOrder.service}</div>
                                    <div><strong>{t('shop.shipper')}:</strong> {selectedOrder.shipper}</div>
                                </div>
                            </div>

                            <div className="checkin-section">
                                <h3>{t('shop.weightVerification')}</h3>
                                <div className="checkin-weight">
                                    <div className="weight-item">
                                        <label>{t('shop.estimatedWeight')}:</label>
                                        <input type="text" value={selectedOrder.estimatedWeight} disabled />
                                    </div>
                                    <div className="weight-item">
                                        <label>{t('shop.actualWeight')}: *</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            placeholder={t('shop.enterActualWeight')}
                                            value={checkinForm.actualWeight}
                                            onChange={(e) => handleCheckinChange('actualWeight', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="checkin-section">
                                <h3>{t('shop.itemInspection')}</h3>
                                <div className="checkin-items">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="checkin-item">
                                            <div className="item-info">
                                                <strong>{item.type}</strong> × {item.quantity}
                                            </div>
                                            <select
                                                className="item-condition"
                                                value={checkinForm.itemConditions[idx] || item.condition}
                                                onChange={(e) => handleItemConditionChange(idx, e.target.value)}
                                            >
                                                <option value="Good">{t('shop.good')}</option>
                                                <option value="Minor stains">{t('shop.minorStains')}</option>
                                                <option value="Heavy stains">{t('shop.heavyStains')}</option>
                                                <option value="Damaged">{t('shop.damaged')}</option>
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="checkin-section">
                                <h3>{t('shop.additionalNotes')}</h3>
                                <textarea
                                    className="checkin-notes"
                                    placeholder={t('shop.checkinNotesPlaceholder')}
                                    value={checkinForm.notes}
                                    onChange={(e) => handleCheckinChange('notes', e.target.value)}
                                    rows="3"
                                />
                            </div>

                            <div className="checkin-section">
                                <h3>{t('shop.priceAdjustment')}</h3>
                                <div className="checkin-price">
                                    <div>
                                        <label>{t('shop.estimatedPrice')}:</label>
                                        <span className="price-estimated">{selectedOrder.estimatedPrice}</span>
                                    </div>
                                    <div>
                                        <label>{t('shop.finalPrice')}:</label>
                                        <input
                                            type="text"
                                            placeholder={t('shop.confirmFinalPrice')}
                                            value={checkinForm.finalPrice}
                                            onChange={(e) => handleCheckinChange('finalPrice', formatPriceInput(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="checkin-photos">
                                <h3>{t('shop.photoDocumentation')}</h3>
                                <button className="btn-upload-photo">
                                    📷 {t('shop.uploadPhotos')}
                                </button>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => { setSelectedOrder(null); setShowCheckIn(false) }}>{t('common.cancel')}</button>
                            <button className="btn-confirm" onClick={handleConfirmCheckin}>{t('shop.confirmCheckin')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {selectedOrder && !showCheckIn && (
                <div className="shop-order-modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="shop-order-modal shop-order-modal-view" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{t('shop.orderDetails')} - {selectedOrder.id}</h2>
                            <button className="modal-close" onClick={() => setSelectedOrder(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="order-detail-section">
                                <h3>{t('shop.status')}</h3>
                                <div className="order-status-large">
                                    {renderStatusBadge(selectedOrder)}
                                </div>
                            </div>

                            <div className="order-detail-section">
                                <h3>{t('shop.customerService')}</h3>
                                <div className="detail-grid">
                                    <div><strong>{t('shop.customer')}:</strong> {selectedOrder.customer}</div>
                                    <div><strong>{t('shop.phone')}:</strong> {selectedOrder.phone}</div>
                                    <div><strong>{t('shop.service')}:</strong> {selectedOrder.service}</div>
                                    <div><strong>{t('shop.shipper')}:</strong> {selectedOrder.shipper}</div>
                                </div>
                            </div>

                            <div className="order-detail-section">
                                <h3>{t('shop.weightPricing')}</h3>
                                <div className="detail-grid">
                                    <div><strong>{t('shop.weight')}:</strong> {selectedOrder.actualWeight || `~${selectedOrder.estimatedWeight}`}</div>
                                    <div><strong>{t('shop.price')}:</strong> {selectedOrder.actualPrice || selectedOrder.estimatedPrice}</div>
                                </div>
                            </div>

                            <div className="order-detail-section">
                                <h3>{t('shop.items')}</h3>
                                <div className="items-list">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="item-row">
                                            <span>{item.type} × {item.quantity}</span>
                                            <span className="item-condition">{item.condition}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedOrder.notes && (
                                <div className="order-detail-section">
                                    <h3>{t('shop.notes')}</h3>
                                    <p>{selectedOrder.notes}</p>
                                </div>
                            )}

                            <div className="order-detail-section">
                                <h3>{t('shop.timeline')}</h3>
                                <div className="timeline">
                                    <div className="timeline-item">
                                        <strong>{t('shop.pickup')}:</strong> {selectedOrder.pickupTime}
                                    </div>
                                    {selectedOrder.checkinTime && (
                                        <div className="timeline-item">
                                            <strong>{t('shop.checkedIn')}:</strong> {selectedOrder.checkinTime}
                                        </div>
                                    )}
                                    {selectedOrder.completedTime && (
                                        <div className="timeline-item">
                                            <strong>{t('shop.completed')}:</strong> {selectedOrder.completedTime}
                                        </div>
                                    )}
                                    {selectedOrder.deliveryStartTime && (
                                        <div className="timeline-item">
                                            <strong>{t('shop.deliveryStarted')}:</strong> {selectedOrder.deliveryStartTime}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => handleCancelOrder(selectedOrder.id)}>
                                {t('shop.cancelOrder')}
                            </button>
                            <button className="btn-edit" onClick={() => {
                                handleEditOrder(selectedOrder)
                                setSelectedOrder(null)
                            }}>
                                <Pencil size={14} /> {t('common.edit')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Order Modal */}
            {showNewOrderModal && (
                <div className="shop-order-modal-overlay" onClick={() => setShowNewOrderModal(false)}>
                    <div className="shop-order-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><Plus size={20} /> {t('shop.createNewOrder')}</h2>
                            <button className="modal-close" onClick={() => setShowNewOrderModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="checkin-section">
                                <h3>{t('shop.customerInformation')}</h3>
                                <div className="detail-grid">
                                    <div>
                                        <label>{t('shop.customerName')}: *</label>
                                        <input
                                            type="text"
                                            placeholder={t('shop.enterCustomerName')}
                                            value={newOrderForm.customer}
                                            onChange={(e) => setNewOrderForm({ ...newOrderForm, customer: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label>{t('shop.phoneNumber')}: *</label>
                                        <input
                                            type="tel"
                                            placeholder={t('shop.enterPhoneNumber')}
                                            value={newOrderForm.phone}
                                            onChange={(e) => setNewOrderForm({ ...newOrderForm, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="checkin-section">
                                <h3>{t('shop.serviceDetails')}</h3>
                                <div className="detail-grid">
                                    <div>
                                        <label>{t('shop.serviceType')}:</label>
                                        <select
                                            value={newOrderForm.service}
                                            onChange={(e) => setNewOrderForm({ ...newOrderForm, service: e.target.value })}
                                        >
                                            {serviceOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label>{t('shop.estimatedWeightKg')}: *</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            placeholder={t('shop.enterEstimatedWeight')}
                                            value={newOrderForm.estimatedWeight}
                                            onChange={(e) => setNewOrderForm({ ...newOrderForm, estimatedWeight: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="checkin-section">
                                <h3>{t('shop.pricingAssignment')}</h3>
                                <div className="detail-grid">
                                    <div>
                                        <label>{t('shop.estimatedPriceVnd')}:</label>
                                        <input
                                            type="text"
                                            placeholder={t('shop.enterEstimatedPrice')}
                                            value={newOrderForm.estimatedPrice}
                                            onChange={(e) => setNewOrderForm({ ...newOrderForm, estimatedPrice: formatPriceInput(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label>{t('shop.shipperName')}:</label>
                                        <input
                                            type="text"
                                            placeholder={t('shop.assignShipperOptional')}
                                            value={newOrderForm.shipper}
                                            onChange={(e) => setNewOrderForm({ ...newOrderForm, shipper: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="checkin-section">
                                <h3>{t('shop.additionalNotes')}</h3>
                                <textarea
                                    className="checkin-notes"
                                    placeholder={t('shop.orderNotesPlaceholder')}
                                    value={newOrderForm.notes}
                                    onChange={(e) => setNewOrderForm({ ...newOrderForm, notes: e.target.value })}
                                    rows="3"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowNewOrderModal(false)}>{t('common.cancel')}</button>
                            <button className="btn-confirm" onClick={handleCreateOrder}>{t('shop.createOrder')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Order Modal */}
            {showEditModal && editingOrder && (
                <div className="shop-order-modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="shop-order-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><Pencil size={20} /> {t('shop.editOrder')} - {editingOrder.id}</h2>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="checkin-section">
                                <h3>{t('shop.customerInformation')}</h3>
                                <div className="detail-grid">
                                    <div>
                                        <label>{t('shop.customerName')}: *</label>
                                        <input
                                            type="text"
                                            value={editingOrder.customer}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, customer: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label>{t('shop.phoneNumber')}: *</label>
                                        <input
                                            type="tel"
                                            value={editingOrder.phone}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="checkin-section">
                                <h3>{t('shop.serviceDetails')}</h3>
                                <div className="detail-grid">
                                    <div>
                                        <label>{t('shop.serviceType')}:</label>
                                        <select
                                            value={editingOrder.service}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, service: e.target.value })}
                                        >
                                            {serviceOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label>{t('shop.status')}:</label>
                                        <select
                                            value={editingOrder.status}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                                        >
                                            {statusOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="checkin-section">
                                <h3>{t('shop.weightPricing')}</h3>
                                <div className="detail-grid">
                                    <div>
                                        <label>{t('shop.estimatedWeight')}:</label>
                                        <input
                                            type="text"
                                            value={editingOrder.estimatedWeight}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, estimatedWeight: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label>{t('shop.actualWeight')}:</label>
                                        <input
                                            type="text"
                                            placeholder={t('shop.exampleWeightPlaceholder')}
                                            value={editingOrder.actualWeight || ''}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, actualWeight: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label>{t('shop.estimatedPrice')}:</label>
                                        <input
                                            type="text"
                                            value={(editingOrder.estimatedPrice || '').replace('đ', '')}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, estimatedPrice: formatPriceInput(e.target.value) + 'đ' })}
                                        />
                                    </div>
                                    <div>
                                        <label>{t('shop.finalPrice')}:</label>
                                        <input
                                            type="text"
                                            placeholder={t('shop.examplePricePlaceholder')}
                                            value={(editingOrder.actualPrice || '').replace('đ', '')}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, actualPrice: formatPriceInput(e.target.value) + 'đ' })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="checkin-section">
                                <h3>{t('shop.assignment')}</h3>
                                <div className="detail-grid">
                                    <div>
                                        <label>{t('shop.shipperName')}:</label>
                                        <input
                                            type="text"
                                            value={editingOrder.shipper}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, shipper: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label>{t('shop.shipperId')}:</label>
                                        <input
                                            type="text"
                                            value={editingOrder.shipperId}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, shipperId: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="checkin-section">
                                <h3>{t('shop.notes')}</h3>
                                <textarea
                                    className="checkin-notes"
                                    placeholder={t('shop.orderNotesPlaceholder')}
                                    value={editingOrder.notes || ''}
                                    onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                                    rows="3"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowEditModal(false)}>{t('common.cancel')}</button>
                            <button className="btn-confirm" onClick={handleSaveEdit}>{t('shop.saveChanges')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Confirm Dialog */}
            {confirmDialog.show && (
                <ConfirmDialog
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    type={confirmDialog.type}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={() => setConfirmDialog({ ...confirmDialog, show: false })}
                    confirmText={t('common.ok')}
                    cancelText={t('common.cancel')}
                />
            )}
        </div>
    )
}

export default ShopOrderManagement
