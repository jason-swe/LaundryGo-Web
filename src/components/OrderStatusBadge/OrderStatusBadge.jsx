import { getNextOrderStatusInfo, getOrderStatusMeta } from './orderStatus'
import './OrderStatusBadge.css'

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
