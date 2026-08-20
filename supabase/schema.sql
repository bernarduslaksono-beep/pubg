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
  customer_name text not null,
  whatsapp text not null,
  game_id text not null,
  ign text not null,
  note text default '',
  payment_method text not null,
  pkg_uc integer not null,
  pkg_price numeric not null,
  proof_url text not null,
  status text not null default 'menunggu_verifikasi'
    check (status in ('menunggu_verifikasi','terverifikasi','terkirim','dibatalkan')),
  created_at timestamptz not null default now()
);

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

-- 3) Funsaun públiku ba "Cek Status" — klienti bele buka uza Order ID de'it,
--    WhatsApp de'it, ka rua-rua (importante: pelumenus 1 filtru tenki fo)
drop function if exists public.track_order(text, text);

create or replace function public.track_orders(p_order_id text default null, p_whatsapp text default null)
returns table (
  id text,
  status text,
  pkg_uc integer,
  pkg_price numeric,
  game_id text,
  ign text,
  payment_method text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select o.id, o.status, o.pkg_uc, o.pkg_price, o.game_id, o.ign, o.payment_method, o.created_at
  from public.orders o
  where (p_order_id is not null or p_whatsapp is not null)
    and (p_order_id is null or o.id = p_order_id)
    and (p_whatsapp is null or o.whatsapp = p_whatsapp)
  order by o.created_at desc
  limit 50;
$$;

grant execute on function public.track_orders(text, text) to anon, authenticated;

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
