import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json([]);

  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "-created_at";
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  let query = supabase
    .from("products")
    .select("*", { count: 'exact' })
    .eq("user_id", user.id);

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,sku.ilike.%${search}%,category.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  if (category && category !== "all") {
    if (category === "low_stock") query = query.eq("stock_status", "low_stock");
    else if (category === "out_of_stock") query = query.eq("stock_status", "out_of_stock");
    else query = query.eq("category", category);
  }

  const sortAsc = !sort.startsWith("-");
  const sortField = sort.replace("-", "");
  query = query.order(sortField, { ascending: sortAsc });

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query;

  if (error) return NextResponse.json({ data: [], total: 0, page, limit });

  return NextResponse.json({
    data,
    total: count,
    page,
    limit
  });
}
