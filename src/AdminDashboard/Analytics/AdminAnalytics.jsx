import { useState } from 'react'
import './AdminAnalytics.css'
import {
    BarChartOutlined,
    RiseOutlined,
    ShoppingCartOutlined,
    ShopOutlined,
    UserOutlined,
    CarOutlined,
    DollarOutlined,
    CalendarOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
} from '@ant-design/icons'

const monthlyData = [
    { month: 'Aug', orders: 1820, revenue: 820, shops: 12, customers: 310 },
    { month: 'Sep', orders: 2100, revenue: 920, shops: 13, customers: 345 },
    { month: 'Oct', orders: 2450, revenue: 1050, shops: 14, customers: 392 },
    { month: 'Nov', orders: 2280, revenue: 980, shops: 14, customers: 378 },
    { month: 'Dec', orders: 2760, revenue: 1150, shops: 15, customers: 441 },
    { month: 'Jan', orders: 3010, revenue: 1245, shops: 15, customers: 482 },
]

const topShops = [
    { name: 'FPT Laundry Shop', orders: 1245, revenue: '124.5M', growth: '+15%', up: true },
    { name: 'Clean & Fresh', orders: 1089, revenue: '108.9M', growth: '+12%', up: true },
    { name: 'Express Wash', orders: 967, revenue: '96.7M', growth: '+18%', up: true },
    { name: 'LaundryPro', orders: 834, revenue: '83.4M', growth: '+10%', up: true },
    { name: 'Quick Clean', orders: 756, revenue: '75.6M', growth: '+8%', up: true },
]

const serviceBreakdown = [
    { service: 'Wash & Dry', count: 3842, pct: 48, color: '#719FC2' },
    { service: 'Wash & Iron', count: 2156, pct: 27, color: '#5492b4' },
    { service: 'Dry Clean', count: 1204, pct: 15, color: '#4a7fa5' },
    { service: 'Express', count: 798, pct: 10, color: '#3d6e91' },
]

const kpis = [
    { label: 'Total Orders', value: '8,000', change: '+14%', up: true, icon: ShoppingCartOutlined, color: '#719FC2' },
    { label: 'Platform Revenue', value: '1,245M đ', change: '+23%', up: true, icon: DollarOutlined, color: '#4d9e84' },
    { label: 'Active Shops', value: '15', change: '+2 shops', up: true, icon: ShopOutlined, color: '#5492b4' },
    { label: 'Active Customers', value: '482', change: '+18%', up: true, icon: UserOutlined, color: '#4a7fa5' },
    { label: 'Active Shippers', value: '38', change: '+5', up: true, icon: CarOutlined, color: '#1e5078' },
    { label: 'Avg Order Value', value: '155,600đ', change: '+7%', up: true, icon: RiseOutlined, color: '#4d9e84' },
]

const PERIODS = ['6 Months', '3 Months', '1 Month']

export default function AdminAnalytics() {
    const [period, setPeriod] = useState('6 Months')
    const [metric, setMetric] = useState('revenue')

    const maxVal = Math.max(...monthlyData.map(d => d[metric]))

    return (
        <div className="admin-analytics">
            {/* Header */}
            <div className="admin-analytics-header">
                <div>
                    <h1 className="admin-analytics-title">
                        <BarChartOutlined style={{ marginRight: 10, color: '#719FC2' }} />
                        Analytics
                    </h1>
                    <p className="admin-analytics-subtitle">Platform performance overview and insights</p>
                </div>
                <div className="admin-analytics-period-selector">
                    {PERIODS.map(p => (
                        <button
                            key={p}
                            className={`admin-analytics-period-btn${period === p ? ' active' : ''}`}
                            onClick={() => setPeriod(p)}
                        >
                            <CalendarOutlined style={{ marginRight: 4 }} />{p}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="admin-analytics-kpi-grid">
                {kpis.map((kpi) => {
                    const Icon = kpi.icon
                    return (
                        <div className="admin-analytics-kpi-card" key={kpi.label}>
                            <div className="admin-analytics-kpi-icon" style={{ background: kpi.color + '18', color: kpi.color }}>
                                <Icon style={{ fontSize: 22 }} />
                            </div>
                            <div className="admin-analytics-kpi-body">
                                <div className="admin-analytics-kpi-value">{kpi.value}</div>
                                <div className="admin-analytics-kpi-label">{kpi.label}</div>
                            </div>
                            <div className={`admin-analytics-kpi-change ${kpi.up ? 'up' : 'down'}`}>
                                {kpi.up ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                {kpi.change}
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="admin-analytics-main-grid">
                {/* Revenue / Orders Chart */}
                <div className="admin-analytics-card admin-analytics-chart-card">
                    <div className="admin-analytics-card-header">
                        <h2>Trend Overview</h2>
                        <div className="admin-analytics-metric-tabs">
                            {['revenue', 'orders', 'customers'].map(m => (
                                <button
                                    key={m}
                                    className={`admin-analytics-metric-btn${metric === m ? ' active' : ''}`}
                                    onClick={() => setMetric(m)}
                                >
                                    {m.charAt(0).toUpperCase() + m.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="admin-analytics-chart">
                        {monthlyData.map((d) => {
                            const heightPct = Math.round((d[metric] / maxVal) * 100)
                            return (
                                <div className="admin-analytics-bar-group" key={d.month}>
                                    <div className="admin-analytics-bar-value">
                                        {metric === 'revenue' ? `${d[metric]}M` : d[metric]}
                                    </div>
                                    <div className="admin-analytics-bar-track">
                                        <div
                                            className="admin-analytics-bar"
                                            style={{ height: `${heightPct}%` }}
                                        />
                                    </div>
                                    <div className="admin-analytics-bar-label">{d.month}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Service Breakdown */}
                <div className="admin-analytics-card">
                    <div className="admin-analytics-card-header">
                        <h2>Service Breakdown</h2>
                        <span className="admin-analytics-card-meta">All time</span>
                    </div>
                    <div className="admin-analytics-service-list">
                        {serviceBreakdown.map(s => (
                            <div className="admin-analytics-service-item" key={s.service}>
                                <div className="admin-analytics-service-header">
                                    <span className="admin-analytics-service-name">{s.service}</span>
                                    <span className="admin-analytics-service-pct">{s.pct}%</span>
                                </div>
                                <div className="admin-analytics-service-bar-track">
                                    <div
                                        className="admin-analytics-service-bar"
                                        style={{ width: `${s.pct}%`, background: s.color }}
                                    />
                                </div>
                                <div className="admin-analytics-service-count">{s.count.toLocaleString()} orders</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Shops Table */}
            <div className="admin-analytics-card admin-analytics-table-card">
                <div className="admin-analytics-card-header">
                    <h2>Top Performing Shops</h2>
                    <span className="admin-analytics-card-meta">Jan 2024</span>
                </div>
                <div className="admin-analytics-table-wrap">
                    <table className="admin-analytics-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Shop Name</th>
                                <th>Total Orders</th>
                                <th>Revenue</th>
                                <th>Growth</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topShops.map((shop, i) => (
                                <tr key={shop.name}>
                                    <td>
                                        <span className={`admin-analytics-rank rank-${i + 1}`}>{i + 1}</span>
                                    </td>
                                    <td className="admin-analytics-shop-name">{shop.name}</td>
                                    <td>{shop.orders.toLocaleString()}</td>
                                    <td className="admin-analytics-revenue">{shop.revenue}</td>
                                    <td>
                                        <span className={`admin-analytics-growth ${shop.up ? 'up' : 'down'}`}>
                                            {shop.up ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                            {shop.growth}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
