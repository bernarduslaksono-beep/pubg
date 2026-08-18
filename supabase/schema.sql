-- =====================================================================
-- UC-PUBG Timor Leste — Supabase schema
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
create policy "public_can_insert_orders"
  on public.orders for insert
  to anon
  with check (status = 'menunggu_verifikasi');

-- De'it admin ne'ebe halo login (authenticated) bele haree LISTA hotu pedidu
create policy "admin_can_select_orders"
  on public.orders for select
  to authenticated
  using (true);

-- De'it admin bele update status
create policy "admin_can_update_orders"
  on public.orders for update
  to authenticated
  using (true)
  with check (true);

-- 3) Funsaun públiku ba "Cek Status" — klienti fo Order ID + WhatsApp de'it,
--    la bele haree lista hotu pedidu (privacy ba cliente seluk)
create or replace function public.track_order(p_order_id text, p_whatsapp text)
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
  where o.id = p_order_id and o.whatsapp = p_whatsapp
  limit 1;
$$;

grant execute on function public.track_order(text, text) to anon, authenticated;

-- 4) Storage bucket ba imajen bukti transferénsia
insert into storage.buckets (id, name, public)
values ('proofs', 'proofs', true)
on conflict (id) do nothing;

-- Públiku bele UPLOAD bukti transfer (write), maibe la bele apaga/troka file ema seluk nian
create policy "public_can_upload_proofs"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'proofs');

-- Bukti transfer públiku (bucket "public") atu imajen ne'e bele hatudu iha website
-- liu husi public URL — la presiza login atu haree
create policy "public_can_read_proofs"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'proofs');
