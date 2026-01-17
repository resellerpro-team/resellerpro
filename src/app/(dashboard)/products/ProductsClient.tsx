"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProducts } from "@/lib/react-query/hooks/useProducts";

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
} from "lucide-react";

import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductRow } from "@/components/products/ProductRow";
import { ExportProducts } from "@/components/products/ExportProducts";
import ProductsLoading from "./loading";

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

  // Extract params
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";
  const view = (searchParams.get("view") || "grid") as "grid" | "list";

  // Query string for react-query
  const qs = searchParams.toString();

  // Fetch products from API route
  const { data: products = [], isLoading } = useProducts(qs);

  // 👇 Give products a strong type
  const typedProducts: Product[] = products;

  // -------------------- STATS --------------------
  const stats = {
    total: typedProducts.length,

    inStock: typedProducts.filter(
      (p: Product) => p.stock_status === "in_stock"
    ).length,

    lowStock: typedProducts.filter(
      (p: Product) => p.stock_status === "low_stock"
    ).length,

    outOfStock: typedProducts.filter(
      (p: Product) => p.stock_status === "out_of_stock"
    ).length,

    totalValue: typedProducts.reduce((acc: number, p: Product) => {
      return acc + p.selling_price * (p.stock_quantity || 0);
    }, 0),

    totalProfit: typedProducts.reduce((acc: number, p: Product) => {
      return acc + (p.selling_price - p.cost_price) * (p.stock_quantity || 0);
    }, 0),

    avgMargin:
      typedProducts.length === 0
        ? 0
        : (
          typedProducts.reduce((acc: number, p: Product) => {
            const margin =
              ((p.selling_price - p.cost_price) / p.selling_price) * 100;
            return acc + margin;
          }, 0) / typedProducts.length
        ).toFixed(1),
  };

  // -------------------- URL UPDATE --------------------
  const updateURL = (params: Record<string, string>) => {
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>

        <div className="flex gap-2">
          <ExportProducts products={typedProducts} />

          <Button asChild>
            <Link href="/products/new">+ Add Product</Link>
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatsCard title="Total" value={stats.total} icon={Package} />
        <StatsCard
          title="Inventory Value"
          value={`₹${stats.totalValue.toLocaleString()}`}
          icon={IndianRupee}
        />
        <StatsCard
          title="Total Profit"
          value={`₹${stats.totalProfit.toLocaleString()}`}
          icon={TrendingUp}
        />
        <StatsCard
          title="Stock Alerts"
          value={stats.lowStock + stats.outOfStock}
          icon={AlertTriangle}
        />
      </div>

      {/* SEARCH + FILTERS */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">

            {/* Search */}
            <Input
              defaultValue={search}
              className="flex-1"
              placeholder="Search..."
              onChange={(e) => updateURL({ search: e.target.value })}
            />

            {/* Category */}
            <Select
              value={category || "all"}
              onValueChange={(v) => updateURL({ category: v })}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out Of Stock</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => updateURL({ sort: "-created_at" })}
                >
                  Newest First
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => updateURL({ sort: "created_at" })}
                >
                  Oldest First
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => updateURL({ sort: "name" })}
                >
                  Name (A-Z)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Switch */}
            <div className="flex border rounded-lg p-1">
              <Button
                variant={view === "grid" ? "secondary" : "ghost"}
                onClick={() => updateURL({ view: "grid" })}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>

              <Button
                variant={view === "list" ? "secondary" : "ghost"}
                onClick={() => updateURL({ view: "list" })}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PRODUCTS DISPLAY */}
      {isLoading ? (
        <ProductsLoading />
      ) : typedProducts.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">
          No products found.
        </p>
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
    </div>
  );
}

// ---------------- STATS CARD ----------------
function StatsCard({
  title,
  icon: Icon,
  value,
}: {
  title: string;
  icon: any;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex flex-col gap-2">
        <div className="flex justify-between">
          <p className="text-sm">{title}</p>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
