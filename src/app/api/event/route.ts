import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@/utils/supabase/server";
import {EventStatus} from "@/data/enums/event-status";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const url = new URL(request.url);
    const eventId = url.searchParams.get('id');

    if (eventId) {
      // Fetch specific event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) {
        return NextResponse.json({ error: eventError.message }, { status: 500 });
      }

      // Fetch related data
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', event.order_id)
        .single();

      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', order?.customer_id)
        .single();

      const { data: menus } = await supabase
        .from('menus')
        .select('*')
        .eq('event_id', event.id);

      return NextResponse.json({
        event,
        order,
        customer,
        menus: menus || []
      });
    }

    // Fetch all events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (eventsError) {
      return NextResponse.json({ error: eventsError.message }, { status: 500 });
    }

    // Expand events with related data
    const expandedEvents = await Promise.all(
      (events || []).map(async (event) => {
        const { data: order } = await supabase
          .from('orders')
          .select('*')
          .eq('id', event.order_id)
          .single();

        const { data: customer } = await supabase
          .from('customers')
          .select('*')
          .eq('id', order?.customer_id)
          .single();

        const { data: menus } = await supabase
          .from('menus')
          .select('*')
          .eq('event_id', event.id);

        return {
          event,
          order,
          customer,
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
    const body = await req.json();
    const supabase = await createClient();

    // Validate required fields
    if (!body.order_id) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
    }

    // Build insert payload with defaults
    const finalRequest = {
      ...body,
      name: body.name || 'New Event',
      status: body.status || EventStatus.Received,
      created_at: new Date().toISOString(),
    };

    // Insert new event
    const { data: createdEvent, error: eventError } = await supabase
      .from('events')
      .insert([finalRequest])
      .select('*')
      .single();

    if (eventError || !createdEvent) {
      console.error('Event creation error:', eventError?.message);
      return NextResponse.json({ error: eventError?.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, event: createdEvent });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const eventId = body.id

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Optional: parse date string back to JS Date
    const updateData = {
      ...body,
      date: body.date ? new Date(body.date).toISOString() : null,
    };

    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', body?.order_id)
        .single();

    if (orderError) {
      console.error('Order fetch error:', orderError.message);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError) {
      console.error('Event fetch error:', eventError.message);
      return NextResponse.json({ error: eventError.message }, { status: 500 });
    }

    const updatedTotalAmount =(Number(order?.total_amount) - Number(event?.amount) + Number(body?.amount)) || 0;

    // Update event
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', eventId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Event update error:', updateError.message);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const {error: updateOrderError} = await supabase
        .from('orders')
        .update({
          total_amount: updatedTotalAmount
        })
        .eq('id', body?.order_id)
        .select('*')
        .single();

    if (updateOrderError) {
      console.error('Order update error:', updateOrderError.message);
      return NextResponse.json({ error: updateOrderError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, event: updatedEvent });
  } catch (error: any) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const eventId = body.id

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Delete event
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (deleteError) {
      console.error('Event deletion error:', deleteError.message);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
