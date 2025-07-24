
'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import {LucideIcon} from "lucide-react";

interface StatCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    trend?: {
        value: number
        label: string
    }
    color?: 'blue' | 'green' | 'orange' | 'red'
}

const colorClasses = {
    blue: {
        bg: 'bg-blue-50',
        icon: 'text-blue-500',
        text: 'text-blue-600'
    },
    green: {
        bg: 'bg-green-50',
        icon: 'text-green-500',
        text: 'text-green-600'
    },
    orange: {
        bg: 'bg-orange-50',
        icon: 'text-orange-500',
        text: 'text-orange-600'
    },
    red: {
        bg: 'bg-red-50',
        icon: 'text-red-500',
        text: 'text-red-600'
    }
}

export default function StatCard({
                                     title,
                                     value,
                                     icon: Icon,
                                     trend,
                                     color = 'blue'
                                 }: StatCardProps) {
    const colors = colorClasses[color]

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs md:text-sm font-medium text-accent-foreground/80">{title}</p>
                            <p className="text-lg md:text-2xl font-bold text-foreground">{value}</p>
                            {trend && (
                                <p className={`text-xs mt-2 ${colors.text}`}>
                                    {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
                                </p>
                            )}
                        </div>
                        <div className={`p-3 rounded-full dark:bg-accent ${colors.bg}`}>
                            <Icon className={`h-6 w-6 ${colors.icon}`} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}