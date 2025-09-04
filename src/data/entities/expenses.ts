export interface Expenses {
    id: string
    description: string
    amount: number
    category?: string
    expense_date?: Date
    notes?: string
    created_at: Date
    updated_at?: Date
}
