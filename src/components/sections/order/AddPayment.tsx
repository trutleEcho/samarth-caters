"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from "sonner";
import { IndianRupee } from "lucide-react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { PaymentMethod } from "@/data/enums/payment-method";
import { PaymentEntityType } from "@/data/enums/payment-entity-type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface AddPaymentProps {
  onAdd: (payment: any) => void;
  orderId: string;
}

export default function AddPayment({ onAdd, orderId }: AddPaymentProps) {
  const t = useTranslations('payments');
  const c = useTranslations('common');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    payment_method: PaymentMethod.Cash,
    payment_id: '',
    entity_type: PaymentEntityType.Event
  });

  const handlePaymentMethodChange = (value: string) => {
    setForm(prev => ({
      ...prev,
      payment_method: value as PaymentMethod
    }));
  };

  const handleEntityTypeChange = (value: string) => {
    setForm(prev => ({
      ...prev,
      entity_type: value as PaymentEntityType
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const request = {
        entity_type: form.entity_type,
        entity_id: orderId,
        payment_method: form.payment_method,
        payment_id: form.payment_id || `${form.payment_method}-${Date.now()}`,
        amount: form.amount ? parseFloat(form.amount) : 0,
        created_at: new Date().toISOString()
      };

      const response = await api.post('/api/payment', request);

      if (response.ok) {
        const result = await response.json();
        toast.success(t('paymentCreated'));

        // Reset form
        setForm({
          amount: '',
          payment_method: PaymentMethod.Cash,
          payment_id: '',
          entity_type: PaymentEntityType.Event
        });

        // Call onAdd with the created payment
        onAdd(result.payment);
      } else if (response.status === 401) {
        toast.error('Please login again');
      } else {
        const errorData = await response.json();
        toast.error(`${t('errors.createFailed')}: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      toast.error(t('errors.createFailed'));
      console.error('Error creating payment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
      <Card className="mx-auto mb-4 print:bg-white print:shadow-none print:border-none">
        <CardHeader>
          <CardTitle>
            <div className="flex flex-row items-center justify-between">
              <span className="text-2xl font-bold">{t('addPayment')}</span>
              <Badge variant="outline">{form.payment_method}</Badge>
            </div>
          </CardTitle>
          <Separator className="my-4"/>
          <CardDescription>
            <div className="w-full">
              <span className="text-sm font-light">{t('recordPaymentDescription')}</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6 px-4 print:px-0 print:py-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">{c('amount')} *</Label>
                <div className="relative">
                  <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder={c('amount')}
                      value={form.amount}
                      onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                      required
                      className="pl-8 w-full"
                  />
                  <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method" className="text-sm font-medium">{t('paymentMethod')} *</Label>
                <Select
                  value={form.payment_method}
                  onValueChange={handlePaymentMethodChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('selectPaymentMethod')} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PaymentMethod).map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_id" className="text-sm font-medium">{t('paymentId')}</Label>
                <Input
                    id="payment_id"
                    placeholder={t('paymentIdPlaceholder')}
                    value={form.payment_id}
                    onChange={e => setForm(f => ({ ...f, payment_id: e.target.value }))}
                    className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="entity_type" className="text-sm font-medium">{t('entityType')}</Label>
                <Select
                  value={form.entity_type}
                  onValueChange={handleEntityTypeChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('selectEntityType')} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PaymentEntityType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <CardFooter className="px-0 pt-4">
              <Button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto ml-auto"
              >
                {loading ? t('saving') : t('save')}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
  );
}
