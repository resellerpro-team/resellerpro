// src/types/models.ts

export type SubscriptionPlan = 'free' | 'pro' | 'premium'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired'
export type CustomerType = 'vip' | 'active' | 'inactive'
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'cod' | 'failed'

export interface Profile {
  id: string
  full_name: string
  business_name?: string
  phone?: string
  email: string
  avatar_url?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  gst_number?: string
  subscription_plan: SubscriptionPlan
  subscription_status: SubscriptionStatus
  subscription_ends_at?: string
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  user_id: string
  name: string
  phone: string
  email?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  customer_type: CustomerType
  total_orders: number
  total_spent: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  user_id: string
  name: string
  description?: string
  category?: string
  sku?: string
  image_url?: string
  cost_price: number
  selling_price: number
  profit: number
  profit_margin: number
  stock_status: StockStatus
  stock_quantity: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  profit: number
  total_amount: number
  id: string
  order_number: string
  user_id: string
  customer_id?: string
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method?: string
  subtotal: number
  shipping_cost: number
  discount: number
  total: number
  total_profit: number
  shipping_address?: string
  shipping_city?: string
  shipping_state?: string
  shipping_pincode?: string
  tracking_number?: string
  notes?: string
  created_at: string
  updated_at: string
  shipped_at?: string
  delivered_at?: string
  
  // Relations
  customer?: Customer
  items?: OrderItem[]
  status_history?: OrderStatusHistory[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  product_name: string
  product_sku?: string
  quantity: number
  cost_price: number
  selling_price: number
  item_profit: number
  created_at: string
  
  // Relations
  product?: Product
}

export interface OrderStatusHistory {
  id: string
  order_id: string
  status: string
  notes?: string
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  action: string
  entity_type?: string
  entity_id?: string
  metadata?: Record<string, any>
  created_at: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Dashboard Stats
export interface DashboardStats {
  totalCustomers: number
  totalOrders: number
  totalRevenue: number
  totalProfit: number
  pendingOrders: number
  monthlyGrowth: {
    customers: number
    orders: number
    revenue: number
  }
  topProducts: Array<{
    id: string
    name: string
    sales: number
    revenue: number
  }>
  topCustomers: Array<{
    id: string
    name: string
    orders: number
    spent: number
  }>
  recentOrders: Order[]
}

// Analytics Types
export interface RevenueChartData {
  date: string
  revenue: number
  profit: number
  orders: number
}

export interface CategoryBreakdown {
  category: string
  sales: number
  revenue: number
  percentage: number
}

// Form Types
export interface CreateCustomerInput {
  name: string
  phone: string
  email?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  notes?: string
}

export interface CreateProductInput {
  name: string
  description?: string
  category?: string
  sku?: string
  image_url?: string
  cost_price: number
  selling_price: number
  stock_status?: StockStatus
  stock_quantity?: number
}

export interface CreateOrderInput {
  customer_id?: string
  items: Array<{
    product_id?: string
    product_name: string
    quantity: number
    cost_price: number
    selling_price: number
  }>
  payment_method?: string
  payment_status?: PaymentStatus
  shipping_address?: string
  shipping_city?: string
  shipping_state?: string
  shipping_pincode?: string
  shipping_cost?: number
  discount?: number
  notes?: string
}

export interface UpdateOrderStatusInput {
  status: OrderStatus
  notes?: string
  tracking_number?: string
}

// Filters
export interface CustomerFilters {
  search?: string
  customer_type?: CustomerType
  min_orders?: number
  min_spent?: number
}

export interface ProductFilters {
  search?: string
  category?: string
  stock_status?: StockStatus
  min_price?: number
  max_price?: number
}

export interface OrderFilters {
  search?: string
  status?: OrderStatus
  payment_status?: PaymentStatus
  customer_id?: string
  date_from?: string
  date_to?: string
}

// src/types/api.ts
export interface GetCustomersParams {
  page?: number
  limit?: number
  filters?: CustomerFilters
}

export interface GetProductsParams {
  page?: number
  limit?: number
  filters?: ProductFilters
}

export interface GetOrdersParams {
  page?: number
  limit?: number
  filters?: OrderFilters
}

export interface AnalyticsParams {
  date_from?: string
  date_to?: string
  interval?: 'day' | 'week' | 'month'
}