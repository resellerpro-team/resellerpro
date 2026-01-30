-- Create OTP Attempts Table
create table if not exists auth_otp_attempts (
  email text primary key,
  attempt_count int default 0,
  failed_verifications int default 0,
  last_attempt_at timestamptz default now(),
  blocked_until timestamptz
);

-- Enable Security (Row Level Security)
alter table auth_otp_attempts enable row level security;

-- Add Policies (Allow backend to read/write)
-- Note: We use the SERVICE ROLE key in the backend, which bypasses RLS by default.
create policy "Service role full access on auth_otp_attempts"
  on auth_otp_attempts
  as permissive
  for all
  to service_role
  using ( true )
  with check ( true );
