'use client'

import {motion} from 'framer-motion'
import {ChefHat} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {toast} from "sonner";
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [checkingAutoLogin, setCheckingAutoLogin] = useState(true)
    const [isLogin, setIsLogin] = useState(true)
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Auto-login if authToken exists
        const authToken = localStorage.getItem('authToken')
        if (authToken) {
            router.push('/dashboard')
        } else {
            setCheckingAutoLogin(false)
        }
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
            
            // Prepare data for API call
            const apiData = {
                username: formData.username,
                password: formData.password,
                ...(formData.email && formData.email.trim() !== '' && { email: formData.email })
            }
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiData),
            })

            const data = await response.json()

            if (data.success) {
                localStorage.setItem('authToken', data.token)
                toast.success(isLogin ? 'Login successful!' : 'Registration successful!')
                router.push('/dashboard')
            } else {
                // Show more specific error messages
                if (data.details && Array.isArray(data.details)) {
                    const errorMessages = data.details.map((detail: any) => detail.message).join(', ')
                    toast.error(`Validation failed: ${errorMessages}`)
                } else {
                    toast.error(data.error || 'Authentication failed')
                }
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

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
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            {!isLogin && (
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email (Optional)</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        disabled={isLoading}
                                    />
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
                            </Button>
                        </form>

                        <div className="mt-4 text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin)
                                    setFormData({username: '', password: '', email: ''})
                                }}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                disabled={isLoading}
                            >
                                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}