import { useState } from 'react'
import './AdminNotifications.css'
import {
    CloseOutlined,
    CheckOutlined,
    DeleteOutlined,
    BellOutlined,
    ShopOutlined,
    WarningOutlined,
    DollarOutlined,
    CarOutlined,
    FileTextOutlined,
    UserOutlined
} from '@ant-design/icons'
import { adminNotifications as notificationsData } from '../../data'
import toast from '../../utils/toast'

function AdminNotifications({ onClose }) {
    const [notifications, setNotifications] = useState(notificationsData)

    const unreadCount = notifications.filter(n => !n.read).length

    const handleMarkRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    }

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        toast.success('All notifications marked as read')
    }

    const handleClearAll = () => {
        setNotifications([])
        toast.info('All notifications cleared')
    }

    const handleDismiss = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    const getTypeIcon = (type) => {
        const icons = {
            approval: <ShopOutlined />,
            incident: <WarningOutlined />,
            payment: <DollarOutlined />,
            shipper: <CarOutlined />,
            document: <FileTextOutlined />,
            complaint: <UserOutlined />
        }
        return icons[type] || <BellOutlined />
    }

    const getTypeColor = (type) => {
        const colors = {
            approval: '#719FC2',
            incident: '#c05a50',
            payment: '#5492b4',
            shipper: '#4d9e84',
            document: '#719FC2',
            complaint: '#5492b4'
        }
        return colors[type] || '#6b7280'
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#c05a50'
            case 'medium': return '#5492b4'
            case 'low': return '#4d9e84'
            default: return '#6b7280'
        }
    }

    const formatTime = (timestamp) => {
        const date = new Date(timestamp)
        return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
    }

    return (
        <div className="admin-notifications-overlay" onClick={onClose}>
            <div className="admin-notifications-panel" onClick={(e) => e.stopPropagation()}>
                <div className="admin-notifications-header">
                    <div className="notif-header-left">
                        <h2>
                            <BellOutlined style={{ marginRight: 8 }} />
                            Notifications
                        </h2>
                        {unreadCount > 0 && (
                            <span className="notif-unread-badge">{unreadCount}</span>
                        )}
                    </div>
                    <div className="notif-header-actions">
                        {unreadCount > 0 && (
                            <button className="notif-action-btn" onClick={handleMarkAllRead}>
                                <CheckOutlined /> Mark all read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button className="notif-action-btn danger" onClick={handleClearAll}>
                                <DeleteOutlined /> Clear all
                            </button>
                        )}
                        <button className="notif-close-btn" onClick={onClose}>
                            <CloseOutlined />
                        </button>
                    </div>
                </div>

                <div className="admin-notifications-list">
                    {notifications.length === 0 && (
                        <div className="notif-empty">
                            <BellOutlined style={{ fontSize: '40px', color: '#d1d5db' }} />
                            <p>No notifications</p>
                        </div>
                    )}
                    {notifications.map(notif => (
                        <div
                            key={notif.id}
                            className={'admin-notif-item' + (!notif.read ? ' unread' : '')}
                            onClick={() => handleMarkRead(notif.id)}
                        >
                            <div
                                className="notif-type-icon"
                                style={{ background: getTypeColor(notif.type) + '20', color: getTypeColor(notif.type) }}
                            >
                                {getTypeIcon(notif.type)}
                            </div>
                            <div className="notif-content">
                                <div className="notif-top-row">
                                    <span className="notif-title">{notif.title}</span>
                                    <span
                                        className="notif-priority-dot"
                                        style={{ background: getPriorityColor(notif.priority) }}
                                        title={notif.priority + ' priority'}
                                    />
                                </div>
                                <p className="notif-message">{notif.message}</p>
                                <div className="notif-bottom-row">
                                    <span className="notif-time">{formatTime(notif.timestamp)}</span>
                                    {!notif.read && <span className="notif-unread-label">New</span>}
                                </div>
                            </div>
                            <button
                                className="notif-dismiss-btn"
                                onClick={(e) => { e.stopPropagation(); handleDismiss(notif.id) }}
                                title="Dismiss"
                            >
                                <CloseOutlined />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AdminNotifications

