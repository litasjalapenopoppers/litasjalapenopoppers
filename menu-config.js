/* =========================================================
   Lita's Jalapeño Poppers — editable menu
   The built-in menu lives in script.js (ITEMS, MENU_STRUCTURE,
   OPTION_GROUPS) and i18n.js (names, descriptions, labels).
   The owner's changes are stored in the database (table menu_config,
   written from the Menu tab of the staff app) and merged on top here:

     { items:  { <id>: { cat, n, name:{en,es}, desc:{en,es}, price,
                         groups:[groupId...], hidden } },
       groups: { <id>: { label:{en,es},
                         choices:[{ id, name:{en,es}, delta }] } } }

   Built-in items only need the fields that changed. New items also
   need "cat" (one of CATEGORY_ORDER) and "n" (their order in the list).

   Safety: the last good copy is cached in this browser, and if the
   database can't be reached the built-in menu (plus the cache) is used,
   so the public site never breaks because of this file.
   Load order: i18n.js, script.js, menu-config.js, stock.js, catalog.js
   ========================================================= */
(function () {
  "use strict";

  const CACHE_KEY = "lita_menu_cfg_v1";
  const clone = (x) => JSON.parse(JSON.stringify(x));

  // Pristine copies of the built-in menu, taken before anything is merged.
  const BASE = {
    items: clone(ITEMS),
    groups: clone(OPTION_GROUPS),
    structure: clone(MENU_STRUCTURE),
    str: { en: {}, es: {} },
  };
  ["en", "es"].forEach((lang) => {
    Object.keys(STRINGS[lang] || {}).forEach((k) => {
      if (/^(item_|opt_)/.test(k)) BASE.str[lang][k] = STRINGS[lang][k];
    });
  });
  const BASE_CAT = {};
  Object.keys(BASE.structure).forEach((cat) => BASE.structure[cat].forEach((id) => { BASE_CAT[id] = cat; }));

  let current = { items: {}, groups: {} };
  let currentVersion = 0;

  // Items hidden from customers (kept so old orders and stock still make sense).
  window.MENU_HIDDEN = new Set();
  // Same shape as MENU_STRUCTURE but INCLUDING hidden items (the staff app uses it).
  window.ALL_MENU_STRUCTURE = clone(MENU_STRUCTURE);

  function resetToBuiltIn() {
    Object.keys(ITEMS).forEach((k) => delete ITEMS[k]);
    Object.assign(ITEMS, clone(BASE.items));
    Object.keys(OPTION_GROUPS).forEach((k) => delete OPTION_GROUPS[k]);
    Object.assign(OPTION_GROUPS, clone(BASE.groups));
    Object.keys(MENU_STRUCTURE).forEach((k) => { MENU_STRUCTURE[k] = BASE.structure[k].slice(); });
    ["en", "es"].forEach((lang) => {
      Object.keys(STRINGS[lang]).forEach((k) => { if (/^(item_|opt_)/.test(k)) delete STRINGS[lang][k]; });
      Object.assign(STRINGS[lang], BASE.str[lang]);
    });
    window.MENU_HIDDEN.clear();
  }

  function setStr(key, obj) {
    if (!obj) return;
    ["en", "es"].forEach((lang) => {
      const v = typeof obj[lang] === "string" ? obj[lang].trim() : "";
      if (v) STRINGS[lang][key] = v;
    });
  }

  function apply(cfg) {
    try {
      resetToBuiltIn();
      cfg = cfg && typeof cfg === "object" ? cfg : {};
      const groups = cfg.groups && typeof cfg.groups === "object" ? cfg.groups : {};
      const items = cfg.items && typeof cfg.items === "object" ? cfg.items : {};

      Object.keys(groups).forEach((gid) => {
        const g = groups[gid];
        if (!g || !Array.isArray(g.choices) || !g.choices.length) return;
        OPTION_GROUPS[gid] = {
          choices: g.choices.map((c) => ({ id: String(c.id), delta: Number(c.delta) || 0 })),
        };
        setStr(`opt_${gid}_label`, g.label);
        g.choices.forEach((c) => setStr(`opt_${gid}_${c.id}`, c.name));
      });

      const created = [];
      Object.keys(items).forEach((id) => {
        const it = items[id] || {};
        const builtin = BASE.items[id];
        const cat = BASE_CAT[id] || it.cat;
        if (!cat || !MENU_STRUCTURE[cat]) return;
        const price = it.price !== undefined && it.price !== null ? Number(it.price) : (builtin ? builtin.price : 0);
        const entry = { price: isFinite(price) ? price : 0 };
        const gl = Array.isArray(it.groups) ? it.groups : (builtin && builtin.options) || [];
        const valid = gl.filter((g) => OPTION_GROUPS[g]);
        if (valid.length) entry.options = valid;
        ITEMS[id] = entry;
        setStr(`item_${id}_name`, it.name);
        setStr(`item_${id}_desc`, it.desc);
        if (!builtin) created.push({ id, cat, n: Number(it.n) || 0 });
        if (it.hidden) window.MENU_HIDDEN.add(id);
      });

      created.sort((a, b) => a.n - b.n).forEach((c) => MENU_STRUCTURE[c.cat].push(c.id));
      window.ALL_MENU_STRUCTURE = clone(MENU_STRUCTURE);
      Object.keys(MENU_STRUCTURE).forEach((cat) => {
        MENU_STRUCTURE[cat] = MENU_STRUCTURE[cat].filter((id) => !window.MENU_HIDDEN.has(id));
      });
      current = { items: clone(items), groups: clone(groups) };
      cleanCart();
    } catch (err) {
      console.warn("Menu changes could not be applied; using the built-in menu.", err);
      resetToBuiltIn();
      window.ALL_MENU_STRUCTURE = clone(MENU_STRUCTURE);
      current = { items: {}, groups: {} };
    }
  }

  // A customer may have items in their cart that were hidden or had a dropdown
  // choice removed since. Drop or repair those lines quietly.
  function cleanCart() {
    if (typeof getCart !== "function") return;
    let cart;
    try { cart = getCart(); } catch (e) { return; }
    const out = {};
    let changed = false;
    Object.keys(cart).forEach((key) => {
      const line = cart[key];
      if (!line || !ITEMS[line.id] || window.MENU_HIDDEN.has(line.id)) { changed = true; return; }
      const sel = Object.assign({}, line.selections);
      itemOptionGroups(line.id).forEach((g) => {
        const ok = OPTION_GROUPS[g].choices.some((c) => c.id === sel[g]);
        if (!ok) { sel[g] = OPTION_GROUPS[g].choices[0].id; changed = true; }
      });
      const k2 = lineKey(line.id, sel);
      if (out[k2]) out[k2].qty += line.qty; else out[k2] = { id: line.id, qty: line.qty, selections: sel };
      if (k2 !== key) changed = true;
    });
    if (changed) {
      try { localStorage.setItem(CART_KEY, JSON.stringify(out)); } catch (e) { /* ignore */ }
      if (typeof updateCartCount === "function") updateCartCount();
    }
  }

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const o = JSON.parse(raw);
      return o && o.config ? o : null;
    } catch (e) { return null; }
  }
  function writeCache(config, version) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ config, version })); } catch (e) { /* ignore */ }
  }

  async function refresh() {
    const client = typeof getSupabaseClient === "function" ? getSupabaseClient() : null;
    if (!client) return false;
    try {
      const { data, error } = await client.from("menu_config").select("config,version").eq("id", 1).maybeSingle();
      if (error) throw error;
      if (!data) {
        if (currentVersion !== 0) { currentVersion = 0; writeCache({ items: {}, groups: {} }, 0); apply({}); announce(); return true; }
        return false;
      }
      if (data.version === currentVersion) return false;
      currentVersion = data.version;
      writeCache(data.config, data.version);
      apply(data.config);
      announce();
      return true;
    } catch (err) {
      console.warn("The menu changes aren't available right now:", err);
      return false;
    }
  }

  function announce() {
    document.dispatchEvent(new CustomEvent("menuupdated"));
  }

  // 1. Use the cached copy straight away (before anything draws).
  const cached = readCache();
  if (cached) { currentVersion = cached.version || 0; apply(cached.config); }

  // 2. Ask the database for the newest copy.
  window.MenuConfig = {
    refresh,
    apply: (cfg, version) => { currentVersion = version || currentVersion; writeCache(cfg, currentVersion); apply(cfg); announce(); },
    get: () => clone(current),
    version: () => currentVersion,
    isBuiltin: (id) => !!BASE.items[id],
    baseItem: (id) => (BASE.items[id] ? clone(BASE.items[id]) : null),
    baseCategory: (id) => BASE_CAT[id] || null,
    baseGroups: () => clone(BASE.groups),
    baseString: (lang, key) => BASE.str[lang][key] || "",
  };

  document.addEventListener("DOMContentLoaded", () => {
    refresh();
    if (window.STOCK_POLL) {
      setInterval(() => { if (!document.hidden) refresh(); }, 60000);
      document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
    }
  });
})();
