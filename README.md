# UC-PUBG Timor Leste — Website Top Up UC

Website React (Vite) untuk jual UC PUBG: halaman pesan, cek status, dan dashboard admin.
Backend pakai **Supabase** (database + storage foto bukti transfer + login admin), source
code di **GitHub**, hosting di **Vercel**. Semua gratis untuk skala bisnis kecil-menengah.

---

## Bahagian 1 — Setup Supabase (backend)

1. Buka https://supabase.com → **Start your project** → login pakai GitHub/Google.
2. Klik **New project** → kasih naran (misal `uc-pubg-timor-leste`) → hatama database
   password (guarda ne'e iha fatin seguru) → hili region besik (misal `Southeast Asia
   (Singapore)`) → **Create new project**. Hein minutu 1-2 hodi Supabase prepara projeto.
3. Iha menu kiri, klik **SQL Editor** → **New query**.
4. Loke file `supabase/schema.sql` iha project ne'e, kopia conteudu tomak, paste iha SQL
   Editor, hafoin klik **Run** (ka `Ctrl/Cmd + Enter`). Ne'e sei:
   - Kria tabela `orders`
   - Ativa Row Level Security (RLS) — públiku bele kria pedidu, maibe de'it admin bele
     haree lista hotu pedidu no muda status
   - Kria funsaun `track_order` ba fitur "Cek Status" (públiku, seguru — la hatudu dadus
     cliente seluk)
   - Kria bucket Storage `proofs` ba imajen bukti transferénsia
5. Kria akun admin: menu kiri **Authentication → Users → Add user → Create new user**.
   Hatama email + password ita boot rasik nian (ida ne'e mak login ba `/admin`).
6. Foti kredensial API: menu kiri **Project Settings (ikon roda) → API**. Kopia:
   - **Project URL**
   - **anon public** key

---

## Bahagian 2 — Konfigura projeto iha lokal

Presiza [Node.js](https://nodejs.org) versaun 18 ka aas liu tan.

```bash
cd uc-pubg-app
npm install
cp .env.example .env
```

Loke file `.env`, hatama:

```
VITE_SUPABASE_URL=<Project URL husi pasu 6>
VITE_SUPABASE_ANON_KEY=<anon public key husi pasu 6>
```

Test iha lokal:

```bash
npm run dev
```

Loke `http://localhost:5173` — tenta submete pedidu, cek status, no login admin.

---

## Bahagian 3 — Haruka kodigu ba GitHub

1. Kria repository foun iha https://github.com/new (públiku ka privadu, hotu-hotu diak —
   maibe **la** bele hatama `.env`, file ne'e ona iha `.gitignore` atu proteje credential).
2. Iha terminal, husi pasta `uc-pubg-app`:

```bash
git init
git add .
git commit -m "Initial commit — UC-PUBG website"
git branch -M main
git remote add origin https://github.com/<username>/<nome-repo>.git
git push -u origin main
```

(Troka `<username>` no `<nome-repo>` ho naran GitHub ita boot nian.)

---

## Bahagian 4 — Deploy iha Vercel

1. Buka https://vercel.com → login pakai akun GitHub.
2. Klik **Add New → Project**.
3. Hili repository GitHub ne'ebe foin push (Vercel sei husu autorizasaun asesu GitHub
   iha primeira vez).
4. Iha pajina "Configure Project":
   - **Framework Preset**: Vercel sei deteta automatikamente "Vite".
   - Loke seksaun **Environment Variables**, hatama 2 variavel hanesan iha `.env`:
     - `VITE_SUPABASE_URL` = Project URL
     - `VITE_SUPABASE_ANON_KEY` = anon public key
5. Klik **Deploy**. Hein minutu 1-2.
6. Bainhira remata, Vercel fo link públiku hanesan
   `https://<nome-repo>.vercel.app` — website ona online!

### Domain rasik (opsional)

Iha Vercel dashboard → project → **Settings → Domains** → hatama domain ita boot nian
(cth. `ucpubgtl.com`) → tuir instrusaun atu update DNS iha fatin ita boot sosa domain.

### Update website iha future

Kada vez ita boot `git push` ba branch `main`, Vercel automatikamente build no deploy
versaun foun — la presiza halo dahuluk manual.

---

## Ringkasan alur data

- **Pesan UC** → dadus tama ba tabela `orders` iha Supabase, imajen bukti tama ba
  Storage bucket `proofs`.
- **Cek Status** → cliente hatama Order ID + WhatsApp, sistema uza funsaun `track_order`
  atu buka dadus (la hatudu lista pedidu seluk).
- **Admin** → login pakai email/password husi Bahagian 1 pasu 5, haree hotu pedidu
  real-time (atualiza automatik bainhira iha pedidu foun), muda status, haree laporan.

## Kustu

Supabase Free tier: 500MB database, 1GB storage, 50,000 monthly active users — sufisiente
ba negosiu ki'ik-medium. Vercel Free tier (Hobby): bandwidth 100GB/fulan, sufisiente ba
website ho traffic normal. Se negosiu boot liu, hotu-hotu iha plan bayar tuir uzu.

## Kalau butuh bantuan lanjut

Kodigu iha `src/pages/` (OrderPage, TrackPage, AdminPage), dadus pakote & metode
pagamentu iha `src/data/packages.js`, koneksaun Supabase iha `src/supabase.js`, no
schema database iha `supabase/schema.sql`. Troka presu pakote, numeru konta, ka
adisiona funsionalidade foun liu husi edita file sira ne'e, hafoin `git push` fali.
