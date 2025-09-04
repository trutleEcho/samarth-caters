'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                console.log('No token found, user not authenticated');
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            try {
                console.log('Checking authentication with token...');
                const response = await fetch('/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                console.log('Auth check response:', response.status);

                if (response.ok) {
                    console.log('User authenticated successfully');
                    setIsAuthenticated(true);
                } else {
                    console.log('Authentication failed, removing token');
                    localStorage.removeItem('authToken');
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('authToken');
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            const isLoginPage = pathname === '/login';
            
            if (!isLoginPage && !isAuthenticated) {
                // router.push('/login');
            } else if (isLoginPage && isAuthenticated) {
                router.push('/dashboard');
            }
        }
    }, [isLoading, isAuthenticated, pathname, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return <>{children}</>;
}
