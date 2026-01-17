/**
 * Format number with thousand separators
 * @example formatNumber(1234567.89) => "1,234,567.89"
 */
export function formatNumber(num: number, decimals: number = 2): string {
    return num.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })
}

/**
 * Format currency with Rs. prefix and thousand separators
 * @example formatCurrency(1234.56) => "Rs. 1,234.56"
 */
export function formatCurrency(amount: number): string {
    return `Rs. ${formatNumber(amount, 2)}`
}

/**
 * Get readable month name from date string
 * @example getReadableMonth("2026-01-16") => "Jan2026"
 */
export function getReadableMonth(dateString: string): string {
    const date = new Date(dateString)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]}${date.getFullYear()}`
}

/**
 * Get readable filename-safe date
 * @example getReadableDate("2026-01-16T10:30:00Z") => "16Jan2026"
 */
export function getReadableDate(dateString?: string): string {
    const date = dateString ? new Date(dateString) : new Date()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${date.getDate()}${months[date.getMonth()]}${date.getFullYear()}`
}
