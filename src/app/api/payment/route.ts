import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@/utils/supabase/server";
import {PaymentMethod} from "@/data/enums/payment-method";
import {PaymentEntityType} from "@/data/enums/payment-entity-type";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const url = new URL(request.url);
    const paymentId = url.searchParams.get('id');
    const entityId = url.searchParams.get('entity_id');

    if (paymentId) {
      // Fetch specific payment
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (paymentError) {
        return NextResponse.json({ error: paymentError.message }, { status: 500 });
      }

      return NextResponse.json(payment);
    }

    if (entityId) {
      // Fetch payments for specific entity
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      if (paymentsError) {
        return NextResponse.json({ error: paymentsError.message }, { status: 500 });
      }

      return NextResponse.json(payments || []);
    }

    // Fetch all payments
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (paymentsError) {
      return NextResponse.json({ error: paymentsError.message }, { status: 500 });
    }

    return NextResponse.json(payments || []);
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    // Validate required fields
    if (!body.entity_id || !body.amount) {
      return NextResponse.json({ error: 'entity_id and amount are required' }, { status: 400 });
    }

    // Build insert payload with defaults
    const finalRequest = {
      ...body,
      entity_type: body.entity_type || PaymentEntityType.Event,
      payment_method: body.payment_method || PaymentMethod.Cash,
      payment_id: body.payment_id || `${body.payment_method || 'PAYMENT'}-${Date.now()}`,
      amount: Number(body.amount),
      created_at: new Date().toISOString(),
    };

    // Insert new payment
    const { data: createdPayment, error: paymentError } = await supabase
      .from('payments')
      .insert([finalRequest])
      .select('*')
      .single();

    if (paymentError || !createdPayment) {
      console.error('Payment creation error:', paymentError?.message);
      return NextResponse.json({ error: paymentError?.message }, { status: 500 });
    }

    // Update order balance if this is a payment for an order/event
    if (body.entity_type === PaymentEntityType.Event) {
      // Fetch the order associated with this payment
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('balance')
        .eq('id', body.entity_id)
        .single();

      if (!orderError && order) {
        const newBalance = (order.balance || 0) - Number(body.amount);
        
        await supabase
          .from('orders')
          .update({ balance: newBalance })
          .eq('id', body.entity_id);
      }
    }

    return NextResponse.json({ success: true, payment: createdPayment });
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const paymentId = body.id

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    // Get original payment to calculate balance difference
    const { data: originalPayment, error: originalError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (originalError) {
      console.error('Original payment fetch error:', originalError.message);
      return NextResponse.json({ error: originalError.message }, { status: 500 });
    }

    // Update payment
    const updateData = {
      ...body,
      amount: Number(body.amount)
    };

    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Payment update error:', updateError.message);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Update order balance if this is a payment for an order/event and amount changed
    if (originalPayment.entity_type === PaymentEntityType.Event && originalPayment.amount !== Number(body.amount)) {
      const amountDifference = Number(body.amount) - originalPayment.amount;
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('balance')
        .eq('id', originalPayment.entity_id)
        .single();

      if (!orderError && order) {
        const newBalance = (order.balance || 0) - amountDifference;
        
        await supabase
          .from('orders')
          .update({ balance: newBalance })
          .eq('id', originalPayment.entity_id);
      }
    }

    return NextResponse.json({ success: true, payment: updatedPayment });
  } catch (error: any) {
    console.error('Error updating payment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const paymentId = body.id

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    // Get payment details before deletion for balance update
    const { data: payment, error: paymentFetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (paymentFetchError) {
      console.error('Payment fetch error:', paymentFetchError.message);
      return NextResponse.json({ error: paymentFetchError.message }, { status: 500 });
    }

    // Delete payment
    const { error: deleteError } = await supabase
      .from('payments')
      .delete()
      .eq('id', paymentId);

    if (deleteError) {
      console.error('Payment deletion error:', deleteError.message);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Update order balance if this was a payment for an order/event
    if (payment.entity_type === PaymentEntityType.Event) {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('balance')
        .eq('id', payment.entity_id)
        .single();

      if (!orderError && order) {
        const newBalance = (order.balance || 0) + payment.amount;
        
        await supabase
          .from('orders')
          .update({ balance: newBalance })
          .eq('id', payment.entity_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting payment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
