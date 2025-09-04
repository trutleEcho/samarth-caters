import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all menus
    const menus = await sql`
      SELECT * FROM menus ORDER BY created_at DESC
    `;

    // For each menu, fetch event, order, and customer
    const expandedMenus = await Promise.all(
      menus.map(async (menu) => {
        // Fetch event for this menu
        const event = await sql`
          SELECT * FROM events WHERE id = ${menu.event_id}
        `;

        // Fetch order for this event
        const order = await sql`
          SELECT * FROM orders WHERE id = ${event[0]?.order_id}
        `;

        // Fetch customer for this order
        const customer = await sql`
          SELECT * FROM customers WHERE id = ${order[0]?.customer_id}
        `;

        return {
          menu,
          event: event[0],
          order: order[0],
          customer: customer[0],
        };
      })
    );

    return NextResponse.json(expandedMenus);
  } catch (error: any) {
    console.error('Error fetching menus:', error);
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
    const { event_id, name, description, price, quantity, items } = body;

    // Map items to name if name is not provided (for backward compatibility)
    const menuName = name || items || 'Menu Items';
    const menuDescription = description || items || null;
    const menuPrice = price || 0;
    const menuQuantity = quantity || 1;

    // Insert new menu item
    const createdMenu = await sql`
      INSERT INTO menus (id, event_id, name, description, price, quantity, created_at)
      VALUES (gen_random_uuid(), ${event_id}, ${menuName}, ${menuDescription}, 
              ${menuPrice}, ${menuQuantity}, NOW())
      RETURNING *
    `;

    return NextResponse.json({ success: true, menu: createdMenu[0] });
  } catch (error: any) {
    console.error('Error creating menu:', error);
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
    const { id, name, description, price, quantity, items } = body;

    if (!id) {
      return NextResponse.json({ error: 'Menu ID is required' }, { status: 400 });
    }

    // Map items to name if name is not provided (for backward compatibility)
    const menuName = name || items || 'Menu Items';
    const menuDescription = description || items || null;
    const menuPrice = price || 0;
    const menuQuantity = quantity || 1;

    // Update menu item
    const updatedMenu = await sql`
      UPDATE menus 
      SET name = ${menuName}, description = ${menuDescription}, 
          price = ${menuPrice}, quantity = ${menuQuantity}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (updatedMenu.length === 0) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, menu: updatedMenu[0] });
  } catch (error: any) {
    console.error('Error updating menu:', error);
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
    const menuId = url.searchParams.get('id');

    if (!menuId) {
      return NextResponse.json({ error: 'Menu ID is required' }, { status: 400 });
    }

    // Delete menu item
    await sql`
      DELETE FROM menus WHERE id = ${menuId}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting menu:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}