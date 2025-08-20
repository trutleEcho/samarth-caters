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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {Button} from "@/components/ui/button";
import {Download} from "lucide-react";
import {formatDateTime} from "@/lib/format";

export default function OrderDrawer({open, onOpenChange, order, onSaveAction}: {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    order: ExpandedOrder,
    onSaveAction: () => void
}) {
    const t = useTranslations('orders');

    if (!order) return null;

    const genOrderPDF = async (order: ExpandedOrder) => {
        const doc = new jsPDF("p", "mm", "a4")

        // ---------------- HEADER ----------------
        const logoUrl = "/logo.png" // from public/
        doc.addImage(logoUrl, "PNG", 10, 8, 40, 20)

        // Company name
        doc.setFont("helvetica", "bold")
        doc.setFontSize(20)
        doc.text("Samarth Caters", 55, 20)

        // Report title
        doc.setFont("helvetica", "normal")
        doc.setFontSize(14)
        doc.setTextColor(80)
        doc.text("Order Invoice", 55, 28)

        // Date
        doc.setFontSize(10)
        doc.setTextColor(120)
        doc.text(`Generated on: ${formatDateTime(new Date())}`, 55, 34)

        // Line separator
        doc.setDrawColor(180)
        doc.setLineWidth(0.5)
        doc.line(10, 40, 200, 40)

        let y = 50
        doc.setTextColor(0)

        // ---------------- CUSTOMER DETAILS ----------------
        doc.setFont("helvetica", "bold")
        doc.setFontSize(13)
        doc.text("1. Customer Details", 10, y)

        y += 10
        doc.setFont("helvetica", "normal")
        doc.setFontSize(11)
        doc.text(`• Name: ${order.customer.name}`, 15, y); y += 8
        doc.text(`• Phone: ${order.customer.phone_number}`, 15, y); y += 8
        if (order.customer.email) { doc.text(`• Email: ${order.customer.email}`, 15, y); y += 8 }
        if (order.customer.address) {
            doc.text("• Address:", 15, y)
            y += 6
            doc.text(order.customer.address, 20, y, { maxWidth: 170 })
            y += 12
        }

        // ---------------- EVENTS ----------------
        doc.setFont("helvetica", "bold")
        doc.setFontSize(13)
        doc.text("2. Events", 10, y)

        if (order.events.length > 0) {
            autoTable(doc, {
                startY: y + 5,
                head: [["Sr.No", "Event", "Date", "Venue", "Guests", "Amount"]],
                body: order.events.map((event, i) => [
                    i + 1,
                    event.name || "—",
                    event.date ? formatDateTime(new Date(event.date)) : "—",
                    event.venue || "—",
                    event.guest_count?.toString() || "—",
                    event.amount ? `INR ${event.amount.toLocaleString("en-IN")}` : "—",
                ]),
                headStyles: { fillColor: [60, 141, 188], textColor: 255, halign: "center" },
                styles: { fontSize: 10, cellPadding: 4 },
            })
            y = (doc.lastAutoTable?.finalY ?? y) + 10
        } else {
            doc.setFont("helvetica", "normal")
            doc.setFontSize(11)
            doc.text("No events found.", 15, y + 8)
            y += 15
        }

        // ---------------- PAYMENTS ----------------
        doc.setFont("helvetica", "bold")
        doc.setFontSize(13)
        doc.text("3. Payments", 10, y)

        if (order.payments.length > 0) {
            autoTable(doc, {
                startY: y + 5,
                head: [["Sr.No", "Payment ID", "Method", "Amount", "Date"]],
                body: order.payments.map((p, i) => [
                    i + 1,
                    p.payment_id,
                    p.payment_method,
                    `INR ${p.amount.toLocaleString("en-IN")}`,
                    formatDateTime(new Date(p.created_at)),
                ]),
                headStyles: { fillColor: [34, 153, 84], textColor: 255, halign: "center" },
                styles: { fontSize: 10, cellPadding: 4 },
            })
            y = (doc.lastAutoTable?.finalY ?? y) + 10
        } else {
            doc.setFont("helvetica", "normal")
            doc.setFontSize(11)
            doc.text("No payments recorded.", 15, y + 8)
            y += 15
        }

        // ---------------- SUMMARY ----------------
        doc.setFont("helvetica", "bold")
        doc.setFontSize(13)
        doc.text("4. Summary", 10, y)

        y += 10
        doc.setFont("helvetica", "normal")
        doc.setFontSize(11)
        doc.text(`• Total Amount: INR ${order.order.total_amount.toLocaleString("en-IN")}`, 15, y)
        y += 8
        if (order.order.balance !== undefined) {
            doc.text(`• Balance: INR ${(order.order.total_amount -order.order.balance).toLocaleString("en-IN")}`, 15, y)
            y += 8
        }

        // ---------------- FOOTER ----------------
        doc.setFontSize(9)
        doc.setTextColor(150)
        doc.text("Thank you for choosing Samarth Caters!", 10, 290)
        doc.text("© 2025 Samarth Caters", 160, 290)

        // Save PDF
        doc.save(`Order-${order.order.order_number}.pdf`)
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
                            <div className="space-y-4">
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
                                <div className="flex flex-row items-start justify-between">
                                    <div className="flex flex-col items-start gap-2">
                                        <span className="text-xs text-muted-foreground">
                                        {t('email')}: <span className="text-lg font-semibold text-foreground">
                                            {order.customer.email ?? '-'}
                                        </span>
                                    </span>
                                        <Button onClick={() => genOrderPDF(order)}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </Button>
                                    </div>
                                    <div className="flex flex-col items-end">
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
                                    </div>
                                </div>
                            </div>
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