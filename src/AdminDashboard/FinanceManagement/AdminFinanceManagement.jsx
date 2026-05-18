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
import { useTranslation } from '../../shared/lib/i18n'

function AdminFinanceManagement() {
    const { t } = useTranslation()
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
        { labelKey: 'gmv', value: '2,845M VND', changePrefix: '+18% ', changeKey: 'vsLastMonth', icon: DollarOutlined, color: '#719FC2' },
        { labelKey: 'platformRevenueNet', value: '426.7M VND', changePrefix: `${currentConfig.platformCommission}% `, changeKey: 'commissionRate', icon: DollarOutlined, color: '#4d9e84' },
        { labelKey: 'shopEarnings', value: '2,276M VND', changePrefix: '80% ', changeKey: 'ofGmv', icon: ShopOutlined, color: '#719FC2' },
        { labelKey: 'shipperEarnings', value: '142.3M VND', changePrefix: '5% ', changeKey: 'ofGmv', icon: CarOutlined, color: '#5492b4' }
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
        toast.success(t('admin.financeManagement.toasts.payoutProcessed'))
    }

    const handleSaveConfig = () => {
        setCurrentConfig({ ...editConfig })
        setShowConfigModal(false)
        toast.success(t('admin.financeManagement.toasts.configUpdated'))
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
    const getStatusLabel = (status) => t(`admin.financeManagement.status.${status}`)
    const getTransactionTypeLabel = (type) => t(`admin.financeManagement.transactionType.${type}`)
    const getPaymentMethodLabel = (method) => t(`admin.financeManagement.paymentMethod.${method}`)
    const getMonthLabel = (month) => t(`admin.overview.chartLabels.${String(month).toLowerCase()}`)
    const getPayoutTypeLabel = (type) => t(`admin.financeManagement.payoutType.${type}`)

    return (
        <div className="admin-finance-management">
            <div className="admin-finance-header">
                <div>
                    <h1 className="admin-finance-title">{t('admin.financeManagement.title')}</h1>
                    <p className="admin-finance-subtitle">{t('admin.financeManagement.subtitle')}</p>
                </div>
                <button
                    className="admin-finance-config-btn"
                    onClick={() => setShowConfigModal(true)}
                >
                    <SettingOutlined /> {t('admin.financeManagement.configureSettings')}
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
                                <div className="stat-label">{t(`admin.financeManagement.stats.${stat.labelKey}`)}</div>
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-change">{stat.changePrefix || ''}{t(`admin.financeManagement.stats.${stat.changeKey}`)}</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Revenue Chart */}
            <div className="admin-finance-card">
                <div className="card-header">
                    <h3><LineChartOutlined /> {t('admin.financeManagement.revenueBreakdown')}</h3>
                </div>
                <div className="finance-chart">
                    {revenueData.map((data, index) => (
                        <div key={index} className="chart-bar-group">
                            <div className="chart-bars">
                                <div
                                    className="chart-bar gmv-bar"
                                    style={{ height: `${(data.gmv / maxValue) * 200}px` }}
                                    title={`${t('admin.financeManagement.stats.gmv')}: ${data.gmv}M`}
                                />
                                <div
                                    className="chart-bar net-bar"
                                    style={{ height: `${(data.netRevenue / maxValue) * 200}px` }}
                                    title={`${t('admin.financeManagement.legend.platformRevenue')}: ${data.netRevenue}M`}
                                />
                                <div
                                    className="chart-bar shop-bar"
                                    style={{ height: `${(data.shopEarnings / maxValue) * 200}px` }}
                                    title={`${t('admin.financeManagement.stats.shopEarnings')}: ${data.shopEarnings}M`}
                                />
                                <div
                                    className="chart-bar shipper-bar"
                                    style={{ height: `${(data.shipperEarnings / maxValue) * 200}px` }}
                                    title={`${t('admin.financeManagement.stats.shipperEarnings')}: ${data.shipperEarnings}M`}
                                />
                            </div>
                            <div className="chart-label">{getMonthLabel(data.month)}</div>
                        </div>
                    ))}
                </div>
                <div className="chart-legend">
                    <div className="legend-item">
                        <span className="legend-color gmv-color"></span> {t('admin.financeManagement.legend.gmv')}
                    </div>
                    <div className="legend-item">
                        <span className="legend-color net-color"></span> {t('admin.financeManagement.legend.platformRevenue')}
                    </div>
                    <div className="legend-item">
                        <span className="legend-color shop-color"></span> {t('admin.financeManagement.stats.shopEarnings')}
                    </div>
                    <div className="legend-item">
                        <span className="legend-color shipper-color"></span> {t('admin.financeManagement.stats.shipperEarnings')}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="admin-finance-tabs">
                <button
                    className={`admin-finance-tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <DollarOutlined /> {t('admin.financeManagement.tabs.shopRevenue')} ({shopRevenue.length})
                </button>
                <button
                    className={`admin-finance-tab ${activeTab === 'transactions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('transactions')}
                >
                    <CheckCircleOutlined /> {t('admin.financeManagement.tabs.transactions')} ({transactions.length})
                </button>
                <button
                    className={`admin-finance-tab ${activeTab === 'late' ? 'active' : ''}`}
                    onClick={() => setActiveTab('late')}
                >
                    <WarningOutlined /> {t('admin.financeManagement.tabs.latePayments')} ({latePayments.length})
                </button>
            </div>

            {/* Shop Revenue Tab */}
            {activeTab === 'overview' && (
                <div className="admin-finance-card">
                    <div className="admin-finance-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('admin.shopManagement.table.shopName')}</th>
                                    <th>{t('dashboard.orders')}</th>
                                    <th>{t('admin.financeManagement.legend.gmv')}</th>
                                    <th>{t('admin.financeManagement.table.commission15')}</th>
                                    <th>{t('admin.financeManagement.stats.shopEarnings')}</th>
                                    <th>{t('admin.financeManagement.table.shipperCosts')}</th>
                                    <th>{t('shop.incidents.detail.status')}</th>
                                    <th>{t('admin.shopManagement.table.actions')}</th>
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
                                                ● {getStatusLabel(shop.status)}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="action-btn">{t('admin.customerManagement.viewDetails')}</button>
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
                                            <span className="txn-type-badge">{getTransactionTypeLabel(txn.type)}</span>
                                            <span>{txn.shop}{txn.shipper && ` - ${txn.shipper}`}</span>
                                            <span>{txn.date}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="txn-right">
                                    <div className="txn-amount">{txn.amount}</div>
                                    <div className="txn-method">{getPaymentMethodLabel(txn.method)}</div>
                                    <span
                                        className={`txn-status status-${txn.status}`}
                                        style={{ color: getStatusColor(txn.status) }}
                                    >
                                        {getStatusLabel(txn.status)}
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
                                        <div className="order-id">{t('admin.shipperManagement.table.period')}: {payment.period}</div>
                                    </div>
                                    <div className="late-payment-amount">{payment.amount}</div>
                                </div>
                                <div className="late-payment-details">
                                    <div>{t('admin.financeManagement.dueDate')}: <strong>{payment.dueDate}</strong></div>
                                    <div className="overdue-badge">
                                        {Math.max(0, Math.floor((Date.now() - new Date(payment.dueDate)) / 86400000))} {t('admin.financeManagement.daysOverdue')}
                                    </div>
                                    <div>{t('shop.documents.detail.type')}: {getPayoutTypeLabel(payment.recipientType)}</div>
                                </div>
                                <div className="late-payment-actions">
                                    <button className="btn-remind">{t('admin.financeManagement.sendReminder')}</button>
                                    {payment.status !== 'paid' && (
                                        <button className="btn-resolve" onClick={() => handleProcessPayout(payment.id)}>{t('admin.financeManagement.processPayout')}</button>
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
                            <h2><SettingOutlined /> {t('admin.financeManagement.config.title')}</h2>
                            <button className="modal-close" onClick={() => setShowConfigModal(false)} aria-label={t('common.close')}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="config-section">
                                <label>{t('admin.financeManagement.config.platformCommission')}</label>
                                <input type="number" value={editConfig.platformCommission} onChange={e => setEditConfig(prev => ({ ...prev, platformCommission: Number(e.target.value) }))} />
                                <p className="config-note">{t('admin.financeManagement.config.platformCommissionNote')}</p>
                            </div>
                            <div className="config-section">
                                <label>{t('admin.financeManagement.config.monthlySubscriptionFee')}</label>
                                <input type="number" value={editConfig.subscriptionFee} onChange={e => setEditConfig(prev => ({ ...prev, subscriptionFee: Number(e.target.value) }))} />
                                <p className="config-note">{t('admin.financeManagement.config.monthlySubscriptionFeeNote')}</p>
                            </div>
                            <div className="config-section">
                                <label>{t('admin.financeManagement.config.shipperShare')}</label>
                                <input type="number" value={editConfig.shipperShare} onChange={e => setEditConfig(prev => ({ ...prev, shipperShare: Number(e.target.value) }))} />
                                <p className="config-note">{t('admin.financeManagement.config.shipperShareNote')}</p>
                            </div>
                            <div className="config-section">
                                <label>{t('admin.financeManagement.config.baseDeliveryFee')}</label>
                                <input type="number" value={editConfig.deliveryBaseFee} onChange={e => setEditConfig(prev => ({ ...prev, deliveryBaseFee: Number(e.target.value) }))} />
                                <p className="config-note">{t('admin.financeManagement.config.baseDeliveryFeeNote')}</p>
                            </div>
                            <div className="config-section">
                                <label>{t('admin.financeManagement.config.deliveryFeePerKm')}</label>
                                <input type="number" value={editConfig.deliveryPerKm} onChange={e => setEditConfig(prev => ({ ...prev, deliveryPerKm: Number(e.target.value) }))} />
                                <p className="config-note">{t('admin.financeManagement.config.deliveryFeePerKmNote')}</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowConfigModal(false)}>{t('common.cancel')}</button>
                            <button className="btn-save" onClick={handleSaveConfig}>{t('shop.saveChanges')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminFinanceManagement
