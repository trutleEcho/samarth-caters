export interface CreateOrderRequest {
    order: {
        order_number: string
        customer_id: string
        status: 'pending' | 'confirmed' | 'paid' | 'cancelled'
        notes?: string
        total_amount: number
        balance: number
    }
    metadata: {
        event_type: string
        event_date: Date
        venue: string
        guest_count: number
    }
    payments: {
        payment_method: string
        amount: number
    }[]
}