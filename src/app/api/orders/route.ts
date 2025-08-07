import { NextRequest, NextResponse } from 'next/server';
import {createClient} from "@/utils/supabase/server";
import {OrderStatus} from "@/data/enums/order-status";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const url = new URL(request.url);
    const orderId = url.searchParams.get('id');

    if (orderId) {
      // Fetch specific order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) {
        return NextResponse.json({ error: orderError.message }, { status: 500 });
      }

      // Fetch related data
      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', order.customer_id)
        .single();

      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('order_id', order.id);

      const eventsWithMenus = await Promise.all(
        (events || []).map(async (event) => {
          const { data: menus } = await supabase
            .from('menus')
            .select('*')
            .eq('event_id', event.id);
          return { ...event, menus: menus || [] };
        })
      );

      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('entity_id', order.id);

      return NextResponse.json({
        order,
        customer,
        events: eventsWithMenus,
        payments: payments || []
      });
    }

    // Fetch all orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      return NextResponse.json({ error: ordersError.message }, { status: 500 });
    }

    // Expand orders with related data
    const expandedOrders = await Promise.all(
      (orders || []).map(async (order) => {
        const { data: customer } = await supabase
          .from('customers')
          .select('*')
          .eq('id', order.customer_id)
          .single();

        const { data: events } = await supabase
          .from('events')
          .select('*')
          .eq('order_id', order.id);

        const menus = (
            await Promise.all(
                (events || []).map(async (event) => {
                  const { data: menus } = await supabase
                      .from('menus')
                      .select('*')
                      .eq('event_id', event.id);
                  return menus || [];
                })
            )
        ).flat(); // or use .flat(1)

        const { data: payments } = await supabase
          .from('payments')
          .select('*')
          .eq('entity_id', order.id);

        return {
          order,
          customer,
          events: events,
          menus: menus,
          payments: payments || [],
        };
      })
    );

    return NextResponse.json(expandedOrders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    // Get the last order number
    const { data: lastOrder, error: fetchError } = await supabase
      .from('orders')
      .select('order_number')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError) {
      console.error('Error fetching last order:', fetchError.message);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Generate next order number
    let orderNumber = 'ORD001';
    if (lastOrder?.order_number) {
      const lastNum = parseInt(lastOrder.order_number.replace('ORD', ''));
      const nextNum = (lastNum + 1).toString().padStart(3, '0');
      orderNumber = `ORD${nextNum}`;
    }

    // Build insert payload with defaults
    const finalRequest = {
      ...body,
      order_number: orderNumber,
      status: body.status || OrderStatus.Pending,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert new order
    const { data: createdOrder, error: orderError } = await supabase
      .from('orders')
      .insert([finalRequest])
      .select('*')
      .single();

    if (orderError || !createdOrder) {
      console.error('Order creation error:', orderError?.message);
      return NextResponse.json({ error: orderError?.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: createdOrder });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const url = new URL(req.url);
    const orderId = url.searchParams.get('id');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Update payload
    const updateData = {
      ...body,
      updated_at: new Date().toISOString()
    };

    // Update order
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Order update error:', updateError.message);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const url = new URL(req.url);
    const orderId = url.searchParams.get('id');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Delete order
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (deleteError) {
      console.error('Order deletion error:', deleteError.message);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
