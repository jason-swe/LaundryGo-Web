import { useEffect, useState } from 'react'
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
    shopAchievements as achievementsData
} from '../../data'
import {
    createAdminVoucher,
    deleteAdminVoucher,
    getAdminVouchers,
    toggleAdminVoucherStatus,
    updateAdminVoucher,
} from '../../services/adminApi'
import toast from '../../utils/toast'
import { useTranslation } from '../../shared/lib/i18n'

const PROMO_TYPES = ['percentage', 'fixed']
const APPLICABLE_TO = ['all', 'new_users', 'gold_tier', 'platinum_tier', 'weekend', 'first_order']
const VOUCHER_TYPES = ['PLATFORM', 'SHOP']

const EMPTY_PROMO = {
    code: '', type: 'percentage', value: 10,
    description: '',
    minOrderValue: 0, maxDiscount: 100000,
    usageLimit: 100, usedCount: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'active',
    applicableTo: 'all',
    voucherType: 'PLATFORM',
    createdBy: 'Admin',
}

const toNumber = (value, fallback = 0) => {
    const number = Number(value)
    return Number.isFinite(number) ? number : fallback
}

const toDateOnly = (value) => {
    if (!value) return ''
    if (typeof value === 'string') return value.slice(0, 10)
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toISOString().slice(0, 10)
}

const mapVoucherToPromo = (voucher = {}) => {
    const rawStatus = String(voucher.status || '').toLowerCase()
    const activeFlag = typeof voucher.isActive === 'boolean'
        ? voucher.isActive
        : typeof voucher.active === 'boolean'
            ? voucher.active
            : null
    const activeStatus = activeFlag === null ? '' : (activeFlag ? 'active' : 'inactive')

    return {
        id: voucher.id ?? voucher.voucherId ?? voucher.code ?? '',
        code: voucher.code || voucher.voucherCode || '',
        type: String(voucher.discountType || voucher.type || 'percentage').toLowerCase(),
        value: toNumber(voucher.discountValue ?? voucher.value, 0),
        description: voucher.description || voucher.name || '',
        minOrderValue: toNumber(voucher.minOrderAmount ?? voucher.minOrderValue ?? voucher.minimumOrderValue, 0),
        maxDiscount: toNumber(voucher.maxDiscountAmount ?? voucher.maxDiscountValue ?? voucher.maxDiscount, 0),
        usageLimit: toNumber(voucher.maxUsageCount ?? voucher.usageLimit ?? voucher.limit ?? voucher.maxUsage, 0),
        usedCount: toNumber(voucher.usedCount ?? voucher.used ?? voucher.usedQuantity, 0),
        startDate: toDateOnly(voucher.startDate || voucher.validFrom || ''),
        endDate: toDateOnly(voucher.endDate || voucher.validUntil || voucher.validTo || ''),
        status: rawStatus || activeStatus || 'active',
        applicableTo: voucher.applicableTo || voucher.scope || 'all',
        voucherType: String(voucher.voucherType || (voucher.targetShopId ? 'SHOP' : 'PLATFORM')).toUpperCase(),
        createdBy: voucher.createdBy || 'Admin',
    }
}

const buildVoucherRequest = (voucher) => {
    const isActive = voucher.status !== 'inactive'

    return {
        code: voucher.code?.trim(),
        description: voucher.description?.trim() || '',
        discountType: voucher.type === 'fixed' ? 'FIXED_AMOUNT' : 'PERCENTAGE',
        discountValue: toNumber(voucher.value),
        minOrderAmount: toNumber(voucher.minOrderValue),
        maxDiscountAmount: toNumber(voucher.maxDiscount),
        maxUsageCount: toNumber(voucher.usageLimit),
        startDate: voucher.startDate || null,
        endDate: voucher.endDate || null,
        isActive,
        active: isActive,
        applicableTo: voucher.applicableTo || 'all',
        voucherType: String(voucher.voucherType || 'PLATFORM').toUpperCase(),
    }
}

function AdminPromotionManagement() {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState('promotions')
    const [promotions, setPromotions] = useState([])
    const [achievements] = useState(achievementsData)
    const [filterStatus, setFilterStatus] = useState('all')
    const [isLoading, setIsLoading] = useState(false)

    // modal: null | 'create' | 'edit' | 'delete'
    const [modal, setModal] = useState(null)
    const [formData, setFormData] = useState(EMPTY_PROMO)
    const [deleteTarget, setDeleteTarget] = useState(null)

    const loadPromotions = async () => {
        setIsLoading(true)
        try {
            const payload = await getAdminVouchers({ page: 0, size: 100 })
            const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : []
            setPromotions(items.map(mapVoucherToPromo))
        } catch (error) {
            toast.error(error.message || t('adminPromotions.loadFailed'))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadPromotions()
    }, [])

    const activeCount = promotions.filter(p => p.status === 'active').length
    const expiredCount = promotions.filter(p => p.status === 'expired').length
    const totalUsage = promotions.reduce((sum, p) => sum + (p.usedCount || 0), 0)

    const stats = [
        { label: t('adminPromotions.totalVouchers'), value: String(promotions.length), color: '#719FC2' },
        { label: t('adminPromotions.activeVouchers'), value: String(activeCount), color: '#4d9e84' },
        { label: t('adminPromotions.expiredVouchers'), value: String(expiredCount), color: '#6b7280' },
        { label: t('adminPromotions.totalUsage'), value: String(totalUsage), color: '#5492b4' }
    ]

    const filteredPromotions = promotions.filter(p =>
        filterStatus === 'all' || p.status === filterStatus
    )

    const refreshAfterMutation = async (successMessage) => {
        await loadPromotions()
        if (successMessage) {
            toast.success(successMessage)
        }
        closeModal()
    }

    const openCreate = () => { setFormData({ ...EMPTY_PROMO }); setModal('create') }
    const openEdit = (promo) => { setFormData({ ...promo }); setModal('edit') }
    const openDelete = (promo) => { setDeleteTarget(promo); setModal('delete') }
    const closeModal = () => { setModal(null); setDeleteTarget(null) }

    const handleFormChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCreate = async () => {
        if (!formData.code || !formData.description) return
        try {
            await createAdminVoucher(buildVoucherRequest(formData))
            await refreshAfterMutation(withCode('adminPromotions.createSuccess', formData.code))
        } catch (error) {
            toast.error(error.message || t('adminPromotions.createFailed'))
        }
    }

    const handleUpdate = async () => {
        if (!formData.code || !formData.description) return
        try {
            await updateAdminVoucher(formData.id, buildVoucherRequest(formData))
            await refreshAfterMutation(withCode('adminPromotions.updateSuccess', formData.code))
        } catch (error) {
            toast.error(error.message || t('adminPromotions.updateFailed'))
        }
    }

    const handleDelete = async () => {
        try {
            await deleteAdminVoucher(deleteTarget.id)
            await refreshAfterMutation(withCode('adminPromotions.deleteSuccess', deleteTarget.code))
        } catch (error) {
            toast.error(error.message || t('adminPromotions.deleteFailed'))
        }
    }

    const handleTogglePromo = async (promoId) => {
        try {
            await toggleAdminVoucherStatus(promoId)
            await loadPromotions()
            toast.success(t('adminPromotions.toggleSuccess'))
        } catch (error) {
            toast.error(error.message || t('adminPromotions.toggleFailed'))
        }
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
        if (type === 'percentage') return `${value}% ${t('adminPromotions.off')}`
        if (type === 'fixed') return `${value.toLocaleString()} VND ${t('adminPromotions.off')}`
        return value
    }

    const getStatusLabel = (status) => {
        if (status === 'active') return t('adminPromotions.statusActive')
        if (status === 'inactive') return t('adminPromotions.statusInactive')
        if (status === 'expired') return t('adminPromotions.statusExpired')
        return status
    }

    const getApplicableToLabel = (value) => {
        const labels = {
            all: t('adminPromotions.applicableAll'),
            new_users: t('adminPromotions.applicableNewUsers'),
            gold_tier: t('adminPromotions.applicableGoldTier'),
            platinum_tier: t('adminPromotions.applicablePlatinumTier'),
            weekend: t('adminPromotions.applicableWeekend'),
            first_order: t('adminPromotions.applicableFirstOrder'),
        }

        return labels[value] || value.replace('_', ' ')
    }

    const withCode = (templateKey, code) => t(templateKey).replace('{code}', code)

    return (
        <div className="admin-promotion-management">
            <div className="admin-promo-header">
                <div>
                    <h1 className="admin-promo-title">{t('adminPromotions.title')}</h1>
                    <p className="admin-promo-subtitle">{t('adminPromotions.subtitle')}</p>
                </div>
                <button className="admin-promo-add-btn" onClick={openCreate}>
                    <PlusOutlined /> {t('adminPromotions.createVoucher')}
                </button>
            </div>

            <div className="admin-promo-api-notice">
                <ExclamationCircleOutlined />
                <div>
                    <strong>{t('adminPromotions.apiNoticeTitle')}</strong>
                    <span>{t('adminPromotions.apiNoticeCopy')}</span>
                </div>
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
                    <TagOutlined /> {t('adminPromotions.promoCodesTab')} ({promotions.length})
                </button>
                <button
                    className={'admin-promo-tab' + (activeTab === 'achievements' ? ' active' : '')}
                    onClick={() => setActiveTab('achievements')}
                >
                    <TrophyOutlined /> {t('adminPromotions.achievementsTab')} ({achievements.length})
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
                                    {t(`adminPromotions.filter.${s}`)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="admin-promo-table">
                        {isLoading && <div className="admin-promo-loading">{t('adminPromotions.loading')}</div>}
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('adminPromotions.columns.code')}</th>
                                    <th>{t('adminPromotions.columns.description')}</th>
                                    <th>{t('adminPromotions.columns.discount')}</th>
                                    <th>{t('adminPromotions.columns.usage')}</th>
                                    <th>{t('adminPromotions.columns.validPeriod')}</th>
                                    <th>{t('adminPromotions.columns.appliesTo')}</th>
                                    <th>{t('adminPromotions.columns.status')}</th>
                                    <th>{t('adminPromotions.columns.actions')}</th>
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
                                            <span className="promo-applies-badge">{getApplicableToLabel(promo.applicableTo)}</span>
                                        </td>
                                        <td>
                                            <span className="promo-status" style={{ color: getStatusColor(promo.status) }}>
                                                ● {getStatusLabel(promo.status)}
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
                                                        {promo.status === 'active' ? ` ${t('adminPromotions.deactivate')}` : ` ${t('adminPromotions.activate')}`}
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
                                        <strong>{t('adminPromotions.criteria')}:</strong> {ach.criteria}
                                    </div>
                                )}
                                {ach.awardedDate && (
                                    <div className="achievement-date">{t('adminPromotions.awarded')}: {ach.awardedDate}</div>
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
                            <h2>{modal === 'create' ? <><PlusOutlined /> {t('adminPromotions.createModalTitle')}</> : <><EditOutlined /> {t('adminPromotions.editModalTitle')} — {formData.id}</>}</h2>
                            <button className="promo-modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="promo-modal-body">
                            <div className="promo-form-grid">
                                <div className="promo-form-group">
                                    <label>{t('adminPromotions.form.code')} <span className="required">*</span></label>
                                    <input name="code" value={formData.code} onChange={handleFormChange} placeholder={t('adminPromotions.form.codePlaceholder')} style={{ textTransform: 'uppercase' }} />
                                </div>
                                <div className="promo-form-group promo-form-group-full">
                                    <label>{t('adminPromotions.form.description')} <span className="required">*</span></label>
                                    <input name="description" value={formData.description} onChange={handleFormChange} placeholder={t('adminPromotions.form.descriptionPlaceholder')} />
                                </div>
                                <div className="promo-form-group">
                                    <label>{t('adminPromotions.form.type')}</label>
                                    <select name="type" value={formData.type} onChange={handleFormChange}>
                                        {PROMO_TYPES.map(type => <option key={type} value={type}>{type === 'percentage' ? t('adminPromotions.form.percentage') : t('adminPromotions.form.fixed')}</option>)}
                                    </select>
                                </div>
                                <div className="promo-form-group">
                                    <label>{formData.type === 'percentage' ? t('adminPromotions.form.valuePercent') : t('adminPromotions.form.valueFixed')}</label>
                                    <input name="value" type="number" min="0" value={formData.value} onChange={handleFormChange} />
                                </div>
                                <div className="promo-form-group">
                                    <label>{t('adminPromotions.form.minOrderValue')}</label>
                                    <input name="minOrderValue" type="number" min="0" value={formData.minOrderValue} onChange={handleFormChange} />
                                </div>
                                <div className="promo-form-group">
                                    <label>{t('adminPromotions.form.maxDiscount')}</label>
                                    <input name="maxDiscount" type="number" min="0" value={formData.maxDiscount} onChange={handleFormChange} />
                                </div>
                                <div className="promo-form-group">
                                    <label>{t('adminPromotions.form.usageLimit')}</label>
                                    <input name="usageLimit" type="number" min="1" value={formData.usageLimit} onChange={handleFormChange} />
                                </div>
                                <div className="promo-form-group">
                                    <label>{t('adminPromotions.form.applicableTo')}</label>
                                    <select name="applicableTo" value={formData.applicableTo} onChange={handleFormChange}>
                                        {APPLICABLE_TO.map(a => <option key={a} value={a}>{getApplicableToLabel(a)}</option>)}
                                    </select>
                                </div>
                                <div className="promo-form-group">
                                    <label>{t('adminPromotions.form.startDate')}</label>
                                    <input name="startDate" type="date" value={formData.startDate} onChange={handleFormChange} />
                                </div>
                                <div className="promo-form-group">
                                    <label>{t('adminPromotions.form.endDate')}</label>
                                    <input name="endDate" type="date" value={formData.endDate} onChange={handleFormChange} />
                                </div>
                                <div className="promo-form-group">
                                    <label>{t('adminPromotions.form.isActive')}</label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 40, marginTop: 2 }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.status === 'active'}
                                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'active' : 'inactive' }))}
                                        />
                                        <span>{formData.status === 'active' ? t('adminPromotions.yes') : t('adminPromotions.no')}</span>
                                    </label>
                                </div>
                                <div className="promo-form-group">
                                    <label>{t('adminPromotions.form.voucherType')}</label>
                                    <select name="voucherType" value={formData.voucherType} onChange={handleFormChange}>
                                        {VOUCHER_TYPES.map(type => (
                                            <option key={type} value={type}>{type === 'PLATFORM' ? t('adminPromotions.voucherPlatform') : t('adminPromotions.voucherShop')}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="promo-modal-footer">
                            <button className="promo-modal-btn secondary" onClick={closeModal}>{t('adminPromotions.cancel')}</button>
                            <button
                                className="promo-modal-btn primary"
                                onClick={modal === 'create' ? handleCreate : handleUpdate}
                                disabled={!formData.code || !formData.description}
                            >
                                {modal === 'create' ? <><PlusOutlined /> {t('adminPromotions.create')}</> : <><CheckCircleOutlined /> {t('adminPromotions.saveChanges')}</>}
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
                            <h2><ExclamationCircleOutlined style={{ color: '#c05a50', marginRight: 8 }} />{t('adminPromotions.deleteModalTitle')}</h2>
                            <button className="promo-modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="promo-modal-body">
                            <p className="promo-delete-msg">{t('adminPromotions.deleteConfirmPrefix')} <strong>{deleteTarget.code}</strong>?</p>
                            <div className="promo-delete-info">
                                <div><strong>{t('adminPromotions.form.id')}:</strong> {deleteTarget.id}</div>
                                <div><strong>{t('adminPromotions.form.type')}:</strong> {deleteTarget.type}</div>
                                <div><strong>{t('adminPromotions.form.discount')}:</strong> {getTypeLabel(deleteTarget.type, deleteTarget.value)}</div>
                                <div><strong>{t('adminPromotions.form.status')}:</strong> {getStatusLabel(deleteTarget.status)}</div>
                            </div>
                            <p className="promo-delete-warning">{t('adminPromotions.deleteWarning')}</p>
                        </div>
                        <div className="promo-modal-footer">
                            <button className="promo-modal-btn secondary" onClick={closeModal}>{t('adminPromotions.cancel')}</button>
                            <button className="promo-modal-btn danger" onClick={handleDelete}><DeleteOutlined /> {t('adminPromotions.delete')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminPromotionManagement

