// Date formatting helper utilities for exports

export function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
}

export function getDayName(dateString: string): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const date = new Date(dateString)
    return days[date.getDay()]
}

export function getDate(dateString: string): number {
    const date = new Date(dateString)
    return date.getDate()
}

export function getMonthName(dateString: string): string {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]
    const date = new Date(dateString)
    return months[date.getMonth()]
}

export function getYear(dateString: string): number {
    const date = new Date(dateString)
    return date.getFullYear()
}

export function formatDateTime(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    })
}

export function getDateRangeString(from?: string, to?: string): string {
    if (!from || !to) return 'All Time'
    return `${formatDate(from)} to ${formatDate(to)}`
}
