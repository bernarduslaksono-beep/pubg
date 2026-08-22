-- =====================================================================
-- UC-PUBG Timor Leste — Supabase schema (versaun corrigida)
-- Aman atu Run beibeik (hotu-hotu uza "drop ... if exists" antes "create"),
-- se ita boot presiza rejalankan, la iha problema "already exists".
-- Kopia hotu conteudu ne'e, hela Supabase Dashboard > SQL Editor > New query,
-- paste, hafoin klik "Run".
-- =====================================================================

-- 1) Tabela orders
create table if not exists public.orders (
  id text primary key,
  customer_name text,
  whatsapp text,
  game_id text,
  ign text,
  note text default '',
  payment_method text not null,
  pkg_uc integer not null,
  pkg_price numeric not null,
  proof_url text not null,
  status text not null default 'menunggu_verifikasi'
    check (status in ('menunggu_verifikasi','terverifikasi','terkirim','dibatalkan')),
  created_at timestamptz not null default now(),
  pkg_unit_uc integer,
  qty integer not null default 1,
  admin_comment text default '',
  game text not null default 'pubg' check (game in ('pubg','ml','ff','roblox')),
  zone_id text
);

-- Se tabela ona iha husi antes (versaun tuan), hatama kolona foun ne'e
-- (aman atu Run beibeik — la iha erru se kolona ona iha)
alter table public.orders add column if not exists pkg_unit_uc integer;
alter table public.orders add column if not exists qty integer not null default 1;
alter table public.orders add column if not exists admin_comment text default '';
alter table public.orders add column if not exists game text not null default 'pubg';
alter table public.orders add column if not exists zone_id text;
-- Naran completu no numeru WhatsApp ona hasai husi formuláriu pedidu —
-- kolona ne'e agora opsional (la bele "not null" ona)
alter table public.orders alter column customer_name drop not null;
alter table public.orders alter column whatsapp drop not null;
-- Robux Roblox la presiza User ID/Nickname — kolona ne'e mos agora opsional
alter table public.orders alter column game_id drop not null;
alter table public.orders alter column ign drop not null;
do $$
begin
  alter table public.orders drop constraint if exists orders_game_check;
  alter table public.orders add constraint orders_game_check check (game in ('pubg','ml','ff','roblox'));
end $$;

-- 2) Hamosu Row Level Security (RLS) — importante atu proteje data cliente
alter table public.orders enable row level security;

-- Públiku (klienti) bele KRIA pedidu foun de'it, status tenki "menunggu_verifikasi"
drop policy if exists "public_can_insert_orders" on public.orders;
create policy "public_can_insert_orders"
  on public.orders for insert
  to public
  with check (status = 'menunggu_verifikasi');

-- De'it admin ne'ebe halo login (authenticated) bele haree LISTA hotu pedidu
drop policy if exists "admin_can_select_orders" on public.orders;
create policy "admin_can_select_orders"
  on public.orders for select
  to authenticated
  using (true);

-- De'it admin bele update status
drop policy if exists "admin_can_update_orders" on public.orders;
create policy "admin_can_update_orders"
  on public.orders for update
  to authenticated
  using (true)
  with check (true);

-- De'it admin bele apaga pedidu (hamos dadus fiktivu)
drop policy if exists "admin_can_delete_orders" on public.orders;
create policy "admin_can_delete_orders"
  on public.orders for delete
  to authenticated
  using (true);

-- 3) Funsaun públiku ba "Cek Status" — klienti bele buka uza Order ID de'it,
--    WhatsApp de'it, ka rua-rua (importante: pelumenus 1 filtru tenki fo).
--    p_game opsional — atu limita rezultadu ba jogu ida de'it (pubg/ml/ff).
drop function if exists public.track_order(text, text);
drop function if exists public.track_orders(text, text);
drop function if exists public.track_orders(text, text, text);

create or replace function public.track_orders(p_order_id text default null, p_whatsapp text default null, p_game text default null)
returns table (
  id text,
  status text,
  game text,
  pkg_uc integer,
  pkg_unit_uc integer,
  qty integer,
  pkg_price numeric,
  game_id text,
  zone_id text,
  ign text,
  payment_method text,
  admin_comment text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select o.id, o.status, o.game, o.pkg_uc, o.pkg_unit_uc, o.qty, o.pkg_price, o.game_id, o.zone_id, o.ign, o.payment_method, o.admin_comment, o.created_at
  from public.orders o
  where (p_order_id is not null or p_whatsapp is not null)
    and (p_order_id is null or o.id = p_order_id)
    and (p_whatsapp is null or o.whatsapp = p_whatsapp)
    and (p_game is null or o.game = p_game)
  order by o.created_at desc
  limit 50;
$$;

grant execute on function public.track_orders(text, text, text) to anon, authenticated;

-- 4) Storage bucket ba imajen bukti transferénsia
insert into storage.buckets (id, name, public)
values ('proofs', 'proofs', true)
on conflict (id) do nothing;

-- Públiku bele UPLOAD bukti transfer (write)
-- Uza "to public" (la'os "to anon" de'it) atu evita problema role-matching
drop policy if exists "public_can_upload_proofs" on storage.objects;
create policy "public_can_upload_proofs"
  on storage.objects for insert
  to public
  with check (bucket_id = 'proofs');

-- Públiku bele haree/hatudu bukti transfer (public bucket, la presiza login)
drop policy if exists "public_can_read_proofs" on storage.objects;
create policy "public_can_read_proofs"
  on storage.objects for select
  to public
  using (bucket_id = 'proofs');

-- De'it admin bele apaga imajen bukti (bainhira apaga pedidu fiktivu)
drop policy if exists "admin_can_delete_proofs" on storage.objects;
create policy "admin_can_delete_proofs"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'proofs');

-- =====================================================================
-- 5) Push notifications — subscription husi device admin
-- =====================================================================
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

-- De'it admin ne'ebe login bele kria/haree/apaga subscription (device sira)
drop policy if exists "admin_can_manage_push_subs" on public.push_subscriptions;
create policy "admin_can_manage_push_subs"
  on public.push_subscriptions for all
  to authenticated
  using (true)
  with check (true);

-- =====================================================================
-- 6) Trigger atu invoka Edge Function "notify-push" kada vez pedidu foun tama
-- Nota: uza pg_net diretamente (la'os liu husi Dashboard > Database > Webhooks UI),
-- tanba iha alguns projeto Supabase, UI ne'e iha erru "schema supabase_functions
-- does not exist" (bug husi platform, la'os erru husi setup). Métodu iha ne'e
-- kontorna problema ne'e.
--
-- Project ref ne'e: zreejzlomoroygsuogea
-- (haree iha Project Settings > General).
-- =====================================================================
create extension if not exists pg_net with schema extensions;

create or replace function public.trigger_notify_push()
returns trigger
language plpgsql
as $$
begin
  perform net.http_post(
    url := 'https://zreejzlomoroygsuogea.supabase.co/functions/v1/notify-push',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object('type', 'INSERT', 'table', 'orders', 'record', row_to_json(NEW))
  );
  return NEW;
end;
$$;

drop trigger if exists orders_notify_push on public.orders;
create trigger orders_notify_push
  after insert on public.orders
  for each row
  execute function public.trigger_notify_push();

-- =====================================================================
-- 7) Visitor counter ba portal (halaman "Hili Jogu")
-- =====================================================================
create table if not exists public.visitor_stats (
  id smallint primary key default 1,
  count bigint not null default 0,
  constraint single_row check (id = 1)
);
insert into public.visitor_stats (id, count) values (1, 0) on conflict (id) do nothing;

alter table public.visitor_stats enable row level security;

-- La bele haree/troka diretamente husi tabela — de'it liu husi funsaun kraik
drop policy if exists "no_direct_access_visitor_stats" on public.visitor_stats;
create policy "no_direct_access_visitor_stats"
  on public.visitor_stats for all
  to anon, authenticated
  using (false)
  with check (false);

create or replace function public.increment_visitor_count()
returns bigint
language sql
security definer
set search_path = public
as $$
  update public.visitor_stats set count = count + 1 where id = 1
  returning count;
$$;

create or replace function public.get_visitor_count()
returns bigint
language sql
security definer
set search_path = public
as $$
  select count from public.visitor_stats where id = 1;
$$;

grant execute on function public.increment_visitor_count() to anon, authenticated;
grant execute on function public.get_visitor_count() to anon, authenticated;

