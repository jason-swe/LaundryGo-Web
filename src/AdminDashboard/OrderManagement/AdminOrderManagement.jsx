import { useState } from 'react'
import './AdminOrderManagement.css'
import {
    ShoppingCartOutlined,
    SearchOutlined,
    FilterOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons'
import { adminOrders as ordersData } from '../../data'

const SERVICES = ['Wash & Dry', 'Wash & Iron', 'Dry Clean', 'Express Wash']
const SHOPS = [
    { name: 'FPT Laundry Shop', id: 'SHOP-001' },
    { name: 'Clean & Fresh', id: 'SHOP-002' },
    { name: 'Express Wash', id: 'SHOP-003' },
    { name: 'LaundryPro', id: 'SHOP-004' },
    { name: 'Quick Clean', id: 'SHOP-005' },
]
const STATUSES = ['pending', 'pending-pickup', 'in-progress', 'delivering', 'completed', 'cancelled']

const EMPTY_FORM = {
    customer: '', customerId: '',
    shop: 'FPT Laundry Shop', shopId: 'SHOP-001',
    shipper: '', shipperId: '',
    service: 'Wash & Dry',
    weight: '', amount: '', amountValue: 0,
    status: 'pending',
    orderDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
    pickupAddress: '', deliveryAddress: '', notes: '',
}

function AdminOrderManagement() {
    const [activeTab, setActiveTab] = useState('all')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [orders, setOrders] = useState(ordersData)
    const [searchQuery, setSearchQuery] = useState('')

    // Modal state: null | 'view' | 'create' | 'edit' | 'delete'
    const [modal, setModal] = useState(null)
    const [formData, setFormData] = useState(EMPTY_FORM)
    const [deleteTarget, setDeleteTarget] = useState(null)

    const stats = [
        { label: 'Total Orders', value: String(orders.length), change: '+12% vs yesterday', icon: ShoppingCartOutlined, color: '#719FC2' },
        { label: 'In Progress', value: String(orders.filter(o => o.status === 'in-progress' || o.status === 'delivering').length), change: 'Currently active', icon: SyncOutlined, color: '#5492b4' },
        { label: 'Completed', value: String(orders.filter(o => o.status === 'completed').length), change: 'All time completed', icon: CheckCircleOutlined, color: '#4d9e84' },
        { label: 'Cancelled', value: String(orders.filter(o => o.status === 'cancelled').length), change: 'Cancellation count', icon: CloseCircleOutlined, color: '#c05a50' }
    ]

    const filteredOrders = orders.filter(o =>
        !searchQuery ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.shop.toLowerCase().includes(searchQuery.toLowerCase())
    )
    const pendingOrders = filteredOrders.filter(o => o.status === 'pending-pickup' || o.status === 'pending')
    const inProgressOrders = filteredOrders.filter(o => o.status === 'in-progress' || o.status === 'delivering')
    const completedOrders = filteredOrders.filter(o => o.status === 'completed')
    const cancelledOrders = filteredOrders.filter(o => o.status === 'cancelled')

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return '#4d9e84'
            case 'in-progress':
            case 'delivering':
                return '#719FC2'
            case 'pending-pickup':
                return '#5492b4'
            case 'cancelled':
                return '#c05a50'
            default:
                return '#6b7280'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircleOutlined />
            case 'in-progress':
            case 'delivering':
                return <SyncOutlined />
            case 'pending-pickup':
                return <ClockCircleOutlined />
            case 'cancelled':
                return <CloseCircleOutlined />
            default:
                return <ShoppingCartOutlined />
        }
    }

    const getStatusText = (status) => {
        const statusMap = {
            'completed': 'Completed',
            'in-progress': 'In Progress',
            'delivering': 'Delivering',
            'pending-pickup': 'Pending Pickup',
            'pending': 'Pending',
            'cancelled': 'Cancelled'
        }
        return statusMap[status] || status
    }

    // ── CRUD Handlers ──────────────────────────────────────
    const openCreate = () => {
        setFormData({ ...EMPTY_FORM })
        setModal('create')
    }

    const openEdit = (order) => {
        setFormData({ ...order })
        setModal('edit')
    }

    const openView = (order) => {
        setSelectedOrder(order)
        setModal('view')
    }

    const openDelete = (order) => {
        setDeleteTarget(order)
        setModal('delete')
    }

    const closeModal = () => {
        setModal(null)
        setSelectedOrder(null)
        setDeleteTarget(null)
    }

    const handleFormChange = (e) => {
        const { name, value } = e.target
        if (name === 'shop') {
            const found = SHOPS.find(s => s.name === value)
            setFormData(prev => ({ ...prev, shop: value, shopId: found ? found.id : '' }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleCreate = () => {
        if (!formData.customer || !formData.weight || !formData.amount) return
        const nextId = '#ORD-' + (Math.max(...orders.map(o => parseInt(o.id.replace(/\D/g, '')) || 0)) + 1)
        const newOrder = { ...formData, id: nextId, completedDate: null }
        setOrders(prev => [newOrder, ...prev])
        closeModal()
    }

    const handleUpdate = () => {
        if (!formData.customer || !formData.weight || !formData.amount) return
        setOrders(prev => prev.map(o => o.id === formData.id ? { ...formData } : o))
        closeModal()
    }

    const handleDelete = () => {
        setOrders(prev => prev.filter(o => o.id !== deleteTarget.id))
        closeModal()
    }

    const renderOrderTable = (data) => (
        <div className="admin-order-table">
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Shop</th>
                        <th>Shipper</th>
                        <th>Service</th>
                        <th>Weight</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr><td colSpan={10} className="admin-order-empty">No orders found</td></tr>
                    ) : data.map(order => (
                        <tr key={order.id}>
                            <td><div className="order-id">{order.id}</div></td>
                            <td>
                                <div className="order-customer">
                                    <div>{order.customer}</div>
                                    <div className="customer-id">{order.customerId}</div>
                                </div>
                            </td>
                            <td>
                                <div className="order-shop">
                                    <div>{order.shop}</div>
                                    <div className="shop-id">{order.shopId}</div>
                                </div>
                            </td>
                            <td>{order.shipper}</td>
                            <td>{order.service}</td>
                            <td><div className="order-weight">{order.weight}</div></td>
                            <td><div className="order-amount">{order.amount}</div></td>
                            <td><div className="order-date">{order.orderDate}</div></td>
                            <td>
                                <span className="order-status-badge" style={{ color: getStatusColor(order.status) }}>
                                    {getStatusIcon(order.status)} {getStatusText(order.status)}
                                </span>
                            </td>
                            <td>
                                <div className="order-actions-cell">
                                    <button className="order-action-btn view-btn" onClick={() => openView(order)} title="View">
                                        <EyeOutlined />
                                    </button>
                                    <button className="order-action-btn edit-btn" onClick={() => openEdit(order)} title="Edit">
                                        <EditOutlined />
                                    </button>
                                    <button className="order-action-btn delete-btn" onClick={() => openDelete(order)} title="Delete">
                                        <DeleteOutlined />
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
        <div className="admin-order-management">
            <div className="admin-order-header">
                <div>
                    <h1 className="admin-order-title">Order Management</h1>
                    <p className="admin-order-subtitle">Monitor and manage all orders across the platform</p>
                </div>
                <button className="admin-order-create-btn" onClick={openCreate}>
                    <PlusOutlined /> New Order
                </button>
            </div>

            {/* Stats Grid */}
            <div className="admin-order-stats">
                {stats.map((stat, index) => {
                    const IconComponent = stat.icon
                    return (
                        <div key={index} className="admin-order-stat-card">
                            <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                                <IconComponent style={{ fontSize: '24px' }} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">{stat.label}</div>
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-change">{stat.change}</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Tabs */}
            <div className="admin-order-tabs">
                <button
                    className={`admin-order-tab ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    <ShoppingCartOutlined /> All Orders ({orders.length})
                </button>
                <button
                    className={`admin-order-tab ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    <ClockCircleOutlined /> Pending ({pendingOrders.length})
                </button>
                <button
                    className={`admin-order-tab ${activeTab === 'in-progress' ? 'active' : ''}`}
                    onClick={() => setActiveTab('in-progress')}
                >
                    <SyncOutlined /> In Progress ({inProgressOrders.length})
                </button>
                <button
                    className={`admin-order-tab ${activeTab === 'completed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('completed')}
                >
                    <CheckCircleOutlined /> Completed ({completedOrders.length})
                </button>
                <button
                    className={`admin-order-tab ${activeTab === 'cancelled' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cancelled')}
                >
                    <CloseCircleOutlined /> Cancelled ({cancelledOrders.length})
                </button>
            </div>

            {/* Content */}
            <div className="admin-order-card">
                <div className="admin-order-card-header">
                    <div className="admin-order-search">
                        <SearchOutlined className="search-icon" />
                        <input type="text" placeholder="Search by order ID, customer, shop..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                    <button className="admin-order-filter-btn">
                        <FilterOutlined /> Filters
                    </button>
                </div>

                {activeTab === 'all' && renderOrderTable(filteredOrders)}
                {activeTab === 'pending' && renderOrderTable(pendingOrders)}
                {activeTab === 'in-progress' && renderOrderTable(inProgressOrders)}
                {activeTab === 'completed' && renderOrderTable(completedOrders)}
                {activeTab === 'cancelled' && renderOrderTable(cancelledOrders)}
            </div>

            {/* View Detail Modal */}
            {modal === 'view' && selectedOrder && (
                <div className="order-modal-overlay" onClick={closeModal}>
                    <div className="order-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="order-modal-header">
                            <h2>Order Details — {selectedOrder.id}</h2>
                            <button className="order-modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="order-modal-body">
                            <div className="order-status-section">
                                <h3>Status</h3>
                                <div className="order-status-large" style={{ color: getStatusColor(selectedOrder.status) }}>
                                    {getStatusIcon(selectedOrder.status)} {getStatusText(selectedOrder.status)}
                                </div>
                            </div>
                            <div className="order-detail-section">
                                <h3>Service Information</h3>
                                <div className="detail-grid">
                                    <div><strong>Service:</strong> {selectedOrder.service}</div>
                                    <div><strong>Weight:</strong> {selectedOrder.weight}</div>
                                    <div><strong>Amount:</strong> {selectedOrder.amount}</div>
                                    <div><strong>Order Date:</strong> {selectedOrder.orderDate}</div>
                                </div>
                            </div>
                            <div className="order-detail-section">
                                <h3>Customer</h3>
                                <div className="detail-grid">
                                    <div><strong>Name:</strong> {selectedOrder.customer}</div>
                                    <div><strong>ID:</strong> {selectedOrder.customerId}</div>
                                </div>
                            </div>
                            <div className="order-detail-section">
                                <h3>Shop & Shipper</h3>
                                <div className="detail-grid">
                                    <div><strong>Shop:</strong> {selectedOrder.shop}</div>
                                    <div><strong>Shop ID:</strong> {selectedOrder.shopId}</div>
                                    <div><strong>Shipper:</strong> {selectedOrder.shipper}</div>
                                    <div><strong>Shipper ID:</strong> {selectedOrder.shipperId || 'N/A'}</div>
                                </div>
                            </div>
                            <div className="order-detail-section">
                                <h3>Addresses</h3>
                                <div className="detail-grid">
                                    <div><strong>Pickup:</strong> {selectedOrder.pickupAddress}</div>
                                    <div><strong>Delivery:</strong> {selectedOrder.deliveryAddress}</div>
                                </div>
                            </div>
                            {selectedOrder.notes && (
                                <div className="order-detail-section">
                                    <h3>Notes</h3>
                                    <div>{selectedOrder.notes}</div>
                                </div>
                            )}
                        </div>
                        <div className="order-modal-footer">
                            <button className="order-modal-btn secondary" onClick={closeModal}>Close</button>
                            <button className="order-modal-btn primary" onClick={() => { closeModal(); openEdit(selectedOrder) }}>
                                <EditOutlined /> Edit Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create / Edit Modal */}
            {(modal === 'create' || modal === 'edit') && (
                <div className="order-modal-overlay" onClick={closeModal}>
                    <div className="order-modal-content order-modal-form" onClick={e => e.stopPropagation()}>
                        <div className="order-modal-header">
                            <h2>{modal === 'create' ? <><PlusOutlined /> New Order</> : <><EditOutlined /> Edit Order — {formData.id}</>}</h2>
                            <button className="order-modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="order-modal-body">
                            <div className="order-form-grid">
                                <div className="order-form-group">
                                    <label>Customer Name <span className="required">*</span></label>
                                    <input name="customer" value={formData.customer} onChange={handleFormChange} placeholder="e.g. Nguyễn Văn A" />
                                </div>
                                <div className="order-form-group">
                                    <label>Customer ID</label>
                                    <input name="customerId" value={formData.customerId} onChange={handleFormChange} placeholder="e.g. CUS-10234" />
                                </div>
                                <div className="order-form-group">
                                    <label>Shop</label>
                                    <select name="shop" value={formData.shop} onChange={handleFormChange}>
                                        {SHOPS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="order-form-group">
                                    <label>Service</label>
                                    <select name="service" value={formData.service} onChange={handleFormChange}>
                                        {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="order-form-group">
                                    <label>Shipper Name</label>
                                    <input name="shipper" value={formData.shipper} onChange={handleFormChange} placeholder="e.g. Lê Văn A" />
                                </div>
                                <div className="order-form-group">
                                    <label>Shipper ID</label>
                                    <input name="shipperId" value={formData.shipperId} onChange={handleFormChange} placeholder="e.g. SHP-1001" />
                                </div>
                                <div className="order-form-group">
                                    <label>Weight <span className="required">*</span></label>
                                    <input name="weight" value={formData.weight} onChange={handleFormChange} placeholder="e.g. 5kg" />
                                </div>
                                <div className="order-form-group">
                                    <label>Amount <span className="required">*</span></label>
                                    <input name="amount" value={formData.amount} onChange={handleFormChange} placeholder="e.g. 150,000đ" />
                                </div>
                                <div className="order-form-group">
                                    <label>Status</label>
                                    <select name="status" value={formData.status} onChange={handleFormChange}>
                                        {STATUSES.map(s => <option key={s} value={s}>{getStatusText(s)}</option>)}
                                    </select>
                                </div>
                                <div className="order-form-group">
                                    <label>Order Date</label>
                                    <input name="orderDate" value={formData.orderDate} onChange={handleFormChange} placeholder="YYYY-MM-DD HH:mm" />
                                </div>
                                <div className="order-form-group order-form-group-full">
                                    <label>Pickup Address</label>
                                    <input name="pickupAddress" value={formData.pickupAddress} onChange={handleFormChange} placeholder="123 Đường ABC, Quận X" />
                                </div>
                                <div className="order-form-group order-form-group-full">
                                    <label>Delivery Address</label>
                                    <input name="deliveryAddress" value={formData.deliveryAddress} onChange={handleFormChange} placeholder="123 Đường ABC, Quận X" />
                                </div>
                                <div className="order-form-group order-form-group-full">
                                    <label>Notes</label>
                                    <textarea name="notes" value={formData.notes} onChange={handleFormChange} rows={3} placeholder="Special instructions..." />
                                </div>
                            </div>
                        </div>
                        <div className="order-modal-footer">
                            <button className="order-modal-btn secondary" onClick={closeModal}>Cancel</button>
                            <button
                                className="order-modal-btn primary"
                                onClick={modal === 'create' ? handleCreate : handleUpdate}
                                disabled={!formData.customer || !formData.weight || !formData.amount}
                            >
                                {modal === 'create' ? <><PlusOutlined /> Create Order</> : <><CheckCircleOutlined /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {modal === 'delete' && deleteTarget && (
                <div className="order-modal-overlay" onClick={closeModal}>
                    <div className="order-modal-content order-modal-delete" onClick={e => e.stopPropagation()}>
                        <div className="order-modal-header">
                            <h2><ExclamationCircleOutlined style={{ color: '#c05a50', marginRight: 8 }} />Delete Order</h2>
                            <button className="order-modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="order-modal-body">
                            <p className="order-delete-msg">
                                Are you sure you want to delete order <strong>{deleteTarget.id}</strong>?
                            </p>
                            <div className="order-delete-info">
                                <div><strong>Customer:</strong> {deleteTarget.customer}</div>
                                <div><strong>Shop:</strong> {deleteTarget.shop}</div>
                                <div><strong>Amount:</strong> {deleteTarget.amount}</div>
                                <div><strong>Status:</strong> {getStatusText(deleteTarget.status)}</div>
                            </div>
                            <p className="order-delete-warning">This action cannot be undone.</p>
                        </div>
                        <div className="order-modal-footer">
                            <button className="order-modal-btn secondary" onClick={closeModal}>Cancel</button>
                            <button className="order-modal-btn danger" onClick={handleDelete}>
                                <DeleteOutlined /> Delete Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminOrderManagement