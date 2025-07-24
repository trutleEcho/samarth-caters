// Represents the normalized DB table: orders
export interface Order {
    id: string
    order_number: string
    customer_id: number
    status: 'pending' | 'confirmed' | 'paid' | 'cancelled'
    notes?: string
    created_at: Date
    total_amount: number
    balance: number
}