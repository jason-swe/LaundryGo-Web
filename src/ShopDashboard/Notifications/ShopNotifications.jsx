import { useState } from 'react'
import './ShopNotifications.css'
import {
    ShoppingOutlined,
    SettingOutlined,
    WarningOutlined,
    InfoCircleOutlined,
    BellOutlined,
    CloseOutlined
} from '@ant-design/icons'
import { notifications as notificationsData } from '../../data'
import toast from '../../utils/toast'

function toTimeAgo(timestamp) {
    const diffMinutes = Math.floor((new Date() - new Date(timestamp)) / 60000)
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`
    return `${Math.floor(diffMinutes / 1440)} days ago`
}

const initialNotifications = notificationsData.map(n => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    time: toTimeAgo(n.timestamp),
    unread: !n.read
}))

function ShopNotifications({ onClose }) {
    const [notifications, setNotifications] = useState(initialNotifications)

    const unreadCount = notifications.filter(n => n.unread).length

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
        toast.success('All notifications marked as read')
    }

    const handleClearAll = () => {
        setNotifications([])
        toast.success('All notifications cleared')
    }

    const getTypeIcon = (type) => {
        switch (type) {
            case 'order': return ShoppingOutlined
            case 'machine': return SettingOutlined
            case 'supply': return WarningOutlined
            case 'system': return InfoCircleOutlined
            default: return BellOutlined
        }
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
                    <button className="shop-notifications-close" onClick={onClose}>
                        <CloseOutlined />
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
                        className="shop-notifications-action-btn"
                        onClick={handleClearAll}
                        disabled={notifications.length === 0}
                    >
                        Clear all
                    </button>
                </div>

                <div className="shop-notifications-list">
                    {notifications.length === 0 && (
                        <div className="shop-notif-empty">
                            <BellOutlined style={{ fontSize: 32, color: '#d1d5db' }} />
                            <p>No notifications</p>
                        </div>
                    )}
                    {notifications.map((notification) => {
                        const IconComponent = getTypeIcon(notification.type)
                        return (
                            <div
                                key={notification.id}
                                className={`shop-notifications-item ${notification.unread ? 'shop-notifications-item-unread' : ''}`}
                            >
                                <div className="shop-notifications-item-icon">
                                    <IconComponent style={{ fontSize: '20px' }} />
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
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default ShopNotifications
