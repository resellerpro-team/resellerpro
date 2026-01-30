"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEnquiries } from "@/lib/react-query/hooks/useEnquiries";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useToast } from "@/hooks/use-toast";
import { useEnquiriesStats } from "@/lib/react-query/hooks/stats-hooks";
import { Pagination } from "@/components/shared/Pagination";
import { EnquiriesSkeleton } from "@/components/shared/skeletons/EnquiriesSkeleton";
import { EmptyState, FilteredEmptyState } from "@/components/shared/EmptyState";
import { EnquiryRow } from "./EnquiryRow";
import {
    Search,
    Filter,
    MessageSquare,
    Clock,
    CheckCircle2,
    XCircle,
    Inbox,
    Lock
} from "lucide-react";
import { ExportEnquiries } from '@/components/enquiries/ExportEnquiries';
import { StatsCard } from "@/components/shared/StatsCard"
import { Enquiry } from "@/types"
import { createClient } from '@/lib/supabase/client';
import { RequireVerification } from "../shared/RequireVerification";
import Link from "next/link";

export function EnquiriesClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // URL Params
    const search = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || "all";
    const [page, setPage] = useState(1);
    const [businessName, setBusinessName] = useState<string>('ResellerPro');
    const { toast } = useToast();

    const { canCreateEnquiry, subscription } = usePlanLimits();
    const planName = subscription?.plan?.display_name || 'Free Plan';

    // Fetch business name from user profile
    useEffect(() => {
        async function fetchBusinessName() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('business_name')
                    .eq('id', user.id)
                    .single()

                if (profile?.business_name) {
                    setBusinessName(profile.business_name)
                }
            }
        }

        fetchBusinessName()
    }, []);

    // Data Fetching
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    params.set('limit', '20');
    const qs = params.toString();

    const { data: enquiriesData, isLoading } = useEnquiries(qs);
    // Explicitly cast to any if necessary, or assume hook handles generic
    // const enquiriesDataAny = enquiriesData as any; // No longer needed with types

    // Handle both old array format (safety) and new object format
    const enquiries = (Array.isArray(enquiriesData) ? enquiriesData : (enquiriesData as any)?.data || []) as Enquiry[];
    const totalCount = Array.isArray(enquiriesData) ? enquiriesData.length : ((enquiriesData as any)?.total || 0);
    const totalPages = Math.ceil(totalCount / 20);

    // Stats Calculation
    // Global Stats (Server-side)
    const { data: statsData } = useEnquiriesStats();

    const stats = {
        total: totalCount,
        new: statsData?.new || 0,
        followUp: statsData?.followUp || 0,
        converted: statsData?.converted || 0,
    };

    // Update URL helper
    const updateURL = (params: Record<string, string>) => {
        setPage(1);
        const newParams = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([key, value]) => {
            if (!value || value === "all") newParams.delete(key);
            else newParams.set(key, value);
        });
        router.push(`/enquiries?${newParams.toString()}`);
    };

    return (
        <div className="space-y-6">
            {/* ONE: Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Enquiries</h1>
                    <p className="text-muted-foreground">Manage ongoing customer conversations and leads</p>
                </div>
                <div className="flex items-center gap-2">
                    <ExportEnquiries enquiries={enquiries} businessName={businessName} />
                    {canCreateEnquiry ? (
                        <RequireVerification>
                            <Button onClick={() => router.push('/enquiries/new')}>
                                <MessageSquare className="mr-2 h-4 w-4" /> Add Enquiry
                            </Button>
                        </RequireVerification>
                    ) : (
                        <Button
                            variant="outline"
                            className="gap-2 border-dashed text-muted-foreground opacity-80 hover:bg-background"
                            onClick={() => {
                                toast({
                                    title: "Limit Reached 🔒",
                                    description: `You've reached your enquiry limit on the ${planName}. Upgrade to unlock more!`,
                                    variant: "default",
                                    action: <Link href="/settings/subscription" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3">Upgrade</Link>
                                })
                            }}
                        >
                            <Lock className="mr-2 h-4 w-4" /> Add Enquiry
                        </Button>
                    )}
                </div>
            </div>

            {/* TWO: Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                    title="New Enquiries"
                    value={stats.new}
                    icon={Inbox}
                    className="text-blue-500"
                />
                <StatsCard
                    title="Following Up"
                    value={stats.followUp}
                    icon={Clock}
                    className="text-orange-500"
                />
                <StatsCard
                    title="Converted"
                    value={stats.converted}
                    icon={CheckCircle2}
                    className="text-green-500"
                />
                <StatsCard
                    title="Total"
                    value={stats.total}
                    icon={MessageSquare}
                    className="text-gray-500"
                />
            </div>

            {/* THREE: Search & Filter */}
            <Card>
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, message..."
                            className="pl-9"
                            defaultValue={search}
                            onChange={(e) => updateURL({ search: e.target.value })}
                        />
                    </div>
                    <Select
                        value={statusFilter}
                        onValueChange={(val) => updateURL({ status: val })}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="needs_follow_up">Follow Up</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="dropped">Dropped</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* FOUR: List */}
            {isLoading ? (
                <EnquiriesSkeleton />
            ) : enquiries.length === 0 ? (
                search || statusFilter !== "all" ? (
                    <FilteredEmptyState
                        onClearFilters={() => updateURL({ search: "", status: "all" })}
                    />
                ) : (
                    <EmptyState
                        icon={MessageSquare}
                        title="No enquiries yet"
                        description="Start receiving customer enquiries to convert them into sales opportunities."
                        action={{
                            label: "Add Enquiry",
                            href: "/enquiries/new"
                        }}
                        requireVerification={true}
                    />
                )
            ) : (
                <div className="space-y-4">
                    {enquiries.map((enquiry: Enquiry) => (
                        <EnquiryRow key={enquiry.id} enquiry={enquiry} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!isLoading && enquiries.length > 0 && (
                <div className="py-4 border-t">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(p) => {
                            setPage(p);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    />
                </div>
            )}
        </div>
    );
}
