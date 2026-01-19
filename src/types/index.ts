export interface Customer {
    id?: string;
    name: string;
    phone?: string;
    email?: string;
    total_orders?: number;
    total_spent?: number;
    last_order_date?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    created_at?: string;
}

export interface Order {
    id?: string;
    order_number: string;
    created_at: string;
    customers?: Customer;
    total_amount: number;
    profit?: number;
    cost_price?: number;
    total_cost?: number;
    status: string;
    payment_status: string;
    payment_method: string;
    notes?: string;
    order_items?: OrderItem[];
}

export interface OrderItem {
    quantity: number;
    products?: Product;
}

export interface Product {
    name: string;
    cost_price: number;
    selling_price: number;
    stock_quantity?: number;
    stock_status: string;
    category?: string;
    sku?: string;
}

export interface Enquiry {
    id: string;
    customer_name: string;
    phone: string;
    message: string;
    status: "new" | "needs_follow_up" | "converted" | "dropped";
    product_name?: string;
    created_at: string;
    last_updated: string;
    source?: string;
}
