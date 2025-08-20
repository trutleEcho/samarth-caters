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
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import {Button} from "@/components/ui/button";

export default function DashboardPage() {
    const t = useTranslations('dashboard');
    const [orders, setOrders] = useState<ExpandedOrder[]>([])
    const [expenses, setExpenses] = useState<Expenses[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersRes, expensesRes] = await Promise.all([
                    fetch('/api/orders'),
                    fetch('/api/expenses')
                ])

                if (ordersRes.ok && expensesRes.ok) {
                    const ordersData = await ordersRes.json()
                    const expensesData = await expensesRes.json()
                    setOrders(ordersData)
                    setExpenses(expensesData)
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
            .filter(expense => new Date(expense.date).getMonth() === new Date().getMonth())
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
        const doc = new jsPDF("p", "mm", "a4") // portrait, millimeters, A4

        // ---------------- HEADER ----------------
        const logoUrl = "/logo.png" // from public/
        doc.addImage(logoUrl, "PNG", 10, 8, 40, 20)

        // Company name
        doc.setFont("helvetica", "bold")
        doc.setFontSize(20)
        doc.text("Samarth Caters", 55, 20)

        // Report title
        doc.setFont("helvetica", "normal")
        doc.setFontSize(14)
        doc.setTextColor(80)
        doc.text("Quick Analytics Report", 55, 28)

        // Date
        doc.setFontSize(10)
        doc.setTextColor(120)
        doc.text(`Generated on: ${formatDateTime(new Date())}`, 55, 34)

        // Line separator
        doc.setDrawColor(180)
        doc.setLineWidth(0.5)
        doc.line(10, 40, 200, 40)

        let y = 50
        doc.setTextColor(0)

        // ---------------- SUMMARY ----------------
        doc.setFont("helvetica", "bold")
        doc.setFontSize(13)
        doc.text("1. Summary", 10, y)

        y += 10
        doc.setFont("helvetica", "normal")
        doc.setFontSize(11)
        doc.text(`• Total Orders: ${stats.totalOrders}`, 15, y)
        y += 8
        doc.text(`• Active Orders: ${stats.activeOrders}`, 15, y)
        y += 8
        doc.text(`• Total Revenue: INR ${stats.totalRevenue.toLocaleString("en-IN")}`, 15, y)
        y += 8
        doc.text(`• Monthly Expenses: INR ${stats.monthlyExpenses.toLocaleString("en-IN")}`, 15, y)

        // ---------------- UPCOMING EVENTS ----------------
        y += 15
        doc.setFont("helvetica", "bold")
        doc.setFontSize(13)
        doc.text("2. Upcoming Events", 10, y)

        if (upcomingEvents.length > 0) {
            autoTable(doc, {
                startY: y + 5,
                head: [["Sr.No", "Event Name", "Date"]],
                body: upcomingEvents.map((event, i) => [
                    i + 1,
                    event?.name || "—",
                    event?.date ? formatDate(new Date(event.date)) : "—",
                ]),
                headStyles: { fillColor: [60, 141, 188], textColor: 255, halign: "center" },
                styles: { fontSize: 10, cellPadding: 4 },
            })
            y = (doc.lastAutoTable?.finalY ?? 10) + 10
        } else {
            doc.setFont("helvetica", "normal")
            doc.setFontSize(11)
            doc.text("No upcoming events.", 15, y + 8)
            y += 15
        }

        // ---------------- RECENT EXPENSES ----------------
        doc.setFont("helvetica", "bold")
        doc.setFontSize(13)
        doc.text("3. Recent Expenses", 10, y)

        if (recentExpenses.length > 0) {
            autoTable(doc, {
                startY: y + 5,
                head: [["Sr.No", "Title", "Amount"]],
                body: recentExpenses.map((expense, i) => [
                    i + 1,
                    expense.title,
                    `INR ${expense.amount.toLocaleString("en-IN")}`,
                ]),
                headStyles: { fillColor: [34, 153, 84], textColor: 255, halign: "center" },
                styles: { fontSize: 10, cellPadding: 4 },
            })
            y = (doc.lastAutoTable?.finalY ?? 10) + 10
        } else {
            doc.setFont("helvetica", "normal")
            doc.setFontSize(11)
            doc.text("No recent expenses.", 15, y + 8)
            y += 15
        }

        // ---------------- FOOTER ----------------
        doc.setFontSize(9)
        doc.setTextColor(150)
        doc.text("Confidential - For internal use only", 10, 290)
        doc.text("© 2025 Samarth Caters", 160, 290)

        // Save PDF
        doc.save(`Quick-Analytics-(${formatDateTime(new Date())}).pdf`)
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
                                        <p>{t('upcomingOrders.noOrders')}</p>
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
                                                    <h4 className="font-semibold ">{expense.title}</h4>
                                                    <p className="text-sm capitalize text-muted-foreground">{expense.category.toLowerCase()}</p>
                                                    <span className="text-xs text-muted-foreground">
                                                  {formatDate(expense.date)}
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