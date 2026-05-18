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
import { useTranslation } from '../../shared/lib/i18n'

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
    const { t } = useTranslation()
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
        { labelKey: 'totalShippers', value: String(allShippers.length), changePrefix: '+12 ', changeKey: 'thisMonth', icon: CarOutlined, color: '#719FC2' },
        { labelKey: 'activeShippers', value: String(activeCount), changePrefix: `${Math.round(activeCount / allShippers.length * 100)}% `, changeKey: 'activeRate', icon: CarOutlined, color: '#4d9e84' },
        { labelKey: 'totalEarnings', value: '142.3M VND', changePrefix: '+15% ', changeKey: 'vsLastMonth', icon: DollarOutlined, color: '#5492b4' },
        { labelKey: 'averageRating', value: (allShippers.reduce((s, x) => s + x.rating, 0) / allShippers.length).toFixed(1), changeKey: 'fromAllReviews', icon: StarOutlined, color: '#719FC2' }
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
    const getStatusLabel = (status) => t(`admin.shipperManagement.status.${status === 'in-progress' ? 'inProgress' : status}`)
    const getVehicleTypeLabel = (vehicleType) => t(`admin.shipperManagement.vehicleType.${vehicleType}`)

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
        toast.success(`${t('admin.shipperManagement.toasts.shipperCreated')}: ${newShipper.name}`)
        closeModal()
    }

    const handleUpdate = () => {
        if (!formData.name || !formData.phone) return
        setAllShippers(prev => prev.map(s => s.id === formData.id ? { ...formData } : s))
        toast.success(`${t('admin.shipperManagement.toasts.shipperUpdated')}: ${formData.name}`)
        closeModal()
    }

    const handleDelete = () => {
        setAllShippers(prev => prev.filter(s => s.id !== deleteTarget.id))
        toast.error(`${t('admin.shipperManagement.toasts.shipperDeleted')}: ${deleteTarget.name}`)
        closeModal()
    }

    const handleToggleStatus = (shipperId) => {
        setAllShippers(prev => prev.map(s => s.id === shipperId
            ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s))
        if (selectedShipper?.id === shipperId)
            setSelectedShipper(prev => ({ ...prev, status: prev.status === 'active' ? 'inactive' : 'active' }))
        const shipper = allShippers.find(s => s.id === shipperId)
        toast.success(`${shipper?.name} ${t('admin.shopManagement.toasts.statusUpdated')}`)
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
        toast.success(`${t('admin.shipperManagement.toasts.shipperApproved')}: ${shipper.name}`)
    }

    const handleRejectShipper = (shipper) => {
        setPendingShippers(prev => prev.filter(p => p.id !== shipper.id))
        toast.error(`${t('admin.shipperManagement.toasts.applicationRejected')}: ${shipper.name}`)
    }

    const handleProcessPayment = (paymentId) => {
        setShipperPayments(prev => prev.map(p => p.id === paymentId
            ? { ...p, status: 'paid', paidDate: new Date().toISOString().split('T')[0] } : p))
        toast.success(t('admin.shipperManagement.toasts.paymentProcessed'))
    }

    const renderShipperTable = (data) => (
        <div className="admin-shipper-table">
            <table>
                <thead>
                    <tr>
                        <th>{t('admin.shipperManagement.table.shipperId')}</th>
                        <th>{t('profile.name')}</th>
                        <th>{t('admin.shipperManagement.table.contact')}</th>
                        <th>{t('admin.shipperManagement.table.vehicle')}</th>
                        <th>{t('shops.rating')}</th>
                        <th>{t('admin.shipperManagement.table.deliveries')}</th>
                        <th>{t('dashboard.earnings')}</th>
                        <th>{t('shop.incidents.detail.status')}</th>
                        <th>{t('admin.shipperManagement.table.lastActive')}</th>
                        <th>{t('admin.shopManagement.table.actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr><td colSpan={10} className="admin-shipper-empty">{t('admin.shipperManagement.empty.noShippersFound')}</td></tr>
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
                                        <div>{getVehicleTypeLabel(shipper.vehicleType)}</div>
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
                                    ● {getStatusLabel(shipper.status)}
                                </span>
                            </td>
                            <td><div style={{ fontSize: '13px', color: '#64748b' }}>{shipper.lastActive}</div></td>
                            <td>
                                <div className="shipper-actions-cell">
                                    <button className="admin-shipper-icon-btn view-btn" onClick={() => openView(shipper)} title={t('admin.shopManagement.actions.view')}><EyeOutlined /></button>
                                    <button className="admin-shipper-icon-btn edit-btn" onClick={() => openEdit(shipper)} title={t('common.edit')}><EditOutlined /></button>
                                    <button className="admin-shipper-icon-btn delete-btn" onClick={() => openDelete(shipper)} title={t('common.delete')}><DeleteOutlined /></button>
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
                    <h1 className="admin-shipper-title">{t('admin.shipperManagement.title')}</h1>
                    <p className="admin-shipper-subtitle">{t('admin.shipperManagement.subtitle')}</p>
                </div>
                <button className="admin-shipper-create-btn" onClick={openCreate}>
                    <PlusOutlined /> {t('admin.shipperManagement.addShipper')}
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
                                <div className="stat-label">{t(`admin.shipperManagement.stats.${stat.labelKey}`)}</div>
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-change">{stat.changePrefix || ''}{t(`admin.shipperManagement.stats.${stat.changeKey}`)}</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Tabs */}
            <div className="admin-shipper-tabs">
                <button className={`admin-shipper-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                    <CarOutlined /> {t('admin.shipperManagement.tabs.allShippers')} ({allShippers.length})
                </button>
                <button className={`admin-shipper-tab ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>
                    <CheckCircleOutlined /> {t('admin.shopManagement.tabs.pendingApprovals')} ({pendingShippers.length})
                </button>
                <button className={`admin-shipper-tab ${activeTab === 'top' ? 'active' : ''}`} onClick={() => setActiveTab('top')}>
                    <StarOutlined /> {t('admin.shipperManagement.tabs.topPerformers')} ({topShippers.length})
                </button>
                <button className={`admin-shipper-tab ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
                    <DollarOutlined /> {t('admin.shipperManagement.tabs.payments')} ({shipperPayments.length})
                </button>
            </div>

            {/* All / Top Performers */}
            {(activeTab === 'all' || activeTab === 'top') && (
                <div className="admin-shipper-card">
                    <div className="admin-shipper-card-header">
                        <div className="admin-shipper-search">
                            <SearchOutlined className="search-icon" />
                            <input type="text" placeholder={t('admin.shipperManagement.searchPlaceholder')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <button className="admin-shipper-filter-btn"><FilterOutlined /> {t('shops.filter')}</button>
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
                                            <span>{getVehicleTypeLabel(shipper.vehicleType)} - {shipper.licensePlate}</span>
                                        </div>
                                    </div>
                                    <div className="approval-date">{t('admin.shipperManagement.applied')}: {shipper.appliedDate}</div>
                                </div>
                                <div className="approval-documents">
                                    <strong>{t('dashboard.document')}:</strong>
                                    <div className="document-list">
                                        {shipper.documents.map((doc, idx) => (
                                            <span key={idx} className="document-badge">
                                                <FileTextOutlined /> {doc}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="approval-actions">
                                    <button className="btn-view-docs">{t('admin.shipperManagement.viewDocuments')}</button>
                                    <button className="btn-reject" onClick={() => handleRejectShipper(shipper)}>
                                        <CloseCircleOutlined /> {t('admin.overview.reject')}
                                    </button>
                                    <button className="btn-approve" onClick={() => handleApproveShipper(shipper)}>
                                        <CheckCircleOutlined /> {t('admin.overview.approve')}
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
                                    <th>{t('admin.shipperManagement.table.shipperId')}</th>
                                    <th>{t('profile.name')}</th>
                                    <th>{t('admin.shipperManagement.table.period')}</th>
                                    <th>{t('admin.shipperManagement.table.deliveries')}</th>
                                    <th>{t('dashboard.earnings')}</th>
                                    <th>{t('admin.shipperManagement.table.bonuses')}</th>
                                    <th>{t('shop.total')}</th>
                                    <th>{t('shop.incidents.detail.status')}</th>
                                    <th>{t('admin.shopManagement.table.actions')}</th>
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
                                                ● {getStatusLabel(payment.status)}
                                            </span>
                                        </td>
                                        <td>
                                            {payment.status === 'pending' && (
                                                <button className="btn-pay" onClick={() => handleProcessPayment(payment.id)}>{t('admin.shipperManagement.processPayment')}</button>
                                            )}
                                            {payment.status === 'paid' && (
                                                <button className="btn-view-receipt">{t('admin.shipperManagement.viewReceipt')}</button>
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
                            <button className="shipper-modal-close" onClick={closeModal} aria-label={t('common.close')}>×</button>
                        </div>
                        <div className="shipper-modal-body">
                            <div className="shipper-detail-section">
                                <h3>{t('admin.shipperManagement.sections.basicInfo')}</h3>
                                <div className="detail-grid">
                                    <div><strong>{t('shop.documents.detail.id')}:</strong> {selectedShipper.id}</div>
                                    <div><strong>{t('shop.incidents.detail.status')}:</strong> <span style={{ color: getStatusColor(selectedShipper.status), fontWeight: 600 }}>{getStatusLabel(selectedShipper.status)}</span></div>
                                    <div><strong>{t('shop.phone')}:</strong> {selectedShipper.phone}</div>
                                    <div><strong>{t('auth.email')}:</strong> {selectedShipper.email}</div>
                                    <div><strong>{t('admin.shipperManagement.table.vehicle')}:</strong> {getVehicleTypeLabel(selectedShipper.vehicleType)}</div>
                                    <div><strong>{t('admin.shipperManagement.fields.licensePlate')}:</strong> {selectedShipper.licensePlate}</div>
                                    <div><strong>{t('admin.shopManagement.fields.joinDate')}:</strong> {selectedShipper.joinDate}</div>
                                    <div><strong>{t('admin.shipperManagement.table.lastActive')}:</strong> {selectedShipper.lastActive}</div>
                                </div>
                            </div>
                            <div className="shipper-detail-section">
                                <h3>{t('admin.shopManagement.sections.performance')}</h3>
                                <div className="detail-grid">
                                    <div><strong>{t('shops.rating')}:</strong> ⭐ {selectedShipper.rating}</div>
                                    <div><strong>{t('admin.shipperManagement.table.deliveries')}:</strong> {selectedShipper.totalDeliveries}</div>
                                    <div><strong>{t('admin.shipperManagement.stats.totalEarnings')}:</strong> {selectedShipper.totalEarnings}</div>
                                </div>
                            </div>
                        </div>
                        <div className="shipper-modal-footer">
                            <button className={`shipper-modal-btn ${selectedShipper.status === 'active' ? 'danger' : 'success'}`} onClick={() => handleToggleStatus(selectedShipper.id)}>
                                {selectedShipper.status === 'active' ? t('admin.shipperManagement.deactivate') : t('admin.shipperManagement.activate')}
                            </button>
                            <button className="shipper-modal-btn secondary" onClick={closeModal}>{t('common.close')}</button>
                            <button className="shipper-modal-btn primary" onClick={() => { closeModal(); openEdit(selectedShipper) }}>
                                <EditOutlined /> {t('common.edit')}
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
                            <h2>{modal === 'create' ? <><PlusOutlined /> {t('admin.shipperManagement.addNewShipper')}</> : <><EditOutlined /> {t('admin.shipperManagement.editShipper')} - {formData.id}</>}</h2>
                            <button className="shipper-modal-close" onClick={closeModal} aria-label={t('common.close')}>×</button>
                        </div>
                        <div className="shipper-modal-body">
                            <div className="shipper-form-grid">
                                <div className="shipper-form-group">
                                    <label>{t('profile.name')} <span className="required">*</span></label>
                                    <input name="name" value={formData.name} onChange={handleFormChange} placeholder="Nguyễn Văn A" />
                                </div>
                                <div className="shipper-form-group">
                                    <label>{t('shop.phone')} <span className="required">*</span></label>
                                    <input name="phone" value={formData.phone} onChange={handleFormChange} placeholder="09xxxxxxxx" />
                                </div>
                                <div className="shipper-form-group">
                                    <label>{t('auth.email')}</label>
                                    <input name="email" value={formData.email} onChange={handleFormChange} placeholder="email@example.com" />
                                </div>
                                <div className="shipper-form-group">
                                    <label>{t('admin.shipperManagement.fields.vehicleType')}</label>
                                    <select name="vehicleType" value={formData.vehicleType} onChange={handleFormChange}>
                                        {VEHICLE_TYPES.map(v => <option key={v} value={v}>{getVehicleTypeLabel(v)}</option>)}
                                    </select>
                                </div>
                                <div className="shipper-form-group">
                                    <label>{t('admin.shipperManagement.fields.licensePlate')}</label>
                                    <input name="licensePlate" value={formData.licensePlate} onChange={handleFormChange} placeholder="59C-11111" />
                                </div>
                                <div className="shipper-form-group">
                                    <label>{t('shop.incidents.detail.status')}</label>
                                    <select name="status" value={formData.status} onChange={handleFormChange}>
                                        {SHIPPER_STATUSES.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                                    </select>
                                </div>
                                <div className="shipper-form-group shipper-form-group-full">
                                    <label>{t('profile.address')}</label>
                                    <input name="address" value={formData.address} onChange={handleFormChange} placeholder="123 Lê Lợi, Quận 1, TP.HCM" />
                                </div>
                                <div className="shipper-form-group">
                                    <label>{t('admin.shipperManagement.fields.birthDate')}</label>
                                    <input name="birthDate" type="date" value={formData.birthDate} onChange={handleFormChange} />
                                </div>
                                <div className="shipper-form-group">
                                    <label>{t('admin.shipperManagement.fields.identityCard')}</label>
                                    <input name="identityCard" value={formData.identityCard} onChange={handleFormChange} placeholder="079195001122" />
                                </div>
                            </div>
                        </div>
                        <div className="shipper-modal-footer">
                            <button className="shipper-modal-btn secondary" onClick={closeModal}>{t('common.cancel')}</button>
                            <button
                                className="shipper-modal-btn primary"
                                onClick={modal === 'create' ? handleCreate : handleUpdate}
                                disabled={!formData.name || !formData.phone}
                            >
                                {modal === 'create' ? <><PlusOutlined /> {t('admin.shipperManagement.createShipper')}</> : <><CheckCircleOutlined /> {t('shop.saveChanges')}</>}
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
                            <h2><ExclamationCircleOutlined style={{ color: '#c05a50', marginRight: 8 }} />{t('admin.shipperManagement.deleteShipper')}</h2>
                            <button className="shipper-modal-close" onClick={closeModal} aria-label={t('common.close')}>×</button>
                        </div>
                        <div className="shipper-modal-body">
                            <p className="shipper-delete-msg">{t('admin.shipperManagement.confirm.deletePrefix')} <strong>{deleteTarget.name}</strong>?</p>
                            <div className="shipper-delete-info">
                                <div><strong>{t('shop.documents.detail.id')}:</strong> {deleteTarget.id}</div>
                                <div><strong>{t('shop.phone')}:</strong> {deleteTarget.phone}</div>
                                <div><strong>{t('admin.shipperManagement.table.vehicle')}:</strong> {getVehicleTypeLabel(deleteTarget.vehicleType)}</div>
                                <div><strong>{t('shop.incidents.detail.status')}:</strong> {getStatusLabel(deleteTarget.status)}</div>
                            </div>
                            <p className="shipper-delete-warning">{t('shop.documents.confirm.deleteMessageSuffix')}</p>
                        </div>
                        <div className="shipper-modal-footer">
                            <button className="shipper-modal-btn secondary" onClick={closeModal}>{t('common.cancel')}</button>
                            <button className="shipper-modal-btn danger" onClick={handleDelete}><DeleteOutlined /> {t('admin.shipperManagement.deleteShipper')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminShipperManagement

