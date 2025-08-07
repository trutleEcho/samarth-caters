"use client";
import React from 'react';

export default function PaymentsA4({ payments }: { payments: any[] }) {
  if (!payments || payments.length === 0) return null;
  return (
    <div className="mb-4">
      <h3 className="font-semibold mb-2">Payments</h3>
      <table className="w-full text-sm border print:border print:w-full">
        <thead>
          <tr>
            <th className="border px-2 py-1">Amount</th>
            <th className="border px-2 py-1">Method</th>
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Notes</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p, idx) => (
            <tr key={p.id || idx}>
              <td className="border px-2 py-1">₹{p.amount}</td>
              <td className="border px-2 py-1">{p.payment_method}</td>
              <td className="border px-2 py-1">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}</td>
              <td className="border px-2 py-1">{p.notes || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}