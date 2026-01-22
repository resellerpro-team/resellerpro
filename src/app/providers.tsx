"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            refetchOnWindowFocus: false, // Prevents background refreshes on tab switch
            refetchOnReconnect: true,
            retry: 2,
            // Offline-first: allow queries to run even if offline
            networkMode: 'offlineFirst',
          },
          mutations: {
            // Offline-first: allow mutations to be attempted
            networkMode: 'offlineFirst',
            retry: 1,
          },
        },
      })
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
