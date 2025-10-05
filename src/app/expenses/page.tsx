'use client'

import {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import {Plus, Search, Filter, Calendar, DollarSign, TrendingUp, TrendingDown, Download} from 'lucide-react'
import Header from '@/components/layout/header'
import PageHeader from '@/components/ui/page-header'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Badge} from '@/components/ui/badge'
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import {Label} from '@/components/ui/label'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Textarea} from '@/components/ui/textarea'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table'
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription} from '@/components/ui/drawer'
import {Edit, Trash2} from 'lucide-react'
import {formatDate} from '@/lib/format'
import {toast} from "sonner";
import StatCard from "@/components/ui/stat-card";
import {PDFGenerator, formatDateTime, formatCurrency} from "@/lib/pdf-utils";
import { api } from "@/lib/api";
import {conversionUtil} from "@/utils/ConversionUtil";

interface Expense {
    id: string
    description: string
    amount: number
    category?: string
    expense_date?: string
    notes?: string
    created_at: string
    updated_at?: string
}

const categoryColors: { [key: string]: string } = {
    'INGREDIENTS': 'bg-green-100 text-green-800',
    'EQUIPMENT': 'bg-blue-100 text-blue-800',
    'TRANSPORTATION': 'bg-purple-100 text-purple-800',
    'STAFF': 'bg-orange-100 text-orange-800',
    'MARKETING': 'bg-pink-100 text-pink-800',
    'UTILITIES': 'bg-yellow-100 text-yellow-800',
    'OTHER': 'bg-gray-100 text-gray-800'
}

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [dateRange, setDateRange] = useState({from: '', to: ''})
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: '',
        notes: '',
        expense_date: new Date().toISOString().split('T')[0]
    })
    const [editFormData, setEditFormData] = useState({
        description: '',
        amount: '',
        category: '',
        notes: '',
        expense_date: ''
    })

    useEffect(() => {
        fetchExpenses()
    }, [])

    useEffect(() => {
        let filtered = expenses

        if (searchTerm) {
            filtered = filtered.filter(expense =>
                expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                expense.notes?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(expense => expense.category === categoryFilter)
        }

        if (dateRange.from && dateRange.to) {
            filtered = filtered.filter(expense => {
                const expenseDate = new Date(expense.expense_date || expense.created_at)
                const fromDate = new Date(dateRange.from)
                const toDate = new Date(dateRange.to)
                fromDate.setHours(0, 0, 0, 0)
                toDate.setHours(23, 59, 59, 999)
                return expenseDate >= fromDate && expenseDate <= toDate
            })
        }

        setFilteredExpenses(filtered)
    }, [expenses, searchTerm, categoryFilter, dateRange])

    const fetchExpenses = async () => {
        setLoading(true)
        try {
            const response = await api.get('/api/expenses')
            if (response.ok) {
                const data = await response.json()
                setExpenses(data)
                setFilteredExpenses(data)
                if (data.length === 0) {
                    toast.info('No expenses found')
                }
            } else if (response.status === 401) {
                toast.error('Please login again')
            } else if (response.status === 500) {
                toast.error(`Error fetching expenses: ${response.statusText}`)
            }
        } catch (error) {
            toast.error('Failed to fetch expenses')
            console.error('Error fetching expenses:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const response = await api.post('/api/expenses', formData)

            if (response.ok) {
                toast.success('Expense added successfully')
                setIsDialogOpen(false)
                setFormData({
                    description: '',
                    amount: '',
                    category: '',
                    notes: '',
                    expense_date: new Date().toISOString().split('T')[0]
                })
                fetchExpenses()
            } else if (response.status === 401) {
                toast.error('Please login again')
            } else if (response.status === 500) {
                toast.error(`Failed to create expense: ${response.statusText}`)
            }
        } catch (error) {
            toast.error('Failed to create expense')
            console.error('Error creating expense:', error)
        }
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!editingExpense) return

        try {
            const response = await api.put(`/api/expenses?id=${editingExpense.id}`, editFormData)

            if (response.ok) {
                toast.success('Expense updated successfully')
                setIsEditDialogOpen(false)
                setEditingExpense(null)
                setEditFormData({
                    description: '',
                    amount: '',
                    category: '',
                    notes: '',
                    expense_date: ''
                })
                fetchExpenses()
            } else if (response.status === 401) {
                toast.error('Please login again')
            } else if (response.status === 500) {
                toast.error(`Failed to update expense: ${response.statusText}`)
            }
        } catch (error) {
            toast.error('Failed to update expense')
            console.error('Error updating expense:', error)
        }
    }

    const handleDeleteExpense = async () => {
        if (!expenseToDelete) return

        try {
            const response = await api.delete(`/api/expenses?id=${expenseToDelete.id}`)

            if (response.ok) {
                toast.success('Expense deleted successfully')
                setDeleteConfirmOpen(false)
                setExpenseToDelete(null)
                fetchExpenses()
            } else if (response.status === 401) {
                toast.error('Please login again')
            } else if (response.status === 500) {
                toast.error(`Failed to delete expense: ${response.statusText}`)
            }
        } catch (error) {
            toast.error('Failed to delete expense')
            console.error('Error deleting expense:', error)
        }
    }

    const openEditDialog = (expense: Expense) => {
        setEditingExpense(expense)
        setEditFormData({
            description: expense.description,
            amount: expense.amount.toString(),
            category: expense.category || '',
            notes: expense.notes || '',
            expense_date: expense.expense_date ? expense.expense_date.split('T')[0] : expense.created_at.split('T')[0]
        })
        setIsEditDialogOpen(true)
    }

    const openDeleteConfirm = (expense: Expense) => {
        setExpenseToDelete(expense)
        setDeleteConfirmOpen(true)
    }

    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
    const thisMonth = expenses.filter(expense =>
        new Date(expense.expense_date || expense.created_at).getMonth() === new Date().getMonth() &&
        new Date(expense.expense_date || expense.created_at).getFullYear() === new Date().getFullYear()
    ).reduce((sum, expense) => sum + Number(expense.amount), 0)

    const lastMonth = expenses.filter(expense => {
        const date = new Date(expense.expense_date || expense.created_at)
        const lastMonthDate = new Date()
        lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
        return date.getMonth() === lastMonthDate.getMonth() &&
            date.getFullYear() === lastMonthDate.getFullYear()
    }).reduce((sum, expense) => sum + Number(expense.amount), 0)

    const monthlyChange = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header/>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-48"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const genExpensesPDF = () => {
        const pdf = new PDFGenerator();

        // Add professional header
        pdf.addHeader({
            title: "Expenses Report",
            subtitle: "Business Expense Analysis",
            showDate: true
        });

        // Add summary section
        pdf.addSectionHeader("Expense Summary");
        pdf.addSummaryBox([
            { label: "Total Expenses", value: formatCurrency(totalExpenses), color: [220, 53, 69] },
            { label: "This Month", value: formatCurrency(thisMonth), color: [255, 193, 7] },
            { label: "Last Month", value: formatCurrency(lastMonth), color: [108, 117, 125] },
            { label: "Monthly Change", value: `${monthlyChange.toFixed(1)}%`, color: monthlyChange >= 0 ? [220, 53, 69] : [40, 167, 69] }
        ]);

        // Add expenses table
        pdf.addSectionHeader("Expense Details");
        if (expenses.length > 0) {
            const expensesData = expenses.map((expense, index) => ({
                sr: index + 1,
                description: expense.description,
                category: expense.category || "Other",
                amount: formatCurrency(Number(expense.amount)),
                date: formatDateTime(expense.expense_date || expense.created_at),
                notes: expense.notes || "—"
            }));

            pdf.addTable(expensesData, [
                { header: "Sr.", dataKey: "sr", width: 15, align: "center" },
                { header: "Description", dataKey: "description", width: 60 },
                { header: "Category", dataKey: "category", width: 30 },
                { header: "Amount", dataKey: "amount", width: 30, align: "right" },
                { header: "Date", dataKey: "date", width: 55 }
            ]);
        } else {
            pdf.addText("No expenses recorded.", { color: [120, 120, 120] });
        }

        // Add category breakdown
        if (expenses.length > 0) {
            pdf.addSectionHeader("Category Breakdown");
            const categoryTotals = expenses.reduce((acc, expense) => {
                const category = expense.category || "Other";
                acc[category] = (acc[category] || 0) + Number(expense.amount);
                return acc;
            }, {} as Record<string, number>);

            const categoryData = Object.entries(categoryTotals).map(([category, amount], index) => ({
                sr: index + 1,
                category,
                amount: formatCurrency(Number(amount)),
                percentage: `${((Number(amount) / totalExpenses) * 100).toFixed(1)}%`
            }));

            pdf.addTable(categoryData, [
                { header: "Sr.", dataKey: "sr", width: 15, align: "center" },
                { header: "Category", dataKey: "category", width: 60 },
                { header: "Amount", dataKey: "amount", width: 40, align: "right" },
                { header: "Percentage", dataKey: "percentage", width: 25, align: "center" }
            ]);
        }

        // Save PDF
        pdf.save(`Expenses-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    }

    return (
        <div className="min-h-screen">
            <Header/>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <PageHeader
                    title="Expenses"
                    description="Track and manage your business expenses."
                    action={{
                        label: "Add Expense",
                        onClick: () => setIsDialogOpen(true)
                    }}
                />
                <Button onClick={genExpensesPDF} className="mt-4 text-white">
                    <Download className="mr-2 h-4 w-4"/>
                    Generate Report
                </Button>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.3}}
                    >
                        <StatCard title={"Total Expenses"} value={conversionUtil.toRupees(totalExpenses)} icon={DollarSign}/>
                    </motion.div>

                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.3, delay: 0.1}}
                    >
                        <StatCard title={"This Month"} value={conversionUtil.toRupees(thisMonth)} icon={Calendar}/>
                    </motion.div>
                </div>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-4 mt-8 mb-6">
                    <div className="relative flex-1">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                        <Input
                            placeholder="Search expenses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <Filter className="h-4 w-4 mr-2"/>
                                <SelectValue placeholder="Filter by category"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="INGREDIENTS">Ingredients</SelectItem>
                                <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                                <SelectItem value="TRANSPORTATION">Transportation</SelectItem>
                                <SelectItem value="STAFF">Staff</SelectItem>
                                <SelectItem value="MARKETING">Marketing</SelectItem>
                                <SelectItem value="UTILITIES">Utilities</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm('')
                                setCategoryFilter('all')
                                setDateRange({from: '', to: ''})
                            }}
                            className="whitespace-nowrap"
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div>

                {/* Expenses Table */}
                <div className="rounded-lg border border-border bg-card overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[100px]">Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="hidden sm:table-cell">Category</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="hidden lg:table-cell">Note</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredExpenses.map((expense, index) => (
                                <motion.tr
                                    key={expense.id}
                                    initial={{opacity: 0, y: 20}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{duration: 0.3, delay: index * 0.1}}
                                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                                >
                                    <TableCell
                                        className="font-medium"
                                        onClick={() => {
                                            setSelectedExpense(expense)
                                            setDrawerOpen(true)
                                        }}
                                    >
                                        {formatDate(expense.expense_date || expense.created_at)}
                                        <div className="md:hidden mt-1">
                                            <Badge
                                                className={categoryColors[expense.category || 'OTHER'] || 'bg-gray-100 text-gray-800'}>
                                                {(expense.category || 'Other').replace('_', ' ')}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell
                                        onClick={() => {
                                            setSelectedExpense(expense)
                                            setDrawerOpen(true)
                                        }}
                                    >
                                        {expense.description}
                                    </TableCell>
                                    <TableCell
                                        className="hidden sm:table-cell"
                                        onClick={() => {
                                            setSelectedExpense(expense)
                                            setDrawerOpen(true)
                                        }}
                                    >
                                        <Badge
                                            className={categoryColors[expense.category || 'OTHER'] || 'bg-gray-100 text-gray-800'}>
                                            {(expense.category || 'Other').replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell
                                        className="text-right"
                                        onClick={() => {
                                            setSelectedExpense(expense)
                                            setDrawerOpen(true)
                                        }}
                                    >
                                        ₹{expense.amount.toLocaleString()}
                                    </TableCell>
                                    <TableCell
                                        className="hidden lg:table-cell"
                                        onClick={() => {
                                            setSelectedExpense(expense)
                                            setDrawerOpen(true)
                                        }}
                                    >
                                        {expense.notes || '-'}
                                    </TableCell>
                                    <TableCell className="flex items-center space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                openEditDialog(expense)
                                            }}
                                        >
                                            <Edit className="h-4 w-4"/>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                openDeleteConfirm(expense)
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {filteredExpenses.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <motion.div
                            initial={{opacity: 0, scale: 0.9}}
                            animate={{opacity: 1, scale: 1}}
                            transition={{duration: 0.3}}
                        >
                            <DollarSign className="h-24 w-24 mx-auto text-gray-300 mb-4"/>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
                            <p className="text-gray-500 mb-6">
                                {searchTerm || categoryFilter !== 'all'
                                    ? 'Try adjusting your search or filters'
                                    : 'Get started by adding your first expense'}
                            </p>

                            <Button onClick={() => setIsDialogOpen(true)} className="bg-orange-500 hover:bg-orange-600">
                                <Plus className="h-4 w-4 mr-2"/>
                                Add Expense
                            </Button>
                        </motion.div>
                    </div>
                )}

                {/* Details Drawer */}
                {selectedExpense && (
                    <Drawer open={drawerOpen} onOpenChange={(open) => {
                        setDrawerOpen(open)
                        if (!open) setSelectedExpense(null)
                    }}>
                        <DrawerContent>
                            <DrawerHeader>
                                <DrawerTitle>Expense Details</DrawerTitle>
                                <DrawerDescription>
                                    View complete expense information
                                </DrawerDescription>
                            </DrawerHeader>
                            <div className="p-4">
                                <div className="grid gap-4">
                                    <div>
                                        <h3 className="font-semibold">{selectedExpense.description}</h3>
                                        <Badge
                                            className={categoryColors[selectedExpense.category || 'OTHER'] || 'bg-gray-100 text-gray-800'}>
                                            {(selectedExpense.category || 'Other').replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4 mr-2"/>
                                            {formatDate(selectedExpense.expense_date || selectedExpense.created_at)}
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <DollarSign className="h-4 w-4 mr-2"/>
                                            ₹{selectedExpense.amount.toLocaleString()}
                                        </div>
                                    </div>
                                    {selectedExpense.description && (
                                        <div>
                                            <h4 className="text-sm font-medium">Description</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedExpense.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </DrawerContent>
                    </Drawer>
                )}

                {/* Add Expense Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Expense</DialogTitle>
                            <DialogDescription>
                                Record a new business expense.
                            </DialogDescription>
                        </DialogHeader>
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount *</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select value={formData.category}
                                            onValueChange={(value) => setFormData({...formData, category: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INGREDIENTS">Ingredients</SelectItem>
                                            <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                                            <SelectItem value="TRANSPORTATION">Transportation</SelectItem>
                                            <SelectItem value="STAFF">Staff</SelectItem>
                                            <SelectItem value="MARKETING">Marketing</SelectItem>
                                            <SelectItem value="UTILITIES">Utilities</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
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
                                    placeholder="Additional details about this expense..."
                                />
                            </div>

                            <div className="flex space-x-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}
                                        className="flex-1">
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600">
                                    Add Expense
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Expense Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Expense</DialogTitle>
                            <DialogDescription>
                                Update the expense information.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Description *</Label>
                                <Input
                                    id="edit-description"
                                    value={editFormData.description}
                                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-amount">Amount *</Label>
                                    <Input
                                        id="edit-amount"
                                        type="number"
                                        step="0.01"
                                        value={editFormData.amount}
                                        onChange={(e) => setEditFormData({...editFormData, amount: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-category">Category *</Label>
                                    <Select value={editFormData.category}
                                            onValueChange={(value) => setEditFormData({...editFormData, category: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INGREDIENTS">Ingredients</SelectItem>
                                            <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                                            <SelectItem value="TRANSPORTATION">Transportation</SelectItem>
                                            <SelectItem value="STAFF">Staff</SelectItem>
                                            <SelectItem value="MARKETING">Marketing</SelectItem>
                                            <SelectItem value="UTILITIES">Utilities</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-expense_date">Date *</Label>
                                <Input
                                    id="edit-expense_date"
                                    type="date"
                                    value={editFormData.expense_date}
                                    onChange={(e) => setEditFormData({...editFormData, expense_date: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-notes">Notes</Label>
                                <Textarea
                                    id="edit-notes"
                                    value={editFormData.notes}
                                    onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                                    placeholder="Additional details about this expense..."
                                />
                            </div>

                            <div className="flex space-x-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}
                                        className="flex-1">
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600">
                                    Update Expense
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Delete Expense</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this expense? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        {expenseToDelete && (
                            <div className="py-4">
                                <div className="bg-foreground/10 p-4 rounded-lg">
                                    <h4 className="font-medium">{expenseToDelete.description}</h4>
                                    <div className="text-sm text-muted-foreground mt-2">
                                        <p>Amount: ₹{expenseToDelete.amount.toLocaleString()}</p>
                                        <p>Category: {expenseToDelete.category || 'Other'}</p>
                                        <p>Date: {formatDate(expenseToDelete.expense_date || expenseToDelete.created_at)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setDeleteConfirmOpen(false)}
                                    className="flex-1">
                                Cancel
                            </Button>
                            <Button type="button" onClick={handleDeleteExpense}
                                    className="flex-1 bg-red-500 hover:bg-red-600">
                                Delete Expense
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}