/* =========================================================
   Lita's Jalapeño Poppers — staff app (inventory, Phase 1)
   Sign in, then see today's stock. The owner can also set
   counts, add stock, change each item's settings and see the
   change log. Every change goes through a database function
   that re-checks the owner role, so hiding buttons here is for
   convenience only — it is not what keeps stock safe.

   Uses (from the other files): getSupabaseClient / db.js,
   STRINGS / i18n.js, CATEGORY_ORDER + MENU_STRUCTURE / script.js
   ========================================================= */
(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const VIEWS = ["loading", "setup", "login", "notstaff", "error", "app"];
  const MODE_LABELS = { daily: "Daily batch", carryover: "Carry-over", untracked: "Not tracked" };
  const REASON_LABELS = {
    morning_count: "Morning count",
    restock: "Added stock",
    adjustment: "Correction",
    mode_change: "Settings changed",
    order_confirmed: "Order confirmed",
    walkin_sale: "Walk-in sale",
    phone_order: "Phone order",
    order_cancelled: "Order cancelled",
  };
  const REFRESH_MS = 20000;

  let client = null;
  let session = null;
  let me = null;
  let inventory = {};
  let refreshTimer = null;
  const rowRefs = {};
  const catRefs = {};

  /* ---------- small helpers ---------- */
  function itemName(id) { return STRINGS.en["item_" + id + "_name"] || id; }
  function catName(cat) { return STRINGS.en["cat_" + cat] || cat; }
  function allItemIds() {
    return CATEGORY_ORDER.reduce((acc, c) => acc.concat(MENU_STRUCTURE[c]), []);
  }
  function isOwner() { return !!me && me.role === "owner"; }

  function h(tag, attrs) {
    const el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        const v = attrs[k];
        if (v === false || v === null || v === undefined) return;
        if (k === "class") el.className = v;
        else el.setAttribute(k, v === true ? "" : v);
      });
    }
    for (let i = 2; i < arguments.length; i++) {
      const kid = arguments[i];
      if (kid === null || kid === undefined || kid === false) continue;
      el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }

  function showView(name) {
    VIEWS.forEach((v) => { const el = $('[data-view="' + v + '"]'); if (el) el.hidden = v !== name; });
  }

  let toastTimer = null;
  function toast(message, isError) {
    const el = $("[data-toast]");
    el.textContent = message;
    el.classList.toggle("error", !!isError);
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 3500);
  }

  function isAuthError(err) {
    return !!err && (/jwt|not authenticated/i.test(err.message || "") || err.code === "PGRST301");
  }

  function handleError(err) {
    if (isAuthError(err)) {
      toast("Your session ended. Please sign in again.", true);
      signOut();
      return;
    }
    toast((err && err.message) ? err.message : "Something went wrong. Please try again.", true);
  }

  function parseWholeNumber(text) {
    const t = String(text).trim();
    if (!/^\d+$/.test(t)) return null;
    return Number(t);
  }

  /* ---------- stock status ---------- */
  function rowData(id) {
    return inventory[id] || { item_id: id, mode: "untracked", stock: null, low_threshold: 5 };
  }
  function statusOf(r) {
    if (r.mode === "untracked") return { key: "untracked", label: "Not tracked" };
    if (r.stock === null || r.stock === undefined) return { key: "unset", label: "Not set" };
    if (r.stock === 0) return { key: "out", label: "Sold out" };
    if (r.stock <= r.low_threshold) return { key: "low", label: "Low — " + r.stock + " left" };
    return { key: "ok", label: r.stock + " left" };
  }

  /* ---------- building the screen ---------- */
  function buildList() {
    const list = $("[data-list]");
    list.textContent = "";
    Object.keys(rowRefs).forEach((k) => delete rowRefs[k]);
    Object.keys(catRefs).forEach((k) => delete catRefs[k]);

    CATEGORY_ORDER.forEach((cat) => {
      const flags = h("span", { class: "st-cat-flags" });
      catRefs[cat] = flags;
      const details = h("details", { class: "st-cat", open: true },
        h("summary", null, h("span", null, catName(cat)), flags));
      MENU_STRUCTURE[cat].forEach((id) => details.append(buildRow(id)));
      list.append(details);
    });
  }

  function buildRow(id) {
    const name = itemName(id);
    const chip = h("span", { class: "st-chip" });
    const modeText = h("span", { class: "st-mode" });
    const row = h("div", { class: "st-row", "data-item": id },
      h("div", { class: "st-row-top" },
        h("div", { class: "st-name" }, name, modeText),
        chip));
    const refs = { row, chip, modeText, busy: false };
    rowRefs[id] = refs;

    if (isOwner()) {
      const count = h("input", { type: "number", min: "0", step: "1", inputmode: "numeric",
        placeholder: "Count", class: "st-count", "aria-label": "Count for " + name });
      const setBtn = h("button", { type: "button", class: "st-btn st-btn-primary" }, "Set");
      const addBtn = h("button", { type: "button", class: "st-btn" }, "Add");
      const modeSel = h("select", { "aria-label": "Mode for " + name },
        ...Object.keys(MODE_LABELS).map((k) => h("option", { value: k }, MODE_LABELS[k])));
      const thr = h("input", { type: "number", min: "0", step: "1", inputmode: "numeric",
        "aria-label": "Low-stock level for " + name });
      const saveBtn = h("button", { type: "button", class: "st-btn st-btn-small" }, "Save settings");
      const settings = h("details", { class: "st-settings" },
        h("summary", null, "Settings"),
        h("div", { class: "st-settings-body" },
          h("label", null, "Mode", modeSel),
          h("label", null, "Warn at or below", thr),
          saveBtn));
      row.append(h("div", { class: "st-controls" }, count, setBtn, addBtn), settings);
      Object.assign(refs, { count, setBtn, addBtn, modeSel, thr, saveBtn, dirty: false });
      // Remember when the owner has edited a setting but not saved it yet, so
      // the automatic refresh doesn't overwrite what they're in the middle of.
      modeSel.addEventListener("change", () => { refs.dirty = true; });
      thr.addEventListener("input", () => { refs.dirty = true; });

      const doSet = () => {
        const n = parseWholeNumber(count.value);
        if (n === null) { toast("Enter a whole number, 0 or more.", true); return; }
        const reason = rowData(id).mode === "daily" ? "morning_count" : "adjustment";
        runAction(id, async () => {
          await rpc("set_stock", { p_item_id: id, p_count: n, p_reason: reason });
          count.value = "";
          toast(name + ": set to " + n);
        });
      };
      setBtn.addEventListener("click", doSet);
      count.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); doSet(); } });
      addBtn.addEventListener("click", () => {
        const n = parseWholeNumber(count.value);
        if (n === null || n < 1) { toast("Enter how many to add (1 or more).", true); return; }
        runAction(id, async () => {
          await rpc("add_stock", { p_item_id: id, p_qty: n });
          count.value = "";
          toast(name + ": added " + n);
        });
      });
      saveBtn.addEventListener("click", () => {
        const n = parseWholeNumber(thr.value);
        if (n === null) { toast("The low-stock level must be a whole number, 0 or more.", true); return; }
        const mode = modeSel.value; // read now: runAction re-renders the row before it starts
        runAction(id, async () => {
          await rpc("set_item_settings", { p_item_id: id, p_mode: mode, p_low_threshold: n });
          refs.dirty = false;
          toast(name + ": settings saved");
        });
      });
    }
    return row;
  }

  /* ---------- updating what's shown ---------- */
  function updateRow(id) {
    const refs = rowRefs[id];
    if (!refs) return;
    const r = rowData(id);
    const s = statusOf(r);
    refs.chip.textContent = s.label;
    refs.chip.className = "st-chip st-chip--" + s.key;
    refs.modeText.textContent = MODE_LABELS[r.mode] || r.mode;
    if (isOwner()) {
      const untracked = r.mode === "untracked";
      refs.setBtn.disabled = refs.busy || untracked;
      refs.addBtn.disabled = refs.busy || untracked;
      refs.saveBtn.disabled = refs.busy;
      refs.count.disabled = untracked;
      refs.count.placeholder = untracked ? "Not tracked" : "Count";
      if (!refs.dirty) {
        refs.modeSel.value = r.mode;
        refs.thr.value = r.low_threshold;
      }
    }
  }

  function chipEl(key, text) { return h("span", { class: "st-chip st-chip--" + key }, text); }

  function updateAll() {
    const totals = { out: 0, low: 0, unset: 0, tracked: 0 };
    CATEGORY_ORDER.forEach((cat) => {
      const c = { out: 0, low: 0 };
      MENU_STRUCTURE[cat].forEach((id) => {
        updateRow(id);
        const r = rowData(id);
        if (r.mode === "untracked") return;
        totals.tracked++;
        const k = statusOf(r).key;
        if (k === "out") { totals.out++; c.out++; }
        else if (k === "low") { totals.low++; c.low++; }
        else if (k === "unset") totals.unset++;
      });
      const flags = catRefs[cat];
      flags.textContent = "";
      if (c.out) flags.append(chipEl("out", c.out + " sold out"));
      if (c.low) flags.append(chipEl("low", c.low + " low"));
    });

    const summary = $("[data-summary]");
    summary.textContent = "";
    if (totals.tracked === 0) {
      summary.append(h("p", { class: "st-hint" }, isOwner()
        ? "No items are being tracked yet. Open an item's Settings to turn tracking on."
        : "No items are being tracked yet."));
    } else {
      summary.append(chipEl("out", totals.out + " sold out"), chipEl("low", totals.low + " low"),
        chipEl("unset", totals.unset + " not set"));
      if (totals.unset > 0 && isOwner()) {
        summary.append(h("span", { class: "st-hint" }, "Enter a count for each item to turn on its limit."));
      }
    }
  }

  function setUpdatedNow() {
    $("[data-updated]").textContent = "Updated " +
      new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  /* ---------- talking to the database ---------- */
  async function rpc(name, args) {
    const { data, error } = await client.rpc(name, args);
    if (error) throw error;
    return data;
  }

  async function loadInventory() {
    const { data, error } = await client.from("inventory").select("*");
    if (error) throw error;
    inventory = {};
    (data || []).forEach((r) => { inventory[r.item_id] = r; });
  }

  async function refresh(quiet) {
    try {
      await loadInventory();
      updateAll();
      setUpdatedNow();
    } catch (err) {
      if (!quiet || isAuthError(err)) handleError(err);
    }
  }

  async function runAction(id, fn) {
    const refs = rowRefs[id];
    refs.busy = true;
    updateRow(id);
    try {
      await fn();
      await refresh(true);
      if (!$("[data-log-panel]").hidden) renderLog();
    } catch (err) {
      handleError(err);
    } finally {
      refs.busy = false;
      updateRow(id);
    }
  }

  function startRefresh() {
    stopRefresh();
    refreshTimer = setInterval(() => { if (!document.hidden) refresh(true); }, REFRESH_MS);
  }
  function stopRefresh() { if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; } }

  /* ---------- change log (owner) ---------- */
  async function renderLog() {
    const body = $("[data-log-body]");
    body.textContent = "Loading…";
    try {
      const [logRes, staffRes] = await Promise.all([
        client.from("stock_log").select("*").order("created_at", { ascending: false }).limit(50),
        client.from("staff").select("user_id, display_name"),
      ]);
      if (logRes.error) throw logRes.error;
      const names = {};
      ((staffRes && staffRes.data) || []).forEach((s) => { names[s.user_id] = s.display_name; });
      const rows = logRes.data || [];
      body.textContent = "";
      if (!rows.length) { body.append(h("p", { class: "st-hint" }, "No changes yet.")); return; }
      const table = h("table", null,
        h("thead", null, h("tr", null,
          h("th", null, "When"), h("th", null, "Item"), h("th", { class: "st-num" }, "Change"),
          h("th", { class: "st-num" }, "Now"), h("th", null, "Reason"), h("th", null, "By"), h("th", null, "Note"))),
        h("tbody", null, ...rows.map((r) => {
          const change = r.change === null || r.change === undefined ? "—" : (r.change > 0 ? "+" + r.change : String(r.change));
          const when = new Date(r.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
          return h("tr", null,
            h("td", null, when), h("td", null, itemName(r.item_id)),
            h("td", { class: "st-num" }, change),
            h("td", { class: "st-num" }, r.new_stock === null || r.new_stock === undefined ? "—" : String(r.new_stock)),
            h("td", null, REASON_LABELS[r.reason] || r.reason),
            h("td", null, names[r.actor] || "—"), h("td", null, r.note || ""));
        })));
      body.append(table);
    } catch (err) {
      body.textContent = "";
      handleError(err);
    }
  }

  function toggleLog() {
    const panel = $("[data-log-panel]");
    if (!panel.hidden) { panel.hidden = true; return; }
    panel.hidden = false;
    renderLog();
  }

  /* ---------- sign in / out ---------- */
  async function signOut() {
    stopRefresh();
    try { if (client) await client.auth.signOut(); } catch (e) { /* ignore */ }
    session = null; me = null;
    $("[data-user]").hidden = true;
    $("[data-log-panel]").hidden = true;
    showView("login");
  }

  async function enterApp() {
    showView("loading");
    try {
      const { data: row, error } = await client.from("staff")
        .select("user_id, display_name, role, active")
        .eq("user_id", session.user.id).maybeSingle();
      if (error) throw error;
      if (!row || row.active === false) { showView("notstaff"); return; }
      me = row;

      $("[data-user-label]").textContent = me.display_name + " · " + (isOwner() ? "Owner" : "Staff");
      $("[data-user]").hidden = false;
      $("[data-log-toggle]").hidden = !isOwner();
      $("[data-readonly-note]").hidden = isOwner();

      if (isOwner()) {
        // Make sure every menu item has a stock row (covers newly added menu items).
        try { await rpc("ensure_inventory_items", { p_item_ids: allItemIds() }); }
        catch (e) { console.warn("Could not create missing inventory rows:", e); }
      }
      await loadInventory();
      buildList();
      updateAll();
      setUpdatedNow();
      showView("app");
      startRefresh();
    } catch (err) {
      if (isAuthError(err)) { handleError(err); return; }
      $("[data-error-message]").textContent = (err && err.message) || "Couldn't load the staff screen.";
      showView("error");
    }
  }

  async function init() {
    showView("loading");
    client = getSupabaseClient();
    if (!client) {
      if (supabaseIsConfigured() && !window.supabase) {
        $("[data-setup-message]").textContent =
          "Couldn't load the database library. Check the internet connection and reload this page.";
      }
      showView("setup");
      return;
    }
    try {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      if (data && data.session) { session = data.session; await enterApp(); }
      else showView("login");
    } catch (err) {
      $("[data-error-message]").textContent = (err && err.message) || "Couldn't reach the database.";
      showView("error");
    }
    client.auth.onAuthStateChange((event) => { if (event === "SIGNED_OUT") { /* handled in signOut() */ } });
  }

  /* ---------- wiring ---------- */
  $("[data-login-form]").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errEl = $("[data-login-error]");
    const btn = $("[data-login-submit]");
    errEl.hidden = true;
    const email = $("#st-email").value.trim();
    const password = $("#st-password").value;
    if (!email || !password) { errEl.textContent = "Enter your email and password."; errEl.hidden = false; return; }
    btn.disabled = true;
    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      session = data.session;
      $("#st-password").value = "";
      await enterApp();
    } catch (err) {
      errEl.textContent = (err && err.message) || "Couldn't sign in.";
      errEl.hidden = false;
    } finally {
      btn.disabled = false;
    }
  });
  $$("[data-signout]").forEach((b) => b.addEventListener("click", signOut));
  $("[data-refresh]").addEventListener("click", () => refresh(false));
  $("[data-log-toggle]").addEventListener("click", toggleLog);
  $("[data-retry]").addEventListener("click", init);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && me) refresh(true); });

  init();
})();
