import { useState } from 'react'
import './AdminShipperManagement.css'
import {
    CarOutlined,
    UserOutlined,
    SearchOutlined,
    FilterOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    StarOutlined,
    DollarOutlined,
    WarningOutlined,
    FileTextOutlined,
    EyeOutlined
} from '@ant-design/icons'

function AdminShipperManagement() {
    const [activeTab, setActiveTab] = useState('all')
    const [selectedShipper, setSelectedShipper] = useState(null)

    // Mock data - Statistics
    const stats = [
        {
            label: 'Total Shippers',
            value: '245',
            change: '+12 this month',
            icon: CarOutlined,
            color: '#3b82f6'
        },
        {
            label: 'Active Shippers',
            value: '198',
            change: '80.8% active rate',
            icon: CarOutlined,
            color: '#10b981'
        },
        {
            label: 'Total Earnings',
            value: '142.3M VND',
            change: '+15% vs last month',
            icon: DollarOutlined,
            color: '#f59e0b'
        },
        {
            label: 'Average Rating',
            value: '4.7',
            change: 'From 8,456 reviews',
            icon: StarOutlined,
            color: '#8b5cf6'
        }
    ]

    // Pending shipper applications
    const pendingShippers = [
        {
            id: 1,
            name: 'Nguyễn Văn X',
            phone: '0901234567',
            email: 'shipper1@email.com',
            vehicleType: 'Motorbike',
            licensePlate: '59A-12345',
            appliedDate: '2024-02-25',
            documents: ['CCCD', 'Driver License', 'Vehicle Registration', 'Profile Photo']
        },
        {
            id: 2,
            name: 'Trần Văn Y',
            phone: '0912345678',
            email: 'shipper2@email.com',
            vehicleType: 'Motorbike',
            licensePlate: '59B-67890',
            appliedDate: '2024-02-24',
            documents: ['CCCD', 'Driver License', 'Vehicle Registration']
        }
    ]

    // All shippers
    const allShippers = [
        {
            id: 'SHP-1001',
            name: 'Lê Văn A',
            phone: '0923456789',
            vehicleType: 'Motorbike',
            licensePlate: '59C-11111',
            rating: 4.9,
            totalDeliveries: 1245,
            totalEarnings: '24.5M',
            status: 'active',
            joinDate: '2023-08-15',
            lastActive: '2024-02-27 14:30'
        },
        {
            id: 'SHP-1002',
            name: 'Phạm Thị B',
            phone: '0934567890',
            vehicleType: 'Motorbike',
            licensePlate: '59D-22222',
            rating: 4.8,
            totalDeliveries: 1089,
            totalEarnings: '21.8M',
            status: 'active',
            joinDate: '2023-09-20',
            lastActive: '2024-02-27 13:15'
        },
        {
            id: 'SHP-1003',
            name: 'Hoàng Văn C',
            phone: '0945678901',
            vehicleType: 'Car',
            licensePlate: '59E-33333',
            rating: 4.7,
            totalDeliveries: 967,
            totalEarnings: '19.3M',
            status: 'active',
            joinDate: '2023-10-05',
            lastActive: '2024-02-27 12:00'
        },
        {
            id: 'SHP-1004',
            name: 'Võ Thị D',
            phone: '0956789012',
            vehicleType: 'Motorbike',
            licensePlate: '59F-44444',
            rating: 4.6,
            totalDeliveries: 756,
            totalEarnings: '15.1M',
            status: 'inactive',
            joinDate: '2023-11-12',
            lastActive: '2024-02-20 09:30'
        }
    ]

    // Top performers
    const topShippers = allShippers
        .filter(s => s.rating >= 4.8 && s.totalDeliveries >= 1000)
        .sort((a, b) => b.rating - a.rating)

    // Shipper incidents
    const incidents = [
        {
            id: '#INC-345',
            shipperId: 'SHP-1002',
            shipperName: 'Phạm Thị B',
            orderId: '#ORD-5234',
            issue: 'Late delivery - traffic jam',
            priority: 'low',
            status: 'resolved',
            date: '2024-02-26 16:45',
            reportedBy: 'Customer'
        },
        {
            id: '#INC-344',
            shipperId: 'SHP-1003',
            shipperName: 'Hoàng Văn C',
            orderId: '#ORD-5220',
            issue: 'Customer complained about attitude',
            priority: 'high',
            status: 'in-progress',
            date: '2024-02-27 10:30',
            reportedBy: 'Customer'
        },
        {
            id: '#INC-343',
            shipperId: 'SHP-1001',
            shipperName: 'Lê Văn A',
            orderId: '#ORD-5198',
            issue: 'Minor vehicle accident',
            priority: 'medium',
            status: 'pending',
            date: '2024-02-27 12:15',
            reportedBy: 'Shipper'
        }
    ]

    // Earnings/Payments
    const shipperPayments = [
        {
            id: 'SHP-1001',
            name: 'Lê Văn A',
            deliveries: 89,
            earnings: '1.78M',
            bonuses: '120K',
            total: '1.90M',
            status: 'pending',
            period: 'Feb 20-27'
        },
        {
            id: 'SHP-1002',
            name: 'Phạm Thị B',
            deliveries: 76,
            earnings: '1.52M',
            bonuses: '80K',
            total: '1.60M',
            status: 'paid',
            period: 'Feb 20-27'
        },
        {
            id: 'SHP-1003',
            name: 'Hoàng Văn C',
            deliveries: 65,
            earnings: '1.30M',
            bonuses: '50K',
            total: '1.35M',
            status: 'paid',
            period: 'Feb 20-27'
        }
    ]

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
            case 'paid':
            case 'resolved':
                return '#10b981'
            case 'pending':
            case 'in-progress':
                return '#f59e0b'
            case 'inactive':
            case 'suspended':
                return '#ef4444'
            default:
                return '#6b7280'
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

    const renderShipperTable = (data) => (
        <div className="admin-shipper-table">
            <table>
                <thead>
                    <tr>
                        <th>Shipper ID</th>
                        <th>Name</th>
                        <th>Contact</th>
                        <th>Vehicle</th>
                        <th>Rating</th>
                        <th>Deliveries</th>
                        <th>Earnings</th>
                        <th>Status</th>
                        <th>Last Active</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(shipper => (
                        <tr key={shipper.id}>
                            <td>
                                <div className="shipper-id">{shipper.id}</div>
                            </td>
                            <td>
                                <div className="shipper-name">
                                    <UserOutlined style={{ marginRight: 8, color: '#3b82f6' }} />
                                    {shipper.name}
                                </div>
                            </td>
                            <td>
                                <div className="shipper-contact">
                                    <div>{shipper.phone}</div>
                                </div>
                            </td>
                            <td>
                                <div className="vehicle-info">
                                    <CarOutlined style={{ marginRight: 6 }} />
                                    <div>
                                        <div>{shipper.vehicleType}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{shipper.licensePlate}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="shipper-rating">
                                    <StarOutlined style={{ color: '#f59e0b', marginRight: 4 }} />
                                    {shipper.rating}
                                </div>
                            </td>
                            <td>{shipper.totalDeliveries}</td>
                            <td>
                                <div className="shipper-earnings">{shipper.totalEarnings}</div>
                            </td>
                            <td>
                                <span
                                    className="shipper-status-badge"
                                    style={{ color: getStatusColor(shipper.status) }}
                                >
                                    ● {shipper.status}
                                </span>
                            </td>
                            <td>
                                <div style={{ fontSize: '13px', color: '#64748b' }}>{shipper.lastActive}</div>
                            </td>
                            <td>
                                <button
                                    className="shipper-action-btn"
                                    onClick={() => setSelectedShipper(shipper)}
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
        <div className="admin-shipper-management">
            <div className="admin-shipper-header">
                <div>
                    <h1 className="admin-shipper-title">Shipper Management</h1>
                    <p className="admin-shipper-subtitle">Manage shipper approvals, performance, earnings, and incidents</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="admin-shipper-stats">
                {stats.map((stat, index) => {
                    const IconComponent = stat.icon
                    return (
                        <div key={index} className="admin-shipper-stat-card">
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
            <div className="admin-shipper-tabs">
                <button
                    className={`admin-shipper-tab ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    <CarOutlined /> All Shippers ({allShippers.length})
                </button>
                <button
                    className={`admin-shipper-tab ${activeTab === 'approvals' ? 'active' : ''}`}
                    onClick={() => setActiveTab('approvals')}
                >
                    <CheckCircleOutlined /> Pending Approvals ({pendingShippers.length})
                </button>
                <button
                    className={`admin-shipper-tab ${activeTab === 'top' ? 'active' : ''}`}
                    onClick={() => setActiveTab('top')}
                >
                    <StarOutlined /> Top Performers ({topShippers.length})
                </button>
                <button
                    className={`admin-shipper-tab ${activeTab === 'payments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payments')}
                >
                    <DollarOutlined /> Payments ({shipperPayments.length})
                </button>
                <button
                    className={`admin-shipper-tab ${activeTab === 'incidents' ? 'active' : ''}`}
                    onClick={() => setActiveTab('incidents')}
                >
                    <WarningOutlined /> Incidents ({incidents.length})
                </button>
            </div>

            {/* All Shippers, Top Performers Tabs */}
            {(activeTab === 'all' || activeTab === 'top') && (
                <div className="admin-shipper-card">
                    <div className="admin-shipper-card-header">
                        <div className="admin-shipper-search">
                            <SearchOutlined className="search-icon" />
                            <input type="text" placeholder="Search shippers by name, ID, or phone..." />
                        </div>
                        <button className="admin-shipper-filter-btn">
                            <FilterOutlined /> Filters
                        </button>
                    </div>

                    {activeTab === 'all' && renderShipperTable(allShippers)}
                    {activeTab === 'top' && renderShipperTable(topShippers)}
                </div>
            )}

            {/* Pending Approvals Tab */}
            {activeTab === 'approvals' && (
                <div className="admin-shipper-card">
                    <div className="shipper-approvals">
                        {pendingShippers.map(shipper => (
                            <div key={shipper.id} className="approval-item">
                                <div className="approval-header">
                                    <div className="approval-info">
                                        <h4>{shipper.name}</h4>
                                        <div className="approval-meta">
                                            <span>📞 {shipper.phone}</span>
                                            <span>✉️ {shipper.email}</span>
                                            <span>🏍️ {shipper.vehicleType} - {shipper.licensePlate}</span>
                                        </div>
                                    </div>
                                    <div className="approval-date">Applied: {shipper.appliedDate}</div>
                                </div>
                                <div className="approval-documents">
                                    <strong>Documents:</strong>
                                    <div className="document-list">
                                        {shipper.documents.map((doc, idx) => (
                                            <span key={idx} className="document-badge">
                                                <FileTextOutlined /> {doc}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="approval-actions">
                                    <button className="btn-view-docs">View Documents</button>
                                    <button className="btn-reject">
                                        <CloseCircleOutlined /> Reject
                                    </button>
                                    <button className="btn-approve">
                                        <CheckCircleOutlined /> Approve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
                <div className="admin-shipper-card">
                    <div className="shipper-payments-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Shipper ID</th>
                                    <th>Name</th>
                                    <th>Period</th>
                                    <th>Deliveries</th>
                                    <th>Earnings</th>
                                    <th>Bonuses</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shipperPayments.map(payment => (
                                    <tr key={payment.id}>
                                        <td className="shipper-id">{payment.id}</td>
                                        <td>{payment.name}</td>
                                        <td>{payment.period}</td>
                                        <td>{payment.deliveries}</td>
                                        <td>{payment.earnings}</td>
                                        <td>{payment.bonuses}</td>
                                        <td>
                                            <div className="payment-total">{payment.total}</div>
                                        </td>
                                        <td>
                                            <span
                                                className="payment-status"
                                                style={{ color: getStatusColor(payment.status) }}
                                            >
                                                ● {payment.status}
                                            </span>
                                        </td>
                                        <td>
                                            {payment.status === 'pending' && (
                                                <button className="btn-pay">Process Payment</button>
                                            )}
                                            {payment.status === 'paid' && (
                                                <button className="btn-view-receipt">View Receipt</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Incidents Tab */}
            {activeTab === 'incidents' && (
                <div className="admin-shipper-card">
                    <div className="shipper-incidents">
                        {incidents.map(incident => (
                            <div key={incident.id} className="incident-item">
                                <div className="incident-header">
                                    <div className="incident-id-section">
                                        <span className="incident-id">{incident.id}</span>
                                        <span
                                            className="incident-priority"
                                            style={{ color: getPriorityColor(incident.priority) }}
                                        >
                                            ● {incident.priority}
                                        </span>
                                    </div>
                                    <span className={`incident-status status-${incident.status}`}>
                                        {incident.status}
                                    </span>
                                </div>
                                <div className="incident-content">
                                    <h4>{incident.issue}</h4>
                                    <div className="incident-details">
                                        <span>Shipper: {incident.shipperName} ({incident.shipperId})</span>
                                        <span>Order: {incident.orderId}</span>
                                        <span>Reported by: {incident.reportedBy}</span>
                                    </div>
                                    <div className="incident-date">📅 {incident.date}</div>
                                </div>
                                <div className="incident-actions">
                                    <button className="btn-view">View Details</button>
                                    <button className="btn-resolve">Resolve</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Shipper Detail Modal */}
            {selectedShipper && (
                <div className="shipper-detail-modal" onClick={() => setSelectedShipper(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Shipper Details</h2>
                            <button className="modal-close" onClick={() => setSelectedShipper(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="shipper-detail-section">
                                <h3>Basic Information</h3>
                                <div className="detail-grid">
                                    <div><strong>ID:</strong> {selectedShipper.id}</div>
                                    <div><strong>Name:</strong> {selectedShipper.name}</div>
                                    <div><strong>Phone:</strong> {selectedShipper.phone}</div>
                                    <div><strong>Vehicle:</strong> {selectedShipper.vehicleType}</div>
                                    <div><strong>License Plate:</strong> {selectedShipper.licensePlate}</div>
                                    <div><strong>Join Date:</strong> {selectedShipper.joinDate}</div>
                                </div>
                            </div>
                            <div className="shipper-detail-section">
                                <h3>Performance</h3>
                                <div className="detail-grid">
                                    <div><strong>Rating:</strong> ⭐ {selectedShipper.rating}</div>
                                    <div><strong>Total Deliveries:</strong> {selectedShipper.totalDeliveries}</div>
                                    <div><strong>Total Earnings:</strong> {selectedShipper.totalEarnings}</div>
                                    <div><strong>Status:</strong> <span style={{ color: getStatusColor(selectedShipper.status) }}>{selectedShipper.status}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminShipperManagement
