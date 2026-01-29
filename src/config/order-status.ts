export const STATUS_FLOW: Record<string, string[]> = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
}

export const STATUS_CONFIG = {
    pending: {
        label: 'Pending',
        color: 'bg-yellow-500',
        description: 'Order awaiting confirmation'
    },
    processing: {
        label: 'Processing',
        color: 'bg-blue-500',
        description: 'Order is being prepared'
    },
    shipped: {
        label: 'Shipped',
        color: 'bg-purple-500',
        description: 'Order is in transit'
    },
    delivered: {
        label: 'Delivered',
        color: 'bg-green-500',
        description: 'Order successfully delivered'
    },
    cancelled: {
        label: 'Cancelled',
        color: 'bg-red-500',
        description: 'Order has been cancelled'
    },
}

export const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
    value,
    ...config
}))
