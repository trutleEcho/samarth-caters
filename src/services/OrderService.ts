import {createClient} from "@/utils/supabase/server";
import {CreateOrderRequest} from "@/types/request/create-order-request";
import {OrderData} from "@/types/dto/order-data";
import {PostgrestError} from "@supabase/supabase-js";

export async function fetchOrders(): Promise<{ data?: OrderData[]; error?: PostgrestError }> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      customer:customers(*),
      metadata:order_metadata(*),
      payments:payments(*)
    `)

    if (error) {
        return { error }
    }

    const normalized: OrderData[] = data.map((entry: any) => ({
        order: {
            id: entry.id,
            order_number: entry.order_number,
            customer_id: entry.customer_id,
            status: entry.status,
            notes: entry.notes,
            total_amount: entry.total_amount,
            balance: entry.balance,
            created_at: entry.created_at,
        },
        customer: entry.customer,
        metadata: entry.metadata,
        payments: entry.payments ?? [],
    }))

    return { data: normalized }
}

export async function createOrder(input: CreateOrderRequest) {
    const supabase = await createClient()

    const { order, metadata, payments } = input

    // Step 1: Insert into orders
    const { data: createdOrder, error: orderError } = await supabase
        .from('orders')
        .insert([order])
        .select('id')
        .single()

    if (orderError || !createdOrder) {
        return { error: orderError }
    }

    const orderId = createdOrder.id

    // Step 2: Insert metadata
    const { error: metadataError } = await supabase
        .from('order_metadata')
        .insert([{ ...metadata, order_id: orderId }])

    if (metadataError) {
        return { error: metadataError }
    }

    // Step 3: Insert payments
    const paymentRows = payments.map(p => ({
        ...p,
        order_id: orderId,
    }))

    const { error: paymentsError } = await supabase
        .from('payments')
        .insert(paymentRows)

    if (paymentsError) {
        return { error: paymentsError }
    }

    return { success: true }
}