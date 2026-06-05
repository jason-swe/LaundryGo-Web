import { createElement, useState } from 'react'
import {
    AlertTriangle,
    CheckCircle,
    CircleDollarSign,
    Gift,
    Mail,
    Plus,
    Search,
    ShieldAlert,
    ShoppingBag,
    Star,
    UserRound,
    X,
    XCircle,
} from 'lucide-react'
import './AdminCustomerManagement.css'
import {
    adminCustomers as customersData,
    customerComplaints as complaintsData,
} from '../../data'
import toast from '../../utils/toast'
import { useTranslation } from '../../shared/lib/i18n'

const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum']
const CUSTOMER_STATUSES = ['active', 'inactive', 'suspended']

const EMPTY_FORM = {
    name: '',
    email: '',
    phone: '',
    address: '',
    tier: 'Bronze',
    status: 'active',
    totalSpent: '0',
    totalSpentValue: 0,
    totalOrders: 0,
    loyaltyPoints: 0,
    joinDate: '2026-06-02',
    lastOrder: '2026-06-02',
    avatar: null,
}

function statusKey(status) {
    return status === 'active' ? 'active' : status === 'inactive' ? 'inactive' : status === 'suspended' ? 'suspended' : status === 'resolved' ? 'resolved' : status === 'in-progress' ? 'inProgress' : 'pending'
}

function priorityKey(priority) {
    return priority === 'high' ? 'high' : priority === 'medium' ? 'medium' : 'low'
}

function AdminCustomerManagement() {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState('all')
    const [customers, setCustomers] = useState(customersData)
    const [complaints, setComplaints] = useState(complaintsData)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCustomerId, setSelectedCustomerId] = useState(customersData[0]?.id || null)
    const [modal, setModal] = useState(null)
    const [formData, setFormData] = useState(EMPTY_FORM)
    const [deleteTarget, setDeleteTarget] = useState(null)

    const query = searchQuery.trim().toLowerCase()
    const filteredCustomers = customers.filter(customer =>
        !query ||
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.includes(query) ||
        customer.id.toLowerCase().includes(query)
    )
    const vipCustomers = filteredCustomers.filter(customer => customer.tier === 'Platinum' || customer.tier === 'Gold')
    const inactiveCustomers = filteredCustomers.filter(customer => customer.status === 'inactive' || customer.status === 'suspended')
    const selectedCustomer = customers.find(customer => customer.id === selectedCustomerId) || filteredCustomers[0] || null

    const activeCount = customers.filter(customer => customer.status === 'active').length
    const totalRevenue = customers.reduce((sum, customer) => sum + (customer.totalSpentValue || 0), 0)
    const totalOrders = customers.reduce((sum, customer) => sum + (customer.totalOrders || 0), 0)
    const openComplaints = complaints.filter(complaint => complaint.status !== 'resolved').length

    const kpis = [
        { label: t('adminCustomers.totalCustomers'), value: customers.length, meta: `${activeCount} ${t('adminCustomers.active')}`, Icon: UserRound },
        { label: t('adminCustomers.vipCustomers'), value: customers.filter(customer => customer.tier === 'Platinum' || customer.tier === 'Gold').length, meta: t('adminCustomers.loyaltySegment'), Icon: Star },
        { label: t('adminCustomers.totalOrders'), value: totalOrders.toLocaleString(), meta: t('adminCustomers.platformOrders'), Icon: ShoppingBag },
        { label: t('adminCustomers.totalRevenue'), value: `${(totalRevenue / 1000000).toFixed(1)}M`, meta: t('adminCustomers.customerSpend'), Icon: CircleDollarSign },
        { label: t('adminCustomers.openComplaints'), value: openComplaints, meta: t('adminCustomers.supportQueue'), Icon: ShieldAlert },
    ]

    const tabs = [
        { id: 'all', label: t('adminCustomers.allCustomers'), count: customers.length },
        { id: 'vip', label: t('adminCustomers.vipCustomers'), count: vipCustomers.length },
        { id: 'inactive', label: t('adminCustomers.inactive'), count: inactiveCustomers.length },
        { id: 'complaints', label: t('adminCustomers.complaints'), count: complaints.length },
    ]

    const openCreate = () => {
        setFormData({ ...EMPTY_FORM })
        setModal('create')
    }

    const openEdit = (customer) => {
        setFormData({ ...customer })
        setModal('edit')
    }

    const openDelete = (customer) => {
        setDeleteTarget(customer)
        setModal('delete')
    }

    const closeModal = () => {
        setModal(null)
        setDeleteTarget(null)
    }

    const handleFormChange = (event) => {
        const { name, value } = event.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCreate = () => {
        if (!formData.name || !formData.email) return
        const nextNum = Math.max(...customers.map(customer => parseInt(customer.id.replace(/\D/g, ''), 10) || 0)) + 1
        const newCustomer = { ...formData, id: `CUS-${nextNum}` }
        setCustomers(prev => [newCustomer, ...prev])
        setSelectedCustomerId(newCustomer.id)
        toast.success(t('adminCustomers.created').replace('{name}', newCustomer.name))
        closeModal()
    }

    const handleUpdate = () => {
        if (!formData.name || !formData.email) return
        setCustomers(prev => prev.map(customer => customer.id === formData.id ? { ...formData } : customer))
        setSelectedCustomerId(formData.id)
        toast.success(t('adminCustomers.updated').replace('{name}', formData.name))
        closeModal()
    }

    const handleDelete = () => {
        setCustomers(prev => prev.filter(customer => customer.id !== deleteTarget.id))
        if (selectedCustomerId === deleteTarget.id) setSelectedCustomerId(customers[0]?.id || null)
        toast.success(t('adminCustomers.deleted').replace('{name}', deleteTarget.name))
        closeModal()
    }

    const handleToggleStatus = (customer) => {
        const nextStatus = customer.status === 'active' ? 'suspended' : 'active'
        setCustomers(prev => prev.map(item => item.id === customer.id ? { ...item, status: nextStatus } : item))
        toast.success(t('adminCustomers.statusUpdated'))
    }

    const handleResolveComplaint = (complaint) => {
        setComplaints(prev => prev.map(item => item.id === complaint.id ? { ...item, status: 'resolved', resolvedDate: '2026-06-02' } : item))
        toast.success(t('adminCustomers.complaintResolved'))
    }

    const renderCustomerTable = (rows) => (
        <div className="admin-customers-table-wrap">
            <table className="admin-customers-table">
                <thead>
                    <tr>
                        <th>{t('adminCustomers.customer')}</th>
                        <th>{t('adminCustomers.contact')}</th>
                        <th>{t('adminCustomers.joinDate')}</th>
                        <th>{t('adminCustomers.spent')}</th>
                        <th>{t('adminCustomers.orders')}</th>
                        <th>{t('adminCustomers.points')}</th>
                        <th>{t('adminCustomers.tier')}</th>
                        <th>{t('adminCustomers.status')}</th>
                        <th>{t('adminCustomers.action')}</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr><td colSpan={9} className="admin-customers-empty">{t('adminCustomers.emptyCustomers')}</td></tr>
                    ) : rows.map(customer => (
                        <tr key={customer.id} className={selectedCustomer?.id === customer.id ? 'selected' : ''} onClick={() => setSelectedCustomerId(customer.id)}>
                            <td><strong>{customer.name}</strong><small>{customer.id}</small></td>
                            <td><strong>{customer.email}</strong><small>{customer.phone}</small></td>
                            <td>{customer.joinDate}</td>
                            <td className="money">{customer.totalSpent}</td>
                            <td>{customer.totalOrders}</td>
                            <td>{customer.loyaltyPoints}</td>
                            <td><span className={`admin-customers-tier ${customer.tier.toLowerCase()}`}>{t(`adminCustomers.tier${customer.tier}`)}</span></td>
                            <td><span className={`admin-customers-badge ${statusKey(customer.status)}`}>{t(`adminCustomers.status${statusKey(customer.status)}`)}</span></td>
                            <td>
                                <div className="admin-customers-actions">
                                    <button type="button" onClick={(event) => { event.stopPropagation(); openEdit(customer) }}>{t('adminCustomers.edit')}</button>
                                    <button type="button" className="danger" onClick={(event) => { event.stopPropagation(); openDelete(customer) }}>{t('adminCustomers.delete')}</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )

    const activeRows = activeTab === 'vip' ? vipCustomers : activeTab === 'inactive' ? inactiveCustomers : filteredCustomers

    return (
        <div className="admin-customers-page">
            <header className="admin-customers-header">
                <div>
                    <span className="admin-customers-eyebrow">{t('adminCustomers.eyebrow')}</span>
                    <h1>{t('adminCustomers.title')}</h1>
                    <p>{t('adminCustomers.subtitle')}</p>
                </div>
                <button type="button" className="admin-customers-primary" onClick={openCreate}>
                    <Plus size={17} strokeWidth={1.9} />{t('adminCustomers.addCustomer')}
                </button>
            </header>

            <section className="admin-customers-kpis">
                {kpis.map(({ label, value, meta, Icon }) => (
                    <article className="admin-customers-kpi" key={label}>
                        <span>{createElement(Icon, { size: 18, strokeWidth: 1.9 })}</span>
                        <small>{label}</small>
                        <strong>{value}</strong>
                        <p>{meta}</p>
                    </article>
                ))}
            </section>

            <section className="admin-customers-tabs">
                {tabs.map(tab => (
                    <button type="button" className={activeTab === tab.id ? 'active' : ''} key={tab.id} onClick={() => setActiveTab(tab.id)}>
                        {tab.label}
                        <span>{tab.count}</span>
                    </button>
                ))}
            </section>

            {activeTab !== 'complaints' && (
                <section className="admin-customers-workspace">
                    <article className="admin-customers-card admin-customers-table-card">
                        <div className="admin-customers-card-head">
                            <div>
                                <span className="admin-customers-eyebrow">{t('adminCustomers.directory')}</span>
                                <h2>{activeRows.length} {t('adminCustomers.results')}</h2>
                            </div>
                            <label className="admin-customers-search">
                                <Search size={17} strokeWidth={1.9} />
                                <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={t('adminCustomers.searchPlaceholder')} />
                            </label>
                        </div>
                        {renderCustomerTable(activeRows)}
                    </article>

                    <aside className="admin-customers-card admin-customers-detail">
                        {selectedCustomer ? (
                            <>
                                <div className="admin-customers-detail-head">
                                    <div>
                                        <span className="admin-customers-eyebrow">{t('adminCustomers.customerProfile')}</span>
                                        <h2>{selectedCustomer.name}</h2>
                                    </div>
                                    <span className={`admin-customers-badge ${statusKey(selectedCustomer.status)}`}>{t(`adminCustomers.status${statusKey(selectedCustomer.status)}`)}</span>
                                </div>
                                <dl className="admin-customers-detail-grid">
                                    <div><dt>{t('adminCustomers.customerId')}</dt><dd>{selectedCustomer.id}</dd></div>
                                    <div><dt>{t('adminCustomers.email')}</dt><dd>{selectedCustomer.email}</dd></div>
                                    <div><dt>{t('adminCustomers.phone')}</dt><dd>{selectedCustomer.phone}</dd></div>
                                    <div><dt>{t('adminCustomers.address')}</dt><dd>{selectedCustomer.address}</dd></div>
                                    <div><dt>{t('adminCustomers.lastOrder')}</dt><dd>{selectedCustomer.lastOrder}</dd></div>
                                    <div><dt>{t('adminCustomers.totalSpent')}</dt><dd>{selectedCustomer.totalSpent}</dd></div>
                                    <div><dt>{t('adminCustomers.totalOrders')}</dt><dd>{selectedCustomer.totalOrders}</dd></div>
                                    <div><dt>{t('adminCustomers.loyaltyPoints')}</dt><dd>{selectedCustomer.loyaltyPoints}</dd></div>
                                </dl>
                                <div className="admin-customers-detail-actions">
                                    <button type="button" onClick={() => handleToggleStatus(selectedCustomer)}>
                                        <AlertTriangle size={15} />{selectedCustomer.status === 'active' ? t('adminCustomers.suspend') : t('adminCustomers.activate')}
                                    </button>
                                    <button type="button" className="primary" onClick={() => openEdit(selectedCustomer)}>
                                        <Mail size={15} />{t('adminCustomers.edit')}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="admin-customers-empty"><UserRound size={28} /><strong>{t('adminCustomers.noSelection')}</strong></div>
                        )}
                    </aside>
                </section>
            )}

            {activeTab === 'complaints' && (
                <section className="admin-customers-complaint-grid">
                    {complaints.map(complaint => (
                        <article className="admin-customers-card admin-customers-complaint" key={complaint.id}>
                            <div className="admin-customers-complaint-head">
                                <span><ShieldAlert size={18} /></span>
                                <div>
                                    <strong>{complaint.subject}</strong>
                                    <small>{complaint.id} · {complaint.orderId}</small>
                                </div>
                            </div>
                            <p>{complaint.description}</p>
                            <dl>
                                <div><dt>{t('adminCustomers.customer')}</dt><dd>{complaint.customerName} · {complaint.customerId}</dd></div>
                                <div><dt>{t('adminCustomers.shop')}</dt><dd>{complaint.shopName}</dd></div>
                                <div><dt>{t('adminCustomers.reportedDate')}</dt><dd>{complaint.reportedDate}</dd></div>
                                <div><dt>{t('adminCustomers.priority')}</dt><dd><span className={`admin-customers-badge ${priorityKey(complaint.priority)}`}>{t(`adminCustomers.priority${priorityKey(complaint.priority)}`)}</span></dd></div>
                                <div><dt>{t('adminCustomers.status')}</dt><dd><span className={`admin-customers-badge ${statusKey(complaint.status)}`}>{t(`adminCustomers.status${statusKey(complaint.status)}`)}</span></dd></div>
                            </dl>
                            <div className="admin-customers-complaint-actions">
                                {complaint.status !== 'resolved' ? (
                                    <button type="button" className="primary" onClick={() => handleResolveComplaint(complaint)}><CheckCircle size={15} />{t('adminCustomers.resolve')}</button>
                                ) : (
                                    <span><CheckCircle size={15} />{t('adminCustomers.resolved')}</span>
                                )}
                            </div>
                        </article>
                    ))}
                </section>
            )}

            {(modal === 'create' || modal === 'edit') && (
                <div className="admin-customers-modal-backdrop" onClick={closeModal}>
                    <div className="admin-customers-modal" onClick={event => event.stopPropagation()}>
                        <div className="admin-customers-modal-head">
                            <h2>{modal === 'create' ? t('adminCustomers.newCustomer') : t('adminCustomers.editCustomer')}</h2>
                            <button type="button" onClick={closeModal} aria-label={t('common.close')}><X size={18} /></button>
                        </div>
                        <div className="admin-customers-form-grid">
                            <label>{t('adminCustomers.fullName')}<input name="name" value={formData.name} onChange={handleFormChange} placeholder="Nguyễn Văn A" /></label>
                            <label>{t('adminCustomers.email')}<input name="email" value={formData.email} onChange={handleFormChange} placeholder="email@example.com" /></label>
                            <label>{t('adminCustomers.phone')}<input name="phone" value={formData.phone} onChange={handleFormChange} placeholder="09xxxxxxxx" /></label>
                            <label>{t('adminCustomers.tier')}<select name="tier" value={formData.tier} onChange={handleFormChange}>{TIERS.map(tier => <option key={tier} value={tier}>{t(`adminCustomers.tier${tier}`)}</option>)}</select></label>
                            <label>{t('adminCustomers.status')}<select name="status" value={formData.status} onChange={handleFormChange}>{CUSTOMER_STATUSES.map(status => <option key={status} value={status}>{t(`adminCustomers.status${statusKey(status)}`)}</option>)}</select></label>
                            <label>{t('adminCustomers.loyaltyPoints')}<input name="loyaltyPoints" type="number" min="0" value={formData.loyaltyPoints} onChange={handleFormChange} /></label>
                            <label className="full">{t('adminCustomers.address')}<input name="address" value={formData.address} onChange={handleFormChange} placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM" /></label>
                        </div>
                        <div className="admin-customers-modal-actions">
                            <button type="button" onClick={closeModal}>{t('common.cancel')}</button>
                            <button type="button" className="primary" disabled={!formData.name || !formData.email} onClick={modal === 'create' ? handleCreate : handleUpdate}>{modal === 'create' ? t('adminCustomers.create') : t('adminCustomers.saveChanges')}</button>
                        </div>
                    </div>
                </div>
            )}

            {modal === 'delete' && deleteTarget && (
                <div className="admin-customers-modal-backdrop" onClick={closeModal}>
                    <div className="admin-customers-modal small" onClick={event => event.stopPropagation()}>
                        <div className="admin-customers-modal-head">
                            <h2>{t('adminCustomers.deleteCustomer')}</h2>
                            <button type="button" onClick={closeModal} aria-label={t('common.close')}><X size={18} /></button>
                        </div>
                        <div className="admin-customers-delete">
                            <XCircle size={30} />
                            <p>{t('adminCustomers.deleteMessage').replace('{name}', deleteTarget.name)}</p>
                        </div>
                        <div className="admin-customers-modal-actions">
                            <button type="button" onClick={closeModal}>{t('common.cancel')}</button>
                            <button type="button" className="danger" onClick={handleDelete}>{t('adminCustomers.delete')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminCustomerManagement
