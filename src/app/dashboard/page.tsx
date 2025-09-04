'use client'

import {useEffect, useState} from 'react'
import {motion} from 'framer-motion'
import {Calendar, Clock, DollarSign, Download, ShoppingCart, TrendingUp, Users,} from 'lucide-react'
import Header from '@/components/layout/header'
import PageHeader from '@/components/ui/page-header'
import StatCard from '@/components/ui/stat-card'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {formatCurrency, formatDate, formatDateTime} from '@/lib/format'
import {useTranslations} from 'next-intl';
import {Expenses} from "@/data/entities/expenses";
import {ExpandedOrder} from "@/data/dto/expanded-order";
import {EventStatus} from "@/data/enums/event-status";
import Link from "next/link";
import { PDFGenerator } from "@/lib/pdf-utils"
import {Button} from "@/components/ui/button";
import { api } from "@/lib/api";

export default function DashboardPage() {
    const t = useTranslations('dashboard');
    const [orders, setOrders] = useState<ExpandedOrder[]>([])
    const [expenses, setExpenses] = useState<Expenses[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersRes, expensesRes] = await Promise.all([
                    api.get('/api/orders'),
                    api.get('/api/expenses')
                ])

                if (ordersRes.ok && expensesRes.ok) {
                    const ordersData = await ordersRes.json()
                    const expensesData = await expensesRes.json()
                    setOrders(ordersData)
                    setExpenses(expensesData)
                } else {
                    console.error('Failed to fetch data:', ordersRes.status, expensesRes.status)
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const stats = {
        totalOrders: orders.length,
        activeOrders: orders.filter(order =>
            order.events.find(event => event.status === EventStatus.Processing)
        ).length,
        totalRevenue: orders.reduce((sum, order) => sum + order.order.total_amount, 0),
        monthlyExpenses: expenses
            .filter(expense => new Date(expense.expense_date ?? new Date()).getMonth() === new Date().getMonth())
            .reduce((sum, expense) => sum + expense.amount, 0)
    }

    const upcomingEvents = orders.map(order =>
        order.events.find(event => event.date ? new Date(event.date) > new Date() : false)
    )

    const recentExpenses = expenses.slice(0, 5)

    const statusColors: { [key: string]: string } = {
        'BOOKED': 'bg-blue-100 text-blue-800',
        'MENU_FINALIZED': 'bg-green-100 text-green-800',
        'IN_PROGRESS': 'bg-orange-100 text-orange-800',
        'COMPLETED': 'bg-green-100 text-green-800',
        'CANCELLED': 'bg-red-100 text-red-800'
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header/>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    /**
     * Generate a professional Quick Analytics PDF report
     */
    const generatePdf = () => {
        const pdf = new PDFGenerator();

        // Add professional header
        pdf.addHeader({
            title: "Quick Analytics Report",
            subtitle: "Business Performance Overview",
            showDate: true
        });

        // Add summary section
        pdf.addSectionHeader("Business Summary");
        pdf.addSummaryBox([
            { label: "Total Orders", value: stats.totalOrders, color: [34, 153, 84] },
            { label: "Active Orders", value: stats.activeOrders, color: [255, 193, 7] },
            { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), color: [40, 167, 69] },
            { label: "Monthly Expenses", value: formatCurrency(stats.monthlyExpenses), color: [220, 53, 69] }
        ]);

        // Add upcoming events section
        pdf.addSectionHeader("Upcoming Events");
        if (upcomingEvents.length > 0) {
            const eventsData = upcomingEvents.slice(0, 5).filter(Boolean).map((event, index) => ({
                sr: index + 1,
                name: event?.name || "Unnamed Event",
                date: event?.date ? formatDateTime(event.date) : "TBD",
                venue: event?.venue || "TBD",
                guests: event?.guest_count || "TBD"
            }));

            pdf.addTable(eventsData, [
                { header: "Sr.", dataKey: "sr", width: 15, align: "center" },
                { header: "Event Name", dataKey: "name", width: 60 },
                { header: "Date", dataKey: "date", width: 50 },
                { header: "Venue", dataKey: "venue", width: 40 },
                { header: "Guests", dataKey: "guests", width: 25, align: "center" }
            ]);
        } else {
            pdf.addText("No upcoming events found.", { color: [120, 120, 120] });
        }

        // Add recent expenses section
        pdf.addSectionHeader("Recent Expenses");
        if (recentExpenses.length > 0) {
            const expensesData = recentExpenses.map((expense, index) => ({
                sr: index + 1,
                description: expense.description,
                amount: formatCurrency(expense.amount),
                date: formatDateTime(expense.expense_date || expense.created_at),
                category: expense.category || "Other"
            }));

            pdf.addTable(expensesData, [
                { header: "Sr.", dataKey: "sr", width: 15, align: "center" },
                { header: "Description", dataKey: "description", width: 70 },
                { header: "Amount", dataKey: "amount", width: 30, align: "right" },
                { header: "Date", dataKey: "date", width: 50 },
                { header: "Category", dataKey: "category", width: 25, align: "center" }
            ]);
        } else {
            pdf.addText("No recent expenses found.", { color: [120, 120, 120] });
        }

        // Add performance insights
        pdf.addSectionHeader("Performance Insights");
        const netProfit = stats.totalRevenue - stats.monthlyExpenses;
        const profitMargin = stats.totalRevenue > 0 ? ((netProfit / stats.totalRevenue) * 100).toFixed(1) : 0;
        
        pdf.addText(`Net Profit: ${formatCurrency(netProfit)}`, { bold: true, color: netProfit >= 0 ? [40, 167, 69] : [220, 53, 69] });
        pdf.addText(`Profit Margin: ${profitMargin}%`, { bold: true, color: parseFloat(profitMargin.toString()) >= 0 ? [40, 167, 69] : [220, 53, 69] });
        pdf.addText(`Average Order Value: ${formatCurrency(stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0)}`, { bold: true });

        // Save PDF
        pdf.save(`Quick-Analytics-${new Date().toISOString().split('T')[0]}.pdf`);
    }

    return (
        <div className="min-h-screen bg-background/95">
            <Header/>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between">
                    <PageHeader
                        title={t('title')}
                        description={t('description')}
                    />
                    <Button onClick={generatePdf}>
                        <Download className="h-4 w-4 mr-2"/>
                        Download
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                    <StatCard
                        title={t('stats.totalOrders')}
                        value={stats.totalOrders}
                        icon={ShoppingCart}
                        color="blue"
                    />
                    <StatCard
                        title={t('stats.activeOrders')}
                        value={stats.activeOrders}
                        icon={Clock}
                        color="orange"
                    />
                    <StatCard
                        title={t('stats.totalRevenue')}
                        value={formatCurrency(stats.totalRevenue)}
                        icon={DollarSign}
                        color="green"
                    />
                    <StatCard
                        title={t('stats.monthlyExpenses')}
                        value={formatCurrency(stats.monthlyExpenses)}
                        icon={TrendingUp}
                        color="red"
                    />
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    {/* Upcoming Orders */}
                    <motion.div
                        initial={{opacity: 0, x: -20}}
                        animate={{opacity: 1, x: 0}}
                        transition={{duration: 0.5, delay: 0.2}}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5 text-orange-500"/>
                                    <span>{t('upcomingOrders.title')}</span>
                                </CardTitle>
                                <CardDescription>{t('upcomingOrders.description')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {upcomingEvents.length > 0 ? (
                                    upcomingEvents.map((event, index) => (
                                        event && (
                                            <motion.div
                                                key={event?.id}
                                                initial={{opacity: 0, y: 20}}
                                                animate={{opacity: 1, y: 0}}
                                                transition={{duration: 0.3, delay: index * 0.1}}
                                            >
                                                <Link key={event?.id} href="/orders"
                                                      className="flex items-center justify-between p-4 rounded-lg hover:bg-foreground/10 transition-colors border border-foreground/10">
                                                    <div>
                                                        <h4 className="font-semibold ">{event?.name}</h4>
                                                        <div className="flex items-center space-x-4 mt-1">
                                                            {event?.date && (
                                                                <span
                                                                    className="text-xs text-muted-foreground flex items-center">
                                                    <Calendar className="h-3 w-3 mr-1"/>
                                                                    {formatDate(event?.date)}
                                                  </span>
                                                            )}
                                                            {event?.guest_count && (
                                                                <span
                                                                    className="text-xs text-accent-foreground flex items-center">
                                                    <Users className="h-3 w-3 mr-1"/>
                                                                    {event?.guest_count} {t('upcomingOrders.guests')}
                                                  </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        {event?.status && (
                                                            <Badge
                                                                className={statusColors[event?.status] || 'bg-gray-100'}>
                                                                {event?.status.replace('_', ' ')}
                                                            </Badge>
                                                        )}
                                                        {event?.amount && (
                                                            <p className="text-sm font-medium text-green-700 mt-1">
                                                                {formatCurrency(event?.amount)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        )
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                                        <p>No Upcoming Orders</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Recent Expenses */}
                    <motion.div
                        initial={{opacity: 0, x: 20}}
                        animate={{opacity: 1, x: 0}}
                        transition={{duration: 0.5, delay: 0.3}}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <DollarSign className="h-5 w-5 text-green-500"/>
                                    <span>{t('recentExpenses.title')}</span>
                                </CardTitle>
                                <CardDescription>{t('recentExpenses.description')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {recentExpenses.length > 0 ? (
                                    recentExpenses.map((expense, index) => (
                                        <motion.div
                                            key={expense.id}
                                            initial={{opacity: 0, y: 20}}
                                            animate={{opacity: 1, y: 0}}
                                            transition={{duration: 0.3, delay: index * 0.1}}
                                        >
                                            <Link key={expense?.id} href="/expenses"
                                                  className="flex items-center justify-between  p-4 rounded-lg hover:bg-foreground/10 transition-colors border border-gray-200/10"
                                            >
                                                <div>
                                                    <h4 className="font-semibold ">{expense.id}</h4>
                                                    <p className="text-sm capitalize text-muted-foreground">{expense?.category?.toLowerCase()}</p>
                                                    <span className="text-xs text-muted-foreground">
                                                  {expense?.expense_date ? formatDate(expense?.expense_date) : "--"}
                                                </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-red-600">
                                                        -{formatCurrency(expense.amount)}
                                                    </p>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                                        <p>{t('recentExpenses.noExpenses')}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}