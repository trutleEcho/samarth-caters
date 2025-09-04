'use client'

import {useState, useEffect} from 'react'
import {X, User, Phone, Mail, MapPin, Calendar, Save, Loader2} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Textarea} from '@/components/ui/textarea'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer'
import {toast} from 'sonner'
import {useTranslations} from 'next-intl'
import {Customer} from '@/data/entities/customer'
import { api } from "@/lib/api";

interface CustomerDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    customer: Customer | null
    onSave: (updated: Partial<Customer>) => void
}

export default function CustomerDrawer({open, onOpenChange, customer, onSave}: CustomerDrawerProps) {
    const t = useTranslations('customers.customerDetails')
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<Partial<Customer>>({})

    // Update form data when customer changes
    useEffect(() => {
        if (customer) {
            setFormData({
                id: customer.id,
                name: customer.name,
                phone_number: customer.phone_number,
                email: customer.email || '',
                address: customer.address || '',
            })
        }
    }, [customer])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!customer) return

        setLoading(true)
        console.log(formData)

        try {
            const response = await api.put('/api/customers', formData)
            if (response.ok) {
                onSave(formData)
                toast.success(t('saveSuccess'))
                onOpenChange(false)
            } else if (response.status === 401) {
                toast.error('Please login again')
            } else {
                const error = await response.json()
                toast.error(error.error || t('error'))
            }
        } catch (error) {
            console.error('Error updating customer:', error)
            toast.error(t('saveError'))
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    if (!customer) return null

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="h-[85vh]">
                <DrawerHeader className="border-b">
                    <DrawerTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <User className="h-5 w-5"/>
                            <span>{t('title')}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-4 w-4"/>
                        </Button>
                    </DrawerTitle>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('form.name')} *</Label>
                                <div className="relative">
                                    <User
                                        className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                                    <Input
                                        id="name"
                                        value={formData.name || ''}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">{t('form.phone')} *</Label>
                                <div className="relative">
                                    <Phone
                                        className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone_number || ''}
                                        onChange={(e) => handleInputChange('phone_number', e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">{t('form.email')}</Label>
                            <div className="relative">
                                <Mail
                                    className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">{t('form.address')}</Label>
                            <div className="relative">
                                <MapPin className="h-4 w-4 absolute left-3 top-3 text-gray-400"/>
                                <Textarea
                                    id="address"
                                    value={formData.address || ''}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    className="pl-10 min-h-[80px]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>{t('form.createdAt')}</Label>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4"/>
                                <span>{customer.created_at.toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                            >
                                <X className="h-4 w-4 mr-2"/>
                                {t('cancel')}
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                        {t('saving')}
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2"/>
                                        {t('saveChanges')}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    )
} 