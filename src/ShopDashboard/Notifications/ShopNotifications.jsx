import './ShopNotifications.css'
import {
    ShoppingOutlined,
    SettingOutlined,
    WarningOutlined,
    InfoCircleOutlined,
    BellOutlined,
    CloseOutlined
} from '@ant-design/icons'

function ShopNotifications({ onClose }) {
    const notifications = [
        {
            id: 1,
            type: 'order',
            title: 'New Order Received',
            message: 'Order #ORD-045 from Nguyễn Văn A',
            time: '5 minutes ago',
            unread: true
        },
        {
            id: 2,
            type: 'machine',
            title: 'Machine Ready',
            message: 'Washer A2 finished cycle',
            time: '15 minutes ago',
            unread: true
        },
        {
            id: 3,
            type: 'supply',
            title: 'Low Supply Alert',
            message: 'Fabric Softener is running low (8%)',
            time: '1 hour ago',
            unread: true
        },
        {
            id: 4,
            type: 'system',
            title: 'System Update',
            message: 'New features available in dashboard',
            time: '2 hours ago',
            unread: false
        },
        {
            id: 5,
            type: 'order',
            title: 'Order Completed',
            message: 'Order #ORD-043 is ready for pickup',
            time: '3 hours ago',
            unread: false
        }
    ]

    const getTypeIcon = (type) => {
        switch (type) {
            case 'order':
                return ShoppingOutlined
            case 'machine':
                return SettingOutlined
            case 'supply':
                return WarningOutlined
            case 'system':
                return InfoCircleOutlined
            default:
                return BellOutlined
        }
    }

    return (
        <div className="shop-notifications-overlay" onClick={onClose}>
            <div className="shop-notifications-panel" onClick={(e) => e.stopPropagation()}>
                <div className="shop-notifications-header">
                    <h2 className="shop-notifications-title">Notifications</h2>
                    <button className="shop-notifications-close" onClick={onClose}>
                        <CloseOutlined />
                    </button>
                </div>

                <div className="shop-notifications-actions">
                    <button className="shop-notifications-action-btn">Mark all as read</button>
                    <button className="shop-notifications-action-btn">Clear all</button>
                </div>

                <div className="shop-notifications-list">
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
