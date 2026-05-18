import { useState } from 'react'
import {
    ClipboardList,
    CheckCircle2,
    Truck,
    DollarSign,
    MapPin,
    Phone,
    Package,
    PackageOpen,
    Clock,
    Star,
    TrendingUp,
    ToggleLeft,
    ToggleRight,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Zap,
} from 'lucide-react'
import {
    driverProfile,
    driverPerformance,
    driverTasks,
    driverWeeklyEarnings,
    driverEarnings,
} from '../../data'
import { useTranslation } from '../../shared/lib/i18n'
import './DriverOverview.css'

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */
function getGreetingKey() {
    const h = new Date().getHours()
    if (h < 12) return 'morning'
    if (h < 18) return 'afternoon'
    return 'evening'
}

function formatVND(n) {
    return new Intl.NumberFormat('vi-VN').format(n) + 'đ'
}

const STATUS_CLASS = {
    completed: 'status-completed',
    'in-progress': 'status-inprogress',
    pending: 'status-pending',
}

/* Normalize task shape from JSON to what the UI needs */
function normalizeTask(t) {
    return {
        id: t.id,
        type: t.type,
        orderId: t.orderId,
        customer: t.customer.name,
        address: t.customer.address,
        phone: t.customer.phone,
        shop: t.shop?.name ?? '',
        time: t.scheduledTime,
        status: t.status,
    }
}

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */
export default function DriverOverview() {
    const { language, t } = useTranslation()
    const [online, setOnline] = useState(true)

    const today = new Date()
    const dateLabel = today.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })

    const TODAY_TASKS = driverTasks.map(normalizeTask)
    const WEEKLY_EARNINGS = driverWeeklyEarnings.map(d => ({ day: d.day, amount: d.gross }))

    const completed = TODAY_TASKS.filter(t => t.status === 'completed').length
    const inProgress = TODAY_TASKS.filter(t => t.status === 'in-progress').length
    const activeTask = TODAY_TASKS.find(t => t.status === 'in-progress') || null
    const earningsToday = driverEarnings.todayEarnings

    const maxEarnings = Math.max(...WEEKLY_EARNINGS.map(d => d.amount), 1)
    const weekTotal = driverEarnings.weekEarnings

    const DRIVER = {
        name: driverProfile.name,
        rating: driverProfile.rating,
        totalDeliveries: driverProfile.totalDeliveries,
        badge: driverProfile.badge,
    }

    const STATS = [
        {
            label: "Today's Tasks",
            labelKey: 'todaysTasks',
            value: TODAY_TASKS.length,
            deltaPrefix: '+2 ',
            deltaKey: 'vsYesterday',
            up: true,
            icon: ClipboardList,
            colorClass: 'sc-blue',
        },
        {
            label: 'Completed',
            labelKey: 'completed',
            value: completed,
            deltaPrefix: `${Math.round((completed / TODAY_TASKS.length) * 100)}% `,
            deltaKey: 'achieved',
            up: true,
            icon: CheckCircle2,
            colorClass: 'sc-green',
        },
        {
            label: 'In Progress',
            labelKey: 'inProgress',
            value: inProgress,
            deltaKey: 'onTheWay',
            up: null,
            icon: Truck,
            colorClass: 'sc-orange',
        },
        {
            label: "Today's Earnings",
            labelKey: 'todaysEarnings',
            value: formatVND(earningsToday),
            deltaPrefix: '+12% ',
            deltaKey: 'vsYesterday',
            up: true,
            icon: DollarSign,
            colorClass: 'sc-mint',
        },
    ]

    return (
        <div className="dov-page">

            {/* ══ Greeting Banner ══ */}
            <div className="dov-banner">
                <div className="dov-banner-body">
                    <p className="dov-banner-date">{dateLabel}</p>
                    <h1 className="dov-banner-title">
                        {t(`driver.overview.greeting.${getGreetingKey()}`)}, <span>{DRIVER.name}</span>!
                    </h1>
                    <div className="dov-banner-badges">
                        <span className="dov-badge dov-badge-rating">
                            <Star size={13} fill="currentColor" />
                            {DRIVER.rating}
                        </span>
                        <span className="dov-badge dov-badge-deliveries">
                            <Package size={13} />
                            {DRIVER.totalDeliveries} {t('driver.overview.trips')}
                        </span>
                        <span className="dov-badge dov-badge-zap">
                            <Zap size={13} fill="currentColor" />
                            {DRIVER.badge ?? t('driver.overview.topShipper')}
                        </span>
                    </div>
                </div>

                <button
                    className={`dov-status-toggle${online ? ' is-online' : ' is-offline'}`}
                    onClick={() => setOnline(v => !v)}
                >
                    {online
                        ? <><ToggleRight size={22} strokeWidth={2} /><span>{t('driver.status.online')}</span></>
                        : <><ToggleLeft size={22} strokeWidth={2} /><span>{t('driver.status.offline')}</span></>
                    }
                </button>
            </div>

            {/* ══ Stat Cards ══ */}
            <div className="dov-stats">
                {STATS.map((s, i) => {
                    const Icon = s.icon
                    return (
                        <div className={`dov-stat ${s.colorClass}`} key={i}>
                            <div className="dov-stat-icon-wrap">
                                <Icon size={20} />
                            </div>
                            <div className="dov-stat-content">
                                <div className="dov-stat-value">{s.value}</div>
                                <div className="dov-stat-label">{t(`driver.overview.stats.${s.labelKey}`)}</div>
                            </div>
                            {s.up !== null && (
                                <div className={`dov-stat-delta ${s.up ? 'up' : 'down'}`}>
                                    {s.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    <span>{s.deltaPrefix || ''}{t(`driver.overview.stats.${s.deltaKey}`)}</span>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* ══ Main Two-Column Grid ══ */}
            <div className="dov-grid">

                {/* ─ Left Column ─ */}
                <div className="dov-col-main">

                    {/* Active Task */}
                    {activeTask && (
                        <div className="dov-card dov-active-card">
                            <div className="dov-card-head dov-active-head">
                                <Truck size={17} />
                                <span>{t('driver.overview.activeTask')}</span>
                                <span className="dov-pulse-dot" />
                            </div>
                            <div className="dov-active-body">
                                <div className="dov-active-type">
                                    {activeTask.type === 'delivery'
                                        ? <><Truck size={13} /> {t('driver.taskType.delivery')}</>
                                        : <><PackageOpen size={13} /> {t('driver.taskType.pickup')}</>}
                                </div>
                                <h2 className="dov-active-customer">{activeTask.customer}</h2>
                                <p className="dov-active-order-id">{activeTask.orderId}  ·  {activeTask.shop}</p>

                                <div className="dov-active-info-grid">
                                    <div className="dov-active-info-row">
                                        <MapPin size={14} />
                                        <span>{activeTask.address}</span>
                                    </div>
                                    <div className="dov-active-info-row">
                                        <Phone size={14} />
                                        <span>{activeTask.phone}</span>
                                    </div>
                                    <div className="dov-active-info-row">
                                        <Clock size={14} />
                                        <span>{t('driver.overview.estArrivalAt')} {activeTask.time}</span>
                                    </div>
                                </div>

                                <div className="dov-active-actions">
                                    <button className="dov-btn-outline">
                                        <Phone size={15} />{t('driver.actions.callCustomer')}
                                    </button>
                                    <button className="dov-btn-done">
                                        <CheckCircle2 size={15} />{t('driver.actions.confirmComplete')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Today's task list */}
                    <div className="dov-card">
                        <div className="dov-card-head">
                            <ClipboardList size={17} />
                            <span>{t('driver.overview.todaysSchedule')}</span>
                            <span className="dov-head-count">{TODAY_TASKS.length}</span>
                        </div>

                        <div className="dov-task-list">
                            {TODAY_TASKS.map(task => {
                                const statusClass = STATUS_CLASS[task.status]
                                return (
                                    <div
                                        key={task.id}
                                        className={`dov-task-row${task.status === 'in-progress' ? ' dov-task-active' : ''}`}
                                    >
                                        <div className="dov-task-time">{task.time}</div>

                                        <div className={`dov-task-type-chip ${task.type === 'delivery' ? 'chip-delivery' : 'chip-pickup'}`}>
                                            {task.type === 'delivery'
                                                ? <Truck size={13} />
                                                : <Package size={13} />
                                            }
                                        </div>

                                        <div className="dov-task-info">
                                            <div className="dov-task-customer">{task.customer}</div>
                                            <div className="dov-task-addr">
                                                <MapPin size={11} />{task.address}
                                            </div>
                                        </div>

                                        <span className={`dov-status-badge ${statusClass}`}>
                                            {t(`driver.status.${task.status === 'in-progress' ? 'inProgress' : task.status}`)}
                                        </span>

                                        <button className="dov-task-chevron" aria-label={t('admin.customerManagement.viewDetails')}>
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* ─ Right Column ─ */}
                <div className="dov-col-side">

                    {/* Earnings chart */}
                    <div className="dov-card">
                        <div className="dov-card-head">
                            <DollarSign size={17} />
                            <span>{t('driver.overview.thisWeeksEarnings')}</span>
                        </div>
                        <div className="dov-earnings-summary">
                            <div className="dov-earnings-total">{formatVND(weekTotal)}</div>
                            <div className="dov-earnings-change up">
                                <ArrowUpRight size={13} /> +12% {t('driver.overview.stats.vsLastWeek')}
                            </div>
                        </div>

                        <div className="dov-bar-chart" aria-label={t('driver.overview.weeklyEarningsChart')}>
                            {WEEKLY_EARNINGS.map((d, i) => {
                                const pct = Math.round((d.amount / maxEarnings) * 100)
                                const isToday = i === WEEKLY_EARNINGS.length - 1
                                return (
                                    <div className="dov-bar-col" key={d.day}>
                                        <div className="dov-bar-track">
                                            <div
                                                className={`dov-bar-fill${isToday ? ' today' : ''}`}
                                                style={{ height: `${pct}%` }}
                                                title={formatVND(d.amount)}
                                            />
                                        </div>
                                        <div className={`dov-bar-lbl${isToday ? ' today' : ''}`}>{d.day}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Performance */}
                    <div className="dov-card">
                        <div className="dov-card-head">
                            <TrendingUp size={17} />
                            <span>{t('driver.overview.performance')}</span>
                        </div>

                        <div className="dov-perf-list">
                            {[
                                { labelKey: 'completionRate', value: driverPerformance.completionRate, color: 'perf-blue' },
                                { labelKey: 'onTime', value: driverPerformance.onTimeRate, color: 'perf-mint' },
                                { labelKey: 'customerSatisfaction', value: driverPerformance.satisfactionRate, color: 'perf-gold' },
                            ].map(p => (
                                <div className="dov-perf-row" key={p.labelKey}>
                                    <div className="dov-perf-meta">
                                        <span className="dov-perf-label">{t(`driver.overview.performanceLabels.${p.labelKey}`)}</span>
                                        <span className="dov-perf-value">{p.value}%</span>
                                    </div>
                                    <div className="dov-perf-track">
                                        <div
                                            className={`dov-perf-fill ${p.color}`}
                                            style={{ width: `${p.value}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="dov-rating-footer">
                            <Star size={16} fill="#f59e0b" color="#f59e0b" />
                            <span className="dov-rating-num">{DRIVER.rating}</span>
                            <span className="dov-rating-sub">/ 5.0 - {t('driver.overview.overallRating')}</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
