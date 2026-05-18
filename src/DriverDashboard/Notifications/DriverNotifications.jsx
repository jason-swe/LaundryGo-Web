import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Bell,
    BellOff,
    ClipboardList,
    DollarSign,
    Star,
    Trophy,
    Calendar,
    Settings,
    RefreshCw,
    ChevronRight,
    CheckCheck,
    Circle,
} from 'lucide-react'
import { driverNotifications } from '../../data/index'
import { useTranslation, localizePath } from '../../shared/lib/i18n'
import './DriverNotifications.css'

/* ──────────────────────────────────────────────
   Config
   ────────────────────────────────────────────── */
const TYPE_CONFIG = {
    task: { icon: ClipboardList, colorClass: 'dn-icon-task', labelKey: 'task' },
    earnings: { icon: DollarSign, colorClass: 'dn-icon-earnings', labelKey: 'earnings' },
    rating: { icon: Star, colorClass: 'dn-icon-rating', labelKey: 'rating' },
    achievement: { icon: Trophy, colorClass: 'dn-icon-achievement', labelKey: 'achievement' },
    reminder: { icon: ClipboardList, colorClass: 'dn-icon-task', labelKey: 'reminder' },
    schedule: { icon: Calendar, colorClass: 'dn-icon-schedule', labelKey: 'schedule' },
    system: { icon: Settings, colorClass: 'dn-icon-system', labelKey: 'system' },
}

const FILTERS = [
    { id: 'all', labelKey: 'all' },
    { id: 'unread', labelKey: 'unread' },
    { id: 'task', labelKey: 'tasks' },
    { id: 'earnings', labelKey: 'earnings' },
    { id: 'system', labelKey: 'system' },
]

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */
function formatTime(ts, language) {
    const d = new Date(ts)
    return d.toLocaleTimeString(language === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function getDateGroup(ts, language, t) {
    const date = new Date(ts)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return t('driver.notifications.today')
    if (date.toDateString() === yesterday.toDateString()) return t('driver.notifications.yesterday')
    return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

function groupByDate(items, language, t) {
    const groups = {}
    items.forEach(item => {
        const key = getDateGroup(item.timestamp, language, t)
        if (!groups[key]) groups[key] = []
        groups[key].push(item)
    })
    return groups
}

/* ──────────────────────────────────────────────
   NotificationItem
   ────────────────────────────────────────────── */
function NotificationItem({ item, onRead }) {
    const { language, t } = useTranslation()
    const navigate = useNavigate()
    const cfg = TYPE_CONFIG[item.category] ?? TYPE_CONFIG.system
    const Icon = cfg.icon

    function handleClick() {
        onRead(item.id)
        if (item.actionUrl) navigate(localizePath(item.actionUrl, language))
    }

    return (
        <div
            className={`dn-item${item.read ? ' dn-item-read' : ' dn-item-unread'}`}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && handleClick()}
        >
            {/* Unread dot */}
            {!item.read && <span className="dn-unread-dot" />}

            {/* Type icon */}
            <div className={`dn-item-icon ${cfg.colorClass}`}>
                <Icon size={18} />
            </div>

            {/* Body */}
            <div className="dn-item-body">
                <div className="dn-item-top">
                    <span className="dn-item-title">{item.title}</span>
                    {item.priority === 'high' && (
                        <span className="dn-priority-badge">{t('driver.notifications.urgent')}</span>
                    )}
                </div>
                <p className="dn-item-message">{item.message}</p>
                <div className="dn-item-meta">
                    <span className="dn-item-time">{formatTime(item.timestamp, language)}</span>
                    <span className="dn-item-cat">{t(`driver.notifications.type.${cfg.labelKey}`)}</span>
                </div>
            </div>

            {/* Arrow */}
            {item.actionUrl && (
                <ChevronRight size={16} className="dn-item-arrow" />
            )}
        </div>
    )
}

/* ──────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────── */
export default function DriverNotifications() {
    const { language, t } = useTranslation()
    const [notifications, setNotifications] = useState(driverNotifications ?? [])
    const [activeFilter, setActiveFilter] = useState('all')

    const unreadCount = notifications.filter(n => !n.read).length

    function markRead(id) {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        )
    }

    function markAllRead() {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    // Filter logic
    const filtered = notifications.filter(n => {
        if (activeFilter === 'all') return true
        if (activeFilter === 'unread') return !n.read
        if (activeFilter === 'task') return n.category === 'task' || n.category === 'reminder' || n.category === 'schedule'
        if (activeFilter === 'earnings') return n.category === 'earnings'
        if (activeFilter === 'system') return n.category === 'system' || n.category === 'achievement'
        return true
    })

    // Sort newest first
    const sorted = [...filtered].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    const grouped = groupByDate(sorted, language, t)
    const dateKeys = Object.keys(grouped)

    return (
        <div className="dn-page">

            {/* ── Page header ── */}
            <div className="dn-page-header">
                <div className="dn-title-wrap">
                    <Bell size={22} className="dn-title-icon" />
                    <div>
                        <h1 className="dn-page-title">{t('notifications.title')}</h1>
                        <p className="dn-page-subtitle">
                            {unreadCount > 0
                                ? `${unreadCount} ${t('driver.notifications.unreadNotifications')}`
                                : t('driver.notifications.allCaughtUp')}
                        </p>
                    </div>
                </div>

                {unreadCount > 0 && (
                    <button className="dn-mark-all-btn" onClick={markAllRead}>
                        <CheckCheck size={15} />
                        {t('notifications.markAllAsRead')}
                    </button>
                )}
            </div>

            {/* ── Filter tabs ── */}
            <div className="dn-filters">
                {FILTERS.map(f => {
                    const count = f.id === 'unread'
                        ? notifications.filter(n => !n.read).length
                        : f.id === 'task'
                            ? notifications.filter(n => ['task', 'reminder', 'schedule'].includes(n.category)).length
                            : f.id === 'earnings'
                                ? notifications.filter(n => n.category === 'earnings').length
                                : f.id === 'system'
                                    ? notifications.filter(n => ['system', 'achievement'].includes(n.category)).length
                                    : null
                    return (
                        <button
                            key={f.id}
                            className={`dn-filter-btn${activeFilter === f.id ? ' dn-filter-active' : ''}`}
                            onClick={() => setActiveFilter(f.id)}
                        >
                            {t(`driver.notifications.filters.${f.labelKey}`)}
                            {count !== null && count > 0 && (
                                <span className="dn-filter-count">{count}</span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* ── Notification list ── */}
            {dateKeys.length === 0 ? (
                <div className="dn-empty">
                    <BellOff size={42} />
                    <p>{t('driver.notifications.noNotificationsFound')}</p>
                </div>
            ) : (
                dateKeys.map(dateKey => (
                    <div key={dateKey} className="dn-group">
                        <div className="dn-group-label">
                            <RefreshCw size={12} />
                            {dateKey}
                        </div>
                        <div className="dn-group-list">
                            {grouped[dateKey].map(item => (
                                <NotificationItem
                                    key={item.id}
                                    item={item}
                                    onRead={markRead}
                                />
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}
