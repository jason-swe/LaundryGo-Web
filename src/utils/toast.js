// Toast utility functions for easy usage
// Usage: toast.success('Message'), toast.error('Message'), etc.

export const toast = {
    success: (message, duration = 3000) => {
        if (window.showToast) {
            window.showToast(message, 'success', duration)
        }
    },
    error: (message, duration = 4000) => {
        if (window.showToast) {
            window.showToast(message, 'error', duration)
        }
    },
    warning: (message, duration = 3500) => {
        if (window.showToast) {
            window.showToast(message, 'warning', duration)
        }
    },
    info: (message, duration = 3000) => {
        if (window.showToast) {
            window.showToast(message, 'info', duration)
        }
    }
}

export default toast
