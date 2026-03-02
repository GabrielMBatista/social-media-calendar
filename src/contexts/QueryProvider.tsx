"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Com o Next 15 SSR, queremos evitar refetch agressivo no cliente
                        // para o que já foi carregado no servidor.
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false, // Menos agressivo para melhor UX
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
