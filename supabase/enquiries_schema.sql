-- Create the table for storing enquiries from landing page popup
create table public.landing_popup_leads (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  name text not null,
  whatsapp text not null,
  email text not null,
  message text null,
  status text not null default 'new', -- 'new', 'contacted', 'resolved'
  constraint landing_popup_leads_pkey primary key (id)
);

-- Enable Row Level Security (RLS)
alter table public.landing_popup_leads enable row level security;

-- Policy 1: Allow anyone (anon) to INSERT leads (public form)
create policy "Allow public to insert leads"
on public.landing_popup_leads
for insert
to anon, authenticated
with check (true);

-- Policy 2: Allow only authenticated admins to VIEW leads
-- Assuming basic authenticated access for now. 
-- If you have specific roles, you might change 'authenticated' to that role.
create policy "Allow admins to view leads"
on public.landing_popup_leads
for select
to authenticated
using (true);

-- Optional: Create a trigger/function to update updated_at if you add that column
-- For now, this is a simple log table.
