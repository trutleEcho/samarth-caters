import { NextRequest, NextResponse } from 'next/server';
import {createClient} from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: customers, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(customers || []);
  } catch (error: any) {
    console.error('Unhandled error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    const { data: createdCustomer, error: customerError } = await supabase
        .from('customers')
        .insert([body])
        .select('*')
        .single();

    if (customerError || !createdCustomer) {
      console.error('Customer insert error:', customerError?.message);
      return NextResponse.json({ error: customerError?.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, customer: createdCustomer });
  } catch (error: any) {
    console.error('Unhandled error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    const { data: updatedCustomer, error: customerError } = await supabase
        .from('customers')
        .update(body)
        .eq('id', body.id)
        .select('*')
        .single();

    if (customerError || !updatedCustomer) {
      console.error('Customer update error:', customerError?.message);
      return NextResponse.json({ error: customerError?.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, customer: updatedCustomer });
  } catch (error: any) {
    console.error('Unhandled error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}