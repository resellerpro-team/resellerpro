"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEnquiries, Enquiry } from "@/lib/react-query/hooks/useEnquiries";
import { EnquiryRow } from "./EnquiryRow";
import {
    Search,
    Filter,
    MessageSquare,
    Clock,
    CheckCircle2,
    XCircle,
    Inbox
} from "lucide-react";

export function EnquiriesClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // URL Params
    const search = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || "all";

    // Data Fetching
    const qs = searchParams.toString();
    const { data: enquiries = [], isLoading } = useEnquiries(qs);

    // Stats Calculation
    const stats = {
        total: enquiries.length,
        new: enquiries.filter(e => e.status === "new").length,
        followUp: enquiries.filter(e => e.status === "needs_follow_up").length,
        converted: enquiries.filter(e => e.status === "converted").length,
    };

    // Update URL helper
    const updateURL = (params: Record<string, string>) => {
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
                {/* <Button>Create Manual Enquiry</Button> */}
            </div>

            {/* TWO: Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                    label="New Enquiries"
                    value={stats.new}
                    icon={Inbox}
                    color="text-blue-500"
                />
                <StatsCard
                    label="Following Up"
                    value={stats.followUp}
                    icon={Clock}
                    color="text-orange-500"
                />
                <StatsCard
                    label="Converted"
                    value={stats.converted}
                    icon={CheckCircle2}
                    color="text-green-500"
                />
                <StatsCard
                    label="Total"
                    value={stats.total}
                    icon={MessageSquare}
                    color="text-gray-500"
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
            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-10 text-muted-foreground">Loading enquiries...</div>
                ) : enquiries.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">No enquiries found.</div>
                ) : (
                    enquiries.map((enquiry) => (
                        <EnquiryRow key={enquiry.id} enquiry={enquiry} />
                    ))
                )}
            </div>
        </div>
    );
}

function StatsCard({ label, value, icon: Icon, color }: any) {
    return (
        <Card>
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
                <Icon className={`h-8 w-8 opacity-20 ${color}`} />
            </CardContent>
        </Card>
    );
}
