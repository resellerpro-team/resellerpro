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
import { useCustomers } from "@/lib/react-query/hooks/useCustomers";

// -----------------------------------------

export function CustomersClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Read URL params
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "-created_at";

  // Build querystring
  const qs = searchParams.toString();

  // Fetch customers
  const { data: customers = [], isLoading } = useCustomers(qs);

  // ---------- CLIENT-SIDE STATS ----------
  const stats = {
    total: customers.length,
    newThisMonth: customers.filter((c: any) => {
      const date = c.created_at ? new Date(c.created_at) : null;
      if (!date) return false;

      const now = new Date();
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length,

    repeat: customers.filter((c: any) => (c.total_orders ?? 0) > 1).length,

    retentionRate:
      customers.length === 0
        ? 0
        : Math.round(
          (customers.filter((c: any) => (c.total_orders ?? 0) > 1).length /
            customers.length) *
          100
        ),

    avgValue:
      customers.length === 0
        ? 0
        : Math.round(
          customers.reduce((s: number, c: any) => s + (c.total_spent ?? 0), 0) /
          customers.length
        ),
  };

  // ---------- Update URL ----------
  const updateURL = (updates: Record<string, string>) => {
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

        <Button asChild>
          <Link href="/customers/new">
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </Link>
        </Button>
      </div>

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newThisMonth} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Repeat Customers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.repeat}</div>
            <p className="text-xs text-muted-foreground">{stats.retentionRate}% retention rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Customer Value</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.avgValue}</div>
            <p className="text-xs text-muted-foreground">Lifetime value</p>
          </CardContent>
        </Card>
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
        <p className="text-center py-20 text-muted-foreground">Loading customers...</p>
      ) : customers.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-3">
            <Users className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">No customers found</h3>
            <p className="text-muted-foreground">
              {search ? "Try adjusting your search" : "Start by adding your first customer"}
            </p>
            {!search && (
              <Button asChild>
                <Link href="/customers/new">
                  <Plus className="mr-2 h-4 w-4" /> Add Customer
                </Link>
              </Button>
            )}
          </div>
        </Card>
      ) : (
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
      )}
    </div>
  );
}
