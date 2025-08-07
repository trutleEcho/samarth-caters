import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@/utils/supabase/server";
import { Expenses } from '@/data/entities/expenses';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const url = new URL(request.url);
    const expenseId = url.searchParams.get('id');

    if (expenseId) {
      // Fetch specific expense
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', expenseId)
        .single();

      if (expenseError) {
        return NextResponse.json({ error: expenseError.message }, { status: 500 });
      }

      return NextResponse.json(expense);
    }

    // Fetch all expenses
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (expensesError) {
      return NextResponse.json({ error: expensesError.message }, { status: 500 });
    }

    return NextResponse.json(expenses);
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    // Build insert payload with defaults
    const expense: Partial<Expenses> = {
      ...body,
      created_at: new Date(),
    };

    // Insert new expense
    const { data: createdExpense, error: expenseError } = await supabase
      .from('expenses')
      .insert([expense])
      .select('*')
      .single();

    if (expenseError || !createdExpense) {
      console.error('Expense creation error:', expenseError?.message);
      return NextResponse.json({ error: expenseError?.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, expense: createdExpense });
  } catch (error: any) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const url = new URL(req.url);
    const expenseId = url.searchParams.get('id');

    if (!expenseId) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

    // Update payload
    const updateData: Partial<Expenses> = {
      ...body,
      updated_at: new Date()
    };

    // Update expense
    const { data: updatedExpense, error: updateError } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', expenseId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Expense update error:', updateError.message);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, expense: updatedExpense });
  } catch (error: any) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const url = new URL(req.url);
    const expenseId = url.searchParams.get('id');

    if (!expenseId) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

    // Delete expense
    const { error: deleteError } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (deleteError) {
      console.error('Expense deletion error:', deleteError.message);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
