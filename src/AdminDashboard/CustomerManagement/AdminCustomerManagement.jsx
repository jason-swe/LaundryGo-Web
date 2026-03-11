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
    WarningOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    ExclamationCircleOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons'
import {
    adminCustomers as customersData,
    customerComplaints as complaintsData
} from '../../data'
import toast from '../../utils/toast'

const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum']
const CUSTOMER_STATUSES = ['active', 'inactive', 'suspended']

const EMPTY_FORM = {
    name: '', email: '', phone: '', address: '',
    tier: 'Bronze', status: 'active',
    totalSpent: '0', totalSpentValue: 0,
    totalOrders: 0, loyaltyPoints: 0,
    joinDate: new Date().toISOString().split('T')[0],
    lastOrder: new Date().toISOString().split('T')[0],
    avatar: null,
}

function AdminCustomerManagement() {
    const [activeTab, setActiveTab] = useState('all')
    const [customers, setCustomers] = useState(customersData)
    const [complaints, setComplaints] = useState(complaintsData)
    const [searchQuery, setSearchQuery] = useState('')

    // modal: null | 'view' | 'create' | 'edit' | 'delete'
    const [modal, setModal] = useState(null)
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [formData, setFormData] = useState(EMPTY_FORM)
    const [deleteTarget, setDeleteTarget] = useState(null)

    const activeCount = customers.filter(c => c.status === 'active').length

    const stats = [
        { label: 'Total Customers', value: String(customers.length), change: '+8.2% vs last month', icon: UserOutlined, color: '#719FC2' },
        { label: 'Active Customers', value: String(activeCount), change: activeCount + '% active rate', icon: UserOutlined, color: '#4d9e84' },
        { label: 'New This Month', value: '342', change: '+24 this week', icon: UserOutlined, color: '#5492b4' },
        { label: 'Total Revenue', value: '845M VND', change: '+15% vs last month', icon: DollarOutlined, color: '#719FC2' }
    ]

    const filteredCustomers = customers.filter(c =>
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    const vipCustomers = filteredCustomers.filter(c => c.tier === 'Platinum' || c.tier === 'Gold')
    const inactiveCustomers = filteredCustomers.filter(c => c.status === 'inactive')

    const getTierColor = (tier) => {
        switch (tier) {
            case 'Platinum': return '#9333ea'
            case 'Gold': return '#5492b4'
            case 'Silver': return '#6b7280'
            case 'Bronze': return '#a78bfa'
            default: return '#6b7280'
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#4d9e84'
            case 'inactive': return '#6b7280'
            case 'suspended': return '#c05a50'
            default: return '#6b7280'
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#c05a50'
            case 'medium': return '#5492b4'
            case 'low': return '#4d9e84'
            default: return '#6b7280'
        }
    }

    // ── CRUD Handlers ──────────────────────────────────────
    const openView = (customer) => { setSelectedCustomer(customer); setModal('view') }
    const openEdit = (customer) => { setFormData({ ...customer }); setModal('edit') }
    const openCreate = () => { setFormData({ ...EMPTY_FORM }); setModal('create') }
    const openDelete = (customer) => { setDeleteTarget(customer); setModal('delete') }
    const closeModal = () => { setModal(null); setSelectedCustomer(null); setDeleteTarget(null) }

    const handleFormChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCreate = () => {
        if (!formData.name || !formData.email) return
        const nextNum = Math.max(...customers.map(c => parseInt(c.id.replace(/\D/g, '')) || 0)) + 1
        const newCustomer = { ...formData, id: `CUS-${nextNum}` }
        setCustomers(prev => [newCustomer, ...prev])
        toast.success(`Customer created: ${newCustomer.name}`)
        closeModal()
    }

    const handleUpdate = () => {
        if (!formData.name || !formData.email) return
        setCustomers(prev => prev.map(c => c.id === formData.id ? { ...formData } : c))
        toast.success(`Customer updated: ${formData.name}`)
        closeModal()
    }

    const handleDelete = () => {
        setCustomers(prev => prev.filter(c => c.id !== deleteTarget.id))
        toast.error(`Customer deleted: ${deleteTarget.name}`)
        closeModal()
    }

    const handleToggleStatus = (customerId) => {
        setCustomers(prev => prev.map(c => c.id === customerId
            ? { ...c, status: c.status === 'active' ? 'suspended' : 'active' } : c))
        if (selectedCustomer?.id === customerId)
            setSelectedCustomer(prev => ({ ...prev, status: prev.status === 'active' ? 'suspended' : 'active' }))
        const customer = customers.find(c => c.id === customerId)
        toast.success(`${customer?.name || 'Customer'} status updated`)
    }

    const handleResolveComplaint = (complaintId) => {
        setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, status: 'resolved' } : c))
        toast.success('Complaint resolved!')
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
                    {data.length === 0 ? (
                        <tr><td colSpan={10} className="admin-customer-empty">No customers found</td></tr>
                    ) : data.map(customer => (
                        <tr key={customer.id}>
                            <td><div className="customer-id">{customer.id}</div></td>
                            <td>
                                <div className="customer-name">
                                    <UserOutlined style={{ marginRight: 8, color: '#719FC2' }} />
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
                            <td><div className="customer-spent">{customer.totalSpent}</div></td>
                            <td>
                                <div className="customer-orders">
                                    <ShoppingCartOutlined style={{ marginRight: 4 }} />{customer.totalOrders}
                                </div>
                            </td>
                            <td>
                                <div className="customer-points">
                                    <GiftOutlined style={{ marginRight: 4, color: '#5492b4' }} />{customer.loyaltyPoints}
                                </div>
                            </td>
                            <td>
                                <span className="customer-tier-badge" style={{ backgroundColor: getTierColor(customer.tier) }}>
                                    {customer.tier}
                                </span>
                            </td>
                            <td>
                                <span className="customer-status-badge" style={{ color: getStatusColor(customer.status) }}>
                                    ● {customer.status}
                                </span>
                            </td>
                            <td>
                                <div className="customer-actions-cell">
                                    <button className="admin-customer-icon-btn view-btn" onClick={() => openView(customer)} title="View"><EyeOutlined /></button>
                                    <button className="admin-customer-icon-btn edit-btn" onClick={() => openEdit(customer)} title="Edit"><EditOutlined /></button>
                                    <button className="admin-customer-icon-btn delete-btn" onClick={() => openDelete(customer)} title="Delete"><DeleteOutlined /></button>
                                </div>
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
                <button className="admin-customer-create-btn" onClick={openCreate}>
                    <PlusOutlined /> Add Customer
                </button>
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
                <button className={`admin-customer-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                    <UserOutlined /> All Customers ({customers.length})
                </button>
                <button className={`admin-customer-tab ${activeTab === 'vip' ? 'active' : ''}`} onClick={() => setActiveTab('vip')}>
                    <StarOutlined /> VIP Customers ({vipCustomers.length})
                </button>
                <button className={`admin-customer-tab ${activeTab === 'inactive' ? 'active' : ''}`} onClick={() => setActiveTab('inactive')}>
                    <WarningOutlined /> Inactive ({inactiveCustomers.length})
                </button>
                <button className={`admin-customer-tab ${activeTab === 'complaints' ? 'active' : ''}`} onClick={() => setActiveTab('complaints')}>
                    <WarningOutlined /> Complaints ({complaints.length})
                </button>
            </div>

            {/* Customer Tables */}
            {(activeTab === 'all' || activeTab === 'vip' || activeTab === 'inactive') && (
                <div className="admin-customer-card">
                    <div className="admin-customer-card-header">
                        <div className="admin-customer-search">
                            <SearchOutlined className="search-icon" />
                            <input type="text" placeholder="Search customers by name, email, or ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <button className="admin-customer-filter-btn"><FilterOutlined /> Filters</button>
                    </div>
                    {activeTab === 'all' && renderCustomerTable(filteredCustomers)}
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
                                        <span className="complaint-priority" style={{ color: getPriorityColor(complaint.priority) }}>
                                            ● {complaint.priority}
                                        </span>
                                    </div>
                                    <span className={`complaint-status status-${complaint.status}`}>{complaint.status}</span>
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
                                    {complaint.status !== 'resolved' && (
                                        <button className="btn-resolve" onClick={() => handleResolveComplaint(complaint.id)}>Resolve</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── View Modal ── */}
            {modal === 'view' && selectedCustomer && (
                <div className="customer-modal-overlay" onClick={closeModal}>
                    <div className="customer-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="customer-modal-header">
                            <h2><UserOutlined style={{ marginRight: 8 }} />{selectedCustomer.name}</h2>
                            <button className="customer-modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="customer-modal-body">
                            <div className="customer-detail-section">
                                <h3>Basic Information</h3>
                                <div className="detail-grid">
                                    <div><strong>ID:</strong> {selectedCustomer.id}</div>
                                    <div><strong>Status:</strong> <span style={{ color: getStatusColor(selectedCustomer.status), fontWeight: 600 }}>{selectedCustomer.status}</span></div>
                                    <div><strong>Email:</strong> {selectedCustomer.email}</div>
                                    <div><strong>Phone:</strong> {selectedCustomer.phone}</div>
                                    <div><strong>Join Date:</strong> {selectedCustomer.joinDate}</div>
                                    <div><strong>Last Order:</strong> {selectedCustomer.lastOrder}</div>
                                    <div><strong>Address:</strong> {selectedCustomer.address}</div>
                                </div>
                            </div>
                            <div className="customer-detail-section">
                                <h3>Statistics</h3>
                                <div className="detail-grid">
                                    <div><strong>Total Spent:</strong> {selectedCustomer.totalSpent}</div>
                                    <div><strong>Total Orders:</strong> {selectedCustomer.totalOrders}</div>
                                    <div><strong>Loyalty Points:</strong> {selectedCustomer.loyaltyPoints}</div>
                                    <div><strong>Tier:</strong> <span style={{ color: getTierColor(selectedCustomer.tier), fontWeight: 600 }}>{selectedCustomer.tier}</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="customer-modal-footer">
                            <button className={`customer-modal-btn ${selectedCustomer.status === 'active' ? 'danger' : 'success'}`} onClick={() => handleToggleStatus(selectedCustomer.id)}>
                                {selectedCustomer.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                            <button className="customer-modal-btn secondary" onClick={closeModal}>Close</button>
                            <button className="customer-modal-btn primary" onClick={() => { closeModal(); openEdit(selectedCustomer) }}>
                                <EditOutlined /> Edit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Create / Edit Modal ── */}
            {(modal === 'create' || modal === 'edit') && (
                <div className="customer-modal-overlay" onClick={closeModal}>
                    <div className="customer-modal-content customer-modal-form" onClick={e => e.stopPropagation()}>
                        <div className="customer-modal-header">
                            <h2>{modal === 'create' ? <><PlusOutlined /> Add New Customer</> : <><EditOutlined /> Edit Customer — {formData.id}</>}</h2>
                            <button className="customer-modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="customer-modal-body">
                            <div className="customer-form-grid">
                                <div className="customer-form-group">
                                    <label>Full Name <span className="required">*</span></label>
                                    <input name="name" value={formData.name} onChange={handleFormChange} placeholder="Nguyễn Văn A" />
                                </div>
                                <div className="customer-form-group">
                                    <label>Email <span className="required">*</span></label>
                                    <input name="email" value={formData.email} onChange={handleFormChange} placeholder="email@example.com" />
                                </div>
                                <div className="customer-form-group">
                                    <label>Phone</label>
                                    <input name="phone" value={formData.phone} onChange={handleFormChange} placeholder="09xxxxxxxx" />
                                </div>
                                <div className="customer-form-group">
                                    <label>Tier</label>
                                    <select name="tier" value={formData.tier} onChange={handleFormChange}>
                                        {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="customer-form-group">
                                    <label>Status</label>
                                    <select name="status" value={formData.status} onChange={handleFormChange}>
                                        {CUSTOMER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div className="customer-form-group">
                                    <label>Loyalty Points</label>
                                    <input name="loyaltyPoints" type="number" min="0" value={formData.loyaltyPoints} onChange={handleFormChange} />
                                </div>
                                <div className="customer-form-group customer-form-group-full">
                                    <label>Address</label>
                                    <input name="address" value={formData.address} onChange={handleFormChange} placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM" />
                                </div>
                            </div>
                        </div>
                        <div className="customer-modal-footer">
                            <button className="customer-modal-btn secondary" onClick={closeModal}>Cancel</button>
                            <button
                                className="customer-modal-btn primary"
                                onClick={modal === 'create' ? handleCreate : handleUpdate}
                                disabled={!formData.name || !formData.email}
                            >
                                {modal === 'create' ? <><PlusOutlined /> Create Customer</> : <><CheckCircleOutlined /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm Modal ── */}
            {modal === 'delete' && deleteTarget && (
                <div className="customer-modal-overlay" onClick={closeModal}>
                    <div className="customer-modal-content customer-modal-delete" onClick={e => e.stopPropagation()}>
                        <div className="customer-modal-header">
                            <h2><ExclamationCircleOutlined style={{ color: '#c05a50', marginRight: 8 }} />Delete Customer</h2>
                            <button className="customer-modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="customer-modal-body">
                            <p className="customer-delete-msg">Are you sure you want to delete <strong>{deleteTarget.name}</strong>?</p>
                            <div className="customer-delete-info">
                                <div><strong>ID:</strong> {deleteTarget.id}</div>
                                <div><strong>Email:</strong> {deleteTarget.email}</div>
                                <div><strong>Tier:</strong> {deleteTarget.tier}</div>
                                <div><strong>Status:</strong> {deleteTarget.status}</div>
                            </div>
                            <p className="customer-delete-warning">This action cannot be undone.</p>
                        </div>
                        <div className="customer-modal-footer">
                            <button className="customer-modal-btn secondary" onClick={closeModal}>Cancel</button>
                            <button className="customer-modal-btn danger" onClick={handleDelete}><DeleteOutlined /> Delete Customer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminCustomerManagement

