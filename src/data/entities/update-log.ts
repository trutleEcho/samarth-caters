export interface UpdateLog {
    id: string // UUID
    entity_type: string
    entity_id: string // UUID (Foreign key)
    old_data?: JSON
    new_data?: JSON
    created_at: Date
    created_by: string
}