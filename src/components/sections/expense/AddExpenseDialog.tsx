import {useState} from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Separator} from '@/components/ui/separator';
import {toast} from 'sonner';
import {useTranslations} from 'next-intl';

interface AddExpenseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function AddExpenseDialog({open, onOpenChange, onSuccess}: AddExpenseDialogProps) {
    const t = useTranslations('expenses');
    const commonT = useTranslations('common');
    
    const [formData, setFormData] = useState({
        title: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        note: '',
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
                title: formData.title,
                amount: Number(formData.amount),
                date: new Date(formData.date),
                note: formData.note,
                meta: metaJson
            };

            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(request)
            });

            if (response.ok) {
                onOpenChange(false);
                setFormData({
                    title: '',
                    amount: 0,
                    date: new Date().toISOString().split('T')[0],
                    note: '',
                    meta: ''
                });
                onSuccess();
                toast.success('Expense added successfully');
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
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                        <Label htmlFor="date">Date *</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="note">Note</Label>
                        <Textarea
                            id="note"
                            value={formData.note}
                            onChange={(e) => setFormData({...formData, note: e.target.value})}
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
