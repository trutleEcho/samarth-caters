'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const isLoginPage = pathname === '/login';
        const loginResponse = localStorage.getItem('loginResponse');

        if (!isLoginPage && !loginResponse) {
            // router.push('/login');
        }
    }, [pathname, router]);

    return <>{children}</>;
}
