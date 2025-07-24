import { NextRequest, NextResponse } from 'next/server'
import {createOrder, fetchOrders} from "@/services/OrderService";

export async function GET() {
  const { data, error } = await fetchOrders()
  if (error) {
    console.log(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { success, error } = await createOrder(body)
  if (error) {
    console.log(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(success)
} 