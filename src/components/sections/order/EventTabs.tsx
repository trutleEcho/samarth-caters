'use client';

import {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {useTranslations} from 'next-intl';
import {ExpandedOrder} from "@/data/dto/expanded-order";
import EventDetails from "@/components/sections/order/EventDetails";
import AddEvent from "@/components/sections/order/AddEvent";
import {ErrorBoundary} from "@/components/error-boundary";
import {Separator} from "@/components/ui/separator";

export default function EventTabs({order, onSaveAction}: {
    order: ExpandedOrder,
    onSaveAction: () => void,
}) {
    const t = useTranslations('events');
    const c = useTranslations('common');
    const [showAddEvent, setShowAddEvent] = useState(order.events.length === 0);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    return (
        <Card className="mx-auto mb-4">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-primary">{t('title')}</span>
                    <div className="flex items-center gap-4">
                        {order.events.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                className=""
                                onClick={() => setIsEditing((v) => !v)}
                                disabled={loading}
                            >
                                {isEditing ? c('cancel') : c('edit')}
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAddEvent((v) => !v)}
                            className="bg-yellow-400 hover:bg-yellow-500"
                            disabled={loading}
                        >
                            {showAddEvent ? c('cancel') : t('addEvent')}
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Separator className="mb-4"/>
                {showAddEvent && (
                    <ErrorBoundary>
                        <AddEvent onAdd={onSaveAction} orderId={order.order.id}/>
                    </ErrorBoundary>
                )}
                {order.events.length > 0 ? (
                    <Tabs defaultValue={order.events[0]?.id || "0"} className="w-full">
                        <TabsList className="mb-4 flex flex-wrap gap-2 print:hidden">
                            {order.events.map((event, idx) => (
                                <TabsTrigger key={event.id || idx} value={event.id || String(idx)}>
                                    {event.name || t('eventNumber', {number: idx + 1})}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {order.events.map((event, idx) => (
                            <TabsContent
                                key={event.id || idx}
                                value={event.id || String(idx)}
                                className="print:block"
                            >
                                <ErrorBoundary>
                                    <EventDetails
                                        event={event}
                                        menu={order?.menus?.find((m) => m.event_id === event.id)}
                                        isEditing={isEditing}
                                        onSaveAction={onSaveAction}
                                    />
                                </ErrorBoundary>
                            </TabsContent>
                        ))}
                    </Tabs>) : (
                    <p className="text-center text-muted-foreground">{t('noEvents')}</p>
                )}
            </CardContent>
        </Card>
    );
}