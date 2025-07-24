import React, { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { OrderData } from '@/types/dto/order-data';
import { useTranslations } from 'next-intl';

interface OrderDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderData | null;
  onSave: (updated: Partial<OrderData>) => void;
}

export default function OrderDrawer({ open, onOpenChange, order, onSave }: OrderDrawerProps) {
  const t = useTranslations('orders');
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    eventType: '',
    guestCount: 0,
    eventDate: '',
    venue: '',
  });

  useEffect(() => {
    if (order) {
      setForm({
        customerName: order.customer.name || '',
        customerPhone: order.customer.phone || '',
        customerEmail: order.customer.email || '',
        eventType: order.metadata.event_type || '',
        guestCount: order.metadata.guest_count || 0,
        eventDate: order.metadata.event_date ? new Date(order.metadata.event_date).toISOString().split('T')[0] : '',
        venue: order.metadata.venue || '',
      });
    }
  }, [order]);

  if (!order) return null;

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      customer: {
        ...order.customer,
        name: form.customerName,
        phone: form.customerPhone,
        email: form.customerEmail,
      },
      metadata: {
        ...order.metadata,
        event_type: form.eventType,
        guest_count: form.guestCount,
        event_date: form.eventDate ? new Date(form.eventDate) : order.metadata.event_date,
        venue: form.venue,
      },
      order: {
        ...order.order,
      },
    });
  };

  // Get event types from translations
  const eventTypes = [
    t('addOrder.eventTypes.wedding'),
    t('addOrder.eventTypes.birthdayParty'),
    t('addOrder.eventTypes.corporateEvent'),
    t('addOrder.eventTypes.anniversary'),
    t('addOrder.eventTypes.festival'),
    t('addOrder.eventTypes.other'),
  ];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-2">
        <DrawerHeader>
          <DrawerTitle>{t('orderDetails.title')}</DrawerTitle>
          <DrawerDescription>{t('orderDetails.description')}</DrawerDescription>
        </DrawerHeader>
        <Separator className="my-2" />
        <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">{t('addOrder.form.customerName')}</Label>
              <Input
                id="customerName"
                value={form.customerName}
                onChange={(e) => handleChange('customerName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">{t('addOrder.form.customerPhone')}</Label>
              <Input
                id="customerPhone"
                value={form.customerPhone}
                onChange={(e) => handleChange('customerPhone', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerEmail">{t('addOrder.form.customerEmail')}</Label>
            <Input
              id="customerEmail"
              type="email"
              value={form.customerEmail}
              onChange={(e) => handleChange('customerEmail', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventType">{t('addOrder.form.eventType')}</Label>
              <Select value={form.eventType} onValueChange={(value) => handleChange('eventType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('addOrder.form.eventType')} />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="guestCount">{t('addOrder.form.guestCount')}</Label>
              <Input
                id="guestCount"
                type="number"
                value={form.guestCount}
                onChange={(e) => handleChange('guestCount', Number(e.target.value))}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate">{t('addOrder.form.eventDate')}</Label>
              <Input
                id="eventDate"
                type="date"
                value={form.eventDate}
                onChange={(e) => handleChange('eventDate', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue">{t('addOrder.form.venue')}</Label>
              <Input
                id="venue"
                value={form.venue}
                onChange={(e) => handleChange('venue', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              {t('orderDetails.cancel')}
            </Button>
            <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600">
              {t('orderDetails.saveChanges')}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
} 