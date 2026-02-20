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
    // Follow-up automation fields
    follow_up_date?: string | null;
    follow_up_notes?: string | null;
    priority?: "low" | "medium" | "high" | "urgent";
    last_contacted_at?: string | null;
    follow_up_count?: number;
};

export type FollowUpActivity = {
    id: string;
    enquiry_id: string;
    user_id: string;
    action: "whatsapp_sent" | "called" | "note_added" | "status_changed" | "follow_up_scheduled";
    note?: string | null;
    whatsapp_message?: string | null;
    created_at: string;
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

export function useFollowUpActivities(enquiryId: string) {
    return useQuery({
        queryKey: ["follow-ups", enquiryId],
        queryFn: async () => {
            const res = await fetch(`/api/enquiries/${enquiryId}/follow-ups`);
            if (!res.ok) throw new Error("Failed to fetch follow-up activities");
            return res.json() as Promise<{ data: FollowUpActivity[] }>;
        },
        enabled: !!enquiryId,
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
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to create enquiry");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["enquiries"] });
            queryClient.invalidateQueries({ queryKey: ["enquiries-stats"] });
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
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to update enquiry");
            }
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["enquiries"] });
            queryClient.invalidateQueries({ queryKey: ["enquiry", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["enquiries-stats"] });
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
            queryClient.invalidateQueries({ queryKey: ["enquiries-stats"] });
        },
    });
}

export function useLogFollowUpActivity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            enquiryId: string;
            action: FollowUpActivity["action"];
            note?: string;
            whatsapp_message?: string;
        }) => {
            const res = await fetch(`/api/enquiries/${data.enquiryId}/follow-ups`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: data.action,
                    note: data.note,
                    whatsapp_message: data.whatsapp_message,
                }),
            });
            if (!res.ok) throw new Error("Failed to log follow-up activity");
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["follow-ups", variables.enquiryId] });
            queryClient.invalidateQueries({ queryKey: ["enquiry", variables.enquiryId] });
            queryClient.invalidateQueries({ queryKey: ["enquiries"] });
        },
    });
}

// --- HELPER: Fetch customers for conversion ---
export async function fetchCustomers(queryString: string) {
    const res = await fetch(`/api/customers?${queryString}`);
    if (!res.ok) throw new Error("Failed to fetch customers");
    const data = await res.json();
    return Array.isArray(data) ? data : data.data || [];
}
