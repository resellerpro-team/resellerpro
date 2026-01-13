"use client";

import { useQuery } from "@tanstack/react-query";

export function useWallet() {
    return useQuery({
        queryKey: ["wallet"],
        queryFn: async () => {
            const res = await fetch("/api/settings/wallet");
            if (!res.ok) throw new Error("Failed to fetch wallet data");
            return res.json();
        },
    });
}
