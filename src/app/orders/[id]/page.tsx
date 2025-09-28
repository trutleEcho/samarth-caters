'use client';

import {useState, useEffect} from 'react';
import {useParams, useRouter} from 'next/navigation';
import {ArrowLeft, Edit, Plus, Trash2, Download, IndianRupee, Loader2} from 'lucide-react';
import Header from '@/components/layout/header';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {Badge} from '@/components/ui/badge';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {toast} from 'sonner';
import {ExpandedOrder} from '@/data/dto/expanded-order';
import {Event} from '@/data/entities/event';
import {Menu} from '@/data/entities/menu';
import {EventStatus} from '@/data/enums/event-status';
import {PaymentMethod} from '@/data/enums/payment-method';
import {PaymentEntityType} from '@/data/enums/payment-entity-type';
import DateTimePicker from '../../../../datetime-picker';
import {api} from '@/lib/api';
import {conversionUtil} from '@/utils/ConversionUtil';
import {PDFGenerator, formatCurrency, formatDateTime} from '@/lib/pdf-utils';

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();

    const [order, setOrder] = useState<ExpandedOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [showAddPayment, setShowAddPayment] = useState(false);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [showEditEvent, setShowEditEvent] = useState(false);
    const [showEditMenu, setShowEditMenu] = useState(false);
    const [showDeleteEventConfirm, setShowDeleteEventConfirm] = useState(false);
    const [showDeleteMenuConfirm, setShowDeleteMenuConfirm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
    const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
    const [deletingMenu, setDeletingMenu] = useState<Menu | null>(null);
    const [selectedEventForMenu, setSelectedEventForMenu] = useState<string>('');

    // Form states
    const [orderFormData, setOrderFormData] = useState({
        status: '',
        notes: ''
    });

    const [eventFormData, setEventFormData] = useState({
        name: '',
        venue: '',
        guest_count: 0,
        amount: 0,
        notes: '',
        status: EventStatus.Received
    });
    const [eventDate, setEventDate] = useState<Date | undefined>();

    const [paymentFormData, setPaymentFormData] = useState({
        amount: 0,
        payment_method: PaymentMethod.Cash,
        payment_date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const [menuFormData, setMenuFormData] = useState({
        name: '',
        description: '',
        items: '',
        price: 0,
    });

    useEffect(() => {
        if (params.id) {
            fetchOrder(params.id as string);
        }
    }, [params.id]);

    const fetchOrder = async (orderId: string) => {
        setLoading(true);
        try {
            const response = await api.get(`/api/orders?id=${orderId}`);
            if (response.ok) {
                const data = await response.json();
                setOrder(data);
                setOrderFormData({
                    status: data.order.status,
                    notes: data.order.notes || ''
                });
            } else if (response.status === 404) {
                toast.error('Order not found');
                router.push('/orders');
            } else {
                toast.error('Error fetching order');
            }
        } catch (error) {
            toast.error('Error fetching order');
            console.error('Error fetching order:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOrderUpdate = async () => {
        if (!order) return;

        try {
            const response = await api.put(`/api/orders?id=${order.order.id}`, {
                ...order.order,
                ...orderFormData
            });

            if (response.ok) {
                toast.success('Order updated successfully');
                setIsEditing(false);
                fetchOrder(order.order.id);
            } else {
                toast.error('Error updating order');
            }
        } catch (error) {
            toast.error('Error updating order');
            console.error('Error updating order:', error);
        }
    };

    const handleEventSubmit = async () => {
        if (!order) return;

        try {
            const eventData = {
                order_id: order.order.id,
                ...eventFormData,
                date: eventDate
            };

            const response = await api.post('/api/event', eventData);

            if (response.ok) {
                toast.success('Event added successfully');
                setShowAddEvent(false);
                setEventFormData({
                    name: '',
                    venue: '',
                    guest_count: 0,
                    amount: 0,
                    notes: '',
                    status: EventStatus.Received
                });
                setEventDate(undefined);
                fetchOrder(order.order.id);
            } else {
                toast.error('Error adding event');
            }
        } catch (error) {
            toast.error('Error adding event');
            console.error('Error adding event:', error);
        }
    };

    const handlePaymentSubmit = async () => {
        if (!order) return;

        try {
            const paymentData = {
                entity_id: order.order.id,
                entity_type: PaymentEntityType.Order, // Changed to Order
                ...paymentFormData,
                payment_date: new Date(paymentFormData.payment_date).toISOString()
            };

            const response = await api.post('/api/payment', paymentData);

            if (response.ok) {
                toast.success('Payment added successfully');
                setShowAddPayment(false);
                setPaymentFormData({
                    amount: 0,
                    payment_method: PaymentMethod.Cash,
                    payment_date: new Date().toISOString().split('T')[0],
                    notes: ''
                });
                fetchOrder(order.order.id);
            } else {
                toast.error('Error adding payment');
            }
        } catch (error) {
            toast.error('Error adding payment');
            console.error('Error adding payment:', error);
        }
    };

    const handleMenuSubmit = async () => {
        if (!order || !selectedEventForMenu) {
            toast.error('Please select an event for the menu');
            return;
        }

        try {
            const menuData = {
                event_id: selectedEventForMenu,
                ...menuFormData,
                items: menuFormData.items || menuFormData.description || menuFormData.name
            };

            const response = await api.post('/api/menu', menuData);

            if (response.ok) {
                toast.success('Menu added successfully');
                setShowAddMenu(false);
                setSelectedEventForMenu('');
                setMenuFormData({
                    name: '',
                    description: '',
                    items: '',
                    price: 0,
                });
                fetchOrder(order.order.id);
            } else {
                toast.error('Error adding menu');
            }
        } catch (error) {
            toast.error('Error adding menu');
            console.error('Error adding menu:', error);
        }
    };

    const handleEditEvent = (event: Event) => {
        setEditingEvent(event);
        setEventFormData({
            name: event.name || '',
            venue: event.venue || '',
            guest_count: event.guest_count || 0,
            amount: event.amount || 0,
            notes: event.notes || '',
            status: event.status || EventStatus.Received
        });
        setEventDate(event.date ? new Date(event.date) : undefined);
        setShowEditEvent(true);
    };

    const handleEventUpdate = async () => {
        if (!editingEvent || !order) return;

        try {
            const eventData = {
                ...editingEvent,
                ...eventFormData,
                date: eventDate
            };

            const response = await api.put('/api/event', eventData);

            if (response.ok) {
                toast.success('Event updated successfully');
                setShowEditEvent(false);
                setEditingEvent(null);
                fetchOrder(order.order.id);
            } else {
                toast.error('Error updating event');
            }
        } catch (error) {
            toast.error('Error updating event');
            console.error('Error updating event:', error);
        }
    };

    const handleEventDeleteClick = (event: Event) => {
        setDeletingEvent(event);
        setShowDeleteEventConfirm(true);
    };

    const handleEventDelete = async () => {
        if (!deletingEvent || !order) return;

        try {
            const response = await api.delete('/api/event', {id: deletingEvent.id});

            if (response.ok) {
                toast.success('Event deleted successfully');
                setShowDeleteEventConfirm(false);
                setDeletingEvent(null);
                fetchOrder(order.order.id);
            } else {
                toast.error('Error deleting event');
            }
        } catch (error) {
            toast.error('Error deleting event');
            console.error('Error deleting event:', error);
        }
    };

    const handlePaymentDelete = async (paymentId: string) => {
        try {
            const response = await api.delete(`/api/payment?id=${paymentId}`);

            if (response.ok) {
                toast.success('Payment deleted successfully');
                fetchOrder(order!.order.id);
            } else {
                toast.error('Error deleting payment');
            }
        } catch (error) {
            toast.error('Error deleting payment');
            console.error('Error deleting payment:', error);
        }
    };

    const handleEditMenu = (menu: Menu) => {
        setEditingMenu(menu);
        setMenuFormData({
            name: menu.name || '',
            description: menu.description || '',
            items: menu.items || menu.description || menu.name || '',
            price: menu.price || 0,
        });
        setShowEditMenu(true);
    };

    const handleMenuUpdate = async () => {
        if (!editingMenu || !order) return;

        try {
            const menuData = {
                ...editingMenu,
                ...menuFormData,
                items: menuFormData.items || menuFormData.description || menuFormData.name
            };

            const response = await api.put('/api/menu', menuData);

            if (response.ok) {
                toast.success('Menu updated successfully');
                setShowEditMenu(false);
                setEditingMenu(null);
                fetchOrder(order.order.id);
            } else {
                toast.error('Error updating menu');
            }
        } catch (error) {
            toast.error('Error updating menu');
            console.error('Error updating menu:', error);
        }
    };

    const handleMenuDeleteClick = (menu: Menu) => {
        setDeletingMenu(menu);
        setShowDeleteMenuConfirm(true);
    };

    const handleMenuDelete = async () => {
        if (!deletingMenu || !order) return;

        try {
            const response = await api.delete(`/api/menu?id=${deletingMenu.id}`);

            if (response.ok) {
                toast.success('Menu deleted successfully');
                setShowDeleteMenuConfirm(false);
                setDeletingMenu(null);
                fetchOrder(order.order.id);
            } else {
                toast.error('Error deleting menu');
            }
        } catch (error) {
            toast.error('Error deleting menu');
            console.error('Error deleting menu:', error);
        }
    };

    const generateOrderPDF = () => {
        if (!order) return;

        const pdf = new PDFGenerator();

        // Add professional header
        pdf.addHeader({
            title: "Order Invoice",
            subtitle: `Order #${order.order.order_number || order.order.id}`,
            showDate: true
        });

        // Add customer details section
        pdf.addSectionHeader("Customer Details");
        pdf.addText(`Name: ${order.customer.name}`, {bold: true});
        pdf.addText(`Phone: ${order.customer.phone_number}`);
        if (order.customer.email) {
            pdf.addText(`Email: ${order.customer.email}`);
        }
        if (order.customer.address) {
            pdf.addText(`Address: ${order.customer.address}`);
        }

        // Add events section
        pdf.addSectionHeader("Events");
        if (order.events.length > 0) {
            const eventsData = order.events.map((event, index) => ({
                sr: index + 1,
                name: event.name || "—",
                date: event.date ? formatDateTime(new Date(event.date)) : "—",
                venue: event.venue || "—",
                guests: event.guest_count?.toString() || "—",
                amount: event.amount ? formatCurrency(event.amount) : "—"
            }));

            pdf.addTable(eventsData, [
                {header: "Sr.", dataKey: "sr", width: 15, align: "center"},
                {header: "Event", dataKey: "name", width: 30},
                {header: "Date", dataKey: "date", width: 30},
                {header: "Venue", dataKey: "venue", width: 40},
                {header: "Guests", dataKey: "guests", width: 40, align: "center"},
                {header: "Amount", dataKey: "amount", width: 45, align: "right"}
            ]);
        } else {
            pdf.addText("No events found.", {color: [120, 120, 120]});
        }

        // Add menus section
        pdf.addSectionHeader("Menus");
        if (order.menus.length > 0) {
            const menusData = order.menus.map((menu, index) => ({
                sr: index + 1,
                name: menu.name || "—",
                description: menu.description || "—",
                price: formatCurrency(menu.price),
            }));

            pdf.addTable(menusData, [
                {header: "Sr.", dataKey: "sr", width: 15, align: "center"},
                {header: "Menu", dataKey: "name", width: 40},
                {header: "Description", dataKey: "description", width: 50},
                {header: "Price", dataKey: "price", width: 25, align: "right"},
            ]);
        } else {
            pdf.addText("No menus found.", {color: [120, 120, 120]});
        }

        // Add payments section
        pdf.addSectionHeader("Advance Payments");
        if (order.payments.length > 0) {
            const paymentsData = order.payments.map((payment, index) => ({
                sr: index + 1,
                method: payment.payment_method,
                amount: formatCurrency(payment.amount),
                date: formatDateTime(new Date(payment.created_at))
            }));

            pdf.addTable(paymentsData, [
                {header: "Sr.", dataKey: "sr", width: 20, align: "center"},
                {header: "Method", dataKey: "method", width: 30, align: 'center'},
                {header: "Amount", dataKey: "amount", width: 30, align: "center"},
                {header: "Date", dataKey: "date", width: 65}
            ]);
        } else {
            pdf.addText("No payments recorded.", {color: [120, 120, 120]});
        }

        // Add summary section
        pdf.addSectionHeader("Order Summary");
        const totalPaid = order.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        const balance = order.order.balance || (Number(order.order.total_amount) - totalPaid);

        pdf.addSummaryBox([
            {label: "Total Amount", value: formatCurrency(Number(order.order.total_amount)), color: [34, 153, 84]},
            {label: "Total Paid", value: formatCurrency(totalPaid), color: [40, 167, 69]},
            {label: "Balance", value: formatCurrency(balance), color: balance > 0 ? [220, 53, 69] : [40, 167, 69]},
            {label: "Status", value: order.order.status, color: [255, 193, 7]}
        ]);

        // Save PDF
        pdf.save(`Order-${order.order.order_number || order.order.id}.pdf`);
    };

    const generateEventPDF = (event: Event) => {
        if (!order) return;

        const pdf = new PDFGenerator();

        // Add professional header
        pdf.addHeader({
            title: "Event Details",
            subtitle: `${event.name || 'Untitled Event'} - ${event.venue || 'No venue'}`,
            showDate: true
        });

        // Add event details section
        pdf.addSectionHeader("Event Information");
        pdf.addText(`Event Name: ${event.name || '—'}`, {bold: true});
        pdf.addText(`Venue: ${event.venue || '—'}`);
        pdf.addText(`Date: ${event.date ? formatDateTime(new Date(event.date)) : '—'}`);
        pdf.addText(`Guest Count: ${event.guest_count || '—'}`);
        pdf.addText(`Amount: ${event.amount ? formatCurrency(event.amount) : '—'}`);

        // Add menus for this event
        const eventMenus = order.menus.filter(menu => menu.event_id === event.id);
        pdf.addSectionHeader("Menus");
        if (eventMenus.length > 0) {
            const menusData = eventMenus.map((menu, index) => ({
                sr: index + 1,
                name: menu.name || "—",
                description: menu.description || "—",
                price: formatCurrency(menu.price),
            }));

            pdf.addTable(menusData, [
                {header: "Sr.", dataKey: "sr", width: 15, align: "center"},
                {header: "Menu", dataKey: "name", width: 40},
                {header: "Description", dataKey: "description", width: 50},
                {header: "Price", dataKey: "price", width: 25, align: "right"},
            ]);
        } else {
            pdf.addText("No menus found for this event.", {color: [120, 120, 120]});
        }

        // Save PDF
        pdf.save(`Event-${event.name || event.id}.pdf`);
    };

    const generateMenuPDF = (menu: Menu) => {
        if (!order) return;

        const pdf = new PDFGenerator();

        // Add professional header
        pdf.addHeader({
            title: "Menu Details",
            subtitle: menu.name || 'Untitled Menu',
            showDate: true
        });

        // Add menu details section
        pdf.addSectionHeader("Menu Information");
        pdf.addText(`Menu Name: ${menu.name || '—'}`, {bold: true});
        pdf.addText(`Description: ${menu.description || '—'}`);
        pdf.addText(`Price: ${formatCurrency(menu.price)}`);

        // Add menu items
        if (menu.items) {
            pdf.addSectionHeader("Menu Items");
            pdf.addText(menu.items, {fontSize: 12});
        }

        // Save PDF
        pdf.save(`Menu-${menu.name || menu.id}.pdf`);
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return "bg-green-100 text-green-800";
            case 'CANCELLED':
                return "bg-red-100 text-red-800";
            case 'MENU_FINALIZED':
                return "bg-yellow-100 text-yellow-800";
            case 'IN_PROGRESS':
                return "bg-blue-100 text-blue-800";
            default:
                return "outline";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header/>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col items-center justify-center h-[60vh]">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4"/>
                        <p className="text-lg text-muted-foreground">Loading order details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-background">
                <Header/>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-bold text-foreground mb-4">Order Not Found</h1>
                        <Button onClick={() => router.push('/orders')}>
                            <ArrowLeft className="h-4 w-4 mr-2"/>
                            Back to Orders
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const totalPaid = order.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const balance = Number(order.order.balance) || (Number(order.order.total_amount) - totalPaid);
    const sortedEvents = [...order.events].sort((a, b) => {
        const aTime = a.date ? new Date(a.date).getTime() : Number.POSITIVE_INFINITY;
        const bTime = b.date ? new Date(b.date).getTime() : Number.POSITIVE_INFINITY;
        return aTime - bTime;
    });

    return (
        <div className="min-h-screen bg-background">
            <Header/>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => router.push('/orders')}>
                            <ArrowLeft className="h-4 w-4 mr-2"/>
                            Back to Orders
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                Order #{order.order.order_number || order.order.id}
                            </h1>
                            <p className="text-muted-foreground">
                                Created on {new Date(order.order.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={generateOrderPDF}>
                            <Download className="h-4 w-4 mr-2"/>
                            Download Order PDF
                        </Button>
                        <Button onClick={() => setIsEditing(!isEditing)}>
                            <Edit className="h-4 w-4 mr-2"/>
                            {isEditing ? 'Cancel Edit' : 'Edit Order'}
                        </Button>
                    </div>
                </div>

                {/* Order Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                                    <p className="text-2xl font-bold text-foreground">
                                        {conversionUtil.toRupees(order.order.total_amount)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {conversionUtil.toRupees(totalPaid)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Balance</p>
                                    <p className={`text-2xl font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {conversionUtil.toRupees(balance)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <Badge className={getStatusBadgeVariant(order.order.status)}>
                                        {order.order.status}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="events">Events ({order.events.length})</TabsTrigger>
                        <TabsTrigger value="payments">Payments ({order.payments.length})</TabsTrigger>
                        <TabsTrigger value="menus">Menus ({order.menus.length})</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Customer
                                            Name</Label>
                                        <p className="text-lg font-semibold">{order.customer.name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Phone
                                            Number</Label>
                                        <p className="text-lg font-semibold">{order.customer.phone_number}</p>
                                    </div>
                                </div>

                                {order.customer.email && (
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                                        <p className="text-lg font-semibold">{order.customer.email}</p>
                                    </div>
                                )}

                                {order.customer.address && (
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                                        <p className="text-lg font-semibold">{order.customer.address}</p>
                                    </div>
                                )}

                                {isEditing && (
                                    <div className="space-y-4 pt-4 border-t">
                                        <div className="space-y-2">
                                            <Label htmlFor="status">Order Status</Label>
                                            <Select value={orderFormData.status}
                                                    onValueChange={(value) => setOrderFormData(prev => ({
                                                        ...prev,
                                                        status: value
                                                    }))}>
                                                <SelectTrigger className="w-full">
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

                                        <div className="space-y-2">
                                            <Label htmlFor="notes">Order Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={orderFormData.notes}
                                                onChange={(e) => setOrderFormData(prev => ({
                                                    ...prev,
                                                    notes: e.target.value
                                                }))}
                                                placeholder="Additional notes about this order..."
                                                rows={3}
                                            />
                                        </div>

                                        <div className="flex justify-end">
                                            <Button onClick={handleOrderUpdate}>
                                                Save Changes
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {order.order.notes && !isEditing && (
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                                        <p className="text-lg font-semibold">{order.order.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Events Tab */}
                    <TabsContent value="events" className="space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Events</CardTitle>
                                <Button onClick={() => setShowAddEvent(true)}>
                                    <Plus className="h-4 w-4 mr-2"/>
                                    Add Event
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {order.events.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No events added yet. Click &quot;Add Event&quot; to get started.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {sortedEvents.map((event, index) => (
                                            <Card key={event.id}>
                                                <CardContent className="p-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline">Event {index + 1}</Badge>
                                                            <h3 className="text-lg font-semibold">{event.name || 'Untitled Event'}</h3>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => generateEventPDF(event)}
                                                            >
                                                                <Download className="h-4 w-4"/>
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEditEvent(event)}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEventDeleteClick(event)}
                                                            >
                                                                <Trash2 className="h-4 w-4"/>
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        <div>
                                                            <Label
                                                                className="text-sm text-muted-foreground">Date</Label>
                                                            <p className="font-medium">
                                                                {event.date ? new Date(event.date).toLocaleString('en-IN') : '—'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <Label
                                                                className="text-sm text-muted-foreground">Venue</Label>
                                                            <p className="font-medium">{event.venue || '—'}</p>
                                                        </div>
                                                        <div>
                                                            <Label
                                                                className="text-sm text-muted-foreground">Guests</Label>
                                                            <p className="font-medium">{event.guest_count || '—'}</p>
                                                        </div>
                                                        <div>
                                                            <Label
                                                                className="text-sm text-muted-foreground">Amount</Label>
                                                            <p className="font-medium">
                                                                {event.amount ? conversionUtil.toRupees(Number(event.amount)) : '—'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {event.notes && (
                                                        <div className="mt-4">
                                                            <Label
                                                                className="text-sm text-muted-foreground">Notes</Label>
                                                            <p className="font-medium">{event.notes}</p>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Payments Tab */}
                    <TabsContent value="payments" className="space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Payments</CardTitle>
                                <Button onClick={() => setShowAddPayment(true)}>
                                    <Plus className="h-4 w-4 mr-2"/>
                                    Add Payment
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {order.payments.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No payments recorded yet. Click &quot;Add Payment&quot; to get started.
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Payment ID</TableHead>
                                                <TableHead>Method</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {order.payments.map((payment) => (
                                                <TableRow key={payment.id}>
                                                    <TableCell className="font-medium">{payment.payment_id}</TableCell>
                                                    <TableCell>{payment.payment_method}</TableCell>
                                                    <TableCell>{conversionUtil.toRupees(payment.amount)}</TableCell>
                                                    <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handlePaymentDelete(payment.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4"/>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Menus Tab */}
                    <TabsContent value="menus" className="space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Menus</CardTitle>
                                <Button onClick={() => {
                                    setMenuFormData({
                                        name: '',
                                        description: '',
                                        items: '',
                                        price: 0
                                    })
                                    setSelectedEventForMenu("")
                                    setShowAddMenu(true)
                                }}>
                                    <Plus className="h-4 w-4 mr-2"/>
                                    Add Menu
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {order.menus.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No menus created yet. Create an event first to add menus.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {order.menus.map((menu, index) => (
                                            <Card key={menu.id}>
                                                <CardContent className="p-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline">Menu {index + 1}</Badge>
                                                            <h3 className="text-lg font-semibold">{menu.name || 'Untitled Menu'}</h3>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {/*<Button*/}
                                                            {/*    variant="outline"*/}
                                                            {/*    size="sm"*/}
                                                            {/*    onClick={() => generateMenuPDF(menu)}*/}
                                                            {/*>*/}
                                                            {/*    <Download className="h-4 w-4"/>*/}
                                                            {/*</Button>*/}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEditMenu(menu)}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleMenuDeleteClick(menu)}
                                                            >
                                                                <Trash2 className="h-4 w-4"/>
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <Label
                                                                className="text-sm text-muted-foreground">Price</Label>
                                                            <p className="font-medium">{conversionUtil.toRupees(menu.price)}</p>
                                                        </div>
                                                    </div>

                                                    {menu.description && (
                                                        <div className="mb-4">
                                                            <Label
                                                                className="text-sm text-muted-foreground">Menu Items</Label>
                                                            <span className="font-medium">
                                                            <pre>{menu.description}</pre></span>
                                                        </div>
                                                    )}

                                                    {menu.items && (
                                                        <div>
                                                            <Label className="text-sm text-muted-foreground">Menu
                                                                Items</Label>
                                                            <div className="mt-2 p-4 bg-muted rounded-lg">
                                                                <pre className="whitespace-pre-wrap text-sm font-mono">
                                                                    {menu.items}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Add Event Dialog */}
                <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Add New Event</DialogTitle>
                            <DialogDescription>
                                Add a new event to this order.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="eventName">Event Name</Label>
                                    <Input
                                        id="eventName"
                                        value={eventFormData.name}
                                        onChange={(e) => setEventFormData(prev => ({...prev, name: e.target.value}))}
                                        placeholder="Enter event name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="venue">Venue</Label>
                                    <Input
                                        id="venue"
                                        value={eventFormData.venue}
                                        onChange={(e) => setEventFormData(prev => ({...prev, venue: e.target.value}))}
                                        placeholder="Enter venue"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="guestCount">Guest Count</Label>
                                <Input
                                    id="guestCount"
                                    type="number"
                                    value={eventFormData.guest_count}
                                    onChange={(e) => setEventFormData(prev => ({
                                        ...prev,
                                        guest_count: parseInt(e.target.value) || 0
                                    }))}
                                    placeholder="Number of guests"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="eventAmount">Amount (Auto-calculated from menus)</Label>
                                <div className="relative">
                                    <Input
                                        id="eventAmount"
                                        type="number"
                                        value={eventFormData.amount}
                                        onChange={(e) => setEventFormData(prev => ({
                                            ...prev,
                                            amount: parseFloat(e.target.value) || 0
                                        }))}
                                        placeholder="Event amount"
                                        className="pl-8"
                                        disabled
                                    />
                                    <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="eventDate">Event Date</Label>
                                <DateTimePicker
                                    onChange={setEventDate}
                                    value={eventDate}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="eventNotes">Event Notes</Label>
                                <Textarea
                                    id="eventNotes"
                                    value={eventFormData.notes}
                                    onChange={(e) => setEventFormData(prev => ({...prev, notes: e.target.value}))}
                                    placeholder="Additional notes about this event..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setShowAddEvent(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleEventSubmit}>
                                    Add Event
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Add Payment Dialog */}
                <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Add New Payment</DialogTitle>
                            <DialogDescription>
                                Record a payment for this order.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="paymentAmount">Amount</Label>
                                <div className="relative">
                                    <Input
                                        id="paymentAmount"
                                        type="number"
                                        value={paymentFormData.amount}
                                        onChange={(e) => setPaymentFormData(prev => ({
                                            ...prev,
                                            amount: parseFloat(e.target.value) || 0
                                        }))}
                                        placeholder="Payment amount"
                                        className="pl-8"
                                    />
                                    <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="paymentMethod">Payment Method</Label>
                                <Select value={paymentFormData.payment_method}
                                        onValueChange={(value) => setPaymentFormData(prev => ({
                                            ...prev,
                                            payment_method: value as PaymentMethod
                                        }))}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select payment method"/>
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
                                <Label htmlFor="paymentDate">Payment Date</Label>
                                <Input
                                    id="paymentDate"
                                    type="date"
                                    value={paymentFormData.payment_date}
                                    onChange={(e) => setPaymentFormData(prev => ({
                                        ...prev,
                                        payment_date: e.target.value
                                    }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="paymentNotes">Notes</Label>
                                <Textarea
                                    id="paymentNotes"
                                    value={paymentFormData.notes}
                                    onChange={(e) => setPaymentFormData(prev => ({...prev, notes: e.target.value}))}
                                    placeholder="Additional notes about this payment..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setShowAddPayment(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handlePaymentSubmit}>
                                    Add Payment
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Add Menu Dialog */}
                <Dialog open={showAddMenu} onOpenChange={setShowAddMenu}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Add New Menu</DialogTitle>
                            <DialogDescription>
                                Create a new menu for an event.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="eventSelect">Select Event</Label>
                                <Select value={selectedEventForMenu} onValueChange={setSelectedEventForMenu}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose an event for this menu"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sortedEvents.map((event) => (
                                            <SelectItem key={event.id} value={event.id}>
                                                {event.name || 'Untitled Event'} - {event.venue || 'No venue'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="menuItems">Menu Items</Label>
                                <Textarea
                                    id="menuItems"
                                    value={menuFormData.items}
                                    onChange={(e) => setMenuFormData(prev => ({...prev, items: e.target.value}))}
                                    placeholder="Enter menu items (one per line)..."
                                    rows={8}
                                    className="font-mono"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="menuName">Menu Name</Label>
                                    <Input
                                        id="menuName"
                                        value={menuFormData.name}
                                        onChange={(e) => setMenuFormData(prev => ({...prev, name: e.target.value}))}
                                        placeholder="Menu name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="menuPrice">Price</Label>
                                    <div className="relative">
                                        <Input
                                            id="menuPrice"
                                            type="number"
                                            value={menuFormData.price}
                                            onChange={(e) => setMenuFormData(prev => ({
                                                ...prev,
                                                price: parseFloat(e.target.value) || 0
                                            }))}
                                            placeholder="Menu price"
                                            className="pl-8"
                                        />
                                        <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="menuDescription">Description</Label>
                                <Textarea
                                    id="menuDescription"
                                    value={menuFormData.description}
                                    onChange={(e) => setMenuFormData(prev => ({...prev, description: e.target.value}))}
                                    placeholder="Menu description..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setShowAddMenu(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleMenuSubmit}>
                                    Add Menu
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Edit Event Dialog */}
                <Dialog open={showEditEvent} onOpenChange={setShowEditEvent}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Edit Event</DialogTitle>
                            <DialogDescription>
                                Update the event details.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="editEventName">Event Name</Label>
                                    <Input
                                        id="editEventName"
                                        value={eventFormData.name}
                                        onChange={(e) => setEventFormData(prev => ({...prev, name: e.target.value}))}
                                        placeholder="Enter event name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="editVenue">Venue</Label>
                                    <Input
                                        id="editVenue"
                                        value={eventFormData.venue}
                                        onChange={(e) => setEventFormData(prev => ({...prev, venue: e.target.value}))}
                                        placeholder="Enter venue"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="editGuestCount">Guest Count</Label>
                                    <Input
                                        id="editGuestCount"
                                        type="number"
                                        value={eventFormData.guest_count}
                                        onChange={(e) => setEventFormData(prev => ({
                                            ...prev,
                                            guest_count: parseInt(e.target.value) || 0
                                        }))}
                                        placeholder="Number of guests"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="editEventAmount">Amount (Auto-calculated from menus)</Label>
                                    <div className="relative">
                                        <Input
                                            id="editEventAmount"
                                            type="number"
                                            value={eventFormData.amount}
                                            onChange={(e) => setEventFormData(prev => ({
                                                ...prev,
                                                amount: parseFloat(e.target.value) || 0
                                            }))}
                                            placeholder="Event amount"
                                            className="pl-8"
                                            disabled
                                        />
                                        <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="editEventDate">Event Date</Label>
                                <DateTimePicker
                                    onChange={setEventDate}
                                    value={eventDate}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="editEventNotes">Event Notes</Label>
                                <Textarea
                                    id="editEventNotes"
                                    value={eventFormData.notes}
                                    onChange={(e) => setEventFormData(prev => ({...prev, notes: e.target.value}))}
                                    placeholder="Additional notes about this event..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setShowEditEvent(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleEventUpdate}>
                                    Update Event
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Edit Menu Dialog */}
                <Dialog open={showEditMenu} onOpenChange={setShowEditMenu}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Edit Menu</DialogTitle>
                            <DialogDescription>
                                Update the menu details.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="editMenuName">Menu Name</Label>
                                    <Input
                                        id="editMenuName"
                                        value={menuFormData.name}
                                        onChange={(e) => setMenuFormData(prev => ({...prev, name: e.target.value}))}
                                        placeholder="Menu name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="editMenuPrice">Price</Label>
                                    <div className="relative">
                                        <Input
                                            id="editMenuPrice"
                                            type="number"
                                            value={menuFormData.price}
                                            onChange={(e) => setMenuFormData(prev => ({
                                                ...prev,
                                                price: parseFloat(e.target.value) || 0
                                            }))}
                                            placeholder="Menu price"
                                            className="pl-8"
                                        />
                                        <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                                    </div>
                                </div>
                            </div>


                            <div className="space-y-2">
                                <Label htmlFor="editMenuDescription">Menu Items</Label>
                                <Textarea
                                    id="editMenuDescription"
                                    value={menuFormData.description}
                                    onChange={(e) => setMenuFormData(prev => ({...prev, description: e.target.value}))}
                                    placeholder="Menu description..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setShowEditMenu(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleMenuUpdate}>
                                    Update Menu
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete Event Confirmation Dialog */}
                <Dialog open={showDeleteEventConfirm} onOpenChange={setShowDeleteEventConfirm}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Delete Event</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this event? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        {deletingEvent && (
                            <div className="py-4">
                                <div className="bg-muted p-4 rounded-lg">
                                    <h4 className="font-medium">{deletingEvent.name || 'Untitled Event'}</h4>
                                    <div className="text-sm text-muted-foreground mt-2">
                                        <p>Venue: {deletingEvent.venue || '—'}</p>
                                        <p>Date: {deletingEvent.date ? new Date(deletingEvent.date).toLocaleString('en-IN') : '—'}</p>
                                        <p>Guests: {deletingEvent.guest_count || '—'}</p>
                                        <p>Amount: {deletingEvent.amount ? conversionUtil.toRupees(Number(deletingEvent.amount)) : '—'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setShowDeleteEventConfirm(false)}
                                    className="flex-1">
                                Cancel
                            </Button>
                            <Button type="button" onClick={handleEventDelete}
                                    className="flex-1 bg-red-500 hover:bg-red-600">
                                Delete Event
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete Menu Confirmation Dialog */}
                <Dialog open={showDeleteMenuConfirm} onOpenChange={setShowDeleteMenuConfirm}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Delete Menu</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this menu? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        {deletingMenu && (
                            <div className="py-4">
                                <div className="bg-muted p-4 rounded-lg">
                                    <h4 className="font-medium">{deletingMenu.name || 'Untitled Menu'}</h4>
                                    <div className="text-sm text-muted-foreground mt-2">
                                        <p>Price: {conversionUtil.toRupees(deletingMenu.price)}</p>
                                        {deletingMenu.description && <p>Description: {deletingMenu.description}</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setShowDeleteMenuConfirm(false)}
                                    className="flex-1">
                                Cancel
                            </Button>
                            <Button type="button" onClick={handleMenuDelete}
                                    className="flex-1 bg-red-500 hover:bg-red-600">
                                Delete Menu
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
