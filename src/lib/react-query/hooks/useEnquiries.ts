"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";

export type Enquiry = {
    id: string;
    customer_name: string;
    phone: string;
    message: string;
    status: "new" | "needs_follow_up" | "converted" | "dropped";
    created_at: string;
    last_updated: string;
    source?: string;
};

// --- QUERIES ---

export function useEnquiries(queryString: string) {
    return useQuery({
        queryKey: ["enquiries", queryString],
        queryFn: async () => {
            const res = await fetch(`/api/enquiries?${queryString}`);
            if (!res.ok) throw new Error("Failed to fetch enquiries");
            return res.json() as Promise<Enquiry[]>;
        },
        placeholderData: keepPreviousData,
    });
}

export function useEnquiry(id: string) {
    return useQuery({
        queryKey: ["enquiry", id],
        queryFn: async () => {
            const res = await fetch(`/api/enquiries/${id}`);
            if (!res.ok) throw new Error("Failed to fetch enquiry");
            return res.json() as Promise<Enquiry>;
        },
        enabled: !!id,
    });
}

// --- MUTATIONS ---

export function useCreateEnquiry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Partial<Enquiry>) => {
            const res = await fetch("/api/enquiries", {
                method: "POST",
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create enquiry");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["enquiries"] });
        },
    });
}

export function useUpdateEnquiry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...data }: Partial<Enquiry> & { id: string }) => {
            const res = await fetch(`/api/enquiries/${id}`, {
                method: "PATCH",
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update enquiry");
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["enquiries"] });
            queryClient.invalidateQueries({ queryKey: ["enquiry", variables.id] });
        },
    });
}

export function useDeleteEnquiry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/enquiries/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete enquiry");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["enquiries"] });
        },
    });
}
