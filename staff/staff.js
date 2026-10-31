/* =========================================================
   Lita's Jalapeño Poppers — staff app (inventory + incoming orders)
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
    spoiled: "Spoiled",
    damaged: "Damaged or dropped",
    staff_meal: "Staff meal",
    waste_other: "Other waste",
  };
  // Reasons for taking food out of stock that are NOT sales (kept separate so
  // the owner can see waste on its own when working out profit).
  const WASTE_REASONS = ["spoiled", "damaged", "staff_meal", "waste_other"];
  const WASTE_LABELS = {
    spoiled: "Spoiled",
    damaged: "Damaged or dropped",
    staff_meal: "Staff meal",
    waste_other: "Other",
  };
  const REFRESH_MS = 20000;

  // Staff sign in with a plain username. Supabase needs an email-shaped login,
  // so the username is quietly turned into one. No email is ever sent to it.
  // (If you change this, existing accounts must be created with the new domain.)
  const USERNAME_DOMAIN = "staff.litas.app";
  function loginEmailFor(input) {
    const v = String(input || "").trim().toLowerCase();
    if (v.indexOf("@") >= 0) return v;          // a full email still works
    return v + "@" + USERNAME_DOMAIN;
  }

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
      const rmQty = h("input", { type: "number", min: "1", step: "1", inputmode: "numeric",
        placeholder: "e.g. 5", "aria-label": "Amount to remove for " + name });
      const rmReason = h("select", { "aria-label": "Reason for removing " + name },
        ...WASTE_REASONS.map((k) => h("option", { value: k }, WASTE_LABELS[k])));
      const rmNote = h("input", { type: "text", class: "st-note", maxlength: "120",
        placeholder: "Optional", "aria-label": "Note for removing " + name });
      const rmBtn = h("button", { type: "button", class: "st-btn st-btn-small st-btn-danger" }, "Remove");
      const waste = h("details", { class: "st-settings st-waste" },
        h("summary", null, "Remove stock (spoiled, damaged, staff meal…)"),
        h("div", { class: "st-settings-body" },
          h("label", null, "Amount", rmQty),
          h("label", null, "Reason", rmReason),
          h("label", null, "Note", rmNote),
          rmBtn));
      row.append(h("div", { class: "st-controls" }, count, setBtn, addBtn), settings, waste);
      Object.assign(refs, { count, setBtn, addBtn, modeSel, thr, saveBtn, rmQty, rmReason, rmNote, rmBtn, dirty: false });
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
      rmBtn.addEventListener("click", () => {
        const n = parseWholeNumber(rmQty.value);
        const r = rowData(id);
        if (n === null || n < 1) { toast("Enter how many to remove (1 or more).", true); return; }
        if (r.stock === null || r.stock === undefined) { toast("Set a count for this item first.", true); return; }
        if (n > r.stock) { toast("Only " + r.stock + " in stock, so " + n + " can't be removed.", true); return; }
        const reason = rmReason.value;
        const note = rmNote.value.trim() || null;
        runAction(id, async () => {
          const left = await rpc("remove_stock", { p_item_id: id, p_qty: n, p_reason: reason, p_note: note });
          rmQty.value = "";
          rmNote.value = "";
          toast(name + ": removed " + n + " (" + WASTE_LABELS[reason].toLowerCase() + ")" + (typeof left === "number" ? ", " + left + " left" : ""));
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
      refs.count.placeholder = untracked ? "—" : "Count";
      const noStock = untracked || r.stock === null || r.stock === undefined || r.stock === 0;
      refs.rmBtn.disabled = refs.busy || noStock;
      refs.rmQty.disabled = noStock;
      refs.rmReason.disabled = noStock;
      refs.rmNote.disabled = noStock;
      refs.rmQty.placeholder = noStock ? "—" : "e.g. 5";
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

    updateTakeStock();

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
      if (!$("[data-waste-panel]").hidden) renderWaste();
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
          return h("tr", { class: WASTE_REASONS.indexOf(r.reason) >= 0 ? "st-waste-row" : null },
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

  /* ---------- waste report (owner) ---------- */
  function money(n) { return "$" + n.toFixed(2); }

  async function renderWaste() {
    const body = $("[data-waste-body]");
    body.textContent = "Loading…";
    const range = periodRange($("[data-waste-period]").value, $("[data-waste-from]").value, $("[data-waste-to]").value);
    if (range.error) { body.textContent = ""; body.append(h("p", { class: "st-hint" }, range.error)); return; }
    try {
      const { data, error } = await client.from("stock_log")
        .select("item_id, change, reason, created_at")
        .in("reason", WASTE_REASONS)
        .gte("created_at", range.start.toISOString())
        .lt("created_at", range.end.toISOString())
        .order("created_at", { ascending: false })
        .limit(5000);
      if (error) throw error;

      const byItem = {};
      (data || []).forEach((r) => {
        const e = byItem[r.item_id] || (byItem[r.item_id] = { spoiled: 0, damaged: 0, staff_meal: 0, waste_other: 0, total: 0 });
        const qty = Math.abs(r.change || 0);
        e[r.reason] += qty;
        e.total += qty;
      });
      const ids = Object.keys(byItem).sort((a, b) => byItem[b].total - byItem[a].total);
      body.textContent = "";
      if (!ids.length) { body.append(h("p", { class: "st-hint" }, "Nothing has been removed in this period.")); return; }

      const sum = { spoiled: 0, damaged: 0, staff_meal: 0, waste_other: 0, total: 0, value: 0 };
      const rows = ids.map((id) => {
        const e = byItem[id];
        const price = typeof ITEMS !== "undefined" && ITEMS[id] ? ITEMS[id].price : 0;
        const value = e.total * price;
        WASTE_REASONS.forEach((k) => { sum[k] += e[k]; });
        sum.total += e.total; sum.value += value;
        return h("tr", null, h("td", null, itemName(id)),
          ...WASTE_REASONS.map((k) => h("td", { class: "st-num" }, e[k] ? String(e[k]) : "—")),
          h("td", { class: "st-num" }, String(e.total)), h("td", { class: "st-num" }, money(value)));
      });
      body.append(h("table", null,
        h("thead", null, h("tr", null, h("th", null, "Item"),
          ...WASTE_REASONS.map((k) => h("th", { class: "st-num" }, WASTE_LABELS[k])),
          h("th", { class: "st-num" }, "Total"), h("th", { class: "st-num" }, "Value at menu price"))),
        h("tbody", null, ...rows),
        h("tfoot", null, h("tr", null, h("td", null, "All items"),
          ...WASTE_REASONS.map((k) => h("td", { class: "st-num" }, String(sum[k]))),
          h("td", { class: "st-num" }, String(sum.total)), h("td", { class: "st-num" }, money(sum.value))))));
    } catch (err) {
      body.textContent = "";
      handleError(err);
    }
  }

  function toggleWaste() {
    const panel = $("[data-waste-panel]");
    if (!panel.hidden) { panel.hidden = true; return; }
    panel.hidden = false;
    renderWaste();
  }

  function toggleLog() {
    const panel = $("[data-log-panel]");
    if (!panel.hidden) { panel.hidden = true; return; }
    panel.hidden = false;
    renderLog();
  }

  /* ---------- date ranges (shared by orders history, sales and waste) ---------- */
  function ymd(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function isToday(iso) { return !!iso && ymd(new Date(iso)) === ymd(new Date()); }

  // Returns { start, end } (end is exclusive) or { error }.
  function periodRange(period, fromVal, toVal) {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 1);
    if (period === "yesterday") { end.setTime(start.getTime()); start.setDate(start.getDate() - 1); }
    else if (period === "7") start.setDate(start.getDate() - 6);
    else if (period === "30") start.setDate(start.getDate() - 29);
    else if (period === "custom") {
      if (!fromVal || !toVal) return { error: "Pick a From date and a To date." };
      const f = new Date(fromVal + "T00:00:00");
      const t = new Date(toVal + "T00:00:00");
      if (isNaN(f) || isNaN(t)) return { error: "Pick a From date and a To date." };
      if (f > t) return { error: "The From date must be on or before the To date." };
      t.setDate(t.getDate() + 1);
      if ((t - f) / 86400000 > 366) return { error: "Please pick a range of one year or less." };
      return { start: f, end: t };
    }
    return { start, end };
  }

  // Show/hide the From/To boxes for "Custom range" and reload when anything changes.
  function wireDates(select, datesEl, fromEl, toEl, reload) {
    const today = ymd(new Date());
    fromEl.value = today; toEl.value = today; fromEl.max = today; toEl.max = today;
    const sync = () => { datesEl.hidden = select.value !== "custom"; };
    select.addEventListener("change", () => { sync(); reload(); });
    fromEl.addEventListener("change", reload);
    toEl.addEventListener("change", reload);
    sync();
  }

  /* ---------- incoming orders: restaurant + wholesale queues ---------- */
  const ORDERS_POLL_MS = 6000;
  const STALE_MIN = 15;
  const HISTORY_LIMIT = 200;
  const CANCEL_REASONS = {
    out_of_stock: "Out of stock",
    changed_mind: "Customer changed their mind",
    no_response: "Customer didn't reply",
    other: "Other",
    voided: "Voided (entered by mistake)",
  };
  const SOUND_KEY = "lita_staff_sound";
  const PERIOD_OPTIONS = [["today", "Today"], ["yesterday", "Yesterday"], ["7", "Last 7 days"], ["30", "Last 30 days"], ["custom", "Custom range"]];
  const QUEUES = {
    restaurant: {
      title: "Restaurant orders", sources: ["online", "phone", "walkin"], label: "restaurant",
      hint: "Website orders wait here until you confirm or cancel them. Phone and walk-in orders are saved from the Take an order tab and appear in the history below. Confirming an order takes its items out of stock; cancelling does not.",
    },
    wholesale: {
      title: "Wholesale orders", sources: ["wholesale"], label: "wholesale",
      hint: "Orders from the Wholesale page wait here until you confirm or cancel them. Confirming an order takes its items out of stock; cancelling does not.",
    },
  };
  const TV_PARAM = new URLSearchParams(window.location.search).get("screen");
  const TV_QUEUE = QUEUES[TV_PARAM] ? TV_PARAM : null;   // ?screen=wholesale or ?screen=restaurant

  const queueUi = {};          // per-queue screen pieces
  let ordersLoaded = false;
  let knownPending = new Set();
  let freshIds = new Set();
  let pendingOrders = [];
  const histOrders = { restaurant: [], wholesale: [] };
  const histTotal = { restaurant: 0, wholesale: 0 };
  const shortageById = {};   // order id -> shortages returned by confirm_order
  const cancelOpen = new Set();
  const cancelDraft = {};    // order id -> {reason, note}, so a re-draw never loses what staff typed
  const busyOrders = new Set();
  const voidOpen = new Set();
  let ordersTimer = null;
  let audioCtx = null;
  let soundOn = false;
  let titleBase = document.title;
  let titleTimer = null;
  let wakeLock = null;

  try { soundOn = localStorage.getItem(SOUND_KEY) === "1"; } catch (e) { soundOn = false; }

  function queueOf(o) { return o.source === "wholesale" ? "wholesale" : "restaurant"; }
  function alertsFor(q) { return !TV_QUEUE || TV_QUEUE === q; }

  function beep() {
    if (!soundOn) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
      [0, 0.28].forEach((delay, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = "sine";
        o.frequency.value = i ? 1046 : 784;
        g.gain.setValueAtTime(0.0001, audioCtx.currentTime + delay);
        g.gain.exponentialRampToValueAtTime(0.4, audioCtx.currentTime + delay + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + delay + 0.25);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(audioCtx.currentTime + delay);
        o.stop(audioCtx.currentTime + delay + 0.27);
      });
    } catch (e) { /* sound is a bonus, never block on it */ }
  }

  function updateSoundButton() {
    $$("[data-sound-toggle]").forEach((b) => {
      b.textContent = "Sound: " + (soundOn ? "on" : "off");
      b.setAttribute("aria-pressed", soundOn ? "true" : "false");
    });
  }

  function toggleSound() {
    soundOn = !soundOn;
    try { localStorage.setItem(SOUND_KEY, soundOn ? "1" : "0"); } catch (e) { /* ignore */ }
    updateSoundButton();
    if (soundOn) beep(); // also unlocks audio on this device (needs a tap)
  }

  function flashTitle(n) {
    clearInterval(titleTimer);
    if (!n) { document.title = titleBase; return; }
    let on = false;
    titleTimer = setInterval(() => {
      on = !on;
      document.title = on ? "(" + n + ") NEW ORDER — Staff" : titleBase;
    }, 1000);
  }

  function timeAgo(iso) {
    const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
    if (mins < 1) return "just now";
    if (mins < 60) return mins + " min ago";
    const hrs = Math.floor(mins / 60);
    return hrs + " hr" + (hrs > 1 ? "s" : "") + " " + (mins % 60) + " min ago";
  }

  function orderCode(o) { return "#" + String(o.id).slice(0, 8).toUpperCase(); }
  function sourceTag(o) {
    return h("span", { class: "st-tag st-tag--" + (o.source === "wholesale" ? "wholesale" : "online") },
      o.source === "wholesale" ? "Wholesale" : (o.source === "phone" ? "Phone" : o.source === "walkin" ? "Walk-in" : "Website"));
  }

  function lineShortages(o) {
    // Compare what the order needs with what is in stock right now.
    const need = {};
    (o.order_items || []).forEach((l) => { need[l.item_id] = (need[l.item_id] || 0) + l.quantity; });
    const out = [];
    Object.keys(need).forEach((id) => {
      const r = inventory[id];
      if (r && r.mode !== "untracked" && r.stock !== null && r.stock !== undefined && r.stock < need[id]) {
        out.push({ item_id: id, needed: need[id], available: r.stock });
      }
    });
    return out;
  }

  function shortageText(list) {
    return list.map((x) => itemName(x.item_id) + ": ordered " + x.needed + ", only " + x.available + " in stock").join("; ");
  }

  function buildPendingCard(o) {
    const stale = (Date.now() - new Date(o.created_at).getTime()) / 60000 >= STALE_MIN;
    const card = h("div", { class: "st-order" + (stale ? " is-stale" : "") + (freshIds.has(o.id) ? " is-new" : ""), "data-order": o.id });
    card.append(h("div", { class: "st-order-head" },
      h("span", { class: "st-order-who" }, o.customer_name || "(no name)"),
      h("span", { class: "st-order-total" }, money(Number(o.total)))));
    card.append(h("div", { class: "st-order-meta" },
      sourceTag(o),
      h("span", null, orderCode(o)),
      h("span", null, timeAgo(o.created_at) + (stale ? " — waiting a while!" : "")),
      o.fulfillment ? h("span", null, o.fulfillment) : null));
    card.append(h("ul", { class: "st-order-lines" }, ...(o.order_items || []).map((l) =>
      h("li", null,
        h("span", null, h("span", { class: "st-qty" }, l.quantity + "×"), l.item_name),
        h("span", null, money(Number(l.line_total)))))));
    if (o.notes) card.append(h("div", { class: "st-order-notes" }, "Notes: " + o.notes));

    const server = shortageById[o.id];
    const live = lineShortages(o);
    const shown = server && server.length ? server : live;
    if (shown.length) {
      card.append(h("div", { class: "st-order-warn" },
        "Not enough stock — " + shortageText(shown) + ". Confirming anyway takes what is left (stock never goes below 0)."));
    }

    const busy = busyOrders.has(o.id);
    const actions = h("div", { class: "st-order-actions" });
    const confirmBtn = h("button", { type: "button", class: "st-btn st-btn-primary", disabled: busy },
      shown.length ? "Confirm anyway" : "Confirm");
    confirmBtn.addEventListener("click", () => confirmOrder(o, shown.length > 0));
    actions.append(confirmBtn);

    if (cancelOpen.has(o.id)) {
      const reason = h("select", { "aria-label": "Why is this order being cancelled?" },
        ...Object.keys(CANCEL_REASONS).filter((k) => k !== "voided").map((k) => h("option", { value: k }, CANCEL_REASONS[k])));
      const note = h("input", { type: "text", maxlength: "120", placeholder: "Note (optional)", "aria-label": "Cancel note" });
      const go = h("button", { type: "button", class: "st-btn st-btn-danger", disabled: busy }, "Cancel order");
      const back = h("button", { type: "button", class: "st-btn st-btn-small" }, "Keep order");
      const draft = cancelDraft[o.id] || (cancelDraft[o.id] = { reason: "out_of_stock", note: "" });
      reason.value = draft.reason; note.value = draft.note;
      reason.addEventListener("change", () => { draft.reason = reason.value; });
      note.addEventListener("input", () => { draft.note = note.value; });
      go.addEventListener("click", () => cancelOrder(o, reason.value, note.value));
      back.addEventListener("click", () => { cancelOpen.delete(o.id); renderOrders(); });
      actions.append(reason, note, go, back);
    } else {
      const cancelBtn = h("button", { type: "button", class: "st-btn st-btn-danger", disabled: busy }, "Cancel…");
      cancelBtn.addEventListener("click", () => { cancelOpen.add(o.id); renderOrders(); });
      actions.append(cancelBtn);
    }
    card.append(actions);
    return card;
  }

  function buildDoneCard(o) {
    const cancelled = o.status === "cancelled";
    const voided = cancelled && o.cancel_reason === "voided";
    let when = "";
    if (o.handled_at) {
      const d = new Date(o.handled_at);
      const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      when = isToday(o.handled_at) ? time : d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) + ", " + time;
    }
    const summary = (o.order_items || []).map((l) => l.quantity + "× " + l.item_name).join(", ");
    const card = h("div", { class: "st-order st-order-done" + (cancelled ? " is-cancelled" : "") },
      h("div", { class: "st-order-head" },
        h("span", { class: "st-order-who" }, o.customer_name || "(no name)"),
        h("span", null, h("span", { class: "st-tag st-tag--" + (voided ? "voided" : o.status) }, voided ? "Voided" : cancelled ? "Cancelled" : "Confirmed"), " ", money(Number(o.total)))),
      h("div", { class: "st-order-meta" }, sourceTag(o), h("span", null, orderCode(o)),
        when ? h("span", null, when) : null,
        cancelled && o.cancel_reason && !voided ? h("span", null, (CANCEL_REASONS[o.cancel_reason] || o.cancel_reason) + (o.cancel_note ? " — " + o.cancel_note : "")) : null,
        voided && o.cancel_note ? h("span", null, "Note: " + o.cancel_note) : null),
      h("div", { class: "st-hint" }, summary));
    // Owner can void a counter order from today that was keyed in wrongly (puts stock back).
    if (isOwner() && o.status === "confirmed" && (o.source === "phone" || o.source === "walkin") && isToday(o.handled_at)) {
      const box = h("div", { class: "st-void" });
      const busy = busyOrders.has(o.id);
      if (voidOpen.has(o.id)) {
        const note = h("input", { type: "text", maxlength: "120", placeholder: "Why? (optional)", "aria-label": "Void note",
          class: "st-note", "data-void-note": o.id });
        const go = h("button", { type: "button", class: "st-btn st-btn-small st-btn-danger", disabled: busy }, "Void order and put stock back");
        const keep = h("button", { type: "button", class: "st-btn st-btn-small" }, "Keep order");
        go.addEventListener("click", () => voidOrder(o, note.value));
        keep.addEventListener("click", () => { voidOpen.delete(o.id); renderOrders(); });
        box.append(note, go, keep);
      } else {
        const b = h("button", { type: "button", class: "st-btn st-btn-small st-btn-danger", disabled: busy }, "Void…");
        b.addEventListener("click", () => { voidOpen.add(o.id); renderOrders(); });
        box.append(b);
      }
      card.append(box);
    }
    return card;
  }

  function typingIn(el) {
    const ae = document.activeElement;
    return !!(ae && el && el.contains(ae) && /^(INPUT|SELECT)$/.test(ae.tagName));
  }

  function renderBadges() {
    Object.keys(QUEUES).forEach((q) => {
      const n = pendingOrders.filter((o) => queueOf(o) === q).length;
      const badge = $('[data-orders-badge="' + q + '"]');
      if (badge) { badge.hidden = n === 0; badge.textContent = String(n); }
    });
  }

  function renderPending(q) {
    const ui = queueUi[q];
    if (!ui || typingIn(ui.pending)) return; // don't redraw under someone's fingers
    ui.pending.textContent = "";
    const list = pendingOrders.filter((o) => queueOf(o) === q)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); // oldest first: serve in order
    if (!list.length) ui.pending.append(h("p", { class: "st-hint" }, "No " + QUEUES[q].label + " orders waiting. 🎉"));
    list.forEach((o) => ui.pending.append(buildPendingCard(o)));
  }

  function renderHistory(q) {
    const ui = queueUi[q];
    if (!ui || typingIn(ui.histList)) return;
    const all = histOrders[q];
    const want = ui.status.value;
    const matches = (o) => want === "all" ||
      (want === "confirmed" && o.status === "confirmed") ||
      (want === "voided" && o.status === "cancelled" && o.cancel_reason === "voided") ||
      (want === "cancelled" && o.status === "cancelled" && o.cancel_reason !== "voided");
    const rows = all.filter(matches);
    const conf = all.filter((o) => o.status === "confirmed");
    const voided = all.filter((o) => o.status === "cancelled" && o.cancel_reason === "voided").length;
    const cancelled = all.filter((o) => o.status === "cancelled").length - voided;
    ui.summary.textContent = ui.histError ? ui.histError : (all.length
      ? all.length + " handled · " + conf.length + " confirmed (" + money(conf.reduce((a, o) => a + Number(o.total || 0), 0)) + ") · " + cancelled + " cancelled · " + voided + " voided"
      : "");
    ui.histList.textContent = "";
    if (ui.histError) return;
    if (!rows.length) {
      ui.histList.append(h("p", { class: "st-hint" }, all.length ? "No orders match this filter." : "No handled orders in this period."));
      return;
    }
    rows.slice(0, HISTORY_LIMIT).forEach((o) => ui.histList.append(buildDoneCard(o)));
    if (rows.length > HISTORY_LIMIT) {
      ui.histList.append(h("p", { class: "st-hint" }, "Showing the latest " + HISTORY_LIMIT + " of " + rows.length + ". Narrow the dates to see the rest."));
    }
  }

  function renderOrders() {
    renderBadges();
    Object.keys(QUEUES).forEach((q) => { renderPending(q); renderHistory(q); });
  }

  async function loadPending(quiet) {
    try {
      const { data, error } = await client.from("orders")
        .select("*, order_items(*)")
        .eq("status", "pending")
        .order("created_at", { ascending: true })
        .limit(500);
      if (error) throw error;
      pendingOrders = data || [];

      const idsNow = new Set(pendingOrders.map((o) => o.id));
      const added = pendingOrders.filter((o) => !knownPending.has(o.id) && alertsFor(queueOf(o)));
      if (ordersLoaded && added.length) {
        freshIds = new Set(added.map((o) => o.id));
        beep();
        const qs = new Set(added.map(queueOf));
        toast(added.length === 1 || qs.size === 1
          ? (added.length === 1 ? "New " + QUEUES[queueOf(added[0])].label + " order!" : added.length + " new " + QUEUES[Array.from(qs)[0]].label + " orders!")
          : added.length + " new orders!");
        if (document.hidden) flashTitle(pendingOrders.filter((o) => alertsFor(queueOf(o))).length);
      }
      if (!document.hidden) flashTitle(0);
      Object.keys(shortageById).forEach((id) => { if (!idsNow.has(id)) delete shortageById[id]; });
      knownPending = idsNow;
      ordersLoaded = true;
      renderBadges();
      Object.keys(QUEUES).forEach(renderPending);
      const stamp = "Updated " + new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      Object.keys(queueUi).forEach((q) => { queueUi[q].updated.textContent = stamp; });
    } catch (err) {
      if (!quiet || isAuthError(err)) handleError(err);
    }
  }

  async function loadHistory(q, quiet) {
    const ui = queueUi[q];
    if (!ui || !client) return;
    const r = periodRange(ui.period.value, ui.from.value, ui.to.value);
    if (r.error) {
      ui.histError = r.error; histOrders[q] = []; renderHistory(q);
      return;
    }
    ui.histError = "";
    try {
      const rows = await fetchAllPages(() => client.from("orders")
        .select("*, order_items(*)")
        .in("status", ["confirmed", "cancelled"])
        .in("source", QUEUES[q].sources)
        .gte("handled_at", r.start.toISOString())
        .lt("handled_at", r.end.toISOString())
        .order("handled_at", { ascending: false }));
      histOrders[q] = rows;
      histTotal[q] = rows.length;
      renderHistory(q);
    } catch (err) {
      if (!quiet || isAuthError(err)) handleError(err);
    }
  }

  function visibleQueues() {
    return Object.keys(QUEUES).filter((q) => queueUi[q] && !queueUi[q].panel.hidden);
  }

  // quiet: don't toast errors. force: reload history for any period, not just "today".
  async function loadOrders(quiet, force) {
    await loadPending(quiet);
    await Promise.all(visibleQueues()
      .filter((q) => force || queueUi[q].period.value === "today")
      .map((q) => loadHistory(q, quiet)));
  }

  async function confirmOrder(o, override) {
    if (busyOrders.has(o.id)) return;
    busyOrders.add(o.id); renderOrders();
    try {
      const res = await rpc("confirm_order", { p_order_id: o.id, p_override: !!override });
      if (res && res.ok === false) {
        shortageById[o.id] = res.shortages || [];
        toast("Not enough stock for part of this order. Check below.", true);
      } else {
        delete shortageById[o.id];
        toast("Order confirmed — stock updated.");
        await loadInventory(); updateAll();
        if (!$("[data-log-panel]").hidden) renderLog();
      }
    } catch (err) {
      handleError(err);
    } finally {
      busyOrders.delete(o.id);
      await loadOrders(true, true);
    }
  }

  async function cancelOrder(o, reason, note) {
    if (busyOrders.has(o.id)) return;
    busyOrders.add(o.id); renderOrders();
    try {
      await rpc("cancel_order", { p_order_id: o.id, p_reason: reason, p_note: note.trim() || null });
      cancelOpen.delete(o.id); delete cancelDraft[o.id];
      toast("Order cancelled.");
    } catch (err) {
      handleError(err);
    } finally {
      busyOrders.delete(o.id);
      await loadOrders(true, true);
    }
  }

  async function voidOrder(o, note) {
    if (busyOrders.has(o.id)) return;
    busyOrders.add(o.id); renderOrders();
    try {
      await rpc("void_order", { p_order_id: o.id, p_note: (note || "").trim() || null });
      voidOpen.delete(o.id);
      toast("Order voided — stock put back.");
      await loadInventory(); updateAll();
      if (!$("[data-log-panel]").hidden) renderLog();
    } catch (err) {
      handleError(err);
    } finally {
      busyOrders.delete(o.id);
      await loadOrders(true, true);
    }
  }

  /* Builds the two queue screens (restaurant / wholesale) once, at start-up. */
  function buildQueuePanels() {
    Object.keys(QUEUES).forEach((q) => {
      const cfg = QUEUES[q];
      const panel = $('[data-panel="orders-' + q + '"]');
      const ui = queueUi[q] = { panel };
      ui.updated = h("span", { class: "st-updated" });
      const sound = h("button", { type: "button", class: "st-btn st-btn-small", "data-sound-toggle": true, "aria-pressed": "false" }, "Sound: off");
      const refresh = h("button", { type: "button", class: "st-btn st-btn-small" }, "Refresh");
      const tv = h("a", { class: "st-btn st-btn-small st-tv-link", href: "index.html?screen=" + q, target: "_blank", rel: "noopener",
        title: "Opens a full-screen view that shows only " + cfg.label + " orders. Good for a TV." }, "Open as TV screen");
      ui.pending = h("div", { "data-orders-pending": q });
      ui.period = h("select", { "aria-label": "History period" }, ...PERIOD_OPTIONS.map((p) => h("option", { value: p[0] }, p[1])));
      ui.from = h("input", { type: "date", "aria-label": "History from date" });
      ui.to = h("input", { type: "date", "aria-label": "History to date" });
      ui.dates = h("span", { class: "st-dates", hidden: true },
        h("label", null, "From ", ui.from), h("label", null, "To ", ui.to));
      ui.status = h("select", { "aria-label": "Show orders" },
        h("option", { value: "all" }, "All handled"), h("option", { value: "confirmed" }, "Confirmed"),
        h("option", { value: "cancelled" }, "Cancelled"), h("option", { value: "voided" }, "Voided"));
      ui.summary = h("p", { class: "st-hint st-hist-summary" });
      ui.histList = h("div", { "data-orders-history": q });
      ui.histError = "";

      panel.append(
        h("div", { class: "st-toolbar" },
          h("h2", { class: "st-h2" }, cfg.title),
          h("div", { class: "st-toolbar-actions" }, ui.updated, sound, refresh, tv)),
        h("p", { class: "st-hint" }, cfg.hint + " Turn the sound on once per screen to hear a beep for new orders."),
        ui.pending,
        h("h3", { class: "st-h3" }, "History"),
        h("div", { class: "st-hist-controls" },
          h("label", { class: "st-period" }, "Period ", ui.period), ui.dates,
          h("label", { class: "st-period" }, "Show ", ui.status)),
        ui.summary, ui.histList);

      wireDates(ui.period, ui.dates, ui.from, ui.to, () => loadHistory(q, false));
      ui.status.addEventListener("change", () => renderHistory(q));
      refresh.addEventListener("click", () => loadOrders(false, true));
      sound.addEventListener("click", toggleSound);
    });
  }

  function startOrdersPolling() {
    stopOrdersPolling();
    ordersLoaded = false; knownPending = new Set(); freshIds = new Set();
    loadOrders(false, true);
    ordersTimer = setInterval(() => { if (!document.hidden) loadOrders(true, false); }, ORDERS_POLL_MS);
  }
  function stopOrdersPolling() {
    if (ordersTimer) { clearInterval(ordersTimer); ordersTimer = null; }
    clearInterval(titleTimer); document.title = titleBase;
  }

  /* ---------- TV screen (?screen=wholesale or ?screen=restaurant) ---------- */
  async function keepScreenAwake() {
    try {
      if ("wakeLock" in navigator && !wakeLock) {
        wakeLock = await navigator.wakeLock.request("screen");
        wakeLock.addEventListener("release", () => { wakeLock = null; });
      }
    } catch (e) { /* not supported or refused — the screen may sleep, nothing else breaks */ }
  }

  function enterTvMode() {
    document.body.classList.add("st-tv");
    $(".st-tabs").hidden = true;
    const back = $("[data-back-site]"); if (back) back.hidden = true;
    const exit = $("[data-tv-exit]"); if (exit) exit.hidden = false;
    $$(".st-tv-link").forEach((a) => { a.hidden = true; });
    document.title = QUEUES[TV_QUEUE].title + " — Staff";
    titleBase = document.title;
    keepScreenAwake();
  }

  function showTab(name) {
    if (TV_QUEUE && name !== "orders-" + TV_QUEUE) return;
    $$("[data-tab]").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
    $$("[data-panel]").forEach((p) => { p.hidden = p.dataset.panel !== name; });
    if (name === "sales" && isOwner()) renderSales();
    if (name.indexOf("orders-") === 0) loadHistory(name.slice(7), true);
  }

  /* ---------- take an order: phone + walk-in (Phase 4) ---------- */
  const TAKE_CATEGORIES = ["poppers", "food", "drinks"];
  const takeLines = new Map();   // lineKey -> {id, selections, name, price, qty}
  const takeRowRefs = {};
  let takeBusy = false;
  let takeServerShort = null;

  function takeEnglishName(id, sel) {
    const base = itemName(id);
    const groups = itemOptionGroups(id);
    if (!groups.length) return base;
    const parts = groups.map((g) => STRINGS.en["opt_" + g + "_" + sel[g]] || sel[g]);
    return base + " (" + parts.join(", ") + ")";
  }

  function buildTakeMenu() {
    const host = $("[data-take-menu]");
    host.textContent = "";
    Object.keys(takeRowRefs).forEach((k) => delete takeRowRefs[k]);
    TAKE_CATEGORIES.forEach((cat) => {
      const details = h("details", { class: "st-cat", open: cat === "poppers" },
        h("summary", null, h("span", null, catName(cat))));
      MENU_STRUCTURE[cat].forEach((id) => {
        const sel = defaultSelections(id);
        const priceEl = h("span", { class: "st-menu-price" }, money(itemPriceWithSelections(id, sel)));
        const chip = h("span", { class: "st-chip", hidden: true });
        const addBtn = h("button", { type: "button", class: "st-btn st-btn-primary" }, "Add");
        const row = h("div", { class: "st-menu-row", "data-take-item": id },
          h("div", null, h("span", { class: "st-menu-name" }, itemName(id)), " ", chip),
          h("div", { class: "st-menu-add" }, priceEl, addBtn));
        const groups = itemOptionGroups(id);
        if (groups.length) {
          const opts = h("div", { class: "st-menu-opts" });
          groups.forEach((g) => {
            const select = h("select", { "aria-label": (STRINGS.en["opt_" + g + "_label"] || g) + " for " + itemName(id) },
              ...OPTION_GROUPS[g].choices.map((c) => h("option", { value: c.id },
                (STRINGS.en["opt_" + g + "_" + c.id] || c.id) + (c.delta ? " (+" + money(c.delta) + ")" : ""))));
            select.addEventListener("change", () => {
              sel[g] = select.value;
              priceEl.textContent = money(itemPriceWithSelections(id, sel));
            });
            opts.append(h("label", null, STRINGS.en["opt_" + g + "_label"] || g, select));
          });
          row.append(opts);
        }
        addBtn.addEventListener("click", () => takeAdd(id, Object.assign({}, sel)));
        takeRowRefs[id] = { row, chip };
        details.append(row);
      });
      host.append(details);
    });
    updateTakeStock();
  }

  function updateTakeStock() {
    Object.keys(takeRowRefs).forEach((id) => {
      const refs = takeRowRefs[id];
      const st = statusOf(rowData(id));
      const show = st.key === "ok" || st.key === "low" || st.key === "out";
      refs.chip.hidden = !show;
      if (show) { refs.chip.textContent = st.label; refs.chip.className = "st-chip st-chip--" + st.key; }
      refs.row.classList.toggle("is-out", st.key === "out");
    });
    renderTakeOrder();
  }

  function takeAdd(id, selections) {
    const key = lineKey(id, selections);
    const line = takeLines.get(key);
    if (line) { if (line.qty < 99) line.qty++; }
    else takeLines.set(key, { id, selections, name: takeEnglishName(id, selections), price: itemPriceWithSelections(id, selections), qty: 1 });
    takeServerShort = null;
    renderTakeOrder();
  }

  function takeShortages() {
    const need = {};
    takeLines.forEach((l) => { need[l.id] = (need[l.id] || 0) + l.qty; });
    const out = [];
    Object.keys(need).forEach((id) => {
      const r = inventory[id];
      if (r && r.mode !== "untracked" && r.stock !== null && r.stock !== undefined && r.stock < need[id]) {
        out.push({ item_id: id, needed: need[id], available: r.stock });
      }
    });
    return out;
  }

  function renderTakeOrder() {
    const ul = $("[data-take-lines]");
    ul.textContent = "";
    let total = 0;
    if (!takeLines.size) ul.append(h("li", { class: "st-take-empty" }, "Nothing added yet. Tap Add on a menu item."));
    takeLines.forEach((l, key) => {
      total += Math.round(l.price * l.qty * 100) / 100;
      const minus = h("button", { type: "button", "aria-label": "One fewer " + l.name }, "−");
      const plus = h("button", { type: "button", "aria-label": "One more " + l.name }, "+");
      const rm = h("button", { type: "button", class: "st-line-rm" }, "Remove");
      minus.addEventListener("click", () => { if (l.qty > 1) l.qty--; else takeLines.delete(key); takeServerShort = null; renderTakeOrder(); });
      plus.addEventListener("click", () => { if (l.qty < 99) l.qty++; takeServerShort = null; renderTakeOrder(); });
      rm.addEventListener("click", () => { takeLines.delete(key); takeServerShort = null; renderTakeOrder(); });
      ul.append(h("li", null, h("span", null, l.name), h("strong", null, money(l.price * l.qty)),
        h("div", { class: "st-line-ctl" }, minus, h("span", { class: "st-line-qty" }, String(l.qty)), plus, rm)));
    });
    $("[data-take-total]").textContent = money(total);

    const short = takeServerShort && takeServerShort.length ? takeServerShort : takeShortages();
    const warn = $("[data-take-warn]");
    warn.hidden = short.length === 0;
    warn.textContent = short.length
      ? "Not enough stock — " + shortageText(short) + ". Saving anyway takes what is left (never below 0)."
      : "";
    const save = $("[data-take-save]");
    save.disabled = takeBusy || takeLines.size === 0;
    save.textContent = short.length ? "Save anyway" : "Save order";
  }

  function takeSource() { const r = $('input[name="take-source"]:checked'); return r ? r.value : "walkin"; }

  function takeReset() {
    takeLines.clear(); takeServerShort = null;
    const n = $("[data-take-name]"); if (n) n.value = "";
    const t = $("[data-take-notes]"); if (t) t.value = "";
    const w = $('input[name="take-source"][value="walkin"]'); if (w) w.checked = true;
    updateTakeNameHint();
    if (takeRowRefs && Object.keys(takeRowRefs).length) renderTakeOrder();
  }

  function updateTakeNameHint() {
    const hint = $("[data-take-name-hint]");
    if (hint) hint.textContent = takeSource() === "phone" ? "(required for phone orders)" : "(optional)";
  }

  async function takeSave() {
    if (takeBusy || !takeLines.size) return;
    const source = takeSource();
    const name = $("[data-take-name]").value.trim();
    if (source === "phone" && !name) { toast("Enter the customer's name for a phone order.", true); $("[data-take-name]").focus(); return; }
    const override = (takeServerShort && takeServerShort.length > 0) || takeShortages().length > 0;
    const items = Array.from(takeLines.values()).map((l) => ({
      item_id: l.id, item_name: l.name, unit_price: l.price, quantity: l.qty,
    }));
    takeBusy = true; renderTakeOrder();
    try {
      const res = await rpc("create_counter_order", {
        p_source: source, p_name: name || null, p_notes: $("[data-take-notes]").value.trim() || null,
        p_items: items, p_override: override,
      });
      if (res && res.ok === false) {
        takeServerShort = res.shortages || [];
        toast("Stock changed — check the warning, then save again.", true);
      } else {
        takeReset();
        toast("Order saved — stock updated.");
        await loadInventory(); updateAll();
        if (!$("[data-log-panel]").hidden) renderLog();
        loadOrders(true, true);
      }
    } catch (err) {
      handleError(err);
    } finally {
      takeBusy = false; renderTakeOrder();
    }
  }

  /* ---------- sales summary (owner) ---------- */
  let salesRows = [];   // flattened sold lines, for the CSV

  function localDayKey(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  const SOURCE_LABELS = { online: "Website", wholesale: "Wholesale", phone: "Phone", walkin: "Walk-in" };

  async function fetchAllPages(makeQuery) {
    const out = [];
    const PAGE = 500;
    for (let from = 0; from < 20000; from += PAGE) {
      const { data, error } = await makeQuery().range(from, from + PAGE - 1);
      if (error) throw error;
      out.push(...(data || []));
      if (!data || data.length < PAGE) break;
    }
    return out;
  }

  function kpi(label, value, extra) {
    return h("div", { class: "st-kpi" + (extra ? " " + extra : "") },
      h("div", { class: "st-kpi-label" }, label), h("div", { class: "st-kpi-value" }, value));
  }

  function table(headers, rows, foot) {
    return h("div", { class: "st-sales-scroll" }, h("table", null,
      h("thead", null, h("tr", null, ...headers.map((x, i) => h("th", { class: i ? "st-num" : null }, x)))),
      h("tbody", null, ...rows.map((r) => h("tr", null, ...r.map((c, i) => h("td", { class: i ? "st-num" : null }, c))))),
      foot ? h("tfoot", null, h("tr", null, ...foot.map((c, i) => h("td", { class: i ? "st-num" : null }, c)))) : null));
  }

  async function renderSales() {
    const body = $("[data-sales-body]");
    body.textContent = "Loading…";
    $("[data-sales-csv]").disabled = true;
    const range = periodRange($("[data-sales-period]").value, $("[data-sales-from]").value, $("[data-sales-to]").value);
    if (range.error) { body.textContent = ""; body.append(h("p", { class: "st-hint" }, range.error)); return; }
    const { start, end } = range;
    const multiDay = (end - start) / 86400000 > 1.5;
    try {
      const orders = await fetchAllPages(() => client.from("orders")
        .select("id, source, total, handled_at, order_items(item_id, item_name, quantity, line_total)")
        .eq("status", "confirmed")
        .gte("handled_at", start.toISOString())
        .lt("handled_at", end.toISOString())
        .order("handled_at", { ascending: false }));
      const wasteLogs = await fetchAllPages(() => client.from("stock_log")
        .select("item_id, change")
        .in("reason", WASTE_REASONS)
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString())
        .order("created_at", { ascending: false }));

      let sales = 0;
      const bySource = {}, byItem = {}, byDay = {};
      salesRows = [];
      orders.forEach((o) => {
        const total = Number(o.total) || 0;
        sales += total;
        const s = bySource[o.source] || (bySource[o.source] = { n: 0, total: 0 });
        s.n++; s.total += total;
        const dk = localDayKey(new Date(o.handled_at));
        const d = byDay[dk] || (byDay[dk] = { n: 0, total: 0 });
        d.n++; d.total += total;
        (o.order_items || []).forEach((l) => {
          const e = byItem[l.item_id] || (byItem[l.item_id] = { qty: 0, total: 0 });
          e.qty += l.quantity; e.total += Number(l.line_total) || 0;
          salesRows.push([dk, String(o.id).slice(0, 8).toUpperCase(), SOURCE_LABELS[o.source] || o.source,
            l.item_name, l.quantity, (Number(l.line_total) || 0).toFixed(2)]);
        });
      });
      let wasteValue = 0;
      wasteLogs.forEach((r) => {
        const price = typeof ITEMS !== "undefined" && ITEMS[r.item_id] ? ITEMS[r.item_id].price : 0;
        wasteValue += Math.abs(r.change || 0) * price;
      });

      body.textContent = "";
      if (!orders.length) {
        body.append(h("p", { class: "st-hint" }, "No confirmed orders in this period yet."));
        if (wasteValue > 0) body.append(h("div", { class: "st-kpis" }, kpi("Food wasted (menu price)", money(wasteValue), "is-waste")));
        return;
      }
      body.append(h("div", { class: "st-kpis" },
        kpi("Total sales", money(sales)),
        kpi("Orders", String(orders.length)),
        kpi("Average order", money(sales / orders.length)),
        kpi("Food wasted (menu price)", money(wasteValue), "is-waste")));

      const srcKeys = ["online", "wholesale", "phone", "walkin"].filter((k) => bySource[k])
        .concat(Object.keys(bySource).filter((k) => !SOURCE_LABELS[k]));
      body.append(h("div", { class: "st-sales-card" }, h("h3", null, "By order type"),
        table(["Type", "Orders", "Sales"], srcKeys.map((k) => [SOURCE_LABELS[k] || k, String(bySource[k].n), money(bySource[k].total)]),
          ["All", String(orders.length), money(sales)])));

      const itemIds = Object.keys(byItem).sort((a, b) => byItem[b].total - byItem[a].total);
      const qtyAll = itemIds.reduce((a, id) => a + byItem[id].qty, 0);
      body.append(h("div", { class: "st-sales-card" }, h("h3", null, "By item (best sellers first)"),
        table(["Item", "Sold", "Sales"], itemIds.map((id) => [itemName(id), String(byItem[id].qty), money(byItem[id].total)]),
          ["All items", String(qtyAll), money(itemIds.reduce((a, id) => a + byItem[id].total, 0))])));

      if (multiDay) {
        const days = Object.keys(byDay).sort().reverse();
        body.append(h("div", { class: "st-sales-card" }, h("h3", null, "By day"),
          table(["Day", "Orders", "Sales"], days.map((k) => {
            const dt = new Date(k + "T12:00:00");
            return [dt.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }), String(byDay[k].n), money(byDay[k].total)];
          }))));
      }
      $("[data-sales-csv]").disabled = false;
    } catch (err) {
      body.textContent = "";
      handleError(err);
    }
  }

  function downloadSalesCsv() {
    if (!salesRows.length) return;
    const esc = (v) => { const s = String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const lines = [["Date", "Order", "Type", "Item", "Quantity", "Line total"]].concat(salesRows)
      .map((r) => r.map(esc).join(","));
    const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "lita-sales-" + localDayKey(new Date()) + ".csv";
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  /* ---------- sign in / out ---------- */
  async function signOut() {
    stopRefresh();
    stopOrdersPolling();
    pendingOrders = []; histOrders.restaurant = []; histOrders.wholesale = [];
    cancelOpen.clear(); voidOpen.clear(); takeReset();
    Object.keys(cancelDraft).forEach((k) => delete cancelDraft[k]);
    try { if (client) await client.auth.signOut(); } catch (e) { /* ignore */ }
    session = null; me = null;
    $("[data-user]").hidden = true;
    $("[data-log-panel]").hidden = true;
    $("[data-waste-panel]").hidden = true;
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
      $("[data-waste-toggle]").hidden = !isOwner();
      $('[data-tab="sales"]').hidden = !isOwner();
      $("[data-readonly-note]").hidden = isOwner();

      if (isOwner()) {
        // Make sure every menu item has a stock row (covers newly added menu items).
        try { await rpc("ensure_inventory_items", { p_item_ids: allItemIds() }); }
        catch (e) { console.warn("Could not create missing inventory rows:", e); }
      }
      await loadInventory();
      buildList();
      buildTakeMenu();
      updateAll();
      setUpdatedNow();
      showView("app");
      startRefresh();
      updateSoundButton();
      if (TV_QUEUE) enterTvMode();
      showTab("orders-" + (TV_QUEUE || "restaurant"));
      startOrdersPolling();
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
    const typed = $("#st-email").value.trim();
    const password = $("#st-password").value;
    if (!typed || !password) { errEl.textContent = "Enter your username and password."; errEl.hidden = false; return; }
    if (typed.indexOf("@") < 0 && !/^[a-z0-9._-]{2,30}$/i.test(typed)) {
      errEl.textContent = "Usernames use only letters, numbers, dots, dashes and underscores."; errEl.hidden = false; return;
    }
    const email = loginEmailFor(typed);
    btn.disabled = true;
    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      session = data.session;
      $("#st-password").value = "";
      await enterApp();
    } catch (err) {
      const m = (err && err.message) || "";
      errEl.textContent = /invalid login credentials/i.test(m) ? "Wrong username or password."
        : /rate|too many/i.test(m) ? "Too many tries. Wait a minute and try again."
        : (m || "Couldn't sign in.");
      errEl.hidden = false;
    } finally {
      btn.disabled = false;
    }
  });
  $$("[data-signout]").forEach((b) => b.addEventListener("click", signOut));
  $("[data-refresh]").addEventListener("click", () => refresh(false));
  $("[data-log-toggle]").addEventListener("click", toggleLog);
  $("[data-waste-toggle]").addEventListener("click", toggleWaste);
  buildQueuePanels();
  wireDates($("[data-waste-period]"), $("[data-waste-dates]"), $("[data-waste-from]"), $("[data-waste-to]"), renderWaste);
  wireDates($("[data-sales-period]"), $("[data-sales-dates]"), $("[data-sales-from]"), $("[data-sales-to]"), renderSales);
  $("[data-retry]").addEventListener("click", init);
  $$("[data-tab]").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));
  $("[data-sales-refresh]").addEventListener("click", renderSales);
  $("[data-sales-csv]").addEventListener("click", downloadSalesCsv);
  $("[data-take-save]").addEventListener("click", takeSave);
  $("[data-take-clear]").addEventListener("click", takeReset);
  $$('input[name="take-source"]').forEach((r) => r.addEventListener("change", updateTakeNameHint));
  document.addEventListener("visibilitychange", () => { if (!document.hidden && me) { refresh(true); loadOrders(true, false); flashTitle(0); if (TV_QUEUE) keepScreenAwake(); } });

  init();
})();
