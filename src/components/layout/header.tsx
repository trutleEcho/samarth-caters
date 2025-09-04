'use client'

import {useState} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {motion} from 'framer-motion'
import {
    ChefHat,
    Menu,
    X,
    Home,
    ShoppingCart,
    Users,
    UtensilsCrossed,
    Receipt,
    LogOut
} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle
} from '@/components/ui/sheet'
import {ThemeToggle} from "@/components/custom/theme-toggle";
import {LanguageToggle} from "@/components/custom/language-toggle";
import {Separator} from "@/components/ui/separator";
import { useTranslations } from 'next-intl';
import pkg from "../../../package.json";
import Image from "next/image";

const navigation = [
    {name: 'dashboard', href: '/dashboard', icon: Home},
    {name: 'orders', href: '/orders', icon: ShoppingCart},
    {name: 'customers', href: '/customers', icon: Users},
    {name: 'expenses', href: '/expenses', icon: Receipt},
]

export default function Header() {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()
    const t = useTranslations('navigation');
    const commonT = useTranslations('common');

    const handleLogout = async () => {
        localStorage.removeItem('authToken')
        router.push('/login')
    }

    return (
        <header className="sticky top-0 z-50 bg-background pb-4 shadow mb-3 md:mb-8 border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 mt-4">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center space-x-2">
                        <motion.div
                            initial={{scale: 0}}
                            animate={{scale: 1}}
                            transition={{type: "spring", stiffness: 260, damping: 20}}
                        >
                            {/*<ChefHat className="h-8 w-8 text-orange-500"/>*/}
                        </motion.div>
                        <Image src="/sc_logo.png" alt="Samarth Caterers" width={100} height={100}/>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center space-x-2 text-accent-background hover:text-primary/80 transition-colors duration-200"
                            >
                                <item.icon className="h-4 w-4"/>
                                <span>{t(item.name)}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Logout */}
                    <div className="hidden md:flex items-center space-x-2">
                        <LanguageToggle />
                        <ThemeToggle/>
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="text-red-500"
                        >
                            <LogOut className="h-4 w-4 mr-2"/>
                            {commonT('logout')}
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            v{pkg.version}
                        </span>
                    </div>

                    {/* Mobile Menu */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="sm">
                                <Menu className="h-6 w-6"/>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-80">
                            <SheetHeader>
                                <SheetTitle className="flex items-center justify-between mt-6">
                                    <div>
                                        <span>{commonT('appName')}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <LanguageToggle />
                                        <ThemeToggle/>
                                    </div>
                                </SheetTitle>
                            </SheetHeader>
                            <Separator />
                            <nav className="flex flex-col h-full justify-between">
                                <div>
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                                        >
                                            <item.icon className="h-5 w-5 text-accent-foreground/70 hover:text-primary"/>
                                            <span className="text-accent-foreground hover:text-primary">{t(item.name)}</span>
                                        </Link>
                                    ))}
                                </div>
                                <div className="flex flex-col justify-center">
                                    <span className="text-xs text-accent-foreground leading-relaxed text-center">
                                      <span className="font-medium text-gray-600 dark:text-gray-300">Designed & Developed by:</span><br/>
                                      <span className="italic">Pradyumna Tanksali <br/>(9175395577)</span>
                                    </span>
                                    <hr className="mt-4"/>
                                    <Button
                                        variant="ghost"
                                        onClick={handleLogout}
                                        className="flex items-center space-x-3 m-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <LogOut className="h-5 w-5"/>
                                        <span>{commonT('logout')}</span>
                                    </Button>
                                    <span className="text-xs text-white">v{pkg.version}</span>
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}