import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Fetch all menus
    const { data: menus, error: menusError } = await supabase
      .from('menus')
      .select('*')
      .order('created_at', { ascending: false });

    if (menusError) {
      return NextResponse.json({ error: menusError.message }, { status: 500 });
    }

    // 2. For each menu, fetch event, order, and customer
    const expandedMenus = await Promise.all(
      (menus || []).map(async (menu) => {
        // Fetch event for this menu
        const { data: event } = await supabase
          .from('events')
          .select('*')
          .eq('id', menu.event_id)
          .single();

        // Fetch order for this event
        const { data: order } = await supabase
          .from('orders')
          .select('*')
          .eq('id', event?.order_id)
          .single();

        // Fetch customer for this order
        const { data: customer } = await supabase
          .from('customers')
          .select('*')
          .eq('id', order?.customer_id)
          .single();

        return {
          menu,
          event,
          order,
          customer,
        };
      })
    );

    return NextResponse.json(expandedMenus);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    if (!body.event_id) {
      return NextResponse.json({ error: 'event_id is required' }, { status: 400 });
    }

    const { data: createdMenu, error: menuError } = await supabase
      .from('menus')
      .insert([body])
      .select('*')
      .single();

    console.log('Created menu:', createdMenu);
    console.log('Menu insert error:', menuError);

    if (menuError || !createdMenu) {
      console.error('Menu insert error:', menuError?.message);
      return NextResponse.json({ error: menuError?.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, menu: createdMenu });
  } catch (error: any) {
    console.error('Unhandled error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    const { data: updatedMenu, error: menuError } = await supabase
        .from('menus')
        .upsert(body)
        .select('*')
        .single(); // ✅ works if `id` is primary or unique key

    if (menuError || !updatedMenu) {
      console.error('Menu update error:', menuError?.message);
      return NextResponse.json({ error: menuError?.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, menu: updatedMenu });
  } catch (error: any) {
    console.error('Error updating menu:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const menuId = body.id;

    if (!menuId) {
      return NextResponse.json({ error: 'Menu ID is required' }, { status: 400 });
    }

    // Delete menu
    const { error: deleteError } = await supabase
      .from('menus')
      .delete()
      .eq('id', menuId);

    if (deleteError) {
      console.error('Menu deletion error:', deleteError.message);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting menu:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}