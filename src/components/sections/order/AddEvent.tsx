"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from "sonner";
import { CalendarIcon, IndianRupee } from "lucide-react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import DateTimePicker from "../../../../datetime-picker";
import { EventStatus } from "@/data/enums/event-status";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface AddEventProps {
  onAdd: (event: any) => void;
  orderId: string;
}

export default function AddEvent({ onAdd, orderId }: AddEventProps) {
  const t = useTranslations('events');
  const c = useTranslations('common');
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [form, setForm] = useState({
    name: '',
    venue: '',
    guest_count: '',
    notes: '',
    amount: '0',
    status: EventStatus.Received
  });

  const handleStatusChange = (value: string) => {
    setForm(prev => ({
      ...prev,
      status: value as EventStatus
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const request = {
        order_id: orderId,
        name: form.name,
        date: date ? date.toISOString() : null,
        venue: form.venue,
        guest_count: form.guest_count ? parseInt(form.guest_count) : null,
        notes: form.notes,
        amount: form.amount ? parseFloat(form.amount) : 0,
        status: form.status
      };

      const response = await api.post('/api/event', request);

      if (response.ok) {
        const result = await response.json();
        toast.success('Event created successfully!');

        // Reset form
        setForm({
          name: '',
          venue: '',
          guest_count: '',
          notes: '',
          amount: '0',
          status: EventStatus.Received
        });
        setDate(undefined);

        // Call onAdd with the created event
        onAdd(result.event);
      } else if (response.status === 401) {
        toast.error('Please login again');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to create event: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      toast.error('Error creating event');
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
      <Card className="mx-auto mb-4 print:bg-white print:shadow-none print:border-none">
        <CardHeader>
          <CardTitle>
            <div className="flex flex-row items-center justify-between">
              <span className="text-2xl font-bold">{t('addEvent')}</span>
              <Badge variant="outline">{form.status}</Badge>
            </div>
          </CardTitle>
          <Separator className="my-4"/>
          <CardDescription>
            <div className="w-full">
              <span className="text-sm font-light">Create a new event for this order</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6 px-4 print:px-0 print:py-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">{t('name')} *</Label>
                <Input
                    id="name"
                    placeholder={t('namePlaceholder')}
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                    className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">{t('date')}</Label>
                <div className="relative">
                  <DateTimePicker
                    onChange={(e) => setDate(e)}
                    value={date}
                  />
                  <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue" className="text-sm font-medium">{t('venue')}</Label>
                <Input
                    id="venue"
                    placeholder={t('venuePlaceholder')}
                    value={form.venue}
                    onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
                    className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">{c('status')}</Label>
                <Select
                  value={form.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(EventStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guest_count" className="text-sm font-medium">{t('guestCount')}</Label>
                <Input
                    id="guest_count"
                    type="number"
                    placeholder={t('guestCountPlaceholder')}
                    value={form.guest_count}
                    onChange={e => setForm(f => ({ ...f, guest_count: e.target.value }))}
                    className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">{c('amount')}</Label>
                <div className="relative">
                  <Input
                      id="amount"
                      type="number"
                      placeholder={c('amount')}
                      value={form.amount}
                      onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                      className="pl-8 w-full"
                  />
                  <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">{t('notes')}</Label>
              <Textarea
                  id="notes"
                  placeholder={t('notesPlaceholder')}
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="resize-none w-full"
              />
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