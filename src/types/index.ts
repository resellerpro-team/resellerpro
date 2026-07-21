// src/types/index.ts
// Centralised type definitions for ResellerPro

// ─── Enums / Literals ───────────────────────────────────────────────────────

export type SubscriptionPlan = 'free' | 'pro' | 'premium'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired'
export type CustomerType = 'vip' | 'active' | 'inactive'
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'
export type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded'
export type PaymentMethod = 'cod' | 'upi' | 'online'
export type StoreStatus = 'open' | 'closed' | 'paused'
// ─── Shop Theme ──────────────────────────────────────────────────────────────

export interface ShopTheme {
  primaryColor: string
  accentColor: string
  layout: 'grid' | 'list'
  preset: 'midnight' | 'rose' | 'mint' | 'ocean'
  // Advanced (existing)
  colorScheme?: 'light' | 'dark' | 'auto'
  buttonStyle?: 'rounded' | 'pill' | 'sharp'
  fontFamily?: string
  heroEnabled?: boolean
  heroTitle?: string
  heroSubtitle?: string
  heroCtaText?: string
  heroCtaLink?: string
  heroBgColor?: string
  heroPattern?: 'none' | 'dots' | 'waves' | 'gradient'
  heroImageUrl?: string
  heroBackgroundImage?: string

  announcementEnabled?: boolean
  announcementText?: string
  testimonialsEnabled?: boolean
  testimonials?: Array<{ name: string; text: string; rating: number }>
  trustBadgesEnabled?: boolean
  trustBadges?: string[]
  chatWidgetEnabled?: boolean
  chatWidgetMessage?: string
  categoryShowcase?: boolean
  showPrices?: boolean
  showWhatsApp?: boolean
  headerStyle?: 'standard' | 'centered' | 'minimal'
  socialInstagram?: string
  socialFacebook?: string
  socialTwitter?: string
  socialWhatsApp?: string
  seoTitle?: string
  seoDescription?: string
  ctaSectionEnabled?: boolean
  ctaImageUrl?: string
  ctaTitle?: string
  ctaSubtitle?: string
  ctaLink?: string
  ctaBtnText?: string
  footerAbout?: string
  footerEmail?: string
  footerPhone?: string
  footerAddress?: string
  returnPolicy?: string
  shippingInfo?: string
  customCss?: string
  vacationMessage?: string
  storeStatus?: 'open' | 'vacation' | 'closed'
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  full_name: string | null
  business_name: string | null
  shop_name: string | null
  shop_slug: string | null
  shop_description: string | null
  shop_status: StoreStatus
  shop_theme: ShopTheme | null
  shop_logo_url: string | null
  shop_banner_url: string | null
  whatsapp_number: string | null
  upi_id: string | null
  shop_announcement: string | null
  onboarding_completed: boolean
  onboarding_step: number
  plan: 'free' | 'starter' | 'pro' | 'advanced'
  plan_order_limit: number
  plan_product_limit: number
  email?: string | null
  phone?: string | null
  avatar_url?: string | null
  email_verified?: boolean
  business_email?: string | null
  business_phone?: string | null
  created_at: string
  updated_at: string
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface Product {
  id: string
  user_id: string
  name: string
  description: string | null
  category: string | null
  sku: string | null
  image_url: string | null
  images?: string[]
  cost_price: number
  selling_price: number
  price?: number // alias for selling_price on storefront
  compare_at_price?: number | null
  profit: number
  profit_margin: number
  stock_status: StockStatus
  stock_quantity: number
  track_inventory?: boolean
  is_active: boolean
  tags?: string[]
  created_at: string
  updated_at: string
}

// ─── Customer ────────────────────────────────────────────────────────────────

export interface Customer {
  id: string
  user_id: string
  name: string
  phone: string
  email?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  pincode?: string | null
  customer_type: CustomerType
  total_orders: number
  total_spent: number
  notes?: string | null
  created_at: string
  updated_at: string
}

// ─── Order ───────────────────────────────────────────────────────────────────

export interface Order {
  id: string
  user_id: string
  order_number: string | number
  source: 'storefront' | 'manual' | 'smart_paste'
  status: OrderStatus
  // Storefront customer info
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  // Shipping
  shipping_name: string | null
  shipping_phone: string | null
  shipping_line1: string | null
  shipping_line2: string | null
  shipping_city: string | null
  shipping_state: string | null
  shipping_pincode: string | null
  // Payment
  payment_method_v2: PaymentMethod
  payment_status_v2: PaymentStatus
  // Totals (storefront)
  subtotal: number
  shipping_fee: number
  total_amount: number
  // Legacy CRM fields
  total?: number
  total_profit?: number
  profit?: number
  shipping_cost?: number
  discount?: number
  payment_method?: string
  payment_status?: string
  customer_id?: string | null
  // Status tracking
  order_notes: string | null
  whatsapp_sent: boolean
  tracking_number: string | null
  confirmed_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
  // Relations
  order_items?: OrderItem[]
  customer?: Customer
}

// ─── Order Item ───────────────────────────────────────────────────────────────

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_image: string | null
  variant_name: string | null
  quantity: number
  unit_price: number
  total_price: number
  created_at?: string
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string
  name: string
  price: number
  image: string | null
  quantity: number
  variantName?: string
  stockQuantity?: number
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

export interface CheckoutFormData {
  fullName: string
  phone: string
  email?: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  paymentMethod: PaymentMethod
  orderNotes?: string
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export type AnalyticsEventType =
  | 'store_view'
  | 'product_view'
  | 'add_to_cart'
  | 'checkout_start'
  | 'checkout_complete'
  | 'whatsapp_click'

export interface StoreAnalyticsEvent {
  userId: string
  sessionId?: string
  eventType: AnalyticsEventType
  productId?: string
  orderId?: string
  referrer?: string
  deviceType?: string
  metadata?: Record<string, unknown>
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalCustomers: number
  totalOrders: number
  totalRevenue: number
  totalProfit: number
  pendingOrders: number
  todayRevenue?: number
  todayProfit?: number
  revenueChange?: number
  profitChange?: number
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

// ─── API Helpers ──────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
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

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface OrderFilters {
  search?: string
  status?: OrderStatus
  payment_status?: PaymentStatus
  customer_id?: string
  date_from?: string
  date_to?: string
  source?: 'storefront' | 'manual' | 'smart_paste'
  payment_method?: PaymentMethod
}

export interface ProductFilters {
  search?: string
  category?: string
  stock_status?: StockStatus
  min_price?: number
  max_price?: number
}

export interface CustomerFilters {
  search?: string
  customer_type?: CustomerType
  min_orders?: number
  min_spent?: number
}

// ─── Analytics Chart Data ─────────────────────────────────────────────────────

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

// ─── Enquiries ───────────────────────────────────────────────────────────────

export interface Enquiry {
  id: string
  user_id?: string
  customer_name: string
  phone: string
  message: string
  status: 'new' | 'needs_follow_up' | 'converted' | 'dropped'
  created_at: string
  last_updated?: string
  source?: string
  product_name?: string | null
  follow_up_date?: string | null
  follow_up_notes?: string | null
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  last_contacted_at?: string | null
  follow_up_count?: number
}

export interface FollowUpActivity {
  id: string
  enquiry_id: string
  user_id: string
  action: 'whatsapp_sent' | 'called' | 'note_added' | 'status_changed' | 'follow_up_scheduled'
  note?: string | null
  whatsapp_message?: string | null
  created_at: string
}
