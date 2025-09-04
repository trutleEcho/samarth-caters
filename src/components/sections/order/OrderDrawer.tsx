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
import { PDFGenerator, formatCurrency, formatDateTime } from "@/lib/pdf-utils";
import {Button} from "@/components/ui/button";
import {Download} from "lucide-react";

export default function OrderDrawer({open, onOpenChange, order, onSaveAction}: {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    order: ExpandedOrder,
    onSaveAction: () => void
}) {
    const t = useTranslations('orders');

    if (!order) return null;

    const genOrderPDF = async (order: ExpandedOrder) => {
        const pdf = new PDFGenerator();

        // Add professional header
        pdf.addHeader({
            title: "Order Invoice",
            subtitle: `Order #${order.order.order_number || order.order.id}`,
            showDate: true
        });

        // Add customer details section
        pdf.addSectionHeader("Customer Details");
        pdf.addText(`Name: ${order.customer.name}`, { bold: true });
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
                { header: "Sr.", dataKey: "sr", width: 15, align: "center" },
                { header: "Event", dataKey: "name", width: 50 },
                { header: "Date", dataKey: "date", width: 50 },
                { header: "Venue", dataKey: "venue", width: 40 },
                { header: "Guests", dataKey: "guests", width: 20, align: "center" },
                { header: "Amount", dataKey: "amount", width: 25, align: "right" }
            ]);
        } else {
            pdf.addText("No events found.", { color: [120, 120, 120] });
        }

        // Add payments section
        pdf.addSectionHeader("Payments");
        if (order.payments.length > 0) {
            const paymentsData = order.payments.map((payment, index) => ({
                sr: index + 1,
                paymentId: payment.payment_id,
                method: payment.payment_method,
                amount: formatCurrency(payment.amount),
                date: formatDateTime(new Date(payment.created_at))
            }));

            pdf.addTable(paymentsData, [
                { header: "Sr.", dataKey: "sr", width: 15, align: "center" },
                { header: "Payment ID", dataKey: "paymentId", width: 50 },
                { header: "Method", dataKey: "method", width: 30 },
                { header: "Amount", dataKey: "amount", width: 30, align: "right" },
                { header: "Date", dataKey: "date", width: 65 }
            ]);
        } else {
            pdf.addText("No payments recorded.", { color: [120, 120, 120] });
        }

        // Add summary section
        pdf.addSectionHeader("Order Summary");
        const totalPaid = order.payments.reduce((sum, payment) => sum + payment.amount, 0);
        const balance = order.order.balance || (order.order.total_amount - totalPaid);
        
        pdf.addSummaryBox([
            { label: "Total Amount", value: formatCurrency(order.order.total_amount), color: [34, 153, 84] },
            { label: "Total Paid", value: formatCurrency(totalPaid), color: [40, 167, 69] },
            { label: "Balance", value: formatCurrency(balance), color: balance > 0 ? [220, 53, 69] : [40, 167, 69] },
            { label: "Status", value: order.order.status, color: [255, 193, 7] }
        ]);

        // Save PDF
        pdf.save(`Order-${order.order.order_number || order.order.id}.pdf`);
    }

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
                                    <span className="flex flex-col items-start gap-2">
                                        <span className="text-xs text-muted-foreground">
                                        {t('email')}: <span className="text-lg font-semibold text-foreground">
                                            {order.customer.email ?? '-'}
                                        </span>
                                    </span>
                                        <Button onClick={() => genOrderPDF(order)}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </Button>
                                    </span>
                                    <span className="flex flex-col items-end">
                                        <span className="text-xs text-muted-foreground">
                                            {t('total')}: <span className="text-lg font-semibold text-foreground">
                                                {ConversionUtil.toRupees(order.order.total_amount || 0)}
                                            </span>
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {t('balance')}: <span className="text-lg font-semibold text-foreground">
                                                {ConversionUtil.toRupees(order.order.balance || 0)}
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