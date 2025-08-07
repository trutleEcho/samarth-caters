// Represents the normalized DB table: customers
export interface Customer {
    id: string // UUID
    name: string
    phone_number: string
    address?: string
    email?: string
    created_at: Date
}