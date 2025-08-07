"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function AddPayment({ onAdd }: { onAdd: (payment: any) => void }) {
    const [form, setForm] = useState({ amount: "", payment_method: "", notes: "" });

    const handleAdd = () => {
        if (!form.amount || !form.payment_method) return;
        onAdd(form);
        setForm({ amount: "", payment_method: "", notes: "" });
    };

    return (
        <Card className="mx-auto mb-4">
            <CardHeader>
                <CardTitle>Add Payment</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="Amount"
                            value={form.amount}
                            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="payment_method">Method</Label>
                        <Input
                            id="payment_method"
                            placeholder="Method"
                            value={form.payment_method}
                            onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}
                            className="mt-1"
                        />
                    </div>
                </div>
                <div className="mb-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                        id="notes"
                        placeholder="Notes"
                        value={form.notes}
                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                        className="mt-1"
                    />
                </div>
                <Button onClick={handleAdd}>Add Payment</Button>
            </CardContent>
        </Card>
    );
}