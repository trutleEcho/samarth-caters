'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'
import { ChefHat } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function AuthCallbackPage() {
    const router = useRouter()
    const supabase = createClientComponentClient()

    useEffect(() => {
        const fetchUser = async () => {
            const { data } = await supabase.auth.getUser()

            if (data.user) {
                localStorage.setItem('loginResponse', JSON.stringify(data))
                router.push('/dashboard')
            } else {
                toast.error("Invalid credentials")
                localStorage.removeItem('loginResponse')
                router.push('/login')
            }
        }

        fetchUser()
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-200 via-white to-green-200 flex items-center justify-center relative overflow-hidden p-4">
            <div className="z-10 w-full min-w-xl">
                <Card className="w-full min-w-xl shadow-2xl border-0 bg-background backdrop-blur-lg">
                    <CardContent className="flex flex-col items-center justify-center py-16 gap-6">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg mb-2">
                            <ChefHat className="h-8 w-8 text-white animate-bounce" />
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2"></div>
                            <span className="text-lg font-semibold text-foreground">Logging you in...</span>
                            <span className="text-xs text-muted-foreground">Please wait while we verify your account.</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
