import './ShopOverview.css'
import {
    DollarOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    ClockCircleOutlined,
    RiseOutlined,
    TrophyOutlined
} from '@ant-design/icons'

function ShopOverview() {
    // Mock data - will be replaced with API calls
    const stats = [
        {
            label: 'Today Revenue',
            value: '2.4M VND',
            change: '+12%',
            trend: 'up',
            icon: DollarOutlined,
            color: '#10b981'
        },
        {
            label: 'Total Orders',
            value: '48',
            change: '+8 from yesterday',
            trend: 'up',
            icon: ShoppingCartOutlined,
            color: '#3b82f6'
        },
        {
            label: 'Active Customers',
            value: '127',
            change: '+15 this week',
            trend: 'up',
            icon: UserOutlined,
            color: '#f59e0b'
        },
        {
            label: 'Avg. Order Time',
            value: '2.5h',
            change: '-15 min',
            trend: 'down',
            icon: ClockCircleOutlined,
            color: '#8b5cf6'
        },
        {
            label: 'Monthly Revenue',
            value: '52.3M VND',
            change: '+23% vs last month',
            trend: 'up',
            icon: RiseOutlined,
            color: '#ec4899'
        },
        {
            label: 'Customer Rating',
            value: '4.8/5.0',
            change: '2,341 reviews',
            trend: 'up',
            icon: TrophyOutlined,
            color: '#f97316'
        }
    ]

    // Recent orders for quick view
    const recentOrders = [
        { id: '#ORD-2445', customer: 'Nguyen Van A', service: 'Wash & Dry', status: 'Washing', time: '10:30 AM' },
        { id: '#ORD-2444', customer: 'Tran Thi B', service: 'Dry Only', status: 'Completed', time: '10:15 AM' },
        { id: '#ORD-2443', customer: 'Le Van C', service: 'Wash & Iron', status: 'Pending', time: '09:45 AM' },
        { id: '#ORD-2442', customer: 'Pham Thi D', service: 'Express Wash', status: 'Drying', time: '09:30 AM' },
        { id: '#ORD-2441', customer: 'Hoang Van E', service: 'Wash & Fold', status: 'Completed', time: '09:00 AM' }
    ]

    // Peak hours data for the chart
    const peakHoursData = [
        { hour: '6AM', orders: 5 },
        { hour: '7AM', orders: 12 },
        { hour: '8AM', orders: 18 },
        { hour: '9AM', orders: 25 },
        { hour: '10AM', orders: 32 },
        { hour: '11AM', orders: 28 },
        { hour: '12PM', orders: 22 },
        { hour: '1PM', orders: 20 },
        { hour: '2PM', orders: 24 },
        { hour: '3PM', orders: 30 },
        { hour: '4PM', orders: 35 },
        { hour: '5PM', orders: 38 },
        { hour: '6PM', orders: 42 },
        { hour: '7PM', orders: 35 },
        { hour: '8PM', orders: 28 },
        { hour: '9PM', orders: 15 }
    ]

    const maxOrders = Math.max(...peakHoursData.map(d => d.orders))

    // Machine status
    const machineStatus = [
        { status: 'Available', count: 8, color: '#10b981', percentage: 36 },
        { status: 'In Use', count: 12, color: '#3b82f6', percentage: 55 },
        { status: 'Maintenance', count: 2, color: '#ef4444', percentage: 9 }
    ]

    // Top services
    const topServices = [
        { name: 'Wash & Dry', orders: 142, revenue: '14.2M VND', percentage: 100 },
        { name: 'Express Wash', orders: 98, revenue: '12.3M VND', percentage: 69 },
        { name: 'Dry Only', orders: 76, revenue: '5.7M VND', percentage: 53 },
        { name: 'Wash & Iron', orders: 64, revenue: '9.6M VND', percentage: 45 },
        { name: 'Wash & Fold', orders: 52, revenue: '6.2M VND', percentage: 37 }
    ]

    // Supplies status
    const supplies = [
        { name: 'Professional Detergent', current: 65, max: 100, unit: 'kg', color: '#719fc2' },
        { name: 'Fabric Softener', current: 12, max: 50, unit: 'L', color: '#10b981' },
        { name: 'Stain Remover', current: 8, max: 30, unit: 'L', color: '#ef4444' },
        { name: 'Bleach', current: 22, max: 40, unit: 'L', color: '#f59e0b' }
    ]

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return '#10b981'
            case 'Washing': return '#3b82f6'
            case 'Drying': return '#f59e0b'
            case 'Pending': return '#6b7280'
            default: return '#6b7280'
        }
    }

    return (
        <div className="shop-overview">
            <div className="shop-overview-header">
                <div>
                    <h1 className="shop-overview-title">Dashboard Overview</h1>
                    <p className="shop-overview-subtitle">Real-time business insights and performance metrics</p>
                </div>
                <div className="shop-overview-date">
                    <ClockCircleOutlined style={{ marginRight: '8px' }} />
                    {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="shop-overview-stats">
                {stats.map((stat, index) => {
                    const IconComponent = stat.icon
                    return (
                        <div key={index} className="shop-overview-stat-card">
                            <div className="shop-overview-stat-icon" style={{ background: stat.color }}>
                                <IconComponent style={{ fontSize: '24px', color: 'white' }} />
                            </div>
                            <div className="shop-overview-stat-content">
                                <div className="shop-overview-stat-label">{stat.label}</div>
                                <div className="shop-overview-stat-value">{stat.value}</div>
                                <div className={`shop-overview-stat-change ${stat.trend}`}>
                                    {stat.change}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Main Content Grid */}
            <div className="shop-overview-grid">
                {/* Peak Hours Chart */}
                <div className="shop-overview-card shop-overview-peak-hours">
                    <div className="shop-overview-card-header">
                        <h2 className="shop-overview-card-title">Today's Peak Hours</h2>
                        <span className="shop-overview-card-badge">Live</span>
                    </div>
                    <div className="shop-overview-chart">
                        <div className="shop-overview-chart-bars">
                            {peakHoursData.map((data, index) => (
                                <div key={index} className="shop-overview-chart-bar-wrapper">
                                    <div
                                        className="shop-overview-chart-bar"
                                        style={{ height: `${(data.orders / maxOrders) * 100}%` }}
                                        title={`${data.hour}: ${data.orders} orders`}
                                    />
                                    <div className="shop-overview-chart-label">{data.hour}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="shop-overview-card shop-overview-recent-orders">
                    <div className="shop-overview-card-header">
                        <h2 className="shop-overview-card-title">Recent Orders</h2>
                        <button className="shop-overview-view-all">View All</button>
                    </div>
                    <div className="shop-overview-orders-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Service</th>
                                    <th>Status</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order, index) => (
                                    <tr key={index}>
                                        <td className="order-id">{order.id}</td>
                                        <td>{order.customer}</td>
                                        <td>{order.service}</td>
                                        <td>
                                            <span
                                                className="order-status-badge"
                                                style={{
                                                    background: `${getStatusColor(order.status)}20`,
                                                    color: getStatusColor(order.status)
                                                }}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="order-time">{order.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Machine Status */}
                <div className="shop-overview-card shop-overview-machines">
                    <div className="shop-overview-card-header">
                        <h2 className="shop-overview-card-title">Machine Status</h2>
                        <span className="shop-overview-total-machines">22 Total</span>
                    </div>
                    <div className="shop-overview-machine-list">
                        {machineStatus.map((machine, index) => (
                            <div key={index} className="shop-overview-machine-item">
                                <div className="shop-overview-machine-info">
                                    <span
                                        className="shop-overview-machine-dot"
                                        style={{ background: machine.color }}
                                    />
                                    <span className="shop-overview-machine-label">{machine.status}</span>
                                </div>
                                <div className="shop-overview-machine-stats">
                                    <span className="shop-overview-machine-count">{machine.count}</span>
                                    <span className="shop-overview-machine-percentage">({machine.percentage}%)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="shop-overview-machine-chart">
                        {machineStatus.map((machine, index) => (
                            <div
                                key={index}
                                className="shop-overview-machine-bar"
                                style={{
                                    width: `${machine.percentage}%`,
                                    background: machine.color
                                }}
                                title={`${machine.status}: ${machine.count} machines`}
                            />
                        ))}
                    </div>
                </div>

                {/* Top Services */}
                <div className="shop-overview-card shop-overview-top-services">
                    <div className="shop-overview-card-header">
                        <h2 className="shop-overview-card-title">Top Services</h2>
                        <span className="shop-overview-card-badge">This Month</span>
                    </div>
                    <div className="shop-overview-services-list">
                        {topServices.map((service, index) => (
                            <div key={index} className="shop-overview-service-item">
                                <div className="shop-overview-service-rank">{index + 1}</div>
                                <div className="shop-overview-service-details">
                                    <div className="shop-overview-service-name">{service.name}</div>
                                    <div className="shop-overview-service-stats">
                                        {service.orders} orders • {service.revenue}
                                    </div>
                                    <div className="shop-overview-service-bar">
                                        <div
                                            className="shop-overview-service-fill"
                                            style={{ width: `${service.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Supplies Inventory */}
                <div className="shop-overview-card shop-overview-supplies">
                    <div className="shop-overview-card-header">
                        <h2 className="shop-overview-card-title">Supplies Inventory</h2>
                        <button className="shop-overview-view-all">Manage</button>
                    </div>
                    <div className="shop-overview-supplies-list">
                        {supplies.map((supply, index) => {
                            const percentage = (supply.current / supply.max) * 100
                            const isLow = percentage < 30
                            return (
                                <div key={index} className="shop-overview-supply-item">
                                    <div className="shop-overview-supply-header">
                                        <span className="shop-overview-supply-name">{supply.name}</span>
                                        <span className={`shop-overview-supply-amount ${isLow ? 'low' : ''}`}>
                                            {supply.current}/{supply.max} {supply.unit}
                                        </span>
                                    </div>
                                    <div className="shop-overview-supply-bar-container">
                                        <div
                                            className={`shop-overview-supply-bar ${isLow ? 'low' : ''}`}
                                            style={{
                                                width: `${percentage}%`,
                                                background: isLow ? '#ef4444' : supply.color
                                            }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShopOverview
