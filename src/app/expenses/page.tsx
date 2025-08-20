'use client'

import {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import {Plus, Search, Filter, Calendar, DollarSign, TrendingUp, TrendingDown, Download} from 'lucide-react'
import Header from '@/components/layout/header'
import PageHeader from '@/components/ui/page-header'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
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
import {formatCurrency, formatDate} from '@/lib/format'
import {toast} from "sonner";
import StatCard from "@/components/ui/stat-card";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Expense {
    id: string
    title: string
    amount: number
    category: string
    description?: string
    date: string
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
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    })

    useEffect(() => {
        fetchExpenses()
    }, [])

    useEffect(() => {
        let filtered = expenses

        if (searchTerm) {
            filtered = filtered.filter(expense =>
                expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                expense.description?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(expense => expense.category === categoryFilter)
        }

        if (dateRange.from && dateRange.to) {
            filtered = filtered.filter(expense => {
                const expenseDate = new Date(expense.date)
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
            const response = await fetch('/api/expenses')
            if (response.ok) {
                const data = await response.json()
                setExpenses(data)
                setFilteredExpenses(data)
                if (data.length === 0) {
                    toast.info('No expenses found')
                }
            }
            if (response.status === 500) {
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
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                toast.success('Expense added successfully')
                setIsDialogOpen(false)
                setFormData({
                    title: '',
                    amount: '',
                    category: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0]
                })
                fetchExpenses()
            }
            if (response.status === 500) {
                toast.error(`Failed to create expense: ${response.statusText}`)
            }
        } catch (error) {
            toast.error('Failed to create expense')
            console.error('Error creating expense:', error)
        }
    }

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const thisMonth = expenses.filter(expense =>
        new Date(expense.date).getMonth() === new Date().getMonth() &&
        new Date(expense.date).getFullYear() === new Date().getFullYear()
    ).reduce((sum, expense) => sum + expense.amount, 0)

    const lastMonth = expenses.filter(expense => {
        const date = new Date(expense.date)
        const lastMonthDate = new Date()
        lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
        return date.getMonth() === lastMonthDate.getMonth() &&
            date.getFullYear() === lastMonthDate.getFullYear()
    }).reduce((sum, expense) => sum + expense.amount, 0)

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
        doc.text("Expenses Report", 60, 26)

        doc.setFontSize(10)
        doc.setTextColor(120)
        doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 60, 32)

        doc.setDrawColor(180)
        doc.setLineWidth(0.5)
        doc.line(10, 38, 200, 38)

        let y = 48
        doc.setTextColor(0)

        // ---------------- EXPENSES TABLE ----------------
        if (expenses.length > 0) {
            autoTable(doc, {
                startY: y,
                head: [["Sr.No", "Title", "Category", "Amount (INR)", "Date"]],
                body: expenses.map((exp, i) => [
                    i + 1,
                    exp.title,
                    exp.category,
                    exp.amount.toLocaleString("en-IN"),
                    formatDate(exp.date),
                ]),
                headStyles: { fillColor: [192, 57, 43], textColor: 255, halign: "center" },
                styles: { fontSize: 10, cellPadding: 4 },
            })
            y = (doc.lastAutoTable?.finalY ?? y) + 10
        } else {
            doc.setFont("helvetica", "normal")
            doc.setFontSize(11)
            doc.text("No expenses recorded.", 15, y)
            y += 15
        }

        // ---------------- SUMMARY ----------------
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(13)
        doc.text("Summary", 10, y)

        y += 8
        doc.setFont("helvetica", "normal")
        doc.setFontSize(11)
        doc.text(`Total Expenses: INR ${totalExpenses.toLocaleString("en-IN")}`, 15, y)

        // ---------------- FOOTER ----------------
        doc.setFontSize(9)
        doc.setTextColor(150)
        doc.text("Confidential - Internal Use Only", 10, 290)
        doc.text("© 2025 Samarth Caters", 160, 290)

        // Save PDF
        doc.save(`Expenses-Report-${new Date().toISOString().split("T")[0]}.pdf`)
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
                        <StatCard title={"Total Expenses"} value={formatCurrency(totalExpenses)} icon={DollarSign}/>
                    </motion.div>

                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.3, delay: 0.1}}
                    >
                        <StatCard title={"This Month"} value={formatCurrency(thisMonth)} icon={Calendar}/>
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
                        <div className="flex gap-2">
                            <div className="relative">
                                <Calendar
                                    className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                                <Input
                                    type="date"
                                    value={dateRange.from}
                                    onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                                    className="pl-10 w-[150px]"
                                />
                            </div>
                            <div className="relative">
                                <Calendar
                                    className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                                <Input
                                    type="date"
                                    value={dateRange.to}
                                    onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                                    className="pl-10 w-[150px]"
                                />
                            </div>
                        </div>
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
                                <TableHead>Title</TableHead>
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
                                        {formatDate(expense.date)}
                                        <div className="md:hidden mt-1">
                                            <Badge
                                                className={categoryColors[expense.category] || 'bg-gray-100 text-gray-800'}>
                                                {expense.category.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell
                                        onClick={() => {
                                            setSelectedExpense(expense)
                                            setDrawerOpen(true)
                                        }}
                                    >
                                        {expense.title}
                                    </TableCell>
                                    <TableCell
                                        className="hidden sm:table-cell"
                                        onClick={() => {
                                            setSelectedExpense(expense)
                                            setDrawerOpen(true)
                                        }}
                                    >
                                        <Badge
                                            className={categoryColors[expense.category] || 'bg-gray-100 text-gray-800'}>
                                            {expense.category.replace('_', ' ')}
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
                                        {expense.description || '-'}
                                    </TableCell>
                                    <TableCell className="flex items-center space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                // TODO: Implement edit functionality
                                            }}
                                        >
                                            <Edit className="h-4 w-4"/>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                // TODO: Implement delete functionality
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
                                        <h3 className="font-semibold">{selectedExpense.title}</h3>
                                        <Badge
                                            className={categoryColors[selectedExpense.category] || 'bg-gray-100 text-gray-800'}>
                                            {selectedExpense.category.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4 mr-2"/>
                                            {formatDate(selectedExpense.date)}
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
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
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
            </div>
        </div>
    )
}