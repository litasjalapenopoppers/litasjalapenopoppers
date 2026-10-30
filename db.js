/* =========================================================
   Lita's Jalapeño Poppers — connection to the Supabase database
   Used by:
     - the public website (saves each order that gets sent)
     - the staff app in /staff/ (logins + inventory)
   ========================================================= */

/* ---------------------------------------------------------
   EDIT ME: paste your Supabase project's URL and PUBLISHABLE key.
   Get them from: Supabase dashboard → Project Settings → API Keys.

   The publishable key (starts with sb_publishable_) is SAFE to leave in
   this public file, because the database's security rules (see the .sql
   files) control what it may do. If your dashboard only shows the older
   "anon" key, that works in the same place.

   NEVER paste the "secret" key or the "service_role" key here.

   (The variable below is still called SUPABASE_ANON_KEY — that's just a
   label; the publishable key goes in it.)

   Until these are filled in, order logging is silently skipped and the
   WhatsApp order still works normally.
--------------------------------------------------------- */
const SUPABASE_URL = "https://vmukppuulhjhgtzewlja.supabase.co"; // <-- replace
const SUPABASE_ANON_KEY = "sb_publishable_T2uj5lRowF-slB2ftg1hdw_y8eYA4Wu"; // <-- replace

let _supabaseClient = null;

function supabaseIsConfigured() {
  return SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("YOUR-PROJECT-REF") &&
    !SUPABASE_ANON_KEY.includes("YOUR-");
}

function getSupabaseClient() {
  if (!supabaseIsConfigured()) return null;
  if (!_supabaseClient && window.supabase) {
    _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _supabaseClient;
}

/* ---------------------------------------------------------
   Saves one order + its line items. Called from
   sendWhatsAppOrder() in script.js WITHOUT being awaited —
   this must never delay or block the WhatsApp handoff, since
   that's what actually gets the order to the kitchen. Any
   failure here (not configured yet, network hiccup, etc.) is
   caught and logged to the console only.

   The order's ID is created here in the browser rather than
   asking the database to send the new row back: the public
   website is allowed to INSERT orders but not to READ them, so
   asking for the row back would be refused.

   cartSnapshot: [{ id, name, price, qty }, ...]
   meta: { name, fulfillment, notes, language, total }
--------------------------------------------------------- */
async function logOrderToDatabase(cartSnapshot, meta) {
  const client = getSupabaseClient();
  if (!client) return; // not configured yet

  try {
    const orderId = (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        });

    const { error: orderError } = await client.from("orders").insert({
      id: orderId,
      customer_name: meta.name || null,
      fulfillment: meta.fulfillment || null,
      notes: meta.notes || null,
      language: meta.language || null,
      total: meta.total,
       source: meta.source || "online",
    });
    if (orderError) throw orderError;

    const itemRows = cartSnapshot.map((line) => ({
      order_id: orderId,
      item_id: line.id,
      item_name: line.name,
      unit_price: line.price,
      quantity: line.qty,
      line_total: +(line.price * line.qty).toFixed(2),
    }));

    const { error: itemsError } = await client.from("order_items").insert(itemRows);
    if (itemsError) throw itemsError;
  } catch (err) {
    console.error("Order logging failed (the WhatsApp order still went through):", err);
  }
}
