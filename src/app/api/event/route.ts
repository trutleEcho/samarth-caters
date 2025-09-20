import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import {EventStatus} from "@/data/enums/event-status";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const eventId = url.searchParams.get('id');

    if (eventId) {
      // Fetch specific event
      const event = await sql`
        SELECT * FROM events WHERE id = ${eventId}
      `;

      if (event.length === 0) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      // Fetch related data
      const order = await sql`
        SELECT * FROM orders WHERE id = ${event[0].order_id}
      `;

      const customer = await sql`
        SELECT * FROM customers WHERE id = ${order[0]?.customer_id}
      `;

      const menus = await sql`
        SELECT * FROM menus WHERE event_id = ${eventId}
      `;

      return NextResponse.json({
        event: event[0],
        order: order[0],
        customer: customer[0],
        menus: menus || []
      });
    }

    // Fetch all events
    const events = await sql`
      SELECT * FROM events ORDER BY created_at DESC
    `;

    // Expand events with related data
    const expandedEvents = await Promise.all(
      events.map(async (event) => {
        const order = await sql`
          SELECT * FROM orders WHERE id = ${event.order_id}
        `;

        const customer = await sql`
          SELECT * FROM customers WHERE id = ${order[0]?.customer_id}
        `;

        const menus = await sql`
          SELECT * FROM menus WHERE event_id = ${event.id}
        `;

        return {
          event,
          order: order[0],
          customer: customer[0],
          menus: menus || [],
        };
      })
    );

    return NextResponse.json(expandedEvents);
  } catch (error: any) {
    console.error('Error fetching events:', error);
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

    // Validate required fields
    if (!body.order_id) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
    }

    // Get order details
    const order = await sql`
      SELECT * FROM orders WHERE id = ${body.order_id}
    `;

    if (order.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Insert new event (amount will be calculated from menus)
    const createdEvent = await sql`
      INSERT INTO events (id, order_id, name, date, venue, guest_count, status, notes, amount, created_at)
      VALUES (gen_random_uuid(), ${body.order_id}, ${body.name || 'New Event'}, 
              ${body.date ? new Date(body.date).toISOString() : null}, 
              ${body.venue || null}, ${body.guest_count || null}, 
              ${body.status || EventStatus.Received}, ${body.notes || null}, 
              0, NOW())
      RETURNING *
    `;

    // Calculate total amount from menus for this event
    const menus = await sql`
      SELECT * FROM menus WHERE event_id = ${createdEvent[0].id}
    `;

    const eventTotalAmount = menus.reduce((sum, menu) => sum + (Number(menu.price) * Number(menu.quantity)), 0);

    // Update event amount
    await sql`
      UPDATE events 
      SET amount = ${eventTotalAmount}, updated_at = NOW()
      WHERE id = ${createdEvent[0].id}
    `;

    // Calculate new order total amount
    const allEvents = await sql`
      SELECT * FROM events WHERE order_id = ${body.order_id}
    `;

    const orderTotalAmount = allEvents.reduce((sum, event) => sum + Number(event.amount), 0);

    // Update order total amount
    await sql`
      UPDATE orders 
      SET total_amount = ${orderTotalAmount}, updated_at = NOW()
      WHERE id = ${body.order_id}
    `;

    return NextResponse.json({ success: true, event: { ...createdEvent[0], amount: eventTotalAmount } });
  } catch (error: any) {
    console.error('Error creating event:', error);
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
    const eventId = body.id;

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Get current event and order details
    const event = await sql`
      SELECT * FROM events WHERE id = ${eventId}
    `;

    if (event.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const order = await sql`
      SELECT * FROM orders WHERE id = ${body.order_id}
    `;

    if (order.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update event (excluding amount - will be calculated from menus)
    const updatedEvent = await sql`
      UPDATE events 
      SET name = ${body.name || event[0].name}, 
          date = ${body.date ? new Date(body.date).toISOString() : event[0].date}, 
          venue = ${body.venue || event[0].venue}, 
          guest_count = ${body.guest_count || event[0].guest_count}, 
          status = ${body.status || event[0].status}, 
          notes = ${body.notes || event[0].notes}, 
          updated_at = NOW()
      WHERE id = ${eventId}
      RETURNING *
    `;

    // Calculate total amount from menus for this event
    const menus = await sql`
      SELECT * FROM menus WHERE event_id = ${eventId}
    `;

    const eventTotalAmount = menus.reduce((sum, menu) => sum + (Number(menu.price) * Number(menu.quantity)), 0);

    // Update event amount
    await sql`
      UPDATE events 
      SET amount = ${eventTotalAmount}, updated_at = NOW()
      WHERE id = ${eventId}
    `;

    // Calculate new order total amount
    const allEvents = await sql`
      SELECT * FROM events WHERE order_id = ${body.order_id}
    `;

    const orderTotalAmount = allEvents.reduce((sum, event) => sum + Number(event.amount), 0);

    // Update order total amount
    await sql`
      UPDATE orders 
      SET total_amount = ${orderTotalAmount}, updated_at = NOW()
      WHERE id = ${body.order_id}
    `;

    return NextResponse.json({ success: true, event: { ...updatedEvent[0], amount: eventTotalAmount } });
  } catch (error: any) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const eventId = body.id;

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Get event details before deletion for balance update
    const event = await sql`
      SELECT * FROM events WHERE id = ${eventId}
    `;

    if (event.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const order = await sql`
      SELECT * FROM orders WHERE id = ${event[0].order_id}
    `;

    if (order.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Delete event (cascade will handle related records)
    await sql`
      DELETE FROM events WHERE id = ${eventId}
    `;

    // Calculate new order total amount from remaining events
    const remainingEvents = await sql`
      SELECT * FROM events WHERE order_id = ${event[0].order_id}
    `;

    const orderTotalAmount = remainingEvents.reduce((sum, event) => sum + Number(event.amount), 0);

    // Update order total amount
    await sql`
      UPDATE orders 
      SET total_amount = ${orderTotalAmount}, updated_at = NOW()
      WHERE id = ${event[0].order_id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
