import { createElement, useState } from 'react'
import {
    Banknote,
    CheckCircle,
    CircleDollarSign,
    ClipboardCheck,
    Download,
    Eye,
    FileText,
    Landmark,
    ReceiptText,
    Search,
    Settings,
    ShieldAlert,
    SlidersHorizontal,
    Store,
    Truck,
    X,
} from 'lucide-react'
import './AdminFinanceManagement.css'
import {
    financeConfig as configData,
    pendingPayouts as pendingPayoutsData,
    platformRevenueTrend,
    shopRevenue as shopRevenueData,
} from '../../data'
import toast from '../../utils/toast'
import { useTranslation } from '../../shared/lib/i18n'

const INITIAL_CONFIG = {
    platformCommission: configData.platformCommission || 15,
    subscriptionFee: configData.subscriptionFeeBasic || 300000,
    shipperShare: configData.shipperSharePercent || 18,
    deliveryBaseFee: configData.deliveryBaseFee || 15000,
    deliveryPerKm: configData.deliveryPerKm || 3000,
    taxRate: configData.taxRate || 10,
}

const TRANSACTIONS = [
    { id: '#TXN-10234', type: 'commission', actor: 'FPT Laundry Shop', amountValue: 18700000, amount: '18.7M', date: '2026-06-04 14:30', status: 'completed', method: 'bankTransfer' },
    { id: '#TXN-10233', type: 'subscription', actor: 'Clean & Fresh', amountValue: 500000, amount: '500K', date: '2026-06-04 12:15', status: 'completed', method: 'autoDebit' },
    { id: '#TXN-10232', type: 'shipper_payout', actor: 'SHP-1001', amountValue: 1900000, amount: '1.90M', date: '2026-06-03 10:00', status: 'pending', method: 'eWallet' },
    { id: '#TXN-10231', type: 'commission', actor: 'Express Wash', amountValue: 14500000, amount: '14.5M', date: '2026-06-02 16:45', status: 'completed', method: 'bankTransfer' },
]

const AUDIT_LOG = [
    { id: 'AUD-104', actor: 'Admin Finance', action: 'commissionRate', value: '15%', time: '2026-06-04 09:30' },
    { id: 'AUD-103', actor: 'Admin Finance', action: 'shipperShare', value: '18%', time: '2026-06-02 17:10' },
    { id: 'AUD-102', actor: 'System', action: 'taxRate', value: '10%', time: '2026-06-01 08:00' },
]

function formatVnd(value) {
    return `${Number(value || 0).toLocaleString('vi-VN')} VND`
}

function formatCompact(value) {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)}B`
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${Math.round(value / 1000)}K`
    return String(value || 0)
}

function statusKey(status) {
    return status === 'paid'
        ? 'paid'
        : status === 'completed'
            ? 'completed'
            : status === 'overdue'
                ? 'overdue'
                : 'pending'
}

function typeKey(type) {
    return type === 'shipper_payout'
        ? 'shipperPayout'
        : type === 'subscription'
            ? 'subscription'
            : 'commission'
}

function methodKey(method) {
    return method === 'autoDebit' ? 'autoDebit' : method === 'eWallet' ? 'eWallet' : 'bankTransfer'
}

function AdminFinanceManagement() {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState('shops')
    const [shopRevenue] = useState(shopRevenueData)
    const [pendingPayouts, setPendingPayouts] = useState(pendingPayoutsData)
    const [currentConfig, setCurrentConfig] = useState(INITIAL_CONFIG)
    const [editConfig, setEditConfig] = useState(INITIAL_CONFIG)
    const [showConfigModal, setShowConfigModal] = useState(false)
    const [configErrors, setConfigErrors] = useState({})
    const [selectedShopId, setSelectedShopId] = useState(shopRevenueData[0]?.id || null)
    const [payoutConfirm, setPayoutConfirm] = useState(null)
    const [statementSearch, setStatementSearch] = useState('')
    const [statementStatus, setStatementStatus] = useState('all')
    const [today] = useState(() => new Date('2026-06-05T00:00:00+07:00'))

    const statementQuery = statementSearch.trim().toLowerCase()
    const filteredShopRevenue = shopRevenue.filter(shop => {
        const matchesSearch = !statementQuery
            || shop.shopName.toLowerCase().includes(statementQuery)
            || shop.shopId.toLowerCase().includes(statementQuery)
            || shop.id.toLowerCase().includes(statementQuery)
            || shop.period.toLowerCase().includes(statementQuery)
        const matchesStatus = statementStatus === 'all' || statusKey(shop.status) === statementStatus
        return matchesSearch && matchesStatus
    })
    const selectedShop = shopRevenue.find(shop => shop.id === selectedShopId) || filteredShopRevenue[0] || shopRevenue[0] || null
    const totalGmv = shopRevenue.reduce((sum, shop) => sum + Number(shop.gmvValue || 0), 0)
    const totalCommission = shopRevenue.reduce((sum, shop) => sum + Number(shop.commissionValue || 0), 0)
    const totalShopEarnings = shopRevenue.reduce((sum, shop) => sum + Number(shop.shopEarningsValue || 0), 0)
    const totalShipperCost = shopRevenue.reduce((sum, shop) => sum + Number(shop.shipperCostsValue || 0), 0)
    const pendingAmount = pendingPayouts
        .filter(payout => payout.status !== 'paid')
        .reduce((sum, payout) => sum + Number(payout.amountValue || 0), 0)
    const overduePayouts = pendingPayouts.filter(payout => payout.status !== 'paid' && new Date(payout.dueDate) < today)
    const paidStatements = shopRevenue.filter(shop => statusKey(shop.status) === 'paid').length
    const pendingStatements = shopRevenue.length - paidStatements

    const trendData = platformRevenueTrend['6months'] || []
    const maxTrendValue = trendData.length > 0 ? Math.max(...trendData.map(item => item.revenue)) : 1

    const kpis = [
        { label: t('adminFinance.gmv'), value: formatCompact(totalGmv), meta: t('adminFinance.gmvMeta'), Icon: CircleDollarSign },
        { label: t('adminFinance.platformCommission'), value: formatCompact(totalCommission), meta: `${currentConfig.platformCommission}% ${t('adminFinance.rate')}`, Icon: ReceiptText },
        { label: t('adminFinance.pendingPayable'), value: formatCompact(pendingAmount), meta: `${overduePayouts.length} ${t('adminFinance.overdue')}`, Icon: ShieldAlert },
        { label: t('adminFinance.shopEarnings'), value: formatCompact(totalShopEarnings), meta: t('adminFinance.partnerNet'), Icon: Store },
        { label: t('adminFinance.shipperCost'), value: formatCompact(totalShipperCost), meta: `${currentConfig.shipperShare}% ${t('adminFinance.deliveryShare')}`, Icon: Truck },
    ]

    const tabs = [
        { id: 'shops', label: t('adminFinance.shopRevenue'), count: shopRevenue.length },
        { id: 'payouts', label: t('adminFinance.payoutQueue'), count: pendingPayouts.filter(payout => payout.status !== 'paid').length },
        { id: 'transactions', label: t('adminFinance.transactions'), count: TRANSACTIONS.length },
        { id: 'audit', label: t('adminFinance.auditTrail'), count: AUDIT_LOG.length },
    ]

    const validateConfig = () => {
        const errors = {}
        if (currentConfig.platformCommission !== editConfig.platformCommission && Number(editConfig.platformCommission) > 35) {
            errors.platformCommission = t('adminFinance.commissionTooHigh')
        }
        if (Number(editConfig.platformCommission) < 0) errors.platformCommission = t('adminFinance.nonNegative')
        if (Number(editConfig.subscriptionFee) < 0) errors.subscriptionFee = t('adminFinance.nonNegative')
        if (Number(editConfig.shipperShare) < 0 || Number(editConfig.shipperShare) > 70) errors.shipperShare = t('adminFinance.shipperShareInvalid')
        if (Number(editConfig.deliveryBaseFee) < 0) errors.deliveryBaseFee = t('adminFinance.nonNegative')
        if (Number(editConfig.deliveryPerKm) < 0) errors.deliveryPerKm = t('adminFinance.nonNegative')
        if (Number(editConfig.taxRate) < 0 || Number(editConfig.taxRate) > 20) errors.taxRate = t('adminFinance.taxInvalid')
        setConfigErrors(errors)
        return Object.keys(errors).length === 0
    }

    const openConfig = () => {
        setEditConfig({ ...currentConfig })
        setConfigErrors({})
        setShowConfigModal(true)
    }

    const handleConfigChange = (name, value) => {
        setEditConfig(prev => ({ ...prev, [name]: Number(value) }))
        setConfigErrors(prev => ({ ...prev, [name]: undefined }))
    }

    const handleSaveConfig = () => {
        if (!validateConfig()) return
        setCurrentConfig({ ...editConfig })
        setShowConfigModal(false)
        toast.success(t('adminFinance.configSaved'))
    }

    const requestProcessPayout = (payout) => {
        setPayoutConfirm(payout)
    }

    const confirmProcessPayout = () => {
        if (!payoutConfirm) return
        setPendingPayouts(prev => prev.map(payout => payout.id === payoutConfirm.id
            ? { ...payout, status: 'paid', paidDate: '2026-06-05' }
            : payout
        ))
        toast.success(t('adminFinance.payoutProcessed').replace('{name}', payoutConfirm.recipientName))
        setPayoutConfirm(null)
    }

    const handleExportStatement = () => {
        if (!selectedShop) return
        toast.success(t('adminFinance.statementExported').replace('{name}', selectedShop.shopName))
    }

    const handleReviewStatement = () => {
        if (!selectedShop) return
        toast.success(t('adminFinance.reviewStarted').replace('{name}', selectedShop.shopName))
    }

    const getOverdueDays = (dueDate) => {
        const diff = today.getTime() - new Date(dueDate).getTime()
        return Math.max(0, Math.floor(diff / 86400000))
    }

    return (
        <div className="admin-finance-page">
            <header className="admin-finance-header">
                <div>
                    <span className="admin-finance-eyebrow">{t('adminFinance.eyebrow')}</span>
                    <h1>{t('adminFinance.title')}</h1>
                    <p>{t('adminFinance.subtitle')}</p>
                </div>
                <button type="button" className="admin-finance-primary" onClick={openConfig}>
                    <Settings size={17} strokeWidth={1.9} />{t('adminFinance.configure')}
                </button>
            </header>

            <section className="admin-finance-kpis">
                {kpis.map(({ label, value, meta, Icon }) => (
                    <article className="admin-finance-kpi" key={label}>
                        <span>{createElement(Icon, { size: 18, strokeWidth: 1.9 })}</span>
                        <small>{label}</small>
                        <strong>{value}</strong>
                        <p>{meta}</p>
                    </article>
                ))}
            </section>

            <section className="admin-finance-command-grid">
                <article className="admin-finance-card admin-finance-chart-card">
                    <div className="admin-finance-card-head">
                        <div>
                            <span className="admin-finance-eyebrow">{t('adminFinance.reconciliation')}</span>
                            <h2>{t('adminFinance.revenueBreakdown')}</h2>
                        </div>
                        <div className="admin-finance-legend">
                            <span><i className="gmv" />{t('adminFinance.gmv')}</span>
                            <span><i className="net" />{t('adminFinance.netRevenue')}</span>
                        </div>
                    </div>
                    <div className="admin-finance-chart">
                        {trendData.map(item => (
                            <div className="admin-finance-chart-group" key={item.label}>
                                <div className="admin-finance-chart-bars">
                                    <span className="gmv" style={{ height: `${Math.max(12, (item.revenue / maxTrendValue) * 244)}px` }} title={`${t('adminFinance.gmv')}: ${item.revenue}M`} />
                                    <span className="net" style={{ height: `${Math.max(12, (item.net / maxTrendValue) * 244)}px` }} title={`${t('adminFinance.netRevenue')}: ${item.net}M`} />
                                </div>
                                <strong>{item.revenue}M / {item.net}M</strong>
                                <small>{item.label}</small>
                            </div>
                        ))}
                    </div>
                </article>

                <aside className="admin-finance-card admin-finance-risk">
                    <div className="admin-finance-card-head compact">
                        <div>
                            <span className="admin-finance-eyebrow">{t('adminFinance.attention')}</span>
                            <h2>{t('adminFinance.payoutRisk')}</h2>
                        </div>
                        <span className="admin-finance-risk-count">{overduePayouts.length}</span>
                    </div>
                    <div className="admin-finance-risk-list">
                        {overduePayouts.length === 0 ? (
                            <div className="admin-finance-empty small"><CheckCircle size={22} /><strong>{t('adminFinance.noPayoutRisk')}</strong></div>
                        ) : overduePayouts.slice(0, 3).map(payout => (
                            <button type="button" key={payout.id} onClick={() => { setActiveTab('payouts'); requestProcessPayout(payout) }}>
                                <span>{payout.recipientName}</span>
                                <strong>{payout.amount}</strong>
                                <small>{getOverdueDays(payout.dueDate)} {t('adminFinance.daysOverdue')}</small>
                            </button>
                        ))}
                    </div>
                </aside>
            </section>

            <section className="admin-finance-ledger-focus">
                <article>
                    <span className="admin-finance-eyebrow">{t('adminFinance.ledgerControl')}</span>
                    <h2>{t('adminFinance.tableFirstTitle')}</h2>
                    <p>{t('adminFinance.tableFirstCopy')}</p>
                </article>
                <div className="admin-finance-focus-metrics">
                    <span><strong>{paidStatements}</strong><small>{t('adminFinance.reconciled')}</small></span>
                    <span><strong>{pendingStatements}</strong><small>{t('adminFinance.openStatements')}</small></span>
                    <span><strong>{overduePayouts.length}</strong><small>{t('adminFinance.payoutRisk')}</small></span>
                </div>
            </section>

            <section className="admin-finance-tabs">
                {tabs.map(tab => (
                    <button type="button" className={activeTab === tab.id ? 'active' : ''} key={tab.id} onClick={() => setActiveTab(tab.id)}>
                        {tab.label}
                        <span>{tab.count}</span>
                    </button>
                ))}
            </section>

            {activeTab === 'shops' && (
                <section className="admin-finance-workspace">
                    <article className="admin-finance-card admin-finance-table-card">
                        <div className="admin-finance-card-head">
                            <div>
                                <span className="admin-finance-eyebrow">{t('adminFinance.partnerReconciliation')}</span>
                                <h2>{filteredShopRevenue.length} {t('adminFinance.results')}</h2>
                            </div>
                            <div className="admin-finance-table-tools">
                                <label className="admin-finance-search">
                                    <Search size={17} strokeWidth={1.9} />
                                    <input
                                        type="search"
                                        value={statementSearch}
                                        onChange={event => setStatementSearch(event.target.value)}
                                        placeholder={t('adminFinance.searchPlaceholder')}
                                    />
                                </label>
                                <label className="admin-finance-select">
                                    <SlidersHorizontal size={16} strokeWidth={1.9} />
                                    <select value={statementStatus} onChange={event => setStatementStatus(event.target.value)}>
                                        <option value="all">{t('adminFinance.allStatuses')}</option>
                                        <option value="paid">{t('adminFinance.statuspaid')}</option>
                                        <option value="pending">{t('adminFinance.statuspending')}</option>
                                    </select>
                                </label>
                            </div>
                        </div>
                        <div className="admin-finance-table-wrap">
                            <table className="admin-finance-table">
                                <thead>
                                    <tr>
                                        <th>{t('adminFinance.shop')}</th>
                                        <th>{t('adminFinance.orders')}</th>
                                        <th>{t('adminFinance.gmv')}</th>
                                        <th>{t('adminFinance.commission')}</th>
                                        <th>{t('adminFinance.shopEarnings')}</th>
                                        <th>{t('adminFinance.shipperCosts')}</th>
                                        <th>{t('adminFinance.status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredShopRevenue.map(shop => (
                                        <tr key={shop.id} className={selectedShop?.id === shop.id ? 'selected' : ''} onClick={() => setSelectedShopId(shop.id)}>
                                            <td><strong>{shop.shopName}</strong><small>{shop.shopId} / {shop.period}</small></td>
                                            <td>{shop.totalOrders.toLocaleString()}</td>
                                            <td className="money">{shop.gmv}</td>
                                            <td className="money">{shop.commission}</td>
                                            <td className="money">{shop.shopEarnings}</td>
                                            <td className="money">{shop.shipperCosts}</td>
                                            <td><span className={`admin-finance-badge ${statusKey(shop.status)}`}>{t(`adminFinance.status${statusKey(shop.status)}`)}</span></td>
                                        </tr>
                                    ))}
                                    {filteredShopRevenue.length === 0 && (
                                        <tr>
                                            <td colSpan="7">
                                                <div className="admin-finance-empty inline"><Search size={22} /><strong>{t('adminFinance.emptyStatements')}</strong></div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </article>

                    <aside className="admin-finance-card admin-finance-detail">
                        {selectedShop ? (
                            <>
                                <div className="admin-finance-detail-head">
                                    <div>
                                        <span className="admin-finance-eyebrow">{t('adminFinance.shopStatement')}</span>
                                        <h2>{selectedShop.shopName}</h2>
                                    </div>
                                    <span className={`admin-finance-badge ${statusKey(selectedShop.status)}`}>{t(`adminFinance.status${statusKey(selectedShop.status)}`)}</span>
                                </div>
                                <dl className="admin-finance-detail-grid">
                                    <div><dt>{t('adminFinance.statementId')}</dt><dd>{selectedShop.id}</dd></div>
                                    <div><dt>{t('adminFinance.period')}</dt><dd>{selectedShop.period}</dd></div>
                                    <div><dt>{t('adminFinance.gmv')}</dt><dd>{formatVnd(selectedShop.gmvValue)}</dd></div>
                                    <div><dt>{t('adminFinance.commission')}</dt><dd>{formatVnd(selectedShop.commissionValue)}</dd></div>
                                    <div><dt>{t('adminFinance.netPayout')}</dt><dd>{formatVnd(selectedShop.shopEarningsValue)}</dd></div>
                                    <div><dt>{t('adminFinance.paidDate')}</dt><dd>{selectedShop.paidDate || t('adminFinance.notPaid')}</dd></div>
                                </dl>
                                <div className="admin-finance-note">
                                    <ClipboardCheck size={17} />
                                    <p>{t('adminFinance.statementNote')}</p>
                                </div>
                                <div className="admin-finance-detail-actions">
                                    <button type="button" onClick={handleReviewStatement}><Eye size={16} strokeWidth={1.9} />{t('adminFinance.reviewPayout')}</button>
                                    <button type="button" className="primary" onClick={handleExportStatement}><Download size={16} strokeWidth={1.9} />{t('adminFinance.exportStatement')}</button>
                                </div>
                            </>
                        ) : (
                            <div className="admin-finance-empty"><Store size={28} /><strong>{t('adminFinance.noSelection')}</strong></div>
                        )}
                    </aside>
                </section>
            )}

            {activeTab === 'payouts' && (
                <section className="admin-finance-card admin-finance-payout-table-card">
                    <div className="admin-finance-card-head">
                        <div>
                            <span className="admin-finance-eyebrow">{t('adminFinance.payoutQueue')}</span>
                            <h2>{pendingPayouts.length} {t('adminFinance.results')}</h2>
                        </div>
                    </div>
                    <div className="admin-finance-table-wrap">
                        <table className="admin-finance-table admin-finance-payout-table">
                            <thead>
                                <tr>
                                    <th>{t('adminFinance.recipient')}</th>
                                    <th>{t('adminFinance.type')}</th>
                                    <th>{t('adminFinance.amount')}</th>
                                    <th>{t('adminFinance.period')}</th>
                                    <th>{t('adminFinance.dueDate')}</th>
                                    <th>{t('adminFinance.status')}</th>
                                    <th>{t('adminFinance.action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingPayouts.map(payout => {
                                    const visibleStatus = statusKey(payout.status === 'paid' ? 'paid' : new Date(payout.dueDate) < today ? 'overdue' : payout.status)
                                    return (
                                        <tr key={payout.id}>
                                            <td><strong>{payout.recipientName}</strong><small>{payout.id} / {payout.recipientId}</small></td>
                                            <td>{payout.recipientType === 'shop' ? t('adminFinance.payoutTypeShop') : t('adminFinance.payoutTypeShipper')}</td>
                                            <td className="money">{payout.amount}</td>
                                            <td>{payout.period}</td>
                                            <td>{payout.dueDate}</td>
                                            <td><span className={`admin-finance-badge ${visibleStatus}`}>{t(`adminFinance.status${visibleStatus}`)}</span></td>
                                            <td>
                                                {payout.status !== 'paid' ? (
                                                    <button type="button" className="admin-finance-row-action" onClick={() => requestProcessPayout(payout)}>
                                                        {t('adminFinance.processPayout')}
                                                    </button>
                                                ) : (
                                                    <span className="admin-finance-row-muted">{payout.paidDate || t('adminFinance.paidDate')}</span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {activeTab === 'transactions' && (
                <section className="admin-finance-card admin-finance-ledger">
                    <div className="admin-finance-card-head">
                        <div>
                            <span className="admin-finance-eyebrow">{t('adminFinance.transactions')}</span>
                            <h2>{TRANSACTIONS.length} {t('adminFinance.results')}</h2>
                        </div>
                    </div>
                    <div className="admin-finance-table-wrap">
                        <table className="admin-finance-table admin-finance-transaction-table">
                            <thead>
                                <tr>
                                    <th>{t('adminFinance.transaction')}</th>
                                    <th>{t('adminFinance.type')}</th>
                                    <th>{t('adminFinance.actor')}</th>
                                    <th>{t('adminFinance.method')}</th>
                                    <th>{t('adminFinance.amount')}</th>
                                    <th>{t('adminFinance.status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {TRANSACTIONS.map(transaction => (
                                    <tr key={transaction.id}>
                                        <td><strong>{transaction.id}</strong><small>{transaction.date}</small></td>
                                        <td>{t(`adminFinance.type${typeKey(transaction.type)}`)}</td>
                                        <td>{transaction.actor}</td>
                                        <td>{t(`adminFinance.method${methodKey(transaction.method)}`)}</td>
                                        <td className="money">{transaction.amount}</td>
                                        <td><span className={`admin-finance-badge ${statusKey(transaction.status)}`}>{t(`adminFinance.status${statusKey(transaction.status)}`)}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {activeTab === 'audit' && (
                <section className="admin-finance-audit">
                    <article className="admin-finance-card admin-finance-config-strip">
                        <span><Landmark size={20} /></span>
                        <div><small>{t('adminFinance.platformCommission')}</small><strong>{currentConfig.platformCommission}%</strong></div>
                        <div><small>{t('adminFinance.subscriptionFee')}</small><strong>{formatVnd(currentConfig.subscriptionFee)}</strong></div>
                        <div><small>{t('adminFinance.shipperShare')}</small><strong>{currentConfig.shipperShare}%</strong></div>
                        <div><small>{t('adminFinance.taxRate')}</small><strong>{currentConfig.taxRate}%</strong></div>
                    </article>
                    <div className="admin-finance-audit-list">
                        {AUDIT_LOG.map(item => (
                            <article className="admin-finance-card admin-finance-audit-item" key={item.id}>
                                <span><FileText size={18} /></span>
                                <div>
                                    <strong>{t(`adminFinance.audit${item.action}`)}</strong>
                                    <small>{item.actor} / {item.time}</small>
                                </div>
                                <b>{item.value}</b>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {showConfigModal && (
                <div className="admin-finance-modal-backdrop" onClick={() => setShowConfigModal(false)}>
                    <div className="admin-finance-modal" onClick={event => event.stopPropagation()}>
                        <div className="admin-finance-modal-head">
                            <h2>{t('adminFinance.financialConfig')}</h2>
                            <button type="button" onClick={() => setShowConfigModal(false)} aria-label={t('common.close')}><X size={18} /></button>
                        </div>
                        <div className="admin-finance-form-grid">
                            <label>{t('adminFinance.platformCommission')}<input type="number" value={editConfig.platformCommission} onChange={event => handleConfigChange('platformCommission', event.target.value)} />{configErrors.platformCommission && <small>{configErrors.platformCommission}</small>}</label>
                            <label>{t('adminFinance.subscriptionFee')}<input type="number" value={editConfig.subscriptionFee} onChange={event => handleConfigChange('subscriptionFee', event.target.value)} />{configErrors.subscriptionFee && <small>{configErrors.subscriptionFee}</small>}</label>
                            <label>{t('adminFinance.shipperShare')}<input type="number" value={editConfig.shipperShare} onChange={event => handleConfigChange('shipperShare', event.target.value)} />{configErrors.shipperShare && <small>{configErrors.shipperShare}</small>}</label>
                            <label>{t('adminFinance.taxRate')}<input type="number" value={editConfig.taxRate} onChange={event => handleConfigChange('taxRate', event.target.value)} />{configErrors.taxRate && <small>{configErrors.taxRate}</small>}</label>
                            <label>{t('adminFinance.deliveryBaseFee')}<input type="number" value={editConfig.deliveryBaseFee} onChange={event => handleConfigChange('deliveryBaseFee', event.target.value)} />{configErrors.deliveryBaseFee && <small>{configErrors.deliveryBaseFee}</small>}</label>
                            <label>{t('adminFinance.deliveryPerKm')}<input type="number" value={editConfig.deliveryPerKm} onChange={event => handleConfigChange('deliveryPerKm', event.target.value)} />{configErrors.deliveryPerKm && <small>{configErrors.deliveryPerKm}</small>}</label>
                        </div>
                        <div className="admin-finance-config-warning">
                            <ShieldAlert size={17} />
                            <p>{t('adminFinance.configWarning')}</p>
                        </div>
                        <div className="admin-finance-modal-actions">
                            <button type="button" onClick={() => setShowConfigModal(false)}>{t('common.cancel')}</button>
                            <button type="button" className="primary" onClick={handleSaveConfig}>{t('adminFinance.saveConfig')}</button>
                        </div>
                    </div>
                </div>
            )}

            {payoutConfirm && (
                <div className="admin-finance-modal-backdrop" onClick={() => setPayoutConfirm(null)}>
                    <div className="admin-finance-modal small" onClick={event => event.stopPropagation()}>
                        <div className="admin-finance-modal-head">
                            <h2>{t('adminFinance.confirmPayout')}</h2>
                            <button type="button" onClick={() => setPayoutConfirm(null)} aria-label={t('common.close')}><X size={18} /></button>
                        </div>
                        <div className="admin-finance-confirm">
                            <Banknote size={30} />
                            <p>{t('adminFinance.confirmPayoutMessage').replace('{name}', payoutConfirm.recipientName).replace('{amount}', payoutConfirm.amount)}</p>
                        </div>
                        <div className="admin-finance-modal-actions">
                            <button type="button" onClick={() => setPayoutConfirm(null)}>{t('common.cancel')}</button>
                            <button type="button" className="primary" onClick={confirmProcessPayout}>{t('adminFinance.processPayout')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminFinanceManagement
