'use client';

import {useState} from 'react';
import {Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle} from '@/components/ui/drawer';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import {useTranslations} from 'next-intl';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Edit2, Save, Trash2} from 'lucide-react';
import ConversionUtil from '@/utils/ConversionUtil';

interface Expense {
    id: string;
    title: string;
    amount: number;
    category: 'INGREDIENTS' | 'EQUIPMENT' | 'TRANSPORTATION' | 'STAFF' | 'MARKETING' | 'UTILITIES' | 'OTHER';
    description?: string;
    date: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
}

interface ExpenseDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    expense: Expense;
    onSaveAction: () => void;
}

export default function ExpenseDrawer({open, onOpenChange, expense, onSaveAction}: ExpenseDrawerProps) {
    const t = useTranslations('expenses');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [editedExpense, setEditedExpense] = useState<Expense>(expense);

    if (!expense) return null;

    const handleUpdateExpense = async () => {
        setLoading(true);
        const prevExpense = {...expense};
        
        // Optimistic update
        Object.assign(expense, editedExpense);
        
        try {
            const response = await fetch(`/api/expenses/${expense.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedExpense),
            });

            if (!response.ok) {
                throw new Error('Failed to update expense');
            }

            toast.success(t('expenseUpdated'));
            onSaveAction();
            setIsEditing(false);
        } catch (error) {
            // Revert optimistic update on error
            Object.assign(expense, prevExpense);
            toast.error(t('errors.updateFailed'));
            console.error('Error updating expense:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExpense = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/expenses/${expense.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete expense');
            }

            toast.success(t('expenseDeleted'));
            onOpenChange(false);
            onSaveAction();
        } catch (error) {
            toast.error(t('errors.deleteFailed'));
            console.error('Error deleting expense:', error);
        } finally {
            setLoading(false);
            setShowDeleteDialog(false);
        }
    };

    return (
        <>
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="bg-card">
                    <section className="overflow-y-scroll px-8">
                        <DrawerHeader className="flex justify-between items-center">
                            <div>
                                <DrawerTitle className="flex items-center gap-4">
                                    <Badge variant="outline" className="text-md">
                                        {t('expense')}
                                    </Badge>
                                    <span className="text-2xl font-semibold">
                                        {isEditing ? editedExpense.title : expense.title}
                                    </span>
                                </DrawerTitle>
                                <DrawerDescription className="mt-2">
                                    {t('createdAt')}: {new Date(expense.createdAt).toLocaleString()}
                                </DrawerDescription>
                            </div>
                            <div className="flex gap-2">
                                {isEditing ? (
                                    <Button
                                        onClick={handleUpdateExpense}
                                        disabled={loading}
                                        className="gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        {t('save')}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        variant="outline"
                                        className="gap-2"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                        {t('edit')}
                                    </Button>
                                )}
                                <Button
                                    onClick={() => setShowDeleteDialog(true)}
                                    variant="destructive"
                                    className="gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    {t('delete')}
                                </Button>
                            </div>
                        </DrawerHeader>

                        <Separator className="my-4" />

                        <div className="space-y-6 pb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('title')}</label>
                                    {isEditing ? (
                                        <Input
                                            value={editedExpense.title}
                                            onChange={(e) =>
                                                setEditedExpense({...editedExpense, title: e.target.value})
                                            }
                                        />
                                    ) : (
                                        <p className="text-lg">{expense.title}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('amount')}</label>
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            value={editedExpense.amount}
                                            onChange={(e) =>
                                                setEditedExpense({
                                                    ...editedExpense,
                                                    amount: parseFloat(e.target.value),
                                                })
                                            }
                                        />
                                    ) : (
                                        <p className="text-lg">{ConversionUtil.toRupees(expense.amount)}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('category')}</label>
                                    {isEditing ? (
                                        <Select
                                            value={editedExpense.category}
                                            onValueChange={(value) =>
                                                setEditedExpense({
                                                    ...editedExpense,
                                                    category: value as Expense['category'],
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="INGREDIENTS">{t('categories.ingredients')}</SelectItem>
                                                <SelectItem value="EQUIPMENT">{t('categories.equipment')}</SelectItem>
                                                <SelectItem value="TRANSPORTATION">{t('categories.transportation')}</SelectItem>
                                                <SelectItem value="STAFF">{t('categories.staff')}</SelectItem>
                                                <SelectItem value="MARKETING">{t('categories.marketing')}</SelectItem>
                                                <SelectItem value="UTILITIES">{t('categories.utilities')}</SelectItem>
                                                <SelectItem value="OTHER">{t('categories.other')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <p className="text-lg">{t(`categories.${expense.category.toLowerCase()}`)}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('date')}</label>
                                    {isEditing ? (
                                        <Input
                                            type="date"
                                            value={editedExpense.date}
                                            onChange={(e) =>
                                                setEditedExpense({...editedExpense, date: e.target.value})
                                            }
                                        />
                                    ) : (
                                        <p className="text-lg">{new Date(expense.date).toLocaleDateString()}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('description')}</label>
                                {isEditing ? (
                                    <Textarea
                                        value={editedExpense.description || ''}
                                        onChange={(e) =>
                                            setEditedExpense({...editedExpense, description: e.target.value})
                                        }
                                        rows={4}
                                    />
                                ) : (
                                    <p className="text-lg">{expense.description || '-'}</p>
                                )}
                            </div>
                        </div>
                    </section>
                </DrawerContent>
            </Drawer>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('deleteConfirmation.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('deleteConfirmation.description')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteExpense}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t('delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
