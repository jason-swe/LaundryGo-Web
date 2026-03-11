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
import {
    financeConfig as configData,
    shopRevenue as shopRevenueData,
    platformRevenueTrend,
    pendingPayouts as pendingPayoutsData
} from '../../data'
import toast from '../../utils/toast'

function AdminFinanceManagement() {
    const [activeTab, setActiveTab] = useState('overview')
    const [showConfigModal, setShowConfigModal] = useState(false)
    const [shopRevenue, setShopRevenue] = useState(shopRevenueData)
    const [currentConfig, setCurrentConfig] = useState({
        platformCommission: configData.platformCommission || 15,
        subscriptionFee: configData.subscriptionFeeBasic || 500000,
        shipperShare: configData.shipperSharePercent || 18,
        deliveryBaseFee: configData.deliveryBaseFee || 15000,
        deliveryPerKm: configData.deliveryPerKm || 3000
    })
    const [editConfig, setEditConfig] = useState({
        platformCommission: configData.platformCommission || 15,
        subscriptionFee: configData.subscriptionFeeBasic || 500000,
        shipperShare: configData.shipperSharePercent || 18,
        deliveryBaseFee: configData.deliveryBaseFee || 15000,
        deliveryPerKm: configData.deliveryPerKm || 3000
    })
    const [pendingPayouts, setPendingPayouts] = useState(pendingPayoutsData)

    const stats = [
        { label: 'Gross Merchandise Value (GMV)', value: '2,845M VND', change: '+18% vs last month', icon: DollarOutlined, color: '#719FC2' },
        { label: 'Platform Revenue (Net)', value: '426.7M VND', change: currentConfig.platformCommission + '% commission rate', icon: DollarOutlined, color: '#4d9e84' },
        { label: 'Shop Earnings', value: '2,276M VND', change: '80% of GMV', icon: ShopOutlined, color: '#719FC2' },
        { label: 'Shipper Earnings', value: '142.3M VND', change: '5% of GMV', icon: CarOutlined, color: '#5492b4' }
    ]

    const transactions = [
        { id: '#TXN-10234', type: 'commission', shop: 'FPT Laundry Shop', amount: '18.7M', date: '2024-02-27 14:30', status: 'completed', method: 'Bank Transfer' },
        { id: '#TXN-10233', type: 'subscription', shop: 'Clean & Fresh', amount: '500K', date: '2024-02-27 12:15', status: 'completed', method: 'Auto-debit' },
        { id: '#TXN-10232', type: 'shipper_payout', shop: 'N/A', shipper: 'Driver #1245', amount: '2.4M', date: '2024-02-27 10:00', status: 'pending', method: 'E-wallet' },
        { id: '#TXN-10231', type: 'commission', shop: 'Express Wash', amount: '14.5M', date: '2024-02-26 16:45', status: 'completed', method: 'Bank Transfer' }
    ]

    const latePayments = pendingPayouts.filter(p => p.status === 'overdue' || new Date(p.dueDate) < new Date())

    const trend6m = platformRevenueTrend['6months'] || []
    const revenueData = trend6m.map(d => ({
        month: d.label,
        gmv: d.revenue * 7,
        netRevenue: d.net * 7,
        shopEarnings: d.revenue * 5.5,
        shipperEarnings: d.revenue * 0.4
    }))
    const maxValue = revenueData.length > 0 ? Math.max(...revenueData.map(d => d.gmv)) : 1000

    const handleProcessPayout = (payoutId) => {
        setPendingPayouts(prev => prev.map(p => p.id === payoutId
            ? { ...p, status: 'paid', paidDate: new Date().toISOString().split('T')[0] } : p))
        toast.success('Payout processed successfully!')
    }

    const handleSaveConfig = () => {
        setCurrentConfig({ ...editConfig })
        setShowConfigModal(false)
        toast.success('Financial configuration updated!')
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
            case 'completed':
                return '#4d9e84'
            case 'pending':
                return '#5492b4'
            case 'overdue':
                return '#c05a50'
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
                                                <ShopOutlined style={{ marginRight: 8, color: '#719FC2' }} />
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
                                        background: txn.type === 'commission' ? '#719FC215' :
                                            txn.type === 'subscription' ? '#719FC215' : '#5492b415',
                                        color: txn.type === 'commission' ? '#719FC2' :
                                            txn.type === 'subscription' ? '#719FC2' : '#5492b4'
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
                                        <div className="shop-name">{payment.recipientName}</div>
                                        <div className="order-id">Period: {payment.period}</div>
                                    </div>
                                    <div className="late-payment-amount">{payment.amount}</div>
                                </div>
                                <div className="late-payment-details">
                                    <div>Due Date: <strong>{payment.dueDate}</strong></div>
                                    <div className="overdue-badge">
                                        {Math.max(0, Math.floor((Date.now() - new Date(payment.dueDate)) / 86400000))} days overdue
                                    </div>
                                    <div>Type: {payment.recipientType === 'shop' ? 'Shop Payout' : 'Shipper Payout'}</div>
                                </div>
                                <div className="late-payment-actions">
                                    <button className="btn-remind">Send Reminder</button>
                                    {payment.status !== 'paid' && (
                                        <button className="btn-resolve" onClick={() => handleProcessPayout(payment.id)}>Process Payout</button>
                                    )}
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
                                <input type="number" value={editConfig.platformCommission} onChange={e => setEditConfig(prev => ({ ...prev, platformCommission: Number(e.target.value) }))} />
                                <p className="config-note">Percentage taken from each transaction</p>
                            </div>
                            <div className="config-section">
                                <label>Monthly Subscription Fee (VND)</label>
                                <input type="number" value={editConfig.subscriptionFee} onChange={e => setEditConfig(prev => ({ ...prev, subscriptionFee: Number(e.target.value) }))} />
                                <p className="config-note">Fixed monthly fee for partner shops</p>
                            </div>
                            <div className="config-section">
                                <label>Shipper Share of Delivery Fee (%)</label>
                                <input type="number" value={editConfig.shipperShare} onChange={e => setEditConfig(prev => ({ ...prev, shipperShare: Number(e.target.value) }))} />
                                <p className="config-note">Percentage of delivery fee paid to shipper</p>
                            </div>
                            <div className="config-section">
                                <label>Base Delivery Fee (VND)</label>
                                <input type="number" value={editConfig.deliveryBaseFee} onChange={e => setEditConfig(prev => ({ ...prev, deliveryBaseFee: Number(e.target.value) }))} />
                                <p className="config-note">Minimum delivery charge</p>
                            </div>
                            <div className="config-section">
                                <label>Delivery Fee per Km (VND)</label>
                                <input type="number" value={editConfig.deliveryPerKm} onChange={e => setEditConfig(prev => ({ ...prev, deliveryPerKm: Number(e.target.value) }))} />
                                <p className="config-note">Additional charge per kilometer</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowConfigModal(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleSaveConfig}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminFinanceManagement