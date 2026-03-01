import { useState } from 'react'
import './AdminFinanceManagement.css'
import {
    DollarOutlined,
    PercentageOutlined,
    ShopOutlined,
    CarOutlined,
    SettingOutlined,
    LineChartOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    WarningOutlined
} from '@ant-design/icons'

function AdminFinanceManagement() {
    const [activeTab, setActiveTab] = useState('overview')
    const [showConfigModal, setShowConfigModal] = useState(false)

    // Financial statistics
    const stats = [
        {
            label: 'Gross Merchandise Value (GMV)',
            value: '2,845M VND',
            change: '+18% vs last month',
            icon: DollarOutlined,
            color: '#3b82f6'
        },
        {
            label: 'Platform Revenue (Net)',
            value: '426.7M VND',
            change: '15% commission rate',
            icon: DollarOutlined,
            color: '#10b981'
        },
        {
            label: 'Shop Earnings',
            value: '2,276M VND',
            change: '80% of GMV',
            icon: ShopOutlined,
            color: '#8b5cf6'
        },
        {
            label: 'Shipper Earnings',
            value: '142.3M VND',
            change: '5% of GMV',
            icon: CarOutlined,
            color: '#f59e0b'
        }
    ]

    // Current configuration
    const currentConfig = {
        platformCommission: 15, // %
        subscriptionFee: 500000, // VND per month
        shipperShare: 18, // % of delivery fee
        deliveryBaseFee: 15000, // VND
        deliveryPerKm: 3000 // VND
    }

    // Revenue by shop
    const shopRevenue = [
        {
            id: 1,
            shopName: 'FPT Laundry Shop',
            totalOrders: 1245,
            gmv: '124.5M',
            commission: '18.7M',
            shopEarnings: '105.8M',
            shipperCosts: '6.2M',
            status: 'paid'
        },
        {
            id: 2,
            shopName: 'Clean & Fresh',
            totalOrders: 1089,
            gmv: '108.9M',
            commission: '16.3M',
            shopEarnings: '92.6M',
            shipperCosts: '5.4M',
            status: 'paid'
        },
        {
            id: 3,
            shopName: 'Express Wash',
            totalOrders: 967,
            gmv: '96.7M',
            commission: '14.5M',
            shopEarnings: '82.2M',
            shipperCosts: '4.9M',
            status: 'pending'
        },
        {
            id: 4,
            shopName: 'LaundryPro',
            totalOrders: 834,
            gmv: '83.4M',
            commission: '12.5M',
            shopEarnings: '70.9M',
            shipperCosts: '4.2M',
            status: 'pending'
        }
    ]

    // Transactions
    const transactions = [
        {
            id: '#TXN-10234',
            type: 'commission',
            shop: 'FPT Laundry Shop',
            amount: '18.7M',
            date: '2024-02-27 14:30',
            status: 'completed',
            method: 'Bank Transfer'
        },
        {
            id: '#TXN-10233',
            type: 'subscription',
            shop: 'Clean & Fresh',
            amount: '500K',
            date: '2024-02-27 12:15',
            status: 'completed',
            method: 'Auto-debit'
        },
        {
            id: '#TXN-10232',
            type: 'shipper_payout',
            shop: 'N/A',
            shipper: 'Driver #1245',
            amount: '2.4M',
            date: '2024-02-27 10:00',
            status: 'pending',
            method: 'E-wallet'
        },
        {
            id: '#TXN-10231',
            type: 'commission',
            shop: 'Express Wash',
            amount: '14.5M',
            date: '2024-02-26 16:45',
            status: 'completed',
            method: 'Bank Transfer'
        }
    ]

    // Late payments
    const latePayments = [
        {
            id: 1,
            shop: 'Quick Clean',
            orderId: '#ORD-5234',
            amount: '850K',
            dueDate: '2024-02-20',
            daysOverdue: 7,
            reason: 'Customer dispute'
        },
        {
            id: 2,
            shop: 'Sparkle Laundry',
            orderId: '#ORD-5198',
            amount: '1.2M',
            dueDate: '2024-02-18',
            daysOverdue: 9,
            reason: 'Payment gateway issue'
        }
    ]

    // Revenue chart data
    const revenueData = [
        { month: 'Jan', gmv: 2100, netRevenue: 315, shopEarnings: 1680, shipperEarnings: 105 },
        { month: 'Feb', gmv: 2400, netRevenue: 360, shopEarnings: 1920, shipperEarnings: 120 },
        { month: 'Mar', gmv: 2650, netRevenue: 397, shopEarnings: 2120, shipperEarnings: 133 },
        { month: 'Apr', gmv: 2500, netRevenue: 375, shopEarnings: 2000, shipperEarnings: 125 },
        { month: 'May', gmv: 2800, netRevenue: 420, shopEarnings: 2240, shipperEarnings: 140 },
        { month: 'Jun', gmv: 2845, netRevenue: 427, shopEarnings: 2276, shipperEarnings: 142 }
    ]

    const maxValue = Math.max(...revenueData.map(d => d.gmv))

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
            case 'completed':
                return '#10b981'
            case 'pending':
                return '#f59e0b'
            case 'overdue':
                return '#ef4444'
            default:
                return '#6b7280'
        }
    }

    return (
        <div className="admin-finance-management">
            <div className="admin-finance-header">
                <div>
                    <h1 className="admin-finance-title">Finance Management</h1>
                    <p className="admin-finance-subtitle">Manage commissions, fees, transactions, and financial settings</p>
                </div>
                <button
                    className="admin-finance-config-btn"
                    onClick={() => setShowConfigModal(true)}
                >
                    <SettingOutlined /> Configure Settings
                </button>
            </div>

            {/* Stats Grid */}
            <div className="admin-finance-stats">
                {stats.map((stat, index) => {
                    const IconComponent = stat.icon
                    return (
                        <div key={index} className="admin-finance-stat-card">
                            <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                                <IconComponent style={{ fontSize: '24px' }} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">{stat.label}</div>
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-change">{stat.change}</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Revenue Chart */}
            <div className="admin-finance-card">
                <div className="card-header">
                    <h3><LineChartOutlined /> Revenue Breakdown (Last 6 Months)</h3>
                </div>
                <div className="finance-chart">
                    {revenueData.map((data, index) => (
                        <div key={index} className="chart-bar-group">
                            <div className="chart-bars">
                                <div
                                    className="chart-bar gmv-bar"
                                    style={{ height: `${(data.gmv / maxValue) * 200}px` }}
                                    title={`GMV: ${data.gmv}M`}
                                />
                                <div
                                    className="chart-bar net-bar"
                                    style={{ height: `${(data.netRevenue / maxValue) * 200}px` }}
                                    title={`Net Revenue: ${data.netRevenue}M`}
                                />
                                <div
                                    className="chart-bar shop-bar"
                                    style={{ height: `${(data.shopEarnings / maxValue) * 200}px` }}
                                    title={`Shop Earnings: ${data.shopEarnings}M`}
                                />
                                <div
                                    className="chart-bar shipper-bar"
                                    style={{ height: `${(data.shipperEarnings / maxValue) * 200}px` }}
                                    title={`Shipper: ${data.shipperEarnings}M`}
                                />
                            </div>
                            <div className="chart-label">{data.month}</div>
                        </div>
                    ))}
                </div>
                <div className="chart-legend">
                    <div className="legend-item">
                        <span className="legend-color gmv-color"></span> GMV
                    </div>
                    <div className="legend-item">
                        <span className="legend-color net-color"></span> Platform Revenue
                    </div>
                    <div className="legend-item">
                        <span className="legend-color shop-color"></span> Shop Earnings
                    </div>
                    <div className="legend-item">
                        <span className="legend-color shipper-color"></span> Shipper Earnings
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="admin-finance-tabs">
                <button
                    className={`admin-finance-tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <DollarOutlined /> Shop Revenue ({shopRevenue.length})
                </button>
                <button
                    className={`admin-finance-tab ${activeTab === 'transactions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('transactions')}
                >
                    <CheckCircleOutlined /> Transactions ({transactions.length})
                </button>
                <button
                    className={`admin-finance-tab ${activeTab === 'late' ? 'active' : ''}`}
                    onClick={() => setActiveTab('late')}
                >
                    <WarningOutlined /> Late Payments ({latePayments.length})
                </button>
            </div>

            {/* Shop Revenue Tab */}
            {activeTab === 'overview' && (
                <div className="admin-finance-card">
                    <div className="admin-finance-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Shop Name</th>
                                    <th>Orders</th>
                                    <th>GMV</th>
                                    <th>Commission (15%)</th>
                                    <th>Shop Earnings</th>
                                    <th>Shipper Costs</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shopRevenue.map(shop => (
                                    <tr key={shop.id}>
                                        <td>
                                            <div className="shop-name">
                                                <ShopOutlined style={{ marginRight: 8, color: '#3b82f6' }} />
                                                {shop.shopName}
                                            </div>
                                        </td>
                                        <td>{shop.totalOrders}</td>
                                        <td>
                                            <div className="amount-gmv">{shop.gmv}</div>
                                        </td>
                                        <td>
                                            <div className="amount-commission">{shop.commission}</div>
                                        </td>
                                        <td>
                                            <div className="amount-shop">{shop.shopEarnings}</div>
                                        </td>
                                        <td>
                                            <div className="amount-shipper">{shop.shipperCosts}</div>
                                        </td>
                                        <td>
                                            <span
                                                className="status-badge"
                                                style={{ color: getStatusColor(shop.status) }}
                                            >
                                                ● {shop.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="action-btn">View Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
                <div className="admin-finance-card">
                    <div className="finance-transactions">
                        {transactions.map(txn => (
                            <div key={txn.id} className="transaction-item">
                                <div className="txn-left">
                                    <div className="txn-type-icon" style={{
                                        background: txn.type === 'commission' ? '#3b82f615' :
                                            txn.type === 'subscription' ? '#8b5cf615' : '#f59e0b15',
                                        color: txn.type === 'commission' ? '#3b82f6' :
                                            txn.type === 'subscription' ? '#8b5cf6' : '#f59e0b'
                                    }}>
                                        <DollarOutlined />
                                    </div>
                                    <div className="txn-details">
                                        <div className="txn-id">{txn.id}</div>
                                        <div className="txn-meta">
                                            <span className="txn-type-badge">{txn.type.replace('_', ' ')}</span>
                                            <span>{txn.shop}{txn.shipper && ` - ${txn.shipper}`}</span>
                                            <span>{txn.date}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="txn-right">
                                    <div className="txn-amount">{txn.amount}</div>
                                    <div className="txn-method">{txn.method}</div>
                                    <span
                                        className={`txn-status status-${txn.status}`}
                                        style={{ color: getStatusColor(txn.status) }}
                                    >
                                        {txn.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Late Payments Tab */}
            {activeTab === 'late' && (
                <div className="admin-finance-card">
                    <div className="late-payments">
                        {latePayments.map(payment => (
                            <div key={payment.id} className="late-payment-item">
                                <div className="late-payment-header">
                                    <WarningOutlined className="warning-icon" />
                                    <div className="late-payment-info">
                                        <div className="shop-name">{payment.shop}</div>
                                        <div className="order-id">Order: {payment.orderId}</div>
                                    </div>
                                    <div className="late-payment-amount">{payment.amount}</div>
                                </div>
                                <div className="late-payment-details">
                                    <div>Due Date: <strong>{payment.dueDate}</strong></div>
                                    <div className="overdue-badge">{payment.daysOverdue} days overdue</div>
                                    <div>Reason: {payment.reason}</div>
                                </div>
                                <div className="late-payment-actions">
                                    <button className="btn-remind">Send Reminder</button>
                                    <button className="btn-resolve">Mark Resolved</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Configuration Modal */}
            {showConfigModal && (
                <div className="config-modal-overlay" onClick={() => setShowConfigModal(false)}>
                    <div className="config-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><SettingOutlined /> Financial Configuration</h2>
                            <button className="modal-close" onClick={() => setShowConfigModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="config-section">
                                <label>Platform Commission Rate (%)</label>
                                <input type="number" value={currentConfig.platformCommission} />
                                <p className="config-note">Percentage taken from each transaction</p>
                            </div>
                            <div className="config-section">
                                <label>Monthly Subscription Fee (VND)</label>
                                <input type="number" value={currentConfig.subscriptionFee} />
                                <p className="config-note">Fixed monthly fee for partner shops</p>
                            </div>
                            <div className="config-section">
                                <label>Shipper Share of Delivery Fee (%)</label>
                                <input type="number" value={currentConfig.shipperShare} />
                                <p className="config-note">Percentage of delivery fee paid to shipper</p>
                            </div>
                            <div className="config-section">
                                <label>Base Delivery Fee (VND)</label>
                                <input type="number" value={currentConfig.deliveryBaseFee} />
                                <p className="config-note">Minimum delivery charge</p>
                            </div>
                            <div className="config-section">
                                <label>Delivery Fee per Km (VND)</label>
                                <input type="number" value={currentConfig.deliveryPerKm} />
                                <p className="config-note">Additional charge per kilometer</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowConfigModal(false)}>Cancel</button>
                            <button className="btn-save">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminFinanceManagement
