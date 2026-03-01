import './AdminNotifications.css'
import { CloseOutlined } from '@ant-design/icons'

function AdminNotifications({ onClose }) {
    return (
        <div className="admin-notifications-overlay" onClick={onClose}>
            <div className="admin-notifications-panel" onClick={(e) => e.stopPropagation()}>
                <div className="admin-notifications-header">
                    <h2>Notifications</h2>
                    <button onClick={onClose}>
                        <CloseOutlined />
                    </button>
                </div>
                <p>Admin notifications - Coming soon</p>
            </div>
        </div>
    )
}

export default AdminNotifications
