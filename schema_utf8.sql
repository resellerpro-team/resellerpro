create extension if not exists "pg_cron" with schema "pg_catalog";

drop extension if exists "pg_net";

create sequence "public"."order_number_seq";

create sequence "public"."orders_order_number_seq";


  create table "public"."auth_otps" (
    "id" uuid not null default gen_random_uuid(),
    "email" text not null,
    "otp_code" text not null,
    "expires_at" timestamp with time zone not null,
    "verified" boolean default false,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."auth_otps" enable row level security;


  create table "public"."customers" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "name" text not null,
    "phone" text not null,
    "whatsapp" text,
    "email" text,
    "address_line1" text,
    "address_line2" text,
    "city" text,
    "state" text,
    "pincode" text,
    "notes" text,
    "total_orders" integer default 0,
    "total_spent" numeric(10,2) default 0,
    "last_order_date" timestamp with time zone,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone default timezone('utc'::text, now()),
    "is_deleted" boolean default false,
    "deleted_at" timestamp without time zone
      );


alter table "public"."customers" enable row level security;


  create table "public"."email_logs" (
    "id" uuid not null default gen_random_uuid(),
    "recipient" text not null,
    "template_id" text not null,
    "status" text not null,
    "error" text,
    "metadata" jsonb,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."email_logs" enable row level security;


  create table "public"."enquiries" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "customer_name" text,
    "phone" text,
    "message" text not null,
    "source" text default 'whatsapp'::text,
    "status" text default 'new'::text,
    "customer_id" uuid,
    "order_id" uuid,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone default timezone('utc'::text, now()),
    "is_deleted" boolean default false,
    "deleted_at" timestamp with time zone,
    "followup_date" date,
    "followup_notified" boolean default false
      );


alter table "public"."enquiries" enable row level security;


  create table "public"."login_attempts" (
    "id" uuid not null default gen_random_uuid(),
    "email" text,
    "ip_address" text,
    "created_at" timestamp without time zone default now()
      );



  create table "public"."notifications" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "type" text not null,
    "priority" text default 'normal'::text,
    "title" text not null,
    "message" text not null,
    "entity_type" text,
    "entity_id" uuid,
    "is_read" boolean default false,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."notifications" enable row level security;


  create table "public"."order_items" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "order_id" uuid not null,
    "product_id" uuid,
    "product_name" text not null,
    "quantity" integer not null,
    "unit_cost_price" numeric(10,2) not null default 0,
    "unit_selling_price" numeric(10,2) not null default 0,
    "subtotal" numeric(10,2) generated always as (((quantity)::numeric * unit_selling_price)) stored,
    "profit" numeric(10,2) generated always as (((unit_selling_price - unit_cost_price) * (quantity)::numeric)) stored
      );


alter table "public"."order_items" enable row level security;


  create table "public"."order_status_history" (
    "id" uuid not null default gen_random_uuid(),
    "order_id" uuid,
    "status" text not null,
    "notes" text,
    "courier_service" text,
    "tracking_number" text,
    "changed_by" uuid,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."order_status_history" enable row level security;


  create table "public"."orders" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "customer_id" uuid,
    "order_number" integer not null default nextval('public.orders_order_number_seq'::regclass),
    "status" text default 'pending'::text,
    "subtotal" numeric(10,2) not null,
    "delivery_charge" numeric(10,2) default 0,
    "discount" numeric(10,2) default 0,
    "total_amount" numeric(10,2) not null,
    "total_cost" numeric(10,2) not null,
    "total_profit" numeric(10,2) generated always as ((total_amount - total_cost)) stored,
    "payment_status" text default 'pending'::text,
    "payment_method" text,
    "notes" text,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone default timezone('utc'::text, now()),
    "shipping_cost" numeric(10,2) default 0,
    "tax" numeric(10,2) default 0,
    "shipping_address" jsonb,
    "tracking_number" character varying(100),
    "courier_service" character varying(100),
    "internal_notes" text,
    "delivered_at" timestamp without time zone,
    "profit" numeric(10,2) generated always as ((total_amount - total_cost)) stored
      );


alter table "public"."orders" enable row level security;


  create table "public"."payment_transactions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "subscription_id" uuid,
    "razorpay_payment_id" character varying(100),
    "razorpay_order_id" character varying(100),
    "razorpay_signature" character varying(255),
    "amount" numeric(10,2) not null,
    "currency" character varying(3) default 'INR'::character varying,
    "status" character varying(20) default 'pending'::character varying,
    "payment_method" character varying(50),
    "error_message" text,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."payment_transactions" enable row level security;


  create table "public"."products" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "name" text not null,
    "description" text,
    "image_url" text,
    "category" text,
    "cost_price" numeric(10,2) not null,
    "selling_price" numeric(10,2) not null,
    "profit_per_unit" numeric(10,2) generated always as ((selling_price - cost_price)) stored,
    "profit_margin" numeric(5,2) generated always as (
CASE
    WHEN (selling_price > (0)::numeric) THEN (((selling_price - cost_price) / selling_price) * (100)::numeric)
    ELSE (0)::numeric
END) stored,
    "stock_status" text default 'in_stock'::text,
    "total_sold" integer default 0,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone default timezone('utc'::text, now()),
    "stock_quantity" integer default 0,
    "sku" character varying(100),
    "low_stock_threshold" integer default 10,
    "images" text[] default '{}'::text[]
      );


alter table "public"."products" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "full_name" text,
    "business_name" text,
    "avatar_url" text,
    "phone" text,
    "email" text,
    "updated_at" timestamp with time zone default timezone('utc'::text, now()),
    "gstin" text,
    "business_address" text,
    "business_phone" text,
    "business_email" text,
    "business_website" text,
    "pan_number" text,
    "role" text default 'user'::text,
    "referral_code" text,
    "wallet_balance" numeric not null default 0,
    "is_referral_rewarded" boolean not null default false,
    "referral_processed_at" timestamp with time zone
      );


alter table "public"."profiles" enable row level security;


  create table "public"."referrals" (
    "id" uuid not null default gen_random_uuid(),
    "referrer_id" uuid not null,
    "referee_id" uuid not null,
    "status" text not null default 'pending'::text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."referrals" enable row level security;


  create table "public"."signup_ip_log" (
    "id" uuid not null default gen_random_uuid(),
    "ip_address" text not null,
    "created_at" timestamp with time zone not null default now()
      );



  create table "public"."subscription_plans" (
    "id" uuid not null default gen_random_uuid(),
    "name" character varying(50) not null,
    "display_name" character varying(100) not null,
    "price" numeric(10,2) not null default 0,
    "currency" character varying(3) default 'INR'::character varying,
    "billing_period" character varying(20) default 'monthly'::character varying,
    "order_limit" integer,
    "features" jsonb default '[]'::jsonb,
    "is_active" boolean default true,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "tag_line" text,
    "offer_price" numeric
      );


alter table "public"."subscription_plans" enable row level security;


  create table "public"."todos" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "text" text not null,
    "completed" boolean not null default false,
    "is_auto_generated" boolean not null default false,
    "source_type" text,
    "source_id" uuid,
    "priority" text default 'medium'::text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."todos" enable row level security;


  create table "public"."usage_tracking" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "resource_type" character varying(50) not null,
    "period_start" date not null,
    "period_end" date not null,
    "count" integer default 0,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."usage_tracking" enable row level security;


  create table "public"."user_subscriptions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "plan_id" uuid not null,
    "status" character varying(20) default 'active'::character varying,
    "razorpay_subscription_id" character varying(100),
    "razorpay_customer_id" character varying(100),
    "current_period_start" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "cancel_at_period_end" boolean default false,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "expiry_notified_at" timestamp with time zone
      );


alter table "public"."user_subscriptions" enable row level security;


  create table "public"."wallet_transactions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "amount" numeric not null,
    "type" text not null,
    "description" text not null,
    "created_at" timestamp with time zone not null default now(),
    "referral_id" uuid
      );


alter table "public"."wallet_transactions" enable row level security;

alter sequence "public"."orders_order_number_seq" owned by "public"."orders"."order_number";

CREATE UNIQUE INDEX auth_otps_pkey ON public.auth_otps USING btree (id);

CREATE UNIQUE INDEX customers_pkey ON public.customers USING btree (id);

CREATE UNIQUE INDEX customers_user_id_phone_key ON public.customers USING btree (user_id, phone);

CREATE UNIQUE INDEX email_logs_pkey ON public.email_logs USING btree (id);

CREATE INDEX enquiries_created_at_idx ON public.enquiries USING btree (created_at);

CREATE UNIQUE INDEX enquiries_pkey ON public.enquiries USING btree (id);

CREATE INDEX enquiries_status_idx ON public.enquiries USING btree (status);

CREATE INDEX enquiries_user_id_idx ON public.enquiries USING btree (user_id);

CREATE INDEX idx_customers_user_id ON public.customers USING btree (user_id);

CREATE INDEX idx_enquiries_followup_date_notified ON public.enquiries USING btree (followup_date, followup_notified) WHERE (followup_notified = false);

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at DESC);

CREATE INDEX idx_notifications_type ON public.notifications USING btree (type);

CREATE INDEX idx_notifications_user_id_is_read ON public.notifications USING btree (user_id, is_read);

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);

CREATE INDEX idx_order_status_history_created_at ON public.order_status_history USING btree (created_at DESC);

CREATE INDEX idx_order_status_history_order_id ON public.order_status_history USING btree (order_id);

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at DESC);

CREATE INDEX idx_orders_customer_id ON public.orders USING btree (customer_id);

CREATE INDEX idx_orders_status ON public.orders USING btree (status);

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);

CREATE INDEX idx_payment_transactions_user_id ON public.payment_transactions USING btree (user_id);

CREATE INDEX idx_products_user_id ON public.products USING btree (user_id);

CREATE INDEX idx_referrals_referee ON public.referrals USING btree (referee_id);

CREATE INDEX idx_referrals_referrer ON public.referrals USING btree (referrer_id);

CREATE INDEX idx_referrals_status ON public.referrals USING btree (status);

CREATE INDEX idx_usage_tracking_user_period ON public.usage_tracking USING btree (user_id, period_start, period_end);

CREATE INDEX idx_user_subscriptions_expiry_check ON public.user_subscriptions USING btree (current_period_end, expiry_notified_at);

CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions USING btree (status);

CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions USING btree (user_id);

CREATE INDEX idx_wallet_transactions_created ON public.wallet_transactions USING btree (created_at DESC);

CREATE INDEX idx_wallet_transactions_user ON public.wallet_transactions USING btree (user_id);

CREATE INDEX login_attempts_idx ON public.login_attempts USING btree (email, ip_address, created_at);

CREATE UNIQUE INDEX login_attempts_pkey ON public.login_attempts USING btree (id);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE UNIQUE INDEX order_items_pkey ON public.order_items USING btree (id);

CREATE UNIQUE INDEX order_status_history_pkey ON public.order_status_history USING btree (id);

CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id);

CREATE UNIQUE INDEX payment_transactions_pkey ON public.payment_transactions USING btree (id);

CREATE UNIQUE INDEX payment_transactions_razorpay_payment_id_key ON public.payment_transactions USING btree (razorpay_payment_id);

CREATE UNIQUE INDEX products_pkey ON public.products USING btree (id);

CREATE UNIQUE INDEX profiles_phone_unique ON public.profiles USING btree (phone);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX profiles_referral_code_key ON public.profiles USING btree (referral_code);

CREATE UNIQUE INDEX referrals_pkey ON public.referrals USING btree (id);

CREATE UNIQUE INDEX referrals_referee_id_key ON public.referrals USING btree (referee_id);

CREATE UNIQUE INDEX signup_ip_log_pkey ON public.signup_ip_log USING btree (id);

CREATE UNIQUE INDEX subscription_plans_name_key ON public.subscription_plans USING btree (name);

CREATE UNIQUE INDEX subscription_plans_pkey ON public.subscription_plans USING btree (id);

CREATE INDEX todos_completed_idx ON public.todos USING btree (completed);

CREATE INDEX todos_created_at_idx ON public.todos USING btree (created_at DESC);

CREATE UNIQUE INDEX todos_pkey ON public.todos USING btree (id);

CREATE INDEX todos_user_id_idx ON public.todos USING btree (user_id);

CREATE UNIQUE INDEX usage_tracking_pkey ON public.usage_tracking USING btree (id);

CREATE UNIQUE INDEX usage_tracking_user_id_resource_type_period_start_key ON public.usage_tracking USING btree (user_id, resource_type, period_start);

CREATE UNIQUE INDEX user_subscriptions_pkey ON public.user_subscriptions USING btree (id);

CREATE UNIQUE INDEX user_subscriptions_razorpay_subscription_id_key ON public.user_subscriptions USING btree (razorpay_subscription_id);

CREATE UNIQUE INDEX user_subscriptions_user_id_key ON public.user_subscriptions USING btree (user_id);

CREATE UNIQUE INDEX wallet_transactions_pkey ON public.wallet_transactions USING btree (id);

alter table "public"."auth_otps" add constraint "auth_otps_pkey" PRIMARY KEY using index "auth_otps_pkey";

alter table "public"."customers" add constraint "customers_pkey" PRIMARY KEY using index "customers_pkey";

alter table "public"."email_logs" add constraint "email_logs_pkey" PRIMARY KEY using index "email_logs_pkey";

alter table "public"."enquiries" add constraint "enquiries_pkey" PRIMARY KEY using index "enquiries_pkey";

alter table "public"."login_attempts" add constraint "login_attempts_pkey" PRIMARY KEY using index "login_attempts_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."order_items" add constraint "order_items_pkey" PRIMARY KEY using index "order_items_pkey";

alter table "public"."order_status_history" add constraint "order_status_history_pkey" PRIMARY KEY using index "order_status_history_pkey";

alter table "public"."orders" add constraint "orders_pkey" PRIMARY KEY using index "orders_pkey";

alter table "public"."payment_transactions" add constraint "payment_transactions_pkey" PRIMARY KEY using index "payment_transactions_pkey";

alter table "public"."products" add constraint "products_pkey" PRIMARY KEY using index "products_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."referrals" add constraint "referrals_pkey" PRIMARY KEY using index "referrals_pkey";

alter table "public"."signup_ip_log" add constraint "signup_ip_log_pkey" PRIMARY KEY using index "signup_ip_log_pkey";

alter table "public"."subscription_plans" add constraint "subscription_plans_pkey" PRIMARY KEY using index "subscription_plans_pkey";

alter table "public"."todos" add constraint "todos_pkey" PRIMARY KEY using index "todos_pkey";

alter table "public"."usage_tracking" add constraint "usage_tracking_pkey" PRIMARY KEY using index "usage_tracking_pkey";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_pkey" PRIMARY KEY using index "user_subscriptions_pkey";

alter table "public"."wallet_transactions" add constraint "wallet_transactions_pkey" PRIMARY KEY using index "wallet_transactions_pkey";

alter table "public"."customers" add constraint "customers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."customers" validate constraint "customers_user_id_fkey";

alter table "public"."customers" add constraint "customers_user_id_phone_key" UNIQUE using index "customers_user_id_phone_key";

alter table "public"."enquiries" add constraint "enquiries_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id) not valid;

alter table "public"."enquiries" validate constraint "enquiries_customer_id_fkey";

alter table "public"."enquiries" add constraint "enquiries_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) not valid;

alter table "public"."enquiries" validate constraint "enquiries_order_id_fkey";

alter table "public"."enquiries" add constraint "enquiries_source_check" CHECK ((source = ANY (ARRAY['whatsapp'::text, 'instagram'::text, 'manual'::text]))) not valid;

alter table "public"."enquiries" validate constraint "enquiries_source_check";

alter table "public"."enquiries" add constraint "enquiries_status_check" CHECK ((status = ANY (ARRAY['new'::text, 'needs_follow_up'::text, 'converted'::text, 'dropped'::text]))) not valid;

alter table "public"."enquiries" validate constraint "enquiries_status_check";

alter table "public"."enquiries" add constraint "enquiries_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."enquiries" validate constraint "enquiries_user_id_fkey";

alter table "public"."notifications" add constraint "notifications_entity_type_check" CHECK ((entity_type = ANY (ARRAY['enquiry'::text, 'product'::text, 'wallet'::text, 'subscription'::text, 'system'::text, 'referral'::text]))) not valid;

alter table "public"."notifications" validate constraint "notifications_entity_type_check";

alter table "public"."notifications" add constraint "notifications_priority_check" CHECK ((priority = ANY (ARRAY['high'::text, 'normal'::text, 'low'::text]))) not valid;

alter table "public"."notifications" validate constraint "notifications_priority_check";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."order_items" add constraint "order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE not valid;

alter table "public"."order_items" validate constraint "order_items_order_id_fkey";

alter table "public"."order_items" add constraint "order_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL not valid;

alter table "public"."order_items" validate constraint "order_items_product_id_fkey";

alter table "public"."order_items" add constraint "order_items_quantity_check" CHECK ((quantity > 0)) not valid;

alter table "public"."order_items" validate constraint "order_items_quantity_check";

alter table "public"."order_status_history" add constraint "order_status_history_changed_by_fkey" FOREIGN KEY (changed_by) REFERENCES auth.users(id) not valid;

alter table "public"."order_status_history" validate constraint "order_status_history_changed_by_fkey";

alter table "public"."order_status_history" add constraint "order_status_history_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE not valid;

alter table "public"."order_status_history" validate constraint "order_status_history_order_id_fkey";

alter table "public"."order_status_history" add constraint "order_status_history_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text]))) not valid;

alter table "public"."order_status_history" validate constraint "order_status_history_status_check";

alter table "public"."orders" add constraint "orders_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL not valid;

alter table "public"."orders" validate constraint "orders_customer_id_fkey";

alter table "public"."orders" add constraint "orders_payment_status_check" CHECK ((payment_status = ANY (ARRAY['unpaid'::text, 'paid'::text, 'cod'::text, 'refunded'::text]))) not valid;

alter table "public"."orders" validate constraint "orders_payment_status_check";

alter table "public"."orders" add constraint "orders_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text]))) not valid;

alter table "public"."orders" validate constraint "orders_status_check";

alter table "public"."orders" add constraint "orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."orders" validate constraint "orders_user_id_fkey";

alter table "public"."payment_transactions" add constraint "payment_transactions_razorpay_payment_id_key" UNIQUE using index "payment_transactions_razorpay_payment_id_key";

alter table "public"."payment_transactions" add constraint "payment_transactions_subscription_id_fkey" FOREIGN KEY (subscription_id) REFERENCES public.user_subscriptions(id) not valid;

alter table "public"."payment_transactions" validate constraint "payment_transactions_subscription_id_fkey";

alter table "public"."payment_transactions" add constraint "payment_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."payment_transactions" validate constraint "payment_transactions_user_id_fkey";

alter table "public"."products" add constraint "products_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."products" validate constraint "products_user_id_fkey";

alter table "public"."profiles" add constraint "gstin_format" CHECK (((gstin IS NULL) OR (gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'::text))) not valid;

alter table "public"."profiles" validate constraint "gstin_format";

alter table "public"."profiles" add constraint "pan_format" CHECK (((pan_number IS NULL) OR (pan_number ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'::text))) not valid;

alter table "public"."profiles" validate constraint "pan_format";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_phone_unique" UNIQUE using index "profiles_phone_unique";

alter table "public"."profiles" add constraint "profiles_referral_code_key" UNIQUE using index "profiles_referral_code_key";

alter table "public"."profiles" add constraint "profiles_role_check" CHECK ((role = ANY (ARRAY['user'::text, 'admin'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_role_check";

alter table "public"."referrals" add constraint "referrals_referee_id_fkey" FOREIGN KEY (referee_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."referrals" validate constraint "referrals_referee_id_fkey";

alter table "public"."referrals" add constraint "referrals_referee_id_key" UNIQUE using index "referrals_referee_id_key";

alter table "public"."referrals" add constraint "referrals_referrer_id_fkey" FOREIGN KEY (referrer_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."referrals" validate constraint "referrals_referrer_id_fkey";

alter table "public"."referrals" add constraint "referrals_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'converted'::text]))) not valid;

alter table "public"."referrals" validate constraint "referrals_status_check";

alter table "public"."subscription_plans" add constraint "subscription_plans_name_key" UNIQUE using index "subscription_plans_name_key";

alter table "public"."todos" add constraint "todos_priority_check" CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))) not valid;

alter table "public"."todos" validate constraint "todos_priority_check";

alter table "public"."todos" add constraint "todos_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."todos" validate constraint "todos_user_id_fkey";

alter table "public"."usage_tracking" add constraint "usage_tracking_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."usage_tracking" validate constraint "usage_tracking_user_id_fkey";

alter table "public"."usage_tracking" add constraint "usage_tracking_user_id_resource_type_period_start_key" UNIQUE using index "usage_tracking_user_id_resource_type_period_start_key";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_plan_id_fkey" FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id) not valid;

alter table "public"."user_subscriptions" validate constraint "user_subscriptions_plan_id_fkey";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_razorpay_subscription_id_key" UNIQUE using index "user_subscriptions_razorpay_subscription_id_key";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_subscriptions" validate constraint "user_subscriptions_user_id_fkey";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_user_id_key" UNIQUE using index "user_subscriptions_user_id_key";

alter table "public"."wallet_transactions" add constraint "wallet_transactions_referral_id_fkey" FOREIGN KEY (referral_id) REFERENCES public.referrals(id) ON DELETE SET NULL not valid;

alter table "public"."wallet_transactions" validate constraint "wallet_transactions_referral_id_fkey";

alter table "public"."wallet_transactions" add constraint "wallet_transactions_type_check" CHECK ((type = ANY (ARRAY['referral_reward'::text, 'signup_reward'::text, 'subscription_debit'::text]))) not valid;

alter table "public"."wallet_transactions" validate constraint "wallet_transactions_type_check";

alter table "public"."wallet_transactions" add constraint "wallet_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."wallet_transactions" validate constraint "wallet_transactions_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_wallet_transaction(p_user_id uuid, p_amount numeric, p_type text, p_description text, p_referral_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert wallet transaction (ledger entry)
  INSERT INTO wallet_transactions (
    user_id,
    amount,
    type,
    description,
    referral_id
  )
  VALUES (
    p_user_id,
    p_amount,
    p_type,
    p_description,
    p_referral_id
  );

  -- Update wallet balance
  UPDATE profiles
  SET wallet_balance = wallet_balance + p_amount
  WHERE id = p_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_order_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_plan_limit INTEGER;
  current_usage INTEGER;
  period_start_date DATE;
BEGIN
  -- âœ… ONLY CHANGE: subscriptions â†’ user_subscriptions
  SELECT sp.order_limit INTO user_plan_limit
  FROM user_subscriptions us  -- Changed from "subscriptions"
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = NEW.user_id AND us.status = 'active';
  
  -- If unlimited (NULL), allow
  IF user_plan_limit IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Get current month usage
  period_start_date := DATE_TRUNC('month', NOW())::DATE;
  
  SELECT COALESCE(count, 0) INTO current_usage
  FROM usage_tracking
  WHERE user_id = NEW.user_id 
    AND resource_type = 'orders'
    AND period_start = period_start_date;
  
  -- Check if limit exceeded
  IF current_usage >= user_plan_limit THEN
    RAISE EXCEPTION 'Order limit reached. Please upgrade your plan.';
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_default_subscription()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  free_plan_id UUID;
BEGIN
  SELECT id INTO free_plan_id FROM subscription_plans WHERE name = 'free' LIMIT 1;
  
  IF free_plan_id IS NULL THEN
    RAISE EXCEPTION 'Free plan not found in subscription_plans table';
  END IF;
  
  INSERT INTO user_subscriptions (
    user_id, 
    plan_id, 
    status, 
    current_period_start,
    current_period_end
  ) VALUES (
    NEW.id,
    free_plan_id,
    'active',
    NOW(),
    NOW() + INTERVAL '10 years'
  );
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_initial_order_status_history()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO order_status_history (order_id, status, changed_by, created_at)
  VALUES (NEW.id, NEW.status, NEW.user_id, NEW.created_at);
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_type text, p_priority text, p_title text, p_message text, p_entity_type text DEFAULT NULL::text, p_entity_id uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    priority,
    title,
    message,
    entity_type,
    entity_id
  )
  VALUES (
    p_user_id,
    p_type,
    p_priority,
    p_title,
    p_message,
    p_entity_type,
    p_entity_id
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_referral_entry(p_referee_id uuid, p_referral_code text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_referrer_id UUID;
  v_referral_inserted BOOLEAN;
BEGIN
  -- Find referrer by code
  SELECT id INTO v_referrer_id
  FROM profiles
  WHERE referral_code = p_referral_code;
  
  -- If referrer exists and is not the same as referee (prevent self-referral)
  IF v_referrer_id IS NOT NULL AND v_referrer_id != p_referee_id THEN
    -- Insert referral record (will fail silently if already exists due to UNIQUE constraint)
    INSERT INTO referrals (referrer_id, referee_id, status)
    VALUES (v_referrer_id, p_referee_id, 'pending')
    ON CONFLICT (referee_id) DO NOTHING
    RETURNING TRUE INTO v_referral_inserted;
    
    -- If referral was successfully inserted, credit â‚¹50 to referee immediately
    IF v_referral_inserted THEN
      PERFORM add_wallet_transaction(
        p_referee_id,
        50,
        'signup_reward',
        'Referral signup reward'
      );
    END IF;
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('order_number_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_referral_code()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = code) INTO exists;
    
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN code;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- ONLY create profile - NOTHING ELSE
  -- This MUST succeed for signup to work
  INSERT INTO public.profiles (
    id,
    full_name,
    business_name,
    phone,
    email,
    referral_code  -- Auto-generated by set_referral_code trigger
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'business_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.email,
    NULL  -- Will be set by trigger
  )
  ON CONFLICT (id) DO NOTHING;

  -- Store referral code in profile metadata for later processing
  -- This is SAFE because it's just a string field
  IF NEW.raw_user_meta_data->>'referral_code' IS NOT NULL THEN
    UPDATE public.profiles
    SET business_address = NEW.raw_user_meta_data->>'referral_code'  -- Temporary storage
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail signup
    RAISE WARNING 'Profile creation warning: %', SQLERRM;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify_referral_reward()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$BEGIN
  -- Only create notification for referral rewards
  IF NEW.type = 'referral_reward' THEN
    -- Create notification for the user who received the reward
    PERFORM create_notification(
      NEW.user_id,
      'referral_reward',
      'high',
      'Referral reward credited',
      NEW.description || ' - â‚¹' || NEW.amount || ' added to your wallet',
      'wallet',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;$function$
;

CREATE OR REPLACE FUNCTION public.process_pending_referrals()
 RETURNS TABLE(user_id uuid, result jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    process_signup_referral(p.id)
  FROM profiles p
  WHERE p.referral_processed_at IS NULL
    AND p.created_at > NOW() - INTERVAL '7 days'  -- Only process recent signups
    AND p.business_address IS NOT NULL  -- Has referral code stored
  LIMIT 100;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.process_referral_rewards(p_referee_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_referrer_id uuid;
  v_referral_id uuid;
  v_referee_name text;
  v_already_rewarded boolean;
BEGIN
  SELECT is_referral_rewarded
  INTO v_already_rewarded
  FROM profiles
  WHERE id = p_referee_id;

  IF v_already_rewarded THEN
    RAISE NOTICE 'Referral already rewarded for referee: %', p_referee_id;
    RETURN;
  END IF;

  SELECT
    r.id,
    r.referrer_id,
    COALESCE(p.business_name, p.full_name, 'User')
  INTO
    v_referral_id,
    v_referrer_id,
    v_referee_name
  FROM referrals r
  JOIN profiles p ON p.id = r.referee_id
  WHERE r.referee_id = p_referee_id
    AND r.status = 'pending';

  IF v_referrer_id IS NULL THEN
    RAISE NOTICE 'No pending referral found for referee: %', p_referee_id;
    RETURN;
  END IF;

  UPDATE referrals
  SET status = 'converted'
  WHERE id = v_referral_id;

  -- Use 5-parameter version with referral_id
  PERFORM add_wallet_transaction(
    v_referrer_id,
    75,
    'referral_reward',
    'Referral conversion reward by ' || v_referee_name,
    v_referral_id  -- Link to referral record
  );

  UPDATE profiles
  SET
    is_referral_rewarded = TRUE,
    referral_processed_at = now()
  WHERE id = p_referee_id;

  RAISE NOTICE 'Referral reward processed: Referrer: %, Referee: %', v_referrer_id, p_referee_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Referral reward error: %', SQLERRM;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.process_signup_referral(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_referral_code TEXT;
  v_referrer_id UUID;
  v_referral_id UUID;
  v_already_processed BOOLEAN;
  v_result JSONB;
BEGIN
  SELECT 
    referral_processed_at IS NOT NULL,
    business_address
  INTO v_already_processed, v_referral_code
  FROM profiles
  WHERE id = p_user_id;

  IF v_already_processed THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Already processed',
      'credited', false
    );
  END IF;

  IF v_referral_code IS NULL OR v_referral_code = '' THEN
    UPDATE profiles 
    SET referral_processed_at = NOW()
    WHERE id = p_user_id;
    
    RETURN jsonb_build_object(
      'success', true,
      'message', 'No referral code',
      'credited', false
    );
  END IF;

  SELECT id INTO v_referrer_id
  FROM profiles
  WHERE referral_code = v_referral_code
    AND id != p_user_id;

  IF v_referrer_id IS NULL THEN
    UPDATE profiles 
    SET referral_processed_at = NOW(),
        business_address = NULL
    WHERE id = p_user_id;
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid referral code',
      'credited', false
    );
  END IF;

  -- Create referral entry and capture the ID
  INSERT INTO referrals (referrer_id, referee_id, status)
  VALUES (v_referrer_id, p_user_id, 'pending')
  ON CONFLICT (referee_id) DO UPDATE SET status = 'pending'
  RETURNING id INTO v_referral_id;

  IF NOT v_already_processed THEN
    -- Use 5-parameter version with referral_id
    PERFORM add_wallet_transaction(
      p_user_id,
      50,
      'signup_reward',
      'Referral signup bonus',
      v_referral_id  -- Link to referral record
    );

    UPDATE profiles
    SET referral_processed_at = NOW(),
        business_address = NULL
    WHERE id = p_user_id;

    v_result := jsonb_build_object(
      'success', true,
      'message', 'Referral credit applied',
      'credited', true,
      'amount', 50,
      'referrer_id', v_referrer_id
    );
  END IF;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Processing error: ' || SQLERRM,
      'credited', false
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.recalculate_all_customer_stats()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.customers c
  SET 
    total_orders = (
      SELECT COUNT(*) 
      FROM public.orders o 
      WHERE o.customer_id = c.id
    ),
    total_spent = (
      SELECT COALESCE(SUM(total_amount), 0) 
      FROM public.orders o 
      WHERE o.customer_id = c.id
    ),
    last_order_date = (
      SELECT MAX(created_at) 
      FROM public.orders o 
      WHERE o.customer_id = c.id
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.recalculate_customer_stats(customer_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.customers
  SET 
    total_orders = (
      SELECT COUNT(*) 
      FROM public.orders 
      WHERE customer_id = customer_uuid
    ),
    total_spent = (
      SELECT COALESCE(SUM(total_amount), 0) 
      FROM public.orders 
      WHERE customer_id = customer_uuid
    ),
    last_order_date = (
      SELECT MAX(created_at) 
      FROM public.orders 
      WHERE customer_id = customer_uuid
    )
  WHERE id = customer_uuid;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_referral_code()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.track_order_usage()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  period_start_date DATE;
  period_end_date DATE;
BEGIN
  period_start_date := DATE_TRUNC('month', NOW())::DATE;
  period_end_date := (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
  
  INSERT INTO usage_tracking (user_id, resource_type, period_start, period_end, count)
  VALUES (NEW.user_id, 'orders', period_start_date, period_end_date, 1)
  ON CONFLICT (user_id, resource_type, period_start)
  DO UPDATE SET count = usage_tracking.count + 1;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_customer_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Handle INSERT (new order created)
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.customers
    SET 
      total_orders = total_orders + 1,
      total_spent = total_spent + NEW.total_amount,
      last_order_date = NEW.created_at
    WHERE id = NEW.customer_id;
    RETURN NEW;
  
  -- Handle UPDATE (order amount or customer changed)
  ELSIF (TG_OP = 'UPDATE') THEN
    -- If customer_id changed (order reassigned to different customer)
    IF (OLD.customer_id IS DISTINCT FROM NEW.customer_id) THEN
      -- Decrease stats for old customer
      IF (OLD.customer_id IS NOT NULL) THEN
        UPDATE public.customers
        SET 
          total_orders = GREATEST(total_orders - 1, 0),
          total_spent = GREATEST(total_spent - OLD.total_amount, 0),
          last_order_date = (
            SELECT MAX(created_at) 
            FROM public.orders 
            WHERE customer_id = OLD.customer_id AND id != OLD.id
          )
        WHERE id = OLD.customer_id;
      END IF;
      
      -- Increase stats for new customer
      IF (NEW.customer_id IS NOT NULL) THEN
        UPDATE public.customers
        SET 
          total_orders = total_orders + 1,
          total_spent = total_spent + NEW.total_amount,
          last_order_date = NEW.created_at
        WHERE id = NEW.customer_id;
      END IF;
    
    -- If only the total_amount changed (same customer)
    ELSIF (OLD.total_amount IS DISTINCT FROM NEW.total_amount AND NEW.customer_id IS NOT NULL) THEN
      UPDATE public.customers
      SET 
        total_spent = total_spent - OLD.total_amount + NEW.total_amount
      WHERE id = NEW.customer_id;
    END IF;
    
    RETURN NEW;
  
  -- Handle DELETE (order removed)
  ELSIF (TG_OP = 'DELETE') THEN
    IF (OLD.customer_id IS NOT NULL) THEN
      UPDATE public.customers
      SET 
        total_orders = GREATEST(total_orders - 1, 0),
        total_spent = GREATEST(total_spent - OLD.total_amount, 0),
        last_order_date = (
          SELECT MAX(created_at) 
          FROM public.orders 
          WHERE customer_id = OLD.customer_id AND id != OLD.id
        )
      WHERE id = OLD.customer_id;
    END IF;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_stock_status()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only auto-update stock_status if stock_quantity changes
  -- AND the user didn't explicitly set a status
  IF (TG_OP = 'INSERT') THEN
    -- On insert, set status based on quantity
    IF NEW.stock_quantity IS NULL OR NEW.stock_quantity = 0 THEN
      NEW.stock_status := 'out_of_stock';
    ELSIF NEW.stock_quantity <= COALESCE(NEW.low_stock_threshold, 10) THEN
      NEW.stock_status := 'low_stock';
    ELSE
      NEW.stock_status := COALESCE(NEW.stock_status, 'in_stock');
    END IF;
  ELSIF (TG_OP = 'UPDATE' AND OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity) THEN
    -- On update, only change if quantity changed
    IF NEW.stock_quantity = 0 THEN
      NEW.stock_status := 'out_of_stock';
    ELSIF NEW.stock_quantity <= COALESCE(NEW.low_stock_threshold, 10) THEN
      NEW.stock_status := 'low_stock';
    ELSIF NEW.stock_quantity > COALESCE(NEW.low_stock_threshold, 10) THEN
      NEW.stock_status := 'in_stock';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_todos_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."auth_otps" to "anon";

grant insert on table "public"."auth_otps" to "anon";

grant references on table "public"."auth_otps" to "anon";

grant select on table "public"."auth_otps" to "anon";

grant trigger on table "public"."auth_otps" to "anon";

grant truncate on table "public"."auth_otps" to "anon";

grant update on table "public"."auth_otps" to "anon";

grant delete on table "public"."auth_otps" to "authenticated";

grant insert on table "public"."auth_otps" to "authenticated";

grant references on table "public"."auth_otps" to "authenticated";

grant select on table "public"."auth_otps" to "authenticated";

grant trigger on table "public"."auth_otps" to "authenticated";

grant truncate on table "public"."auth_otps" to "authenticated";

grant update on table "public"."auth_otps" to "authenticated";

grant delete on table "public"."auth_otps" to "service_role";

grant insert on table "public"."auth_otps" to "service_role";

grant references on table "public"."auth_otps" to "service_role";

grant select on table "public"."auth_otps" to "service_role";

grant trigger on table "public"."auth_otps" to "service_role";

grant truncate on table "public"."auth_otps" to "service_role";

grant update on table "public"."auth_otps" to "service_role";

grant delete on table "public"."customers" to "anon";

grant insert on table "public"."customers" to "anon";

grant references on table "public"."customers" to "anon";

grant select on table "public"."customers" to "anon";

grant trigger on table "public"."customers" to "anon";

grant truncate on table "public"."customers" to "anon";

grant update on table "public"."customers" to "anon";

grant delete on table "public"."customers" to "authenticated";

grant insert on table "public"."customers" to "authenticated";

grant references on table "public"."customers" to "authenticated";

grant select on table "public"."customers" to "authenticated";

grant trigger on table "public"."customers" to "authenticated";

grant truncate on table "public"."customers" to "authenticated";

grant update on table "public"."customers" to "authenticated";

grant delete on table "public"."customers" to "service_role";

grant insert on table "public"."customers" to "service_role";

grant references on table "public"."customers" to "service_role";

grant select on table "public"."customers" to "service_role";

grant trigger on table "public"."customers" to "service_role";

grant truncate on table "public"."customers" to "service_role";

grant update on table "public"."customers" to "service_role";

grant delete on table "public"."email_logs" to "anon";

grant insert on table "public"."email_logs" to "anon";

grant references on table "public"."email_logs" to "anon";

grant select on table "public"."email_logs" to "anon";

grant trigger on table "public"."email_logs" to "anon";

grant truncate on table "public"."email_logs" to "anon";

grant update on table "public"."email_logs" to "anon";

grant delete on table "public"."email_logs" to "authenticated";

grant insert on table "public"."email_logs" to "authenticated";

grant references on table "public"."email_logs" to "authenticated";

grant select on table "public"."email_logs" to "authenticated";

grant trigger on table "public"."email_logs" to "authenticated";

grant truncate on table "public"."email_logs" to "authenticated";

grant update on table "public"."email_logs" to "authenticated";

grant delete on table "public"."email_logs" to "service_role";

grant insert on table "public"."email_logs" to "service_role";

grant references on table "public"."email_logs" to "service_role";

grant select on table "public"."email_logs" to "service_role";

grant trigger on table "public"."email_logs" to "service_role";

grant truncate on table "public"."email_logs" to "service_role";

grant update on table "public"."email_logs" to "service_role";

grant delete on table "public"."enquiries" to "anon";

grant insert on table "public"."enquiries" to "anon";

grant references on table "public"."enquiries" to "anon";

grant select on table "public"."enquiries" to "anon";

grant trigger on table "public"."enquiries" to "anon";

grant truncate on table "public"."enquiries" to "anon";

grant update on table "public"."enquiries" to "anon";

grant delete on table "public"."enquiries" to "authenticated";

grant insert on table "public"."enquiries" to "authenticated";

grant references on table "public"."enquiries" to "authenticated";

grant select on table "public"."enquiries" to "authenticated";

grant trigger on table "public"."enquiries" to "authenticated";

grant truncate on table "public"."enquiries" to "authenticated";

grant update on table "public"."enquiries" to "authenticated";

grant delete on table "public"."enquiries" to "service_role";

grant insert on table "public"."enquiries" to "service_role";

grant references on table "public"."enquiries" to "service_role";

grant select on table "public"."enquiries" to "service_role";

grant trigger on table "public"."enquiries" to "service_role";

grant truncate on table "public"."enquiries" to "service_role";

grant update on table "public"."enquiries" to "service_role";

grant delete on table "public"."login_attempts" to "anon";

grant insert on table "public"."login_attempts" to "anon";

grant references on table "public"."login_attempts" to "anon";

grant select on table "public"."login_attempts" to "anon";

grant trigger on table "public"."login_attempts" to "anon";

grant truncate on table "public"."login_attempts" to "anon";

grant update on table "public"."login_attempts" to "anon";

grant delete on table "public"."login_attempts" to "authenticated";

grant insert on table "public"."login_attempts" to "authenticated";

grant references on table "public"."login_attempts" to "authenticated";

grant select on table "public"."login_attempts" to "authenticated";

grant trigger on table "public"."login_attempts" to "authenticated";

grant truncate on table "public"."login_attempts" to "authenticated";

grant update on table "public"."login_attempts" to "authenticated";

grant delete on table "public"."login_attempts" to "service_role";

grant insert on table "public"."login_attempts" to "service_role";

grant references on table "public"."login_attempts" to "service_role";

grant select on table "public"."login_attempts" to "service_role";

grant trigger on table "public"."login_attempts" to "service_role";

grant truncate on table "public"."login_attempts" to "service_role";

grant update on table "public"."login_attempts" to "service_role";

grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant references on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant references on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";

grant delete on table "public"."order_items" to "anon";

grant insert on table "public"."order_items" to "anon";

grant references on table "public"."order_items" to "anon";

grant select on table "public"."order_items" to "anon";

grant trigger on table "public"."order_items" to "anon";

grant truncate on table "public"."order_items" to "anon";

grant update on table "public"."order_items" to "anon";

grant delete on table "public"."order_items" to "authenticated";

grant insert on table "public"."order_items" to "authenticated";

grant references on table "public"."order_items" to "authenticated";

grant select on table "public"."order_items" to "authenticated";

grant trigger on table "public"."order_items" to "authenticated";

grant truncate on table "public"."order_items" to "authenticated";

grant update on table "public"."order_items" to "authenticated";

grant delete on table "public"."order_items" to "service_role";

grant insert on table "public"."order_items" to "service_role";

grant references on table "public"."order_items" to "service_role";

grant select on table "public"."order_items" to "service_role";

grant trigger on table "public"."order_items" to "service_role";

grant truncate on table "public"."order_items" to "service_role";

grant update on table "public"."order_items" to "service_role";

grant delete on table "public"."order_status_history" to "anon";

grant insert on table "public"."order_status_history" to "anon";

grant references on table "public"."order_status_history" to "anon";

grant select on table "public"."order_status_history" to "anon";

grant trigger on table "public"."order_status_history" to "anon";

grant truncate on table "public"."order_status_history" to "anon";

grant update on table "public"."order_status_history" to "anon";

grant delete on table "public"."order_status_history" to "authenticated";

grant insert on table "public"."order_status_history" to "authenticated";

grant references on table "public"."order_status_history" to "authenticated";

grant select on table "public"."order_status_history" to "authenticated";

grant trigger on table "public"."order_status_history" to "authenticated";

grant truncate on table "public"."order_status_history" to "authenticated";

grant update on table "public"."order_status_history" to "authenticated";

grant delete on table "public"."order_status_history" to "service_role";

grant insert on table "public"."order_status_history" to "service_role";

grant references on table "public"."order_status_history" to "service_role";

grant select on table "public"."order_status_history" to "service_role";

grant trigger on table "public"."order_status_history" to "service_role";

grant truncate on table "public"."order_status_history" to "service_role";

grant update on table "public"."order_status_history" to "service_role";

grant delete on table "public"."orders" to "anon";

grant insert on table "public"."orders" to "anon";

grant references on table "public"."orders" to "anon";

grant select on table "public"."orders" to "anon";

grant trigger on table "public"."orders" to "anon";

grant truncate on table "public"."orders" to "anon";

grant update on table "public"."orders" to "anon";

grant delete on table "public"."orders" to "authenticated";

grant insert on table "public"."orders" to "authenticated";

grant references on table "public"."orders" to "authenticated";

grant select on table "public"."orders" to "authenticated";

grant trigger on table "public"."orders" to "authenticated";

grant truncate on table "public"."orders" to "authenticated";

grant update on table "public"."orders" to "authenticated";

grant delete on table "public"."orders" to "service_role";

grant insert on table "public"."orders" to "service_role";

grant references on table "public"."orders" to "service_role";

grant select on table "public"."orders" to "service_role";

grant trigger on table "public"."orders" to "service_role";

grant truncate on table "public"."orders" to "service_role";

grant update on table "public"."orders" to "service_role";

grant delete on table "public"."payment_transactions" to "anon";

grant insert on table "public"."payment_transactions" to "anon";

grant references on table "public"."payment_transactions" to "anon";

grant select on table "public"."payment_transactions" to "anon";

grant trigger on table "public"."payment_transactions" to "anon";

grant truncate on table "public"."payment_transactions" to "anon";

grant update on table "public"."payment_transactions" to "anon";

grant delete on table "public"."payment_transactions" to "authenticated";

grant insert on table "public"."payment_transactions" to "authenticated";

grant references on table "public"."payment_transactions" to "authenticated";

grant select on table "public"."payment_transactions" to "authenticated";

grant trigger on table "public"."payment_transactions" to "authenticated";

grant truncate on table "public"."payment_transactions" to "authenticated";

grant update on table "public"."payment_transactions" to "authenticated";

grant delete on table "public"."payment_transactions" to "service_role";

grant insert on table "public"."payment_transactions" to "service_role";

grant references on table "public"."payment_transactions" to "service_role";

grant select on table "public"."payment_transactions" to "service_role";

grant trigger on table "public"."payment_transactions" to "service_role";

grant truncate on table "public"."payment_transactions" to "service_role";

grant update on table "public"."payment_transactions" to "service_role";

grant delete on table "public"."products" to "anon";

grant insert on table "public"."products" to "anon";

grant references on table "public"."products" to "anon";

grant select on table "public"."products" to "anon";

grant trigger on table "public"."products" to "anon";

grant truncate on table "public"."products" to "anon";

grant update on table "public"."products" to "anon";

grant delete on table "public"."products" to "authenticated";

grant insert on table "public"."products" to "authenticated";

grant references on table "public"."products" to "authenticated";

grant select on table "public"."products" to "authenticated";

grant trigger on table "public"."products" to "authenticated";

grant truncate on table "public"."products" to "authenticated";

grant update on table "public"."products" to "authenticated";

grant delete on table "public"."products" to "service_role";

grant insert on table "public"."products" to "service_role";

grant references on table "public"."products" to "service_role";

grant select on table "public"."products" to "service_role";

grant trigger on table "public"."products" to "service_role";

grant truncate on table "public"."products" to "service_role";

grant update on table "public"."products" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."referrals" to "anon";

grant insert on table "public"."referrals" to "anon";

grant references on table "public"."referrals" to "anon";

grant select on table "public"."referrals" to "anon";

grant trigger on table "public"."referrals" to "anon";

grant truncate on table "public"."referrals" to "anon";

grant update on table "public"."referrals" to "anon";

grant delete on table "public"."referrals" to "authenticated";

grant insert on table "public"."referrals" to "authenticated";

grant references on table "public"."referrals" to "authenticated";

grant select on table "public"."referrals" to "authenticated";

grant trigger on table "public"."referrals" to "authenticated";

grant truncate on table "public"."referrals" to "authenticated";

grant update on table "public"."referrals" to "authenticated";

grant delete on table "public"."referrals" to "service_role";

grant insert on table "public"."referrals" to "service_role";

grant references on table "public"."referrals" to "service_role";

grant select on table "public"."referrals" to "service_role";

grant trigger on table "public"."referrals" to "service_role";

grant truncate on table "public"."referrals" to "service_role";

grant update on table "public"."referrals" to "service_role";

grant delete on table "public"."signup_ip_log" to "anon";

grant insert on table "public"."signup_ip_log" to "anon";

grant references on table "public"."signup_ip_log" to "anon";

grant select on table "public"."signup_ip_log" to "anon";

grant trigger on table "public"."signup_ip_log" to "anon";

grant truncate on table "public"."signup_ip_log" to "anon";

grant update on table "public"."signup_ip_log" to "anon";

grant delete on table "public"."signup_ip_log" to "authenticated";

grant insert on table "public"."signup_ip_log" to "authenticated";

grant references on table "public"."signup_ip_log" to "authenticated";

grant select on table "public"."signup_ip_log" to "authenticated";

grant trigger on table "public"."signup_ip_log" to "authenticated";

grant truncate on table "public"."signup_ip_log" to "authenticated";

grant update on table "public"."signup_ip_log" to "authenticated";

grant delete on table "public"."signup_ip_log" to "service_role";

grant insert on table "public"."signup_ip_log" to "service_role";

grant references on table "public"."signup_ip_log" to "service_role";

grant select on table "public"."signup_ip_log" to "service_role";

grant trigger on table "public"."signup_ip_log" to "service_role";

grant truncate on table "public"."signup_ip_log" to "service_role";

grant update on table "public"."signup_ip_log" to "service_role";

grant delete on table "public"."subscription_plans" to "anon";

grant insert on table "public"."subscription_plans" to "anon";

grant references on table "public"."subscription_plans" to "anon";

grant select on table "public"."subscription_plans" to "anon";

grant trigger on table "public"."subscription_plans" to "anon";

grant truncate on table "public"."subscription_plans" to "anon";

grant update on table "public"."subscription_plans" to "anon";

grant delete on table "public"."subscription_plans" to "authenticated";

grant insert on table "public"."subscription_plans" to "authenticated";

grant references on table "public"."subscription_plans" to "authenticated";

grant select on table "public"."subscription_plans" to "authenticated";

grant trigger on table "public"."subscription_plans" to "authenticated";

grant truncate on table "public"."subscription_plans" to "authenticated";

grant update on table "public"."subscription_plans" to "authenticated";

grant delete on table "public"."subscription_plans" to "service_role";

grant insert on table "public"."subscription_plans" to "service_role";

grant references on table "public"."subscription_plans" to "service_role";

grant select on table "public"."subscription_plans" to "service_role";

grant trigger on table "public"."subscription_plans" to "service_role";

grant truncate on table "public"."subscription_plans" to "service_role";

grant update on table "public"."subscription_plans" to "service_role";

grant delete on table "public"."todos" to "anon";

grant insert on table "public"."todos" to "anon";

grant references on table "public"."todos" to "anon";

grant select on table "public"."todos" to "anon";

grant trigger on table "public"."todos" to "anon";

grant truncate on table "public"."todos" to "anon";

grant update on table "public"."todos" to "anon";

grant delete on table "public"."todos" to "authenticated";

grant insert on table "public"."todos" to "authenticated";

grant references on table "public"."todos" to "authenticated";

grant select on table "public"."todos" to "authenticated";

grant trigger on table "public"."todos" to "authenticated";

grant truncate on table "public"."todos" to "authenticated";

grant update on table "public"."todos" to "authenticated";

grant delete on table "public"."todos" to "service_role";

grant insert on table "public"."todos" to "service_role";

grant references on table "public"."todos" to "service_role";

grant select on table "public"."todos" to "service_role";

grant trigger on table "public"."todos" to "service_role";

grant truncate on table "public"."todos" to "service_role";

grant update on table "public"."todos" to "service_role";

grant delete on table "public"."usage_tracking" to "anon";

grant insert on table "public"."usage_tracking" to "anon";

grant references on table "public"."usage_tracking" to "anon";

grant select on table "public"."usage_tracking" to "anon";

grant trigger on table "public"."usage_tracking" to "anon";

grant truncate on table "public"."usage_tracking" to "anon";

grant update on table "public"."usage_tracking" to "anon";

grant delete on table "public"."usage_tracking" to "authenticated";

grant insert on table "public"."usage_tracking" to "authenticated";

grant references on table "public"."usage_tracking" to "authenticated";

grant select on table "public"."usage_tracking" to "authenticated";

grant trigger on table "public"."usage_tracking" to "authenticated";

grant truncate on table "public"."usage_tracking" to "authenticated";

grant update on table "public"."usage_tracking" to "authenticated";

grant delete on table "public"."usage_tracking" to "service_role";

grant insert on table "public"."usage_tracking" to "service_role";

grant references on table "public"."usage_tracking" to "service_role";

grant select on table "public"."usage_tracking" to "service_role";

grant trigger on table "public"."usage_tracking" to "service_role";

grant truncate on table "public"."usage_tracking" to "service_role";

grant update on table "public"."usage_tracking" to "service_role";

grant delete on table "public"."user_subscriptions" to "anon";

grant insert on table "public"."user_subscriptions" to "anon";

grant references on table "public"."user_subscriptions" to "anon";

grant select on table "public"."user_subscriptions" to "anon";

grant trigger on table "public"."user_subscriptions" to "anon";

grant truncate on table "public"."user_subscriptions" to "anon";

grant update on table "public"."user_subscriptions" to "anon";

grant delete on table "public"."user_subscriptions" to "authenticated";

grant insert on table "public"."user_subscriptions" to "authenticated";

grant references on table "public"."user_subscriptions" to "authenticated";

grant select on table "public"."user_subscriptions" to "authenticated";

grant trigger on table "public"."user_subscriptions" to "authenticated";

grant truncate on table "public"."user_subscriptions" to "authenticated";

grant update on table "public"."user_subscriptions" to "authenticated";

grant delete on table "public"."user_subscriptions" to "service_role";

grant insert on table "public"."user_subscriptions" to "service_role";

grant references on table "public"."user_subscriptions" to "service_role";

grant select on table "public"."user_subscriptions" to "service_role";

grant trigger on table "public"."user_subscriptions" to "service_role";

grant truncate on table "public"."user_subscriptions" to "service_role";

grant update on table "public"."user_subscriptions" to "service_role";

grant delete on table "public"."wallet_transactions" to "anon";

grant insert on table "public"."wallet_transactions" to "anon";

grant references on table "public"."wallet_transactions" to "anon";

grant select on table "public"."wallet_transactions" to "anon";

grant trigger on table "public"."wallet_transactions" to "anon";

grant truncate on table "public"."wallet_transactions" to "anon";

grant update on table "public"."wallet_transactions" to "anon";

grant delete on table "public"."wallet_transactions" to "authenticated";

grant insert on table "public"."wallet_transactions" to "authenticated";

grant references on table "public"."wallet_transactions" to "authenticated";

grant select on table "public"."wallet_transactions" to "authenticated";

grant trigger on table "public"."wallet_transactions" to "authenticated";

grant truncate on table "public"."wallet_transactions" to "authenticated";

grant update on table "public"."wallet_transactions" to "authenticated";

grant delete on table "public"."wallet_transactions" to "service_role";

grant insert on table "public"."wallet_transactions" to "service_role";

grant references on table "public"."wallet_transactions" to "service_role";

grant select on table "public"."wallet_transactions" to "service_role";

grant trigger on table "public"."wallet_transactions" to "service_role";

grant truncate on table "public"."wallet_transactions" to "service_role";

grant update on table "public"."wallet_transactions" to "service_role";


  create policy "Service role full access on auth_otps"
  on "public"."auth_otps"
  as permissive
  for all
  to service_role
using (true)
with check (true);



  create policy "Users can manage their own customers"
  on "public"."customers"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Service role full access on email_logs"
  on "public"."email_logs"
  as permissive
  for all
  to service_role
using (true)
with check (true);



  create policy "Users can insert own enquiries"
  on "public"."enquiries"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update own enquiries"
  on "public"."enquiries"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can view own enquiries"
  on "public"."enquiries"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert their own notifications"
  on "public"."notifications"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update their own notifications"
  on "public"."notifications"
  as permissive
  for update
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users can view their own notifications"
  on "public"."notifications"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users can manage items in their own orders"
  on "public"."order_items"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));



  create policy "Users can create status history"
  on "public"."order_status_history"
  as permissive
  for insert
  to public
with check ((changed_by = auth.uid()));



  create policy "Users can view their order status history"
  on "public"."order_status_history"
  as permissive
  for select
  to public
using ((changed_by = auth.uid()));



  create policy "Users can manage their own orders"
  on "public"."orders"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert own transactions"
  on "public"."payment_transactions"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update own transactions"
  on "public"."payment_transactions"
  as permissive
  for update
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users can view own transactions"
  on "public"."payment_transactions"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users can manage their own products"
  on "public"."products"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Referrers can read referee name"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.referrals
  WHERE ((referrals.referee_id = profiles.id) AND (referrals.referrer_id = auth.uid())))));



  create policy "Users can insert own profile during signup"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));



  create policy "Users can manage their own profile"
  on "public"."profiles"
  as permissive
  for all
  to public
using ((auth.uid() = id));



  create policy "Users can view referrals where they are referee"
  on "public"."referrals"
  as permissive
  for select
  to public
using ((auth.uid() = referee_id));



  create policy "Users can view their own referrals"
  on "public"."referrals"
  as permissive
  for select
  to public
using ((auth.uid() = referrer_id));



  create policy "allow inserts only for service role"
  on "public"."signup_ip_log"
  as permissive
  for insert
  to service_role
with check (true);



  create policy "Anyone can view active plans"
  on "public"."subscription_plans"
  as permissive
  for select
  to public
using ((is_active = true));



  create policy "Users can delete own todos"
  on "public"."todos"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert own todos"
  on "public"."todos"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update own todos"
  on "public"."todos"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can view own todos"
  on "public"."todos"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users can view own usage"
  on "public"."usage_tracking"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert own subscription during signup"
  on "public"."user_subscriptions"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can view own subscription"
  on "public"."user_subscriptions"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users can view their own wallet transactions"
  on "public"."wallet_transactions"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));


CREATE TRIGGER handle_customers_update BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER enforce_order_limit BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.check_order_limit();

CREATE TRIGGER handle_orders_update BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_order_created_create_status_history AFTER INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.create_initial_order_status_history();

CREATE TRIGGER on_order_created_track_usage AFTER INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.track_order_usage();

CREATE TRIGGER set_order_number BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

CREATE TRIGGER update_customer_stats_on_order_change AFTER INSERT OR DELETE OR UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_customer_stats();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER auto_update_stock_status BEFORE INSERT OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_stock_status();

CREATE TRIGGER handle_products_update BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER handle_profiles_update BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_profile_created AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.create_default_subscription();

CREATE TRIGGER trigger_set_referral_code BEFORE INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_referral_code();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_todos_updated_at_trigger BEFORE UPDATE ON public.todos FOR EACH ROW EXECUTE FUNCTION public.update_todos_updated_at();

CREATE TRIGGER trigger_notify_referral_reward AFTER INSERT ON public.wallet_transactions FOR EACH ROW EXECUTE FUNCTION public.notify_referral_reward();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Allow authenitcated users to full access 16wiy3a_0"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'product-images'::text) AND (auth.uid() IS NOT NULL)));



  create policy "Allow authenitcated users to full access 16wiy3a_1"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'product-images'::text) AND (auth.uid() IS NOT NULL)));



  create policy "Allow authenitcated users to full access 16wiy3a_2"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'product-images'::text) AND (auth.uid() IS NOT NULL)));



  create policy "Allow public reads 16wiy3a_0"
  on "storage"."objects"
  as permissive
  for select
  to anon
using ((bucket_id = 'product-images'::text));



  create policy "Authenticated users can upload images"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'product-images'::text));



  create policy "Public can view avatars"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'avatars'::text));



  create policy "Public can view images"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'product-images'::text));



  create policy "Users can delete own images"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'product-images'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can delete their own avatar"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can update own images"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'product-images'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can update their own avatar"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can upload their own avatar"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



