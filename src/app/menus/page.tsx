'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, UtensilsCrossed, Edit, Trash2 } from 'lucide-react'
import Header from '@/components/layout/header'
import PageHeader from '@/components/ui/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/format'
import { menuTemplates } from '@/lib/data'

export default function MenusPage() {
    const [menus, setMenus] = useState(menuTemplates)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        // Simulate loading
        setTimeout(() => {
            setMenus(menuTemplates)
            setLoading(false)
        }, 500)
    }, [])

    const filteredMenus = menuTemplates.filter(menu =>
        menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        menu.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            'Appetizers': 'bg-orange-100 text-orange-800',
            'Main Course': 'bg-green-100 text-green-800',
            'Rice': 'bg-yellow-100 text-yellow-800',
            'Dessert': 'bg-pink-100 text-pink-800',
            'Beverages': 'bg-blue-100 text-blue-800'
        }
        return colors[category] || 'bg-gray-100 text-gray-800'
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-48"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
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
                    title="Menu Templates"
                    description="Create and manage menu templates for your catering orders."
                    action={{
                        label: "New Menu",
                        onClick: () => console.log('Create new menu')
                    }}
                />

                {/* Search */}
                <div className="mt-8 mb-6">
                    <div className="relative max-w-md">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search menus..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Menus Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMenus.map((menu, index) => (
                        <motion.div
                            key={menu.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <Card className="hover:shadow-lg transition-all duration-200">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{menu.name}</CardTitle>
                                            <CardDescription className="mt-1">{menu.description}</CardDescription>
                                        </div>
                                        <div className="flex space-x-1">
                                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Menu Items */}
                                    <div className="space-y-2">
                                        {menu.items.slice(0, 3).map((item) => (
                                            <div key={item.id} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <Badge className={getCategoryColor(item.category)}>
                                                        {item.category}
                                                    </Badge>
                                                    <span className="text-gray-700">{item.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{formatCurrency(item.price)}</p>
                                                    <p className="text-xs text-gray-500">{item.quantity} {item.unit}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {menu.items.length > 3 && (
                                            <p className="text-xs text-gray-500 text-center py-2">
                                                +{menu.items.length - 3} more items
                                            </p>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <UtensilsCrossed className="h-4 w-4 text-orange-500" />
                                                <span className="text-sm text-gray-600">{menu.items.length} items</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-900">
                                                {formatCurrency(menu.totalPrice)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button variant="outline" className="flex-1" size="sm">
                                            View Details
                                        </Button>
                                        <Button className="flex-1 bg-orange-500 hover:bg-orange-600" size="sm">
                                            Use Template
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {filteredMenus.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <UtensilsCrossed className="h-24 w-24 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No menus found</h3>
                            <p className="text-gray-500 mb-6">
                                {searchTerm
                                    ? 'Try adjusting your search term'
                                    : 'Get started by creating your first menu template'}
                            </p>
                            <Button className="bg-orange-500 hover:bg-orange-600">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Menu
                            </Button>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    )
}