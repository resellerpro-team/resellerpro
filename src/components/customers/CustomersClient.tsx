"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Plus, Search, Filter, Users, TrendingUp, IndianRupee, Lock } from "lucide-react";

import Link from "next/link";
import CustomerCard from "@/components/customers/CustomerCard";
import { ExportCustomers } from "@/components/customers/ExportCustomers";
import { Pagination } from "@/components/shared/Pagination";
import { useCustomers } from "@/lib/react-query/hooks/useCustomers";
import { useCustomersStats } from "@/lib/react-query/hooks/stats-hooks";
import { useState, useEffect } from "react";
import { CustomersSkeleton } from "@/components/shared/skeletons/CustomersSkeleton";
import { StatsCard } from "@/components/shared/StatsCard";
import { EmptyState, FilteredEmptyState } from "@/components/shared/EmptyState";
import { createClient } from "@/lib/supabase/client";
import { RequireVerification } from "../shared/RequireVerification";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useToast } from "@/hooks/use-toast";

// -----------------------------------------

export function CustomersClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const { canCreateCustomer, subscription } = usePlanLimits();
  const planName = subscription?.plan?.display_name || 'Free Plan';

  const [businessName, setBusinessName] = useState<string>('ResellerPro');

  // Sync page from URL
  const pageParam = searchParams.get("page");
  const [page, setPage] = useState(pageParam ? parseInt(pageParam) : 1);

  useEffect(() => {
    if (pageParam) {
      setPage(parseInt(pageParam));
    }
  }, [pageParam]);

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

  // Read URL params
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "-created_at";

  // Build querystring
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (sort) params.set('sort', sort);
  params.set('page', page.toString());
  params.set('limit', '20');
  const qs = params.toString();

  // Fetch customers
  const { data: customersData, isLoading } = useCustomers(qs);

  const customers = customersData?.data || [];
  const totalCount = customersData?.total || 0;
  const totalPages = Math.ceil(totalCount / 20);

  // ---------- CLIENT-SIDE STATS ----------
  // Global Stats (Server-side)
  const { data: statsData } = useCustomersStats();

  const stats = {
    total: totalCount,
    newThisMonth: statsData?.newThisMonth || 0,
    repeat: statsData?.repeat || 0,
    retentionRate: statsData?.retentionRate || 0,
    avgValue: statsData?.avgValue || 0,
  };

  // ---------- Update URL ----------
  const updateURL = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([k, v]) => {
      if (!v) params.delete(k);
      else params.set(k, v);
    });

    // Reset page on search or sort change
    if (updates.search !== undefined || updates.sort !== undefined) {
      params.set('page', '1');
      setPage(1);
    }

    startTransition(() => {
      router.push(`/customers?${params.toString()}`);
    });
  };

  // -----------------------------------------

  return (


    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customer relationships</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <ExportCustomers
            customers={customers}
            businessName={businessName}
            className="w-full sm:w-auto"
          />

          {canCreateCustomer ? (
            <RequireVerification>
              <Button asChild className="w-full sm:w-auto">
                <Link href="/customers/new">
                  <Plus className="mr-2 h-4 w-4" /> Add Customer
                </Link>
              </Button>
            </RequireVerification>
          ) : (
            <Button
              variant="outline"
              className="w-full sm:w-auto gap-2 border-dashed text-muted-foreground opacity-80 hover:bg-background"
              onClick={() => {
                toast({
                  title: "Limit Reached 🔒",
                  description: `You've reached your customer limit on the ${planName}. Upgrade to grow your business!`,
                  variant: "default",
                  action: <Link href="/settings/subscription" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3">Upgrade</Link>
                })
              }}
            >
              <Lock className="mr-2 h-4 w-4" /> Add Customer
            </Button>
          )}
        </div>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Customers"
          value={stats.total}
          icon={Users}
          description={`+${stats.newThisMonth} new this month`}
        />

        <StatsCard
          title="Repeat Customers"
          value={stats.repeat}
          icon={TrendingUp}
          description={`${stats.retentionRate}% retention rate`}
        />

        <StatsCard
          title="Avg. Customer Value"
          value={`₹${stats.avgValue}`}
          icon={IndianRupee}
          description="Lifetime value"
          className="col-span-2 md:col-span-1"
        />
      </div>

      {/* SEARCH & FILTER */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                defaultValue={search}
                className="pl-10"
                placeholder="Search by name, phone, email..."
                onChange={(e) => updateURL({ search: e.target.value })}
              />
            </div>

            {/* Sort dropdown */}
            <Select
              value={sort}
              onValueChange={(value) => updateURL({ sort: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-created_at">Newest</SelectItem>
                <SelectItem value="created_at">Oldest</SelectItem>
                <SelectItem value="-total_orders">Most Ordered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* CUSTOMER LIST */}
      {isLoading ? (
        <CustomersSkeleton />
      ) : customers.length === 0 ? (
        search ? (
          <FilteredEmptyState
            onClearFilters={() => updateURL({ search: "" })}
          />
        ) : (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Add your first customer to start building relationships and tracking sales."
            action={{
              label: "Add Customer",
              href: "/customers/new"
            }}
            requireVerification={true}
          />
        )
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customers.map((c: any) => (
              <CustomerCard
                key={c.id}
                id={c.id}
                name={c.name}
                phone={c.phone}
                email={c.email || "N/A"}
                orders={c.total_orders ?? 0}
                totalSpent={c.total_spent ?? 0}
                lastOrder={c.last_order_date}
              />
            ))}
          </div>

          <div className="py-4 border-t">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('page', p.toString());
                router.push(`/customers?${params.toString()}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
