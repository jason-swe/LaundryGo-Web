import { useState } from 'react'
import './ShopOverview.css'
import {
    DollarOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    ClockCircleOutlined,
    RiseOutlined,
    TrophyOutlined,
    CloseOutlined
} from '@ant-design/icons'
import { statistics, orders, machines, supplies as suppliesData } from '../../data'

function ShopOverview() {
    const [showAllOrders, setShowAllOrders] = useState(false)
    // Import data from statistics.json
    const overview = statistics.overview

    const stats = [
        {
            label: 'Today Revenue',
            value: overview.todayRevenue,
            change: overview.revenueChange,
            trend: overview.revenueChangeTrend,
            icon: DollarOutlined,
            color: '#10b981'
        },
        {
            label: 'Total Orders',
            value: overview.totalOrders.toString(),
            change: overview.ordersChange,
            trend: overview.ordersTrend,
            icon: ShoppingCartOutlined,
            color: '#3b82f6'
        },
        {
            label: 'Active Customers',
            value: overview.activeCustomers.toString(),
            change: overview.customersChange,
            trend: overview.customersTrend,
            icon: UserOutlined,
            color: '#f59e0b'
        },
        {
            label: 'Avg. Order Time',
            value: overview.avgOrderTime,
            change: overview.timeChange,
            trend: overview.timeTrend,
            icon: ClockCircleOutlined,
            color: '#8b5cf6'
        },
        {
            label: 'Monthly Revenue',
            value: overview.monthlyRevenue,
            change: overview.monthlyChange,
            trend: overview.monthlyTrend,
            icon: RiseOutlined,
            color: '#ec4899'
        },
        {
            label: 'Customer Rating',
            value: `${overview.customerRating}/5.0`,
            change: `${overview.totalReviews.toLocaleString()} reviews`,
            trend: overview.ratingTrend,
            icon: TrophyOutlined,
            color: '#f97316'
        }
    ]

    // Recent orders - get top 5 most recent
    const recentOrders = orders
        .slice(0, 5)
        .map(order => ({
            id: order.id,
            customer: order.customer,
            service: order.service,
            status: order.status === 'pending-checkin' ? 'Pending' :
                order.status === 'washing' ? 'Washing' :
                    order.status === 'drying' ? 'Drying' :
                        order.status === 'ready' ? 'Ready' : 'Completed',
            time: order.pickupTime.split(' ')[1] || order.pickupTime
        }))

    // Peak hours data
    const peakHoursData = statistics.peakHours

    const maxOrders = Math.max(...peakHoursData.map(d => d.orders))

    // Machine status - calculate from machines data
    const machinesAvailable = machines.filter(m => m.status === 'empty').length
    const machinesInUse = machines.filter(m => m.status === 'washing' || m.status === 'drying').length
    const machinesMaintenance = machines.filter(m => m.status === 'maintenance').length
    const totalMachines = machines.length

    const machineStatus = [
        { status: 'Available', count: machinesAvailable, color: '#10b981', percentage: Math.round((machinesAvailable / totalMachines) * 100) },
        { status: 'In Use', count: machinesInUse, color: '#cbd5e1', percentage: Math.round((machinesInUse / totalMachines) * 100) },
        { status: 'Maintenance', count: machinesMaintenance, color: '#ef4444', percentage: Math.round((machinesMaintenance / totalMachines) * 100) }
    ]

    // Top services
    const topServices = statistics.topServices.map((service, index, arr) => ({
        name: service.name,
        orders: service.orders,
        revenue: `${(service.revenue / 1000000).toFixed(1)}M VND`,
        percentage: arr[0] ? Math.round((service.orders / arr[0].orders) * 100) : 100
    }))

    // Supplies status - map from supplies data
    const supplies = suppliesData.slice(0, 6).map(supply => ({
        name: supply.name,
        current: supply.current,
        max: supply.max,
        unit: supply.unit,
        color: supply.current <= supply.reorderPoint ? '#ef4444' :
            supply.current < supply.max * 0.3 ? '#f59e0b' :
                supply.current < supply.max * 0.7 ? '#10b981' : '#719fc2'
    }))

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
                        <button className="shop-overview-view-all" onClick={() => setShowAllOrders(true)}>View All</button>
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
                        <span className="shop-overview-total-machines">{totalMachines} Total</span>
                    </div>

                    {/* Machine Status Cards */}
                    <div className="shop-overview-machine-cards">
                        <div className="shop-overview-machine-status-card available">
                            <div className="machine-card-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="machine-card-number">{machinesAvailable}</div>
                            <div className="machine-card-label">Available</div>
                            <div className="machine-card-percentage">{Math.round((machinesAvailable / totalMachines) * 100)}% ready</div>
                        </div>

                        <div className="shop-overview-machine-status-card in-use">
                            <div className="machine-card-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div className="machine-card-number">{machinesInUse}</div>
                            <div className="machine-card-label">In Use</div>
                            <div className="machine-card-percentage">{Math.round((machinesInUse / totalMachines) * 100)}% running</div>
                        </div>

                        <div className="shop-overview-machine-status-card maintenance">
                            <div className="machine-card-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="machine-card-number">{machinesMaintenance}</div>
                            <div className="machine-card-label">Maintenance</div>
                            <div className="machine-card-percentage">{Math.round((machinesMaintenance / totalMachines) * 100)}% offline</div>
                        </div>
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

            {/* All Orders Modal */}
            {showAllOrders && (
                <div className="shop-overview-modal-overlay" onClick={() => setShowAllOrders(false)}>
                    <div className="shop-overview-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="shop-overview-modal-header">
                            <h2>All Recent Orders</h2>
                            <button className="shop-overview-modal-close" onClick={() => setShowAllOrders(false)}>
                                <CloseOutlined />
                            </button>
                        </div>
                        <div className="shop-overview-modal-content">
                            <div className="shop-overview-orders-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Phone</th>
                                            <th>Service</th>
                                            <th>Status</th>
                                            <th>Pickup Time</th>
                                            <th>Payment</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order, index) => (
                                            <tr key={index}>
                                                <td className="order-id">{order.id}</td>
                                                <td>{order.customer}</td>
                                                <td>{order.phone}</td>
                                                <td>{order.service}</td>
                                                <td>
                                                    <span
                                                        className="order-status-badge"
                                                        style={{
                                                            background: `${getStatusColor(
                                                                order.status === 'pending-checkin' ? 'Pending' :
                                                                    order.status === 'washing' ? 'Washing' :
                                                                        order.status === 'drying' ? 'Drying' :
                                                                            order.status === 'ready' ? 'Ready' : 'Completed'
                                                            )}20`,
                                                            color: getStatusColor(
                                                                order.status === 'pending-checkin' ? 'Pending' :
                                                                    order.status === 'washing' ? 'Washing' :
                                                                        order.status === 'drying' ? 'Drying' :
                                                                            order.status === 'ready' ? 'Ready' : 'Completed'
                                                            )
                                                        }}
                                                    >
                                                        {order.status === 'pending-checkin' ? 'Pending' :
                                                            order.status === 'washing' ? 'Washing' :
                                                                order.status === 'drying' ? 'Drying' :
                                                                    order.status === 'ready' ? 'Ready' : 'Completed'}
                                                    </span>
                                                </td>
                                                <td className="order-time">{order.pickupTime}</td>
                                                <td>
                                                    <span className={`payment-status ${order.paymentStatus}`}>
                                                        {order.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ShopOverview
