import { useEffect, useMemo, useState } from 'react'
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
import { getDriverHistory, getDriverProfile, getTodayDriverTasks } from '../../services/driverApi'
import './DriverOverview.css'

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */
function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
}

function formatVND(n) {
    return new Intl.NumberFormat('vi-VN').format(n) + 'đ'
}

function percent(part, total) {
    if (!total) return 0
    return Math.round((part / total) * 100)
}

const STATUS_META = {
    completed: { label: 'Completed', cls: 'status-completed' },
    'in-progress': { label: 'In Progress', cls: 'status-inprogress' },
    pending: { label: 'Pending', cls: 'status-pending' },
    cancelled: { label: 'Cancelled', cls: 'status-pending' },
}

/* Normalize task shape from JSON to what the UI needs */
function normalizeTask(t) {
    return {
        id: t.id,
        type: t.type,
        orderId: t.orderId,
        customer: t.customer?.name ?? 'Customer',
        address: t.customer?.address ?? '',
        phone: t.customer?.phone ?? '',
        shop: t.shop?.name ?? '',
        time: t.scheduledTime,
        status: t.status,
    }
}

function normalizeProfile(profile) {
    if (!profile) return null
    return {
        name: profile.fullName || driverProfile.name,
        rating: driverProfile.rating,
        totalDeliveries: driverProfile.totalDeliveries,
        badge: profile.status === 'ACTIVE' ? 'Active Shipper' : driverProfile.badge,
    }
}

function toWeeklyEarningsFromHistory(days = []) {
    const weekStart = new Date()
    const day = weekStart.getDay() || 7
    weekStart.setHours(0, 0, 0, 0)
    weekStart.setDate(weekStart.getDate() - day + 1)

    const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
    return labels.map((label, index) => {
        const date = new Date(weekStart)
        date.setDate(weekStart.getDate() + index)
        const iso = date.toISOString().slice(0, 10)
        const amount = days
            .flatMap(day => day.items || [])
            .filter(item => item.status === 'completed' && item.date === iso)
            .reduce((sum, item) => sum + Number(item.fee || 0), 0)

        return { day: label, amount }
    })
}

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */
export default function DriverOverview() {
    const [online, setOnline] = useState(true)
    const [apiProfile, setApiProfile] = useState(null)
    const [apiTasks, setApiTasks] = useState(null)
    const [apiHistory, setApiHistory] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let alive = true

        Promise.allSettled([
            getDriverProfile(),
            getTodayDriverTasks({ size: 20 }),
            getDriverHistory({ size: 100 }),
        ]).then(([profileResult, tasksResult, historyResult]) => {
            if (!alive) return

            if (profileResult.status === 'fulfilled') {
                setApiProfile(normalizeProfile(profileResult.value))
            }

            if (tasksResult.status === 'fulfilled') {
                setApiTasks(tasksResult.value.tasks || [])
            }

            if (historyResult.status === 'fulfilled') {
                setApiHistory(historyResult.value.days || [])
            }

            const failed = [profileResult, tasksResult, historyResult].find(result => result.status === 'rejected')
            setError(failed?.reason?.message || '')
        }).finally(() => {
            if (alive) setLoading(false)
        })

        return () => {
            alive = false
        }
    }, [])

    const today = new Date()
    const dateLabel = today.toLocaleDateString('en-US', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })

    const TODAY_TASKS = useMemo(
        () => (apiTasks ?? driverTasks).map(normalizeTask),
        [apiTasks]
    )
    const WEEKLY_EARNINGS = useMemo(
        () => (apiHistory ? toWeeklyEarningsFromHistory(apiHistory) : driverWeeklyEarnings.map(d => ({ day: d.day, amount: d.gross }))),
        [apiHistory]
    )

    const completed = TODAY_TASKS.filter(t => t.status === 'completed').length
    const inProgress = TODAY_TASKS.filter(t => t.status === 'in-progress').length
    const activeTask = TODAY_TASKS.find(t => t.status === 'in-progress') || null
    const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
    const earningsToday = apiHistory ? WEEKLY_EARNINGS[todayIndex]?.amount ?? 0 : driverEarnings.todayEarnings

    const maxEarnings = Math.max(...WEEKLY_EARNINGS.map(d => d.amount), 1)
    const weekTotal = apiHistory ? WEEKLY_EARNINGS.reduce((sum, item) => sum + item.amount, 0) : driverEarnings.weekEarnings

    const DRIVER = apiProfile || {
        name: driverProfile.name,
        rating: driverProfile.rating,
        totalDeliveries: driverProfile.totalDeliveries,
        badge: driverProfile.badge,
    }

    const STATS = [
        {
            label: "Today's Tasks",
            value: TODAY_TASKS.length,
            delta: '+2 vs yesterday',
            up: true,
            icon: ClipboardList,
            colorClass: 'sc-blue',
        },
        {
            label: 'Completed',
            value: completed,
            delta: `${percent(completed, TODAY_TASKS.length)}% achieved`,
            up: true,
            icon: CheckCircle2,
            colorClass: 'sc-green',
        },
        {
            label: 'In Progress',
            value: inProgress,
            delta: 'on the way',
            up: null,
            icon: Truck,
            colorClass: 'sc-orange',
        },
        {
            label: "Today's Earnings",
            value: formatVND(earningsToday),
            delta: '+12% vs yesterday',
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
                        {getGreeting()}, <span>{DRIVER.name}</span>!
                    </h1>
                    {(loading || error) && (
                        <p className="dov-banner-date">
                            {loading ? 'Loading live dashboard...' : 'Showing fallback dashboard data'}
                        </p>
                    )}
                    <div className="dov-banner-badges">
                        <span className="dov-badge dov-badge-rating">
                            <Star size={13} fill="currentColor" />
                            {DRIVER.rating}
                        </span>
                        <span className="dov-badge dov-badge-deliveries">
                            <Package size={13} />
                            {DRIVER.totalDeliveries} trips
                        </span>
                        <span className="dov-badge dov-badge-zap">
                            <Zap size={13} fill="currentColor" />
                            {DRIVER.badge ?? 'Top Shipper'}
                        </span>
                    </div>
                </div>

                <button
                    className={`dov-status-toggle${online ? ' is-online' : ' is-offline'}`}
                    onClick={() => setOnline(v => !v)}
                >
                    {online
                        ? <><ToggleRight size={22} strokeWidth={2} /><span>Online</span></>
                        : <><ToggleLeft size={22} strokeWidth={2} /><span>Offline</span></>
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
                                <div className="dov-stat-label">{s.label}</div>
                            </div>
                            {s.up !== null && (
                                <div className={`dov-stat-delta ${s.up ? 'up' : 'down'}`}>
                                    {s.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    <span>{s.delta}</span>
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
                                <span>Active Task</span>
                                <span className="dov-pulse-dot" />
                            </div>
                            <div className="dov-active-body">
                                <div className="dov-active-type">
                                    {activeTask.type === 'delivery'
                                        ? <><Truck size={13} /> Delivery</>
                                        : <><PackageOpen size={13} /> Pickup</>}
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
                                        <span>Est. arrival at {activeTask.time}</span>
                                    </div>
                                </div>

                                <div className="dov-active-actions">
                                    <button className="dov-btn-outline">
                                        <Phone size={15} />Call Customer
                                    </button>
                                    <button className="dov-btn-done">
                                        <CheckCircle2 size={15} />Confirm Complete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Today's task list */}
                    <div className="dov-card">
                        <div className="dov-card-head">
                            <ClipboardList size={17} />
                            <span>Today's Schedule</span>
                            <span className="dov-head-count">{TODAY_TASKS.length}</span>
                        </div>

                        <div className="dov-task-list">
                            {TODAY_TASKS.map(task => {
                                const meta = STATUS_META[task.status]
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

                                        <span className={`dov-status-badge ${meta.cls}`}>
                                            {meta.label}
                                        </span>

                                        <button className="dov-task-chevron" aria-label="Chi tiết">
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
                            <span>This Week's Earnings</span>
                        </div>
                        <div className="dov-earnings-summary">
                            <div className="dov-earnings-total">{formatVND(weekTotal)}</div>
                            <div className="dov-earnings-change up">
                                <ArrowUpRight size={13} /> +12% vs last week
                            </div>
                        </div>

                        <div className="dov-bar-chart" aria-label="Weekly earnings bar chart">
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
                            <span>Performance</span>
                        </div>

                        <div className="dov-perf-list">
                            {[
                                { label: 'Completion Rate', value: driverPerformance.completionRate, color: 'perf-blue' },
                                { label: 'On Time', value: driverPerformance.onTimeRate, color: 'perf-mint' },
                                { label: 'Customer Satisfaction', value: driverPerformance.satisfactionRate, color: 'perf-gold' },
                            ].map(p => (
                                <div className="dov-perf-row" key={p.label}>
                                    <div className="dov-perf-meta">
                                        <span className="dov-perf-label">{p.label}</span>
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
                            <span className="dov-rating-sub">/ 5.0  —  Overall Rating</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
