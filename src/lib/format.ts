import { format, isToday, isTomorrow, isYesterday, isBefore, isAfter, isEqual } from 'date-fns'

export function filterByDateRange<T>(items: T[], dateField: keyof T, startDate: Date | string | null, endDate: Date | string | null): T[] {
    if (!startDate && !endDate) return items

    return items.filter(item => {
        const itemDate = new Date(item[dateField] as string)
        
        if (startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)
            return (isEqual(itemDate, start) || isAfter(itemDate, start)) && 
                   (isEqual(itemDate, end) || isBefore(itemDate, end))
        }

        if (startDate) {
            const start = new Date(startDate)
            return isEqual(itemDate, start) || isAfter(itemDate, start)
        }

        if (endDate) {
            const end = new Date(endDate)
            return isEqual(itemDate, end) || isBefore(itemDate, end)
        }

        return true
    })
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        currencyDisplay: 'symbol',
    }).format(amount)
}

export function formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    if (isToday(dateObj)) return 'Today'
    if (isTomorrow(dateObj)) return 'Tomorrow'
    if (isYesterday(dateObj)) return 'Yesterday'

    return format(dateObj, 'MMM dd, yyyy')
}

export function formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, 'MMM dd, yyyy - hh:mm a')
}

export function generateOrderNumber(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 5)
    return `SC-${timestamp}-${random}`.toUpperCase()
}