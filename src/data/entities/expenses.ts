export interface Expenses {
    id: string // UUID
    title: string
    note?: string
    meta?: JSON
    amount: number
    created_at: Date
}