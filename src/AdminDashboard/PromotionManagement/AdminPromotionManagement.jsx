import { createElement, useMemo, useState } from 'react'
import {
    BadgePercent,
    BarChart3,
    CalendarClock,
    CheckCircle,
    CircleDollarSign,
    Edit3,
    Gift,
    Medal,
    Plus,
    Search,
    Target,
    Trash2,
    Trophy,
    X,
    XCircle,
} from 'lucide-react'
import './AdminPromotionManagement.css'
import {
    promotions as promotionsData,
    shopAchievements as achievementsData,
} from '../../data'
import toast from '../../utils/toast'
import { useTranslation } from '../../shared/lib/i18n'

const PROMO_TYPES = ['percentage', 'fixed']
const PROMO_STATUSES = ['active', 'inactive']
const APPLICABLE_TO = ['all', 'new_users', 'gold_tier', 'platinum_tier', 'weekend', 'first_order', 'specific_shop']

const EMPTY_PROMO = {
    code: '',
    type: 'percentage',
    value: 10,
    description: '',
    minOrderValue: 100000,
    maxDiscount: 50000,
    usageLimit: 250,
    usedCount: 0,
    startDate: '2026-06-05',
    endDate: '2026-06-30',
    status: 'active',
    applicableTo: 'all',
    createdBy: 'Admin',
}

function statusKey(status) {
    return status === 'active' ? 'active' : status === 'expired' ? 'expired' : 'inactive'
}

function targetKey(target) {
    return target === 'new_users'
        ? 'newUsers'
        : target === 'gold_tier'
            ? 'goldTier'
            : target === 'platinum_tier'
                ? 'platinumTier'
                : target === 'first_order'
                    ? 'firstOrder'
                    : target === 'specific_shop'
                        ? 'specificShop'
                        : target === 'weekend'
                            ? 'weekend'
                            : 'all'
}

function formatVnd(value) {
    return `${Number(value || 0).toLocaleString('vi-VN')} VND`
}

function getCampaignCopyKey(code) {
    const normalized = String(code || '').toLowerCase()
    if (normalized.includes('welcome')) return 'welcome'
    if (normalized.includes('lunar')) return 'lunar'
    if (normalized.includes('gold')) return 'gold'
    if (normalized.includes('weekend')) return 'weekend'
    if (normalized.includes('newshop')) return 'newShop'
    return 'default'
}

function getRewardKey(id) {
    if (id === 'ACH-001') return 'topShop'
    if (id === 'ACH-002') return 'customerRating'
    if (id === 'ACH-003') return 'fastGrowth'
    return 'default'
}

function AdminPromotionManagement() {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState('campaigns')
    const [promotions, setPromotions] = useState(promotionsData)
    const [filterStatus, setFilterStatus] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedPromoId, setSelectedPromoId] = useState(promotionsData[0]?.id || null)
    const [modal, setModal] = useState(null)
    const [formData, setFormData] = useState(EMPTY_PROMO)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [formErrors, setFormErrors] = useState({})

    const query = searchQuery.trim().toLowerCase()
    const filteredPromotions = promotions.filter(promo => {
        const matchesStatus = filterStatus === 'all' || promo.status === filterStatus
        const matchesQuery = !query ||
            promo.code.toLowerCase().includes(query) ||
            promo.id.toLowerCase().includes(query) ||
            targetKey(promo.applicableTo).toLowerCase().includes(query)
        return matchesStatus && matchesQuery
    })

    const selectedPromo = promotions.find(promo => promo.id === selectedPromoId) || filteredPromotions[0] || null

    const metrics = useMemo(() => {
        const active = promotions.filter(promo => promo.status === 'active').length
        const totalUsage = promotions.reduce((sum, promo) => sum + Number(promo.usedCount || 0), 0)
        const totalLimit = promotions.reduce((sum, promo) => sum + Number(promo.usageLimit || 0), 0)
        const estimatedDiscount = promotions.reduce((sum, promo) => {
            const usage = Number(promo.usedCount || 0)
            const discountValue = promo.type === 'percentage'
                ? Math.min(Number(promo.maxDiscount || 0), Number(promo.minOrderValue || 0) * Number(promo.value || 0) / 100)
                : Number(promo.value || 0)
            return sum + usage * discountValue
        }, 0)
        const budgetBurn = totalLimit > 0 ? Math.round((totalUsage / totalLimit) * 100) : 0
        return { active, totalUsage, totalLimit, estimatedDiscount, budgetBurn }
    }, [promotions])

    const kpis = [
        { label: t('adminPromotions.totalCampaigns'), value: promotions.length, meta: t('adminPromotions.campaignInventory'), Icon: BadgePercent },
        { label: t('adminPromotions.activeCampaigns'), value: metrics.active, meta: t('adminPromotions.liveRules'), Icon: CheckCircle },
        { label: t('adminPromotions.totalUsage'), value: metrics.totalUsage.toLocaleString(), meta: `${metrics.budgetBurn}% ${t('adminPromotions.budgetBurn')}`, Icon: BarChart3 },
        { label: t('adminPromotions.estimatedDiscount'), value: `${(metrics.estimatedDiscount / 1000000).toFixed(1)}M`, meta: t('adminPromotions.discountLiability'), Icon: CircleDollarSign },
        { label: t('adminPromotions.partnerRewards'), value: achievementsData.length, meta: t('adminPromotions.rewardPrograms'), Icon: Trophy },
    ]

    const tabs = [
        { id: 'campaigns', label: t('adminPromotions.campaigns'), count: promotions.length },
        { id: 'achievements', label: t('adminPromotions.achievements'), count: achievementsData.length },
        { id: 'rules', label: t('adminPromotions.rules'), count: APPLICABLE_TO.length },
    ]

    const validateForm = () => {
        const errors = {}
        if (!formData.code.trim()) errors.code = t('adminPromotions.codeRequired')
        if (!formData.description.trim()) errors.description = t('adminPromotions.descriptionRequired')
        if (Number(formData.value) <= 0) errors.value = t('adminPromotions.valueRequired')
        if (Number(formData.usageLimit) <= 0) errors.usageLimit = t('adminPromotions.usageLimitRequired')
        if (!formData.startDate || !formData.endDate) errors.endDate = t('adminPromotions.dateRequired')
        if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) errors.endDate = t('adminPromotions.dateOrderInvalid')
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const openCreate = () => {
        setFormErrors({})
        setFormData({ ...EMPTY_PROMO })
        setModal('create')
    }

    const openEdit = (promo) => {
        setFormErrors({})
        setFormData({ ...promo })
        setModal('edit')
    }

    const openDelete = (promo) => {
        setDeleteTarget(promo)
        setModal('delete')
    }

    const closeModal = () => {
        setModal(null)
        setDeleteTarget(null)
        setFormErrors({})
    }

    const handleFormChange = (event) => {
        const { name, value } = event.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setFormErrors(prev => ({ ...prev, [name]: undefined }))
    }

    const normalizePromo = (promo) => ({
        ...promo,
        code: promo.code.trim().toUpperCase(),
        value: Number(promo.value),
        usageLimit: Number(promo.usageLimit),
        minOrderValue: Number(promo.minOrderValue),
        maxDiscount: Number(promo.maxDiscount),
        usedCount: Number(promo.usedCount || 0),
    })

    const handleCreate = () => {
        if (!validateForm()) return
        const nextNum = Math.max(...promotions.map(promo => parseInt(promo.id.replace(/\D/g, ''), 10) || 0)) + 1
        const newPromo = normalizePromo({ ...formData, id: `PROMO-${String(nextNum).padStart(3, '0')}`, usedCount: 0 })
        setPromotions(prev => [newPromo, ...prev])
        setSelectedPromoId(newPromo.id)
        toast.success(t('adminPromotions.created').replace('{code}', newPromo.code))
        closeModal()
    }

    const handleUpdate = () => {
        if (!validateForm()) return
        const nextPromo = normalizePromo(formData)
        setPromotions(prev => prev.map(promo => promo.id === nextPromo.id ? nextPromo : promo))
        setSelectedPromoId(nextPromo.id)
        toast.success(t('adminPromotions.updated').replace('{code}', nextPromo.code))
        closeModal()
    }

    const handleDelete = () => {
        setPromotions(prev => prev.filter(promo => promo.id !== deleteTarget.id))
        if (selectedPromoId === deleteTarget.id) setSelectedPromoId(promotions[0]?.id || null)
        toast.success(t('adminPromotions.deleted').replace('{code}', deleteTarget.code))
        closeModal()
    }

    const handleTogglePromo = (promo) => {
        const nextStatus = promo.status === 'active' ? 'inactive' : 'active'
        setPromotions(prev => prev.map(item => item.id === promo.id ? { ...item, status: nextStatus } : item))
        toast.success(t('adminPromotions.statusUpdated').replace('{code}', promo.code))
    }

    const getDiscountLabel = (promo) => {
        if (promo.type === 'percentage') return `${promo.value}%`
        return formatVnd(promo.value)
    }

    const getUsagePercent = (promo) => {
        if (!promo.usageLimit) return 0
        return Math.min(100, Math.round((Number(promo.usedCount || 0) / Number(promo.usageLimit)) * 100))
    }

    return (
        <div className="admin-promotions-page">
            <header className="admin-promotions-header">
                <div>
                    <span className="admin-promotions-eyebrow">{t('adminPromotions.eyebrow')}</span>
                    <h1>{t('adminPromotions.title')}</h1>
                    <p>{t('adminPromotions.subtitle')}</p>
                </div>
                <button type="button" className="admin-promotions-primary" onClick={openCreate}>
                    <Plus size={17} strokeWidth={1.9} />{t('adminPromotions.createPromotion')}
                </button>
            </header>

            <section className="admin-promotions-kpis">
                {kpis.map(({ label, value, meta, Icon }) => (
                    <article className="admin-promotions-kpi" key={label}>
                        <span>{createElement(Icon, { size: 18, strokeWidth: 1.9 })}</span>
                        <small>{label}</small>
                        <strong>{value}</strong>
                        <p>{meta}</p>
                    </article>
                ))}
            </section>

            <section className="admin-promotions-performance">
                <article className="admin-promotions-card admin-promotions-burn">
                    <div>
                        <span className="admin-promotions-eyebrow">{t('adminPromotions.budgetControl')}</span>
                        <h2>{t('adminPromotions.budgetBurnTitle')}</h2>
                        <p>{t('adminPromotions.budgetBurnCopy')}</p>
                    </div>
                    <div className="admin-promotions-burn-meter" style={{ '--burn': `${metrics.budgetBurn}%` }}>
                        <strong>{metrics.budgetBurn}%</strong>
                        <span>{metrics.totalUsage.toLocaleString()} / {metrics.totalLimit.toLocaleString()}</span>
                    </div>
                </article>
                <article className="admin-promotions-card admin-promotions-insight">
                    <span><Target size={19} /></span>
                    <div>
                        <strong>{t('adminPromotions.insightTitle')}</strong>
                        <p>{t('adminPromotions.insightCopy')}</p>
                    </div>
                </article>
            </section>

            <section className="admin-promotions-tabs">
                {tabs.map(tab => (
                    <button type="button" className={activeTab === tab.id ? 'active' : ''} key={tab.id} onClick={() => setActiveTab(tab.id)}>
                        {tab.label}
                        <span>{tab.count}</span>
                    </button>
                ))}
            </section>

            {activeTab === 'campaigns' && (
                <section className="admin-promotions-workspace">
                    <article className="admin-promotions-card admin-promotions-table-card">
                        <div className="admin-promotions-card-head">
                            <div>
                                <span className="admin-promotions-eyebrow">{t('adminPromotions.campaignDirectory')}</span>
                                <h2>{filteredPromotions.length} {t('adminPromotions.results')}</h2>
                            </div>
                            <div className="admin-promotions-tools">
                                <label className="admin-promotions-search">
                                    <Search size={17} strokeWidth={1.9} />
                                    <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={t('adminPromotions.searchPlaceholder')} />
                                </label>
                                <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} aria-label={t('adminPromotions.statusFilter')}>
                                    <option value="all">{t('adminPromotions.allStatuses')}</option>
                                    <option value="active">{t('adminPromotions.statusactive')}</option>
                                    <option value="inactive">{t('adminPromotions.statusinactive')}</option>
                                    <option value="expired">{t('adminPromotions.statusexpired')}</option>
                                </select>
                            </div>
                        </div>

                        <div className="admin-promotions-table-wrap">
                            <table className="admin-promotions-table">
                                <thead>
                                    <tr>
                                        <th>{t('adminPromotions.code')}</th>
                                        <th>{t('adminPromotions.offer')}</th>
                                        <th>{t('adminPromotions.target')}</th>
                                        <th>{t('adminPromotions.usage')}</th>
                                        <th>{t('adminPromotions.period')}</th>
                                        <th>{t('adminPromotions.status')}</th>
                                        <th>{t('adminPromotions.action')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPromotions.length === 0 ? (
                                        <tr><td colSpan={7} className="admin-promotions-empty">{t('adminPromotions.emptyCampaigns')}</td></tr>
                                    ) : filteredPromotions.map(promo => (
                                        <tr key={promo.id} className={selectedPromo?.id === promo.id ? 'selected' : ''} onClick={() => setSelectedPromoId(promo.id)}>
                                            <td><strong>{promo.code}</strong><small>{promo.id}</small></td>
                                            <td><strong>{getDiscountLabel(promo)} {promo.type === 'percentage' ? t('adminPromotions.percentOff') : t('adminPromotions.fixedOff')}</strong><small>{t(`adminPromotions.copy.${getCampaignCopyKey(promo.code)}`)}</small></td>
                                            <td><span className="admin-promotions-target">{t(`adminPromotions.target${targetKey(promo.applicableTo)}`)}</span></td>
                                            <td>
                                                <div className="admin-promotions-usage">
                                                    <span>{promo.usedCount.toLocaleString()} / {promo.usageLimit.toLocaleString()}</span>
                                                    <i><b style={{ width: `${getUsagePercent(promo)}%` }} /></i>
                                                </div>
                                            </td>
                                            <td><strong>{promo.startDate}</strong><small>{promo.endDate}</small></td>
                                            <td><span className={`admin-promotions-badge ${statusKey(promo.status)}`}>{t(`adminPromotions.status${statusKey(promo.status)}`)}</span></td>
                                            <td>
                                                <div className="admin-promotions-actions">
                                                    {promo.status !== 'expired' && (
                                                        <button type="button" onClick={(event) => { event.stopPropagation(); handleTogglePromo(promo) }}>
                                                            {promo.status === 'active' ? t('adminPromotions.pause') : t('adminPromotions.activate')}
                                                        </button>
                                                    )}
                                                    <button type="button" onClick={(event) => { event.stopPropagation(); openEdit(promo) }} aria-label={t('adminPromotions.edit')}>
                                                        <Edit3 size={15} />
                                                    </button>
                                                    <button type="button" className="danger" onClick={(event) => { event.stopPropagation(); openDelete(promo) }} aria-label={t('adminPromotions.delete')}>
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </article>

                    <aside className="admin-promotions-card admin-promotions-detail">
                        {selectedPromo ? (
                            <>
                                <div className="admin-promotions-detail-head">
                                    <div>
                                        <span className="admin-promotions-eyebrow">{t('adminPromotions.campaignProfile')}</span>
                                        <h2>{selectedPromo.code}</h2>
                                    </div>
                                    <span className={`admin-promotions-badge ${statusKey(selectedPromo.status)}`}>{t(`adminPromotions.status${statusKey(selectedPromo.status)}`)}</span>
                                </div>
                                <dl className="admin-promotions-detail-grid">
                                    <div><dt>{t('adminPromotions.discount')}</dt><dd>{getDiscountLabel(selectedPromo)}</dd></div>
                                    <div><dt>{t('adminPromotions.minOrder')}</dt><dd>{formatVnd(selectedPromo.minOrderValue)}</dd></div>
                                    <div><dt>{t('adminPromotions.maxDiscount')}</dt><dd>{formatVnd(selectedPromo.maxDiscount)}</dd></div>
                                    <div><dt>{t('adminPromotions.appliesTo')}</dt><dd>{t(`adminPromotions.target${targetKey(selectedPromo.applicableTo)}`)}</dd></div>
                                    <div><dt>{t('adminPromotions.createdBy')}</dt><dd>{selectedPromo.createdBy}</dd></div>
                                    <div><dt>{t('adminPromotions.usageRate')}</dt><dd>{getUsagePercent(selectedPromo)}%</dd></div>
                                </dl>
                                <div className="admin-promotions-rule-note">
                                    <CalendarClock size={17} />
                                    <p>{t('adminPromotions.ruleNote').replace('{start}', selectedPromo.startDate).replace('{end}', selectedPromo.endDate)}</p>
                                </div>
                                <div className="admin-promotions-detail-actions">
                                    <button type="button" onClick={() => openEdit(selectedPromo)}><Edit3 size={15} />{t('adminPromotions.edit')}</button>
                                    {selectedPromo.status !== 'expired' && (
                                        <button type="button" className="primary" onClick={() => handleTogglePromo(selectedPromo)}>
                                            <CheckCircle size={15} />{selectedPromo.status === 'active' ? t('adminPromotions.pause') : t('adminPromotions.activate')}
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="admin-promotions-empty"><Gift size={28} /><strong>{t('adminPromotions.noSelection')}</strong></div>
                        )}
                    </aside>
                </section>
            )}

            {activeTab === 'achievements' && (
                <section className="admin-promotions-achievements">
                    {achievementsData.map(achievement => {
                        const rewardKey = getRewardKey(achievement.id)
                        return (
                            <article className="admin-promotions-card admin-promotions-achievement" key={achievement.id}>
                                <span><Medal size={20} /></span>
                                <div>
                                    <small>{achievement.id} · {achievement.shopId}</small>
                                    <h2>{t(`adminPromotions.rewards.${rewardKey}.title`)}</h2>
                                    <p>{t(`adminPromotions.rewards.${rewardKey}.description`)}</p>
                                </div>
                                <dl>
                                    <div><dt>{t('adminPromotions.shop')}</dt><dd>{achievement.shopName}</dd></div>
                                    <div><dt>{t('adminPromotions.awardedDate')}</dt><dd>{achievement.awardedDate}</dd></div>
                                    <div><dt>{t('adminPromotions.reward')}</dt><dd>{t(`adminPromotions.rewards.${rewardKey}.reward`)}</dd></div>
                                </dl>
                            </article>
                        )
                    })}
                </section>
            )}

            {activeTab === 'rules' && (
                <section className="admin-promotions-rules">
                    {APPLICABLE_TO.map(rule => (
                        <article className="admin-promotions-card admin-promotions-rule" key={rule}>
                            <span><Target size={18} /></span>
                            <div>
                                <h2>{t(`adminPromotions.target${targetKey(rule)}`)}</h2>
                                <p>{t(`adminPromotions.ruleCopy.${targetKey(rule)}`)}</p>
                            </div>
                        </article>
                    ))}
                </section>
            )}

            {(modal === 'create' || modal === 'edit') && (
                <div className="admin-promotions-modal-backdrop" onClick={closeModal}>
                    <div className="admin-promotions-modal" onClick={event => event.stopPropagation()}>
                        <div className="admin-promotions-modal-head">
                            <h2>{modal === 'create' ? t('adminPromotions.newPromotion') : t('adminPromotions.editPromotion')}</h2>
                            <button type="button" onClick={closeModal} aria-label={t('common.close')}><X size={18} /></button>
                        </div>
                        <div className="admin-promotions-form-grid">
                            <label>
                                {t('adminPromotions.code')}
                                <input name="code" value={formData.code} onChange={handleFormChange} placeholder="WASH20" />
                                {formErrors.code && <small>{formErrors.code}</small>}
                            </label>
                            <label>
                                {t('adminPromotions.type')}
                                <select name="type" value={formData.type} onChange={handleFormChange}>
                                    {PROMO_TYPES.map(type => <option key={type} value={type}>{t(`adminPromotions.type${type}`)}</option>)}
                                </select>
                            </label>
                            <label>
                                {t('adminPromotions.value')}
                                <input name="value" type="number" min="1" value={formData.value} onChange={handleFormChange} />
                                {formErrors.value && <small>{formErrors.value}</small>}
                            </label>
                            <label>
                                {t('adminPromotions.status')}
                                <select name="status" value={formData.status} onChange={handleFormChange}>
                                    {PROMO_STATUSES.map(status => <option key={status} value={status}>{t(`adminPromotions.status${statusKey(status)}`)}</option>)}
                                </select>
                            </label>
                            <label className="full">
                                {t('adminPromotions.description')}
                                <input name="description" value={formData.description} onChange={handleFormChange} placeholder={t('adminPromotions.descriptionPlaceholder')} />
                                {formErrors.description && <small>{formErrors.description}</small>}
                            </label>
                            <label>
                                {t('adminPromotions.minOrder')}
                                <input name="minOrderValue" type="number" min="0" value={formData.minOrderValue} onChange={handleFormChange} />
                            </label>
                            <label>
                                {t('adminPromotions.maxDiscount')}
                                <input name="maxDiscount" type="number" min="0" value={formData.maxDiscount} onChange={handleFormChange} />
                            </label>
                            <label>
                                {t('adminPromotions.usageLimit')}
                                <input name="usageLimit" type="number" min="1" value={formData.usageLimit} onChange={handleFormChange} />
                                {formErrors.usageLimit && <small>{formErrors.usageLimit}</small>}
                            </label>
                            <label>
                                {t('adminPromotions.appliesTo')}
                                <select name="applicableTo" value={formData.applicableTo} onChange={handleFormChange}>
                                    {APPLICABLE_TO.map(target => <option key={target} value={target}>{t(`adminPromotions.target${targetKey(target)}`)}</option>)}
                                </select>
                            </label>
                            <label>
                                {t('adminPromotions.startDate')}
                                <input name="startDate" type="date" value={formData.startDate} onChange={handleFormChange} />
                            </label>
                            <label>
                                {t('adminPromotions.endDate')}
                                <input name="endDate" type="date" value={formData.endDate} onChange={handleFormChange} />
                                {formErrors.endDate && <small>{formErrors.endDate}</small>}
                            </label>
                        </div>
                        <div className="admin-promotions-modal-actions">
                            <button type="button" onClick={closeModal}>{t('common.cancel')}</button>
                            <button type="button" className="primary" onClick={modal === 'create' ? handleCreate : handleUpdate}>
                                {modal === 'create' ? t('adminPromotions.create') : t('adminPromotions.saveChanges')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modal === 'delete' && deleteTarget && (
                <div className="admin-promotions-modal-backdrop" onClick={closeModal}>
                    <div className="admin-promotions-modal small" onClick={event => event.stopPropagation()}>
                        <div className="admin-promotions-modal-head">
                            <h2>{t('adminPromotions.deletePromotion')}</h2>
                            <button type="button" onClick={closeModal} aria-label={t('common.close')}><X size={18} /></button>
                        </div>
                        <div className="admin-promotions-delete">
                            <XCircle size={30} />
                            <p>{t('adminPromotions.deleteMessage').replace('{code}', deleteTarget.code)}</p>
                        </div>
                        <div className="admin-promotions-modal-actions">
                            <button type="button" onClick={closeModal}>{t('common.cancel')}</button>
                            <button type="button" className="danger" onClick={handleDelete}>{t('adminPromotions.delete')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminPromotionManagement
