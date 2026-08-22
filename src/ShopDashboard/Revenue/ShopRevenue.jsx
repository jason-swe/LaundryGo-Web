import { createElement, useState } from 'react'
import {
    BarChart3,
    CalendarDays,
    CheckCircle,
    CreditCard,
    Download,
    FileText,
    Landmark,
    ReceiptText,
    ShoppingBag,
    TrendingUp,
} from 'lucide-react'
import './ShopRevenue.css'
import { orders as ordersData, revenue as revenueData } from '../../data'
import toast from '../../utils/toast'
import { useTranslation } from '../../shared/lib/i18n'

const COMMISSION_RATE = 0.15

function parsePrice(value) {
    if (!value) return 0
    return parseInt(String(value).replace(/[^0-9]/g, ''), 10) || 0
}

function formatVnd(value) {
    return `${Math.round(value || 0).toLocaleString()}đ`
}

function formatCompact(value) {
    const amount = Number(value) || 0
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M đ`
    return formatVnd(amount)
}

function ShopRevenue() {
    const { t } = useTranslation()
    const [selectedPeriod, setSelectedPeriod] = useState('month')
    const [orderFilter, setOrderFilter] = useState('all')
    const [exportDate] = useState(() => new Date().toISOString().split('T')[0])

    const periodData = {
        week: revenueData.daily.map(day => ({
            label: day.date.slice(5),
            gross: day.revenue,
            net: day.profit,
            orders: day.orders,
        })),
        month: revenueData.weekly.map(week => ({
            label: week.week.replace(/\s*\(.*\)/, ''),
            gross: week.revenue,
            net: week.profit,
            orders: week.orders,
        })),
        quarter: revenueData.monthly.slice(-3).map(month => ({
            label: month.month,
            gross: month.revenue,
            net: month.profit,
            orders: month.orders,
        })),
        year: revenueData.monthly.map(month => ({
            label: month.month.slice(5),
            gross: month.revenue,
            net: month.profit,
            orders: month.orders,
        })),
    }

    const chartData = periodData[selectedPeriod]
    const maxGross = Math.max(...chartData.map(item => item.gross), 1)
    const summary = {
        gross: chartData.reduce((total, item) => total + item.gross, 0),
        net: chartData.reduce((total, item) => total + item.net, 0),
        orders: chartData.reduce((total, item) => total + item.orders, 0),
    }
    const platformFee = summary.gross - summary.net
    const avgOrder = summary.orders ? summary.gross / summary.orders : 0

    const orders = ordersData.map(order => {
        const amount = parsePrice(order.actualPrice || order.estimatedPrice)
        return {
            id: order.id,
            customer: typeof order.customer === 'object' ? order.customer.name : order.customer,
            date: (order.completedTime || order.pickupTime || '').split(' ')[0],
            service: order.service || t('shopRevenue.other'),
            amount,
            fee: amount * COMMISSION_RATE,
            net: amount * (1 - COMMISSION_RATE),
            paymentStatus: order.paymentStatus || 'pending',
            orderStatus: order.status || 'pending',
            paymentMethod: order.paymentMethod || t('shopRevenue.notSet'),
        }
    })

    const filteredOrders = orders.filter(order => orderFilter === 'all' || order.paymentStatus === orderFilter)
    const paidCount = orders.filter(order => order.paymentStatus === 'paid').length
    const pendingCount = orders.filter(order => order.paymentStatus !== 'paid').length

    const serviceEntries = Object.entries(orders.reduce((acc, order) => {
        acc[order.service] = (acc[order.service] || 0) + order.amount
        return acc
    }, {})).sort((a, b) => b[1] - a[1])
    const serviceTotal = serviceEntries.reduce((total, [, amount]) => total + amount, 0) || 1

    const paymentEntries = revenueData.byPaymentMethod || []
    const payout = {
        plan: 'Professional',
        monthlyFee: 500000,
        nextBillingDate: '2026-04-01',
        status: t('shopRevenue.active'),
        payoutDate: '2026-04-03',
        payoutMethod: 'Bank transfer',
    }

    const kpis = [
        { label: t('shopRevenue.grossRevenue'), value: formatCompact(summary.gross), meta: t(`shopRevenue.${selectedPeriod}`), Icon: TrendingUp, tone: 'navy' },
        { label: t('shopRevenue.platformFee'), value: `-${formatCompact(platformFee)}`, meta: t('shopRevenue.rate15'), Icon: ReceiptText, tone: 'amber' },
        { label: t('shopRevenue.netPayout'), value: formatCompact(summary.net), meta: t('shopRevenue.afterFees'), Icon: Landmark, tone: 'teal' },
        { label: t('shopRevenue.orders'), value: summary.orders.toLocaleString(), meta: `${t('shopRevenue.avg')} ${formatVnd(avgOrder)}`, Icon: ShoppingBag, tone: 'blue' },
    ]

    const handleExport = () => {
        const headers = ['Label', 'Gross', 'Platform Fee', 'Net', 'Orders']
        const rows = chartData.map(item => [
            item.label,
            item.gross,
            item.gross - item.net,
            item.net,
            item.orders,
        ])
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `revenue-${selectedPeriod}-${exportDate}.csv`
        anchor.click()
        URL.revokeObjectURL(url)
        toast.success(t('shopRevenue.exported'))
    }

    const orderStatusLabel = (status) => {
        const labels = {
            'pending-checkin': t('shopRevenue.pendingCheckin'),
            washing: t('shopRevenue.washing'),
            drying: t('shopRevenue.drying'),
            ironing: t('shopRevenue.ironing'),
            ready: t('shopRevenue.ready'),
            delivering: t('shopRevenue.delivering'),
            completed: t('shopRevenue.completed'),
            cancelled: t('shopRevenue.cancelled'),
        }
        return labels[status] || status
    }

    return (
        <div className="shop-revenue-page">
            <header className="shop-revenue-header">
                <div>
                    <span className="shop-revenue-eyebrow">{t('shopRevenue.eyebrow')}</span>
                    <h1>{t('shopRevenue.title')}</h1>
                    <p>{t('shopRevenue.subtitle')}</p>
                </div>
                <button type="button" className="shop-revenue-primary-btn" onClick={handleExport}>
                    <Download size={16} strokeWidth={1.9} />
                    {t('shopRevenue.exportCsv')}
                </button>
            </header>

            <section className="shop-revenue-api-notice">
                <FileText size={16} strokeWidth={1.9} />
                <span>Shop revenue and payout APIs are not exposed yet. This screen is using presentation fallback data.</span>
            </section>

            <section className="shop-revenue-kpis">
                {kpis.map(({ label, value, meta, Icon, tone }) => (
                    <article className={`shop-revenue-kpi ${tone}`} key={label}>
                        <span>{createElement(Icon, { size: 18, strokeWidth: 1.9 })}</span>
                        <small>{label}</small>
                        <strong>{value}</strong>
                        <p>{meta}</p>
                    </article>
                ))}
            </section>

            <section className="shop-revenue-workspace">
                <article className="shop-revenue-card revenue-chart-card">
                    <div className="shop-revenue-card-head">
                        <div>
                            <span className="shop-revenue-eyebrow">{t('shopRevenue.trend')}</span>
                            <h2>{t('shopRevenue.revenueTrend')}</h2>
                        </div>
                        <div className="shop-revenue-periods">
                            {['week', 'month', 'quarter', 'year'].map(period => (
                                <button type="button" className={selectedPeriod === period ? 'active' : ''} key={period} onClick={() => setSelectedPeriod(period)}>
                                    {t(`shopRevenue.${period}`)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="shop-revenue-chart-legend">
                        <span className="gross">{t('shopRevenue.gross')}</span>
                        <span className="net">{t('shopRevenue.net')}</span>
                    </div>
                    <div className="shop-revenue-chart">
                        {chartData.map(item => (
                            <div className="shop-revenue-bar-group" key={item.label}>
                                <div className="shop-revenue-bars">
                                    <span className="gross" style={{ height: `${(item.gross / maxGross) * 100}%` }} />
                                    <span className="net" style={{ height: `${(item.net / maxGross) * 100}%` }} />
                                </div>
                                <small>{item.label}</small>
                            </div>
                        ))}
                    </div>
                </article>

                <aside className="shop-revenue-card payout-card">
                    <div className="shop-revenue-card-head">
                        <div>
                            <span className="shop-revenue-eyebrow">{t('shopRevenue.payout')}</span>
                            <h2>{t('shopRevenue.payoutSummary')}</h2>
                        </div>
                        <span className="shop-revenue-status teal">{payout.status}</span>
                    </div>
                    <dl className="shop-revenue-payout-grid">
                        <div><dt>{t('shopRevenue.nextPayout')}</dt><dd>{formatVnd(summary.net)}</dd></div>
                        <div><dt>{t('shopRevenue.payoutDate')}</dt><dd>{payout.payoutDate}</dd></div>
                        <div><dt>{t('shopRevenue.method')}</dt><dd>{payout.payoutMethod}</dd></div>
                        <div><dt>{t('shopRevenue.plan')}</dt><dd>{payout.plan}</dd></div>
                        <div><dt>{t('shopRevenue.monthlyFee')}</dt><dd>{formatVnd(payout.monthlyFee)}</dd></div>
                        <div><dt>{t('shopRevenue.nextBilling')}</dt><dd>{payout.nextBillingDate}</dd></div>
                    </dl>
                </aside>
            </section>

            <section className="shop-revenue-breakdowns">
                <article className="shop-revenue-card">
                    <div className="shop-revenue-card-head">
                        <div>
                            <span className="shop-revenue-eyebrow">{t('shopRevenue.mix')}</span>
                            <h2><BarChart3 size={17} />{t('shopRevenue.byService')}</h2>
                        </div>
                    </div>
                    <div className="shop-revenue-service-list">
                        {serviceEntries.map(([service, amount]) => (
                            <div className="shop-revenue-service-row" key={service}>
                                <div>
                                    <strong>{service}</strong>
                                    <span>{formatCompact(amount)}</span>
                                </div>
                                <div className="shop-revenue-track">
                                    <span style={{ width: `${(amount / serviceTotal) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="shop-revenue-card">
                    <div className="shop-revenue-card-head">
                        <div>
                            <span className="shop-revenue-eyebrow">{t('shopRevenue.payment')}</span>
                            <h2><CreditCard size={17} />{t('shopRevenue.paymentMethods')}</h2>
                        </div>
                    </div>
                    <div className="shop-revenue-payment-list">
                        {paymentEntries.map(method => (
                            <div className="shop-revenue-payment-row" key={method.method}>
                                <CreditCard size={16} strokeWidth={1.9} />
                                <strong>{method.method}</strong>
                                <span>{method.orders} {t('shopRevenue.ordersLower')}</span>
                                <b>{method.percentage}%</b>
                            </div>
                        ))}
                    </div>
                    <div className="shop-revenue-payment-summary">
                        <span className="teal"><CheckCircle size={14} />{t('shopRevenue.paid')}: {paidCount}</span>
                        <span className="amber"><CalendarDays size={14} />{t('shopRevenue.pending')}: {pendingCount}</span>
                    </div>
                </article>
            </section>

            <section className="shop-revenue-card revenue-orders-card">
                <div className="shop-revenue-card-head">
                    <div>
                        <span className="shop-revenue-eyebrow">{t('shopRevenue.reconciliation')}</span>
                        <h2>{t('shopRevenue.orderRevenue')}</h2>
                    </div>
                    <div className="shop-revenue-filters">
                        {['all', 'paid', 'pending'].map(filter => (
                            <button type="button" className={orderFilter === filter ? 'active' : ''} key={filter} onClick={() => setOrderFilter(filter)}>
                                {t(`shopRevenue.${filter}`)}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="shop-revenue-table-wrap">
                    <table className="shop-revenue-table">
                        <thead>
                            <tr>
                                <th>{t('shopRevenue.orderId')}</th>
                                <th>{t('shopRevenue.customer')}</th>
                                <th>{t('shopRevenue.date')}</th>
                                <th>{t('shopRevenue.service')}</th>
                                <th>{t('shopRevenue.amount')}</th>
                                <th>{t('shopRevenue.fee')}</th>
                                <th>{t('shopRevenue.net')}</th>
                                <th>{t('shopRevenue.orderStatus')}</th>
                                <th>{t('shopRevenue.payment')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="shop-revenue-empty">
                                        <FileText size={26} strokeWidth={1.8} />
                                        <strong>{t('shopRevenue.noOrders')}</strong>
                                    </td>
                                </tr>
                            )}
                            {filteredOrders.map(order => (
                                <tr key={order.id}>
                                    <td className="shop-revenue-order-id">{order.id}</td>
                                    <td>{order.customer}</td>
                                    <td>{order.date || t('shopRevenue.notSet')}</td>
                                    <td>{order.service}</td>
                                    <td className="money">{order.amount ? formatVnd(order.amount) : t('shopRevenue.notSet')}</td>
                                    <td className="money fee">{order.amount ? `-${formatVnd(order.fee)}` : t('shopRevenue.notSet')}</td>
                                    <td className="money net">{order.amount ? formatVnd(order.net) : t('shopRevenue.notSet')}</td>
                                    <td><span className="shop-revenue-status blue">{orderStatusLabel(order.orderStatus)}</span></td>
                                    <td><span className={`shop-revenue-status ${order.paymentStatus === 'paid' ? 'teal' : 'amber'}`}>{order.paymentStatus === 'paid' ? t('shopRevenue.paid') : t('shopRevenue.pending')}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    )
}

export default ShopRevenue
