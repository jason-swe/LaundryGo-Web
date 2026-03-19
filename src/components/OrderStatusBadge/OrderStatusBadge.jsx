import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    SyncOutlined,
    CarOutlined,
} from '@ant-design/icons'
import './OrderStatusBadge.css'

const STATUS_META = {
    'pending-checkin': {
        label: 'Pending Check-in',
        tone: 'pending',
        icon: ClockCircleOutlined,
    },
    'washing': {
        label: 'Washing',
        tone: 'processing',
        icon: SyncOutlined,
        spinning: true,
    },
    'drying': {
        label: 'Drying',
        tone: 'processing',
        icon: SyncOutlined,
        spinning: true,
    },
    'ironing': {
        label: 'Ironing',
        tone: 'processing',
        icon: SyncOutlined,
        spinning: true,
    },
    'ready': {
        label: 'Ready for Delivery',
        tone: 'ready',
        icon: CarOutlined,
    },
    'delivering': {
        label: 'Out for Delivery',
        tone: 'processing',
        icon: CarOutlined,
    },
    'completed': {
        label: 'Completed',
        tone: 'completed',
        icon: CheckCircleOutlined,
    },
    'cancelled': {
        label: 'Cancelled',
        tone: 'completed',
        icon: CheckCircleOutlined,
    },
}

const NEXT_STATUS = {
    'washing': { status: 'drying', label: 'Move to Drying' },
    'drying': { status: 'ironing', label: 'Move to Ironing' },
    'ironing': { status: 'ready', label: 'Mark Ready' },
    'ready': { status: 'delivering', label: 'Start Delivery' },
    'delivering': { status: 'completed', label: 'Complete Order' },
}

export const getOrderStatusMeta = (status) => (
    STATUS_META[status] || {
        label: status,
        tone: 'completed',
        icon: CheckCircleOutlined,
    }
)

export const getNextOrderStatusInfo = (status) => NEXT_STATUS[status] || null

function OrderStatusBadge({
    status,
    onQuickAction,
    quickActionLabel,
    compact = false,
}) {
    const meta = getOrderStatusMeta(status)
    const nextAction = getNextOrderStatusInfo(status)
    const IconComponent = meta.icon
    const actionLabel = quickActionLabel || nextAction?.label

    return (
        <div className={`order-status-badge-row${compact ? ' order-status-badge-row-compact' : ''}`}>
            <span className={`order-status-pill order-status-pill-${meta.tone}`}>
                <IconComponent spin={meta.spinning} />
                <span>{meta.label}</span>
            </span>

            {onQuickAction && actionLabel && (
                <button
                    type="button"
                    className={`order-status-quick-action${compact ? ' order-status-quick-action-compact' : ''}`}
                    onClick={onQuickAction}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    )
}

export default OrderStatusBadge