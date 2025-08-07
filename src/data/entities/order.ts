// Represents the normalized DB table: orders
import {OrderStatus} from "@/data/enums/order-status";

export interface Order {
    id: string // UUID
    order_number: string
    customer_id: string // UUID (Foreign Key)
    status: OrderStatus
    notes?: string
    created_at: Date
    total_amount: number
    balance?: number
}