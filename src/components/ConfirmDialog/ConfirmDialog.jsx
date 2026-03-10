import './ConfirmDialog.css'
import { ExclamationCircleOutlined, CloseOutlined } from '@ant-design/icons'

function ConfirmDialog({ title, message, onConfirm, onCancel, confirmText = 'OK', cancelText = 'Cancel', type = 'warning' }) {
    return (
        <div className="confirm-dialog-overlay" onClick={onCancel}>
            <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                <button className="confirm-dialog-close" onClick={onCancel}>
                    <CloseOutlined />
                </button>

                <div className="confirm-dialog-content">
                    <div className={`confirm-dialog-icon confirm-dialog-icon-${type}`}>
                        <ExclamationCircleOutlined />
                    </div>

                    <div className="confirm-dialog-text">
                        <h3 className="confirm-dialog-title">{title}</h3>
                        <p className="confirm-dialog-message">{message}</p>
                    </div>
                </div>

                <div className="confirm-dialog-actions">
                    <button className="confirm-btn-cancel" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className={`confirm-btn-confirm confirm-btn-${type}`} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog
