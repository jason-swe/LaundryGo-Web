import { useState } from 'react'
import {
    DollarOutlined,
    CalendarOutlined,
    FileTextOutlined,
    DownloadOutlined,
    RiseOutlined,
    ShoppingOutlined
} from '@ant-design/icons'
import './ShopRevenue.css'

function ShopRevenue() {
    const [selectedPeriod, setSelectedPeriod] = useState('month')

    // Generate revenue data based on selected period
    const getRevenueData = () => {
        switch (selectedPeriod) {
            case 'week':
                return [
                    { label: 'Mon', revenue: 6200000, commission: 930000, net: 5270000, orders: 22 },
                    { label: 'Tue', revenue: 6800000, commission: 1020000, net: 5780000, orders: 24 },
                    { label: 'Wed', revenue: 7500000, commission: 1125000, net: 6375000, orders: 26 },
                    { label: 'Thu', revenue: 7200000, commission: 1080000, net: 6120000, orders: 25 },
                    { label: 'Fri', revenue: 8100000, commission: 1215000, net: 6885000, orders: 28 },
                    { label: 'Sat', revenue: 9500000, commission: 1425000, net: 8075000, orders: 32 },
                    { label: 'Sun', revenue: 8300000, commission: 1245000, net: 7055000, orders: 29 }
                ]
            case 'month':
                return [
                    { label: 'Week 1', revenue: 28600000, commission: 4290000, net: 24310000, orders: 98 },
                    { label: 'Week 2', revenue: 31200000, commission: 4680000, net: 26520000, orders: 106 },
                    { label: 'Week 3', revenue: 34800000, commission: 5220000, net: 29580000, orders: 118 },
                    { label: 'Week 4', revenue: 38200000, commission: 5730000, net: 32470000, orders: 124 }
                ]
            case 'quarter':
                return [
                    { label: 'Jan', revenue: 38500000, commission: 5775000, net: 32725000, orders: 142 },
                    { label: 'Feb', revenue: 42300000, commission: 6345000, net: 35955000, orders: 155 },
                    { label: 'Mar', revenue: 45800000, commission: 6870000, net: 38930000, orders: 156 }
                ]
            case 'year':
                return [
                    { label: 'Jan', revenue: 38500000, commission: 5775000, net: 32725000, orders: 142 },
                    { label: 'Feb', revenue: 42300000, commission: 6345000, net: 35955000, orders: 155 },
                    { label: 'Mar', revenue: 45800000, commission: 6870000, net: 38930000, orders: 156 },
                    { label: 'Apr', revenue: 48200000, commission: 7230000, net: 40970000, orders: 168 },
                    { label: 'May', revenue: 51500000, commission: 7725000, net: 43775000, orders: 178 },
                    { label: 'Jun', revenue: 55200000, commission: 8280000, net: 46920000, orders: 189 },
                    { label: 'Jul', revenue: 58600000, commission: 8790000, net: 49810000, orders: 195 },
                    { label: 'Aug', revenue: 62100000, commission: 9315000, net: 52785000, orders: 208 },
                    { label: 'Sep', revenue: 59800000, commission: 8970000, net: 50830000, orders: 198 },
                    { label: 'Oct', revenue: 65400000, commission: 9810000, net: 55590000, orders: 215 },
                    { label: 'Nov', revenue: 68900000, commission: 10335000, net: 58565000, orders: 228 },
                    { label: 'Dec', revenue: 72500000, commission: 10875000, net: 61625000, orders: 242 }
                ]
            default:
                return []
        }
    }

    const revenueData = getRevenueData()
    const maxRevenue = revenueData.length > 0 ? Math.max(...revenueData.map(d => d.revenue)) : 0

    // Calculate stats based on current period data
    const currentStats = revenueData.length > 0 ? {
        totalRevenue: revenueData.reduce((sum, d) => sum + d.revenue, 0),
        platformCommission: revenueData.reduce((sum, d) => sum + d.commission, 0),
        netRevenue: revenueData.reduce((sum, d) => sum + d.net, 0),
        totalOrders: revenueData.reduce((sum, d) => sum + d.orders, 0),
        avgOrderValue: Math.round(revenueData.reduce((sum, d) => sum + d.revenue, 0) / revenueData.reduce((sum, d) => sum + d.orders, 0))
    } : {
        totalRevenue: 0,
        platformCommission: 0,
        netRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0
    }

    const getPeriodLabel = () => {
        switch (selectedPeriod) {
            case 'week': return 'This Week'
            case 'month': return 'This Month'
            case 'quarter': return 'This Quarter'
            case 'year': return 'This Year'
            default: return 'Period'
        }
    }

    const recentOrders = [
        {
            id: 'ORD-001',
            customer: 'Nguyễn Văn A',
            date: '2024-03-15',
            service: 'Giặt Sấy Khô',
            orderTotal: 350000,
            commission: 52500,
            netAmount: 297500,
            status: 'completed'
        },
        {
            id: 'ORD-002',
            customer: 'Trần Thị B',
            date: '2024-03-15',
            service: 'Giặt Thường',
            orderTotal: 180000,
            commission: 27000,
            netAmount: 153000,
            status: 'completed'
        },
        {
            id: 'ORD-003',
            customer: 'Lê Văn C',
            date: '2024-03-14',
            service: 'Là/Ủi Áo Sơ Mi',
            orderTotal: 120000,
            commission: 18000,
            netAmount: 102000,
            status: 'completed'
        },
        {
            id: 'ORD-004',
            customer: 'Phạm Thị D',
            date: '2024-03-14',
            service: 'Giặt Hấp',
            orderTotal: 420000,
            commission: 63000,
            netAmount: 357000,
            status: 'pending'
        }
    ]

    const subscriptionInfo = {
        plan: 'Professional',
        monthlyFee: 500000,
        nextBillingDate: '2024-04-01',
        status: 'active'
    }

    return (
        <div className="shop-revenue">
            <div className="shop-revenue-header">
                <div>
                    <h1 className="shop-revenue-title">
                        <DollarOutlined style={{ marginRight: '8px' }} />
                        Revenue & Finance
                    </h1>
                    <p className="shop-revenue-subtitle">
                        Track your earnings and commission breakdown
                    </p>
                </div>
                <button className="shop-revenue-export-btn">
                    <DownloadOutlined /> Export Report
                </button>
            </div>

            {/* Revenue Stats */}
            <div className="shop-revenue-stats">
                <div className="revenue-stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                        <RiseOutlined style={{ fontSize: '24px', color: '#3b82f6' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Revenue ({getPeriodLabel()})</div>
                        <div className="stat-value">
                            {currentStats.totalRevenue.toLocaleString()}đ
                        </div>
                    </div>
                </div>

                <div className="revenue-stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                        <FileTextOutlined style={{ fontSize: '24px', color: '#f59e0b' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Platform Commission (15%)</div>
                        <div className="stat-value" style={{ color: '#f59e0b' }}>
                            -{currentStats.platformCommission.toLocaleString()}đ
                        </div>
                    </div>
                </div>

                <div className="revenue-stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                        <DollarOutlined style={{ fontSize: '24px', color: '#10b981' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Net Revenue</div>
                        <div className="stat-value" style={{ color: '#10b981' }}>
                            {currentStats.netRevenue.toLocaleString()}đ
                        </div>
                    </div>
                </div>

                <div className="revenue-stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                        <ShoppingOutlined style={{ fontSize: '24px', color: '#8b5cf6' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Orders</div>
                        <div className="stat-value">{currentStats.totalOrders}</div>
                        <div className="stat-sublabel">
                            Avg: {currentStats.avgOrderValue.toLocaleString()}đ
                        </div>
                    </div>
                </div>
            </div>

            {/* Period Selector */}
            <div className="shop-revenue-period">
                <button
                    className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
                    onClick={() => setSelectedPeriod('week')}
                >
                    This Week
                </button>
                <button
                    className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
                    onClick={() => setSelectedPeriod('month')}
                >
                    This Month
                </button>
                <button
                    className={`period-btn ${selectedPeriod === 'quarter' ? 'active' : ''}`}
                    onClick={() => setSelectedPeriod('quarter')}
                >
                    This Quarter
                </button>
                <button
                    className={`period-btn ${selectedPeriod === 'year' ? 'active' : ''}`}
                    onClick={() => setSelectedPeriod('year')}
                >
                    This Year
                </button>
            </div>

            {/* Revenue Chart */}
            <div className="shop-revenue-section">
                <h2 className="section-title">Revenue Trend - {getPeriodLabel()}</h2>
                <div className="revenue-chart">
                    {revenueData.map((data, index) => {
                        const heightPercentage = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0

                        return (
                            <div key={index} className="chart-bar">
                                <div className="bar-tooltip">
                                    <div>{data.label}</div>
                                    <div>Revenue: {(data.revenue / 1000000).toFixed(1)}M</div>
                                    <div>Net: {(data.net / 1000000).toFixed(1)}M</div>
                                    <div>Orders: {data.orders}</div>
                                </div>
                                <div
                                    className="bar-fill"
                                    style={{ height: `${heightPercentage}%` }}
                                >
                                    <div className="bar-commission" style={{ height: '15%' }} />
                                </div>
                                <div className="bar-label">{data.label}</div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Recent Orders */}
            <div className="shop-revenue-section">
                <h2 className="section-title">Recent Order Revenue</h2>
                <div className="revenue-table-container">
                    <table className="revenue-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Service</th>
                                <th>Order Total</th>
                                <th>Commission (15%)</th>
                                <th>Net Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="order-id">{order.id}</td>
                                    <td>{order.customer}</td>
                                    <td>{order.date}</td>
                                    <td>{order.service}</td>
                                    <td className="order-total">
                                        {order.orderTotal.toLocaleString()}đ
                                    </td>
                                    <td className="order-commission">
                                        -{order.commission.toLocaleString()}đ
                                    </td>
                                    <td className="order-net">
                                        {order.netAmount.toLocaleString()}đ
                                    </td>
                                    <td>
                                        <span
                                            className={`status-badge status-${order.status}`}
                                        >
                                            {order.status === 'completed'
                                                ? 'Completed'
                                                : 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Subscription Info */}
            <div className="shop-revenue-section">
                <h2 className="section-title">Subscription Plan</h2>
                <div className="subscription-card">
                    <div className="subscription-info">
                        <div className="subscription-plan">
                            <CalendarOutlined style={{ fontSize: '20px' }} />
                            <div>
                                <div className="plan-name">{subscriptionInfo.plan} Plan</div>
                                <div className="plan-status">
                                    Status: <span className="status-active">Active</span>
                                </div>
                            </div>
                        </div>
                        <div className="subscription-details">
                            <div>
                                <strong>Monthly Fee:</strong>{' '}
                                {subscriptionInfo.monthlyFee.toLocaleString()}đ
                            </div>
                            <div>
                                <strong>Next Billing:</strong> {subscriptionInfo.nextBillingDate}
                            </div>
                        </div>
                    </div>
                    <button className="subscription-btn">Manage Subscription</button>
                </div>
            </div>
        </div>
    )
}

export default ShopRevenue
