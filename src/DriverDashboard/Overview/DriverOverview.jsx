import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    ClipboardList,
    CheckCircle2,
    Clock,
    MapPin,
    Package,
    PackageOpen,
    Phone,
    Truck,
    User,
} from 'lucide-react'
import { getDriverProfile, getTodayDriverTasks } from '../../services/driverApi'
import './DriverOverview.css'

const STATUS_META = {
    completed: { label: 'Completed', cls: 'status-completed' },
    'in-progress': { label: 'In Progress', cls: 'status-inprogress' },
    pending: { label: 'Pending', cls: 'status-pending' },
    cancelled: { label: 'Cancelled', cls: 'status-pending' },
}

function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
}

function normalizeTask(task) {
    return {
        id: task.id || task.taskId,
        type: task.type,
        orderId: task.orderId,
        customer: task.customer?.name || 'Customer',
        address: task.customer?.address || '—',
        phone: task.customer?.phone || '—',
        shop: task.shop?.name || '—',
        time: task.scheduledTime || '—',
        status: task.status,
    }
}

export default function DriverOverview() {
    const [profile, setProfile] = useState(null)
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [errors, setErrors] = useState({ profile: '', tasks: '' })

    const loadOverview = useCallback(() => {
        let active = true
        setLoading(true)
        Promise.allSettled([
            getDriverProfile(),
            getTodayDriverTasks({ size: 50 }),
        ]).then(([profileResult, tasksResult]) => {
            if (!active) return
            setProfile(profileResult.status === 'fulfilled' ? profileResult.value : null)
            setTasks(tasksResult.status === 'fulfilled' ? tasksResult.value.tasks || [] : [])
            setErrors({
                profile: profileResult.status === 'rejected' ? profileResult.reason?.message || 'Could not load your profile' : '',
                tasks: tasksResult.status === 'rejected' ? tasksResult.reason?.message || 'Could not load today’s tasks' : '',
            })
            setLoading(false)
        })

        return () => {
            active = false
        }
    }, [])

    useEffect(() => {
        let cancelRequest = () => {}
        const timer = window.setTimeout(() => {
            cancelRequest = loadOverview()
        }, 0)
        return () => {
            window.clearTimeout(timer)
            cancelRequest()
        }
    }, [loadOverview])

    const todayTasks = useMemo(() => tasks.map(normalizeTask), [tasks])
    const completed = todayTasks.filter((task) => task.status === 'completed').length
    const inProgress = todayTasks.filter((task) => task.status === 'in-progress').length
    const pending = todayTasks.filter((task) => task.status === 'pending').length
    const activeTask = todayTasks.find((task) => task.status === 'in-progress') || null
    const dateLabel = new Intl.DateTimeFormat('en-US', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).format(new Date())
    const hasError = errors.profile || errors.tasks

    return (
        <div className="dov-page">
            <div className="dov-banner">
                <div className="dov-banner-body">
                    <p className="dov-banner-date">{dateLabel}</p>
                    <h1 className="dov-banner-title">
                        {getGreeting()}, <span>{profile?.fullName || 'Shipper'}</span>!
                    </h1>
                    {loading && <p className="dov-banner-date">Loading live dashboard…</p>}
                    {hasError && !loading && <p className="dov-banner-date">Some live data could not be loaded.</p>}
                </div>
                <div className="dov-status-toggle is-online">
                    <User size={20} />
                    <span>{profile?.status || '—'}</span>
                </div>
            </div>

            {hasError && (
                <div className="dov-card">
                    <p>{[errors.profile, errors.tasks].filter(Boolean).join(' ')}</p>
                    <button type="button" className="dov-btn-outline" onClick={loadOverview}>Try again</button>
                </div>
            )}

            <div className="dov-stats">
                {[
                    { label: "Today's Tasks", value: todayTasks.length, icon: ClipboardList, colorClass: 'sc-blue' },
                    { label: 'Completed', value: completed, icon: CheckCircle2, colorClass: 'sc-green' },
                    { label: 'In Progress', value: inProgress, icon: Truck, colorClass: 'sc-orange' },
                    { label: 'Pending', value: pending, icon: Clock, colorClass: 'sc-mint' },
                ].map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div className={`dov-stat ${stat.colorClass}`} key={stat.label}>
                            <div className="dov-stat-icon-wrap"><Icon size={20} /></div>
                            <div className="dov-stat-content">
                                <div className="dov-stat-value">{stat.value}</div>
                                <div className="dov-stat-label">{stat.label}</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="dov-grid">
                <div className="dov-col-main">
                    {activeTask && (
                        <section className="dov-card dov-active-card">
                            <div className="dov-card-head dov-active-head">
                                <Truck size={17} />
                                <span>Active Task</span>
                                <span className="dov-pulse-dot" />
                            </div>
                            <div className="dov-active-body">
                                <div className="dov-active-type">
                                    {activeTask.type === 'delivery' ? <Truck size={13} /> : <PackageOpen size={13} />}
                                    {activeTask.type === 'delivery' ? 'Delivery' : 'Pickup'}
                                </div>
                                <h2 className="dov-active-customer">{activeTask.customer}</h2>
                                <p className="dov-active-order-id">{activeTask.orderId} · {activeTask.shop}</p>
                                <div className="dov-active-info-grid">
                                    <div className="dov-active-info-row"><MapPin size={14} /><span>{activeTask.address}</span></div>
                                    <div className="dov-active-info-row"><Phone size={14} /><span>{activeTask.phone}</span></div>
                                    <div className="dov-active-info-row"><Clock size={14} /><span>{activeTask.time}</span></div>
                                </div>
                            </div>
                        </section>
                    )}

                    <section className="dov-card">
                        <div className="dov-card-head">
                            <ClipboardList size={17} />
                            <span>Today's Schedule</span>
                            <span className="dov-head-count">{todayTasks.length}</span>
                        </div>
                        {loading ? (
                            <p className="dov-task-info">Loading tasks…</p>
                        ) : todayTasks.length === 0 ? (
                            <p className="dov-task-info">No tasks are assigned for today.</p>
                        ) : (
                            <div className="dov-task-list">
                                {todayTasks.map((task) => {
                                    const meta = STATUS_META[task.status] || STATUS_META.pending
                                    return (
                                        <div className={`dov-task-row${task.status === 'in-progress' ? ' dov-task-active' : ''}`} key={task.id}>
                                            <div className="dov-task-time">{task.time}</div>
                                            <div className={`dov-task-type-chip ${task.type === 'delivery' ? 'chip-delivery' : 'chip-pickup'}`}>
                                                {task.type === 'delivery' ? <Truck size={13} /> : <Package size={13} />}
                                            </div>
                                            <div className="dov-task-info">
                                                <div className="dov-task-customer">{task.customer}</div>
                                                <div className="dov-task-addr"><MapPin size={11} />{task.address}</div>
                                            </div>
                                            <span className={`dov-status-badge ${meta.cls}`}>{meta.label}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </section>
                </div>

                <aside className="dov-col-side">
                    <section className="dov-card">
                        <div className="dov-card-head"><User size={17} /><span>Account</span></div>
                        {errors.profile ? (
                            <p className="dov-task-info">Profile information is unavailable.</p>
                        ) : (
                            <div className="dov-task-list">
                                <div className="dov-task-row"><div className="dov-task-info"><div className="dov-task-customer">{profile?.fullName || '—'}</div><div className="dov-task-addr">{profile?.email || '—'}</div></div></div>
                                <div className="dov-task-row"><div className="dov-task-info"><div className="dov-task-customer">Phone</div><div className="dov-task-addr">{profile?.phone || '—'}</div></div></div>
                            </div>
                        )}
                    </section>
                </aside>
            </div>
        </div>
    )
}
