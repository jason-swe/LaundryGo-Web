import './Notifications.css'

function Notifications({ onClose }) {
    const notifications = [
        {
            id: 1,
            type: 'order',
            title: 'Đơn hàng mới',
            message: 'Bạn có 3 đơn hàng mới cần xử lý',
            time: '5 phút trước',
            unread: true
        },
        {
            id: 2,
            type: 'machine',
            title: 'Máy cần bảo trì',
            message: 'Máy giặt M005 cần được kiểm tra và bảo trì',
            time: '30 phút trước',
            unread: true
        },
        {
            id: 3,
            type: 'supply',
            title: 'Cảnh báo vật tư',
            message: 'Nước xả vải sắp hết. Cần nhập thêm ngay.',
            time: '1 giờ trước',
            unread: true
        },
        {
            id: 4,
            type: 'document',
            title: 'Giấy tờ sắp hết hạn',
            message: 'Giấy cam kết vệ sinh môi trường sẽ hết hạn trong 30 ngày',
            time: '2 giờ trước',
            unread: false
        },
        {
            id: 5,
            type: 'staff',
            title: 'Nhân viên vắng mặt',
            message: 'Nhân viên Phạm Thị D chưa check-in ca chiều',
            time: '3 giờ trước',
            unread: false
        },
        {
            id: 6,
            type: 'order',
            title: 'Đơn hàng hoàn thành',
            message: '15 đơn hàng đã hoàn thành và sẵn sàng giao',
            time: 'Hôm qua',
            unread: false
        }
    ]

    const getIcon = (type) => {
        switch (type) {
            case 'order':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 11H3v10h6V11zm12-8h-6v8h6V3zm0 10h-6v10h6V13zM9 3H3v6h6V3z" fill="currentColor" />
                    </svg>
                )
            case 'machine':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" fill="currentColor" />
                    </svg>
                )
            case 'supply':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2v14H3v3c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V2l-1.5 1.5zM19 19c0 .55-.45 1-1 1s-1-.45-1-1v-3H8V5h11v14z" fill="currentColor" />
                    </svg>
                )
            case 'document':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" fill="currentColor" />
                    </svg>
                )
            case 'staff':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3z" fill="currentColor" />
                    </svg>
                )
            default:
                return null
        }
    }

    const getIconColor = (type) => {
        switch (type) {
            case 'order': return '#3b82f6'
            case 'machine': return '#5492b4'
            case 'supply': return '#ef4444'
            case 'document': return '#8b5cf6'
            case 'staff': return '#10b981'
            default: return '#64748b'
        }
    }

    return (
        <div className="notifications-panel">
            <div className="notifications-header">
                <h2>Thông báo</h2>
                <div className="header-actions">
                    <button className="mark-read-btn">Đánh dấu đã đọc</button>
                    {onClose && (
                        <button className="close-btn" onClick={onClose}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="notifications-list">
                {notifications.map((notif) => (
                    <div key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`}>
                        <div className="notif-icon" style={{ color: getIconColor(notif.type) }}>
                            {getIcon(notif.type)}
                        </div>
                        <div className="notif-content">
                            <div className="notif-title">{notif.title}</div>
                            <div className="notif-message">{notif.message}</div>
                            <div className="notif-time">{notif.time}</div>
                        </div>
                        {notif.unread && <div className="unread-dot" />}
                    </div>
                ))}
            </div>

            <div className="notifications-footer">
                <button className="view-all-btn">Xem tất cả thông báo</button>
            </div>
        </div>
    )
}

export default Notifications
