export interface CreateOrderRequest {
    customer_id: string;
    status: string;
    notes?: string;
    created_at: Date;
    total_amount?: number;
    balance?: number;
}