'use client';

import {Payment} from "@/data/entities/payment";
import {useTranslations} from "next-intl";
import {useState} from "react";
import {toast} from "sonner";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {IndianRupee, Loader2} from "lucide-react";
import {format} from "date-fns";
import {PaymentMethod} from "@/data/enums/payment-method";
import {PaymentEntityType} from "@/data/enums/payment-entity-type";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { api } from '@/lib/api';
import {Badge} from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import {conversionUtil} from "@/utils/ConversionUtil";

interface PaymentDetailsProps {
    payment: Payment;
    isEditing?: boolean;
    onSaveAction: () => void;
}

export default function PaymentDetails({payment, isEditing, onSaveAction}: PaymentDetailsProps) {
    const t = useTranslations('payments');
    const c = useTranslations('common');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: payment.amount || 0,
        payment_method: payment.payment_method || PaymentMethod.Cash,
        payment_id: payment.payment_id || '',
        entity_type: PaymentEntityType.Event
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handlePaymentMethodChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            payment_method: value as PaymentMethod
        }));
    };

    // Function to get badge variant based on payment method
    const getPaymentMethodBadgeVariant = (method: PaymentMethod) => {
        switch (method) {
            case PaymentMethod.Cash:
                return "bg-green-100 text-green-800";
            case PaymentMethod.Card:
                return "bg-blue-100 text-blue-800";
            case PaymentMethod.UPI:
                return "bg-purple-100 text-purple-800";
            case PaymentMethod.NetBanking:
                return "bg-orange-100 text-orange-800";
            case PaymentMethod.Cheque:
                return "bg-gray-100 text-gray-800";
            default:
                return "outline";
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const updatedPayment: Payment = {
                ...payment,
                ...formData,
                amount: Number(formData.amount)
            };

            const response = await api.put('/api/payment', updatedPayment);

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error('Session expired. Please login again.');
                    return;
                }
                toast.error(t('errors.updateFailed'));
                return;
            }

            toast.success(t('paymentUpdated'));
            onSaveAction();
        } catch (error) {
            toast.error(t('errors.updateFailed'));
            console.error('Error updating payment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            const response = await api.delete('/api/payment', payment);

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error('Session expired. Please login again.');
                    return;
                }
                toast.error(t('errors.deleteFailed'));
                return;
            }

            toast.success(t('paymentDeleted'));
            onSaveAction();
        } catch (error) {
            toast.error(t('errors.deleteFailed'));
            console.error('Error deleting payment:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full">
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label className="text-muted-foreground text-xs" htmlFor="amount">{c('amount')}</Label>
                        {isEditing ? (
                            <div className="relative">
                                <Input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    placeholder={c('amount')}
                                    className="pl-8 w-full"
                                />
                                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                            </div>
                        ) : (
                            <p className="text-foreground font-medium flex items-center">
                                {conversionUtil.toRupees(formData.amount)}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label className="text-muted-foreground text-xs"
                               htmlFor="payment_method">{t('paymentMethod')}</Label>
                        {isEditing ? (
                            <Select
                                value={formData.payment_method}
                                onValueChange={handlePaymentMethodChange}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t('selectPaymentMethod')}/>
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(PaymentMethod).map((method) => (
                                        <SelectItem key={method} value={method}>
                                            {method}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Badge className={getPaymentMethodBadgeVariant(formData.payment_method)}>
                                {formData.payment_method}
                            </Badge>
                        )}
                    </div>
                    <div>
                        <Label className="text-muted-foreground text-xs" htmlFor="payment_id">{t('paymentId')}</Label>
                        {isEditing ? (
                            <Input
                                id="payment_id"
                                name="payment_id"
                                value={formData.payment_id}
                                onChange={handleInputChange}
                                placeholder={t('paymentIdPlaceholder')}
                                className="w-full"
                            />
                        ) : (
                            <p className="text-foreground font-medium">{formData.payment_id || '-'}</p>
                        )}
                    </div>
                    <div>
                        <Label className="text-muted-foreground text-xs">{t('createdAt')}</Label>
                        <p className="text-foreground font-medium">
                            {payment.created_at ? format(new Date(payment.created_at), "PPPp") : '-'}
                        </p>
                    </div>
                </div>
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
