import { useEffect } from 'react'
import './Toast.css'
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined,
    CloseOutlined
} from '@ant-design/icons'

function Toast({ message, type = 'success', duration = 3000, onClose }) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose()
            }, duration)

            return () => clearTimeout(timer)
        }
    }, [duration, onClose])

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircleOutlined className="toast-icon" />
            case 'error':
                return <CloseCircleOutlined className="toast-icon" />
            case 'warning':
                return <ExclamationCircleOutlined className="toast-icon" />
            case 'info':
                return <InfoCircleOutlined className="toast-icon" />
            default:
                return <CheckCircleOutlined className="toast-icon" />
        }
    }

    return (
        <div className={`toast toast-${type}`}>
            <div className="toast-content">
                {getIcon()}
                <span className="toast-message">{message}</span>
            </div>
            <button className="toast-close" onClick={onClose}>
                <CloseOutlined />
            </button>
        </div>
    )
}

export default Toast
