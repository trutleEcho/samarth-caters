export interface Menu {
    id: string // UUID
    event_id: string // UUID (Foreign Key)
    items?: string
    created_at: string
}