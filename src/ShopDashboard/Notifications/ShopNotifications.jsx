import { useState } from 'react'
import './ShopNotifications.css'
import { ShoppingBag, Settings, AlertTriangle, Info, Bell, X } from 'lucide-react'
import { notifications as notificationsData } from '../../data'
import toast from '../../utils/toast'

function toTimeAgo(timestamp) {
    const diffMinutes = Math.floor((new Date() - new Date(timestamp)) / 60000)
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
    return `${Math.floor(diffMinutes / 1440)}d ago`
}

const TYPE_ICON = {
    order: ShoppingBag,
    machine: Settings,
    supply: AlertTriangle,
    system: Info,
}

function ShopNotifications({ onClose, onAllRead }) {
    // Function initializer so timestamps are fresh each time the panel opens
    const [notifications, setNotifications] = useState(() =>
        notificationsData.map(n => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            time: toTimeAgo(n.timestamp),
            unread: !n.read
        }))
    )

    const unreadCount = notifications.filter(n => n.unread).length

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
        onAllRead?.()
        toast.success('All notifications marked as read')
    }

    const handleDismiss = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    const handleMarkRead = (id) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, unread: false } : n
        ))
    }

    const handleClearAll = () => {
        setNotifications([])
        onAllRead?.()
        toast.success('All notifications cleared')
    }

    return (
        <div className="shop-notifications-overlay" onClick={onClose}>
            <div className="shop-notifications-panel" onClick={(e) => e.stopPropagation()}>
                <div className="shop-notifications-header">
                    <h2 className="shop-notifications-title">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="shop-notif-badge">{unreadCount}</span>
                        )}
                    </h2>
                    <button className="shop-notifications-close" onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <div className="shop-notifications-actions">
                    <button
                        className="shop-notifications-action-btn"
                        onClick={handleMarkAllRead}
                        disabled={unreadCount === 0}
                    >
                        Mark all as read
                    </button>
                    <button
                        className="shop-notifications-action-btn shop-notifications-action-clear"
                        onClick={handleClearAll}
                        disabled={notifications.length === 0}
                    >
                        Clear all
                    </button>
                </div>

                <div className="shop-notifications-list">
                    {notifications.length === 0 && (
                        <div className="shop-notif-empty">
                            <Bell className="shop-notif-empty-icon" size={32} />
                            <p>You're all caught up!</p>
                        </div>
                    )}
                    {notifications.map((notification) => {
                        const IconComponent = TYPE_ICON[notification.type] || Bell
                        return (
                            <div
                                key={notification.id}
                                className={`shop-notifications-item${notification.unread ? ' shop-notifications-item-unread' : ''}`}
                                onClick={() => handleMarkRead(notification.id)}
                                role="button"
                                tabIndex={0}
                            >
                                <div className={`shop-notifications-item-icon shop-notif-icon-${notification.type}`}>
                                    <IconComponent size={18} />
                                </div>
                                <div className="shop-notifications-item-content">
                                    <div className="shop-notifications-item-title">
                                        {notification.title}
                                        {notification.unread && (
                                            <span className="shop-notifications-unread-dot" />
                                        )}
                                    </div>
                                    <div className="shop-notifications-item-message">
                                        {notification.message}
                                    </div>
                                    <div className="shop-notifications-item-time">
                                        {notification.time}
                                    </div>
                                </div>
                                <button
                                    className="shop-notif-dismiss"
                                    onClick={(e) => { e.stopPropagation(); handleDismiss(notification.id) }}
                                    aria-label="Dismiss"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default ShopNotifications
