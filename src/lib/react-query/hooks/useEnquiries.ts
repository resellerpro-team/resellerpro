"use client";

import { useQuery } from "@tanstack/react-query";

export type Enquiry = {
    id: string;
    customer_name: string;
    phone: string;
    message: string;
    status: "new" | "needs_follow_up" | "converted" | "dropped";
    created_at: string;
    last_updated: string;
};

export function useEnquiries(queryString: string) {
    return useQuery({
        queryKey: ["enquiries", queryString],
        queryFn: async () => {
            const res = await fetch(`/api/enquiries?${queryString}`, {
                cache: "no-store",
            });

            if (!res.ok) {
                throw new Error("Failed to fetch enquiries");
            }

            return res.json() as Promise<Enquiry[]>;
        },
    });
}
