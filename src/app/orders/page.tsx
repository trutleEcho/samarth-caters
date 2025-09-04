'use client'

import {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import {Plus, Search, Filter, Calendar, Loader2} from 'lucide-react'
import Header from '@/components/layout/header'
import PageHeader from '@/components/ui/page-header'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {toast} from "sonner";
import OrderDrawer from '@/components/sections/order/OrderDrawer'
import AddOrderDialog from '@/components/sections/order/AddOrderDialog'
import {Badge} from '@/components/ui/badge'
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from '@/components/ui/table'
import {useTranslations} from 'next-intl';
import {ExpandedOrder} from "@/data/dto/expanded-order";
import {ErrorBoundary} from "@/components/error-boundary";
import { api } from "@/lib/api";

export default function OrdersPage() {
    const t = useTranslations('orders');
    const [orders, setOrders] = useState<ExpandedOrder[]>([])
    const [filteredOrders, setFilteredOrders] = useState<ExpandedOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<ExpandedOrder | null>(null)

    useEffect(() => {
        fetchOrders()
    }, [])

    useEffect(() => {
        let filtered = orders
        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customer?.phone_number?.includes(searchTerm) ||
                order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.order.status === statusFilter)
        }
        setFilteredOrders(filtered)
    }, [orders, searchTerm, statusFilter])

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const response = await api.get('/api/orders')
            if (response.ok) {
                const data = await response.json()
                setOrders(data)
                setFilteredOrders(data)
                if (data.length === 0) {
                    toast.info("No orders found")
                }
            } else if (response.status === 401) {
                toast.error('Please login again')
                // Redirect to login or handle auth error
            } else if (response.status === 500) {
                toast.error(`${t('errors.fetchFailed')}: ${response.statusText}`)
            }
        } catch (error) {
            toast.error(t('errors.general'))
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleOrderCardClick = (order: ExpandedOrder) => {
        setSelectedOrder(order)
        setDrawerOpen(true)
    }

    const handleDrawerSave = () => {
        if (!selectedOrder) return
        setDrawerOpen(false)
        setSelectedOrder(null)
        fetchOrders()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header/>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col items-center justify-center h-[60vh]">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4"/>
                        <p className="text-lg text-muted-foreground">{t('loading')}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Header/>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ErrorBoundary>
                    <PageHeader
                        title={t('title')}
                        description={t('description')}
                        refresh={fetchOrders}
                        action={{
                            label: t('newOrder'),
                            onClick: () => setIsDialogOpen(true)
                        }}
                    />
                </ErrorBoundary>

                <div className="flex flex-col sm:flex-row gap-4 mt-8 mb-6">
                    <div className="relative flex-1">
                        <Search
                            className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"/>
                        <Input
                            placeholder={t('searchOrders')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-background border-border"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] bg-background border-border">
                            <Filter className="h-4 w-4 mr-2 text-muted-foreground"/>
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

                <div className="rounded-lg border border-border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[100px]">{t('table.date')}</TableHead>
                                <TableHead>{t('table.customerName')}</TableHead>
                                <TableHead className="hidden md:table-cell">{t('table.address')}</TableHead>
                                <TableHead>{t('table.customerPhone')}</TableHead>
                                <TableHead className="hidden lg:table-cell">{t('table.eventType')}</TableHead>
                                <TableHead className="hidden lg:table-cell">{t('table.eventTime')}</TableHead>
                                <TableHead className="hidden xl:table-cell">{t('table.venue')}</TableHead>
                                <TableHead className="text-right">{t('table.payments')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.map((order) => {
                                const totalPaid = order.payments?.reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0) || 0
                                return (
                                    <TableRow
                                        key={order.order.id}
                                        onClick={() => handleOrderCardClick(order)}
                                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                                    >
                                        <TableCell className="font-medium">
                                            {order.events?.[0]?.date ? new Date(order.events[0].date).toLocaleDateString() : '-'}
                                            <div className="md:hidden mt-1">
                                                <Badge>
                                                    {t(`status.${order.order.status.toLowerCase()}`)}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>{order.customer?.name}</TableCell>
                                        <TableCell
                                            className="hidden md:table-cell">{order.customer?.address || '-'}</TableCell>
                                        <TableCell>{order.customer?.phone_number || '-'}</TableCell>
                                        <TableCell
                                            className="hidden lg:table-cell">{order.events?.[0]?.name || '-'}</TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            {order.events?.[0]?.date ? new Date(order.events[0].date).toLocaleTimeString() : '-'}
                                        </TableCell>
                                        <TableCell
                                            className="hidden xl:table-cell">{order.events?.[0]?.venue || '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <span className="font-medium">
                                                {totalPaid > 0 ? `₹${totalPaid.toLocaleString()}` : '-'}
                                            </span>
                                        </TableCell>
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
                                className="max-w-sm mx-auto"
                            >
                                <Calendar className="h-24 w-24 mx-auto text-muted-foreground mb-4"/>
                                <h3 className="text-lg font-medium text-foreground mb-2">{t('noOrders.title')}</h3>
                                <p className="text-muted-foreground mb-6">
                                    {searchTerm || statusFilter !== 'all'
                                        ? t('noOrders.description')
                                        : t('noOrders.emptyDescription')}
                                </p>
                                <Button
                                    onClick={() => setIsDialogOpen(true)}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                    <Plus className="h-4 w-4 mr-2"/>
                                    {t('newOrder')}
                                </Button>
                            </motion.div>
                        </div>
                    )}
                </div>

                <ErrorBoundary>
                    <AddOrderDialog
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        onSuccess={fetchOrders}
                    />
                </ErrorBoundary>

                <ErrorBoundary>
                    {selectedOrder && (
                        <OrderDrawer
                            open={drawerOpen}
                            onOpenChange={(open) => {
                                setDrawerOpen(open)
                                if (!open) setSelectedOrder(null)
                            }}
                            order={selectedOrder}
                            onSaveAction={handleDrawerSave}
                        />)}
                </ErrorBoundary>
            </div>
        </div>
    )
}