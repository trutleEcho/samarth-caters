import './globals.css';
import type {Metadata} from 'next';
import {Inter} from 'next/font/google';
import RootProvider from "@/providers/RootProvider";

const inter = Inter({subsets: ['latin']});

export const metadata: Metadata = {
    title: 'Samarth Caters',
    description: 'Internal management system for Samarth Caters',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            <script src="https://accounts.google.com/gsi/client" async></script>
        </head>
        <body className={inter.className}>
        <RootProvider>
            {children}
        </RootProvider>
        </body>
        </html>
    );
}
