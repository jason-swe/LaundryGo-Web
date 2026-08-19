import {
    CarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    SyncOutlined,
} from '@ant-design/icons'

const STATUS_META = {
    pending: { label: 'Pending acceptance', tone: 'pending', icon: ClockCircleOutlined },
    confirmed: { label: 'Awaiting laundry receipt', tone: 'pending', icon: ClockCircleOutlined },
    'picking-up': { label: 'Receiving laundry', tone: 'processing', icon: CarOutlined },
    'at-store': { label: 'Pending check-in', tone: 'pending', icon: ClockCircleOutlined },
    'waiting-customer-confirmation': {
        label: 'Waiting for customer confirmation',
        tone: 'pending',
        icon: ClockCircleOutlined,
    },
    washing: { label: 'Washing', tone: 'processing', icon: SyncOutlined, spinning: true },
    drying: { label: 'Drying', tone: 'processing', icon: SyncOutlined, spinning: true },
    ironing: { label: 'Ironing', tone: 'processing', icon: SyncOutlined, spinning: true },
    ready: { label: 'Ready for customer', tone: 'ready', icon: CarOutlined },
    delivering: { label: 'Received — awaiting payment', tone: 'processing', icon: CarOutlined },
    completed: { label: 'Completed', tone: 'completed', icon: CheckCircleOutlined },
    cancelled: { label: 'Cancelled', tone: 'completed', icon: CheckCircleOutlined },
    'cancelled-after-weight-confirmation': {
        label: 'Cancelled after price review',
        tone: 'completed',
        icon: CheckCircleOutlined,
    },
}

const NEXT_STATUS = {
    washing: { status: 'drying', label: 'Move to Drying' },
    drying: { status: 'ironing', label: 'Move to Ironing' },
    ironing: { status: 'ready', label: 'Mark Ready' },
}

export const getOrderStatusMeta = (status) => (
    STATUS_META[status] || {
        label: status,
        tone: 'completed',
        icon: CheckCircleOutlined,
    }
)

export const getNextOrderStatusInfo = (status) => NEXT_STATUS[status] || null
