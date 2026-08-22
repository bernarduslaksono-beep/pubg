// Supabase Edge Function: notify-push
// Invoka automátikamente husi Database Webhook (event: INSERT iha tabela "orders").
// Haruka Web Push notification ba hotu-hotu device admin ne'ebe ona subscribe.

import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
// SUPABASE_URL no SUPABASE_SERVICE_ROLE_KEY fo automátikamente husi Supabase
// iha kada Edge Function — la presiza hatama manual.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

webpush.setVapidDetails(
  "mailto:admin@ucpubgtl.example",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const order = payload.record; // Database Webhook fo dadus pedidu foun iha "record"

    if (!order) {
      return new Response(JSON.stringify({ ok: false, error: "no order record" }), { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: subs, error } = await supabase.from("push_subscriptions").select("*");
    if (error) throw error;

    const GAME_NAMES = { pubg: "PUBG Mobile", ml: "Mobile Legends", ff: "Free Fire", roblox: "Robux Roblox" };
    const CURRENCY = { pubg: "UC", ml: "Diamond", ff: "Diamond", roblox: "Robux" };
    const gameName = GAME_NAMES[order.game] ?? order.game ?? "";
    const unit = CURRENCY[order.game] ?? "UC";

    const amountLine = order.pkg_unit_uc
      ? `${order.pkg_unit_uc} ${unit} × ${order.qty} (${order.pkg_uc} ${unit})`
      : `${order.pkg_uc} ${unit}`;

    const notifPayload = JSON.stringify({
      title: `🔔 Pedidu ${gameName} Foun!`,
      body: `User ID: ${order.game_id} — ${amountLine} — $${order.pkg_price}`,
      orderId: order.id,
    });

    let sent = 0;
    const expired = [];

    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          notifPayload
        );
        sent++;
      } catch (err) {
        // Subscription ona ekspira ka la valid ona — marka atu hamos
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          expired.push(sub.endpoint);
        }
        console.error("push failed for", sub.endpoint, err?.message ?? err);
      }
    }

    if (expired.length > 0) {
      await supabase.from("push_subscriptions").delete().in("endpoint", expired);
    }

    return new Response(JSON.stringify({ ok: true, sent, total: subs?.length ?? 0 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
  }
});
