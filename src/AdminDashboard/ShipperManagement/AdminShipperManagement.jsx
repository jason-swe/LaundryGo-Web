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
    FileTextOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons'
import {
    shippers as shippersData,
    pendingShippers as pendingShippersData,
    shipperPayments as shipperPaymentsData
} from '../../data'
import toast from '../../utils/toast'

const VEHICLE_TYPES = ['Motorbike', 'Car']
const SHIPPER_STATUSES = ['active', 'inactive']

const EMPTY_FORM = {
    name: '', phone: '', email: '',
    vehicleType: 'Motorbike', licensePlate: '',
    address: '', birthDate: '', identityCard: '',
    status: 'active',
    rating: 0, totalDeliveries: 0, totalEarnings: '0',
    joinDate: new Date().toISOString().split('T')[0],
    lastActive: new Date().toISOString().replace('T', ' ').slice(0, 16),
}

function AdminShipperManagement() {
    const [activeTab, setActiveTab] = useState('all')
    const [allShippers, setAllShippers] = useState(shippersData)
    const [pendingShippers, setPendingShippers] = useState(pendingShippersData)
    const [shipperPayments, setShipperPayments] = useState(shipperPaymentsData)
    const [searchQuery, setSearchQuery] = useState('')

    // modal: null | 'view' | 'create' | 'edit' | 'delete'
    const [modal, setModal] = useState(null)
    const [selectedShipper, setSelectedShipper] = useState(null)
    const [formData, setFormData] = useState(EMPTY_FORM)
    const [deleteTarget, setDeleteTarget] = useState(null)

    const activeCount = allShippers.filter(s => s.status === 'active').length

    const stats = [
        { label: 'Total Shippers', value: String(allShippers.length), change: '+12 this month', icon: CarOutlined, color: '#719FC2' },
        { label: 'Active Shippers', value: String(activeCount), change: `${Math.round(activeCount / allShippers.length * 100)}% active rate`, icon: CarOutlined, color: '#4d9e84' },
        { label: 'Total Earnings', value: '142.3M VND', change: '+15% vs last month', icon: DollarOutlined, color: '#5492b4' },
        { label: 'Average Rating', value: (allShippers.reduce((s, x) => s + x.rating, 0) / allShippers.length).toFixed(1), change: 'From all reviews', icon: StarOutlined, color: '#719FC2' }
    ]

    const filteredShippers = allShippers.filter(s =>
        !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery)
    )

    const topShippers = filteredShippers.filter(s => s.rating >= 4.7 && s.totalDeliveries >= 900).sort((a, b) => b.rating - a.rating)

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': case 'paid': return '#4d9e84'
            case 'pending': case 'in-progress': return '#5492b4'
            case 'inactive': case 'suspended': return '#c05a50'
            default: return '#6b7280'
        }
    }

    // ── CRUD Handlers ──────────────────────────────────────
    const openView = (shipper) => { setSelectedShipper(shipper); setModal('view') }
    const openEdit = (shipper) => { setFormData({ ...shipper }); setModal('edit') }
    const openCreate = () => { setFormData({ ...EMPTY_FORM }); setModal('create') }
    const openDelete = (shipper) => { setDeleteTarget(shipper); setModal('delete') }
    const closeModal = () => { setModal(null); setSelectedShipper(null); setDeleteTarget(null) }

    const handleFormChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCreate = () => {
        if (!formData.name || !formData.phone) return
        const nextNum = Math.max(...allShippers.map(s => parseInt(s.id.replace(/\D/g, '')) || 0)) + 1
        const newShipper = { ...formData, id: `SHP-${nextNum}` }
        setAllShippers(prev => [newShipper, ...prev])
        toast.success(`Shipper created: ${newShipper.name}`)
        closeModal()
    }

    const handleUpdate = () => {
        if (!formData.name || !formData.phone) return
        setAllShippers(prev => prev.map(s => s.id === formData.id ? { ...formData } : s))
        toast.success(`Shipper updated: ${formData.name}`)
        closeModal()
    }

    const handleDelete = () => {
        setAllShippers(prev => prev.filter(s => s.id !== deleteTarget.id))
        toast.error(`Shipper deleted: ${deleteTarget.name}`)
        closeModal()
    }

    const handleToggleStatus = (shipperId) => {
        setAllShippers(prev => prev.map(s => s.id === shipperId
            ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s))
        if (selectedShipper?.id === shipperId)
            setSelectedShipper(prev => ({ ...prev, status: prev.status === 'active' ? 'inactive' : 'active' }))
        const shipper = allShippers.find(s => s.id === shipperId)
        toast.success(`${shipper?.name} status updated`)
    }

    const handleApproveShipper = (shipper) => {
        const nextNum = Math.max(...allShippers.map(s => parseInt(s.id.replace(/\D/g, '')) || 0)) + 1
        const newShipper = {
            id: `SHP-${nextNum}`,
            name: shipper.name, phone: shipper.phone, email: shipper.email,
            vehicleType: shipper.vehicleType, licensePlate: shipper.licensePlate,
            rating: 0, totalDeliveries: 0, totalEarnings: '0',
            status: 'active', joinDate: new Date().toISOString().split('T')[0],
            lastActive: new Date().toISOString().replace('T', ' ').slice(0, 16),
            address: '', birthDate: '', identityCard: '',
        }
        setAllShippers(prev => [...prev, newShipper])
        setPendingShippers(prev => prev.filter(p => p.id !== shipper.id))
        toast.success(`Approved shipper: ${shipper.name}`)
    }

    const handleRejectShipper = (shipper) => {
        setPendingShippers(prev => prev.filter(p => p.id !== shipper.id))
        toast.error(`Rejected application: ${shipper.name}`)
    }

    const handleProcessPayment = (paymentId) => {
        setShipperPayments(prev => prev.map(p => p.id === paymentId
            ? { ...p, status: 'paid', paidDate: new Date().toISOString().split('T')[0] } : p))
        toast.success('Payment processed successfully!')
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
                    {data.length === 0 ? (
                        <tr><td colSpan={10} className="admin-shipper-empty">No shippers found</td></tr>
                    ) : data.map(shipper => (
                        <tr key={shipper.id}>
                            <td><div className="shipper-id">{shipper.id}</div></td>
                            <td>
                                <div className="shipper-name">
                                    <UserOutlined style={{ marginRight: 8, color: '#719FC2' }} />
                                    {shipper.name}
                                </div>
                            </td>
                            <td><div className="shipper-contact"><div>{shipper.phone}</div></div></td>
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
                                    <StarOutlined style={{ color: '#5492b4', marginRight: 4 }} />
                                    {shipper.rating}
                                </div>
                            </td>
                            <td>{shipper.totalDeliveries}</td>
                            <td><div className="shipper-earnings">{shipper.totalEarnings}</div></td>
                            <td>
                                <span className="shipper-status-badge" style={{ color: getStatusColor(shipper.status) }}>
                                    ● {shipper.status}
                                </span>
                            </td>
                            <td><div style={{ fontSize: '13px', color: '#64748b' }}>{shipper.lastActive}</div></td>
                            <td>
                                <div className="shipper-actions-cell">
                                    <button className="admin-shipper-icon-btn view-btn" onClick={() => openView(shipper)} title="View"><EyeOutlined /></button>
                                    <button className="admin-shipper-icon-btn edit-btn" onClick={() => openEdit(shipper)} title="Edit"><EditOutlined /></button>
                                    <button className="admin-shipper-icon-btn delete-btn" onClick={() => openDelete(shipper)} title="Delete"><DeleteOutlined /></button>
                                </div>
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
                    <p className="admin-shipper-subtitle">Manage shipper registrations, performance metrics, and earnings</p>
                </div>
                <button className="admin-shipper-create-btn" onClick={openCreate}>
                    <PlusOutlined /> Add Shipper
                </button>
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
                <button className={`admin-shipper-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                    <CarOutlined /> All Shippers ({allShippers.length})
                </button>
                <button className={`admin-shipper-tab ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>
                    <CheckCircleOutlined /> Pending Approvals ({pendingShippers.length})
                </button>
                <button className={`admin-shipper-tab ${activeTab === 'top' ? 'active' : ''}`} onClick={() => setActiveTab('top')}>
                    <StarOutlined /> Top Performers ({topShippers.length})
                </button>
                <button className={`admin-shipper-tab ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
                    <DollarOutlined /> Payments ({shipperPayments.length})
                </button>
            </div>

            {/* All / Top Performers */}
            {(activeTab === 'all' || activeTab === 'top') && (
                <div className="admin-shipper-card">
                    <div className="admin-shipper-card-header">
                        <div className="admin-shipper-search">
                            <SearchOutlined className="search-icon" />
                            <input type="text" placeholder="Search shippers by name, ID, or phone..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <button className="admin-shipper-filter-btn"><FilterOutlined /> Filters</button>
                    </div>
                    {activeTab === 'all' && renderShipperTable(filteredShippers)}
                    {activeTab === 'top' && renderShipperTable(topShippers)}
                </div>
            )}

            {/* Pending Approvals */}
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
                                    <button className="btn-reject" onClick={() => handleRejectShipper(shipper)}>
                                        <CloseCircleOutlined /> Reject
                                    </button>
                                    <button className="btn-approve" onClick={() => handleApproveShipper(shipper)}>
                                        <CheckCircleOutlined /> Approve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Payments */}
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
                                        <td><div className="payment-total">{payment.total}</div></td>
                                        <td>
                                            <span className="payment-status" style={{ color: getStatusColor(payment.status) }}>
                                                ● {payment.status}
                                            </span>
                                        </td>
                                        <td>
                                            {payment.status === 'pending' && (
                                                <button className="btn-pay" onClick={() => handleProcessPayment(payment.id)}>Process Payment</button>
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

            {/* ── View Modal ── */}
            {modal === 'view' && selectedShipper && (
                <div className="shipper-modal-overlay" onClick={closeModal}>
                    <div className="shipper-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="shipper-modal-header">
                            <h2><CarOutlined style={{ marginRight: 8 }} />{selectedShipper.name}</h2>
                            <button className="shipper-modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="shipper-modal-body">
                            <div className="shipper-detail-section">
                                <h3>Basic Information</h3>
                                <div className="detail-grid">
                                    <div><strong>ID:</strong> {selectedShipper.id}</div>
                                    <div><strong>Status:</strong> <span style={{ color: getStatusColor(selectedShipper.status), fontWeight: 600 }}>{selectedShipper.status}</span></div>
                                    <div><strong>Phone:</strong> {selectedShipper.phone}</div>
                                    <div><strong>Email:</strong> {selectedShipper.email}</div>
                                    <div><strong>Vehicle:</strong> {selectedShipper.vehicleType}</div>
                                    <div><strong>License Plate:</strong> {selectedShipper.licensePlate}</div>
                                    <div><strong>Join Date:</strong> {selectedShipper.joinDate}</div>
                                    <div><strong>Last Active:</strong> {selectedShipper.lastActive}</div>
                                </div>
                            </div>
                            <div className="shipper-detail-section">
                                <h3>Performance</h3>
                                <div className="detail-grid">
                                    <div><strong>Rating:</strong> ⭐ {selectedShipper.rating}</div>
                                    <div><strong>Deliveries:</strong> {selectedShipper.totalDeliveries}</div>
                                    <div><strong>Total Earnings:</strong> {selectedShipper.totalEarnings}</div>
                                </div>
                            </div>
                        </div>
                        <div className="shipper-modal-footer">
                            <button className={`shipper-modal-btn ${selectedShipper.status === 'active' ? 'danger' : 'success'}`} onClick={() => handleToggleStatus(selectedShipper.id)}>
                                {selectedShipper.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button className="shipper-modal-btn secondary" onClick={closeModal}>Close</button>
                            <button className="shipper-modal-btn primary" onClick={() => { closeModal(); openEdit(selectedShipper) }}>
                                <EditOutlined /> Edit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Create / Edit Modal ── */}
            {(modal === 'create' || modal === 'edit') && (
                <div className="shipper-modal-overlay" onClick={closeModal}>
                    <div className="shipper-modal-content shipper-modal-form" onClick={e => e.stopPropagation()}>
                        <div className="shipper-modal-header">
                            <h2>{modal === 'create' ? <><PlusOutlined /> Add New Shipper</> : <><EditOutlined /> Edit Shipper — {formData.id}</>}</h2>
                            <button className="shipper-modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="shipper-modal-body">
                            <div className="shipper-form-grid">
                                <div className="shipper-form-group">
                                    <label>Full Name <span className="required">*</span></label>
                                    <input name="name" value={formData.name} onChange={handleFormChange} placeholder="Nguyễn Văn A" />
                                </div>
                                <div className="shipper-form-group">
                                    <label>Phone <span className="required">*</span></label>
                                    <input name="phone" value={formData.phone} onChange={handleFormChange} placeholder="09xxxxxxxx" />
                                </div>
                                <div className="shipper-form-group">
                                    <label>Email</label>
                                    <input name="email" value={formData.email} onChange={handleFormChange} placeholder="email@example.com" />
                                </div>
                                <div className="shipper-form-group">
                                    <label>Vehicle Type</label>
                                    <select name="vehicleType" value={formData.vehicleType} onChange={handleFormChange}>
                                        {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                                <div className="shipper-form-group">
                                    <label>License Plate</label>
                                    <input name="licensePlate" value={formData.licensePlate} onChange={handleFormChange} placeholder="59C-11111" />
                                </div>
                                <div className="shipper-form-group">
                                    <label>Status</label>
                                    <select name="status" value={formData.status} onChange={handleFormChange}>
                                        {SHIPPER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div className="shipper-form-group shipper-form-group-full">
                                    <label>Address</label>
                                    <input name="address" value={formData.address} onChange={handleFormChange} placeholder="123 Lê Lợi, Quận 1, TP.HCM" />
                                </div>
                                <div className="shipper-form-group">
                                    <label>Birth Date</label>
                                    <input name="birthDate" type="date" value={formData.birthDate} onChange={handleFormChange} />
                                </div>
                                <div className="shipper-form-group">
                                    <label>Identity Card</label>
                                    <input name="identityCard" value={formData.identityCard} onChange={handleFormChange} placeholder="079195001122" />
                                </div>
                            </div>
                        </div>
                        <div className="shipper-modal-footer">
                            <button className="shipper-modal-btn secondary" onClick={closeModal}>Cancel</button>
                            <button
                                className="shipper-modal-btn primary"
                                onClick={modal === 'create' ? handleCreate : handleUpdate}
                                disabled={!formData.name || !formData.phone}
                            >
                                {modal === 'create' ? <><PlusOutlined /> Create Shipper</> : <><CheckCircleOutlined /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm Modal ── */}
            {modal === 'delete' && deleteTarget && (
                <div className="shipper-modal-overlay" onClick={closeModal}>
                    <div className="shipper-modal-content shipper-modal-delete" onClick={e => e.stopPropagation()}>
                        <div className="shipper-modal-header">
                            <h2><ExclamationCircleOutlined style={{ color: '#c05a50', marginRight: 8 }} />Delete Shipper</h2>
                            <button className="shipper-modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="shipper-modal-body">
                            <p className="shipper-delete-msg">Are you sure you want to delete <strong>{deleteTarget.name}</strong>?</p>
                            <div className="shipper-delete-info">
                                <div><strong>ID:</strong> {deleteTarget.id}</div>
                                <div><strong>Phone:</strong> {deleteTarget.phone}</div>
                                <div><strong>Vehicle:</strong> {deleteTarget.vehicleType}</div>
                                <div><strong>Status:</strong> {deleteTarget.status}</div>
                            </div>
                            <p className="shipper-delete-warning">This action cannot be undone.</p>
                        </div>
                        <div className="shipper-modal-footer">
                            <button className="shipper-modal-btn secondary" onClick={closeModal}>Cancel</button>
                            <button className="shipper-modal-btn danger" onClick={handleDelete}><DeleteOutlined /> Delete Shipper</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminShipperManagement

