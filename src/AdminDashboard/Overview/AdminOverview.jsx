import './AdminOverview.css'
import { useState } from 'react'
import {
    DollarOutlined,
    ShopOutlined,
    UserOutlined,
    CarOutlined,
    RiseOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    CloseOutlined,
    DownloadOutlined,
    EyeOutlined,
    ExclamationCircleOutlined,
    AlertOutlined,
    BarChartOutlined
} from '@ant-design/icons'
import { incidents as incidentsData } from '../../data'
import toast from '../../utils/toast'
import { useTranslation } from '../../shared/lib/i18n'

function AdminOverview() {
    const { language, t } = useTranslation()
    const [selectedPeriod, setSelectedPeriod] = useState('6months')
    const [showAllIncidents, setShowAllIncidents] = useState(false)
    const [reviewModal, setReviewModal] = useState(null)
    const [pendingApprovals, setPendingApprovals] = useState([
        { id: 1, type: 'new-shop', name: 'Sparkle Laundry', location: 'Quận 1, TP.HCM', dateKey: 'twoHoursAgo' },
        { id: 2, type: 'document', name: 'FPT Laundry Shop', itemKey: 'businessLicenseRenewal', dateKey: 'fiveHoursAgo' },
        { id: 3, type: 'new-shop', name: 'Fresh & Clean', location: 'Quận 7, TP.HCM', dateKey: 'oneDayAgo' },
        { id: 4, type: 'document', name: 'Express Wash', itemKey: 'safetyCertificate', dateKey: 'oneDayAgo' },
    ])
    const stats = [
        { labelKey: 'totalPlatformRevenue', value: '1,245.8M VND', changeKey: 'vsLastMonth', changePrefix: '+18% ', trend: 'up', icon: DollarOutlined, color: '#4d9e84' },
        { labelKey: 'newCustomers', value: '342', changeKey: 'thisWeek', changePrefix: '+24 ', trend: 'up', icon: UserOutlined, color: '#719FC2' },
        { labelKey: 'partnerShops', value: '156', changeKey: 'thisMonth', changePrefix: '+5 ', trend: 'up', icon: ShopOutlined, color: '#5492b4' },
        { labelKey: 'activeShippers', value: '89', changeKey: 'thisWeek', changePrefix: '+3 ', trend: 'up', icon: CarOutlined, color: '#719FC2' },
        { labelKey: 'pendingApprovals', value: String(pendingApprovals.length), changeKey: 'awaitingReview', trend: 'up', icon: ExclamationCircleOutlined, color: '#c05a50' },
        { labelKey: 'platformGrowth', value: '+35%', changeKey: 'yoyGrowthRate', trend: 'up', icon: RiseOutlined, color: '#5492b4' }
    ]

    const getRevenueData = () => {
        switch (selectedPeriod) {
            case 'week': return [
                { labelKey: 'mon', revenue: 165 }, { labelKey: 'tue', revenue: 178 }, { labelKey: 'wed', revenue: 192 },
                { labelKey: 'thu', revenue: 185 }, { labelKey: 'fri', revenue: 205 }, { labelKey: 'sat', revenue: 220 }, { labelKey: 'sun', revenue: 198 }
            ]
            case 'month': return [
                { labelKey: 'week1', revenue: 680 }, { labelKey: 'week2', revenue: 750 },
                { labelKey: 'week3', revenue: 820 }, { labelKey: 'week4', revenue: 895 }
            ]
            case '6months': return [
                { labelKey: 'jan', revenue: 850 }, { labelKey: 'feb', revenue: 920 }, { labelKey: 'mar', revenue: 1050 },
                { labelKey: 'apr', revenue: 980 }, { labelKey: 'may', revenue: 1150 }, { labelKey: 'jun', revenue: 1245 }
            ]
            case 'year': return [
                { labelKey: 'jan', revenue: 920 }, { labelKey: 'feb', revenue: 985 }, { labelKey: 'mar', revenue: 1050 },
                { labelKey: 'apr', revenue: 1120 }, { labelKey: 'may', revenue: 1085 }, { labelKey: 'jun', revenue: 1170 },
                { labelKey: 'jul', revenue: 1245 }, { labelKey: 'aug', revenue: 1310 }, { labelKey: 'sep', revenue: 1265 },
                { labelKey: 'oct', revenue: 1380 }, { labelKey: 'nov', revenue: 1420 }, { labelKey: 'dec', revenue: 1485 }
            ]
            default: return []
        }
    }

    const revenueData = getRevenueData()
    const maxRevenue = Math.max(...revenueData.map(d => d.revenue))

    const topShops = [
        { name: 'FPT Laundry Shop', orders: 1245, revenue: '124.5M', rating: 4.9, growth: '+15%' },
        { name: 'Clean & Fresh', orders: 1089, revenue: '108.9M', rating: 4.8, growth: '+12%' },
        { name: 'Express Wash', orders: 967, revenue: '96.7M', rating: 4.7, growth: '+18%' },
        { name: 'LaundryPro', orders: 834, revenue: '83.4M', rating: 4.9, growth: '+10%' },
        { name: 'Quick Clean', orders: 756, revenue: '75.6M', rating: 4.6, growth: '+8%' }
    ]

    // Use real incidents data
    const recentIncidents = incidentsData.slice(0, showAllIncidents ? incidentsData.length : 5)

    const getPriorityColor = (p) => ({ urgent: '#c05a50', high: '#5492b4', medium: '#5492b4', low: '#4d9e84' }[p] || '#6b7280')
    const getStatusColor = (s) => ({ resolved: '#4d9e84', 'in-progress': '#719FC2', pending: '#5492b4' }[s] || '#6b7280')
    const getIncidentStatusKey = (status) => status === 'in-progress' ? 'inProgress' : status
    const getApprovalMeta = (item) => item.location || t(`admin.overview.documents.${item.itemKey}`)
    const getApprovalDate = (item) => t(`admin.overview.relativeTime.${item.dateKey}`)

    const handleApprove = (item) => {
        setPendingApprovals(prev => prev.filter(a => a.id !== item.id))
        setReviewModal(null)
        toast.success(`${t('admin.overview.toasts.approvedPrefix')}: ${item.name}`)
    }

    const handleReject = (item) => {
        setPendingApprovals(prev => prev.filter(a => a.id !== item.id))
        setReviewModal(null)
        toast.error(`${t('admin.overview.toasts.rejectedPrefix')}: ${item.name}`)
    }

    const handleExportReport = () => {
        const lines = [
            t('admin.overview.export.reportTitle'),
            `${t('admin.overview.export.generated')}: ${new Date().toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}`,
            '',
            `${t('admin.overview.stats.totalPlatformRevenue')},1245.8M VND`,
            `${t('admin.overview.stats.newCustomers')},342`,
            `${t('admin.overview.stats.partnerShops')},156`,
            `${t('admin.overview.export.ordersToday')},1847`,
            `${t('admin.overview.export.growthRate')},+35%`,
            '',
            `${t('admin.overview.topPartnerShops')}:`,
            ...topShops.map(s => `${s.name},${s.orders} ${t('admin.overview.units.orders')},${s.revenue},${t('shops.rating')} ${s.rating},${s.growth}`)
        ]
        const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `admin-overview-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
        URL.revokeObjectURL(url)
        toast.success(t('admin.overview.toasts.reportExported'))
    }

    return (
        <div className="admin-overview">
            {/* Header */}
            <div className="admin-overview-header">
                <div>
                    <h1 className="admin-overview-title">{t('admin.overview.title')}</h1>
                    <p className="admin-overview-subtitle">{t('admin.overview.subtitle')}</p>
                </div>
                <div className="admin-ov-header-right">
                    <button className="admin-ov-export-btn" onClick={handleExportReport}>
                        <DownloadOutlined /> {t('admin.overview.exportReport')}
                    </button>
                    <div className="admin-overview-date">
                        <ClockCircleOutlined />
                        {new Date().toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="admin-overview-stats">
                {stats.map((stat, index) => {
                    const IconComponent = stat.icon
                    return (
                        <div key={index} className="admin-overview-stat-card">
                            <div className="admin-overview-stat-icon" style={{ background: stat.color }}>
                                <IconComponent style={{ fontSize: '24px', color: 'white' }} />
                            </div>
                            <div className="admin-overview-stat-content">
                                <div className="admin-overview-stat-label">{t(`admin.overview.stats.${stat.labelKey}`)}</div>
                                <div className="admin-overview-stat-value">{stat.value}</div>
                                <div className={`admin-overview-stat-change ${stat.trend}`}>
                                    {stat.changePrefix || ''}{t(`admin.overview.stats.${stat.changeKey}`)}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Main Grid */}
            <div className="admin-overview-grid">
                {/* Revenue Chart */}
                <div className="admin-overview-card admin-overview-revenue">
                    <div className="admin-overview-card-header">
                        <h2 className="admin-overview-card-title"><BarChartOutlined style={{ marginRight: 8 }} />{t('admin.overview.platformRevenueTrend')}</h2>
                        <div className="admin-overview-period-selector">
                            {['week', 'month', '6months', 'year'].map((v) => (
                                <button key={v}
                                    className={`admin-overview-period-btn ${selectedPeriod === v ? 'active' : ''}`}
                                    onClick={() => setSelectedPeriod(v)}>
                                    {t(`admin.overview.period.${v}`)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="admin-overview-chart">
                        <div className="admin-overview-chart-bars">
                            {revenueData.map((data, index) => (
                                <div key={index} className="admin-overview-chart-bar-wrapper">
                                    <div
                                        className="admin-overview-chart-bar"
                                        style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                                        title={`${t(`admin.overview.chartLabels.${data.labelKey}`)}: ${data.revenue}M VND`}
                                    />
                                    <div className="admin-overview-chart-value">{data.revenue}M</div>
                                    <div className="admin-overview-chart-label">{t(`admin.overview.chartLabels.${data.labelKey}`)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Partner Shops */}
                <div className="admin-overview-card admin-overview-top-shops">
                    <div className="admin-overview-card-header">
                        <h2 className="admin-overview-card-title">{t('admin.overview.topPartnerShops')}</h2>
                        <button className="admin-overview-view-all" onClick={() => toast.info(t('admin.overview.toasts.navigateShopManagement'))}>
                            {t('shop.viewAll')}
                        </button>
                    </div>
                    <div className="admin-overview-shops-list">
                        {topShops.map((shop, index) => (
                            <div key={index} className="admin-overview-shop-item">
                                <div className="admin-overview-shop-rank"
                                    style={{ background: index === 0 ? 'linear-gradient(135deg,#5492b4,#4a7fa5)' : index === 1 ? 'linear-gradient(135deg,#9ca3af,#d1d5db)' : index === 2 ? 'linear-gradient(135deg,#9a7020,#5492b4)' : 'linear-gradient(135deg,#1e5078,#719fc2)' }}>
                                    {index + 1}
                                </div>
                                <div className="admin-overview-shop-details">
                                    <div className="admin-overview-shop-name">{shop.name}</div>
                                    <div className="admin-overview-shop-stats">
                                        {shop.orders} {t('admin.overview.units.orders')} · {shop.revenue} · ⭐ {shop.rating}
                                    </div>
                                </div>
                                <div className="admin-overview-shop-growth">{shop.growth}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className="admin-overview-card admin-overview-approvals">
                    <div className="admin-overview-card-header">
                        <h2 className="admin-overview-card-title">{t('admin.overview.pendingApprovals')}</h2>
                        {pendingApprovals.length > 0
                            ? <span className="admin-overview-count-badge">{pendingApprovals.length}</span>
                            : <span className="admin-ov-all-clear">{t('admin.overview.allClear')}</span>}
                    </div>
                    {pendingApprovals.length === 0 ? (
                        <div className="admin-ov-empty"><CheckCircleOutlined style={{ fontSize: 32, color: '#4d9e84' }} /><p>{t('admin.overview.noPendingApprovals')}</p></div>
                    ) : (
                        <div className="admin-overview-approvals-list">
                            {pendingApprovals.map((item) => (
                                <div key={item.id} className="admin-overview-approval-item">
                                    <div className="admin-overview-approval-icon">
                                        {item.type === 'new-shop' ? <ShopOutlined /> : <FileTextOutlined />}
                                    </div>
                                    <div className="admin-overview-approval-details">
                                        <div className="admin-overview-approval-name">{item.name}</div>
                                        <div className="admin-overview-approval-meta">
                                            {getApprovalMeta(item)} · {getApprovalDate(item)}
                                        </div>
                                    </div>
                                    <button className="admin-overview-approve-btn" onClick={() => setReviewModal(item)}>
                                        <EyeOutlined /> {t('admin.overview.review')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Incidents */}
                <div className="admin-overview-card admin-overview-incidents">
                    <div className="admin-overview-card-header">
                        <h2 className="admin-overview-card-title"><AlertOutlined style={{ marginRight: 8, color: '#c05a50' }} />{t('admin.overview.recentIncidents')}</h2>
                        <button className="admin-overview-view-all" onClick={() => setShowAllIncidents(p => !p)}>
                            {showAllIncidents ? t('shop.revenue.pagination.showLess') : `${t('shop.viewAll')} (${incidentsData.length})`}
                        </button>
                    </div>
                    <div className="admin-overview-incidents-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('shop.documents.detail.id')}</th>
                                    <th>{t('shop.incidents.form.fields.title')}</th>
                                    <th>{t('shop.incidents.detail.reportedBy')}</th>
                                    <th>{t('shop.incidents.detail.priority')}</th>
                                    <th>{t('shop.incidents.detail.status')}</th>
                                    <th>{t('shop.revenue.table.date')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentIncidents.map((incident) => (
                                    <tr key={incident.id}>
                                        <td className="incident-id">{incident.id}</td>
                                        <td>{incident.title}</td>
                                        <td>{incident.reportedBy}</td>
                                        <td>
                                            <span className="priority-badge" style={{ background: `${getPriorityColor(incident.priority)}20`, color: getPriorityColor(incident.priority) }}>
                                                {t(`shop.incidents.priority.${incident.priority}`)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="status-badge" style={{ background: `${getStatusColor(incident.status)}20`, color: getStatusColor(incident.status) }}>
                                                {t(`shop.incidents.status.${getIncidentStatusKey(incident.status)}`)}
                                            </span>
                                        </td>
                                        <td className="incident-time">{incident.reportedDate?.split(' ')[0]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {reviewModal && (
                <div className="admin-ov-modal-overlay" onClick={() => setReviewModal(null)}>
                    <div className="admin-ov-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-ov-modal-header">
                            <h2>{reviewModal.type === 'new-shop' ? <ShopOutlined /> : <FileTextOutlined />} {t('admin.overview.reviewRequest')}</h2>
                            <button className="admin-ov-modal-close" onClick={() => setReviewModal(null)} aria-label={t('common.close')}><CloseOutlined /></button>
                        </div>
                        <div className="admin-ov-modal-body">
                            <div className="admin-ov-review-grid">
                                <div className="admin-ov-review-item">
                                    <span className="admin-ov-review-label">{t('shop.documents.detail.type')}</span>
                                    <span className="admin-ov-review-value">{t(`admin.overview.requestTypes.${reviewModal.type === 'new-shop' ? 'newShop' : 'documentRenewal'}`)}</span>
                                </div>
                                <div className="admin-ov-review-item">
                                    <span className="admin-ov-review-label">{t('profile.name')}</span>
                                    <span className="admin-ov-review-value">{reviewModal.name}</span>
                                </div>
                                <div className="admin-ov-review-item">
                                    <span className="admin-ov-review-label">{reviewModal.type === 'new-shop' ? t('admin.overview.location') : t('dashboard.document')}</span>
                                    <span className="admin-ov-review-value">{getApprovalMeta(reviewModal)}</span>
                                </div>
                                <div className="admin-ov-review-item">
                                    <span className="admin-ov-review-label">{t('admin.overview.submitted')}</span>
                                    <span className="admin-ov-review-value">{getApprovalDate(reviewModal)}</span>
                                </div>
                            </div>
                            <div className="admin-ov-review-note">
                                <ExclamationCircleOutlined style={{ color: '#5492b4', marginRight: 8 }} />
                                {t('admin.overview.verifyDocumentsNote')}
                            </div>
                        </div>
                        <div className="admin-ov-modal-footer">
                            <button className="admin-ov-reject-btn" onClick={() => handleReject(reviewModal)}>
                                <CloseCircleOutlined /> {t('admin.overview.reject')}
                            </button>
                            <button className="admin-ov-approve-btn" onClick={() => handleApprove(reviewModal)}>
                                <CheckCircleOutlined /> {t('admin.overview.approve')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminOverview
