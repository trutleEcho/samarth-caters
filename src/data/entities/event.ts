import {EventStatus} from "@/data/enums/event-status";

export interface Event {
    id: string // UUID
    order_id: string // UUID (Foreign key)
    name?: string
    date?: Date
    venue?: string
    guest_count?: number
    status: EventStatus
    notes?: string
    amount: number // Calculated from menus
    created_at: Date
}