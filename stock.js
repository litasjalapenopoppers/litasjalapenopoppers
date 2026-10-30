/* =========================================================
   Lita's Jalapeño Poppers — live stock for the public site
   Asks the database which items are low or sold out and shares
   the answer with the rest of the site (see catalog.js and the
   cart in script.js). Items the owner hasn't set a count for are
   simply left out, so they show no limit.

   If the database isn't connected (or the Phase 2 SQL hasn't been
   run yet), this quietly does nothing and nothing is limited.
   ========================================================= */
(function () {
  "use strict";
  const POLL_MS = 20000;
  let levels = {};

  // null = no limit known; otherwise { stock, low_threshold }
  window.stockInfo = function (id) { return levels[id] || null; };

  async function refreshPublicStock() {
    const client = typeof getSupabaseClient === "function" ? getSupabaseClient() : null;
    if (!client) return;
    try {
      const { data, error } = await client.rpc("get_public_stock");
      if (error) throw error;
      const next = {};
      (data || []).forEach((r) => { next[r.item_id] = { stock: r.stock, low_threshold: r.low_threshold }; });
      levels = next;
      document.dispatchEvent(new CustomEvent("stockupdated"));
    } catch (err) {
      console.warn("Live stock isn't available right now:", err);
    }
  }
  window.refreshPublicStock = refreshPublicStock;

  document.addEventListener("DOMContentLoaded", () => {
    refreshPublicStock();
    // Pages that show item lists (Menu, Wholesale) keep checking while open.
    if (window.STOCK_POLL) {
      setInterval(() => { if (!document.hidden) refreshPublicStock(); }, POLL_MS);
      document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshPublicStock(); });
    }
  });
})();
