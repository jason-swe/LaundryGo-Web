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

function ShopOrderManagement() {
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
        { label: 'Pending Check-in', value: String(pendingCheckinCount), icon: Clock, color: '#5492b4' },
        { label: 'In Progress', value: String(inProgressCount), icon: RefreshCw, color: '#719FC2' },
        { label: 'Ready for Delivery', value: String(readyCount), icon: Truck, color: '#4d9e84' },
        { label: 'Completed Today', value: String(completedTodayCount), icon: CheckCircle, color: '#6b7280' }
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
            toast.warning('Please fill in required fields: Customer, Phone, and Estimated Weight')
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
        toast.success(`Order ${newOrder.id} created successfully!`)
    }

    const handleEditOrder = (order) => {
        setEditingOrder({ ...order })
        setShowEditModal(true)
    }

    const handleSaveEdit = () => {
        if (!editingOrder.customer || !editingOrder.phone) {
            toast.warning('Customer and phone are required')
            return
        }

        const updatedOrders = orders.map(o => o.id === editingOrder.id ? editingOrder : o)
        setOrders(updatedOrders)
        saveOrders(updatedOrders)
        setShowEditModal(false)
        setEditingOrder(null)
        toast.success(`Order ${editingOrder.id} updated successfully!`)
    }

    const handleDeleteOrder = (orderId) => {
        setConfirmDialog({
            show: true,
            title: 'Delete Order',
            message: 'Are you sure you want to delete this order? This action cannot be undone.',
            type: 'danger',
            onConfirm: () => {
                const updatedOrders = orders.filter(o => o.id !== orderId)
                setOrders(updatedOrders)
                saveOrders(updatedOrders)
                setSelectedOrder(null)
                toast.success(`Order ${orderId} deleted successfully!`)
                setConfirmDialog({ ...confirmDialog, show: false })
            }
        })
    }

    // Export orders to JSON file
    const handleExportOrders = () => {
        if (exportOrders(orders)) {
            toast.success(`Exported ${orders.length} orders to orders.json successfully!`)
        } else {
            toast.error('Failed to export orders. Please try again.')
        }
    }

    // Reset orders to default data
    const handleResetOrders = () => {
        setConfirmDialog({
            show: true,
            title: 'Reset All Orders',
            message: 'Are you sure you want to reset all orders to default data? This will clear all changes!',
            type: 'warning',
            onConfirm: () => {
                clearData('ORDERS')
                setOrders(ordersData)
                saveOrders(ordersData)
                toast.info('Orders reset to default data successfully!')
                setConfirmDialog({ ...confirmDialog, show: false })
            }
        })
    }

    // Check-in Handlers
    const handleConfirmCheckin = () => {
        if (!checkinForm.actualWeight) {
            toast.warning('Please enter actual weight')
            return
        }
        if (!checkinForm.finalPrice) {
            toast.warning('Please confirm final price')
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
        toast.success(`Order ${selectedOrder.id} checked in successfully!`)
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
            toast.info('No pending check-in orders. Showing the pending queue for the next QR arrival.')
            return
        }

        openCheckInFlow(pendingOrders[0])
        toast.success(`Ready to scan and check in ${pendingOrders[0].id}`)
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
            toast.success(`Order ${orderId} status updated to ${getStatusText(newStatus)}!`)
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
                    quickActionLabel="Check-in"
                    onQuickAction={() => openCheckInFlow(order)}
                />
            )
        }

        const nextStatusInfo = getNextOrderStatusInfo(order.status)

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
            title: 'Cancel Order',
            message: 'Are you sure you want to cancel this order? The order status will be changed to cancelled.',
            type: 'warning',
            onConfirm: () => {
                const updatedOrders = orders.map(o =>
                    o.id === orderId ? { ...o, status: 'cancelled' } : o
                )
                setOrders(updatedOrders)
                saveOrders(updatedOrders)
                setSelectedOrder(null)
                toast.warning(`Order ${orderId} has been cancelled`)
                setConfirmDialog({ ...confirmDialog, show: false })
            }
        })
    }

    const getStatusText = (status) => {
        return getOrderStatusMeta(status).label
    }

    const activeOrders =
        activeTab === 'pending' ? pendingOrders :
            activeTab === 'progress' ? inProgressOrders :
                activeTab === 'ready' ? readyOrders : filteredOrders

    const activeTabLabel =
        activeTab === 'pending' ? 'Pending Check-in Queue' :
            activeTab === 'progress' ? 'Processing Queue' :
                activeTab === 'ready' ? 'Ready for Delivery Queue' : 'All Orders'

    const renderOrderTable = (data) => (
        <div className="shop-order-table-container">
            <table className="shop-order-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Service</th>
                        <th>Weight</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Time</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((order) => (
                        <tr key={order.id}>
                            <td>
                                <div className="shop-order-id-block">
                                    <span className="shop-order-kicker">Order ID</span>
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
                                    <span className="shop-order-kicker">Status</span>
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
                                        <Eye size={14} /> View
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
                            <div className="shop-order-eyebrow">Operations Dashboard</div>
                            <h1 className="shop-order-title">Order Management</h1>
                            <p className="shop-order-subtitle">Manage check-in, track service progress, and dispatch orders from one queue-focused workspace.</p>
                        </div>
                        <div className="shop-order-header-actions">
                            <button className="shop-order-export-btn" onClick={handleExportOrders} title="Export orders to JSON file">
                                <Download size={16} /> Export Data
                            </button>
                            <button className="shop-order-reset-btn" onClick={handleResetOrders} title="Reset to default data">
                                <RotateCcw size={16} /> Reset
                            </button>
                            <button className="shop-order-new-btn" onClick={() => setShowNewOrderModal(true)}>
                                <Plus size={16} /> New Order
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
                            <div className="filter-tile-label">All Orders</div>
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
                            <div className="filter-tile-label">Pending Check-in</div>
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
                            <div className="filter-tile-label">In Progress</div>
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
                            <div className="filter-tile-label">Ready</div>
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
                            placeholder="Search by order ID, customer name, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Table header */}
                    <div className="shop-order-panel-header">
                        <div>
                            <div className="shop-order-eyebrow">{activeTabLabel}</div>
                            <h2 className="shop-order-panel-title">Live order queue</h2>
                        </div>
                        <div className="shop-order-panel-count">{activeOrders.length} results</div>
                    </div>

                    {renderOrderTable(activeOrders)}
                </section>
            </div>

            <button
                className="shop-order-fab"
                onClick={handleScanQr}
                title="Open QR scanning flow"
                aria-label="Scanning QR"
            >
                <QrCode size={20} />
                <span>Scanning QR</span>
            </button>

            {/* Check-in Modal */}
            {selectedOrder && showCheckIn && (
                <div className="shop-order-modal-overlay" onClick={() => { setSelectedOrder(null); setShowCheckIn(false) }}>
                    <div className="shop-order-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><CheckSquare size={20} /> Order Check-in - {selectedOrder.id}</h2>
                            <button className="modal-close" onClick={() => { setSelectedOrder(null); setShowCheckIn(false) }}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="checkin-section">
                                <h3>Customer Information</h3>
                                <div className="checkin-info">
                                    <div><strong>Name:</strong> {selectedOrder.customer}</div>
                                    <div><strong>Phone:</strong> {selectedOrder.phone}</div>
                                    <div><strong>Service:</strong> {selectedOrder.service}</div>
                                    <div><strong>Shipper:</strong> {selectedOrder.shipper}</div>
                                </div>
                            </div>

                            <div className="checkin-section">
                                <h3>Weight Verification</h3>
                                <div className="checkin-weight">
                                    <div className="weight-item">
                                        <label>Estimated Weight:</label>
                                        <input type="text" value={selectedOrder.estimatedWeight} disabled />
                                    </div>
                                    <div className="weight-item">
                                        <label>Actual Weight: *</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            placeholder="Enter actual weight (kg)"
                                            value={checkinForm.actualWeight}
                                            onChange={(e) => handleCheckinChange('actualWeight', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="checkin-section">
                                <h3>Item Inspection</h3>
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
                                                <option value="Good">Good</option>
                                                <option value="Minor stains">Minor Stains</option>
                                                <option value="Heavy stains">Heavy Stains</option>
                                                <option value="Damaged">Damaged</option>
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="checkin-section">
                                <h3>Additional Notes</h3>
                                <textarea
                                    className="checkin-notes"
                                    placeholder="Enter any special observations, damages, or customer requests..."
                                    value={checkinForm.notes}
                                    onChange={(e) => handleCheckinChange('notes', e.target.value)}
                                    rows="3"
                                />
                            </div>

                            <div className="checkin-section">
                                <h3>Price Adjustment</h3>
                                <div className="checkin-price">
                                    <div>
                                        <label>Estimated Price:</label>
                                        <span className="price-estimated">{selectedOrder.estimatedPrice}</span>
                                    </div>
                                    <div>
                                        <label>Final Price:</label>
                                        <input
                                            type="text"
                                            placeholder="Confirm final price"
                                            value={checkinForm.finalPrice}
                                            onChange={(e) => handleCheckinChange('finalPrice', formatPriceInput(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="checkin-photos">
                                <h3>Photo Documentation</h3>
                                <button className="btn-upload-photo">
                                    📷 Upload Photos (Optional)
                                </button>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => { setSelectedOrder(null); setShowCheckIn(false) }}>Cancel</button>
                            <button className="btn-confirm" onClick={handleConfirmCheckin}>Confirm Check-in</button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {selectedOrder && !showCheckIn && (
                <div className="shop-order-modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="shop-order-modal shop-order-modal-view" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Order Details - {selectedOrder.id}</h2>
                            <button className="modal-close" onClick={() => setSelectedOrder(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="order-detail-section">
                                <h3>Status</h3>
                                <div className="order-status-large">
                                    {renderStatusBadge(selectedOrder)}
                                </div>
                            </div>

                            <div className="order-detail-section">
                                <h3>Customer & Service</h3>
                                <div className="detail-grid">
                                    <div><strong>Customer:</strong> {selectedOrder.customer}</div>
                                    <div><strong>Phone:</strong> {selectedOrder.phone}</div>
                                    <div><strong>Service:</strong> {selectedOrder.service}</div>
                                    <div><strong>Shipper:</strong> {selectedOrder.shipper}</div>
                                </div>
                            </div>

                            <div className="order-detail-section">
                                <h3>Weight & Pricing</h3>
                                <div className="detail-grid">
                                    <div><strong>Weight:</strong> {selectedOrder.actualWeight || `~${selectedOrder.estimatedWeight}`}</div>
                                    <div><strong>Price:</strong> {selectedOrder.actualPrice || selectedOrder.estimatedPrice}</div>
                                </div>
                            </div>

                            <div className="order-detail-section">
                                <h3>Items</h3>
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
                                    <h3>Notes</h3>
                                    <p>{selectedOrder.notes}</p>
                                </div>
                            )}

                            <div className="order-detail-section">
                                <h3>Timeline</h3>
                                <div className="timeline">
                                    <div className="timeline-item">
                                        <strong>Pickup:</strong> {selectedOrder.pickupTime}
                                    </div>
                                    {selectedOrder.checkinTime && (
                                        <div className="timeline-item">
                                            <strong>Checked-in:</strong> {selectedOrder.checkinTime}
                                        </div>
                                    )}
                                    {selectedOrder.completedTime && (
                                        <div className="timeline-item">
                                            <strong>Completed:</strong> {selectedOrder.completedTime}
                                        </div>
                                    )}
                                    {selectedOrder.deliveryStartTime && (
                                        <div className="timeline-item">
                                            <strong>Delivery Started:</strong> {selectedOrder.deliveryStartTime}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => handleCancelOrder(selectedOrder.id)}>
                                Cancel Order
                            </button>
                            <button className="btn-edit" onClick={() => {
                                handleEditOrder(selectedOrder)
                                setSelectedOrder(null)
                            }}>
                                <Pencil size={14} /> Edit
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
                            <h2><Plus size={20} /> Create New Order</h2>
                            <button className="modal-close" onClick={() => setShowNewOrderModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="checkin-section">
                                <h3>Customer Information</h3>
                                <div className="detail-grid">
                                    <div>
                                        <label>Customer Name: *</label>
                                        <input
                                            type="text"
                                            placeholder="Enter customer name"
                                            value={newOrderForm.customer}
                                            onChange={(e) => setNewOrderForm({ ...newOrderForm, customer: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label>Phone Number: *</label>
                                        <input
                                            type="tel"
                                            placeholder="Enter phone number"
                                            value={newOrderForm.phone}
                                            onChange={(e) => setNewOrderForm({ ...newOrderForm, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="checkin-section">
                                <h3>Service Details</h3>
                                <div className="detail-grid">
                                    <div>
                                        <label>Service Type:</label>
                                        <select
                                            value={newOrderForm.service}
                                            onChange={(e) => setNewOrderForm({ ...newOrderForm, service: e.target.value })}
                                        >
                                            <option value="Wash & Dry">Wash & Dry</option>
                                            <option value="Dry Clean">Dry Clean</option>
                                            <option value="Express Wash">Express Wash</option>
                                            <option value="Wash & Iron">Wash & Iron</option>
                                            <option value="Iron Only">Iron Only</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Estimated Weight (kg): *</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            placeholder="Enter estimated weight"
                                            value={newOrderForm.estimatedWeight}
                                            onChange={(e) => setNewOrderForm({ ...newOrderForm, estimatedWeight: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="checkin-section">
                                <h3>Pricing & Assignment</h3>
                                <div className="detail-grid">
                                    <div>
                                        <label>Estimated Price (đ):</label>
                                        <input
                                            type="text"
                                            placeholder="Enter estimated price"
                                            value={newOrderForm.estimatedPrice}
                                            onChange={(e) => setNewOrderForm({ ...newOrderForm, estimatedPrice: formatPriceInput(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label>Shipper Name:</label>
                                        <input
                                            type="text"
                                            placeholder="Assign shipper (optional)"
                                            value={newOrderForm.shipper}
                                            onChange={(e) => setNewOrderForm({ ...newOrderForm, shipper: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="checkin-section">
                                <h3>Additional Notes</h3>
                                <textarea
                                    className="checkin-notes"
                                    placeholder="Enter any special instructions or notes..."
                                    value={newOrderForm.notes}
                                    onChange={(e) => setNewOrderForm({ ...newOrderForm, notes: e.target.value })}
                                    rows="3"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowNewOrderModal(false)}>Cancel</button>
                            <button className="btn-confirm" onClick={handleCreateOrder}>Create Order</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Order Modal */}
            {showEditModal && editingOrder && (
                <div className="shop-order-modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="shop-order-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><Pencil size={20} /> Edit Order - {editingOrder.id}</h2>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="checkin-section">
                                <h3>Customer Information</h3>
                                <div className="detail-grid">
                                    <div>
                                        <label>Customer Name: *</label>
                                        <input
                                            type="text"
                                            value={editingOrder.customer}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, customer: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label>Phone Number: *</label>
                                        <input
                                            type="tel"
                                            value={editingOrder.phone}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="checkin-section">
                                <h3>Service Details</h3>
                                <div className="detail-grid">
                                    <div>
                                        <label>Service Type:</label>
                                        <select
                                            value={editingOrder.service}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, service: e.target.value })}
                                        >
                                            <option value="Wash & Dry">Wash & Dry</option>
                                            <option value="Dry Clean">Dry Clean</option>
                                            <option value="Express Wash">Express Wash</option>
                                            <option value="Wash & Iron">Wash & Iron</option>
                                            <option value="Iron Only">Iron Only</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Status:</label>
                                        <select
                                            value={editingOrder.status}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                                        >
                                            <option value="pending-checkin">Pending Check-in</option>
                                            <option value="washing">Washing</option>
                                            <option value="drying">Drying</option>
                                            <option value="ironing">Ironing</option>
                                            <option value="ready">Ready</option>
                                            <option value="delivering">Delivering</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="checkin-section">
                                <h3>Weight & Pricing</h3>
                                <div className="detail-grid">
                                    <div>
                                        <label>Estimated Weight:</label>
                                        <input
                                            type="text"
                                            value={editingOrder.estimatedWeight}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, estimatedWeight: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label>Actual Weight:</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., 5.2kg"
                                            value={editingOrder.actualWeight || ''}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, actualWeight: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label>Estimated Price:</label>
                                        <input
                                            type="text"
                                            value={(editingOrder.estimatedPrice || '').replace('đ', '')}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, estimatedPrice: formatPriceInput(e.target.value) + 'đ' })}
                                        />
                                    </div>
                                    <div>
                                        <label>Actual Price:</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., 200,000"
                                            value={(editingOrder.actualPrice || '').replace('đ', '')}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, actualPrice: formatPriceInput(e.target.value) + 'đ' })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="checkin-section">
                                <h3>Assignment</h3>
                                <div className="detail-grid">
                                    <div>
                                        <label>Shipper Name:</label>
                                        <input
                                            type="text"
                                            value={editingOrder.shipper}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, shipper: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label>Shipper ID:</label>
                                        <input
                                            type="text"
                                            value={editingOrder.shipperId}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, shipperId: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="checkin-section">
                                <h3>Notes</h3>
                                <textarea
                                    className="checkin-notes"
                                    placeholder="Enter any special instructions or notes..."
                                    value={editingOrder.notes || ''}
                                    onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                                    rows="3"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                            <button className="btn-confirm" onClick={handleSaveEdit}>Save Changes</button>
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
                    confirmText="OK"
                    cancelText="Cancel"
                />
            )}
        </div>
    )
}

export default ShopOrderManagement
