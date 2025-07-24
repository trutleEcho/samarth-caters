// Represents the normalized DB table: order_metadata
export interface OrderMetadata {
    id: string
    order_id: number
    event_type: string
    event_date: Date
    venue: string
    guest_count: number
}