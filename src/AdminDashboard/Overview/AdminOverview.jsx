import './AdminOverview.css'
import { useState } from 'react'
import {
    DollarOutlined,
    ShopOutlined,
    UserOutlined,
    ShoppingCartOutlined,
    RiseOutlined,
    TeamOutlined,
    TrophyOutlined,
    ClockCircleOutlined,
    FileTextOutlined
} from '@ant-design/icons'

function AdminOverview() {
    const [selectedPeriod, setSelectedPeriod] = useState('6months')
    // Mock data
    const stats = [
        {
            label: 'Total Platform Revenue',
            value: '1,245.8M VND',
            change: '+18% vs last month',
            trend: 'up',
            icon: DollarOutlined,
            color: '#10b981'
        },
        {
            label: 'New Customers',
            value: '342',
            change: '+24 this week',
            trend: 'up',
            icon: UserOutlined,
            color: '#3b82f6'
        },
        {
            label: 'New Partner Shops',
            value: '28',
            change: '+5 this month',
            trend: 'up',
            icon: ShopOutlined,
            color: '#f59e0b'
        },
        {
            label: 'Total Orders Today',
            value: '1,847',
            change: '+12% vs yesterday',
            trend: 'up',
            icon: ShoppingCartOutlined,
            color: '#8b5cf6'
        },
        {
            label: 'Active Shops',
            value: '156',
            change: '89% online rate',
            trend: 'up',
            icon: ShopOutlined,
            color: '#ec4899'
        },
        {
            label: 'Platform Growth',
            value: '+35%',
            change: 'YoY Growth Rate',
            trend: 'up',
            icon: RiseOutlined,
            color: '#06b6d4'
        }
    ]

    // Generate revenue chart data based on selected period
    const getRevenueData = () => {
        switch (selectedPeriod) {
            case 'week':
                return [
                    { label: 'Mon', revenue: 165 },
                    { label: 'Tue', revenue: 178 },
                    { label: 'Wed', revenue: 192 },
                    { label: 'Thu', revenue: 185 },
                    { label: 'Fri', revenue: 205 },
                    { label: 'Sat', revenue: 220 },
                    { label: 'Sun', revenue: 198 }
                ]
            case 'month':
                return [
                    { label: 'Week 1', revenue: 680 },
                    { label: 'Week 2', revenue: 750 },
                    { label: 'Week 3', revenue: 820 },
                    { label: 'Week 4', revenue: 895 }
                ]
            case '6months':
                return [
                    { label: 'Jan', revenue: 850 },
                    { label: 'Feb', revenue: 920 },
                    { label: 'Mar', revenue: 1050 },
                    { label: 'Apr', revenue: 980 },
                    { label: 'May', revenue: 1150 },
                    { label: 'Jun', revenue: 1245 }
                ]
            case 'year':
                return [
                    { label: 'Jan', revenue: 920 },
                    { label: 'Feb', revenue: 985 },
                    { label: 'Mar', revenue: 1050 },
                    { label: 'Apr', revenue: 1120 },
                    { label: 'May', revenue: 1085 },
                    { label: 'Jun', revenue: 1170 },
                    { label: 'Jul', revenue: 1245 },
                    { label: 'Aug', revenue: 1310 },
                    { label: 'Sep', revenue: 1265 },
                    { label: 'Oct', revenue: 1380 },
                    { label: 'Nov', revenue: 1420 },
                    { label: 'Dec', revenue: 1485 }
                ]
            default:
                return []
        }
    }

    const revenueData = getRevenueData()
    const maxRevenue = Math.max(...revenueData.map(d => d.revenue))

    const periodLabels = {
        week: 'Last 7 Days',
        month: 'Last Month',
        '6months': 'Last 6 Months',
        year: 'Last Year'
    }

    // Top partner shops
    const topShops = [
        { name: 'FPT Laundry Shop', orders: 1245, revenue: '124.5M', rating: 4.9, growth: '+15%' },
        { name: 'Clean & Fresh', orders: 1089, revenue: '108.9M', rating: 4.8, growth: '+12%' },
        { name: 'Express Wash', orders: 967, revenue: '96.7M', rating: 4.7, growth: '+18%' },
        { name: 'LaundryPro', orders: 834, revenue: '83.4M', rating: 4.9, growth: '+10%' },
        { name: 'Quick Clean', orders: 756, revenue: '75.6M', rating: 4.6, growth: '+8%' }
    ]

    // Recent incidents
    const recentIncidents = [
        { id: '#INC-245', shop: 'FPT Laundry Shop', issue: 'Machine malfunction', priority: 'high', status: 'in-progress', time: '15 mins ago' },
        { id: '#INC-244', shop: 'Clean & Fresh', issue: 'Customer complaint', priority: 'medium', status: 'pending', time: '1 hour ago' },
        { id: '#INC-243', shop: 'Express Wash', issue: 'Supply shortage', priority: 'low', status: 'resolved', time: '2 hours ago' }
    ]

    // Pending approvals
    const pendingApprovals = [
        { type: 'new-shop', name: 'Sparkle Laundry', location: 'District 1, HCMC', date: '2 hours ago' },
        { type: 'document', name: 'FPT Laundry Shop', item: 'Business License Renewal', date: '5 hours ago' },
        { type: 'new-shop', name: 'Fresh & Clean', location: 'District 7, HCMC', date: '1 day ago' }
    ]

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ef4444'
            case 'medium': return '#f59e0b'
            case 'low': return '#10b981'
            default: return '#6b7280'
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved': return '#10b981'
            case 'in-progress': return '#3b82f6'
            case 'pending': return '#f59e0b'
            default: return '#6b7280'
        }
    }

    return (
        <div className="admin-overview">
            <div className="admin-overview-header">
                <div>
                    <h1 className="admin-overview-title">Admin Dashboard</h1>
                    <p className="admin-overview-subtitle">Platform overview and system metrics</p>
                </div>
                <div className="admin-overview-date">
                    <ClockCircleOutlined style={{ marginRight: '8px' }} />
                    {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
                                <div className="admin-overview-stat-label">{stat.label}</div>
                                <div className="admin-overview-stat-value">{stat.value}</div>
                                <div className={`admin-overview-stat-change ${stat.trend}`}>
                                    {stat.change}
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
                        <h2 className="admin-overview-card-title">Platform Revenue Trend</h2>
                        <div className="admin-overview-period-selector">
                            <button
                                className={`admin-overview-period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
                                onClick={() => setSelectedPeriod('week')}
                            >
                                Week
                            </button>
                            <button
                                className={`admin-overview-period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
                                onClick={() => setSelectedPeriod('month')}
                            >
                                Month
                            </button>
                            <button
                                className={`admin-overview-period-btn ${selectedPeriod === '6months' ? 'active' : ''}`}
                                onClick={() => setSelectedPeriod('6months')}
                            >
                                6 Months
                            </button>
                            <button
                                className={`admin-overview-period-btn ${selectedPeriod === 'year' ? 'active' : ''}`}
                                onClick={() => setSelectedPeriod('year')}
                            >
                                Year
                            </button>
                        </div>
                    </div>
                    <div className="admin-overview-chart">
                        <div className="admin-overview-chart-bars">
                            {revenueData.map((data, index) => (
                                <div key={index} className="admin-overview-chart-bar-wrapper">
                                    <div
                                        className="admin-overview-chart-bar"
                                        style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                                        title={`${data.label}: ${data.revenue}M VND`}
                                    />
                                    <div className="admin-overview-chart-value">{data.revenue}M</div>
                                    <div className="admin-overview-chart-label">{data.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Partner Shops */}
                <div className="admin-overview-card admin-overview-top-shops">
                    <div className="admin-overview-card-header">
                        <h2 className="admin-overview-card-title">Top Partner Shops</h2>
                        <button className="admin-overview-view-all">View All</button>
                    </div>
                    <div className="admin-overview-shops-list">
                        {topShops.map((shop, index) => (
                            <div key={index} className="admin-overview-shop-item">
                                <div className="admin-overview-shop-rank">{index + 1}</div>
                                <div className="admin-overview-shop-details">
                                    <div className="admin-overview-shop-name">{shop.name}</div>
                                    <div className="admin-overview-shop-stats">
                                        {shop.orders} orders • {shop.revenue} • ⭐ {shop.rating}
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
                        <h2 className="admin-overview-card-title">Pending Approvals</h2>
                        <span className="admin-overview-count-badge">{pendingApprovals.length}</span>
                    </div>
                    <div className="admin-overview-approvals-list">
                        {pendingApprovals.map((item, index) => (
                            <div key={index} className="admin-overview-approval-item">
                                <div className="admin-overview-approval-icon">
                                    {item.type === 'new-shop' ? <ShopOutlined /> : <FileTextOutlined />}
                                </div>
                                <div className="admin-overview-approval-details">
                                    <div className="admin-overview-approval-name">{item.name}</div>
                                    <div className="admin-overview-approval-meta">
                                        {item.location || item.item} • {item.date}
                                    </div>
                                </div>
                                <button className="admin-overview-approve-btn">Review</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Incidents */}
                <div className="admin-overview-card admin-overview-incidents">
                    <div className="admin-overview-card-header">
                        <h2 className="admin-overview-card-title">Recent Incidents</h2>
                        <button className="admin-overview-view-all">View All</button>
                    </div>
                    <div className="admin-overview-incidents-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Shop</th>
                                    <th>Issue</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentIncidents.map((incident, index) => (
                                    <tr key={index}>
                                        <td className="incident-id">{incident.id}</td>
                                        <td>{incident.shop}</td>
                                        <td>{incident.issue}</td>
                                        <td>
                                            <span
                                                className="priority-badge"
                                                style={{
                                                    background: `${getPriorityColor(incident.priority)}20`,
                                                    color: getPriorityColor(incident.priority)
                                                }}
                                            >
                                                {incident.priority}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className="status-badge"
                                                style={{
                                                    background: `${getStatusColor(incident.status)}20`,
                                                    color: getStatusColor(incident.status)
                                                }}
                                            >
                                                {incident.status}
                                            </span>
                                        </td>
                                        <td className="incident-time">{incident.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminOverview
