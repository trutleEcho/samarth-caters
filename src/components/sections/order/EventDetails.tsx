'use client';

import {Event} from "@/data/entities/event";
import {useTranslations} from "next-intl";
import {useState} from "react";
import {toast} from "sonner";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {CalendarIcon, Download, IndianRupee, Loader2} from "lucide-react";
import {format} from "date-fns";
import DateTimePicker from "../../../../datetime-picker";
import {EventStatus} from "@/data/enums/event-status";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {ErrorBoundary} from "@/components/error-boundary";
import {Menu} from "@/data/entities/menu";
import MenuManager from "@/components/sections/order/MenuManager";
import ConversionUtil from "@/utils/ConversionUtil";
import autoTable from "jspdf-autotable";
import {formatDateTime} from "@/lib/format";
import jsPDF from "jspdf";

interface EventDetailsProps {
    event: Event;
    isEditing?: boolean;
    onSaveAction: () => void;
    menu?: Menu
}

export default function EventDetails({event, isEditing, onSaveAction, menu}: EventDetailsProps) {
    const t = useTranslations('events');
    const c = useTranslations('common');
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<Date | undefined>(event.date ? new Date(event.date) : undefined);
    const [formData, setFormData] = useState({
        name: event.name || '',
        venue: event.venue || '',
        guest_count: event.guest_count || 0,
        notes: event.notes || '',
        amount: event.amount || 0,
        status: event.status || EventStatus.Received
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleStatusChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            status: value as EventStatus
        }));
    };

    // Function to get badge variant based on status
    const getStatusBadgeVariant = (status: EventStatus) => {
        switch (status) {
            case EventStatus.Completed:
                return "bg-green-100 text-green-800";
            case EventStatus.Delivered:
                return "bg-green-100 text-green-800";
            case EventStatus.Cancelled:
                return "bg-red-100 text-red-800";
            case EventStatus.MenuConfirmed:
                return "bg-yellow-100 text-yellow-800";
            case EventStatus.Processing:
                return "bg-blue-100 text-blue-800";
            default:
                return "outline";
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const updatedEvent: Event = {
                ...event,
                ...formData,
                date: date
            };

            const response = await fetch(`/api/event`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedEvent),
            });

            if (!response.ok) {
                toast.error('Error updating event');
                return
            }

            toast.success(t('eventUpdated'));
            onSaveAction()
        } catch (error) {
            toast.error(t('errors.updateFailed'));
            console.error('Error updating event:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/event`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            });

            if (!response.ok) {
                toast.error('Error deleting event');
                return
            }

            toast.success(t('eventDeleted'));
            onSaveAction()
        } catch (error) {
            toast.error(t('errors.deleteFailed'));
            console.error('Error deleting event:', error);
        } finally {
            setLoading(false);
        }
    };

    const genEventMenuPDF = async (event: Event, menu?: Menu) => {
        const doc = new jsPDF("p", "mm", "a4")

        // ---------------- HEADER ----------------
        const logoUrl = "/logo.png"
        doc.addImage(logoUrl, "PNG", 10, 8, 40, 20)

        doc.setFont("helvetica", "bold")
        doc.setFontSize(18)
        doc.text("Samarth Caters", 60, 18)

        doc.setFont("helvetica", "normal")
        doc.setFontSize(12)
        doc.setTextColor(80)
        doc.text("Event Menu", 60, 26)

        doc.setDrawColor(180)
        doc.setLineWidth(0.5)
        doc.line(10, 35, 200, 35)

        let y = 45
        doc.setTextColor(0)

        // ---------------- EVENT DETAILS ----------------
        doc.setFont("helvetica", "bold")
        doc.setFontSize(13)
        doc.text("Event Details", 10, y)

        y += 10
        doc.setFont("helvetica", "normal")
        doc.setFontSize(11)
        doc.text(`• Event: ${event.name || "—"}`, 15, y); y += 8
        doc.text(`• Date: ${event.date ? formatDateTime(event.date) : "—"}`, 15, y); y += 8
        doc.text(`• Venue: ${event.venue || "—"}`, 15, y); y += 8
        doc.text(`• Guests: ${event.guest_count ?? "—"}`, 15, y); y += 8
        if (event.notes) {
            doc.text("• Notes:", 15, y);
            y += 6
            doc.text(event.notes, 20, y, { maxWidth: 170 })
            y += 12
        } else {
            y += 4
        }

        // ---------------- MENU ----------------
        doc.setFont("helvetica", "bold")
        doc.setFontSize(13)
        doc.text("Menu", 10, y)

        y += 10
        doc.setFont("helvetica", "normal")
        doc.setFontSize(11)

        if (menu?.items) {
            // Split items by new line instead of comma
            const itemsList = menu.items
                .split(/\r?\n/) // handles both Windows (\r\n) and Unix (\n) line endings
                .map((item) => item.trim())
                .filter((item) => item.length > 0) // remove empty lines

            if (itemsList.length > 0) {
                autoTable(doc, {
                    startY: y,
                    head: [["Sr.No", "Item"]],
                    body: itemsList.map((item, i) => [i + 1, item]),
                    headStyles: { fillColor: [52, 73, 94], textColor: 255, halign: "center" },
                    styles: { fontSize: 11, cellPadding: 4 },
                })
                y = (doc.lastAutoTable?.finalY ?? y) + 10
            } else {
                doc.text("No menu items provided.", 15, y)
                y += 10
            }
        } else {
            doc.text("No menu items provided.", 15, y)
            y += 10
        }


        // ---------------- FOOTER ----------------
        doc.setFontSize(9)
        doc.setTextColor(150)
        doc.text("Prepared for kitchen & service staff", 10, 290)
        doc.text("© 2025 Samarth Caters", 160, 290)

        // Save PDF
        doc.save(`Event-Menu-${event.name || event.id}.pdf`)
    }

    return (
        <Card className="w-full">
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label className="text-muted-foreground text-xs" htmlFor="name">{t('name')}</Label>
                        {isEditing ? (
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder={t('namePlaceholder')}
                                className="w-full"
                            />
                        ) : (
                            <p className="text-foreground font-medium">{formData.name || '-'}</p>
                        )}
                    </div>
                    <div>
                        <Label className="text-muted-foreground text-xs" htmlFor="venue">{t('venue')}</Label>
                        {isEditing ? (
                            <Input
                                id="venue"
                                name="venue"
                                value={formData.venue}
                                onChange={handleInputChange}
                                placeholder={t('venuePlaceholder')}
                                className="w-full"
                            />
                        ) : (
                            <p className="text-foreground font-medium">{formData.venue || '-'}</p>
                        )}
                    </div>
                    <div>
                        <Label className="text-muted-foreground text-xs">{t('date')}</Label>
                        {isEditing ? (
                            <div className="relative">
                                <DateTimePicker
                                    onChange={(e) => setDate(e)}
                                    value={date}
                                />
                                <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                            </div>
                        ) : (
                            <p className="text-foreground font-medium">
                                {date ? format(date, "PPPp") : '-'}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label className="text-muted-foreground text-xs" htmlFor="status">{c('status')}</Label>
                        {isEditing ? (
                            <Select
                                value={formData.status}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select status"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(EventStatus).map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Badge className={getStatusBadgeVariant(formData.status)}>
                                {formData.status}
                            </Badge>
                        )}
                    </div>
                    <div>
                        <Label className="text-muted-foreground text-xs" htmlFor="guest_count">{t('guestCount')}</Label>
                        {isEditing ? (
                            <Input
                                id="guest_count"
                                name="guest_count"
                                type="number"
                                value={formData.guest_count}
                                onChange={handleInputChange}
                                placeholder={t('guestCountPlaceholder')}
                                className="w-full"
                            />
                        ) : (
                            <p className="text-foreground font-medium">{formData.guest_count || '-'}</p>
                        )}
                    </div>
                    <div>
                        <Label className="text-muted-foreground text-xs" htmlFor="amount">{c('amount')}</Label>
                        {isEditing ? (
                            <div className="relative">
                                <Input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    placeholder={c('amount')}
                                    className="pl-8 w-full"
                                />
                                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                            </div>
                        ) : (
                            <p className="text-foreground font-medium flex items-center">
                                {ConversionUtil.toRupees(formData.amount)}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2 md:col-span-1">
                        <Label className="text-muted-foreground text-xs" htmlFor="notes">{t('notes')}</Label>
                        {isEditing ? (
                            <Input
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder={t('notesPlaceholder')}
                                className="w-full"
                            />
                        ) : (
                            <p className="text-foreground font-medium">{formData.notes || '-'}</p>
                        )}
                    </div>
                    <div className="space-y-2 md:col-span-1">
                        {isEditing ? (
                            <div></div>
                        ) : (
                            <Button onClick={()=>genEventMenuPDF(event,menu)}>
                                <Download className="mr-2 h-4 w-4"/>
                                Download Menu
                            </Button>
                        )}
                    </div>
                </div>

                <ErrorBoundary>
                    <MenuManager
                        eventId={event.id}
                        menu={menu}
                        onSave={() => {
                            onSaveAction()
                        }}
                        isEditing={isEditing}
                    />
                </ErrorBoundary>
            </CardContent>
            <CardFooter className="flex justify-end">
                {isEditing ? (
                        <CardFooter className="flex justify-end">
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full md:w-auto"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                        {t('saving')}
                                    </>
                                ) : t('save')}
                            </Button>
                        </CardFooter>
                    ) :
                    <Button
                        onClick={() => handleDelete()}
                        variant="destructive"
                        className="w-full md:w-auto"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                {c('deleting')}
                            </>
                        ) : c('delete')}
                    </Button>}

            </CardFooter>

        </Card>
    );
}
