"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { Plus, Search, Filter, Users, TrendingUp, IndianRupee } from "lucide-react";

import Link from "next/link";
import CustomerCard from "@/components/customers/CustomerCard";
import { ExportCustomers } from "@/components/customers/ExportCustomers";
import { Pagination } from "@/components/shared/Pagination";
import { useCustomers } from "@/lib/react-query/hooks/useCustomers";
import { useCustomersStats } from "@/lib/react-query/hooks/stats-hooks";
import { useState } from "react";
import { CustomersSkeleton } from "@/components/shared/skeletons/CustomersSkeleton";
import { StatsCard } from "@/components/shared/StatsCard";
import { EmptyState, FilteredEmptyState } from "@/components/shared/EmptyState";

// -----------------------------------------

export function CustomersClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);

  // Read URL params
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "-created_at";

  // Build querystring
  const params = new URLSearchParams(searchParams.toString());
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
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([k, v]) => {
      if (!v) params.delete(k);
      else params.set(k, v);
    });

    startTransition(() => {
      router.push(`/customers?${params.toString()}`);
    });
  };

  // -----------------------------------------

  return (


    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customer relationships</p>
        </div>

        <div className="flex gap-2">
          <ExportCustomers customers={customers} />
          
          <Button asChild>
            <Link href="/customers/new">
              <Plus className="mr-2 h-4 w-4" /> Add Customer
            </Link>
          </Button>
        </div>
      </div>

      {/* STATS */}

      <div className="grid gap-4 md:grid-cols-3">
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
            <Button variant="outline" onClick={() => updateURL({ sort: sort === "-created_at" ? "created_at" : "-created_at" })}>
              Sort
            </Button>
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
                setPage(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
