import {useState} from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Separator} from '@/components/ui/separator';
import {toast} from 'sonner';
import {useTranslations} from 'next-intl';
import { api } from "@/lib/api";

interface AddExpenseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function AddExpenseDialog({open, onOpenChange, onSuccess}: AddExpenseDialogProps) {
    const t = useTranslations('expenses');
    const commonT = useTranslations('common');
    
    const [formData, setFormData] = useState({
        description: '',
        amount: 0,
        expense_date: new Date().toISOString().split('T')[0],
        notes: '',
        category: '',
        meta: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let metaJson = {};
            if (formData.meta) {
                try {
                    metaJson = JSON.parse(formData.meta);
                } catch (error) {
                    toast.error('Invalid JSON in Meta field');
                    setLoading(false);
                    return;
                }
            }

            const request = {
                description: formData.description,
                amount: Number(formData.amount),
                expense_date: new Date(formData.expense_date),
                notes: formData.notes,
                category: formData.category,
                meta: metaJson
            };

            const response = await api.post('/api/expenses', request);

            if (response.ok) {
                onOpenChange(false);
                setFormData({
                    description: '',
                    amount: 0,
                    expense_date: new Date().toISOString().split('T')[0],
                    notes: '',
                    category: '',
                    meta: ''
                });
                onSuccess();
                toast.success('Expense added successfully');
            } else if (response.status === 401) {
                toast.error('Please login again');
            } else {
                toast.error(`Failed to create expense: ${response.statusText}`);
            }
        } catch (error) {
            toast.error('Error creating expense');
            console.error('Error creating expense:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('addExpense.title')}</DialogTitle>
                    <DialogDescription>
                        {t('addExpense.description')}
                    </DialogDescription>
                </DialogHeader>
                <Separator className="my-4"/>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount *</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                            required
                            step="0.01"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="expense_date">Date *</Label>
                        <Input
                            id="expense_date"
                            type="date"
                            value={formData.expense_date}
                            onChange={(e) => setFormData({...formData, expense_date: e.target.value})}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            placeholder="Add any additional notes here"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="meta">Meta (JSON)</Label>
                        <Textarea
                            id="meta"
                            value={formData.meta}
                            onChange={(e) => setFormData({...formData, meta: e.target.value})}
                            placeholder='{"key": "value"}'
                        />
                    </div>
                    <div className="flex space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1"
                                disabled={loading}>
                            {commonT('cancel')}
                        </Button>
                        <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Expense'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
