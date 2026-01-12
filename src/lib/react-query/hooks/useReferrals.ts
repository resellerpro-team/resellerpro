"use client";

import { useQuery } from "@tanstack/react-query";

export function useReferrals() {
    return useQuery({
        queryKey: ["referrals"],
        queryFn: async () => {
            const res = await fetch("/api/settings/referrals");
            if (!res.ok) throw new Error("Failed to fetch referral data");
            return res.json();
        },
    });
}
