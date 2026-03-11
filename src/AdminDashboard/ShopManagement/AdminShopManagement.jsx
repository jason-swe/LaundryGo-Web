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
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons'
import {
    shops as shopsData,
    pendingShops as pendingShopsData,
    shopDocumentUpdates as docUpdatesData
} from '../../data'
import toast from '../../utils/toast'

const SUBSCRIPTIONS = ['basic', 'premium']
const STATUSES = ['active', 'suspended']

const EMPTY_FORM = {
    name: '', owner: '', ownerEmail: '', ownerPhone: '',
    location: '', district: '', city: 'TP.HCM',
    machines: '', staff: '',
    openTime: '07:00', closeTime: '21:00',
    subscription: 'basic', status: 'active',
    rating: 0, reviews: 0, orders: 0, revenue: '0', revenueValue: 0,
    joinDate: new Date().toISOString().split('T')[0],
}

function AdminShopManagement() {
    const [activeTab, setActiveTab] = useState('all')
    const [allShops, setAllShops] = useState(shopsData)
    const [pendingShops, setPendingShops] = useState(pendingShopsData)
    const [documentUpdates, setDocumentUpdates] = useState(docUpdatesData)
    const [searchQuery, setSearchQuery] = useState('')

    // modal: null | 'view' | 'create' | 'edit' | 'delete'
    const [modal, setModal] = useState(null)
    const [selectedShop, setSelectedShop] = useState(null)
    const [formData, setFormData] = useState(EMPTY_FORM)
    const [deleteTarget, setDeleteTarget] = useState(null)

    const filteredShops = allShops.filter(s =>
        !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.location.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#4d9e84'
            case 'pending': return '#5492b4'
            case 'in-progress': return '#719FC2'
            case 'suspended': return '#c05a50'
            default: return '#6b7280'
        }
    }

    // ── CRUD Handlers ──────────────────────────────────────
    const openView = (shop) => { setSelectedShop(shop); setModal('view') }
    const openEdit = (shop) => { setFormData({ ...shop }); setModal('edit') }
    const openCreate = () => { setFormData({ ...EMPTY_FORM }); setModal('create') }
    const openDelete = (shop) => { setDeleteTarget(shop); setModal('delete') }
    const closeModal = () => { setModal(null); setSelectedShop(null); setDeleteTarget(null) }

    const handleFormChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCreate = () => {
        if (!formData.name || !formData.owner) return
        const nextNum = Math.max(...allShops.map(s => parseInt(s.id.replace(/\D/g, '')) || 0)) + 1
        const newShop = { ...formData, id: `SHOP-${String(nextNum).padStart(3, '0')}`, machines: Number(formData.machines) || 0, staff: Number(formData.staff) || 0 }
        setAllShops(prev => [newShop, ...prev])
        toast.success(`Shop created: ${newShop.name}`)
        closeModal()
    }

    const handleUpdate = () => {
        if (!formData.name || !formData.owner) return
        setAllShops(prev => prev.map(s => s.id === formData.id ? { ...formData, machines: Number(formData.machines) || 0, staff: Number(formData.staff) || 0 } : s))
        toast.success(`Shop updated: ${formData.name}`)
        closeModal()
    }

    const handleDelete = () => {
        setAllShops(prev => prev.filter(s => s.id !== deleteTarget.id))
        toast.error(`Shop deleted: ${deleteTarget.name}`)
        closeModal()
    }

    const handleToggleStatus = (shopId) => {
        setAllShops(prev => prev.map(s => s.id === shopId ? { ...s, status: s.status === 'active' ? 'suspended' : 'active' } : s))
        if (selectedShop?.id === shopId) {
            setSelectedShop(prev => ({ ...prev, status: prev.status === 'active' ? 'suspended' : 'active' }))
        }
        const shop = allShops.find(s => s.id === shopId)
        toast.success(`${shop?.name} status updated`)
    }

    const handleApproveShop = (shop) => {
        const nextNum = Math.max(...allShops.map(s => parseInt(s.id.replace(/\D/g, '')) || 0)) + 1
        const newShop = { ...shop, id: `SHOP-${String(nextNum).padStart(3, '0')}`, rating: 0, reviews: 0, orders: 0, revenue: '0', revenueValue: 0, status: 'active', joinDate: new Date().toISOString().split('T')[0] }
        setAllShops(prev => [...prev, newShop])
        setPendingShops(prev => prev.filter(p => p.id !== shop.id))
        toast.success(`Shop approved: ${shop.name}`)
    }

    const handleRejectShop = (shop) => {
        setPendingShops(prev => prev.filter(p => p.id !== shop.id))
        toast.error(`Shop application rejected: ${shop.name}`)
    }

    const handleApproveDoc = (docId) => {
        setDocumentUpdates(prev => prev.map(d => d.id === docId ? { ...d, status: 'approved', approvedDate: new Date().toISOString().split('T')[0] } : d))
        toast.success('Document approved!')
    }

    const handleRejectDoc = (docId) => {
        setDocumentUpdates(prev => prev.map(d => d.id === docId ? { ...d, status: 'rejected' } : d))
        toast.error('Document rejected.')
    }

    return (
        <div className="admin-shop-management">
            <div className="admin-shop-management-header">
                <div>
                    <h1 className="admin-shop-management-title">Partner Shop Management</h1>
                    <p className="admin-shop-management-subtitle">Manage shop registrations, approvals, and compliance documents</p>
                </div>
                <button className="admin-shop-create-btn" onClick={openCreate}>
                    <PlusOutlined /> Add Shop
                </button>
            </div>

            {/* Tabs */}
            <div className="admin-shop-management-tabs">
                <button className={`admin-shop-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                    <ShopOutlined /> All Shops ({allShops.length})
                </button>
                <button className={`admin-shop-tab ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>
                    <CheckCircleOutlined /> Pending Approvals ({pendingShops.length})
                </button>
                <button className={`admin-shop-tab ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
                    <FileTextOutlined /> Document Updates ({documentUpdates.length})
                </button>
            </div>

            {/* All Shops Table */}
            {activeTab === 'all' && (
                <div className="admin-shop-card">
                    <div className="admin-shop-card-header">
                        <div className="admin-shop-search">
                            <SearchOutlined className="search-icon" />
                            <input type="text" placeholder="Search shops..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <button className="admin-shop-filter-btn"><FilterOutlined /> Filters</button>
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
                                {filteredShops.length === 0 ? (
                                    <tr><td colSpan={8} className="admin-shop-empty">No shops found</td></tr>
                                ) : filteredShops.map(shop => (
                                    <tr key={shop.id}>
                                        <td className="shop-name-cell"><ShopOutlined className="shop-icon" />{shop.name}</td>
                                        <td>{shop.owner}</td>
                                        <td>{shop.location}</td>
                                        <td>
                                            <div className="rating-cell">
                                                <StarOutlined style={{ color: '#5492b4' }} />
                                                {shop.rating} ({shop.reviews})
                                            </div>
                                        </td>
                                        <td>{shop.orders}</td>
                                        <td className="revenue-cell">{shop.revenue}</td>
                                        <td>
                                            <span className="status-badge" style={{ background: `${getStatusColor(shop.status)}20`, color: getStatusColor(shop.status) }}>
                                                {shop.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="shop-actions-cell">
                                                <button className="admin-shop-icon-btn view-btn" onClick={() => openView(shop)} title="View"><EyeOutlined /></button>
                                                <button className="admin-shop-icon-btn edit-btn" onClick={() => openEdit(shop)} title="Edit"><EditOutlined /></button>
                                                <button className="admin-shop-icon-btn delete-btn" onClick={() => openDelete(shop)} title="Delete"><DeleteOutlined /></button>
                                            </div>
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
                    {pendingShops.map(shop => (
                        <div key={shop.id} className="admin-shop-approval-card">
                            <div className="approval-card-header">
                                <ShopOutlined className="approval-icon" />
                                <h3>{shop.name}</h3>
                            </div>
                            <div className="approval-card-content">
                                <div className="approval-info-row"><span className="label">Owner:</span><span className="value">{shop.owner}</span></div>
                                <div className="approval-info-row"><span className="label">Location:</span><span className="value">{shop.location}</span></div>
                                <div className="approval-info-row"><span className="label">Phone:</span><span className="value">{shop.phone}</span></div>
                                <div className="approval-info-row"><span className="label">Machines:</span><span className="value">{shop.machines} units</span></div>
                                <div className="approval-info-row"><span className="label">Submitted:</span><span className="value">{shop.submittedDate}</span></div>
                                <div className="approval-documents">
                                    <span className="label">Documents:</span>
                                    <div className="document-badges">
                                        {shop.documents.map((doc, i) => <span key={i} className="document-badge">{doc}</span>)}
                                    </div>
                                </div>
                            </div>
                            <div className="approval-card-actions">
                                <button className="approve-btn" onClick={() => handleApproveShop(shop)}><CheckCircleOutlined /> Approve</button>
                                <button className="reject-btn" onClick={() => handleRejectShop(shop)}><CloseCircleOutlined /> Reject</button>
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
                                {documentUpdates.map(doc => (
                                    <tr key={doc.id}>
                                        <td className="shop-name-cell"><ShopOutlined className="shop-icon" />{doc.shopName}</td>
                                        <td>{doc.documentType}</td>
                                        <td>{doc.submittedDate}</td>
                                        <td className="expiry-cell">{doc.expiryDate}</td>
                                        <td>
                                            <span className="status-badge" style={{ background: `${getStatusColor(doc.status)}20`, color: getStatusColor(doc.status) }}>
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {doc.status === 'pending' ? (
                                                    <>
                                                        <button className="admin-shop-action-btn primary" onClick={() => handleApproveDoc(doc.id)}>Approve</button>
                                                        <button className="admin-shop-action-btn danger" onClick={() => handleRejectDoc(doc.id)}>Reject</button>
                                                    </>
                                                ) : (
                                                    <span style={{ color: doc.status === 'approved' ? '#4d9e84' : '#c05a50', fontWeight: 500 }}>{doc.status}</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── View Modal ── */}
            {modal === 'view' && selectedShop && (
                <div className="shop-modal-overlay" onClick={closeModal}>
                    <div className="shop-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="shop-modal-header">
                            <h2><ShopOutlined style={{ marginRight: 8 }} />{selectedShop.name}</h2>
                            <button className="shop-modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="shop-modal-body">
                            <div className="shop-detail-section">
                                <h3>Shop Info</h3>
                                <div className="shop-detail-grid">
                                    <div><strong>ID:</strong> {selectedShop.id}</div>
                                    <div><strong>Status:</strong> <span style={{ color: getStatusColor(selectedShop.status), fontWeight: 600 }}>{selectedShop.status}</span></div>
                                    <div><strong>Subscription:</strong> {selectedShop.subscription}</div>
                                    <div><strong>Join Date:</strong> {selectedShop.joinDate}</div>
                                    <div><strong>Open:</strong> {selectedShop.openTime} – {selectedShop.closeTime}</div>
                                    <div><strong>Machines:</strong> {selectedShop.machines}</div>
                                    <div><strong>Staff:</strong> {selectedShop.staff}</div>
                                </div>
                            </div>
                            <div className="shop-detail-section">
                                <h3>Owner</h3>
                                <div className="shop-detail-grid">
                                    <div><strong>Name:</strong> {selectedShop.owner}</div>
                                    <div><strong>Email:</strong> {selectedShop.ownerEmail}</div>
                                    <div><strong>Phone:</strong> {selectedShop.ownerPhone}</div>
                                    <div><strong>Location:</strong> {selectedShop.location}</div>
                                </div>
                            </div>
                            <div className="shop-detail-section">
                                <h3>Performance</h3>
                                <div className="shop-detail-grid">
                                    <div><strong>Rating:</strong> ⭐ {selectedShop.rating} ({selectedShop.reviews} reviews)</div>
                                    <div><strong>Orders:</strong> {selectedShop.orders}</div>
                                    <div><strong>Revenue:</strong> {selectedShop.revenue}</div>
                                </div>
                            </div>
                        </div>
                        <div className="shop-modal-footer">
                            <button className={`shop-modal-btn ${selectedShop.status === 'active' ? 'danger' : 'success'}`} onClick={() => handleToggleStatus(selectedShop.id)}>
                                {selectedShop.status === 'active' ? 'Suspend Shop' : 'Activate Shop'}
                            </button>
                            <button className="shop-modal-btn secondary" onClick={closeModal}>Close</button>
                            <button className="shop-modal-btn primary" onClick={() => { closeModal(); openEdit(selectedShop) }}>
                                <EditOutlined /> Edit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Create / Edit Modal ── */}
            {(modal === 'create' || modal === 'edit') && (
                <div className="shop-modal-overlay" onClick={closeModal}>
                    <div className="shop-modal-content shop-modal-form" onClick={e => e.stopPropagation()}>
                        <div className="shop-modal-header">
                            <h2>{modal === 'create' ? <><PlusOutlined /> Add New Shop</> : <><EditOutlined /> Edit Shop — {formData.id}</>}</h2>
                            <button className="shop-modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="shop-modal-body">
                            <div className="shop-form-grid">
                                <div className="shop-form-group">
                                    <label>Shop Name <span className="required">*</span></label>
                                    <input name="name" value={formData.name} onChange={handleFormChange} placeholder="e.g. FPT Laundry Shop" />
                                </div>
                                <div className="shop-form-group">
                                    <label>Owner Name <span className="required">*</span></label>
                                    <input name="owner" value={formData.owner} onChange={handleFormChange} placeholder="e.g. Nguyễn Văn A" />
                                </div>
                                <div className="shop-form-group">
                                    <label>Owner Email</label>
                                    <input name="ownerEmail" value={formData.ownerEmail} onChange={handleFormChange} placeholder="email@example.com" />
                                </div>
                                <div className="shop-form-group">
                                    <label>Owner Phone</label>
                                    <input name="ownerPhone" value={formData.ownerPhone} onChange={handleFormChange} placeholder="09xxxxxxxx" />
                                </div>
                                <div className="shop-form-group shop-form-group-full">
                                    <label>Address</label>
                                    <input name="location" value={formData.location} onChange={handleFormChange} placeholder="12 Nguyễn Huệ, Quận 1, TP.HCM" />
                                </div>
                                <div className="shop-form-group">
                                    <label>District</label>
                                    <input name="district" value={formData.district} onChange={handleFormChange} placeholder="Quận 1" />
                                </div>
                                <div className="shop-form-group">
                                    <label>City</label>
                                    <input name="city" value={formData.city} onChange={handleFormChange} placeholder="TP.HCM" />
                                </div>
                                <div className="shop-form-group">
                                    <label>Machines</label>
                                    <input name="machines" type="number" min="0" value={formData.machines} onChange={handleFormChange} placeholder="0" />
                                </div>
                                <div className="shop-form-group">
                                    <label>Staff</label>
                                    <input name="staff" type="number" min="0" value={formData.staff} onChange={handleFormChange} placeholder="0" />
                                </div>
                                <div className="shop-form-group">
                                    <label>Open Time</label>
                                    <input name="openTime" value={formData.openTime} onChange={handleFormChange} placeholder="07:00" />
                                </div>
                                <div className="shop-form-group">
                                    <label>Close Time</label>
                                    <input name="closeTime" value={formData.closeTime} onChange={handleFormChange} placeholder="21:00" />
                                </div>
                                <div className="shop-form-group">
                                    <label>Subscription</label>
                                    <select name="subscription" value={formData.subscription} onChange={handleFormChange}>
                                        {SUBSCRIPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div className="shop-form-group">
                                    <label>Status</label>
                                    <select name="status" value={formData.status} onChange={handleFormChange}>
                                        {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="shop-modal-footer">
                            <button className="shop-modal-btn secondary" onClick={closeModal}>Cancel</button>
                            <button
                                className="shop-modal-btn primary"
                                onClick={modal === 'create' ? handleCreate : handleUpdate}
                                disabled={!formData.name || !formData.owner}
                            >
                                {modal === 'create' ? <><PlusOutlined /> Create Shop</> : <><CheckCircleOutlined /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm Modal ── */}
            {modal === 'delete' && deleteTarget && (
                <div className="shop-modal-overlay" onClick={closeModal}>
                    <div className="shop-modal-content shop-modal-delete" onClick={e => e.stopPropagation()}>
                        <div className="shop-modal-header">
                            <h2><ExclamationCircleOutlined style={{ color: '#c05a50', marginRight: 8 }} />Delete Shop</h2>
                            <button className="shop-modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="shop-modal-body">
                            <p className="shop-delete-msg">Are you sure you want to delete <strong>{deleteTarget.name}</strong>?</p>
                            <div className="shop-delete-info">
                                <div><strong>ID:</strong> {deleteTarget.id}</div>
                                <div><strong>Owner:</strong> {deleteTarget.owner}</div>
                                <div><strong>Location:</strong> {deleteTarget.location}</div>
                                <div><strong>Status:</strong> {deleteTarget.status}</div>
                            </div>
                            <p className="shop-delete-warning">This action cannot be undone.</p>
                        </div>
                        <div className="shop-modal-footer">
                            <button className="shop-modal-btn secondary" onClick={closeModal}>Cancel</button>
                            <button className="shop-modal-btn danger" onClick={handleDelete}><DeleteOutlined /> Delete Shop</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminShopManagement

