'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes (data remains fresh)
                gcTime: 1000 * 60 * 30, // 30 minutes (cache time logic)
                retry: 3, // Retry failed requests 3 times
                retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
                refetchOnWindowFocus: false,
            },
            mutations: {
                retry: 2,
            }
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster />
        </QueryClientProvider>
    );
}
