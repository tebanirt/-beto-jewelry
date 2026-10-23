-- Beto Jewelry CRM schema. Run this once in the Supabase SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).

create extension if not exists "pgcrypto";

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text,
  phone text,
  source text, -- e.g. 'site-contact', 'site-consultation', 'site-custom-design', 'site-quote', 'intake-link', 'manual'
  notes text,
  status text not null default 'nouveau', -- nouveau | consultation | depot_recu | design | production | livre | perdu
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email),
  unique (phone)
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  form_type text not null, -- contact | consultation | custom-design | quote | intake-link
  fields jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists submissions_client_id_idx on submissions(client_id);
create index if not exists clients_email_idx on clients(email);
create index if not exists clients_phone_idx on clients(phone);

-- Row Level Security: locked down by default. The app only ever talks to
-- Supabase using the service_role key from server-side code (API routes /
-- server components), which bypasses RLS entirely, so no public policies
-- are needed or created here.
alter table clients enable row level security;
alter table submissions enable row level security;
