import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import {PaymentMethod} from "@/data/enums/payment-method";
import {PaymentEntityType} from "@/data/enums/payment-entity-type";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const paymentId = url.searchParams.get('id');
    const entityId = url.searchParams.get('entity_id');

    if (paymentId) {
      // Fetch specific payment
      const payment = await sql`
        SELECT * FROM payments WHERE id = ${paymentId}
      `;

      if (payment.length === 0) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }

      return NextResponse.json(payment[0]);
    }

    if (entityId) {
      // Fetch payments for specific entity
      const payments = await sql`
        SELECT * FROM payments WHERE entity_id = ${entityId} ORDER BY created_at DESC
      `;

      return NextResponse.json(payments || []);
    }

    // Fetch all payments
    const payments = await sql`
      SELECT * FROM payments ORDER BY created_at DESC
    `;

    return NextResponse.json(payments);
  } catch (error: any) {
    console.error('Error fetching payments:', error);
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
    const { entity_id, entity_type, amount, payment_method, payment_date, notes } = body;

    // Insert new payment
    const createdPayment = await sql`
      INSERT INTO payments (id, entity_id, entity_type, amount, payment_method, payment_date, notes, created_at)
      VALUES (gen_random_uuid(), ${entity_id}, ${entity_type}, ${amount}, ${payment_method}, 
              ${payment_date ? new Date(payment_date).toISOString() : null}, 
              ${notes || null}, NOW())
      RETURNING *
    `;

    // Update order balance if this is an order payment
    if (entity_type === PaymentEntityType.Order) {
      // Get current order details
      const order = await sql`
        SELECT * FROM orders WHERE id = ${entity_id}
      `;
      
      if (order.length > 0) {
        // Calculate total payments for this order
        const totalPayments = await sql`
          SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE entity_id = ${entity_id} AND entity_type = 'Order'
        `;
        
        const totalPaid = totalPayments[0]?.total || 0;
        const newBalance = Math.max(0, order[0].total_amount - totalPaid);
        
        // Update order balance
        await sql`
          UPDATE orders 
          SET balance = ${newBalance}, updated_at = NOW()
          WHERE id = ${entity_id}
        `;
      }
    }

    return NextResponse.json({ success: true, payment: createdPayment[0] });
  } catch (error: any) {
    console.error('Error creating payment:', error);
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
    const { id, entity_id, entity_type, amount, payment_method, payment_date, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    // Update payment
    const updatedPayment = await sql`
      UPDATE payments 
      SET entity_id = ${entity_id}, entity_type = ${entity_type}, amount = ${amount}, 
          payment_method = ${payment_method}, 
          payment_date = ${payment_date ? new Date(payment_date).toISOString() : null}, 
          notes = ${notes || null}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (updatedPayment.length === 0) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Update order balance if this is an order payment
    if (entity_type === PaymentEntityType.Order) {
      // Get current order details
      const order = await sql`
        SELECT * FROM orders WHERE id = ${entity_id}
      `;
      
      if (order.length > 0) {
        // Calculate total payments for this order
        const totalPayments = await sql`
          SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE entity_id = ${entity_id} AND entity_type = 'Order'
        `;
        
        const totalPaid = totalPayments[0]?.total || 0;
        const newBalance = Math.max(0, order[0].total_amount - totalPaid);
        
        // Update order balance
        await sql`
          UPDATE orders 
          SET balance = ${newBalance}, updated_at = NOW()
          WHERE id = ${entity_id}
        `;
      }
    }

    return NextResponse.json({ success: true, payment: updatedPayment[0] });
  } catch (error: any) {
    console.error('Error updating payment:', error);
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
    const paymentId = url.searchParams.get('id');

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    // Get payment details before deletion to update order balance
    const payment = await sql`
      SELECT * FROM payments WHERE id = ${paymentId}
    `;

    if (payment.length === 0) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const entityId = payment[0].entity_id;
    const entityType = payment[0].entity_type;

    // Delete payment
    await sql`
      DELETE FROM payments WHERE id = ${paymentId}
    `;

    // Update order balance if this was an order payment
    if (entityType === PaymentEntityType.Order) {
      // Get current order details
      const order = await sql`
        SELECT * FROM orders WHERE id = ${entityId}
      `;
      
      if (order.length > 0) {
        // Calculate total payments for this order
        const totalPayments = await sql`
          SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE entity_id = ${entityId} AND entity_type = 'Order'
        `;
        
        const totalPaid = totalPayments[0]?.total || 0;
        const newBalance = Math.max(0, order[0].total_amount - totalPaid);
        
        // Update order balance
        await sql`
          UPDATE orders 
          SET balance = ${newBalance}, updated_at = NOW()
          WHERE id = ${entityId}
        `;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting payment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}