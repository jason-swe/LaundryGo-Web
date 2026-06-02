import { createElement, useState } from 'react'
import {
    AlertTriangle,
    BarChart3,
    CheckCircle,
    Clock,
    Download,
    Eye,
    FileCheck,
    Landmark,
    ShieldCheck,
    Store,
    Truck,
    Users,
    Wallet,
    X,
} from 'lucide-react'
import './AdminOverview.css'
import {
    adminCustomers,
    customerComplaints,
    incidents,
    pendingShippers,
    pendingShops,
    platformRevenueTrend,
    shippers,
    shopRevenue,
    shops,
} from '../../data'
import toast from '../../utils/toast'
import { useTranslation } from '../../shared/lib/i18n'

const REPORT_DATE = '2026-06-02'

function formatCompactVnd(value) {
    const amount = Number(value) || 0
    if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}B`
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`
    return amount.toLocaleString('vi-VN')
}

function buildApprovalQueue() {
    const shopQueue = pendingShops.slice(0, 3).map((shop, index) => ({
        id: `shop-${shop.id || index}`,
        type: 'shop',
        title: shop.name,
        meta: shop.location || shop.district || shop.city,
        age: shop.appliedDate || shop.joinDate || '2024-02-27',
        severity: index === 0 ? 'high' : 'medium',
    }))

    const shipperQueue = pendingShippers.slice(0, 3).map((shipper, index) => ({
        id: `shipper-${shipper.id || index}`,
        type: 'shipper',
        title: shipper.name,
        meta: `${shipper.vehicleType || 'Vehicle'} · ${shipper.licensePlate || 'N/A'}`,
        age: shipper.appliedDate || '2024-02-27',
        severity: index === 0 ? 'high' : 'medium',
    }))

    const payoutQueue = shopRevenue
        .filter(item => item.status === 'pending')
        .slice(0, 2)
        .map(item => ({
            id: `payout-${item.id}`,
            type: 'payout',
            title: item.shopName,
            meta: item.shopEarnings,
            age: item.period,
            severity: 'medium',
        }))

    return [...shopQueue, ...shipperQueue, ...payoutQueue]
}

function AdminOverview() {
    const { t } = useTranslation()
    const [selectedPeriod, setSelectedPeriod] = useState('6months')
    const [approvalQueue, setApprovalQueue] = useState(buildApprovalQueue)
    const [selectedApproval, setSelectedApproval] = useState(null)

    const activeShops = shops.filter(shop => shop.status === 'active').length
    const activeShippers = shippers.filter(shipper => shipper.status === 'active').length
    const activeCustomers = adminCustomers.filter(customer => customer.status === 'active').length
    const totalGmv = shopRevenue.reduce((sum, item) => sum + (item.gmvValue || 0), 0)
    const totalCommission = shopRevenue.reduce((sum, item) => sum + (item.commissionValue || 0), 0)
    const pendingPayouts = shopRevenue.filter(item => item.status === 'pending')
    const highIncidents = incidents.filter(item => item.priority === 'urgent' || item.priority === 'high')
    const openComplaints = customerComplaints.filter(item => item.status !== 'resolved')

    const kpis = [
        { label: t('adminOverview.gmv'), value: `${formatCompactVnd(totalGmv)} VND`, meta: t('adminOverview.gmvMeta'), Icon: Wallet, tone: 'sapphire' },
        { label: t('adminOverview.commission'), value: `${formatCompactVnd(totalCommission)} VND`, meta: t('adminOverview.commissionMeta'), Icon: Landmark, tone: 'emerald' },
        { label: t('adminOverview.activeShops'), value: activeShops, meta: `${pendingShops.length} ${t('adminOverview.pendingReview')}`, Icon: Store, tone: 'cyan' },
        { label: t('adminOverview.activeShippers'), value: activeShippers, meta: `${pendingShippers.length} ${t('adminOverview.pendingReview')}`, Icon: Truck, tone: 'violet' },
        { label: t('adminOverview.activeCustomers'), value: activeCustomers, meta: `${openComplaints.length} ${t('adminOverview.openComplaints')}`, Icon: Users, tone: 'sapphire' },
        { label: t('adminOverview.riskQueue'), value: highIncidents.length + pendingPayouts.length, meta: t('adminOverview.needsAttention'), Icon: AlertTriangle, tone: 'crimson' },
    ]

    const trendData = platformRevenueTrend[selectedPeriod] || []
    const maxTrend = Math.max(...trendData.map(item => item.revenue), 1)
    const topShops = shops.slice().sort((a, b) => b.revenueValue - a.revenueValue).slice(0, 5)
    const districtEntries = Object.entries(shops.reduce((acc, shop) => {
        acc[shop.district] = (acc[shop.district] || 0) + (shop.orders || 0)
        return acc
    }, {})).sort((a, b) => b[1] - a[1]).slice(0, 4)
    const districtTotal = districtEntries.reduce((sum, [, orders]) => sum + orders, 0) || 1

    const riskItems = [
        { label: t('adminOverview.pendingPayouts'), value: pendingPayouts.length, detail: t('adminOverview.payoutRisk'), tone: 'gold' },
        { label: t('adminOverview.highIncidents'), value: highIncidents.length, detail: t('adminOverview.incidentRisk'), tone: 'crimson' },
        { label: t('adminOverview.openComplaints'), value: openComplaints.length, detail: t('adminOverview.complaintRisk'), tone: 'sapphire' },
    ]

    const handleExport = () => {
        const rows = [
            ['Metric', 'Value'],
            ['GMV', totalGmv],
            ['Commission', totalCommission],
            ['Active shops', activeShops],
            ['Active shippers', activeShippers],
            ['Active customers', activeCustomers],
            ['Pending approvals', approvalQueue.length],
        ]
        const blob = new Blob([rows.map(row => row.join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `admin-overview-${REPORT_DATE}.csv`
        anchor.click()
        URL.revokeObjectURL(url)
        toast.success(t('adminOverview.exported'))
    }

    const handleResolveApproval = (approval, action) => {
        setApprovalQueue(prev => prev.filter(item => item.id !== approval.id))
        setSelectedApproval(null)
        toast.success(action === 'approve' ? t('adminOverview.approved') : t('adminOverview.rejected'))
    }

    const approvalTypeLabel = (type) => t(`adminOverview.type${type.charAt(0).toUpperCase()}${type.slice(1)}`)

    return (
        <div className="admin-overview-page">
            <header className="admin-overview-header">
                <div>
                    <span className="admin-overview-eyebrow">{t('adminOverview.eyebrow')}</span>
                    <h1>{t('adminOverview.title')}</h1>
                    <p>{t('adminOverview.subtitle')}</p>
                </div>
                <div className="admin-overview-header-actions">
                    <span className="admin-overview-date"><Clock size={15} />{t('adminOverview.reportDate')}</span>
                    <button type="button" className="admin-overview-primary-btn" onClick={handleExport}>
                        <Download size={16} strokeWidth={1.9} />
                        {t('adminOverview.exportReport')}
                    </button>
                </div>
            </header>

            <section className="admin-overview-kpis">
                {kpis.map(({ label, value, meta, Icon, tone }) => (
                    <article className={`admin-overview-kpi ${tone}`} key={label}>
                        <span>{createElement(Icon, { size: 18, strokeWidth: 1.9 })}</span>
                        <small>{label}</small>
                        <strong>{value}</strong>
                        <p>{meta}</p>
                    </article>
                ))}
            </section>

            <section className="admin-overview-command-grid">
                <article className="admin-overview-card admin-overview-trend">
                    <div className="admin-overview-card-head">
                        <div>
                            <span className="admin-overview-eyebrow">{t('adminOverview.growth')}</span>
                            <h2><BarChart3 size={18} />{t('adminOverview.revenueTrend')}</h2>
                        </div>
                        <div className="admin-overview-periods">
                            {['week', 'month', '6months', 'year'].map(period => (
                                <button type="button" className={selectedPeriod === period ? 'active' : ''} key={period} onClick={() => setSelectedPeriod(period)}>
                                    {t(`adminOverview.${period}`)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="admin-overview-chart">
                        {trendData.map(item => (
                            <div className="admin-overview-chart-group" key={item.label}>
                                <div className="admin-overview-chart-bars">
                                    <span className="revenue" style={{ height: `${(item.revenue / maxTrend) * 100}%` }} />
                                    <span className="net" style={{ height: `${(item.net / maxTrend) * 100}%` }} />
                                </div>
                                <strong>{item.revenue}M</strong>
                                <small>{item.label}</small>
                            </div>
                        ))}
                    </div>
                </article>

                <aside className="admin-overview-card admin-overview-action-queue">
                    <div className="admin-overview-card-head">
                        <div>
                            <span className="admin-overview-eyebrow">{t('adminOverview.actionQueue')}</span>
                            <h2>{t('adminOverview.whatNeedsReview')}</h2>
                        </div>
                        <span className="admin-overview-count">{approvalQueue.length}</span>
                    </div>
                    <div className="admin-overview-queue-list">
                        {approvalQueue.length === 0 && (
                            <div className="admin-overview-empty">
                                <CheckCircle size={28} strokeWidth={1.8} />
                                <strong>{t('adminOverview.allClear')}</strong>
                                <p>{t('adminOverview.allClearHint')}</p>
                            </div>
                        )}
                        {approvalQueue.map(item => (
                            <button type="button" className="admin-overview-queue-item" key={item.id} onClick={() => setSelectedApproval(item)}>
                                <span className={`admin-overview-severity ${item.severity}`} />
                                <div>
                                    <strong>{item.title}</strong>
                                    <small>{approvalTypeLabel(item.type)} · {item.meta}</small>
                                </div>
                                <Eye size={16} strokeWidth={1.9} />
                            </button>
                        ))}
                    </div>
                </aside>
            </section>

            <section className="admin-overview-lower-grid">
                <article className="admin-overview-card">
                    <div className="admin-overview-card-head">
                        <div>
                            <span className="admin-overview-eyebrow">{t('adminOverview.marketplace')}</span>
                            <h2>{t('adminOverview.topPartnerShops')}</h2>
                        </div>
                    </div>
                    <div className="admin-overview-shop-list">
                        {topShops.map((shop, index) => (
                            <div className="admin-overview-shop-row" key={shop.id}>
                                <span>{index + 1}</span>
                                <div>
                                    <strong>{shop.name}</strong>
                                    <small>{shop.orders.toLocaleString()} {t('adminOverview.orders')} · {shop.rating} {t('adminOverview.rating')}</small>
                                </div>
                                <b>{shop.revenue}</b>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="admin-overview-card">
                    <div className="admin-overview-card-head">
                        <div>
                            <span className="admin-overview-eyebrow">{t('adminOverview.risk')}</span>
                            <h2>{t('adminOverview.riskAndSla')}</h2>
                        </div>
                    </div>
                    <div className="admin-overview-risk-list">
                        {riskItems.map(item => (
                            <div className={`admin-overview-risk-row ${item.tone}`} key={item.label}>
                                <strong>{item.value}</strong>
                                <div>
                                    <span>{item.label}</span>
                                    <small>{item.detail}</small>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="admin-overview-card">
                    <div className="admin-overview-card-head">
                        <div>
                            <span className="admin-overview-eyebrow">{t('adminOverview.geography')}</span>
                            <h2>{t('adminOverview.topDistricts')}</h2>
                        </div>
                    </div>
                    <div className="admin-overview-district-list">
                        {districtEntries.map(([district, orders]) => (
                            <div className="admin-overview-district-row" key={district}>
                                <div>
                                    <strong>{district}</strong>
                                    <span>{orders.toLocaleString()} {t('adminOverview.orders')}</span>
                                </div>
                                <div className="admin-overview-track">
                                    <span style={{ width: `${(orders / districtTotal) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </article>
            </section>

            {selectedApproval && (
                <div className="admin-overview-modal-backdrop" onClick={() => setSelectedApproval(null)}>
                    <section className="admin-overview-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="admin-overview-modal-head">
                            <div>
                                <span className="admin-overview-eyebrow">{t('adminOverview.reviewRequest')}</span>
                                <h2>{selectedApproval.title}</h2>
                            </div>
                            <button type="button" onClick={() => setSelectedApproval(null)} aria-label={t('adminOverview.close')}>
                                <X size={18} strokeWidth={1.9} />
                            </button>
                        </div>
                        <dl className="admin-overview-review-grid">
                            <div><dt>{t('adminOverview.requestType')}</dt><dd>{approvalTypeLabel(selectedApproval.type)}</dd></div>
                            <div><dt>{t('adminOverview.submitted')}</dt><dd>{selectedApproval.age}</dd></div>
                            <div><dt>{t('adminOverview.context')}</dt><dd>{selectedApproval.meta}</dd></div>
                            <div><dt>{t('adminOverview.priority')}</dt><dd>{t(`adminOverview.${selectedApproval.severity}`)}</dd></div>
                        </dl>
                        <div className="admin-overview-review-note">
                            <ShieldCheck size={17} strokeWidth={1.9} />
                            <p>{t('adminOverview.reviewNote')}</p>
                        </div>
                        <div className="admin-overview-modal-actions">
                            <button type="button" className="reject" onClick={() => handleResolveApproval(selectedApproval, 'reject')}>{t('adminOverview.reject')}</button>
                            <button type="button" className="approve" onClick={() => handleResolveApproval(selectedApproval, 'approve')}>{t('adminOverview.approve')}</button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    )
}

export default AdminOverview
