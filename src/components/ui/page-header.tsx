'use client'

import {motion} from 'framer-motion'
import {Button} from '@/components/ui/button'
import {Plus, RefreshCcw} from 'lucide-react'

interface PageHeaderProps {
    title: string
    description?: string
    refresh?: () => void
    action?: {
        label: string
        onClick: () => void
    }
}

export default function PageHeader({title, description, refresh, action}: PageHeaderProps) {
    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
            className="flex items-center justify-between"
        >
            <div>
                <h1 className="text-3xl font-bold text-foreground">{title}</h1>
                {description && (
                    <p className="mt-2 text-sm md:text-base text-accent-foreground/80">{description}</p>
                )}
            </div>
            <div className="flex gap-2">
                {refresh && (
                    <Button onClick={refresh} className="bg-primary hover:bg-primary/80 text-white">
                        <RefreshCcw className="h-4 w-4 mr-2"/>
                        Refresh
                    </Button>
                )}
                {action && (
                    <Button onClick={action.onClick} className="bg-primary hover:bg-primary/80 text-white">
                        <Plus className="h-4 w-4 mr-2"/>
                        {action.label}
                    </Button>
                )}
            </div>
        </motion.div>
    )
}