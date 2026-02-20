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
import { LimitReachedModal } from "@/components/subscription/LimitReachedModal";
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
    Lock,
    AlertTriangle,
    CalendarClock,
    Calendar,
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
    const followUpFilter = searchParams.get("follow_up") || "";
    const [page, setPage] = useState(1);
    const [businessName, setBusinessName] = useState<string>('ResellerPro');
    const { toast } = useToast();

    const { canCreateEnquiry, subscription, checkLimit, limitModalProps } = usePlanLimits();
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

    // Handle both old array format (safety) and new object format
    const enquiries = (Array.isArray(enquiriesData) ? enquiriesData : (enquiriesData as any)?.data || []) as Enquiry[];
    const totalCount = Array.isArray(enquiriesData) ? enquiriesData.length : ((enquiriesData as any)?.total || 0);
    const totalPages = Math.ceil(totalCount / 20);

    // Stats Calculation
    const { data: statsData } = useEnquiriesStats();

    const stats = {
        total: totalCount,
        new: statsData?.new || 0,
        followUp: statsData?.followUp || 0,
        converted: statsData?.converted || 0,
        overdue: statsData?.overdue || 0,
        dueToday: statsData?.dueToday || 0,
        dueIn3Days: statsData?.dueIn3Days || 0,
    };

    // Update URL helper
    const updateURL = (newParams: Record<string, string>) => {
        setPage(1);
        const urlParams = new URLSearchParams(searchParams.toString());
        Object.entries(newParams).forEach(([key, value]) => {
            if (!value || value === "all") urlParams.delete(key);
            else urlParams.set(key, value);
        });
        router.push(`/enquiries?${urlParams.toString()}`);
    };

    return (
        <div className="space-y-6">
            {/* ONE: Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Enquiries</h1>
                    <p className="text-muted-foreground">Track leads, schedule follow-ups, and convert with smart WhatsApp messaging</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <ExportEnquiries enquiries={enquiries} businessName={businessName} className="w-full sm:w-auto" />
                    {canCreateEnquiry ? (
                        <RequireVerification>
                            <Button className="w-full sm:w-auto" onClick={() => router.push('/enquiries/new')}>
                                <MessageSquare className="mr-2 h-4 w-4" /> Add Enquiry
                            </Button>
                        </RequireVerification>
                    ) : (
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto gap-2 border-dashed text-muted-foreground opacity-80 hover:bg-background"
                            onClick={() => checkLimit('enquiries')}
                        >
                            <Lock className="mr-2 h-4 w-4" /> Add Enquiry
                        </Button>
                    )}
                </div>
            </div>

            {/* TWO: Stats Cards - Row 1 (Core Stats) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* TWO-B: Smart Alert Stats (Follow-Up Intelligence) */}
            {(stats.overdue > 0 || stats.dueToday > 0 || stats.dueIn3Days > 0) && (
                <div className="grid grid-cols-3 gap-4">
                    <Card
                        className={`cursor-pointer transition-all hover:shadow-md ${followUpFilter === 'overdue' ? 'ring-2 ring-red-500' : ''} ${stats.overdue > 0 ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' : ''}`}
                        onClick={() => updateURL({ follow_up: followUpFilter === 'overdue' ? '' : 'overdue' })}
                    >
                        <CardContent className="p-4 flex items-center gap-3">
                            <AlertTriangle className={`h-5 w-5 ${stats.overdue > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                            <div>
                                <p className={`text-2xl font-bold ${stats.overdue > 0 ? 'text-red-600' : ''}`}>{stats.overdue}</p>
                                <p className="text-xs text-muted-foreground">Overdue</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`cursor-pointer transition-all hover:shadow-md ${followUpFilter === 'today' ? 'ring-2 ring-blue-500' : ''} ${stats.dueToday > 0 ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                        onClick={() => updateURL({ follow_up: followUpFilter === 'today' ? '' : 'today' })}
                    >
                        <CardContent className="p-4 flex items-center gap-3">
                            <CalendarClock className={`h-5 w-5 ${stats.dueToday > 0 ? 'text-blue-500' : 'text-muted-foreground'}`} />
                            <div>
                                <p className={`text-2xl font-bold ${stats.dueToday > 0 ? 'text-blue-600' : ''}`}>{stats.dueToday}</p>
                                <p className="text-xs text-muted-foreground">Due Today</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`cursor-pointer transition-all hover:shadow-md ${followUpFilter === 'upcoming' ? 'ring-2 ring-orange-500' : ''} ${stats.dueIn3Days > 0 ? 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10' : ''}`}
                        onClick={() => updateURL({ follow_up: followUpFilter === 'upcoming' ? '' : 'upcoming' })}
                    >
                        <CardContent className="p-4 flex items-center gap-3">
                            <Calendar className={`h-5 w-5 ${stats.dueIn3Days > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                            <div>
                                <p className={`text-2xl font-bold ${stats.dueIn3Days > 0 ? 'text-orange-600' : ''}`}>{stats.dueIn3Days}</p>
                                <p className="text-xs text-muted-foreground">Due in 3 Days</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* THREE: Search & Filter */}
            <Card>
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search enquiries..."
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
                search || statusFilter !== "all" || followUpFilter ? (
                    <FilteredEmptyState
                        onClearFilters={() => updateURL({ search: "", status: "all", follow_up: "" })}
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
                        <EnquiryRow key={enquiry.id} enquiry={enquiry} businessName={businessName} />
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
            <LimitReachedModal {...limitModalProps} />
        </div>
    );
}
