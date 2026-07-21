-- 🚀 RESELLERPRO STOREFRONT & CRM RENOVATION MIGRATION
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/jhzywjqbpnonkxwvwstx/editor/sql

-- 1. UPDATE PROFILES TABLE
-- Add store management fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS shop_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS shop_status VARCHAR(20) DEFAULT 'open' CHECK (shop_status IN ('open', 'closed', 'paused')),
ADD COLUMN IF NOT EXISTS shop_logo_url TEXT,
ADD COLUMN IF NOT EXISTS shop_banner_url TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS upi_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS shop_announcement TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'advanced')),
ADD COLUMN IF NOT EXISTS plan_order_limit INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS plan_product_limit INTEGER DEFAULT 10;

-- 2. UPDATE ORDERS TABLE
-- Add storefront order details and shipping fields
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'storefront' CHECK (source IN ('storefront', 'manual', 'smart_paste')),
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS shipping_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS shipping_line1 TEXT,
ADD COLUMN IF NOT EXISTS shipping_line2 TEXT,
ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_pincode VARCHAR(10),
ADD COLUMN IF NOT EXISTS payment_method_v2 VARCHAR(20) DEFAULT 'cod' CHECK (payment_method_v2 IN ('cod', 'upi', 'online')),
ADD COLUMN IF NOT EXISTS payment_status_v2 VARCHAR(20) DEFAULT 'pending' CHECK (payment_status_v2 IN ('pending', 'confirmed', 'failed', 'refunded')),
ADD COLUMN IF NOT EXISTS order_notes TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);

-- 3. UPDATE ORDER_ITEMS TABLE
-- Add product image and storefront price fields
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS product_image TEXT,
ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_price NUMERIC(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED;

-- 4. CREATE STORE_ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS public.store_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id VARCHAR(100) NOT NULL,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('view_home', 'view_product', 'add_to_cart', 'checkout_start', 'checkout_complete', 'whatsapp_click')),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  referrer TEXT,
  device_type VARCHAR(20),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREATE CART_SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.cart_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_slug VARCHAR(100) NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.store_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_sessions ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES FOR PUBLIC STOREFRONT ACCESS
-- Profiles: Allow anyone to view profiles (public storefront loads profile by slug)
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
CREATE POLICY "Allow public read access to profiles"
  ON public.profiles FOR SELECT TO public USING (true);

-- Products: Allow anyone to view products (public storefront displays products)
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products"
  ON public.products FOR SELECT TO public USING (true);

-- Orders: Allow public inserts (public checkout inserts new order)
DROP POLICY IF EXISTS "Allow public inserts on orders" ON public.orders;
CREATE POLICY "Allow public inserts on orders"
  ON public.orders FOR INSERT TO public WITH CHECK (true);

-- Order Items: Allow public inserts (public checkout inserts items)
DROP POLICY IF EXISTS "Allow public inserts on order_items" ON public.order_items;
CREATE POLICY "Allow public inserts on order_items"
  ON public.order_items FOR INSERT TO public WITH CHECK (true);

-- Store Analytics: Allow public inserts (client logs analytics)
DROP POLICY IF EXISTS "Allow public inserts on store_analytics" ON public.store_analytics;
CREATE POLICY "Allow public inserts on store_analytics"
  ON public.store_analytics FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow sellers full access to their analytics" ON public.store_analytics;
CREATE POLICY "Allow sellers full access to their analytics"
  ON public.store_analytics FOR ALL TO public USING (auth.uid() = user_id);

-- Cart Sessions: Allow public management by session_id
DROP POLICY IF EXISTS "Allow public management of cart sessions" ON public.cart_sessions;
CREATE POLICY "Allow public management of cart sessions"
  ON public.cart_sessions FOR ALL TO public USING (true) WITH CHECK (true);
