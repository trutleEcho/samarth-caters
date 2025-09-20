'use client';

import {useState, useEffect} from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Separator} from '@/components/ui/separator';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {toast} from 'sonner';
import {Customer} from '@/data/entities/customer';
import {ExpandedOrder} from '@/data/dto/expanded-order';
import {CreateOrderRequest} from '@/data/request/create-order-request';
import {Combobox} from '@/components/ui/combobox';
import {Loader2} from 'lucide-react';
import {api} from '@/lib/api';

interface UnifiedOrderFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    order?: ExpandedOrder; // If provided, we're editing
    isEditing?: boolean;
}

export default function UnifiedOrderForm({
                                             open,
                                             onOpenChange,
                                             onSuccess,
                                             order,
                                         }: UnifiedOrderFormProps) {

    // State management
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [activeTab, setActiveTab] = useState('order');

    // Order form data
    const [orderFormData, setOrderFormData] = useState({
        customerId: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        notes: '',
        status: 'BOOKED'
    });

    // Initialize form data
    useEffect(() => {
        if (order) {
            // Populate order data
            setOrderFormData({
                customerId: order.customer.id,
                customerName: order.customer.name,
                customerPhone: order.customer.phone_number,
                customerEmail: order.customer.email || '',
                notes: order.order.notes || '',
                status: order.order.status
            });
        } else {
            // Reset form for new order
            setOrderFormData({
                customerId: '',
                customerName: '',
                customerPhone: '',
                customerEmail: '',
                notes: '',
                status: 'BOOKED'
            });
        }
    }, [order, open]);

    // Fetch customers
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await api.get('/api/customers');
                if (response.ok) {
                    const data = await response.json();
                    setCustomers(data);
                }
            } catch (error) {
                console.error('Error fetching customers:', error);
            }
        };

        if (open) {
            fetchCustomers();
        }
    }, [open]);

    // Customer selection handler
    const handleCustomerSelect = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            setOrderFormData(prev => ({
                ...prev,
                customerId: customer.id,
                customerName: customer.name,
                customerPhone: customer.phone_number,
                customerEmail: customer.email || '',
                customerAddress: customer.address || ''
            }));
        }
    };

    // Order form handlers
    const handleOrderInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setOrderFormData(prev => ({...prev, [name]: value}));
    };

    const handleOrderStatusChange = (value: string) => {
        setOrderFormData(prev => ({...prev, status: value}));
    };

    // Main form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Create new order
            const request: CreateOrderRequest = {
                created_at: new Date(),
                customer_id: orderFormData.customerId,
                notes: orderFormData.notes,
                status: orderFormData.status as any
            };

            const response = await api.post('/api/orders', request);

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error('Authentication required. Please log in again.');
                    return;
                }
                toast.error('Error creating order');
                return;
            }

            toast.success('Order created successfully');


            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error('Error saving order');
            console.error('Error saving order:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                       Create New Order
                    </DialogTitle>
                    <DialogDescription>
                        Create a new order with customer details, events, and menu items.
                    </DialogDescription>
                </DialogHeader>

                <Separator className="my-4"/>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-1">
                        <TabsTrigger value="order">Order Details</TabsTrigger>
                    </TabsList>

                    {/* Order Details Tab */}
                    <TabsContent value="order" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer & Order Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customerName">Customer Name *</Label>
                                        <Combobox
                                            options={customers.map(customer => ({
                                                label: customer.name,
                                                value: customer.id,
                                                data: customer
                                            }))}
                                            value={orderFormData.customerId}
                                            onValueChange={handleCustomerSelect}
                                            placeholder="Select a customer"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customerPhone">Phone Number *</Label>
                                        <Input
                                            id="customerPhone"
                                            name="customerPhone"
                                            value={orderFormData.customerPhone}
                                            onChange={handleOrderInputChange}
                                            required
                                            readOnly={!!orderFormData.customerId}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customerEmail">Email</Label>
                                        <Input
                                            id="customerEmail"
                                            name="customerEmail"
                                            type="email"
                                            value={orderFormData.customerEmail}
                                            onChange={handleOrderInputChange}
                                            readOnly={!!orderFormData.customerId}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Order Status</Label>
                                        <Select value={orderFormData.status} onValueChange={handleOrderStatusChange}>
                                            <SelectTrigger  className="w-full">
                                                <SelectValue placeholder="Select status"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="BOOKED">Booked</SelectItem>
                                                <SelectItem value="MENU_FINALIZED">Menu Finalized</SelectItem>
                                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Order Notes</Label>
                                    <Textarea
                                        id="notes"
                                        name="notes"
                                        value={orderFormData.notes}
                                        onChange={handleOrderInputChange}
                                        placeholder="Additional notes about this order..."
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Form Actions */}
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                Creating...
                            </>
                        ) : (
                            'Create Order'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
