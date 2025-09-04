export interface Menu {
    id: string // UUID
    event_id: string // UUID (Foreign Key)
    name: string // Menu name (required)
    description?: string // Menu description
    price: number // Price (required)
    quantity: number // Quantity (required)
    items?: string // Legacy field for backward compatibility
    created_at: string
    updated_at: string
}