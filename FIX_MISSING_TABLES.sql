-- RUN THIS IN YOUR SUPABASE SQL EDITOR
-- Link: https://supabase.com/dashboard/project/jhzywjqbpnonkxwvwstx/editor/sql

-- 1. Create OTP Table
create table if not exists auth_otps (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  otp_code text not null,
  expires_at timestamptz not null,
  verified boolean default false,
  created_at timestamptz default now()
);

-- 2. Create Index for performance
create index if not exists idx_auth_otps_email on auth_otps(email);

-- 3. Create Email Logs Table
create table if not exists email_logs (
  id uuid primary key default gen_random_uuid(),
  recipient text not null,
  template_id text not null,
  status text not null,
  error text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- 4. Enable Security (Row Level Security)
alter table auth_otps enable row level security;
alter table email_logs enable row level security;

-- 5. Add Policies (Allow backend to ready/write)
-- Note: We use the SERVICE ROLE key in the backend, which bypasses RLS by default,
-- but having these policies ensures explicit access control if needed.

create policy "Service role full access on auth_otps"
  on auth_otps
  as permissive
  for all
  to service_role
  using ( true )
  with check ( true );

create policy "Service role full access on email_logs"
  on email_logs
  as permissive
  for all
  to service_role
  using ( true )
  with check ( true );
