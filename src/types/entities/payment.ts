// Represents the normalized DB table: payments
export interface Payment {
    id: string
    order_id: number
    payment_method: 'cash' | 'upi' | 'card' | string
    amount: number
    created_at: Date
}