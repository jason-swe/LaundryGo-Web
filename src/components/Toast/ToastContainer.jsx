import { useState, useCallback } from 'react'
import Toast from './Toast'
import './Toast.css'

let toastId = 0

function ToastContainer() {
    const [toasts, setToasts] = useState([])

    const removeToast = useCallback((id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, [])

    // This function will be called from outside via window object
    window.showToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = toastId++
        setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }])
    }, [])

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    )
}

export default ToastContainer
