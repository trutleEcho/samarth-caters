'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import Header from '@/components/layout/header'
import PageHeader from '@/components/ui/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency, formatDate } from '@/lib/format'

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

        setFilteredExpenses(filtered)
    }, [expenses, searchTerm, categoryFilter])

    const fetchExpenses = async () => {
        try {
            const response = await fetch('/api/expenses')
            if (response.ok) {
                const data = await response.json()
                setExpenses(data)
            }
        } catch (error) {
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
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
        } catch (error) {
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
                <Header />
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

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <PageHeader
                    title="Expenses"
                    description="Track and manage your business expenses."
                    action={{
                        label: "Add Expense",
                        onClick: () => setIsDialogOpen(true)
                    }}
                />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">
                                            {formatCurrency(totalExpenses)}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-full bg-red-50">
                                        <DollarSign className="h-6 w-6 text-red-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">This Month</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">
                                            {formatCurrency(thisMonth)}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-full bg-orange-50">
                                        <Calendar className="h-6 w-6 text-orange-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Monthly Change</p>
                                        <p className={`text-2xl font-bold mt-2 ${monthlyChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {monthlyChange >= 0 ? '+' : ''}{monthlyChange.toFixed(1)}%
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-full ${monthlyChange >= 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                                        {monthlyChange >= 0 ? (
                                            <TrendingUp className="h-6 w-6 text-red-500" />
                                        ) : (
                                            <TrendingDown className="h-6 w-6 text-green-500" />
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8 mb-6">
                    <div className="relative flex-1">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search expenses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter by category" />
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
                </div>

                {/* Expenses List */}
                <div className="space-y-4">
                    {filteredExpenses.map((expense, index) => (
                        <motion.div
                            key={expense.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Card className="hover:shadow-md transition-shadow duration-200">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">{expense.title}</h3>
                                                <Badge className={categoryColors[expense.category] || 'bg-gray-100 text-gray-800'}>
                                                    {expense.category.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            {expense.description && (
                                                <p className="text-gray-600 mb-2">{expense.description}</p>
                                            )}
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {formatDate(expense.date)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-red-600">
                                                -{formatCurrency(expense.amount)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {filteredExpenses.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <DollarSign className="h-24 w-24 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
                            <p className="text-gray-500 mb-6">
                                {searchTerm || categoryFilter !== 'all'
                                    ? 'Try adjusting your search or filters'
                                    : 'Get started by adding your first expense'}
                            </p>
                            <Button onClick={() => setIsDialogOpen(true)} className="bg-orange-500 hover:bg-orange-600">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Expense
                            </Button>
                        </motion.div>
                    </div>
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
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
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
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Additional details about this expense..."
                                />
                            </div>

                            <div className="flex space-x-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
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