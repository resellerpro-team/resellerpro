"use client";

import { useTransition, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProducts } from "@/lib/react-query/hooks/useProducts";
import { useProductsStats } from "@/lib/react-query/hooks/stats-hooks";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

import {
  Package,
  IndianRupee,
  TrendingUp,
  Download,
  Grid3x3,
  List,
  AlertTriangle,
  ArrowUpDown,
  Loader2,
  Lock,
  Plus,
} from "lucide-react";

import { StatsCard } from "@/components/shared/StatsCard";

import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductRow } from "@/components/products/ProductRow";
import { ExportProducts } from "@/components/products/ExportProducts";
import { Pagination } from "@/components/shared/Pagination";
import ProductsLoading from "./loading";
import { ProductsSkeleton } from "@/components/shared/skeletons/ProductsSkeleton";
import { EmptyState, FilteredEmptyState } from "@/components/shared/EmptyState";
import { RequireVerification } from "@/components/shared/RequireVerification";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useToast } from "@/hooks/use-toast";

// ---------------- TYPES ----------------
export type Product = {
  id: string;
  name: string;
  description?: string;
  image_url: string | null;
  images?: string[];
  category?: string;
  cost_price: number;
  selling_price: number;
  stock_quantity?: number;
  stock_status: "in_stock" | "low_stock" | "out_of_stock";
  sku?: string;
  created_at?: string;
};


// ---------------------------------------------------------
export function ProductsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const [businessName, setBusinessName] = useState<string>('ResellerPro');
  const { toast } = useToast();

  const { canCreateProduct, subscription } = usePlanLimits();
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

  // Extract params
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";
  const view = (searchParams.get("view") || "grid") as "grid" | "list";

  // Query string for react-query
  const params = new URLSearchParams(searchParams.toString());
  params.set('page', page.toString());
  params.set('limit', '20');
  const qs = params.toString();

  // Fetch products from API route
  const { data: productsData, isLoading } = useProducts(qs);

  const products = productsData?.data || [];
  const totalCount = productsData?.total || 0;
  const totalPages = Math.ceil(totalCount / 20);

  // 👇 Give products a strong type
  const typedProducts: Product[] = products;

  // -------------------- STATS --------------------
  // -------------------- STATS --------------------
  // Global Stats (Server-side)
  const { data: statsData } = useProductsStats();

  const stats = {
    total: totalCount, // Filtered count
    inStock: statsData?.inStock || 0,
    lowStock: statsData?.lowStock || 0,
    outOfStock: statsData?.outOfStock || 0,
    totalValue: statsData?.totalValue || 0,
    totalProfit: statsData?.totalProfit || 0,
    avgMargin: statsData?.avgMargin || 0,
  };

  // -------------------- URL UPDATE --------------------
  const updateURL = (params: Record<string, string>) => {
    setPage(1);
    const np = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (!value) np.delete(key);
      else np.set(key, value);
    });

    startTransition(() => {
      router.push(`/products?${np.toString()}`);
    });
  };



  // -------------------- UI --------------------
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your products and inventory</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <ExportProducts
            products={typedProducts}
            businessName={businessName}
            className="w-full sm:w-auto"
          />
          {canCreateProduct ? (
            <RequireVerification>
              <Button asChild className="w-full sm:w-auto">
                <Link href="/products/new">+ Add Product</Link>
              </Button>
            </RequireVerification>
          ) : (
            <Button
              className="w-full sm:w-auto gap-2 border-dashed text-muted-foreground opacity-80 hover:bg-background"
              variant="outline"
              onClick={() => {
                toast({
                  title: "Limit Reached 🔒",
                  description: `You've reached your product limit on the ${planName}. Upgrade to grow your business!`,
                  variant: "default",
                  action: <Link href="/settings/subscription" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3">Upgrade</Link>
                })
              }}
            >
              <Lock className="mr-2 h-4 w-4" /> Add Product
            </Button>
          )}
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Products"
          value={stats.total}
          icon={Package}
          description="Active in inventory"
        />
        <StatsCard
          title="Inventory Value"
          value={`₹${stats.totalValue.toLocaleString()}`}
          icon={IndianRupee}
          description="Total cost value"
        />
        <StatsCard
          title="Total Profit"
          value={`₹${stats.totalProfit.toLocaleString()}`}
          icon={TrendingUp}
          description="Potential earnings"
        />
        <StatsCard
          title="Stock Alerts"
          value={stats.lowStock + stats.outOfStock}
          icon={AlertTriangle}
          description="Low/Out of stock"
        />
      </div>

      {/* SEARCH + FILTERS */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">

            {/* Search */}
            <div className="flex-1 w-full">
              <Input
                defaultValue={search}
                className="w-full"
                placeholder="Search products by name or SKU..."
                onChange={(e) => updateURL({ search: e.target.value })}
              />
            </div>

            {/* Filters Group */}
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
              {/* Category */}
              <Select
                value={category || "all"}
                onValueChange={(v) => updateURL({ category: v })}
              >
                <SelectTrigger className="w-[130px] sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out Of Stock</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    <span className="hidden sm:inline">Sort</span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => updateURL({ sort: "-created_at" })}>
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateURL({ sort: "created_at" })}>
                    Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateURL({ sort: "name" })}>
                    Name (A-Z)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Switch */}
              <div className="flex border rounded-lg p-1">
                <Button
                  variant={view === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  className="px-2"
                  onClick={() => updateURL({ view: "grid" })}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>

                <Button
                  variant={view === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className="px-2"
                  onClick={() => updateURL({ view: "list" })}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PRODUCTS DISPLAY */}
      {isLoading ? (
        <ProductsSkeleton view={view} />
      ) : typedProducts.length === 0 ? (
        search || category ? (
          <FilteredEmptyState
            onClearFilters={() => {
              updateURL({ search: "", category: "" });
            }}
          />
        ) : (
          <EmptyState
            icon={Package}
            title="No products yet"
            description="Start adding products to your inventory to track stock and manage sales."
            action={{
              label: "Add Product",
              href: "/products/new"
            }}
            requireVerification={true}
          />
        )
      ) : view === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {typedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="divide-y p-0">
            {typedProducts.map((p) => (
              <ProductRow key={p.id} product={p} />
            ))}
          </CardContent>
        </Card>
      )}
      {/* PAGINATION */}
      {products.length > 0 && (
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
