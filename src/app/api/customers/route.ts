import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const { error } = await supabase.from('customers').insert({
      user_id: user.id,
      ...body,
    });

    if (error) {
      console.error('Customer creation error:', error);
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A customer with this phone number already exists.' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Customer created successfully' });
  } catch (error) {
    console.error('POST /api/customers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json([]);

  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "-created_at";
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  let query = supabase
    .from("customers")
    .select("*", { count: 'exact' })
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

  // Handle specific sort cases if needed, but Supabase handles standard fields
  query = query.order(sortField, { ascending: sortAsc });

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query;

  if (error) {
    console.error("Customer API error:", error);
    return NextResponse.json({ data: [], total: 0, page, limit });
  }

  return NextResponse.json({
    data,
    total: count,
    page,
    limit
  });
}
