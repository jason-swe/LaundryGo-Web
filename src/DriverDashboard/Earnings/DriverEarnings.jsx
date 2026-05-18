import { useState } from 'react'
import {
    DollarSign,
    TrendingUp,
    Truck,
    CreditCard,
    Clock,
    CheckCircle2,
    ArrowUpRight,
    Info,
} from 'lucide-react'
import {
    driverEarnings,
    driverWeeklyEarnings,
    driverMonthlyEarnings,
    driverRateCard,
    driverPayoutHistory,
} from '../../data/index'
import { useTranslation } from '../../shared/lib/i18n'
import './DriverEarnings.css'

const fmt = (n) => n.toLocaleString('vi-VN') + 'đ'

// Mini bar chart — rendered purely with CSS/div
function BarChart({ data, valueKey, labelKey, highlight, formatLabel }) {
    const max = Math.max(...data.map(d => d[valueKey]), 1)
    return (
        <div className="de-barchart">
            {data.map((d, i) => {
                const pct = (d[valueKey] / max) * 100
                const isHighlight = d[labelKey] === highlight
                return (
                    <div key={i} className="de-bar-col">
                        <div className="de-bar-wrap">
                            <div
                                className={`de-bar${isHighlight ? ' de-bar-active' : ''}`}
                                style={{ height: `${Math.max(pct, 2)}%` }}
                            />
                        </div>
                        <span className={`de-bar-label${isHighlight ? ' de-bar-label-active' : ''}`}>
                            {formatLabel ? formatLabel(d[labelKey]) : d[labelKey]}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

export default function DriverEarnings() {
    const { language, t } = useTranslation()
    const [chartView, setChartView] = useState('week') // 'week' | 'month'

    const summary = driverEarnings
    const weekly = driverWeeklyEarnings
    const monthly = driverMonthlyEarnings
    const rate = driverRateCard
    const payouts = driverPayoutHistory

    const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'short' })
    const currentMonth = new Date().toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' })
    const formatDay = (day) => t(`driver.earnings.days.${String(day).toLowerCase()}`)

    return (
        <div className="de-page">

            {/* ── Title ── */}
            <div className="de-page-header">
                <div className="de-title-wrap">
                    <DollarSign size={22} className="de-title-icon" />
                    <div>
                        <h1 className="de-page-title">{t('dashboard.earnings')}</h1>
                        <p className="de-page-subtitle">{t('driver.earnings.subtitle')}</p>
                    </div>
                </div>
            </div>

            {/* ── Summary cards row ── */}
            <div className="de-summary-row">
                <div className="de-stat-card de-stat-today">
                    <div className="de-stat-label">{t('driver.earnings.today')}</div>
                    <div className="de-stat-value">{fmt(summary.todayEarnings)}</div>
                    <div className="de-stat-sub">{summary.todayTrips} {t('driver.overview.trips')}</div>
                </div>
                <div className="de-stat-card">
                    <div className="de-stat-label">{t('driver.earnings.thisWeek')}</div>
                    <div className="de-stat-value">{fmt(summary.weekEarnings)}</div>
                    <div className="de-stat-sub">{summary.weekTrips} {t('driver.overview.trips')}</div>
                </div>
                <div className="de-stat-card">
                    <div className="de-stat-label">{t('shop.thisMonth')}</div>
                    <div className="de-stat-value">{fmt(summary.monthEarnings)}</div>
                    <div className="de-stat-sub">{summary.monthTrips} {t('driver.overview.trips')}</div>
                </div>
                <div className="de-stat-card de-stat-total">
                    <div className="de-stat-label">{t('admin.shipperManagement.stats.totalEarnings')}</div>
                    <div className="de-stat-value">{fmt(summary.totalEarnings)}</div>
                    <div className="de-stat-sub">{summary.totalTrips} {t('driver.overview.trips')}</div>
                </div>
            </div>

            {/* ── Pending payout banner ── */}
            <div className="de-pending-banner">
                <div className="de-pending-left">
                    <Clock size={18} />
                    <div>
                        <div className="de-pending-label">{t('driver.earnings.pendingPayout')}</div>
                        <div className="de-pending-amount">{fmt(summary.pendingPayout)}</div>
                    </div>
                </div>
                <div className="de-pending-right">
                    <span className="de-pending-last">
                        {t('driver.earnings.last')}: {fmt(summary.lastPayout.amount)} · {summary.lastPayout.date}
                    </span>
                    <button className="de-request-btn">
                        <CreditCard size={14} /> {t('driver.earnings.requestPayout')}
                    </button>
                </div>
            </div>

            {/* ── Chart section ── */}
            <div className="de-chart-card">
                <div className="de-chart-head">
                    <div className="de-chart-title">
                        <TrendingUp size={16} />
                        <span>{t('driver.earnings.earningsChart')}</span>
                    </div>
                    <div className="de-chart-tabs">
                        <button
                            className={`de-chart-tab${chartView === 'week' ? ' de-chart-tab-active' : ''}`}
                            onClick={() => setChartView('week')}
                        >{t('driver.earnings.thisWeek')}</button>
                        <button
                            className={`de-chart-tab${chartView === 'month' ? ' de-chart-tab-active' : ''}`}
                            onClick={() => setChartView('month')}
                        >{t('admin.analytics.period.6months')}</button>
                    </div>
                </div>

                {chartView === 'week' ? (
                    <>
                        <BarChart data={weekly} valueKey="net" labelKey="day" highlight={todayDay} formatLabel={formatDay} />
                        <div className="de-chart-legend">
                            <table className="de-week-table">
                                <thead>
                                    <tr>
                                        <th>{t('driver.earnings.day')}</th>
                                        <th>{t('driver.overview.trips')}</th>
                                        <th>{t('driver.earnings.gross')}</th>
                                        <th>{t('driver.earnings.fee')}</th>
                                        <th>{t('driver.earnings.net')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {weekly.map((d, i) => (
                                        <tr key={i} className={d.day === todayDay ? 'de-row-today' : ''}>
                                            <td>{formatDay(d.day)}</td>
                                            <td>{d.trips}</td>
                                            <td>{d.gross ? fmt(d.gross) : '—'}</td>
                                            <td>{d.fee ? fmt(d.fee) : '—'}</td>
                                            <td className="de-net-cell">{d.net ? fmt(d.net) : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <>
                        <BarChart data={monthly} valueKey="net" labelKey="month" highlight={currentMonth} />
                        <div className="de-chart-legend">
                            <table className="de-week-table">
                                <thead>
                                    <tr>
                                        <th>{t('shop.revenue.table.date')}</th>
                                        <th>{t('driver.overview.trips')}</th>
                                        <th>{t('driver.earnings.gross')}</th>
                                        <th>{t('driver.earnings.net')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthly.map((d, i) => (
                                        <tr key={i}>
                                            <td>{d.month}</td>
                                            <td>{d.trips}</td>
                                            <td>{fmt(d.gross)}</td>
                                            <td className="de-net-cell">{fmt(d.net)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* ── Bottom row : rate card + payout history ── */}
            <div className="de-bottom-row">

                {/* Rate card */}
                <div className="de-rate-card">
                    <div className="de-section-title">
                        <Info size={15} />
                        <span>{t('driver.earnings.rateCard')}</span>
                    </div>
                    <div className="de-rate-list">
                        <div className="de-rate-row">
                            <span>{t('driver.earnings.baseFeePerTrip')}</span>
                            <strong>{fmt(rate.baseFeePerTrip)}</strong>
                        </div>
                        <div className="de-rate-row">
                            <span>{t('driver.earnings.deliverySurcharge')}</span>
                            <strong>+{fmt(rate.deliveryFeeExtra)}</strong>
                        </div>
                        <div className="de-rate-row">
                            <span>{t('driver.earnings.peakHourBonus')}</span>
                            <strong className="de-bonus">+{fmt(rate.peakHourBonus)}</strong>
                        </div>
                        <div className="de-rate-row">
                            <span>{t('driver.earnings.weekendBonus')}</span>
                            <strong className="de-bonus">+{fmt(rate.weekendBonus)}</strong>
                        </div>
                        <div className="de-rate-row de-rate-row-commission">
                            <span>{t('driver.earnings.platformFee')}</span>
                            <strong className="de-commission">-{rate.platformCommissionRate}%</strong>
                        </div>
                    </div>
                    <p className="de-rate-note">{rate.notes}</p>
                </div>

                {/* Payout history */}
                <div className="de-payout-card">
                    <div className="de-section-title">
                        <Truck size={15} />
                        <span>{t('driver.earnings.payoutHistory')}</span>
                    </div>
                    <div className="de-payout-list">
                        {payouts.map(p => (
                            <div key={p.id} className="de-payout-row">
                                <div className="de-payout-left">
                                    <div className="de-payout-period">{p.period}</div>
                                    <div className="de-payout-meta">{p.trips} {t('driver.overview.trips')} · {p.bankAccount}</div>
                                </div>
                                <div className="de-payout-right">
                                    <span className="de-payout-amount">{fmt(p.amount)}</span>
                                    <span className="de-payout-status">
                                        <CheckCircle2 size={12} /> {t('driver.earnings.received')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}
