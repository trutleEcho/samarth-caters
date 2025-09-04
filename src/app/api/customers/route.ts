import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customers = await sql`
      SELECT * FROM customers 
      ORDER BY created_at DESC
    `;

    return NextResponse.json(customers);
  } catch (error: any) {
    console.error('Unhandled error:', error);
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
    const { name, phone_number, address, email } = body;

    const createdCustomer = await sql`
      INSERT INTO customers (id, name, phone_number, address, email, created_at)
      VALUES (gen_random_uuid(), ${name}, ${phone_number}, ${address || null}, ${email || null}, NOW())
      RETURNING *
    `;

    return NextResponse.json({ success: true, customer: createdCustomer[0] });
  } catch (error: any) {
    console.error('Unhandled error:', error);
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
    const { id, name, phone_number, address, email } = body;

    const updatedCustomer = await sql`
      UPDATE customers 
      SET name = ${name}, phone_number = ${phone_number}, address = ${address || null}, 
          email = ${email || null}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (updatedCustomer.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, customer: updatedCustomer[0] });
  } catch (error: any) {
    console.error('Unhandled error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}