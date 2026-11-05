-- QR GEN PRO - Supabase schema
-- Run once in Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Safe to re-run.

create table if not exists public.qr_codes (
  id            text primary key default gen_random_uuid()::text,
  user_id       text,
  name          text not null,
  type          text not null,
  content       text not null,
  customization text,
  file_path     text,
  is_public     boolean not null default true,
  scan_count    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists qr_codes_type_idx on public.qr_codes (type);
create index if not exists qr_codes_created_at_idx on public.qr_codes (created_at desc);

create table if not exists public.templates (
  id            text primary key default gen_random_uuid()::text,
  name          text not null,
  type          text not null,
  configuration text not null default '{}',
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.favorites (
  id         text primary key default gen_random_uuid()::text,
  user_id    text not null,
  qr_code_id text not null references public.qr_codes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, qr_code_id)
);

-- Keep updated_at current
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists qr_codes_updated_at on public.qr_codes;
create trigger qr_codes_updated_at before update on public.qr_codes
  for each row execute function public.set_updated_at();

drop trigger if exists templates_updated_at on public.templates;
create trigger templates_updated_at before update on public.templates
  for each row execute function public.set_updated_at();

-- Atomic scan counter used by /r/{id}
create or replace function public.increment_qr_scan(qr_id text)
returns setof public.qr_codes
language sql security definer set search_path = public as $$
  update public.qr_codes set scan_count = scan_count + 1
  where id = qr_id
  returning *;
$$;
grant execute on function public.increment_qr_scan(text) to anon, authenticated;

-- Row Level Security
-- The app has no login yet, so the anon key gets full access to these tables
-- (same behavior as before). Tighten these once authentication is added.
alter table public.qr_codes  enable row level security;
alter table public.templates enable row level security;
alter table public.favorites enable row level security;

drop policy if exists "anon full access" on public.qr_codes;
create policy "anon full access" on public.qr_codes
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "anon full access" on public.templates;
create policy "anon full access" on public.templates
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "anon full access" on public.favorites;
create policy "anon full access" on public.favorites
  for all to anon, authenticated using (true) with check (true);
