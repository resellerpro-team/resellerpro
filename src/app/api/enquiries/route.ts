import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// MOCK DATA for initial development
const MOCK_ENQUIRIES = [
    {
        id: "1",
        customer_name: "Rahul Kumar",
        phone: "+91 98765 43210",
        message: "Hi, what is the best price for 50 pieces of the Cotton Shirt?",
        status: "new",
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        last_updated: new Date().toISOString(),
    },
    {
        id: "2",
        customer_name: "Priya Singh",
        phone: "+91 91234 56789",
        message: "Do you have this in Blue color?",
        status: "needs_follow_up",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        last_updated: new Date().toISOString(),
    },
    {
        id: "3",
        customer_name: "Amit Sharma",
        phone: "+91 99887 76655",
        message: "I want to place an order for 10 units.",
        status: "converted",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        last_updated: new Date().toISOString(),
    },
    {
        id: "4",
        customer_name: "Sneha Gupta",
        phone: "+91 88776 65544",
        message: "Is COD available?",
        status: "dropped",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        last_updated: new Date().toISOString(),
    },
];

export async function GET(req: Request) {
    // UNCOMMENT when DB table is ready
    /*
    const supabase = await createClient();
    const { data: { user }} = await supabase.auth.getUser();
  
    if (!user) return NextResponse.json([]);
  
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const sort = searchParams.get("sort") || "-created_at";
  
    let query = supabase
      .from("enquiries")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_deleted", false);
  
    if (search) {
      query = query.or(`customer_name.ilike.%${search}%,phone.ilike.%${search}%,message.ilike.%${search}%`);
    }
  
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
  
    const sortAsc = !sort.startsWith("-");
    const sortField = sort.replace("-", "");
    query = query.order(sortField, { ascending: sortAsc });
  
    const { data, error } = await query;
    if (error) return NextResponse.json([]);
    return NextResponse.json(data);
    */

    // RETURN MOCK DATA
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase();
    const status = searchParams.get("status");

    let filtered = [...MOCK_ENQUIRIES];

    if (search) {
        filtered = filtered.filter(e =>
            e.customer_name.toLowerCase().includes(search) ||
            e.phone.includes(search) ||
            e.message.toLowerCase().includes(search)
        );
    }

    if (status && status !== "all") {
        filtered = filtered.filter(e => e.status === status);
    }

    return NextResponse.json(filtered);
}
