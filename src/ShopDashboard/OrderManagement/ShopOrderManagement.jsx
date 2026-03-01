import { useState } from 'react'
import './ShopOrderManagement.css'
import {
    ShoppingCartOutlined,
    ClockCircleOutlined,
    SyncOutlined,
    CheckCircleOutlined,
    CarOutlined,
    SearchOutlined,
    PlusOutlined,
    EyeOutlined,
    CheckSquareOutlined
} from '@ant-design/icons'

function ShopOrderManagement() {
    const [activeTab, setActiveTab] = useState('all')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showCheckIn, setShowCheckIn] = useState(false)

    const stats = [
        { label: 'Pending Check-in', value: '12', icon: ClockCircleOutlined, color: '#f59e0b' },
        { label: 'In Progress', value: '8', icon: SyncOutlined, color: '#3b82f6' },
        { label: 'Ready for Delivery', value: '5', icon: CarOutlined, color: '#10b981' },
        { label: 'Completed Today', value: '45', icon: CheckCircleOutlined, color: '#6b7280' }
    ]

    const orders = [
        {
            id: '#ORD-10234',
            customer: 'Nguyễn Văn A',
            phone: '0901234567',
            service: 'Wash & Dry',
            estimatedWeight: '5kg',
            actualWeight: null,
            estimatedPrice: '150,000đ',
            actualPrice: null,
            status: 'pending-checkin',
            shipper: 'Lê Văn A',
            shipperId: 'SHP-1001',
            pickupTime: '2024-02-27 10:30',
            notes: 'Stains on collar',
            items: [
                { type: 'Shirt', quantity: 3, condition: 'Good' },
                { type: 'Pants', quantity: 2, condition: 'Good' }
            ]
        },
        {
            id: '#ORD-10233',
            customer: 'Trần Thị B',
            phone: '0912345678',
            service: 'Dry Clean',
            estimatedWeight: '3kg',
            actualWeight: '3.2kg',
            estimatedPrice: '200,000đ',
            actualPrice: '210,000đ',
            status: 'washing',
            shipper: 'Phạm Thị B',
            shipperId: 'SHP-1002',
            pickupTime: '2024-02-27 09:15',
            checkinTime: '2024-02-27 11:30',
            notes: 'Handle with care',
            items: [
                { type: 'Coat', quantity: 1, condition: 'Good' },
                { type: 'Dress', quantity: 2, condition: 'Minor stains' }
            ]
        },
        {
            id: '#ORD-10232',
            customer: 'Lê Văn C',
            phone: '0923456789',
            service: 'Express Wash',
            estimatedWeight: '7kg',
            actualWeight: '6.8kg',
            estimatedPrice: '280,000đ',
            actualPrice: '270,000đ',
            status: 'ready',
            shipper: 'Hoàng Văn C',
            shipperId: 'SHP-1003',
            pickupTime: '2024-02-27 08:00',
            checkinTime: '2024-02-27 10:30',
            completedTime: '2024-02-27 14:00',
            notes: null,
            items: [
                { type: 'Shirt', quantity: 5, condition: 'Good' },
                { type: 'Pants', quantity: 2, condition: 'Good' }
            ]
        },
        {
            id: '#ORD-10231',
            customer: 'Phạm Thị D',
            phone: '0934567890',
            service: 'Wash & Iron',
            estimatedWeight: '4kg',
            actualWeight: '4.5kg',
            estimatedPrice: '180,000đ',
            actualPrice: '200,000đ',
            status: 'delivering',
            shipper: 'Võ Thị D',
            shipperId: 'SHP-1004',
            pickupTime: '2024-02-27 07:30',
            checkinTime: '2024-02-27 09:45',
            completedTime: '2024-02-27 13:30',
            deliveryStartTime: '2024-02-27 14:00',
            notes: null,
            items: [
                { type: 'Uniform', quantity: 4, condition: 'Good' }
            ]
        }
    ]

    const pendingOrders = orders.filter(o => o.status === 'pending-checkin')
    const inProgressOrders = orders.filter(o => o.status === 'washing' || o.status === 'drying' || o.status === 'ironing')
    const readyOrders = orders.filter(o => o.status === 'ready')

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending-checkin': return '#f59e0b'
            case 'washing':
            case 'drying':
            case 'ironing': return '#3b82f6'
            case 'ready': return '#10b981'
            case 'delivering': return '#8b5cf6'
            case 'completed': return '#6b7280'
            default: return '#94a3b8'
        }
    }

    const getStatusText = (status) => {
        const statusMap = {
            'pending-checkin': 'Pending Check-in',
            'washing': 'Washing',
            'drying': 'Drying',
            'ironing': 'Ironing',
            'ready': 'Ready for Delivery',
            'delivering': 'Delivering',
            'completed': 'Completed'
        }
        return statusMap[status] || status
    }

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
                            <td className="shop-order-id">{order.id}</td>
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
                                <span
                                    className="shop-order-status-badge"
                                    style={{ color: getStatusColor(order.status) }}
                                >
                                    ● {getStatusText(order.status)}
                                </span>
                            </td>
                            <td>
                                <div className="shop-order-time">{order.pickupTime}</div>
                            </td>
                            <td>
                                <div className="shop-order-actions">
                                    {order.status === 'pending-checkin' && (
                                        <button
                                            className="shop-order-btn btn-checkin"
                                            onClick={() => {
                                                setSelectedOrder(order)
                                                setShowCheckIn(true)
                                            }}
                                        >
                                            <CheckSquareOutlined /> Check-in
                                        </button>
                                    )}
                                    <button
                                        className="shop-order-btn btn-view"
                                        onClick={() => {
                                            setSelectedOrder(order)
                                            setShowCheckIn(false)
                                        }}
                                    >
                                        <EyeOutlined /> View
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
            <div className="shop-order-header">
                <div>
                    <h1 className="shop-order-title">Order Management</h1>
                    <p className="shop-order-subtitle">Manage orders: check-in, track, and fulfill</p>
                </div>
                <button className="shop-order-new-btn">
                    <PlusOutlined /> New Order
                </button>
            </div>

            {/* Stats */}
            <div className="shop-order-stats">
                {stats.map((stat, index) => {
                    const IconComponent = stat.icon
                    return (
                        <div key={index} className="shop-order-stat-card">
                            <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                                <IconComponent style={{ fontSize: '24px' }} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">{stat.label}</div>
                                <div className="stat-value">{stat.value}</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Tabs */}
            <div className="shop-order-tabs">
                <button
                    className={`shop-order-tab ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    <ShoppingCartOutlined /> All Orders ({orders.length})
                </button>
                <button
                    className={`shop-order-tab ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    <ClockCircleOutlined /> Pending Check-in ({pendingOrders.length})
                </button>
                <button
                    className={`shop-order-tab ${activeTab === 'progress' ? 'active' : ''}`}
                    onClick={() => setActiveTab('progress')}
                >
                    <SyncOutlined /> In Progress ({inProgressOrders.length})
                </button>
                <button
                    className={`shop-order-tab ${activeTab === 'ready' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ready')}
                >
                    <CheckCircleOutlined /> Ready ({readyOrders.length})
                </button>
            </div>

            {/* Search Bar */}
            <div className="shop-order-search-bar">
                <SearchOutlined className="search-icon" />
                <input type="text" placeholder="Search by order ID, customer name, or phone..." />
            </div>

            {/* Order Tables */}
            {activeTab === 'all' && renderOrderTable(orders)}
            {activeTab === 'pending' && renderOrderTable(pendingOrders)}
            {activeTab === 'progress' && renderOrderTable(inProgressOrders)}
            {activeTab === 'ready' && renderOrderTable(readyOrders)}

            {/* Check-in Modal */}
            {selectedOrder && showCheckIn && (
                <div className="shop-order-modal-overlay" onClick={() => { setSelectedOrder(null); setShowCheckIn(false) }}>
                    <div className="shop-order-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><CheckSquareOutlined /> Order Check-in - {selectedOrder.id}</h2>
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
                                        <input type="number" step="0.1" placeholder="Enter actual weight (kg)" />
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
                                            <select className="item-condition">
                                                <option value="good">Good</option>
                                                <option value="minor-stains">Minor Stains</option>
                                                <option value="heavy-stains">Heavy Stains</option>
                                                <option value="damaged">Damaged</option>
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
                                    defaultValue={selectedOrder.notes}
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
                                        <input type="text" placeholder="Confirm final price" />
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
                            <button className="btn-confirm">Confirm Check-in</button>
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
                                <div className="order-status-large" style={{ color: getStatusColor(selectedOrder.status) }}>
                                    ● {getStatusText(selectedOrder.status)}
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
                            {selectedOrder.status === 'washing' && (
                                <button className="btn-update">Update Status to Drying</button>
                            )}
                            {selectedOrder.status === 'drying' && (
                                <button className="btn-update">Mark as Ready</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ShopOrderManagement
