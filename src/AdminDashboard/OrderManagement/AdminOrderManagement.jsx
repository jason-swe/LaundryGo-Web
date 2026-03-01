import { useState } from 'react'
import './AdminOrderManagement.css'
import {
    ShoppingCartOutlined,
    SearchOutlined,
    FilterOutlined,
    EyeOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    CloseCircleOutlined
} from '@ant-design/icons'

function AdminOrderManagement() {
    const [activeTab, setActiveTab] = useState('all')
    const [selectedOrder, setSelectedOrder] = useState(null)

    // Mock data - Statistics
    const stats = [
        {
            label: 'Total Orders Today',
            value: '1,847',
            change: '+12% vs yesterday',
            icon: ShoppingCartOutlined,
            color: '#3b82f6'
        },
        {
            label: 'In Progress',
            value: '342',
            change: '18.5% of total',
            icon: SyncOutlined,
            color: '#f59e0b'
        },
        {
            label: 'Completed Today',
            value: '1,489',
            change: '80.6% completion rate',
            icon: CheckCircleOutlined,
            color: '#10b981'
        },
        {
            label: 'Issues/Complaints',
            value: '16',
            change: '0.9% issue rate',
            icon: CloseCircleOutlined,
            color: '#ef4444'
        }
    ]

    // All orders
    const orders = [
        {
            id: '#ORD-10234',
            customer: 'Nguyễn Văn A',
            customerId: 'CUS-10234',
            shop: 'FPT Laundry Shop',
            shopId: 'SHP-001',
            shipper: 'Lê Văn A',
            shipperId: 'SHP-1001',
            service: 'Wash & Dry',
            weight: '5kg',
            amount: '150K',
            status: 'completed',
            orderDate: '2024-02-27 08:30',
            completedDate: '2024-02-27 16:30',
            pickupAddress: '123 Nguyen Hue, District 1',
            deliveryAddress: '123 Nguyen Hue, District 1'
        },
        {
            id: '#ORD-10233',
            customer: 'Trần Thị B',
            customerId: 'CUS-10233',
            shop: 'Clean & Fresh',
            shopId: 'SHP-002',
            shipper: 'Phạm Thị B',
            shipperId: 'SHP-1002',
            service: 'Dry Clean',
            weight: '3kg',
            amount: '200K',
            status: 'in-progress',
            orderDate: '2024-02-27 10:15',
            pickupAddress: '456 Le Loi, District 3',
            deliveryAddress: '456 Le Loi, District 3',
            currentStep: 'washing'
        },
        {
            id: '#ORD-10232',
            customer: 'Lê Văn C',
            customerId: 'CUS-10232',
            shop: 'Express Wash',
            shopId: 'SHP-003',
            shipper: 'Pending',
            shipperId: null,
            service: 'Express Wash',
            weight: '7kg',
            amount: '280K',
            status: 'pending-pickup',
            orderDate: '2024-02-27 14:00',
            pickupAddress: '789 Tran Hung Dao, District 5',
            deliveryAddress: '789 Tran Hung Dao, District 5'
        },
        {
            id: '#ORD-10231',
            customer: 'Phạm Thị D',
            customerId: 'CUS-10231',
            shop: 'LaundryPro',
            shopId: 'SHP-004',
            shipper: 'Hoàng Văn C',
            shipperId: 'SHP-1003',
            service: 'Wash & Iron',
            weight: '4kg',
            amount: '180K',
            status: 'delivering',
            orderDate: '2024-02-27 09:00',
            pickupAddress: '321 Vo Van Tan, District 3',
            deliveryAddress: '321 Vo Van Tan, District 3',
            currentStep: 'delivering'
        },
        {
            id: '#ORD-10230',
            customer: 'Hoàng Văn E',
            customerId: 'CUS-10230',
            shop: 'Quick Clean',
            shopId: 'SHP-005',
            shipper: 'Võ Thị D',
            shipperId: 'SHP-1004',
            service: 'Wash & Dry',
            weight: '6kg',
            amount: '190K',
            status: 'cancelled',
            orderDate: '2024-02-26 15:30',
            cancelledDate: '2024-02-26 16:00',
            cancelReason: 'Customer request',
            pickupAddress: '555 Nguyen Thi Minh Khai, District 1',
            deliveryAddress: '555 Nguyen Thi Minh Khai, District 1'
        }
    ]

    // Filter orders by status
    const pendingOrders = orders.filter(o => o.status === 'pending-pickup')
    const inProgressOrders = orders.filter(o => o.status === 'in-progress' || o.status === 'delivering')
    const completedOrders = orders.filter(o => o.status === 'completed')
    const cancelledOrders = orders.filter(o => o.status === 'cancelled')

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return '#10b981'
            case 'in-progress':
            case 'delivering':
                return '#3b82f6'
            case 'pending-pickup':
                return '#f59e0b'
            case 'cancelled':
                return '#ef4444'
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
            'cancelled': 'Cancelled'
        }
        return statusMap[status] || status
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
                    {data.map(order => (
                        <tr key={order.id}>
                            <td>
                                <div className="order-id">{order.id}</div>
                            </td>
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
                            <td>
                                <div className="order-weight">{order.weight}</div>
                            </td>
                            <td>
                                <div className="order-amount">{order.amount}</div>
                            </td>
                            <td>
                                <div className="order-date">{order.orderDate}</div>
                            </td>
                            <td>
                                <span
                                    className="order-status-badge"
                                    style={{ color: getStatusColor(order.status) }}
                                >
                                    {getStatusIcon(order.status)} {getStatusText(order.status)}
                                </span>
                            </td>
                            <td>
                                <button
                                    className="order-action-btn"
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    <EyeOutlined /> View
                                </button>
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
                        <input type="text" placeholder="Search by order ID, customer, shop..." />
                    </div>
                    <button className="admin-order-filter-btn">
                        <FilterOutlined /> Filters
                    </button>
                </div>

                {activeTab === 'all' && renderOrderTable(orders)}
                {activeTab === 'pending' && renderOrderTable(pendingOrders)}
                {activeTab === 'in-progress' && renderOrderTable(inProgressOrders)}
                {activeTab === 'completed' && renderOrderTable(completedOrders)}
                {activeTab === 'cancelled' && renderOrderTable(cancelledOrders)}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="order-detail-modal" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Order Details - {selectedOrder.id}</h2>
                            <button className="modal-close" onClick={() => setSelectedOrder(null)}>×</button>
                        </div>
                        <div className="modal-body">
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
                                <h3>Customer Information</h3>
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

                            {selectedOrder.status === 'completed' && (
                                <div className="order-detail-section">
                                    <h3>Completion</h3>
                                    <div><strong>Completed Date:</strong> {selectedOrder.completedDate}</div>
                                </div>
                            )}

                            {selectedOrder.status === 'cancelled' && (
                                <div className="order-detail-section">
                                    <h3>Cancellation</h3>
                                    <div className="detail-grid">
                                        <div><strong>Cancelled Date:</strong> {selectedOrder.cancelledDate}</div>
                                        <div><strong>Reason:</strong> {selectedOrder.cancelReason}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminOrderManagement
