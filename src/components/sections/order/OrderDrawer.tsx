'use client';

import {Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle} from '@/components/ui/drawer';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import EventTabs from './EventTabs';
import PaymentTabs from './PaymentTabs';
import {useTranslations} from 'next-intl';
import {ExpandedOrder} from "@/data/dto/expanded-order";
import {ErrorBoundary} from "@/components/error-boundary";
import ConversionUtil from "@/utils/ConversionUtil";
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';

export default function OrderDrawer({open, onOpenChange, order, onSaveAction}: {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    order: ExpandedOrder,
    onSaveAction: () => void
}) {
    const t = useTranslations('orders');

    if (!order) return null;

    // const handleUpdateOrder = async () => {
    //     setLoading(true);
    //     try {
    //         const response = await fetch(`/api/orders/${order.order.id}`, {
    //             method: 'PUT',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(order),
    //         });
    //
    //         if (!response.ok) {
    //             throw new Error('Failed to update order');
    //         }
    //
    //         toast.success(t('orderUpdated'));
    //         onSave();
    //         setIsEditing(false);
    //     } catch (error) {
    //         toast.error(t('errors.updateFailed'));
    //         console.error('Error updating order:', error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="bg-card print:bg-white print:shadow-none print:border-none">
                <section className="overflow-y-scroll px-8">
                    <DrawerHeader>
                        <DrawerTitle>
                            <span className="flex flex-row items-center justify-between">
                                <Badge variant="outline" className="text-md">
                                    {t('orderBook')}
                                </Badge>
                                <span className="text-4xl font-bold text-primary">
                                    SAMARTH <br/>CATERS
                                </span>
                                <span className="flex flex-col items-end">
                                    <span className="text-xs text-muted-foreground">
                                        {t('orderNumber')}: <span className="text-lg font-semibold text-foreground">
                                            {order.order.order_number}
                                        </span>
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {t('date')}: <span className="text-lg font-semibold text-foreground">
                                            {order.order.created_at ? new Date(order.order.created_at).toDateString() : '-'}
                                        </span>
                                    </span>
                                </span>
                            </span>
                        </DrawerTitle>
                        <Separator className="my-4"/>
                        <DrawerDescription>
                            <span className="space-y-4">
                                <span className="flex flex-row items-start justify-between">
                                    <span className="text-xs text-muted-foreground">
                                        {t('name')}: <span className="text-lg font-semibold text-foreground">
                                            {order.customer.name}
                                        </span>
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {t('address')}: <span className="text-lg font-semibold text-foreground">
                                            {order.customer.address ?? '-'}
                                        </span>
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {t('phone')}: <span className="text-lg font-semibold text-foreground">
                                            {order.customer.phone_number}
                                        </span>
                                    </span>
                                </span>
                                <span className="flex flex-row items-start justify-between">
                                    <span className="text-xs text-muted-foreground">
                                        {t('email')}: <span className="text-lg font-semibold text-foreground">
                                            {order.customer.email ?? '-'}
                                        </span>
                                    </span>
                                    <span className="flex flex-col items-end">
                                        <span className="text-xs text-muted-foreground">
                                            {t('total')}: <span className="text-lg font-semibold text-foreground">
                                                {ConversionUtil.toRupees(order.order.total_amount || 0)}
                                            </span>
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {t('balance')}: <span className="text-lg font-semibold text-foreground">
                                                {ConversionUtil.toRupees((order.order.total_amount - (order.order.balance || 0)) || 0)}
                                            </span>
                                        </span>
                                    </span>
                                </span>
                            </span>
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 md:p-6">
                        <Tabs defaultValue="events" className="w-full">
                            <TabsList className="mb-4 w-full justify-start">
                                <TabsTrigger value="events" className="flex-1">
                                    Events ({order.events.length})
                                </TabsTrigger>
                                <TabsTrigger value="payments" className="flex-1">
                                    Payments ({order.payments.length})
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="events">
                                <ErrorBoundary>
                                    <EventTabs
                                        order={order}
                                        onSaveAction={onSaveAction}
                                    />
                                </ErrorBoundary>
                            </TabsContent>
                            <TabsContent value="payments">
                                <ErrorBoundary>
                                    <PaymentTabs
                                        order={order}
                                        onSaveAction={onSaveAction}
                                    />
                                </ErrorBoundary>
                            </TabsContent>
                        </Tabs>
                    </div>
                </section>
            </DrawerContent>
        </Drawer>
    );
}