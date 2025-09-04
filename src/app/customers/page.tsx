'use client'

import {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import {Plus, Search, Users} from 'lucide-react'
import Header from '@/components/layout/header'
import PageHeader from '@/components/ui/page-header'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {toast} from "sonner";
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from '@/components/ui/table'
import { useTranslations } from 'next-intl';
import {Customer} from "@/data/entities/customer";
import AddCustomerDialog from '@/components/sections/customer/AddCustomerDialog'
import CustomerDrawer from '@/components/sections/customer/CustomerDrawer'
import { api } from "@/lib/api";

export default function CustomersPage() {
    const t = useTranslations('customers');
    const [customers, setCustomers] = useState<Customer[]>([])
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [drawerOpen, setDrawerOpen] = useState(false)

    useEffect(() => {
        fetchCustomers()
    }, [])

    useEffect(() => {
        // Filter customers based on search term
        const filtered = customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone_number.includes(searchTerm) ||
            (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (customer.address && customer.address.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        setFilteredCustomers(filtered)
    }, [customers, searchTerm])

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/api/customers')
            if (response.ok) {
                const data = await response.json()
                // Convert string dates to Date objects
                const customersWithDates = data.map((customer: any) => ({
                    ...customer,
                    created_at: new Date(customer.created_at)
                }))
                setCustomers(customersWithDates)
                setFilteredCustomers(customersWithDates)
                
                if (data.length === 0) {
                    toast.info(t('noCustomers.message'))
                }
            } else if (response.status === 401) {
                toast.error('Please login again')
            } else {
                toast.error(t('fetchError'))
            }
        } catch (error) {
            toast.error(t('fetchError'))
            console.error('Error fetching customers:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCustomerClick = (customer: Customer) => {
        setSelectedCustomer(customer)
        setDrawerOpen(true)
    }

    const handleDrawerSave = () => {
        if (!selectedCustomer) return
        // For now, update in state (replace with API call later)
        setDrawerOpen(false)
        setSelectedCustomer(null)
        fetchCustomers()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header/>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-48"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Header/>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <PageHeader
                    title={t('title')}
                    description={t('description')}
                    refresh={fetchCustomers}
                    action={{
                        label: t('newCustomer'),
                        onClick: () => setIsDialogOpen(true)
                    }}
                />

                {/* Search */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8 mb-6">
                    <div className="relative flex-1">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                        <Input
                            placeholder={t('searchCustomers')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Customers Data Table */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('table.name')}</TableHead>
                            <TableHead>{t('table.phone')}</TableHead>
                            <TableHead>{t('table.email')}</TableHead>
                            <TableHead>{t('table.address')}</TableHead>
                            <TableHead>{t('table.createdAt')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCustomers.map((customer) => (
                            <TableRow
                                key={customer.id}
                                onClick={() => handleCustomerClick(customer)}
                                className="cursor-pointer hover:bg-accent"
                            >
                                <TableCell className="font-medium">{customer.name}</TableCell>
                                <TableCell>{customer.phone_number}</TableCell>
                                <TableCell>{customer.email || '-'}</TableCell>
                                <TableCell>{customer.address || '-'}</TableCell>
                                <TableCell>{customer.created_at.toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {filteredCustomers.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <motion.div
                            initial={{opacity: 0, scale: 0.9}}
                            animate={{opacity: 1, scale: 1}}
                            transition={{duration: 0.3}}
                        >
                            <Users className="h-24 w-24 mx-auto text-accent-foreground mb-4"/>
                            <h3 className="text-lg font-medium text-foreground mb-2">{t('noCustomers.title')}</h3>
                            <p className="text-accent-foreground/50 mb-6">
                                {searchTerm
                                    ? t('noCustomers.description')
                                    : t('noCustomers.emptyDescription')}
                            </p>
                            <Button onClick={() => setIsDialogOpen(true)}
                                    className="bg-primary hover:bg-primary/80 text-white">
                                <Plus className="h-4 w-4 mr-2"/>
                                {t('newCustomer')}
                            </Button>
                        </motion.div>
                    </div>
                )}

                {/* Add Customer Dialog */}
                <AddCustomerDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    onSuccess={fetchCustomers}
                />
                {/* Customer Drawer */}
                <CustomerDrawer
                    open={drawerOpen}
                    onOpenChange={(open) => {
                        setDrawerOpen(open)
                        if (!open) setSelectedCustomer(null)
                    }}
                    customer={selectedCustomer}
                    onSave={handleDrawerSave}
                />
            </div>
        </div>
    )
} 