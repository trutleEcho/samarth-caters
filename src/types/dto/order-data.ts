// Combined object used in UI or API responses
import {Customer} from "@/types/entities/customer";
import {OrderMetadata} from "@/types/objects/order-meta-data";
import {Payment} from "@/types/entities/payment";
import {Order} from "@/types/entities/order";

export interface OrderData {
    order: Order
    customer: Customer
    metadata: OrderMetadata
    payments: Payment[]
}