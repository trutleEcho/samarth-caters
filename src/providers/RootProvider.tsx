'use client'

import {ThemeProvider} from "@/components/theme-provider";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {Toaster} from "@/components/ui/sonner";
import I18nProvider from "./I18nProvider";

export default function RootProvider({children}: {children: React.ReactNode}) {
    const queryClient = new QueryClient();

    return <>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <QueryClientProvider client={queryClient}>
                <I18nProvider>
                    {children}
                    <Toaster richColors />
                </I18nProvider>
            </QueryClientProvider>
        </ThemeProvider>
    </>
}