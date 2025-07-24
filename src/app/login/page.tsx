'use client'

import {motion} from 'framer-motion'
import {ChefHat} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {handleSignInWithGoogle} from '@/utils/handleSignInWithGoogle'
import {toast} from "sonner";
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [checkingAutoLogin, setCheckingAutoLogin] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Auto-login if loginResponse exists
        const loginResponse = localStorage.getItem('loginResponse')
        if (loginResponse) {
            // Optionally, validate the session here
            router.push('/dashboard')
        } else {
            setCheckingAutoLogin(false)
        }
    }, [router])

    if (checkingAutoLogin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-green-50">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-200 via-white to-green-200 flex items-center justify-center relative overflow-hidden p-4">
            {/* Decorative background illustration */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="z-10"
            >
                <Card className="w-full min-w-xl shadow-2xl border-0 bg-background backdrop-blur-lg">
                    <CardHeader className="text-center space-y-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                            className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg"
                        >
                            <ChefHat className="h-8 w-8 text-white" />
                        </motion.div>
                        <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">Samarth Caters</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">Sign in to manage your catering business</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center gap-6">
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-full w-fit flex items-center justify-center gap-2 text-base font-medium py-3 border-2 border-gray-200 hover:border-orange-400 transition"
                                onClick={async () => {
                                    try {
                                        await handleSignInWithGoogle()
                                    } catch (err: any) {
                                        toast.error(err.message || "Google login failed")
                                    }
                                }}
                            >
                                <svg className="h-5 w-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_17_40)">
                                        <path d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29.1H37.4C36.7 32.2 34.7 34.7 31.8 36.4V42.1H39.3C44 38 47.5 31.9 47.5 24.5Z" fill="#4285F4"/>
                                        <path d="M24 48C30.6 48 36.1 45.9 39.3 42.1L31.8 36.4C30.1 37.5 27.9 38.2 24 38.2C17.7 38.2 12.2 34.1 10.3 28.7H2.5V34.6C5.7 41.1 14.1 48 24 48Z" fill="#34A853"/>
                                        <path d="M10.3 28.7C9.7 27.1 9.4 25.4 9.4 23.6C9.4 21.8 9.7 20.1 10.3 18.5V12.6H2.5C0.8 15.7 0 19.2 0 23.6C0 28 0.8 31.5 2.5 34.6L10.3 28.7Z" fill="#FBBC05"/>
                                        <path d="M24 9.8C27.7 9.8 30.2 11.3 31.6 12.6L39.4 5.1C36.1 2.1 30.6 0 24 0C14.1 0 5.7 6.9 2.5 12.6L10.3 18.5C12.2 13.1 17.7 9.8 24 9.8Z" fill="#EA4335"/>
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_17_40">
                                            <rect width="48" height="48" fill="white"/>
                                        </clipPath>
                                    </defs>
                                </svg>
                                Sign in with Google
                            </Button>
                            <div className="text-center text-xs text-muted-foreground/70 mt-2">
                                Only Google sign-in is supported for now.<br />
                                Contact admin for access.
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}