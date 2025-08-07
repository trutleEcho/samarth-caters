import {Order} from "@/data/entities/order";
import {Customer} from "@/data/entities/customer";
import {Event} from "@/data/entities/event";
import {Payment} from "@/data/entities/payment";
import {Menu} from "@/data/entities/menu";

export type ExpandedOrder = {
    order: Order,
    customer: Customer,
    events: Event[],
    menus: Menu[],
    payments: Payment[],
}
