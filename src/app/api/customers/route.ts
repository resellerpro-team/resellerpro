import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user }} = await supabase.auth.getUser();

  if (!user) return NextResponse.json([]);

  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "-created_at";

  let query = supabase
    .from("customers")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_deleted", false);

  // 🔍 Search filter
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  // 🔽 Sorting
  const sortAsc = !sort.startsWith("-");
  const sortField = sort.replace("-", "");

  query = query.order(sortField, { ascending: sortAsc });

  const { data, error } = await query;

  if (error) {
    console.error("Customer API error:", error);
    return NextResponse.json([]);
  }

  return NextResponse.json(data);
}
