import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { Expenses } from '@/data/entities/expenses';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const expenseId = url.searchParams.get('id');

    if (expenseId) {
      // Fetch specific expense
      const expense = await sql`
        SELECT * FROM expenses WHERE id = ${expenseId}
      `;

      if (expense.length === 0) {
        return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
      }

      return NextResponse.json(expense[0]);
    }

    // Fetch all expenses
    const expenses = await sql`
      SELECT * FROM expenses ORDER BY created_at DESC
    `;

    return NextResponse.json(expenses);
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
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
    const { description, amount, category, expense_date, notes } = body;

    // Insert new expense
    const createdExpense = await sql`
      INSERT INTO expenses (id, description, amount, category, expense_date, notes, created_at)
      VALUES (gen_random_uuid(), ${description}, ${amount}, ${category || null}, 
              ${expense_date ? new Date(expense_date).toISOString() : null}, 
              ${notes || null}, NOW())
      RETURNING *
    `;

    return NextResponse.json({ success: true, expense: createdExpense[0] });
  } catch (error: any) {
    console.error('Error creating expense:', error);
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
    const expenseId = url.searchParams.get('id');

    if (!expenseId) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

    const { description, amount, category, expense_date, notes } = body;

    // Update expense
    const updatedExpense = await sql`
      UPDATE expenses 
      SET description = ${description}, amount = ${amount}, category = ${category || null}, 
          expense_date = ${expense_date ? new Date(expense_date).toISOString() : null}, 
          notes = ${notes || null}, updated_at = NOW()
      WHERE id = ${expenseId}
      RETURNING *
    `;

    if (updatedExpense.length === 0) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, expense: updatedExpense[0] });
  } catch (error: any) {
    console.error('Error updating expense:', error);
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
    const expenseId = url.searchParams.get('id');

    if (!expenseId) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

    // Delete expense
    await sql`
      DELETE FROM expenses WHERE id = ${expenseId}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
