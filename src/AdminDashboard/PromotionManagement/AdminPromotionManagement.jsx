import { useState } from 'react'
import './AdminPromotionManagement.css'
import {
    GiftOutlined,
    TagOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    PlusOutlined,
    TrophyOutlined,
    ShopOutlined,
    StarOutlined,
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons'
import {
    promotions as promotionsData,
    shopAchievements as achievementsData
} from '../../data'
import toast from '../../utils/toast'

const PROMO_TYPES = ['percentage', 'fixed']
const PROMO_STATUSES = ['active', 'inactive']
const APPLICABLE_TO = ['all', 'new_users', 'gold_tier', 'platinum_tier', 'weekend', 'first_order']

const EMPTY_PROMO = {
    code: '', type: 'percentage', value: 10,
    description: '',
    minOrderValue: 0, maxDiscount: 100000,
    usageLimit: 100, usedCount: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'active',
    applicableTo: 'all',
    createdBy: 'Admin',
}

function AdminPromotionManagement() {
    const [activeTab, setActiveTab] = useState('promotions')
    const [promotions, setPromotions] = useState(promotionsData)
    const [achievements, setAchievements] = useState(achievementsData)
    const [filterStatus, setFilterStatus] = useState('all')

    // modal: null | 'create' | 'edit' | 'delete'
    const [modal, setModal] = useState(null)
    const [formData, setFormData] = useState(EMPTY_PROMO)
    const [deleteTarget, setDeleteTarget] = useState(null)

    const activeCount = promotions.filter(p => p.status === 'active').length
    const expiredCount = promotions.filter(p => p.status === 'expired').length
    const totalUsage = promotions.reduce((sum, p) => sum + (p.usedCount || 0), 0)

    const stats = [
        { label: 'Total Promotions', value: String(promotions.length), color: '#719FC2' },
        { label: 'Active', value: String(activeCount), color: '#4d9e84' },
        { label: 'Expired', value: String(expiredCount), color: '#6b7280' },
        { label: 'Total Usage', value: String(totalUsage), color: '#5492b4' }
    ]

    const filteredPromotions = promotions.filter(p =>
        filterStatus === 'all' || p.status === filterStatus
    )

    const openCreate = () => { setFormData({ ...EMPTY_PROMO }); setModal('create') }
    const openEdit = (promo) => { setFormData({ ...promo }); setModal('edit') }
    const openDelete = (promo) => { setDeleteTarget(promo); setModal('delete') }
    const closeModal = () => { setModal(null); setDeleteTarget(null) }

    const handleFormChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCreate = () => {
        if (!formData.code || !formData.description) return
        const nextNum = Math.max(...promotions.map(p => parseInt(p.id.replace(/\D/g, '')) || 0)) + 1
        const newPromo = { ...formData, id: `PROMO-${String(nextNum).padStart(3, '0')}`, value: Number(formData.value), usageLimit: Number(formData.usageLimit), minOrderValue: Number(formData.minOrderValue), maxDiscount: Number(formData.maxDiscount), usedCount: 0 }
        setPromotions(prev => [newPromo, ...prev])
        toast.success(`Promotion "${newPromo.code}" created`)
        closeModal()
    }

    const handleUpdate = () => {
        if (!formData.code || !formData.description) return
        setPromotions(prev => prev.map(p => p.id === formData.id ? { ...formData, value: Number(formData.value), usageLimit: Number(formData.usageLimit), minOrderValue: Number(formData.minOrderValue), maxDiscount: Number(formData.maxDiscount) } : p))
        toast.success(`Promotion "${formData.code}" updated`)
        closeModal()
    }

    const handleDelete = () => {
        setPromotions(prev => prev.filter(p => p.id !== deleteTarget.id))
        toast.error(`Promotion "${deleteTarget.code}" deleted`)
        closeModal()
    }

    const handleTogglePromo = (promoId) => {
        setPromotions(prev => prev.map(p => {
            if (p.id !== promoId) return p
            const newStatus = p.status === 'active' ? 'inactive' : 'active'
            toast.success('Promotion "' + p.code + '" ' + newStatus)
            return { ...p, status: newStatus }
        }))
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#4d9e84'
            case 'expired': return '#6b7280'
            case 'inactive': return '#5492b4'
            default: return '#6b7280'
        }
    }

    const getTypeLabel = (type, value) => {
        if (type === 'percentage') return value + '% off'
        if (type === 'fixed') return (value / 1000) + 'K off'
        return value
    }

    return (
        <div className="admin-promotion-management">
            <div className="admin-promo-header">
                <div>
                    <h1 className="admin-promo-title">Promotions & Marketing</h1>
                    <p className="admin-promo-subtitle">Manage discount codes, campaigns, and shop achievements</p>
                </div>
                <button className="admin-promo-add-btn" onClick={openCreate}>
                    <PlusOutlined /> Create Promotion
                </button>
            </div>

            {/* Stats */}
            <div className="admin-promo-stats">
                {stats.map((stat, i) => (
                    <div key={i} className="admin-promo-stat-card">
                        <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="admin-promo-tabs">
                <button
                    className={'admin-promo-tab' + (activeTab === 'promotions' ? ' active' : '')}
                    onClick={() => setActiveTab('promotions')}
                >
                    <TagOutlined /> Promo Codes ({promotions.length})
                </button>
                <button
                    className={'admin-promo-tab' + (activeTab === 'achievements' ? ' active' : '')}
                    onClick={() => setActiveTab('achievements')}
                >
                    <TrophyOutlined /> Shop Achievements ({achievements.length})
                </button>
            </div>

            {/* Promotions Tab */}
            {activeTab === 'promotions' && (
                <div className="admin-promo-card">
                    <div className="admin-promo-card-header">
                        <div className="promo-status-filters">
                            {['all', 'active', 'inactive', 'expired'].map(s => (
                                <button
                                    key={s}
                                    className={'promo-filter' + (filterStatus === s ? ' active' : '')}
                                    onClick={() => setFilterStatus(s)}
                                >
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="admin-promo-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Description</th>
                                    <th>Discount</th>
                                    <th>Usage</th>
                                    <th>Valid Period</th>
                                    <th>Applies To</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPromotions.map(promo => (
                                    <tr key={promo.id}>
                                        <td>
                                            <div className="promo-code-badge">
                                                <TagOutlined style={{ marginRight: 6 }} />
                                                {promo.code}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="promo-description">{promo.description}</div>
                                        </td>
                                        <td>
                                            <div className="promo-discount">{getTypeLabel(promo.type, promo.value)}</div>
                                        </td>
                                        <td>
                                            <div className="promo-usage">
                                                <span className="used">{promo.usedCount}</span>
                                                <span className="separator"> / </span>
                                                <span className="limit">{promo.usageLimit}</span>
                                            </div>
                                            <div className="promo-usage-bar">
                                                <div
                                                    className="promo-usage-fill"
                                                    style={{ width: Math.min(100, promo.usedCount / promo.usageLimit * 100) + '%' }}
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '13px' }}>
                                                <div>{promo.startDate}</div>
                                                <div style={{ color: '#6b7280' }}>→ {promo.endDate}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="promo-applies-badge">{promo.applicableTo.replace('_', ' ')}</span>
                                        </td>
                                        <td>
                                            <span className="promo-status" style={{ color: getStatusColor(promo.status) }}>
                                                ● {promo.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                {promo.status !== 'expired' && (
                                                    <button
                                                        className={'promo-action-btn ' + (promo.status === 'active' ? 'deactivate' : 'activate')}
                                                        onClick={() => handleTogglePromo(promo.id)}
                                                    >
                                                        {promo.status === 'active' ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                                                        {promo.status === 'active' ? ' Deactivate' : ' Activate'}
                                                    </button>
                                                )}
                                                <button
                                                    className="promo-action-btn edit"
                                                    onClick={() => openEdit(promo)}
                                                >
                                                    <EditOutlined />
                                                </button>
                                                <button
                                                    className="promo-action-btn delete"
                                                    onClick={() => openDelete(promo)}
                                                >
                                                    <DeleteOutlined />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Shop Achievements Tab */}
            {activeTab === 'achievements' && (
                <div className="admin-promo-achievements-grid">
                    {achievements.map(ach => (
                        <div key={ach.id} className="achievement-card">
                            <div className="achievement-card-header">
                                <div className="achievement-badge">{ach.badge}</div>
                                <div className="achievement-title">{ach.achievement}</div>
                            </div>
                            <div className="achievement-card-body">
                                <div className="achievement-info-row">
                                    <ShopOutlined style={{ marginRight: 6, color: '#719FC2' }} />
                                    <span>{ach.shopId}</span>
                                </div>
                                <div className="achievement-info-row">
                                    <StarOutlined style={{ marginRight: 6, color: '#5492b4' }} />
                                    <span>{ach.reward}</span>
                                </div>
                                {ach.criteria && (
                                    <div className="achievement-criteria">
                                        <strong>Criteria:</strong> {ach.criteria}
                                    </div>
                                )}
                                {ach.awardedDate && (
                                    <div className="achievement-date">Awarded: {ach.awardedDate}</div>
                                )}
                            </div>
                            <div className="achievement-card-footer">
                                <span className="achievement-status" style={{ color: getStatusColor(ach.status || 'active') }}>
                                    ● {ach.status || 'active'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Create / Edit Modal ── */}
            {(modal === 'create' || modal === 'edit') && (
                <div className="promo-modal-overlay" onClick={closeModal}>
                    <div className="promo-modal-content promo-modal-form" onClick={e => e.stopPropagation()}>
                        <div className="promo-modal-header">
                            <h2>{modal === 'create' ? <><PlusOutlined /> Create Promotion</> : <><EditOutlined /> Edit Promotion — {formData.id}</>}</h2>
                            <button className="promo-modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="promo-modal-body">
                            <div className="promo-form-grid">
                                <div className="promo-form-group">
                                    <label>Promo Code <span className="required">*</span></label>
                                    <input name="code" value={formData.code} onChange={handleFormChange} placeholder="e.g. SUMMER20" style={{ textTransform: 'uppercase' }} />
                                </div>
                                <div className="promo-form-group">
                                    <label>Type</label>
                                    <select name="type" value={formData.type} onChange={handleFormChange}>
                                        {PROMO_TYPES.map(t => <option key={t} value={t}>{t === 'percentage' ? 'Percentage (%)' : 'Fixed Amount (VND)'}</option>)}
                                    </select>
                                </div>
                                <div className="promo-form-group">
                                    <label>Value {formData.type === 'percentage' ? '(%)' : '(VND)'}</label>
                                    <input name="value" type="number" min="0" value={formData.value} onChange={handleFormChange} />
                                </div>
                                <div className="promo-form-group">
                                    <label>Status</label>
                                    <select name="status" value={formData.status} onChange={handleFormChange}>
                                        {PROMO_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div className="promo-form-group promo-form-group-full">
                                    <label>Description <span className="required">*</span></label>
                                    <input name="description" value={formData.description} onChange={handleFormChange} placeholder="Describe the promotion..." />
                                </div>
                                <div className="promo-form-group">
                                    <label>Min Order Value (VND)</label>
                                    <input name="minOrderValue" type="number" min="0" value={formData.minOrderValue} onChange={handleFormChange} />
                                </div>
                                <div className="promo-form-group">
                                    <label>Max Discount (VND)</label>
                                    <input name="maxDiscount" type="number" min="0" value={formData.maxDiscount} onChange={handleFormChange} />
                                </div>
                                <div className="promo-form-group">
                                    <label>Usage Limit</label>
                                    <input name="usageLimit" type="number" min="1" value={formData.usageLimit} onChange={handleFormChange} />
                                </div>
                                <div className="promo-form-group">
                                    <label>Applies To</label>
                                    <select name="applicableTo" value={formData.applicableTo} onChange={handleFormChange}>
                                        {APPLICABLE_TO.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
                                    </select>
                                </div>
                                <div className="promo-form-group">
                                    <label>Start Date</label>
                                    <input name="startDate" type="date" value={formData.startDate} onChange={handleFormChange} />
                                </div>
                                <div className="promo-form-group">
                                    <label>End Date</label>
                                    <input name="endDate" type="date" value={formData.endDate} onChange={handleFormChange} />
                                </div>
                            </div>
                        </div>
                        <div className="promo-modal-footer">
                            <button className="promo-modal-btn secondary" onClick={closeModal}>Cancel</button>
                            <button
                                className="promo-modal-btn primary"
                                onClick={modal === 'create' ? handleCreate : handleUpdate}
                                disabled={!formData.code || !formData.description}
                            >
                                {modal === 'create' ? <><PlusOutlined /> Create</> : <><CheckCircleOutlined /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm Modal ── */}
            {modal === 'delete' && deleteTarget && (
                <div className="promo-modal-overlay" onClick={closeModal}>
                    <div className="promo-modal-content promo-modal-delete" onClick={e => e.stopPropagation()}>
                        <div className="promo-modal-header">
                            <h2><ExclamationCircleOutlined style={{ color: '#c05a50', marginRight: 8 }} />Delete Promotion</h2>
                            <button className="promo-modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="promo-modal-body">
                            <p className="promo-delete-msg">Are you sure you want to delete <strong>{deleteTarget.code}</strong>?</p>
                            <div className="promo-delete-info">
                                <div><strong>ID:</strong> {deleteTarget.id}</div>
                                <div><strong>Type:</strong> {deleteTarget.type}</div>
                                <div><strong>Discount:</strong> {getTypeLabel(deleteTarget.type, deleteTarget.value)}</div>
                                <div><strong>Status:</strong> {deleteTarget.status}</div>
                            </div>
                            <p className="promo-delete-warning">This action cannot be undone.</p>
                        </div>
                        <div className="promo-modal-footer">
                            <button className="promo-modal-btn secondary" onClick={closeModal}>Cancel</button>
                            <button className="promo-modal-btn danger" onClick={handleDelete}><DeleteOutlined /> Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminPromotionManagement

