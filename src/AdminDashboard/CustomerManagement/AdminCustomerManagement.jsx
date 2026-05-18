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
import { useTranslation } from '../../shared/lib/i18n'

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
    const { t } = useTranslation()
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
        { labelKey: 'totalCustomers', value: String(customers.length), changePrefix: '+8.2% ', changeKey: 'vsLastMonth', icon: UserOutlined, color: '#719FC2' },
        { labelKey: 'activeCustomers', value: String(activeCount), changePrefix: `${activeCount}% `, changeKey: 'activeRate', icon: UserOutlined, color: '#4d9e84' },
        { labelKey: 'newThisMonth', value: '342', changePrefix: '+24 ', changeKey: 'thisWeek', icon: UserOutlined, color: '#5492b4' },
        { labelKey: 'totalRevenue', value: '845M VND', changePrefix: '+15% ', changeKey: 'vsLastMonth', icon: DollarOutlined, color: '#719FC2' }
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
    const getStatusLabel = (status) => t(`admin.customerManagement.status.${status}`)
    const getTierLabel = (tier) => t(`admin.customerManagement.tier.${tier}`)
    const getPriorityLabel = (priority) => t(`shop.incidents.priority.${priority}`)

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
        toast.success(`${t('admin.customerManagement.toasts.customerCreated')}: ${newCustomer.name}`)
        closeModal()
    }

    const handleUpdate = () => {
        if (!formData.name || !formData.email) return
        setCustomers(prev => prev.map(c => c.id === formData.id ? { ...formData } : c))
        toast.success(`${t('admin.customerManagement.toasts.customerUpdated')}: ${formData.name}`)
        closeModal()
    }

    const handleDelete = () => {
        setCustomers(prev => prev.filter(c => c.id !== deleteTarget.id))
        toast.error(`${t('admin.customerManagement.toasts.customerDeleted')}: ${deleteTarget.name}`)
        closeModal()
    }

    const handleToggleStatus = (customerId) => {
        setCustomers(prev => prev.map(c => c.id === customerId
            ? { ...c, status: c.status === 'active' ? 'suspended' : 'active' } : c))
        if (selectedCustomer?.id === customerId)
            setSelectedCustomer(prev => ({ ...prev, status: prev.status === 'active' ? 'suspended' : 'active' }))
        const customer = customers.find(c => c.id === customerId)
        toast.success(`${customer?.name || t('admin.customerManagement.customer')} ${t('admin.shopManagement.toasts.statusUpdated')}`)
    }

    const handleResolveComplaint = (complaintId) => {
        setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, status: 'resolved' } : c))
        toast.success(t('admin.customerManagement.toasts.complaintResolved'))
    }

    const renderCustomerTable = (data) => (
        <div className="admin-customer-table">
            <table>
                <thead>
                    <tr>
                        <th>{t('admin.customerManagement.table.customerId')}</th>
                        <th>{t('profile.name')}</th>
                        <th>{t('admin.shipperManagement.table.contact')}</th>
                        <th>{t('admin.shopManagement.fields.joinDate')}</th>
                        <th>{t('profile.totalSpent')}</th>
                        <th>{t('dashboard.orders')}</th>
                        <th>{t('admin.customerManagement.table.points')}</th>
                        <th>{t('admin.customerManagement.table.tier')}</th>
                        <th>{t('shop.incidents.detail.status')}</th>
                        <th>{t('admin.shopManagement.table.actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr><td colSpan={10} className="admin-customer-empty">{t('admin.customerManagement.empty.noCustomersFound')}</td></tr>
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
                                    {getTierLabel(customer.tier)}
                                </span>
                            </td>
                            <td>
                                <span className="customer-status-badge" style={{ color: getStatusColor(customer.status) }}>
                                    ● {getStatusLabel(customer.status)}
                                </span>
                            </td>
                            <td>
                                <div className="customer-actions-cell">
                                    <button className="admin-customer-icon-btn view-btn" onClick={() => openView(customer)} title={t('admin.shopManagement.actions.view')}><EyeOutlined /></button>
                                    <button className="admin-customer-icon-btn edit-btn" onClick={() => openEdit(customer)} title={t('common.edit')}><EditOutlined /></button>
                                    <button className="admin-customer-icon-btn delete-btn" onClick={() => openDelete(customer)} title={t('common.delete')}><DeleteOutlined /></button>
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
                    <h1 className="admin-customer-title">{t('admin.customerManagement.title')}</h1>
                    <p className="admin-customer-subtitle">{t('admin.customerManagement.subtitle')}</p>
                </div>
                <button className="admin-customer-create-btn" onClick={openCreate}>
                    <PlusOutlined /> {t('admin.customerManagement.addCustomer')}
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
                                <div className="stat-label">{t(`admin.customerManagement.stats.${stat.labelKey}`)}</div>
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-change">{stat.changePrefix || ''}{t(`admin.customerManagement.stats.${stat.changeKey}`)}</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Tabs */}
            <div className="admin-customer-tabs">
                <button className={`admin-customer-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                    <UserOutlined /> {t('admin.customerManagement.tabs.allCustomers')} ({customers.length})
                </button>
                <button className={`admin-customer-tab ${activeTab === 'vip' ? 'active' : ''}`} onClick={() => setActiveTab('vip')}>
                    <StarOutlined /> {t('admin.customerManagement.tabs.vipCustomers')} ({vipCustomers.length})
                </button>
                <button className={`admin-customer-tab ${activeTab === 'inactive' ? 'active' : ''}`} onClick={() => setActiveTab('inactive')}>
                    <WarningOutlined /> {t('admin.customerManagement.tabs.inactive')} ({inactiveCustomers.length})
                </button>
                <button className={`admin-customer-tab ${activeTab === 'complaints' ? 'active' : ''}`} onClick={() => setActiveTab('complaints')}>
                    <WarningOutlined /> {t('admin.customerManagement.tabs.complaints')} ({complaints.length})
                </button>
            </div>

            {/* Customer Tables */}
            {(activeTab === 'all' || activeTab === 'vip' || activeTab === 'inactive') && (
                <div className="admin-customer-card">
                    <div className="admin-customer-card-header">
                        <div className="admin-customer-search">
                            <SearchOutlined className="search-icon" />
                            <input type="text" placeholder={t('admin.customerManagement.searchPlaceholder')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <button className="admin-customer-filter-btn"><FilterOutlined /> {t('shops.filter')}</button>
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
                                            ● {getPriorityLabel(complaint.priority)}
                                        </span>
                                    </div>
                                    <span className={`complaint-status status-${complaint.status}`}>{getStatusLabel(complaint.status)}</span>
                                </div>
                                <div className="complaint-content">
                                    <h4>{complaint.issue}</h4>
                                    <div className="complaint-details">
                                        <span>{t('admin.customerManagement.customer')}: {complaint.customerName} ({complaint.customerId})</span>
                                        <span>{t('shop.order')}: {complaint.orderId}</span>
                                    </div>
                                    <div className="complaint-meta">
                                        <span>📅 {complaint.date}</span>
                                        <span>{t('shop.incidents.detail.assignedTo')}: {complaint.assignedTo}</span>
                                    </div>
                                </div>
                                <div className="complaint-actions">
                                    <button className="btn-view">{t('admin.customerManagement.viewDetails')}</button>
                                    {complaint.status !== 'resolved' && (
                                        <button className="btn-resolve" onClick={() => handleResolveComplaint(complaint.id)}>{t('admin.customerManagement.resolve')}</button>
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
                            <button className="customer-modal-close" onClick={closeModal} aria-label={t('common.close')}>×</button>
                        </div>
                        <div className="customer-modal-body">
                            <div className="customer-detail-section">
                                <h3>{t('admin.shipperManagement.sections.basicInfo')}</h3>
                                <div className="detail-grid">
                                    <div><strong>{t('shop.documents.detail.id')}:</strong> {selectedCustomer.id}</div>
                                    <div><strong>{t('shop.incidents.detail.status')}:</strong> <span style={{ color: getStatusColor(selectedCustomer.status), fontWeight: 600 }}>{getStatusLabel(selectedCustomer.status)}</span></div>
                                    <div><strong>{t('auth.email')}:</strong> {selectedCustomer.email}</div>
                                    <div><strong>{t('shop.phone')}:</strong> {selectedCustomer.phone}</div>
                                    <div><strong>{t('admin.shopManagement.fields.joinDate')}:</strong> {selectedCustomer.joinDate}</div>
                                    <div><strong>{t('admin.customerManagement.table.lastOrder')}:</strong> {selectedCustomer.lastOrder}</div>
                                    <div><strong>{t('profile.address')}:</strong> {selectedCustomer.address}</div>
                                </div>
                            </div>
                            <div className="customer-detail-section">
                                <h3>{t('admin.customerManagement.sections.statistics')}</h3>
                                <div className="detail-grid">
                                    <div><strong>{t('profile.totalSpent')}:</strong> {selectedCustomer.totalSpent}</div>
                                    <div><strong>{t('shop.totalOrders')}:</strong> {selectedCustomer.totalOrders}</div>
                                    <div><strong>{t('profile.loyaltyPoints')}:</strong> {selectedCustomer.loyaltyPoints}</div>
                                    <div><strong>{t('admin.customerManagement.table.tier')}:</strong> <span style={{ color: getTierColor(selectedCustomer.tier), fontWeight: 600 }}>{getTierLabel(selectedCustomer.tier)}</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="customer-modal-footer">
                            <button className={`customer-modal-btn ${selectedCustomer.status === 'active' ? 'danger' : 'success'}`} onClick={() => handleToggleStatus(selectedCustomer.id)}>
                                {selectedCustomer.status === 'active' ? t('admin.customerManagement.suspend') : t('admin.shipperManagement.activate')}
                            </button>
                            <button className="customer-modal-btn secondary" onClick={closeModal}>{t('common.close')}</button>
                            <button className="customer-modal-btn primary" onClick={() => { closeModal(); openEdit(selectedCustomer) }}>
                                <EditOutlined /> {t('common.edit')}
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
                            <h2>{modal === 'create' ? <><PlusOutlined /> {t('admin.customerManagement.addNewCustomer')}</> : <><EditOutlined /> {t('admin.customerManagement.editCustomer')} - {formData.id}</>}</h2>
                            <button className="customer-modal-close" onClick={closeModal} aria-label={t('common.close')}>×</button>
                        </div>
                        <div className="customer-modal-body">
                            <div className="customer-form-grid">
                                <div className="customer-form-group">
                                    <label>{t('profile.name')} <span className="required">*</span></label>
                                    <input name="name" value={formData.name} onChange={handleFormChange} placeholder="Nguyễn Văn A" />
                                </div>
                                <div className="customer-form-group">
                                    <label>{t('auth.email')} <span className="required">*</span></label>
                                    <input name="email" value={formData.email} onChange={handleFormChange} placeholder="email@example.com" />
                                </div>
                                <div className="customer-form-group">
                                    <label>{t('shop.phone')}</label>
                                    <input name="phone" value={formData.phone} onChange={handleFormChange} placeholder="09xxxxxxxx" />
                                </div>
                                <div className="customer-form-group">
                                    <label>{t('admin.customerManagement.table.tier')}</label>
                                    <select name="tier" value={formData.tier} onChange={handleFormChange}>
                                        {TIERS.map(tier => <option key={tier} value={tier}>{getTierLabel(tier)}</option>)}
                                    </select>
                                </div>
                                <div className="customer-form-group">
                                    <label>{t('shop.incidents.detail.status')}</label>
                                    <select name="status" value={formData.status} onChange={handleFormChange}>
                                        {CUSTOMER_STATUSES.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                                    </select>
                                </div>
                                <div className="customer-form-group">
                                    <label>{t('profile.loyaltyPoints')}</label>
                                    <input name="loyaltyPoints" type="number" min="0" value={formData.loyaltyPoints} onChange={handleFormChange} />
                                </div>
                                <div className="customer-form-group customer-form-group-full">
                                    <label>{t('profile.address')}</label>
                                    <input name="address" value={formData.address} onChange={handleFormChange} placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM" />
                                </div>
                            </div>
                        </div>
                        <div className="customer-modal-footer">
                            <button className="customer-modal-btn secondary" onClick={closeModal}>{t('common.cancel')}</button>
                            <button
                                className="customer-modal-btn primary"
                                onClick={modal === 'create' ? handleCreate : handleUpdate}
                                disabled={!formData.name || !formData.email}
                            >
                                {modal === 'create' ? <><PlusOutlined /> {t('admin.customerManagement.createCustomer')}</> : <><CheckCircleOutlined /> {t('shop.saveChanges')}</>}
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
                            <h2><ExclamationCircleOutlined style={{ color: '#c05a50', marginRight: 8 }} />{t('admin.customerManagement.deleteCustomer')}</h2>
                            <button className="customer-modal-close" onClick={closeModal} aria-label={t('common.close')}>×</button>
                        </div>
                        <div className="customer-modal-body">
                            <p className="customer-delete-msg">{t('admin.customerManagement.confirm.deletePrefix')} <strong>{deleteTarget.name}</strong>?</p>
                            <div className="customer-delete-info">
                                <div><strong>{t('shop.documents.detail.id')}:</strong> {deleteTarget.id}</div>
                                <div><strong>{t('auth.email')}:</strong> {deleteTarget.email}</div>
                                <div><strong>{t('admin.customerManagement.table.tier')}:</strong> {getTierLabel(deleteTarget.tier)}</div>
                                <div><strong>{t('shop.incidents.detail.status')}:</strong> {getStatusLabel(deleteTarget.status)}</div>
                            </div>
                            <p className="customer-delete-warning">{t('shop.documents.confirm.deleteMessageSuffix')}</p>
                        </div>
                        <div className="customer-modal-footer">
                            <button className="customer-modal-btn secondary" onClick={closeModal}>{t('common.cancel')}</button>
                            <button className="customer-modal-btn danger" onClick={handleDelete}><DeleteOutlined /> {t('admin.customerManagement.deleteCustomer')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminCustomerManagement

