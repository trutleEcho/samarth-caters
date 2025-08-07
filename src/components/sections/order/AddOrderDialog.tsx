import {useEffect, useState} from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Separator} from '@/components/ui/separator';
import {toast} from 'sonner';
import {CreateOrderRequest} from '@/data/request/create-order-request';
import {useTranslations} from 'next-intl';
import {Customer} from "@/data/entities/customer";
import {Combobox} from "@/components/ui/combobox";

interface AddOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function AddOrderDialog({open, onOpenChange, onSuccess}: AddOrderDialogProps) {
    const t = useTranslations('orders');
    const commonT = useTranslations('common');
    const [customers, setCustomers] = useState<Customer[]>([])
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])

    const [formData, setFormData] = useState({
        customerId: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        eventType: '',
        guestCount: 0,
        eventDate: new Date(),
        bookingDate: new Date(),
        venue: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const request: CreateOrderRequest = {
                created_at: new Date(),
                balance: 0,
                customer_id: formData.customerId,
                status: "Confirmed",
                total_amount: 0
            };
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(request)
            });
            if (response.ok) {
                onOpenChange(false);
                setFormData({
                    customerId: '',
                    customerName: '',
                    customerPhone: '',
                    customerEmail: '',
                    eventType: '',
                    guestCount: 0,
                    eventDate: new Date(),
                    bookingDate: new Date(),
                    venue: '',
                    notes: ''
                });
                onSuccess();
            } else {
                toast.error(`Failed to create order: ${response.statusText}`);
            }
        } catch (error) {
            toast.error('Error creating order');
            console.error('Error creating order:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/customers')
            if (response.ok) {
                const data = await response.json()
                // Convert string dates to Date objects
                const customersWithDates = data.map((customer: any) => ({
                    ...customer,
                    created_at: new Date(customer.created_at)
                }))
                setCustomers(customersWithDates)
                setFilteredCustomers(customersWithDates)

                if (data.length === 0) {
                    toast.info(t('noCustomers.message'))
                }
            } else {
                toast.error(t('fetchError'))
            }
        } catch (error) {
            toast.error(t('fetchError'))
            console.error('Error fetching customers:', error)
        } finally {
            setLoading(false)
        }
    }
    
    const handleCustomerSelect = (customerId: string, customerData?: Customer) => {
        if (customerData) {
            setFormData({
                ...formData,
                customerId,
                customerName: customerData.name,
                customerPhone: customerData.phone_number,
                customerEmail: customerData.email || ''
            });
        }
    };

    useEffect(() => {
        fetchCustomers()
        setFormData({
            customerId: '',
            customerName: '',
            customerPhone: '',
            customerEmail: '',
            eventType: '',
            guestCount: 0,
            eventDate: new Date(),
            bookingDate: new Date(),
            venue: '',
            notes: ''
        });
    }, [])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('addOrder.title')}</DialogTitle>
                    <DialogDescription>
                        {t('addOrder.description')}
                    </DialogDescription>
                </DialogHeader>
                <Separator className="my-4"/>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="customerName">{t('addOrder.form.customerName')} *</Label>
                            <Combobox
                                options={customers.map(customer => ({
                                    label: customer.name,
                                    value: customer.id,
                                    data: customer
                                }))}
                                value={formData.customerId}
                                onValueChange={handleCustomerSelect}
                                placeholder="Select a customer"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customerPhone">{t('addOrder.form.customerPhone')} *</Label>
                            <Input
                                id="customerPhone"
                                value={formData.customerPhone}
                                onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                                required
                                readOnly={!!formData.customerId}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                            <Label htmlFor="customerEmail">{t('addOrder.form.customerEmail')}</Label>
                            <Input
                                id="customerEmail"
                                value={formData.customerEmail}
                                onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                                readOnly={!!formData.customerId}
                            />
                        </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="eventType">{t('addOrder.form.eventType')} *</Label>
                            <Select value={formData.eventType}
                                    onValueChange={(value) => setFormData({...formData, eventType: value})}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('addOrder.form.eventType')}/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        value={t('addOrder.eventTypes.wedding')}>{t('addOrder.eventTypes.wedding')}</SelectItem>
                                    <SelectItem
                                        value={t('addOrder.eventTypes.birthdayParty')}>{t('addOrder.eventTypes.birthdayParty')}</SelectItem>
                                    <SelectItem
                                        value={t('addOrder.eventTypes.corporateEvent')}>{t('addOrder.eventTypes.corporateEvent')}</SelectItem>
                                    <SelectItem
                                        value={t('addOrder.eventTypes.anniversary')}>{t('addOrder.eventTypes.anniversary')}</SelectItem>
                                    <SelectItem
                                        value={t('addOrder.eventTypes.festival')}>{t('addOrder.eventTypes.festival')}</SelectItem>
                                    <SelectItem
                                        value={t('addOrder.eventTypes.other')}>{t('addOrder.eventTypes.other')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="guestCount">{t('addOrder.form.guestCount')} *</Label>
                            <Input
                                id="guestCount"
                                type="number"
                                value={formData.guestCount}
                                onChange={(e) => setFormData({...formData, guestCount: Number(e.target.value)})}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="bookingDate">{t('addOrder.form.bookingDate')} *</Label>
                            <Input
                                id="bookingDate"
                                type="date"
                                value={formData.bookingDate.toISOString().split('T')[0]}
                                onChange={(e) => setFormData({...formData, bookingDate: new Date(e.target.value)})}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="eventDate">{t('addOrder.form.eventDate')} *</Label>
                            <Input
                                id="eventDate"
                                type="date"
                                value={formData.eventDate.toISOString().split('T')[0]}
                                onChange={(e) => setFormData({...formData, eventDate: new Date(e.target.value)})}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="venue">{t('addOrder.form.venue')} *</Label>
                        <Input
                            id="venue"
                            value={formData.venue}
                            onChange={(e) => setFormData({...formData, venue: e.target.value})}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">{t('addOrder.form.notes')}</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            placeholder={t('addOrder.form.notesPlaceholder')}
                        />
                    </div>
                    <div className="flex space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1"
                                disabled={loading}>
                            {commonT('cancel')}
                        </Button>
                        <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600" disabled={loading}>
                            {loading ? t('addOrder.creating') : t('addOrder.createOrder')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}