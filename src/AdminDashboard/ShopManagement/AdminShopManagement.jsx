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
import { useTranslation } from '../../shared/lib/i18n'

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
    const { t } = useTranslation()
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
    const getStatusLabel = (status) => t(`admin.shopManagement.status.${status === 'in-progress' ? 'inProgress' : status}`)
    const getSubscriptionLabel = (subscription) => t(`admin.shopManagement.subscription.${subscription}`)

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
        toast.success(`${t('admin.shopManagement.toasts.shopCreated')}: ${newShop.name}`)
        closeModal()
    }

    const handleUpdate = () => {
        if (!formData.name || !formData.owner) return
        setAllShops(prev => prev.map(s => s.id === formData.id ? { ...formData, machines: Number(formData.machines) || 0, staff: Number(formData.staff) || 0 } : s))
        toast.success(`${t('admin.shopManagement.toasts.shopUpdated')}: ${formData.name}`)
        closeModal()
    }

    const handleDelete = () => {
        setAllShops(prev => prev.filter(s => s.id !== deleteTarget.id))
        toast.error(`${t('admin.shopManagement.toasts.shopDeleted')}: ${deleteTarget.name}`)
        closeModal()
    }

    const handleToggleStatus = (shopId) => {
        setAllShops(prev => prev.map(s => s.id === shopId ? { ...s, status: s.status === 'active' ? 'suspended' : 'active' } : s))
        if (selectedShop?.id === shopId) {
            setSelectedShop(prev => ({ ...prev, status: prev.status === 'active' ? 'suspended' : 'active' }))
        }
        const shop = allShops.find(s => s.id === shopId)
        toast.success(`${shop?.name} ${t('admin.shopManagement.toasts.statusUpdated')}`)
    }

    const handleApproveShop = (shop) => {
        const nextNum = Math.max(...allShops.map(s => parseInt(s.id.replace(/\D/g, '')) || 0)) + 1
        const newShop = { ...shop, id: `SHOP-${String(nextNum).padStart(3, '0')}`, rating: 0, reviews: 0, orders: 0, revenue: '0', revenueValue: 0, status: 'active', joinDate: new Date().toISOString().split('T')[0] }
        setAllShops(prev => [...prev, newShop])
        setPendingShops(prev => prev.filter(p => p.id !== shop.id))
        toast.success(`${t('admin.shopManagement.toasts.shopApproved')}: ${shop.name}`)
    }

    const handleRejectShop = (shop) => {
        setPendingShops(prev => prev.filter(p => p.id !== shop.id))
        toast.error(`${t('admin.shopManagement.toasts.shopRejected')}: ${shop.name}`)
    }

    const handleApproveDoc = (docId) => {
        setDocumentUpdates(prev => prev.map(d => d.id === docId ? { ...d, status: 'approved', approvedDate: new Date().toISOString().split('T')[0] } : d))
        toast.success(t('admin.shopManagement.toasts.documentApproved'))
    }

    const handleRejectDoc = (docId) => {
        setDocumentUpdates(prev => prev.map(d => d.id === docId ? { ...d, status: 'rejected' } : d))
        toast.error(t('admin.shopManagement.toasts.documentRejected'))
    }

    return (
        <div className="admin-shop-management">
            <div className="admin-shop-management-header">
                <div>
                    <h1 className="admin-shop-management-title">{t('admin.shopManagement.title')}</h1>
                    <p className="admin-shop-management-subtitle">{t('admin.shopManagement.subtitle')}</p>
                </div>
                <button className="admin-shop-create-btn" onClick={openCreate}>
                    <PlusOutlined /> {t('admin.shopManagement.addShop')}
                </button>
            </div>

            {/* Tabs */}
            <div className="admin-shop-management-tabs">
                <button className={`admin-shop-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                    <ShopOutlined /> {t('admin.shopManagement.tabs.allShops')} ({allShops.length})
                </button>
                <button className={`admin-shop-tab ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>
                    <CheckCircleOutlined /> {t('admin.shopManagement.tabs.pendingApprovals')} ({pendingShops.length})
                </button>
                <button className={`admin-shop-tab ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
                    <FileTextOutlined /> {t('admin.shopManagement.tabs.documentUpdates')} ({documentUpdates.length})
                </button>
            </div>

            {/* All Shops Table */}
            {activeTab === 'all' && (
                <div className="admin-shop-card">
                    <div className="admin-shop-card-header">
                        <div className="admin-shop-search">
                            <SearchOutlined className="search-icon" />
                            <input type="text" placeholder={t('admin.shopManagement.searchPlaceholder')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <button className="admin-shop-filter-btn"><FilterOutlined /> {t('shops.filter')}</button>
                    </div>
                    <div className="admin-shop-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('admin.shopManagement.table.shopName')}</th>
                                    <th>{t('admin.shopManagement.table.owner')}</th>
                                    <th>{t('admin.shopManagement.table.location')}</th>
                                    <th>{t('shops.rating')}</th>
                                    <th>{t('dashboard.orders')}</th>
                                    <th>{t('dashboard.revenue')}</th>
                                    <th>{t('shop.incidents.detail.status')}</th>
                                    <th>{t('admin.shopManagement.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredShops.length === 0 ? (
                                    <tr><td colSpan={8} className="admin-shop-empty">{t('admin.shopManagement.empty.noShopsFound')}</td></tr>
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
                                                {getStatusLabel(shop.status)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="shop-actions-cell">
                                                <button className="admin-shop-icon-btn view-btn" onClick={() => openView(shop)} title={t('admin.shopManagement.actions.view')}><EyeOutlined /></button>
                                                <button className="admin-shop-icon-btn edit-btn" onClick={() => openEdit(shop)} title={t('common.edit')}><EditOutlined /></button>
                                                <button className="admin-shop-icon-btn delete-btn" onClick={() => openDelete(shop)} title={t('common.delete')}><DeleteOutlined /></button>
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
                                <div className="approval-info-row"><span className="label">{t('admin.shopManagement.table.owner')}:</span><span className="value">{shop.owner}</span></div>
                                <div className="approval-info-row"><span className="label">{t('admin.shopManagement.table.location')}:</span><span className="value">{shop.location}</span></div>
                                <div className="approval-info-row"><span className="label">{t('shop.phone')}:</span><span className="value">{shop.phone}</span></div>
                                <div className="approval-info-row"><span className="label">{t('admin.shopManagement.fields.machines')}:</span><span className="value">{shop.machines} {t('admin.shopManagement.units.units')}</span></div>
                                <div className="approval-info-row"><span className="label">{t('admin.overview.submitted')}:</span><span className="value">{shop.submittedDate}</span></div>
                                <div className="approval-documents">
                                    <span className="label">{t('dashboard.document')}:</span>
                                    <div className="document-badges">
                                        {shop.documents.map((doc, i) => <span key={i} className="document-badge">{doc}</span>)}
                                    </div>
                                </div>
                            </div>
                            <div className="approval-card-actions">
                                <button className="approve-btn" onClick={() => handleApproveShop(shop)}><CheckCircleOutlined /> {t('admin.overview.approve')}</button>
                                <button className="reject-btn" onClick={() => handleRejectShop(shop)}><CloseCircleOutlined /> {t('admin.overview.reject')}</button>
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
                                    <th>{t('admin.shopManagement.table.shopName')}</th>
                                    <th>{t('admin.shopManagement.table.documentType')}</th>
                                    <th>{t('admin.shopManagement.table.submittedDate')}</th>
                                    <th>{t('admin.shopManagement.table.expiryDate')}</th>
                                    <th>{t('shop.incidents.detail.status')}</th>
                                    <th>{t('admin.shopManagement.table.actions')}</th>
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
                                                {getStatusLabel(doc.status)}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {doc.status === 'pending' ? (
                                                    <>
                                                        <button className="admin-shop-action-btn primary" onClick={() => handleApproveDoc(doc.id)}>{t('admin.overview.approve')}</button>
                                                        <button className="admin-shop-action-btn danger" onClick={() => handleRejectDoc(doc.id)}>{t('admin.overview.reject')}</button>
                                                    </>
                                                ) : (
                                                    <span style={{ color: doc.status === 'approved' ? '#4d9e84' : '#c05a50', fontWeight: 500 }}>{getStatusLabel(doc.status)}</span>
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
                            <button className="shop-modal-close" onClick={closeModal} aria-label={t('common.close')}>×</button>
                        </div>
                        <div className="shop-modal-body">
                            <div className="shop-detail-section">
                                <h3>{t('admin.shopManagement.sections.shopInfo')}</h3>
                                <div className="shop-detail-grid">
                                    <div><strong>{t('shop.documents.detail.id')}:</strong> {selectedShop.id}</div>
                                    <div><strong>{t('shop.incidents.detail.status')}:</strong> <span style={{ color: getStatusColor(selectedShop.status), fontWeight: 600 }}>{getStatusLabel(selectedShop.status)}</span></div>
                                    <div><strong>{t('admin.shopManagement.fields.subscription')}:</strong> {getSubscriptionLabel(selectedShop.subscription)}</div>
                                    <div><strong>{t('admin.shopManagement.fields.joinDate')}:</strong> {selectedShop.joinDate}</div>
                                    <div><strong>{t('admin.shopManagement.fields.open')}:</strong> {selectedShop.openTime} – {selectedShop.closeTime}</div>
                                    <div><strong>{t('admin.shopManagement.fields.machines')}:</strong> {selectedShop.machines}</div>
                                    <div><strong>{t('dashboard.staff')}:</strong> {selectedShop.staff}</div>
                                </div>
                            </div>
                            <div className="shop-detail-section">
                                <h3>{t('admin.shopManagement.table.owner')}</h3>
                                <div className="shop-detail-grid">
                                    <div><strong>{t('profile.name')}:</strong> {selectedShop.owner}</div>
                                    <div><strong>{t('auth.email')}:</strong> {selectedShop.ownerEmail}</div>
                                    <div><strong>{t('shop.phone')}:</strong> {selectedShop.ownerPhone}</div>
                                    <div><strong>{t('admin.shopManagement.table.location')}:</strong> {selectedShop.location}</div>
                                </div>
                            </div>
                            <div className="shop-detail-section">
                                <h3>{t('admin.shopManagement.sections.performance')}</h3>
                                <div className="shop-detail-grid">
                                    <div><strong>{t('shops.rating')}:</strong> ⭐ {selectedShop.rating} ({selectedShop.reviews} {t('shop.reviews')})</div>
                                    <div><strong>{t('dashboard.orders')}:</strong> {selectedShop.orders}</div>
                                    <div><strong>{t('dashboard.revenue')}:</strong> {selectedShop.revenue}</div>
                                </div>
                            </div>
                        </div>
                        <div className="shop-modal-footer">
                            <button className={`shop-modal-btn ${selectedShop.status === 'active' ? 'danger' : 'success'}`} onClick={() => handleToggleStatus(selectedShop.id)}>
                                {selectedShop.status === 'active' ? t('admin.shopManagement.suspendShop') : t('admin.shopManagement.activateShop')}
                            </button>
                            <button className="shop-modal-btn secondary" onClick={closeModal}>{t('common.close')}</button>
                            <button className="shop-modal-btn primary" onClick={() => { closeModal(); openEdit(selectedShop) }}>
                                <EditOutlined /> {t('common.edit')}
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
                            <h2>{modal === 'create' ? <><PlusOutlined /> {t('admin.shopManagement.addNewShop')}</> : <><EditOutlined /> {t('admin.shopManagement.editShop')} - {formData.id}</>}</h2>
                            <button className="shop-modal-close" onClick={closeModal} aria-label={t('common.close')}>×</button>
                        </div>
                        <div className="shop-modal-body">
                            <div className="shop-form-grid">
                                <div className="shop-form-group">
                                    <label>{t('admin.shopManagement.table.shopName')} <span className="required">*</span></label>
                                    <input name="name" value={formData.name} onChange={handleFormChange} placeholder={t('admin.shopManagement.placeholders.shopName')} />
                                </div>
                                <div className="shop-form-group">
                                    <label>{t('admin.shopManagement.fields.ownerName')} <span className="required">*</span></label>
                                    <input name="owner" value={formData.owner} onChange={handleFormChange} placeholder={t('admin.shopManagement.placeholders.ownerName')} />
                                </div>
                                <div className="shop-form-group">
                                    <label>{t('admin.shopManagement.fields.ownerEmail')}</label>
                                    <input name="ownerEmail" value={formData.ownerEmail} onChange={handleFormChange} placeholder="email@example.com" />
                                </div>
                                <div className="shop-form-group">
                                    <label>{t('admin.shopManagement.fields.ownerPhone')}</label>
                                    <input name="ownerPhone" value={formData.ownerPhone} onChange={handleFormChange} placeholder="09xxxxxxxx" />
                                </div>
                                <div className="shop-form-group shop-form-group-full">
                                    <label>{t('profile.address')}</label>
                                    <input name="location" value={formData.location} onChange={handleFormChange} placeholder="12 Nguyễn Huệ, Quận 1, TP.HCM" />
                                </div>
                                <div className="shop-form-group">
                                    <label>{t('profile.district')}</label>
                                    <input name="district" value={formData.district} onChange={handleFormChange} placeholder="Quận 1" />
                                </div>
                                <div className="shop-form-group">
                                    <label>{t('profile.city')}</label>
                                    <input name="city" value={formData.city} onChange={handleFormChange} placeholder="TP.HCM" />
                                </div>
                                <div className="shop-form-group">
                                    <label>{t('admin.shopManagement.fields.machines')}</label>
                                    <input name="machines" type="number" min="0" value={formData.machines} onChange={handleFormChange} placeholder="0" />
                                </div>
                                <div className="shop-form-group">
                                    <label>{t('dashboard.staff')}</label>
                                    <input name="staff" type="number" min="0" value={formData.staff} onChange={handleFormChange} placeholder="0" />
                                </div>
                                <div className="shop-form-group">
                                    <label>{t('admin.shopManagement.fields.openTime')}</label>
                                    <input name="openTime" value={formData.openTime} onChange={handleFormChange} placeholder="07:00" />
                                </div>
                                <div className="shop-form-group">
                                    <label>{t('admin.shopManagement.fields.closeTime')}</label>
                                    <input name="closeTime" value={formData.closeTime} onChange={handleFormChange} placeholder="21:00" />
                                </div>
                                <div className="shop-form-group">
                                    <label>{t('admin.shopManagement.fields.subscription')}</label>
                                    <select name="subscription" value={formData.subscription} onChange={handleFormChange}>
                                        {SUBSCRIPTIONS.map(s => <option key={s} value={s}>{getSubscriptionLabel(s)}</option>)}
                                    </select>
                                </div>
                                <div className="shop-form-group">
                                    <label>{t('shop.incidents.detail.status')}</label>
                                    <select name="status" value={formData.status} onChange={handleFormChange}>
                                        {STATUSES.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="shop-modal-footer">
                            <button className="shop-modal-btn secondary" onClick={closeModal}>{t('common.cancel')}</button>
                            <button
                                className="shop-modal-btn primary"
                                onClick={modal === 'create' ? handleCreate : handleUpdate}
                                disabled={!formData.name || !formData.owner}
                            >
                                {modal === 'create' ? <><PlusOutlined /> {t('admin.shopManagement.createShop')}</> : <><CheckCircleOutlined /> {t('shop.saveChanges')}</>}
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
                            <h2><ExclamationCircleOutlined style={{ color: '#c05a50', marginRight: 8 }} />{t('admin.shopManagement.deleteShop')}</h2>
                            <button className="shop-modal-close" onClick={closeModal} aria-label={t('common.close')}>×</button>
                        </div>
                        <div className="shop-modal-body">
                            <p className="shop-delete-msg">{t('admin.shopManagement.confirm.deletePrefix')} <strong>{deleteTarget.name}</strong>?</p>
                            <div className="shop-delete-info">
                                <div><strong>{t('shop.documents.detail.id')}:</strong> {deleteTarget.id}</div>
                                <div><strong>{t('admin.shopManagement.table.owner')}:</strong> {deleteTarget.owner}</div>
                                <div><strong>{t('admin.shopManagement.table.location')}:</strong> {deleteTarget.location}</div>
                                <div><strong>{t('shop.incidents.detail.status')}:</strong> {getStatusLabel(deleteTarget.status)}</div>
                            </div>
                            <p className="shop-delete-warning">{t('shop.documents.confirm.deleteMessageSuffix')}</p>
                        </div>
                        <div className="shop-modal-footer">
                            <button className="shop-modal-btn secondary" onClick={closeModal}>{t('common.cancel')}</button>
                            <button className="shop-modal-btn danger" onClick={handleDelete}><DeleteOutlined /> {t('admin.shopManagement.deleteShop')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminShopManagement

