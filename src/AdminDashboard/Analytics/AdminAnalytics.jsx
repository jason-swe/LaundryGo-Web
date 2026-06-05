import { createElement, useState } from 'react'
import {
    BarChart3,
    CircleDollarSign,
    Download,
    Lightbulb,
    MapPinned,
    PackageSearch,
    Repeat2,
    ShoppingCart,
    Store,
    TrendingUp,
    Truck,
    Users,
} from 'lucide-react'
import './AdminAnalytics.css'
import toast from '../../utils/toast'
import { useTranslation } from '../../shared/lib/i18n'

const MONTHLY_DATA = [
    { month: 'Jan', orders: 1820, revenue: 820, shops: 12, customers: 310 },
    { month: 'Feb', orders: 2100, revenue: 920, shops: 13, customers: 345 },
    { month: 'Mar', orders: 2450, revenue: 1050, shops: 14, customers: 392 },
    { month: 'Apr', orders: 2280, revenue: 980, shops: 14, customers: 378 },
    { month: 'May', orders: 2760, revenue: 1150, shops: 15, customers: 441 },
    { month: 'Jun', orders: 3010, revenue: 1245, shops: 15, customers: 482 },
]

const TOP_SHOPS = [
    { name: 'FPT Laundry Shop', orders: 1245, revenue: '124.5M', growth: '+15%' },
    { name: 'Clean & Fresh', orders: 1089, revenue: '108.9M', growth: '+12%' },
    { name: 'Express Wash', orders: 967, revenue: '96.7M', growth: '+18%' },
    { name: 'LaundryPro', orders: 834, revenue: '83.4M', growth: '+10%' },
    { name: 'Quick Clean', orders: 756, revenue: '75.6M', growth: '+8%' },
]

const SERVICES = [
    { key: 'washDry', count: 3842, pct: 48 },
    { key: 'washIron', count: 2156, pct: 27 },
    { key: 'dryClean', count: 1204, pct: 15 },
    { key: 'express', count: 798, pct: 10 },
]

const DISTRICTS = [
    { key: 'district1', demand: 91, orders: 1480, sla: '96.4%' },
    { key: 'district3', demand: 78, orders: 1120, sla: '94.1%' },
    { key: 'binhThanh', demand: 67, orders: 940, sla: '93.7%' },
    { key: 'thuDuc', demand: 59, orders: 820, sla: '92.8%' },
]

const INSIGHTS = [
    { key: 'weekendDemand', tone: 'blue' },
    { key: 'shipperCoverage', tone: 'amber' },
    { key: 'partnerQuality', tone: 'green' },
]

const PERIODS = ['sixMonths', 'threeMonths', 'oneMonth']
const METRICS = ['revenue', 'orders', 'customers']

function metricValue(item, metric) {
    return item[metric]
}

function AdminAnalytics() {
    const { t } = useTranslation()
    const [period, setPeriod] = useState('sixMonths')
    const [metric, setMetric] = useState('revenue')
    const maxValue = Math.max(...MONTHLY_DATA.map(item => metricValue(item, metric)))

    const kpis = [
        { label: t('adminAnalytics.totalOrders'), value: '8,000', meta: t('adminAnalytics.metaOrders'), Icon: ShoppingCart },
        { label: t('adminAnalytics.platformRevenue'), value: '1,245M', meta: t('adminAnalytics.metaRevenue'), Icon: CircleDollarSign },
        { label: t('adminAnalytics.activeShops'), value: '15', meta: t('adminAnalytics.metaShops'), Icon: Store },
        { label: t('adminAnalytics.activeCustomers'), value: '482', meta: t('adminAnalytics.metaCustomers'), Icon: Users },
        { label: t('adminAnalytics.activeShippers'), value: '38', meta: t('adminAnalytics.metaShippers'), Icon: Truck },
        { label: t('adminAnalytics.avgOrderValue'), value: '155.6K', meta: t('adminAnalytics.metaAov'), Icon: TrendingUp },
    ]

    const exportReport = () => {
        toast.success(t('adminAnalytics.exported'))
    }

    return (
        <div className="admin-analytics-page">
            <header className="admin-analytics-header">
                <div>
                    <span className="admin-analytics-eyebrow">{t('adminAnalytics.eyebrow')}</span>
                    <h1>{t('adminAnalytics.title')}</h1>
                    <p>{t('adminAnalytics.subtitle')}</p>
                </div>
                <div className="admin-analytics-header-actions">
                    <div className="admin-analytics-segment">
                        {PERIODS.map(item => (
                            <button type="button" className={period === item ? 'active' : ''} key={item} onClick={() => setPeriod(item)}>
                                {t(`adminAnalytics.period${item}`)}
                            </button>
                        ))}
                    </div>
                    <button type="button" className="admin-analytics-primary" onClick={exportReport}>
                        <Download size={17} strokeWidth={1.9} />{t('adminAnalytics.export')}
                    </button>
                </div>
            </header>

            <section className="admin-analytics-kpis">
                {kpis.map(({ label, value, meta, Icon }) => (
                    <article className="admin-analytics-kpi" key={label}>
                        <span>{createElement(Icon, { size: 18, strokeWidth: 1.9 })}</span>
                        <small>{label}</small>
                        <strong>{value}</strong>
                        <p>{meta}</p>
                    </article>
                ))}
            </section>

            <section className="admin-analytics-main-grid">
                <article className="admin-analytics-card admin-analytics-chart-card">
                    <div className="admin-analytics-card-head">
                        <div>
                            <span className="admin-analytics-eyebrow">{t('adminAnalytics.growth')}</span>
                            <h2>{t('adminAnalytics.trendOverview')}</h2>
                        </div>
                        <div className="admin-analytics-metric-tabs">
                            {METRICS.map(item => (
                                <button type="button" className={metric === item ? 'active' : ''} key={item} onClick={() => setMetric(item)}>
                                    {t(`adminAnalytics.metric${item}`)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="admin-analytics-chart">
                        {MONTHLY_DATA.map(item => {
                            const height = Math.max(12, Math.round((metricValue(item, metric) / maxValue) * 252))
                            return (
                                <div className="admin-analytics-bar-group" key={item.month}>
                                    <strong>{metric === 'revenue' ? `${item[metric]}M` : item[metric].toLocaleString()}</strong>
                                    <span style={{ height: `${height}px` }} />
                                    <small>{item.month}</small>
                                </div>
                            )
                        })}
                    </div>
                </article>

                <aside className="admin-analytics-card admin-analytics-insights">
                    <div className="admin-analytics-card-head compact">
                        <div>
                            <span className="admin-analytics-eyebrow">{t('adminAnalytics.insights')}</span>
                            <h2>{t('adminAnalytics.recommendedActions')}</h2>
                        </div>
                    </div>
                    <div className="admin-analytics-insight-list">
                        {INSIGHTS.map(item => (
                            <article className={`admin-analytics-insight ${item.tone}`} key={item.key}>
                                <span><Lightbulb size={17} /></span>
                                <div>
                                    <strong>{t(`adminAnalytics.insight.${item.key}.title`)}</strong>
                                    <p>{t(`adminAnalytics.insight.${item.key}.copy`)}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </aside>
            </section>

            <section className="admin-analytics-secondary-grid">
                <article className="admin-analytics-card">
                    <div className="admin-analytics-card-head">
                        <div>
                            <span className="admin-analytics-eyebrow">{t('adminAnalytics.demand')}</span>
                            <h2>{t('adminAnalytics.serviceDemand')}</h2>
                        </div>
                        <PackageSearch size={19} />
                    </div>
                    <div className="admin-analytics-service-list">
                        {SERVICES.map(service => (
                            <div className="admin-analytics-service-item" key={service.key}>
                                <div>
                                    <strong>{t(`adminAnalytics.service.${service.key}`)}</strong>
                                    <span>{service.count.toLocaleString()} {t('adminAnalytics.orders')}</span>
                                </div>
                                <b>{service.pct}%</b>
                                <i><span style={{ width: `${service.pct}%` }} /></i>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="admin-analytics-card">
                    <div className="admin-analytics-card-head">
                        <div>
                            <span className="admin-analytics-eyebrow">{t('adminAnalytics.geography')}</span>
                            <h2>{t('adminAnalytics.topDistricts')}</h2>
                        </div>
                        <MapPinned size={19} />
                    </div>
                    <div className="admin-analytics-district-list">
                        {DISTRICTS.map(district => (
                            <article key={district.key}>
                                <div>
                                    <strong>{t(`adminAnalytics.district.${district.key}`)}</strong>
                                    <span>{district.orders.toLocaleString()} {t('adminAnalytics.orders')}</span>
                                </div>
                                <b>{district.sla}</b>
                                <i><span style={{ width: `${district.demand}%` }} /></i>
                            </article>
                        ))}
                    </div>
                </article>
            </section>

            <section className="admin-analytics-card admin-analytics-table-card">
                <div className="admin-analytics-card-head">
                    <div>
                        <span className="admin-analytics-eyebrow">{t('adminAnalytics.partnerRank')}</span>
                        <h2>{t('adminAnalytics.topPerformingShops')}</h2>
                    </div>
                    <Repeat2 size={19} />
                </div>
                <div className="admin-analytics-table-wrap">
                    <table className="admin-analytics-table">
                        <thead>
                            <tr>
                                <th>{t('adminAnalytics.rank')}</th>
                                <th>{t('adminAnalytics.shop')}</th>
                                <th>{t('adminAnalytics.totalOrders')}</th>
                                <th>{t('adminAnalytics.revenue')}</th>
                                <th>{t('adminAnalytics.growthRate')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {TOP_SHOPS.map((shop, index) => (
                                <tr key={shop.name}>
                                    <td><span className="admin-analytics-rank">{index + 1}</span></td>
                                    <td><strong>{shop.name}</strong><small>SHOP-{String(index + 1).padStart(3, '0')}</small></td>
                                    <td>{shop.orders.toLocaleString()}</td>
                                    <td className="money">{shop.revenue}</td>
                                    <td><span className="admin-analytics-growth">{shop.growth}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    )
}

export default AdminAnalytics
