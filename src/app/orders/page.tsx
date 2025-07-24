'use client'

import {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import {Plus, Search, Filter, Calendar} from 'lucide-react'
import Header from '@/components/layout/header'
import PageHeader from '@/components/ui/page-header'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {toast} from "sonner";
import {OrderData} from "@/types/dto/order-data";
import {CreateOrderRequest} from "@/types/request/create-order-request";
import OrderDrawer from '@/components/sections/order/OrderDrawer'
import AddOrderDialog from '@/components/sections/order/AddOrderDialog'
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from '@/components/ui/table'
import { useTranslations } from 'next-intl';

const statusColors: { [key: string]: string } = {
    'BOOKED': 'bg-blue-100 text-blue-800',
    'MENU_FINALIZED': 'bg-green-100 text-green-800',
    'IN_PROGRESS': 'bg-orange-100 text-orange-800',
    'COMPLETED': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-red-100 text-red-800'
}

export default function OrdersPage() {
    const t = useTranslations('orders');
    const [orders, setOrders] = useState<OrderData[]>([])
    const [filteredOrders, setFilteredOrders] = useState<OrderData[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null)

    useEffect(() => {
        fetchOrders()
    }, [])

    useEffect(() => {
        let filtered = orders

        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.metadata.event_type.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.order.status === statusFilter)
        }

        setFilteredOrders(filtered)
    }, [orders, searchTerm, statusFilter])

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/orders')
            if (response.ok) {
                const data = await response.json()
                setOrders(data)
                if (data.length === 0) {
                    toast.info("No orders found")
                }
            }
            if (response.status === 500) {
                toast.error(`Failed to fetch orders: ${response.statusText}`)
            }
        } catch (error) {
            toast.error(`Error fetching orders`)
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleOrderCardClick = (order: OrderData) => {
        setSelectedOrder(order)
        setDrawerOpen(true)
    }
    const handleDrawerSave = (updated: Partial<OrderData>) => {
        if (!selectedOrder) return
        // For now, update in state (replace with API call later)
        setOrders((prev) => prev.map(o => o.order.id === selectedOrder.order.id ? { ...o, ...updated, customer: { ...o.customer, ...updated.customer }, metadata: { ...o.metadata, ...updated.metadata }, order: { ...o.order, ...updated.order } } : o))
        setDrawerOpen(false)
        setSelectedOrder(null)
        // Optionally, call fetchOrders() to refresh from server
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
                    refresh={fetchOrders}
                    action={{
                        label: t('newOrder'),
                        onClick: () => setIsDialogOpen(true)
                    }}
                />

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8 mb-6">
                    <div className="relative flex-1">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                        <Input
                            placeholder={t('searchOrders')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <Filter className="h-4 w-4 mr-2"/>
                            <SelectValue placeholder={t('filterByStatus')}/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('status.all')}</SelectItem>
                            <SelectItem value="BOOKED">{t('status.booked')}</SelectItem>
                            <SelectItem value="MENU_FINALIZED">{t('status.menuFinalized')}</SelectItem>
                            <SelectItem value="IN_PROGRESS">{t('status.inProgress')}</SelectItem>
                            <SelectItem value="COMPLETED">{t('status.completed')}</SelectItem>
                            <SelectItem value="CANCELLED">{t('status.cancelled')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Orders Data Table */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('table.date')}</TableHead>
                            <TableHead>{t('table.customerName')}</TableHead>
                            <TableHead>{t('table.address')}</TableHead>
                            <TableHead>{t('table.customerPhone')}</TableHead>
                            <TableHead>{t('table.eventType')}</TableHead>
                            <TableHead>{t('table.eventTime')}</TableHead>
                            <TableHead>{t('table.venue')}</TableHead>
                            <TableHead>{t('table.payments')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrders.map((order) => {
                            const totalPaid = order.payments?.reduce((sum, p) => sum + p.amount, 0) || 0
                            return (
                                <TableRow
                                    key={order.order.id}
                                    onClick={() => handleOrderCardClick(order)}
                                    className="cursor-pointer hover:bg-accent"
                                >
                                    <TableCell>{order.metadata.event_date ? new Date(order.metadata.event_date).toLocaleDateString() : '-'}</TableCell>
                                    <TableCell>{order.customer.name}</TableCell>
                                    <TableCell>-</TableCell>{/* Address placeholder */}
                                    <TableCell>{order.customer.phone}</TableCell>
                                    <TableCell>{order.metadata.event_type}</TableCell>
                                    <TableCell>-</TableCell>{/* Event time placeholder */}
                                    <TableCell>{order.metadata.venue}</TableCell>
                                    <TableCell>{totalPaid > 0 ? `₹${totalPaid}` : '-'}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>

                {filteredOrders.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <motion.div
                            initial={{opacity: 0, scale: 0.9}}
                            animate={{opacity: 1, scale: 1}}
                            transition={{duration: 0.3}}
                        >
                            <Calendar className="h-24 w-24 mx-auto text-accent-foreground mb-4"/>
                            <h3 className="text-lg font-medium text-foreground mb-2">{t('noOrders.title')}</h3>
                            <p className="text-accent-foreground/50 mb-6">
                                {searchTerm || statusFilter !== 'all'
                                    ? t('noOrders.description')
                                    : t('noOrders.emptyDescription')}
                            </p>
                            <Button onClick={() => setIsDialogOpen(true)}
                                    className="bg-primary hover:bg-primary/80 text-white">
                                <Plus className="h-4 w-4 mr-2"/>
                                {t('newOrder')}
                            </Button>
                        </motion.div>
                    </div>
                )}

                {/* Add Order Dialog */}
                <AddOrderDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    onSuccess={fetchOrders}
                />
                {/* Order Drawer */}
                <OrderDrawer
                    open={drawerOpen}
                    onOpenChange={(open) => {
                        setDrawerOpen(open)
                        if (!open) setSelectedOrder(null)
                    }}
                    order={selectedOrder}
                    onSave={handleDrawerSave}
                />
            </div>
        </div>
    )
}