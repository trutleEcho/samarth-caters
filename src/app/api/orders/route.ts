import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import {OrderStatus} from "@/data/enums/order-status";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const orderId = url.searchParams.get('id');

    if (orderId) {
      // Fetch specific order with related data
      const order = await sql`
        SELECT * FROM orders WHERE id = ${orderId}
      `;

      if (order.length === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const customer = await sql`
        SELECT * FROM customers WHERE id = ${order[0].customer_id}
      `;

      const events = await sql`
        SELECT * FROM events WHERE order_id = ${orderId}
      `;

      const eventsWithMenus = await Promise.all(
        events.map(async (event) => {
          const menus = await sql`
            SELECT * FROM menus WHERE event_id = ${event.id}
          `;
          return { ...event, menus };
        })
      );

      // Flatten all menus for consistency with the ExpandedOrder type
      const allMenus = eventsWithMenus.flatMap(event => event.menus || []);

      const payments = await sql`
        SELECT * FROM payments WHERE entity_id = ${orderId}
      `;

      return NextResponse.json({
        order: order[0],
        customer: customer[0],
        events: eventsWithMenus,
        menus: allMenus,
        payments: payments || []
      });
    }

    // Fetch all orders with related data
    const orders = await sql`
      SELECT * FROM orders ORDER BY created_at DESC
    `;

    const expandedOrders = await Promise.all(
      orders.map(async (order) => {
        const customer = await sql`
          SELECT * FROM customers WHERE id = ${order.customer_id}
        `;

        const events = await sql`
          SELECT * FROM events WHERE order_id = ${order.id}
        `;

        const menus = (
          await Promise.all(
            events.map(async (event) => {
              const eventMenus = await sql`
                SELECT * FROM menus WHERE event_id = ${event.id}
              `;
              return eventMenus;
            })
          )
        ).flat();

        const payments = await sql`
          SELECT * FROM payments WHERE entity_id = ${order.id}
        `;

        return {
          order,
          customer: customer[0],
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
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Get the last order number
    const lastOrder = await sql`
      SELECT order_number FROM orders 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    // Generate next order number
    let orderNumber = 'ORD001';
    if (lastOrder.length > 0 && lastOrder[0].order_number) {
      const lastNum = parseInt(lastOrder[0].order_number.replace('ORD', ''));
      const nextNum = (lastNum + 1).toString().padStart(3, '0');
      orderNumber = `ORD${nextNum}`;
    }

    // Insert new order
    const createdOrder = await sql`
      INSERT INTO orders (id, order_number, customer_id, status, notes, total_amount, balance, created_at)
      VALUES (gen_random_uuid(), ${orderNumber}, ${body.customer_id}, ${body.status || OrderStatus.Pending}, 
              ${body.notes || null}, ${body.total_amount || 0}, ${body.balance || 0}, NOW())
      RETURNING *
    `;

    return NextResponse.json({ success: true, order: createdOrder[0] });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const url = new URL(req.url);
    const orderId = url.searchParams.get('id');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const { status, notes, total_amount, balance } = body;

    // Update order
    const updatedOrder = await sql`
      UPDATE orders 
      SET status = ${status || 'pending'}, notes = ${notes || null}, 
          total_amount = ${total_amount || 0}, balance = ${balance || 0}, 
          updated_at = NOW()
      WHERE id = ${orderId}
      RETURNING *
    `;

    if (updatedOrder.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updatedOrder[0] });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const orderId = url.searchParams.get('id');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Delete order (cascade will handle related records)
    await sql`
      DELETE FROM orders WHERE id = ${orderId}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
