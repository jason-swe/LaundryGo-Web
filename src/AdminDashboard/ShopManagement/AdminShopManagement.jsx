import { useState } from 'react'
import './AdminShopManagement.css'
import {
    ShopOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SearchOutlined,
    FilterOutlined,
    StarOutlined,
    FileTextOutlined,
    WarningOutlined
} from '@ant-design/icons'

function AdminShopManagement() {
    const [activeTab, setActiveTab] = useState('all')

    // Mock data - Pending shop approvals
    const pendingShops = [
        {
            id: 1,
            name: 'Sparkle Laundry',
            owner: 'Nguyen Van A',
            location: 'District 1, HCMC',
            phone: '0901234567',
            email: 'sparkle@email.com',
            machines: 15,
            submittedDate: '2024-02-25',
            documents: ['Business License', 'Tax Certificate', 'Location Photo']
        },
        {
            id: 2,
            name: 'Fresh & Clean',
            owner: 'Tran Thi B',
            location: 'District 7, HCMC',
            phone: '0912345678',
            email: 'fresh@email.com',
            machines: 20,
            submittedDate: '2024-02-24',
            documents: ['Business License', 'Tax Certificate']
        }
    ]

    // All partner shops
    const allShops = [
        {
            id: 1,
            name: 'FPT Laundry Shop',
            owner: 'Le Van C',
            location: 'District 3, HCMC',
            rating: 4.9,
            reviews: 2341,
            orders: 1245,
            revenue: '124.5M',
            status: 'active',
            joinDate: '2023-08-15'
        },
        {
            id: 2,
            name: 'Clean & Fresh',
            owner: 'Pham Thi D',
            location: 'District 5, HCMC',
            rating: 4.8,
            reviews: 1876,
            orders: 1089,
            revenue: '108.9M',
            status: 'active',
            joinDate: '2023-09-20'
        },
        {
            id: 3,
            name: 'Express Wash',
            owner: 'Hoang Van E',
            location: 'District 10, HCMC',
            rating: 4.7,
            reviews: 1543,
            orders: 967,
            revenue: '96.7M',
            status: 'active',
            joinDate: '2023-10-05'
        }
    ]

    // Document update requests
    const documentUpdates = [
        {
            id: 1,
            shopName: 'FPT Laundry Shop',
            documentType: 'Business License Renewal',
            submittedDate: '2024-02-26',
            expiryDate: '2024-03-15',
            status: 'pending'
        },
        {
            id: 2,
            shopName: 'Clean & Fresh',
            documentType: 'Tax Certificate Update',
            submittedDate: '2024-02-25',
            expiryDate: '2024-04-01',
            status: 'pending'
        }
    ]

    // Incident reports from shops
    const incidents = [
        {
            id: '#INC-245',
            shop: 'FPT Laundry Shop',
            category: 'Equipment',
            priority: 'high',
            title: 'Washing machine malfunction',
            description: 'Machine A3 stopped working during cycle',
            status: 'in-progress',
            reportedDate: '2024-02-27 10:30',
            assignedTo: 'Tech Support Team'
        },
        {
            id: '#INC-244',
            shop: 'Clean & Fresh',
            category: 'Customer',
            priority: 'medium',
            title: 'Customer complaint about service quality',
            description: 'Customer reported stains not fully removed',
            status: 'pending',
            reportedDate: '2024-02-27 09:15',
            assignedTo: 'Customer Service Team'
        }
    ]

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#10b981'
            case 'pending': return '#f59e0b'
            case 'in-progress': return '#3b82f6'
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

    return (
        <div className="admin-shop-management">
            <div className="admin-shop-management-header">
                <div>
                    <h1 className="admin-shop-management-title">Partner Shop Management</h1>
                    <p className="admin-shop-management-subtitle">Manage shop approvals, ratings, documents, and incidents</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="admin-shop-management-tabs">
                <button
                    className={`admin-shop-tab ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    <ShopOutlined /> All Shops ({allShops.length})
                </button>
                <button
                    className={`admin-shop-tab ${activeTab === 'approvals' ? 'active' : ''}`}
                    onClick={() => setActiveTab('approvals')}
                >
                    <CheckCircleOutlined /> Pending Approvals ({pendingShops.length})
                </button>
                <button
                    className={`admin-shop-tab ${activeTab === 'documents' ? 'active' : ''}`}
                    onClick={() => setActiveTab('documents')}
                >
                    <FileTextOutlined /> Document Updates ({documentUpdates.length})
                </button>
                <button
                    className={`admin-shop-tab ${activeTab === 'incidents' ? 'active' : ''}`}
                    onClick={() => setActiveTab('incidents')}
                >
                    <WarningOutlined /> Incidents ({incidents.length})
                </button>
            </div>

            {/* All Shops Table */}
            {activeTab === 'all' && (
                <div className="admin-shop-card">
                    <div className="admin-shop-card-header">
                        <div className="admin-shop-search">
                            <SearchOutlined className="search-icon" />
                            <input type="text" placeholder="Search shops..." />
                        </div>
                        <button className="admin-shop-filter-btn">
                            <FilterOutlined /> Filters
                        </button>
                    </div>

                    <div className="admin-shop-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Shop Name</th>
                                    <th>Owner</th>
                                    <th>Location</th>
                                    <th>Rating</th>
                                    <th>Orders</th>
                                    <th>Revenue</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allShops.map((shop) => (
                                    <tr key={shop.id}>
                                        <td className="shop-name-cell">
                                            <ShopOutlined className="shop-icon" />
                                            {shop.name}
                                        </td>
                                        <td>{shop.owner}</td>
                                        <td>{shop.location}</td>
                                        <td>
                                            <div className="rating-cell">
                                                <StarOutlined style={{ color: '#f59e0b' }} />
                                                {shop.rating} ({shop.reviews})
                                            </div>
                                        </td>
                                        <td>{shop.orders}</td>
                                        <td className="revenue-cell">{shop.revenue}</td>
                                        <td>
                                            <span
                                                className="status-badge"
                                                style={{
                                                    background: `${getStatusColor(shop.status)}20`,
                                                    color: getStatusColor(shop.status)
                                                }}
                                            >
                                                {shop.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="admin-shop-action-btn">View Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pending Approvals */}
            {activeTab === 'approvals' && (
                <div className="admin-shop-approvals-grid">
                    {pendingShops.map((shop) => (
                        <div key={shop.id} className="admin-shop-approval-card">
                            <div className="approval-card-header">
                                <ShopOutlined className="approval-icon" />
                                <h3>{shop.name}</h3>
                            </div>
                            <div className="approval-card-content">
                                <div className="approval-info-row">
                                    <span className="label">Owner:</span>
                                    <span className="value">{shop.owner}</span>
                                </div>
                                <div className="approval-info-row">
                                    <span className="label">Location:</span>
                                    <span className="value">{shop.location}</span>
                                </div>
                                <div className="approval-info-row">
                                    <span className="label">Phone:</span>
                                    <span className="value">{shop.phone}</span>
                                </div>
                                <div className="approval-info-row">
                                    <span className="label">Machines:</span>
                                    <span className="value">{shop.machines} units</span>
                                </div>
                                <div className="approval-info-row">
                                    <span className="label">Submitted:</span>
                                    <span className="value">{shop.submittedDate}</span>
                                </div>
                                <div className="approval-documents">
                                    <span className="label">Documents:</span>
                                    <div className="document-badges">
                                        {shop.documents.map((doc, index) => (
                                            <span key={index} className="document-badge">{doc}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="approval-card-actions">
                                <button className="approve-btn">
                                    <CheckCircleOutlined /> Approve
                                </button>
                                <button className="reject-btn">
                                    <CloseCircleOutlined /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Document Updates */}
            {activeTab === 'documents' && (
                <div className="admin-shop-card">
                    <div className="admin-shop-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Shop Name</th>
                                    <th>Document Type</th>
                                    <th>Submitted Date</th>
                                    <th>Expiry Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documentUpdates.map((doc) => (
                                    <tr key={doc.id}>
                                        <td className="shop-name-cell">
                                            <ShopOutlined className="shop-icon" />
                                            {doc.shopName}
                                        </td>
                                        <td>{doc.documentType}</td>
                                        <td>{doc.submittedDate}</td>
                                        <td className="expiry-cell">{doc.expiryDate}</td>
                                        <td>
                                            <span
                                                className="status-badge"
                                                style={{
                                                    background: `${getStatusColor(doc.status)}20`,
                                                    color: getStatusColor(doc.status)
                                                }}
                                            >
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="admin-shop-action-btn primary">Review</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Incidents */}
            {activeTab === 'incidents' && (
                <div className="admin-shop-incidents-grid">
                    {incidents.map((incident) => (
                        <div key={incident.id} className="admin-shop-incident-card">
                            <div className="incident-card-header">
                                <div className="incident-id-priority">
                                    <span className="incident-id">{incident.id}</span>
                                    <span
                                        className="priority-badge"
                                        style={{
                                            background: `${getPriorityColor(incident.priority)}20`,
                                            color: getPriorityColor(incident.priority)
                                        }}
                                    >
                                        {incident.priority}
                                    </span>
                                </div>
                                <span
                                    className="status-badge"
                                    style={{
                                        background: `${getStatusColor(incident.status)}20`,
                                        color: getStatusColor(incident.status)
                                    }}
                                >
                                    {incident.status}
                                </span>
                            </div>
                            <div className="incident-card-content">
                                <h3 className="incident-title">{incident.title}</h3>
                                <p className="incident-description">{incident.description}</p>
                                <div className="incident-meta">
                                    <div className="incident-meta-item">
                                        <ShopOutlined />
                                        <span>{incident.shop}</span>
                                    </div>
                                    <div className="incident-meta-item">
                                        <FileTextOutlined />
                                        <span>{incident.category}</span>
                                    </div>
                                </div>
                                <div className="incident-footer">
                                    <span className="incident-date">{incident.reportedDate}</span>
                                    <span className="incident-assigned">Assigned: {incident.assignedTo}</span>
                                </div>
                            </div>
                            <div className="incident-card-actions">
                                <button className="incident-action-btn view">View Details</button>
                                <button className="incident-action-btn resolve">Mark Resolved</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default AdminShopManagement
