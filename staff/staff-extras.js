/* =========================================================
   Lita's Jalapeño Poppers — staff app extras
   Menu editor (owner + co-staff), and owner-only: Close the day
   (with the shopping list), Customers, and the Activity log.

   Loaded before staff.js; it only runs when staff.js calls
   StaffExtras.<tab>() as a tab opens. Everything here is also
   protected in the database (save_menu, activity_log, ...): hiding
   a tab is for convenience, the database is what enforces access.
   ========================================================= */
(function () {
  "use strict";

  const A = () => window.StaffApp;
  const CATS = ["poppers", "food", "drinks", "wholesale"];
  const SOURCE_LABELS = { online: "Restaurant (website)", wholesale: "Wholesale", phone: "Phone order", walkin: "Walk-in" };

  const CANCEL_REASONS = { out_of_stock: "Out of stock", changed_mind: "Customer changed their mind", no_response: "No response", other: "Other", voided: "Voided by the owner" };
  function el(tag, attrs, ...kids) { return A().h(tag, attrs, ...kids); }
  function panel(name) { return A().$('[data-panel="' + name + '"]'); }
  function clearEl(node) { node.textContent = ""; }
  function money(n) { return A().money(Number(n) || 0); }
  function slug(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "").slice(0, 16) || "x";
  }
  function rnd(n) { return Math.random().toString(36).replace(/[^a-z0-9]/g, "").slice(2, 2 + n).padEnd(n, "0"); }
  function fmtDate(iso, opts) { return new Date(iso).toLocaleDateString(A().LOC, opts || { month: "short", day: "numeric" }); }
  function fmtTime(iso) { return new Date(iso).toLocaleTimeString(A().LOC, { hour: "numeric", minute: "2-digit" }); }
  function copyText(text) {
    const done = () => A().toast("Copied.");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => A().toast("Couldn't copy. Select the text and copy it by hand.", true));
    else {
      const ta = el("textarea", { style: "position:fixed;opacity:0" }); ta.value = text; document.body.append(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { A().toast("Couldn't copy.", true); }
      ta.remove();
    }
  }
  function table(head, rows, foot) {
    return el("table", null,
      el("thead", null, el("tr", null, ...head.map((c, i) => el("th", { class: i ? "st-num" : null }, c)))),
      el("tbody", null, ...rows.map((r) => el("tr", null, ...r.map((c, i) => el("td", { class: i ? "st-num" : null }, c))))),
      foot ? el("tfoot", null, el("tr", null, ...foot.map((c, i) => el("td", { class: i ? "st-num" : null }, c)))) : null);
  }

  /* =======================================================
     MENU EDITOR
     ======================================================= */
  let menuState = { item: null, group: null, history: false, busy: false };

  function cfgNow() {
    const c = window.MenuConfig.get();
    c.items = c.items || {}; c.groups = c.groups || {};
    return c;
  }
  function strBoth(key) { return { en: STRINGS.en[key] || "", es: STRINGS.es[key] || "" }; }
  function groupUsage(gid) {
    return Object.keys(ITEMS).filter((id) => (ITEMS[id].options || []).indexOf(gid) >= 0).length;
  }
  function groupSummary(gid) {
    const g = OPTION_GROUPS[gid];
    return A().menuStr("opt_" + gid + "_label") + ": " +
      g.choices.map((c) => A().menuStr("opt_" + gid + "_" + c.id) || c.id).join(", ");
  }

  async function commitMenu(cfg, summary, okMessage) {
    if (menuState.busy) return false;
    menuState.busy = true;
    try {
      const version = await A().rpc("save_menu", { p_config: cfg, p_summary: summary });
      window.MenuConfig.apply(cfg, version);              // redraws the Stock / Take-order lists too
      A().toast(okMessage || "Saved. The website updates within a minute.");
      try { await A().loadInventory(); } catch (e) { /* ignore */ }
      return true;
    } catch (err) { A().handleError(err); return false; }
    finally { menuState.busy = false; }
  }

  function menuTidy(cfg, id) {
    // drop empty override objects so the saved menu stays small
    const e = cfg.items[id];
    if (e && !Object.keys(e).length) delete cfg.items[id];
  }

  function itemRow(id) {
    const hidden = window.MENU_HIDDEN.has(id);
    const price = ITEMS[id] ? ITEMS[id].price : 0;
    const lists = ((ITEMS[id] && ITEMS[id].options) || []).map((g) => A().menuStr("opt_" + g + "_label") || g);
    const edit = el("button", { type: "button", class: "st-btn st-btn-small" }, "Edit");
    edit.addEventListener("click", () => { menuState.item = { id }; menuState.group = null; renderMenu(); });
    const toggle = el("button", { type: "button", class: "st-btn st-btn-small" + (hidden ? "" : " st-btn-danger") }, hidden ? "Put back on menu" : "Remove from menu");
    toggle.addEventListener("click", async () => {
      const cfg = cfgNow();
      cfg.items[id] = cfg.items[id] || {};
      if (hidden) delete cfg.items[id].hidden; else cfg.items[id].hidden = true;
      menuTidy(cfg, id);
      const name = A().itemName(id);
      if (await commitMenu(cfg, (hidden ? "Put back on the menu: " : "Removed from the menu: ") + name,
        hidden ? "Put back on the menu." : "Removed from the menu. You can put it back any time.")) renderMenu();
    });
    return el("div", { class: "st-menu-ed-row" + (hidden ? " is-hidden" : "") },
      el("div", { class: "st-menu-ed-main" },
        el("strong", null, A().itemName(id)), " ",
        hidden ? el("span", { class: "st-chip st-chip--out" }, "Not on the menu") : null,
        el("div", { class: "st-hint" }, money(price) + (lists.length ? " · " + lists.join(", ") : ""))),
      el("div", { class: "st-menu-ed-actions" }, edit, toggle));
  }

  function itemForm() {
    const st = menuState.item;
    const isNew = !st.id;
    const id = st.id;
    const builtin = id ? window.MenuConfig.isBuiltin(id) : false;
    const cur = (id ? (cfgNow().items[id] || {}) : {});
    const nameB = id ? strBoth("item_" + id + "_name") : { en: "", es: "" };
    const descB = id ? strBoth("item_" + id + "_desc") : { en: "", es: "" };
    const field = (label, input) => el("label", { class: "st-field" }, label, input);

    const d = st.draft || {};
    const dv = (k, fallback) => (d[k] !== undefined ? d[k] : fallback);
    const nameEn = el("input", { type: "text", maxlength: "60", value: dv("nameEn", nameB.en) });
    const nameEs = el("input", { type: "text", maxlength: "60", value: dv("nameEs", nameB.es), placeholder: "Leave blank to show the English" });
    const descEn = el("input", { type: "text", maxlength: "200", value: dv("descEn", descB.en), placeholder: "Optional" });
    const descEs = el("input", { type: "text", maxlength: "200", value: dv("descEs", descB.es), placeholder: "Optional" });
    const price = el("input", { type: "text", inputmode: "decimal", value: dv("price", id ? Number(ITEMS[id].price).toFixed(2) : ""), placeholder: "0.00" });
    const catSel = el("select", null, ...CATS.map((c) => el("option", { value: c }, A().catName(c))));
    catSel.value = dv("cat", id ? (window.MenuConfig.baseCategory(id) || cur.cat || st.cat || "food") : (st.cat || "food"));
    if (builtin) catSel.disabled = true;

    const chosen = new Set(d.chosen || (id && ITEMS[id] ? (ITEMS[id].options || []) : []));
    (st.tick || []).forEach((g) => { if (OPTION_GROUPS[g]) chosen.add(g); });
    const capture = () => {
      st.draft = { nameEn: nameEn.value, nameEs: nameEs.value, descEn: descEn.value, descEs: descEs.value,
        price: price.value, cat: catSel.value, chosen: Array.from(chosen) };
      st.tick = [];
    };
    const groupBoxes = el("div", { class: "st-menu-ed-groups" });
    Object.keys(OPTION_GROUPS).forEach((gid) => {
      const cb = el("input", { type: "checkbox", value: gid });
      cb.checked = chosen.has(gid);
      cb.addEventListener("change", () => { if (cb.checked) chosen.add(gid); else chosen.delete(gid); });
      const editBtn = el("button", { type: "button", class: "st-btn st-btn-small" }, "Edit list");
      editBtn.addEventListener("click", () => { capture(); menuState.group = { id: gid, returnTo: st }; renderMenu(); });
      const used = groupUsage(gid);
      groupBoxes.append(el("div", { class: "st-menu-ed-group" },
        el("label", { class: "st-check" }, cb, " ", el("span", null, groupSummary(gid))),
        el("span", { class: "st-hint" }, "Used by " + used + (used === 1 ? " item" : " items")), editBtn));
    });
    const newList = el("button", { type: "button", class: "st-btn st-btn-small" }, "+ New dropdown list");
    newList.addEventListener("click", () => { capture(); menuState.group = { id: null, returnTo: st, attachNew: true }; renderMenu(); });

    const err = el("p", { class: "st-error", role: "alert", hidden: true });
    const save = el("button", { type: "button", class: "st-btn st-btn-primary" }, isNew ? "Add to menu" : "Save changes");
    const cancel = el("button", { type: "button", class: "st-btn" }, "Cancel");
    cancel.addEventListener("click", () => { menuState.item = null; renderMenu(); });
    const fail = (m) => { err.textContent = m; err.hidden = false; };

    save.addEventListener("click", async () => {
      err.hidden = true;
      const en = nameEn.value.trim();
      if (!en) return fail("Enter the item's name (English).");
      const p = Number(String(price.value).replace(/[$,\s]/g, ""));
      if (price.value.trim() === "" || !isFinite(p) || p < 0 || p > 10000) return fail("Enter a price like 12.50.");
      const cfg = cfgNow();
      const newId = id || ("c_" + slug(en) + "_" + rnd(4));
      const e = Object.assign({}, cfg.items[newId] || {});
      const baseName = id && builtin ? { en: window.MenuConfig.baseString("en", "item_" + id + "_name"), es: window.MenuConfig.baseString("es", "item_" + id + "_name") } : null;
      const baseDesc = id && builtin ? { en: window.MenuConfig.baseString("en", "item_" + id + "_desc"), es: window.MenuConfig.baseString("es", "item_" + id + "_desc") } : null;
      const nm = { en, es: nameEs.value.trim() };
      const ds = { en: descEn.value.trim(), es: descEs.value.trim() };
      const groups = Array.from(chosen).filter((g) => OPTION_GROUPS[g]);
      if (builtin) {
        const base = window.MenuConfig.baseItem(id);
        if (nm.en !== baseName.en || (nm.es && nm.es !== baseName.es)) e.name = nm; else delete e.name;
        if (ds.en !== baseDesc.en || (ds.es && ds.es !== baseDesc.es)) e.desc = ds; else delete e.desc;
        if (Math.abs(p - base.price) > 0.0001) e.price = p; else delete e.price;
        if (JSON.stringify(groups) !== JSON.stringify(base.options || [])) e.groups = groups; else delete e.groups;
      } else {
        e.name = nm; e.desc = ds; e.price = p; e.groups = groups; e.cat = catSel.value;
        if (!e.n) e.n = 1 + Math.max(0, ...Object.keys(cfg.items).map((k) => Number(cfg.items[k].n) || 0));
      }
      cfg.items[newId] = e;
      menuTidy(cfg, newId);
      if (await commitMenu(cfg, (isNew ? "Added item: " : "Changed item: ") + en,
        isNew ? "Added to the menu. Set its stock in the Stock tab." : "Saved. The website updates within a minute.")) {
        menuState.item = null; renderMenu();
      }
    });

    return el("section", { class: "st-card st-menu-ed-form" },
      el("h3", null, isNew ? "New menu item" : "Edit " + A().itemName(id)),
      el("div", { class: "st-form-grid" },
        field("Name (English)", nameEn), field("Name (Spanish)", nameEs),
        field("Description (English)", descEn), field("Description (Spanish)", descEs),
        field("Price ($)", price), field("Category", catSel)),
      builtin ? el("p", { class: "st-hint" }, "The category of a built-in item can't be changed.") : null,
      el("h4", null, "Dropdown lists"),
      el("p", { class: "st-hint" }, "Tick a list to let customers pick from it (for example sauce or size). Prices in a list are added to the item's price."),
      groupBoxes, newList, err,
      el("div", { class: "st-actions" }, save, cancel));
  }

  function groupForm() {
    const st = menuState.group;
    const gid = st.id;
    const isNew = !gid;
    const lab = gid ? strBoth("opt_" + gid + "_label") : { en: "", es: "" };
    const labEn = el("input", { type: "text", maxlength: "40", value: lab.en, placeholder: "e.g. Sauce" });
    const labEs = el("input", { type: "text", maxlength: "40", value: lab.es, placeholder: "e.g. Salsa" });
    const rowsHost = el("div", { class: "st-menu-ed-choices" });
    const rows = [];
    function addRow(c) {
      const nm = c ? strBoth("opt_" + gid + "_" + c.id) : { en: "", es: "" };
      const r = {
        id: c ? c.id : "c" + rnd(6),
        en: el("input", { type: "text", maxlength: "40", value: nm.en, placeholder: "Choice (English)", "aria-label": "Choice name (English)" }),
        es: el("input", { type: "text", maxlength: "40", value: nm.es, placeholder: "Choice (Spanish)", "aria-label": "Choice name (Spanish)" }),
        delta: el("input", { type: "text", inputmode: "decimal", value: c ? Number(c.delta).toFixed(2) : "0.00", "aria-label": "Extra price" }),
      };
      const del = el("button", { type: "button", class: "st-btn st-btn-small st-btn-danger", "aria-label": "Remove this choice" }, "Remove");
      r.node = el("div", { class: "st-menu-ed-choice" }, r.en, r.es,
        el("span", { class: "st-inline" }, "+$", r.delta), del);
      del.addEventListener("click", () => { rows.splice(rows.indexOf(r), 1); r.node.remove(); });
      rows.push(r); rowsHost.append(r.node);
    }
    if (gid) OPTION_GROUPS[gid].choices.forEach(addRow); else { addRow(); addRow(); }
    const add = el("button", { type: "button", class: "st-btn st-btn-small" }, "+ Add a choice");
    add.addEventListener("click", () => addRow());

    const err = el("p", { class: "st-error", role: "alert", hidden: true });
    const fail = (m) => { err.textContent = m; err.hidden = false; };
    const save = el("button", { type: "button", class: "st-btn st-btn-primary" }, "Save list");
    const cancel = el("button", { type: "button", class: "st-btn" }, "Back");
    cancel.addEventListener("click", () => { menuState.group = null; renderMenu(); });
    const used = gid ? groupUsage(gid) : 0;

    save.addEventListener("click", async () => {
      err.hidden = true;
      const label = labEn.value.trim();
      if (!label) return fail("Give the list a name (English), like Sauce or Size.");
      if (rows.length < 2) return fail("A dropdown needs at least two choices.");
      const seen = new Set();
      const choices = [];
      for (const r of rows) {
        const en = r.en.value.trim();
        if (!en) return fail("Every choice needs a name (English).");
        if (seen.has(en.toLowerCase())) return fail("Two choices are named \"" + en + "\". Give each a different name.");
        seen.add(en.toLowerCase());
        const d = Number(String(r.delta.value).replace(/[$,+\s]/g, "") || 0);
        if (!isFinite(d) || d < -100 || d > 100) return fail("Extra prices must be numbers like 0 or 2.00.");
        choices.push({ id: r.id, name: { en, es: r.es.value.trim() }, delta: Math.round(d * 100) / 100 });
      }
      const cfg = cfgNow();
      const newId = gid || ("g_" + slug(label) + "_" + rnd(4));
      cfg.groups[newId] = { label: { en: label, es: labEs.value.trim() }, choices };
      if (await commitMenu(cfg, (isNew ? "New dropdown list: " : "Changed dropdown list: ") + label,
        "Saved. Items using this list now show the new choices.")) {
        if (st.returnTo) menuState.item = Object.assign({}, st.returnTo, { tick: st.attachNew ? [newId] : [] });
        menuState.group = null; renderMenu();
      }
    });

    return el("section", { class: "st-card st-menu-ed-form" },
      el("h3", null, isNew ? "New dropdown list" : "Edit dropdown list"),
      used ? el("p", { class: "st-hint" }, "Used by " + used + (used === 1 ? " item" : " items") + " — changes apply to all of them.") : null,
      el("div", { class: "st-form-grid" },
        el("label", { class: "st-field" }, "List name (English)", labEn),
        el("label", { class: "st-field" }, "List name (Spanish)", labEs)),
      el("h4", null, "Choices"),
      el("p", { class: "st-hint" }, "The first choice is the one shown first. \"+$\" is added to the item's price when it is picked (use 0 for no change)."),
      rowsHost, add, err,
      el("div", { class: "st-actions" }, save, cancel));
  }

  async function historyBlock() {
    const host = el("section", { class: "st-card" }, el("h3", null, "Earlier versions"), el("p", { class: "st-hint" }, "Loading…"));
    try {
      const { data, error } = await A().client.from("menu_history")
        .select("id, created_at, summary, config").order("id", { ascending: false }).limit(15);
      if (error) throw error;
      clearEl(host); host.append(el("h3", null, "Earlier versions"));
      if (!data || !data.length) { host.append(el("p", { class: "st-hint" }, "No changes saved yet.")); return host; }
      host.append(el("p", { class: "st-hint" }, "Restoring puts the whole menu back the way it was at that moment. Stock counts are not changed."));
      data.forEach((row, i) => {
        const btn = el("button", { type: "button", class: "st-btn st-btn-small" }, i === 0 ? "Current" : "Restore");
        btn.disabled = i === 0;
        btn.addEventListener("click", async () => {
          if (!window.confirm(window.t("Put the menu back to how it was on " + fmtDate(row.created_at) + " at " + fmtTime(row.created_at) + "?"))) return;
          if (await commitMenu(row.config, "Restored the menu from " + fmtDate(row.created_at), "The menu was restored.")) { menuState.history = false; renderMenu(); }
        });
        host.append(el("div", { class: "st-menu-ed-row" },
          el("div", { class: "st-menu-ed-main" }, el("strong", null, fmtDate(row.created_at) + " " + fmtTime(row.created_at)),
            el("div", { class: "st-hint" }, row.summary || "Menu changed")), btn));
      });
    } catch (err) { clearEl(host); host.append(el("h3", null, "Earlier versions"), el("p", { class: "st-hint" }, "Couldn't load the history. Run supabase-menu-setup.sql first if you haven't.")); }
    return host;
  }

  async function renderMenu() {
    const host = panel("menu");
    if (!host || !A().canEditStock()) return;
    clearEl(host);
    if (menuState.group) { host.append(groupForm()); return; }
    if (menuState.item) {
      host.append(itemForm());
      return;
    }
    host.append(el("div", { class: "st-toolbar" },
      el("h2", null, "Menu"),
      (() => { const b = el("button", { type: "button", class: "st-btn st-btn-small" }, menuState.history ? "Hide earlier versions" : "Earlier versions");
        b.addEventListener("click", () => { menuState.history = !menuState.history; renderMenu(); }); return b; })()),
      el("p", { class: "st-hint" }, "Add or remove items, change prices, and set up dropdown lists. Changes show on the website within a minute. Removing an item only hides it, so old orders and reports still make sense."));
    if (menuState.history) host.append(await historyBlock());

    const all = window.ALL_MENU_STRUCTURE;
    CATS.forEach((cat) => {
      const add = el("button", { type: "button", class: "st-btn st-btn-primary st-btn-small" }, "+ Add item");
      add.addEventListener("click", () => { menuState.item = { id: null, cat }; renderMenu(); });
      const list = el("div", null, ...(all[cat] || []).map(itemRow));
      host.append(el("details", { class: "st-cat", open: true },
        el("summary", null, el("span", null, A().catName(cat))),
        list, el("div", { class: "st-actions" }, add)));
    });

    // Lists not used by any item
    const lists = Object.keys(OPTION_GROUPS);
    host.append(el("details", { class: "st-cat" },
      el("summary", null, el("span", null, "Dropdown lists")),
      ...lists.map((gid) => {
        const b = el("button", { type: "button", class: "st-btn st-btn-small" }, "Edit");
        b.addEventListener("click", () => { menuState.group = { id: gid, returnTo: null }; renderMenu(); });
        const used = groupUsage(gid);
        return el("div", { class: "st-menu-ed-row" }, el("div", { class: "st-menu-ed-main" }, el("strong", null, groupSummary(gid)),
          el("div", { class: "st-hint" }, "Used by " + used + (used === 1 ? " item" : " items"))), b);
      }),
      el("div", { class: "st-actions" }, (() => { const b = el("button", { type: "button", class: "st-btn st-btn-small" }, "+ New dropdown list");
        b.addEventListener("click", () => { menuState.group = { id: null, returnTo: null }; renderMenu(); }); return b; })())));
  }

  /* =======================================================
     CLOSE THE DAY + SHOPPING LIST (owner)
     ======================================================= */
  let closeDate = null;

  async function renderCloseDay() {
    const host = panel("closeday");
    if (!host || !A().isOwner()) return;
    const ymd = A().ymd;
    if (!closeDate) closeDate = ymd(new Date());
    clearEl(host);
    const dateIn = el("input", { type: "date", value: closeDate, max: ymd(new Date()), "aria-label": "Day" });
    dateIn.addEventListener("change", () => { if (dateIn.value) { closeDate = dateIn.value; renderCloseDay(); } });
    host.append(el("div", { class: "st-toolbar" }, el("h2", null, "Close the day"), dateIn));
    const body = el("div", null, el("p", { class: "st-hint" }, "Loading…"));
    host.append(body);

    const start = new Date(closeDate + "T00:00:00"); const end = new Date(start); end.setDate(end.getDate() + 1);
    const isToday = closeDate === ymd(new Date());
    try {
      const c = A().client;
      const orders = await A().fetchAllPages(() => c.from("orders")
        .select("id, source, status, total, handled_at, cancel_reason, order_items(item_id, item_name, quantity, line_total)")
        .in("status", ["confirmed", "cancelled"])
        .gte("handled_at", start.toISOString()).lt("handled_at", end.toISOString())
        .order("handled_at", { ascending: false }));
      const pend = await c.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending");
      const waste = await A().fetchAllPages(() => c.from("stock_log").select("item_id, change, reason")
        .in("reason", A().WASTE_REASONS).gte("created_at", start.toISOString()).lt("created_at", end.toISOString())
        .order("created_at", { ascending: false }));
      const costs = await A().loadCosts();

      const done = orders.filter((o) => o.status === "confirmed");
      const cancelled = orders.filter((o) => o.status === "cancelled");
      const sales = done.reduce((a, o) => a + Number(o.total || 0), 0);
      const bySource = {}, byItem = {};
      let cost = 0, costedRevenue = 0;
      done.forEach((o) => {
        const s = bySource[o.source] || (bySource[o.source] = { n: 0, total: 0 }); s.n++; s.total += Number(o.total || 0);
        (o.order_items || []).forEach((l) => {
          const e = byItem[l.item_id] || (byItem[l.item_id] = { name: l.item_name, qty: 0, total: 0 });
          e.qty += l.quantity; e.total += Number(l.line_total || 0);
          if (costs && costs[l.item_id] !== undefined) { cost += costs[l.item_id] * l.quantity; costedRevenue += Number(l.line_total || 0); }
        });
      });
      let wasteValue = 0;
      waste.forEach((w) => { wasteValue += Math.abs(w.change || 0) * (ITEMS[w.item_id] ? ITEMS[w.item_id].price : 0); });

      clearEl(body);
      const lines = [];   // plain-text version for copying
      const dayLabel = start.toLocaleDateString(A().LOC, { weekday: "long", month: "long", day: "numeric" });
      lines.push("Lita's Jalapeño Poppers — " + dayLabel);
      const kpi = (label, value, cls) => el("div", { class: "st-kpi" + (cls ? " " + cls : "") }, el("div", { class: "st-kpi-label" }, label), el("div", { class: "st-kpi-value" }, value));
      const kpis = [kpi("Total sales", money(sales)), kpi("Orders", String(done.length)),
        kpi("Average order", done.length ? money(sales / done.length) : "—")];
      lines.push("Sales: " + money(sales) + " (" + done.length + " orders)");
      if (costs && Object.keys(costs).length && costedRevenue > 0) {
        kpis.push(kpi("Profit", money(costedRevenue - cost), costedRevenue - cost < 0 ? "is-waste" : "is-profit"));
        lines.push("Profit: " + money(costedRevenue - cost));
      }
      kpis.push(kpi("Cancelled", String(cancelled.length)), kpi("Food wasted (menu price)", money(wasteValue), "is-waste"));
      lines.push("Cancelled: " + cancelled.length + " · Wasted: " + money(wasteValue));
      body.append(el("div", { class: "st-kpis" }, ...kpis));

      if (pend && pend.count > 0) {
        body.append(el("p", { class: "st-order-warn" }, pend.count + (pend.count === 1 ? " order is still waiting to be confirmed or cancelled." : " orders are still waiting to be confirmed or cancelled.")));
      }
      if (!done.length && !cancelled.length) body.append(el("p", { class: "st-hint" }, "No orders were handled on this day."));

      const srcKeys = Object.keys(bySource);
      if (srcKeys.length) {
        body.append(el("div", { class: "st-sales-card" }, el("h3", null, "By order type"),
          table(["Type", "Orders", "Sales"], srcKeys.map((k) => [SOURCE_LABELS[k] || k, String(bySource[k].n), money(bySource[k].total)]))));
        srcKeys.forEach((k) => lines.push("  " + (SOURCE_LABELS[k] || k) + ": " + bySource[k].n + " · " + money(bySource[k].total)));
      }
      const top = Object.keys(byItem).sort((a, b) => byItem[b].qty - byItem[a].qty).slice(0, 8);
      if (top.length) {
        body.append(el("div", { class: "st-sales-card" }, el("h3", null, "Best sellers"),
          table(["Item", "Sold", "Sales"], top.map((id) => [A().itemName(id) || byItem[id].name, String(byItem[id].qty), money(byItem[id].total)]))));
        lines.push("Best sellers: " + top.slice(0, 5).map((id) => (A().itemName(id) || byItem[id].name) + " ×" + byItem[id].qty).join(", "));
      }
      if (cancelled.length) {
        const by = {};
        cancelled.forEach((o) => { const k = o.cancel_reason || "other"; by[k] = (by[k] || 0) + 1; });
        const R = CANCEL_REASONS;
        body.append(el("div", { class: "st-sales-card" }, el("h3", null, "Cancelled orders"),
          table(["Reason", "Orders"], Object.keys(by).map((k) => [R[k] || k, String(by[k])]))));
      }
      if (waste.length) {
        const byW = {};
        waste.forEach((w) => { byW[w.item_id] = (byW[w.item_id] || 0) + Math.abs(w.change || 0); });
        body.append(el("div", { class: "st-sales-card" }, el("h3", null, "Food removed from stock"),
          table(["Item", "Amount"], Object.keys(byW).map((id) => [A().itemName(id), String(byW[id])]))));
      }

      const copy = el("button", { type: "button", class: "st-btn" }, "Copy summary");
      copy.addEventListener("click", () => copyText(lines.join("\n")));
      const print = el("button", { type: "button", class: "st-btn" }, "Print");
      print.addEventListener("click", () => window.print());
      body.append(el("div", { class: "st-actions" }, copy, print));
      if (!isToday) body.append(el("p", { class: "st-hint" }, "The shopping list below shows stock as it is right now."));
    } catch (err) {
      clearEl(body);
      A().handleError(err);
      body.append(el("p", { class: "st-hint" }, "Couldn't load this day."));
    }

    host.append(await shoppingList());
  }

  async function shoppingList() {
    const card = el("section", { class: "st-card" }, el("h3", null, "Shopping list"));
    try {
      await A().loadInventory();
      const inv = A().inventory;
      const { data: restocks } = await A().client.from("stock_log").select("item_id, change, created_at")
        .eq("reason", "restock").order("created_at", { ascending: false }).limit(500);
      const lastRestock = {};
      (restocks || []).forEach((r) => { if (lastRestock[r.item_id] === undefined && r.change > 0) lastRestock[r.item_id] = r.change; });
      const rows = [];
      Object.keys(inv).forEach((id) => {
        const r = inv[id];
        if (!ITEMS[id] || window.MENU_HIDDEN.has(id) || r.mode === "untracked" || r.stock === null || r.stock === undefined) return;
        if (r.stock <= r.low_threshold) {
          const sug = lastRestock[id] || Math.max(1, r.low_threshold * 2 - r.stock);
          rows.push({ id, stock: r.stock, low: r.low_threshold, sug, out: r.stock === 0, usual: !!lastRestock[id] });
        }
      });
      rows.sort((a, b) => (b.out - a.out) || (a.stock - b.stock));
      if (!rows.length) { card.append(el("p", { class: "st-hint" }, "Nothing is low right now. 🎉")); return card; }
      card.append(el("p", { class: "st-hint" }, "Items that are sold out or at their low-stock level. \"Suggested\" is the amount you added last time (or enough to double the low level)."));
      const lines = ["Shopping list — " + new Date().toLocaleDateString(A().LOC, { month: "short", day: "numeric" })];
      rows.forEach((r) => {
        const cb = el("input", { type: "checkbox", "aria-label": "Got " + A().itemName(r.id) });
        card.append(el("div", { class: "st-menu-ed-row" },
          el("label", { class: "st-check" }, cb, " ", el("strong", null, A().itemName(r.id))),
          el("div", { class: "st-hint" }, (r.out ? "Sold out" : r.stock + " left") + " · low level " + r.low + " · suggested " + r.sug)));
        lines.push("☐ " + A().itemName(r.id) + " — " + (r.out ? "sold out" : r.stock + " left") + ", get about " + r.sug);
      });
      const copy = el("button", { type: "button", class: "st-btn" }, "Copy list");
      copy.addEventListener("click", () => copyText(lines.join("\n")));
      const wa = el("a", { class: "st-btn", target: "_blank", rel: "noopener", href: "https://wa.me/?text=" + encodeURIComponent(lines.join("\n")) }, "Send on WhatsApp");
      card.append(el("div", { class: "st-actions" }, copy, wa));
    } catch (err) { card.append(el("p", { class: "st-hint" }, "Couldn't build the list.")); }
    return card;
  }

  /* =======================================================
     CUSTOMERS (owner): repeat wholesale customers
     ======================================================= */
  let custState = { open: null, query: "" };

  function custKey(name) { return String(name || "").trim().replace(/\s+/g, " ").toLowerCase(); }

  async function renderCustomers() {
    const host = panel("customers");
    if (!host || !A().isOwner()) return;
    clearEl(host);
    host.append(el("div", { class: "st-toolbar" }, el("h2", null, "Wholesale customers")));
    const body = el("div", null, el("p", { class: "st-hint" }, "Loading…"));
    host.append(body);
    try {
      const orders = await A().fetchAllPages(() => A().client.from("orders")
        .select("id, customer_name, total, handled_at, fulfillment, notes, order_items(item_id, item_name, quantity)")
        .eq("source", "wholesale").eq("status", "confirmed").order("handled_at", { ascending: false }));
      let notes = {};
      try {
        const { data } = await A().client.from("customer_notes").select("name_key, display_name, phone, note");
        (data || []).forEach((n) => { notes[n.name_key] = n; });
      } catch (e) { /* table may not exist yet */ }

      const byCust = {};
      orders.forEach((o) => {
        const key = custKey(o.customer_name) || "(no name)";
        const c = byCust[key] || (byCust[key] = { key, name: "(no name)", spellings: {}, orders: [], total: 0, items: {} });
        const spelled = String(o.customer_name || "").trim().replace(/\s+/g, " ");
        if (spelled) c.spellings[spelled] = (c.spellings[spelled] || 0) + 1;
        c.orders.push(o); c.total += Number(o.total || 0);
        (o.order_items || []).forEach((l) => { const e = c.items[l.item_id] || (c.items[l.item_id] = { name: l.item_name, qty: 0 }); e.qty += l.quantity; });
      });
      const list = Object.keys(byCust).map((k) => byCust[k]);
      list.forEach((c) => {
        c.last = c.orders[0].handled_at;
        // show the most common spelling (capitalised spellings win a tie)
        const names = Object.keys(c.spellings);
        if (names.length) c.name = names.sort((x, y) => (c.spellings[y] - c.spellings[x]) || ((/[A-Z]/.test(y) ? 1 : 0) - (/[A-Z]/.test(x) ? 1 : 0)))[0];
      });
      list.sort((a, b) => (a.last < b.last ? 1 : -1));

      clearEl(body);
      if (!list.length) { body.append(el("p", { class: "st-hint" }, "No confirmed wholesale orders yet. Customers appear here after their first order is confirmed.")); return; }

      const search = el("input", { type: "search", placeholder: "Search by name", value: custState.query, "aria-label": "Search customers" });
      body.append(el("div", { class: "st-toolbar" }, search));
      const out = el("div", null); body.append(out);
      const now = Date.now();
      const draw = () => {
        clearEl(out);
        const q = custState.query.trim().toLowerCase();
        const shown = list.filter((c) => !q || c.key.indexOf(q) >= 0);
        const repeat = shown.filter((c) => c.orders.length > 1).length;
        out.append(el("p", { class: "st-hint" }, shown.length + (shown.length === 1 ? " customer" : " customers") + " · " + repeat + " ordered more than once"));
        shown.forEach((c) => {
          const days = Math.floor((now - new Date(c.last).getTime()) / 86400000);
          const quiet = days >= 30;
          const open = custState.open === c.key;
          const head = el("button", { type: "button", class: "st-cust-head", "aria-expanded": open ? "true" : "false" },
            el("span", { class: "st-cust-name" }, c.name, c.orders.length > 1 ? el("span", { class: "st-chip st-chip--ok" }, "Repeat") : null,
              quiet ? el("span", { class: "st-chip st-chip--low" }, "Quiet " + days + " days") : null),
            el("span", { class: "st-hint" }, c.orders.length + (c.orders.length === 1 ? " order" : " orders") + " · " + money(c.total) + " · last " + fmtDate(c.last)));
          head.addEventListener("click", () => { custState.open = open ? null : c.key; draw(); });
          const card = el("div", { class: "st-cust" + (open ? " is-open" : "") }, head);
          if (open) card.append(custDetails(c, notes[c.key]));
          out.append(card);
        });
      };
      search.addEventListener("input", () => { custState.query = search.value; draw(); });
      draw();
    } catch (err) { clearEl(body); A().handleError(err); body.append(el("p", { class: "st-hint" }, "Couldn't load customers.")); }
  }

  function custDetails(c, note) {
    const phone = el("input", { type: "text", maxlength: "40", value: (note && note.phone) || "", placeholder: "Phone / WhatsApp" });
    const txt = el("textarea", { rows: "2", maxlength: "1000", placeholder: window.t("Notes (for example: pays on Fridays, no delivery on Mondays)") });
    txt.value = (note && note.note) || "";
    const save = el("button", { type: "button", class: "st-btn st-btn-primary st-btn-small" }, "Save notes");
    save.addEventListener("click", async () => {
      try { await A().rpc("save_customer_note", { p_name: c.name, p_phone: phone.value, p_note: txt.value }); A().toast("Saved."); }
      catch (err) { A().handleError(err); }
    });
    const usual = Object.keys(c.items).sort((a, b) => c.items[b].qty - c.items[a].qty).slice(0, 5)
      .map((id) => (A().itemName(id) || c.items[id].name) + " ×" + c.items[id].qty).join(", ");
    return el("div", { class: "st-cust-body" },
      el("div", { class: "st-form-grid" }, el("label", { class: "st-field" }, "Phone", phone), el("label", { class: "st-field" }, "Notes", txt)),
      el("div", { class: "st-actions" }, save),
      usual ? el("p", null, el("strong", null, "Usually orders:"), " ", usual) : null,
      el("h4", null, "Order history"),
      table(["Date", "Items", "Total"], c.orders.slice(0, 30).map((o) => [
        fmtDate(o.handled_at, { month: "short", day: "numeric", year: "numeric" }),
        (o.order_items || []).map((l) => l.quantity + "× " + l.item_name).join(", ") + (o.fulfillment ? " · " + o.fulfillment : ""),
        money(o.total)])));
  }

  /* =======================================================
     ACTIVITY LOG (owner)
     ======================================================= */
  let actState = { period: "today", kind: "all" };

  async function renderActivity() {
    const host = panel("activity");
    if (!host || !A().isOwner()) return;
    clearEl(host);
    const period = el("select", { "aria-label": "Period" },
      el("option", { value: "today" }, "Today"), el("option", { value: "yesterday" }, "Yesterday"),
      el("option", { value: "7" }, "Last 7 days"), el("option", { value: "30" }, "Last 30 days"));
    period.value = actState.period;
    const kind = el("select", { "aria-label": "What" },
      el("option", { value: "all" }, "Everything"), el("option", { value: "order" }, "Orders"),
      el("option", { value: "stock" }, "Stock changes"), el("option", { value: "menu" }, "Menu changes"));
    kind.value = actState.kind;
    period.addEventListener("change", () => { actState.period = period.value; renderActivity(); });
    kind.addEventListener("change", () => { actState.kind = kind.value; renderActivity(); });
    host.append(el("div", { class: "st-toolbar" }, el("h2", null, "Activity"), period, kind));
    const body = el("div", null, el("p", { class: "st-hint" }, "Loading…")); host.append(body);
    const range = A().periodRange(actState.period, "", "");
    try {
      const rows = await A().rpc("activity_log", { p_from: range.start.toISOString(), p_to: range.end.toISOString(), p_limit: 600 });
      clearEl(body);
      const list = (rows || []).filter((r) => actState.kind === "all" || r.kind === actState.kind);
      if (!list.length) { body.append(el("p", { class: "st-hint" }, "Nothing happened in this period.")); return; }
      let lastDay = "";
      list.forEach((r) => {
        const day = fmtDate(r.at, { weekday: "long", month: "long", day: "numeric" });
        if (day !== lastDay) { body.append(el("h3", { class: "st-act-day" }, day)); lastDay = day; }
        body.append(el("div", { class: "st-act-row st-act-" + r.kind },
          el("span", { class: "st-act-time" }, fmtTime(r.at)),
          el("span", null, el("strong", null, r.actor), " ", describe(r))));
      });
    } catch (err) {
      clearEl(body); A().handleError(err);
      body.append(el("p", { class: "st-hint" }, "Couldn't load the activity log. Run supabase-ownertools-setup.sql first if you haven't."));
    }
  }

  function describe(r) {
    const item = r.item_id ? (A().itemName(r.item_id) || r.item_id) : "";
    const amt = r.amount === null || r.amount === undefined ? null : Math.abs(r.amount);
    if (r.kind === "order") {
      const [status, source] = String(r.action).split(":");
      const src = { online: "restaurant (website)", wholesale: "wholesale", phone: "phone", walkin: "walk-in" }[source] || source;
      const ref = "#" + String(r.order_id).slice(0, 8).toUpperCase();
      return (status === "confirmed" ? "confirmed" : "cancelled") + " a " + src + " order " + ref + " (" + money(r.order_total) + ")" +
        (status === "cancelled" && r.note ? " — " + String(r.note).replace(/^(out_of_stock|changed_mind|no_response|other|voided)/, (x) => CANCEL_REASONS[x] || x) : "");
    }
    if (r.kind === "menu") return "changed the menu: " + (r.note || "");
    switch (r.action) {
      case "restock": return "added " + (amt === null ? "" : amt + " ") + "to " + item + " stock";
      case "morning_count": return "counted " + item + (amt === null ? "" : " (" + (r.amount >= 0 ? "+" : "−") + amt + ")");
      case "adjustment": return "corrected the count of " + item + (amt === null ? "" : " (" + (r.amount >= 0 ? "+" : "−") + amt + ")");
      case "mode_change": return "changed the settings of " + item;
      case "spoiled": return "removed " + (amt || "") + " " + item + " — spoiled";
      case "damaged": return "removed " + (amt || "") + " " + item + " — damaged or dropped";
      case "staff_meal": return "removed " + (amt || "") + " " + item + " — staff meal";
      case "waste_other": return "removed " + (amt || "") + " " + item + " — other";
      default: return String(r.action) + " " + item;
    }
  }

  window.StaffExtras = {
    menu: renderMenu, closeday: renderCloseDay, customers: renderCustomers, activity: renderActivity,
  };
})();
