-- 1. Create the table if it doesn't exist
create table if not exists public.landing_popup_leads (
    id uuid not null default gen_random_uuid(),
    created_at timestamp with time zone not null default now(),
    name text not null,
    whatsapp text not null,
    email text not null,
    message text null,
    status text not null default 'new',
    constraint landing_popup_leads_pkey primary key (id)
);

-- 2. Enable RLS
alter table public.landing_popup_leads enable row level security;

-- 3. Create Policy for Public Insert (Drop first to avoid conflicts)
drop policy if exists "Allow public to insert leads" on public.landing_popup_leads;

create policy "Allow public to insert leads"
on public.landing_popup_leads
for insert
to anon, authenticated
with check (true);

-- 4. Create Policy for Admin View (Drop first to avoid conflicts)
drop policy if exists "Allow admins to view leads" on public.landing_popup_leads;

create policy "Allow admins to view leads"
on public.landing_popup_leads
for select
to authenticated
using (true);

-- 5. IMPORTANT: Reload the Schema Cache (Solves PGRST205)
NOTIFY pgrst, 'reload schema';
