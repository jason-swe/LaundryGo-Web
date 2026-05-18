import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    SyncOutlined,
    CarOutlined,
} from '@ant-design/icons'
import './OrderStatusBadge.css'
import { useTranslation } from '../../shared/lib/i18n'

const STATUS_META = {
    'pending-checkin': {
        labelKey: 'orderStatus.pendingCheckin',
        fallbackLabel: 'Pending Check-in',
        tone: 'pending',
        icon: ClockCircleOutlined,
    },
    'washing': {
        labelKey: 'orderStatus.washing',
        fallbackLabel: 'Washing',
        tone: 'processing',
        icon: SyncOutlined,
        spinning: true,
    },
    'drying': {
        labelKey: 'orderStatus.drying',
        fallbackLabel: 'Drying',
        tone: 'processing',
        icon: SyncOutlined,
        spinning: true,
    },
    'ironing': {
        labelKey: 'orderStatus.ironing',
        fallbackLabel: 'Ironing',
        tone: 'processing',
        icon: SyncOutlined,
        spinning: true,
    },
    'ready': {
        labelKey: 'orderStatus.readyForDelivery',
        fallbackLabel: 'Ready for Delivery',
        tone: 'ready',
        icon: CarOutlined,
    },
    'delivering': {
        labelKey: 'orderStatus.outForDelivery',
        fallbackLabel: 'Out for Delivery',
        tone: 'processing',
        icon: CarOutlined,
    },
    'completed': {
        labelKey: 'orderStatus.completed',
        fallbackLabel: 'Completed',
        tone: 'completed',
        icon: CheckCircleOutlined,
    },
    'cancelled': {
        labelKey: 'orderStatus.cancelled',
        fallbackLabel: 'Cancelled',
        tone: 'completed',
        icon: CheckCircleOutlined,
    },
}

const NEXT_STATUS = {
    'washing': { status: 'drying', labelKey: 'orderStatusActions.moveToDrying', fallbackLabel: 'Move to Drying' },
    'drying': { status: 'ironing', labelKey: 'orderStatusActions.moveToIroning', fallbackLabel: 'Move to Ironing' },
    'ironing': { status: 'ready', labelKey: 'orderStatusActions.markReady', fallbackLabel: 'Mark Ready' },
    'ready': { status: 'delivering', labelKey: 'orderStatusActions.startDelivery', fallbackLabel: 'Start Delivery' },
    'delivering': { status: 'completed', labelKey: 'orderStatusActions.completeOrder', fallbackLabel: 'Complete Order' },
}

export const getOrderStatusMeta = (status, t) => {
    const meta = STATUS_META[status]
    if (!meta) {
        return {
            label: status,
            tone: 'completed',
            icon: CheckCircleOutlined,
        }
    }

    return {
        ...meta,
        label: typeof t === 'function' ? t(meta.labelKey) : meta.fallbackLabel,
    }
}

export const getNextOrderStatusInfo = (status, t) => {
    const next = NEXT_STATUS[status]
    if (!next) return null
    return {
        ...next,
        label: typeof t === 'function' ? t(next.labelKey) : next.fallbackLabel,
    }
}

function OrderStatusBadge({
    status,
    onQuickAction,
    quickActionLabel,
    compact = false,
}) {
    const { t } = useTranslation()
    const meta = getOrderStatusMeta(status, t)
    const nextAction = getNextOrderStatusInfo(status, t)
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