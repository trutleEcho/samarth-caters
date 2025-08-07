export interface Expenses {
    id: string
    title: string
    amount: number
    category: 'INGREDIENTS' | 'EQUIPMENT' | 'TRANSPORTATION' | 'STAFF' | 'MARKETING' | 'UTILITIES' | 'OTHER'
    description?: string
    date: string
    created_at: Date
}
