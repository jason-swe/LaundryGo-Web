import { useState } from 'react'
import './AdminCustomerManagement.css'
import {
    UserOutlined,
    SearchOutlined,
    FilterOutlined,
    DollarOutlined,
    ShoppingCartOutlined,
    StarOutlined,
    EyeOutlined,
    GiftOutlined,
    WarningOutlined
} from '@ant-design/icons'

function AdminCustomerManagement() {
    const [activeTab, setActiveTab] = useState('all')
    const [selectedCustomer, setSelectedCustomer] = useState(null)

    // Mock data - Customer statistics
    const stats = [
        {
            label: 'Total Customers',
            value: '12,458',
            change: '+8.2% vs last month',
            icon: UserOutlined,
            color: '#3b82f6'
        },
        {
            label: 'Active Customers',
            value: '8,342',
            change: '66.9% active rate',
            icon: UserOutlined,
            color: '#10b981'
        },
        {
            label: 'New This Month',
            value: '342',
            change: '+24 this week',
            icon: UserOutlined,
            color: '#f59e0b'
        },
        {
            label: 'Total Revenue',
            value: '845M VND',
            change: '+15% vs last month',
            icon: DollarOutlined,
            color: '#8b5cf6'
        }
    ]

    // All customers
    const customers = [
        {
            id: 'CUS-10234',
            name: 'Nguyễn Văn A',
            email: 'nguyenvana@email.com',
            phone: '0901234567',
            joinDate: '2024-01-15',
            totalSpent: '2.8M',
            totalOrders: 45,
            loyaltyPoints: 280,
            tier: 'Gold',
            status: 'active',
            lastOrder: '2024-02-26'
        },
        {
            id: 'CUS-10233',
            name: 'Trần Thị B',
            email: 'tranthib@email.com',
            phone: '0912345678',
            joinDate: '2024-01-20',
            totalSpent: '1.5M',
            totalOrders: 28,
            loyaltyPoints: 150,
            tier: 'Silver',
            status: 'active',
            lastOrder: '2024-02-25'
        },
        {
            id: 'CUS-10232',
            name: 'Lê Văn C',
            email: 'levanc@email.com',
            phone: '0923456789',
            joinDate: '2023-11-10',
            totalSpent: '5.2M',
            totalOrders: 89,
            loyaltyPoints: 520,
            tier: 'Platinum',
            status: 'active',
            lastOrder: '2024-02-27'
        },
        {
            id: 'CUS-10231',
            name: 'Phạm Thị D',
            email: 'phamthid@email.com',
            phone: '0934567890',
            joinDate: '2024-02-01',
            totalSpent: '450K',
            totalOrders: 5,
            loyaltyPoints: 45,
            tier: 'Bronze',
            status: 'active',
            lastOrder: '2024-02-20'
        },
        {
            id: 'CUS-10230',
            name: 'Hoàng Văn E',
            email: 'hoangvane@email.com',
            phone: '0945678901',
            joinDate: '2023-12-05',
            totalSpent: '850K',
            totalOrders: 12,
            loyaltyPoints: 85,
            tier: 'Bronze',
            status: 'inactive',
            lastOrder: '2024-01-15'
        }
    ]

    // VIP customers
    const vipCustomers = customers.filter(c => c.tier === 'Platinum' || c.tier === 'Gold')

    // Inactive customers (no orders in 30+ days)
    const inactiveCustomers = customers.filter(c => c.status === 'inactive')

    // Customer complaints
    const complaints = [
        {
            id: '#COM-156',
            customerId: 'CUS-10234',
            customerName: 'Nguyễn Văn A',
            orderId: '#ORD-5234',
            issue: 'Stain not removed properly',
            priority: 'medium',
            status: 'in-progress',
            date: '2024-02-27 14:30',
            assignedTo: 'Customer Service Team'
        },
        {
            id: '#COM-155',
            customerId: 'CUS-10232',
            customerName: 'Lê Văn C',
            orderId: '#ORD-5210',
            issue: 'Late delivery',
            priority: 'high',
            status: 'pending',
            date: '2024-02-27 12:15',
            assignedTo: 'Logistics Team'
        },
        {
            id: '#COM-154',
            customerId: 'CUS-10233',
            customerName: 'Trần Thị B',
            orderId: '#ORD-5198',
            issue: 'Missing item',
            priority: 'high',
            status: 'resolved',
            date: '2024-02-26 16:45',
            assignedTo: 'Operations Team'
        }
    ]

    const getTierColor = (tier) => {
        switch (tier) {
            case 'Platinum': return '#9333ea'
            case 'Gold': return '#f59e0b'
            case 'Silver': return '#6b7280'
            case 'Bronze': return '#a78bfa'
            default: return '#6b7280'
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#10b981'
            case 'inactive': return '#6b7280'
            case 'suspended': return '#ef4444'
            default: return '#6b7280'
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ef4444'
            case 'medium': return '#f59e0b'
            case 'low': return '#10b981'
            default: return '#6b7280'
        }
    }

    const renderCustomerTable = (data) => (
        <div className="admin-customer-table">
            <table>
                <thead>
                    <tr>
                        <th>Customer ID</th>
                        <th>Name</th>
                        <th>Contact</th>
                        <th>Join Date</th>
                        <th>Total Spent</th>
                        <th>Orders</th>
                        <th>Points</th>
                        <th>Tier</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(customer => (
                        <tr key={customer.id}>
                            <td>
                                <div className="customer-id">{customer.id}</div>
                            </td>
                            <td>
                                <div className="customer-name">
                                    <UserOutlined style={{ marginRight: 8, color: '#3b82f6' }} />
                                    {customer.name}
                                </div>
                            </td>
                            <td>
                                <div className="customer-contact">
                                    <div>{customer.email}</div>
                                    <div style={{ color: '#6b7280', fontSize: '13px' }}>{customer.phone}</div>
                                </div>
                            </td>
                            <td>{customer.joinDate}</td>
                            <td>
                                <div className="customer-spent">{customer.totalSpent}</div>
                            </td>
                            <td>
                                <div className="customer-orders">
                                    <ShoppingCartOutlined style={{ marginRight: 4 }} />
                                    {customer.totalOrders}
                                </div>
                            </td>
                            <td>
                                <div className="customer-points">
                                    <GiftOutlined style={{ marginRight: 4, color: '#f59e0b' }} />
                                    {customer.loyaltyPoints}
                                </div>
                            </td>
                            <td>
                                <span
                                    className="customer-tier-badge"
                                    style={{ backgroundColor: getTierColor(customer.tier) }}
                                >
                                    {customer.tier}
                                </span>
                            </td>
                            <td>
                                <span
                                    className="customer-status-badge"
                                    style={{ color: getStatusColor(customer.status) }}
                                >
                                    ● {customer.status}
                                </span>
                            </td>
                            <td>
                                <button
                                    className="customer-action-btn"
                                    onClick={() => setSelectedCustomer(customer)}
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
        <div className="admin-customer-management">
            <div className="admin-customer-header">
                <div>
                    <h1 className="admin-customer-title">Customer Management</h1>
                    <p className="admin-customer-subtitle">Manage customers, loyalty points, and support requests</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="admin-customer-stats">
                {stats.map((stat, index) => {
                    const IconComponent = stat.icon
                    return (
                        <div key={index} className="admin-customer-stat-card">
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
            <div className="admin-customer-tabs">
                <button
                    className={`admin-customer-tab ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    <UserOutlined /> All Customers ({customers.length})
                </button>
                <button
                    className={`admin-customer-tab ${activeTab === 'vip' ? 'active' : ''}`}
                    onClick={() => setActiveTab('vip')}
                >
                    <StarOutlined /> VIP Customers ({vipCustomers.length})
                </button>
                <button
                    className={`admin-customer-tab ${activeTab === 'inactive' ? 'active' : ''}`}
                    onClick={() => setActiveTab('inactive')}
                >
                    <WarningOutlined /> Inactive ({inactiveCustomers.length})
                </button>
                <button
                    className={`admin-customer-tab ${activeTab === 'complaints' ? 'active' : ''}`}
                    onClick={() => setActiveTab('complaints')}
                >
                    <WarningOutlined /> Complaints ({complaints.length})
                </button>
            </div>

            {/* Content based on active tab */}
            {(activeTab === 'all' || activeTab === 'vip' || activeTab === 'inactive') && (
                <div className="admin-customer-card">
                    <div className="admin-customer-card-header">
                        <div className="admin-customer-search">
                            <SearchOutlined className="search-icon" />
                            <input type="text" placeholder="Search customers by name, email, or ID..." />
                        </div>
                        <button className="admin-customer-filter-btn">
                            <FilterOutlined /> Filters
                        </button>
                    </div>

                    {activeTab === 'all' && renderCustomerTable(customers)}
                    {activeTab === 'vip' && renderCustomerTable(vipCustomers)}
                    {activeTab === 'inactive' && renderCustomerTable(inactiveCustomers)}
                </div>
            )}

            {/* Complaints Tab */}
            {activeTab === 'complaints' && (
                <div className="admin-customer-card">
                    <div className="admin-customer-complaints">
                        {complaints.map(complaint => (
                            <div key={complaint.id} className="complaint-item">
                                <div className="complaint-header">
                                    <div className="complaint-id-section">
                                        <span className="complaint-id">{complaint.id}</span>
                                        <span
                                            className="complaint-priority"
                                            style={{ color: getPriorityColor(complaint.priority) }}
                                        >
                                            ● {complaint.priority}
                                        </span>
                                    </div>
                                    <span className={`complaint-status status-${complaint.status}`}>
                                        {complaint.status}
                                    </span>
                                </div>
                                <div className="complaint-content">
                                    <h4>{complaint.issue}</h4>
                                    <div className="complaint-details">
                                        <span>Customer: {complaint.customerName} ({complaint.customerId})</span>
                                        <span>Order: {complaint.orderId}</span>
                                    </div>
                                    <div className="complaint-meta">
                                        <span>📅 {complaint.date}</span>
                                        <span>👤 Assigned to: {complaint.assignedTo}</span>
                                    </div>
                                </div>
                                <div className="complaint-actions">
                                    <button className="btn-view">View Details</button>
                                    <button className="btn-resolve">Resolve</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Customer Detail Modal */}
            {selectedCustomer && (
                <div className="customer-detail-modal" onClick={() => setSelectedCustomer(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Customer Details</h2>
                            <button className="modal-close" onClick={() => setSelectedCustomer(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="customer-detail-section">
                                <h3>Basic Information</h3>
                                <div className="detail-grid">
                                    <div><strong>ID:</strong> {selectedCustomer.id}</div>
                                    <div><strong>Name:</strong> {selectedCustomer.name}</div>
                                    <div><strong>Email:</strong> {selectedCustomer.email}</div>
                                    <div><strong>Phone:</strong> {selectedCustomer.phone}</div>
                                    <div><strong>Join Date:</strong> {selectedCustomer.joinDate}</div>
                                    <div><strong>Last Order:</strong> {selectedCustomer.lastOrder}</div>
                                </div>
                            </div>
                            <div className="customer-detail-section">
                                <h3>Statistics</h3>
                                <div className="detail-grid">
                                    <div><strong>Total Spent:</strong> {selectedCustomer.totalSpent}</div>
                                    <div><strong>Total Orders:</strong> {selectedCustomer.totalOrders}</div>
                                    <div><strong>Loyalty Points:</strong> {selectedCustomer.loyaltyPoints}</div>
                                    <div><strong>Tier:</strong> <span style={{ color: getTierColor(selectedCustomer.tier) }}>{selectedCustomer.tier}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminCustomerManagement
