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
alter table public.orders add column if not exists device_fingerprint text;
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

-- =====================================================================
-- 8) Security: hases order fiktivu/spam — baseia iha "device_fingerprint"
-- (la'os de'it IP), atu limita:
--   (a) máximu 3 pedidu ne'ebe seidauk prosesu ("menunggu_verifikasi")
--   (b) máximu 5 pedidu "dibatalkan" iha loron hanesan (tuir horário Timor-Leste)
--   (c) device ne'ebe admin ona blokeia manual
-- =====================================================================

-- Lista device ne'ebe admin blokeia manual (ezemplu: pedidu fiktivu klaru)
create table if not exists public.blocked_devices (
  device_fingerprint text primary key,
  blocked_at timestamptz not null default now(),
  reason text
);

alter table public.blocked_devices enable row level security;

-- De'it admin (authenticated) bele haree/hatama/hasai husi lista blokeia.
-- Cliente (anon) la iha asesu diretu — check_order_eligibility (security definer)
-- de'it mak konsulta lista ne'e ba klienti.
drop policy if exists "admin_can_manage_blocked_devices" on public.blocked_devices;
create policy "admin_can_manage_blocked_devices"
  on public.blocked_devices for all
  to authenticated
  using (true)
  with check (true);

create or replace function public.check_order_eligibility(p_fingerprint text)
returns table (allowed boolean, reason text, pending_count int, cancelled_count int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pending int;
  v_cancelled int;
  v_blocked boolean;
begin
  if p_fingerprint is null or p_fingerprint = '' then
    return query select true, null::text, 0, 0;
    return;
  end if;

  select exists(
    select 1 from public.blocked_devices where device_fingerprint = p_fingerprint
  ) into v_blocked;

  if v_blocked then
    return query select false, 'blocked', 0, 0;
    return;
  end if;

  select count(*) into v_pending
  from public.orders
  where device_fingerprint = p_fingerprint
    and status = 'menunggu_verifikasi';

  select count(*) into v_cancelled
  from public.orders
  where device_fingerprint = p_fingerprint
    and status = 'dibatalkan'
    and (created_at at time zone 'Asia/Dili')::date = (now() at time zone 'Asia/Dili')::date;

  if v_pending >= 3 then
    return query select false, 'pending_limit', v_pending, v_cancelled;
    return;
  end if;

  if v_cancelled >= 5 then
    return query select false, 'cancelled_limit', v_pending, v_cancelled;
    return;
  end if;

  return query select true, null::text, v_pending, v_cancelled;
end;
$$;

grant execute on function public.check_order_eligibility(text) to anon, authenticated;

-- =====================================================================
-- 9) Deteksi prova transferénsia duplikadu — de'it bloke se imajen hanesan
-- ona uza ba pedidu SELUK ne'ebe SEIDAUK kanselamentu (status != 'dibatalkan').
-- Se pedidu tuan ona kanselamentu, prova hanesan bele uza fila fali (ezemplu:
-- cliente halo sala iha ID/naran, hafoin order fila fali ho prova hanesan).
-- =====================================================================
alter table public.orders add column if not exists proof_hash text;

create or replace function public.check_proof_duplicate(p_proof_hash text)
returns table (order_id text, status text)
language sql
security definer
set search_path = public
as $$
  select id, status
  from public.orders
  where p_proof_hash is not null
    and proof_hash = p_proof_hash
    and status != 'dibatalkan'
  order by created_at desc
  limit 1;
$$;

grant execute on function public.check_proof_duplicate(text) to anon, authenticated;

-- =====================================================================
-- 10) Jam operasional loja — jadwal automátiku + override manual admin.
-- Cliente bele haree website (pakote, presu) bainhira taka, maibe la bele
-- halo pedidu to'o loja loke fila fali (tuir jadwal ka admin loke manual).
-- =====================================================================
create table if not exists public.store_settings (
  id smallint primary key default 1,
  open_time time not null default '08:00',
  close_time time not null default '23:00',
  manual_override text check (manual_override in ('open', 'closed')),
  constraint single_row_settings check (id = 1)
);
insert into public.store_settings (id, open_time, close_time, manual_override)
values (1, '08:00', '23:00', null)
on conflict (id) do nothing;

alter table public.store_settings enable row level security;

-- De'it admin (authenticated) bele haree/troka konfigurasaun — cliente (anon)
-- de'it liu husi funsaun get_store_status() (security definer) kraik.
drop policy if exists "admin_can_manage_store_settings" on public.store_settings;
create policy "admin_can_manage_store_settings"
  on public.store_settings for all
  to authenticated
  using (true)
  with check (true);

create or replace function public.get_store_status()
returns table (is_open boolean, open_time time, close_time time, manual_override text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_open_time time;
  v_close_time time;
  v_override text;
  v_now time;
  v_is_open boolean;
begin
  select s.open_time, s.close_time, s.manual_override
  into v_open_time, v_close_time, v_override
  from public.store_settings s
  where s.id = 1;

  if v_override = 'open' then
    v_is_open := true;
  elsif v_override = 'closed' then
    v_is_open := false;
  else
    v_now := (now() at time zone 'Asia/Dili')::time;
    if v_open_time <= v_close_time then
      v_is_open := v_now >= v_open_time and v_now < v_close_time;
    else
      -- kobre kazu jadwal ne'ebe "taka liu tenki-meia-noite" (ezemplu 22:00–06:00)
      v_is_open := v_now >= v_open_time or v_now < v_close_time;
    end if;
  end if;

  return query select v_is_open, v_open_time, v_close_time, v_override;
end;
$$;

grant execute on function public.get_store_status() to anon, authenticated;

-- =====================================================================
-- 11) Kontrola stock — admin bele marka denom espesifiku "Stok Hotu" (la
-- disponivel ona) direta husi dashboard, la presiza troka kódigu/redeploy.
-- Públiku bele haree (atu hatudu kartu redu iha loja), de'it admin bele troka.
-- =====================================================================
create table if not exists public.disabled_packages (
  game text not null,
  amount integer not null,
  disabled_at timestamptz not null default now(),
  primary key (game, amount)
);

alter table public.disabled_packages enable row level security;

drop policy if exists "public_can_read_disabled_packages" on public.disabled_packages;
create policy "public_can_read_disabled_packages"
  on public.disabled_packages for select
  to public
  using (true);

drop policy if exists "admin_can_manage_disabled_packages" on public.disabled_packages;
create policy "admin_can_manage_disabled_packages"
  on public.disabled_packages for all
  to authenticated
  using (true)
  with check (true);

