'use client';

import {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {useTranslations} from 'next-intl';
import {ExpandedOrder} from "@/data/dto/expanded-order";
import PaymentDetails from "@/components/sections/order/PaymentDetails";
import AddPayment from "@/components/sections/order/AddPayment";
import {ErrorBoundary} from "@/components/error-boundary";
import {Separator} from "@/components/ui/separator";
import {conversionUtil} from "@/utils/ConversionUtil";

export default function PaymentTabs({order, onSaveAction}: {
    order: ExpandedOrder,
    onSaveAction: () => void,
}) {
    const t = useTranslations('payments');
    const c = useTranslations('common');
    const [showAddPayment, setShowAddPayment] = useState(order.payments.length === 0);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    return (
        <Card className="mx-auto mb-4">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-primary">{t('title')}</span>
                    <div className="flex items-center gap-4">
                        {order.payments.length > 0 && (
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
                            variant="default"
                            size="sm"
                            onClick={() => setShowAddPayment((v) => !v)}
                            className="bg-green-400 hover:bg-green-500 text-white"
                            disabled={loading}
                        >
                            {showAddPayment ? c('cancel') : t('addPayment')}
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Separator className="mb-4"/>
                {showAddPayment && (
                    <ErrorBoundary>
                        <AddPayment onAdd={onSaveAction} orderId={order.order.id}/>
                    </ErrorBoundary>
                )}
                {order.payments.length > 0 ? (
                    <Tabs defaultValue={order.payments[0]?.id || "0"} className="w-full">
                        <TabsList className="mb-4 flex flex-wrap gap-2 print:hidden">
                            {order.payments.map((payment, idx) => (
                                <TabsTrigger key={payment.id || idx} value={payment.id || String(idx)}>
                                    {payment.payment_method} - {conversionUtil.toRupees(payment.amount)}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {order.payments.map((payment, idx) => (
                            <TabsContent
                                key={payment.id || idx}
                                value={payment.id || String(idx)}
                                className="print:block"
                            >
                                <ErrorBoundary>
                                    <PaymentDetails
                                        payment={payment}
                                        isEditing={isEditing}
                                        onSaveAction={onSaveAction}
                                    />
                                </ErrorBoundary>
                            </TabsContent>
                        ))}
                    </Tabs>) : (
                    <p className="text-center text-muted-foreground">{t('noPayments')}</p>
                )}
            </CardContent>
        </Card>
    );
}
