import {PaymentEntityType} from "@/data/enums/payment-entity-type";
import {PaymentMethod} from "@/data/enums/payment-method";

export interface Payment {
    id: string // UUID
    entity_type: PaymentEntityType
    entity_id: string // UUID (Foreign Key)
    payment_method: PaymentMethod
    payment_id: string
    amount: number
    created_at: Date
}