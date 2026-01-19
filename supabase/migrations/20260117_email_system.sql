
-- Create OTP table
create table if not exists auth_otps (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  otp_code text not null, -- Stores hashed or plain OTP (hashed recommended, but plain for simplicity unless specified)
  expires_at timestamptz not null,
  verified boolean default false,
  created_at timestamptz default now()
);

-- Index for fast lookup
create index if not exists idx_auth_otps_email on auth_otps(email);

-- Create Email Logs table
create table if not exists email_logs (
  id uuid primary key default gen_random_uuid(),
  recipient text not null,
  template_id text not null,
  status text not null,
  error text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Add logic columns to profiles (if not exists)
do $$ 
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'subscription_reminder_7d_sent_at') then
    alter table profiles add column subscription_reminder_7d_sent_at timestamptz;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'subscription_reminder_3d_sent_at') then
    alter table profiles add column subscription_reminder_3d_sent_at timestamptz;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'subscription_reminder_1d_sent_at') then
    alter table profiles add column subscription_reminder_1d_sent_at timestamptz;
  end if;
end $$;

-- Add logic columns to enquiries (if table exists)
do $$ 
begin
  if exists (select 1 from information_schema.tables where table_name = 'enquiries') then
    if not exists (select 1 from information_schema.columns where table_name = 'enquiries' and column_name = 'last_reminder_sent_at') then
      alter table enquiries add column last_reminder_sent_at timestamptz;
    end if;
  end if;
end $$;

-- Add logic columns to orders (if table exists)
do $$ 
begin
  if exists (select 1 from information_schema.tables where table_name = 'orders') then
    if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'last_update_email_sent_at') then
      alter table orders add column last_update_email_sent_at timestamptz;
    end if;
  end if;
end $$;
