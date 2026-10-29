/* =========================================================
   Lita's Jalapeño Poppers — site logic
   Sections to edit are marked with  EDIT ME
   Item/category/option NAMES live in i18n.js (STRINGS), so
   every language stays in one file. This file holds
   structure, ids, prices and option deltas only.
   ========================================================= */

/* ---------------------------------------------------------
   EDIT ME: WhatsApp number that receives orders from the cart.
   Format: country code + number, digits only, no +, no spaces.
--------------------------------------------------------- */
const WHATSAPP_ORDER_NUMBER = "5016047398";

/* ---------------------------------------------------------
   Reusable option groups (dropdowns). "delta" is added to
   the item's base price when that choice is selected.
   Group/choice LABELS live in i18n.js as opt_<groupId>_label
   and opt_<groupId>_<choiceId>.
--------------------------------------------------------- */
const OPTION_GROUPS = {
  patty: {
    choices: [
      { id: "single", delta: 0 },
      { id: "double", delta: 2.00 },
    ],
  },
  bacon: {
    choices: [
      { id: "none", delta: 0 },
      { id: "add", delta: 2.00 },
    ],
  },
  wings_sauce: {
    choices: [
      { id: "buffalo", delta: 0 },
      { id: "bbq", delta: 0 },
    ],
  },
  dip_type: {
    choices: [
      { id: "ranch", delta: 0 },
      { id: "chipotle", delta: 0 },
    ],
  },
  soda_flavor: {
    choices: [
      { id: "coke", delta: 0 },
      { id: "fanta", delta: 0 },
      { id: "sprite", delta: 0 },
    ],
  },
};

/* ---------------------------------------------------------
   EDIT ME: Menu structure, built from Lita's menu flyers and
   wholesale catalog. Each category lists item ids in order.
   "options" (if present) lists OPTION_GROUPS ids that show as
   dropdowns on that item.
--------------------------------------------------------- */
const CATEGORY_ORDER = ["poppers", "food", "drinks", "wholesale"];

const MENU_STRUCTURE = {
  poppers: ["p_chicken", "p_spinach", "p_bacon", "p_shrimp", "p_lemon_chicken", "p_buffalo_chicken", "p_italian_sausage", "p_steak"],
  food: ["f_beef_burger", "f_chicken_burger", "f_wings6", "f_wings8", "f_wings10", "f_dip", "f_quesadilla_chicken", "f_quesadilla_beef", "f_quesadilla_shrimp", "f_chicken_fingers", "f_nachos_chicken", "f_nachos_beef", "f_cheesy_fries"],
  drinks: ["d_soda", "d_juice_orange", "d_juice_lime", "d_juice_pineapple", "d_juice_watermelon", "d_juice_soursop", "d_juice_cantaloupe", "d_shake_papaya", "d_shake_soursop", "d_shake_cantaloupe", "d_shake_oreo", "d_shake_strawberry"],
  wholesale: [
    "w_chicken_10", "w_chicken_20", "w_chicken_50",
    "w_spinach_10", "w_spinach_20", "w_spinach_50",
    "w_shrimp_10", "w_shrimp_20", "w_shrimp_50",
    "w_bacon_10", "w_bacon_20", "w_bacon_50",
    "w_buffalo_10", "w_buffalo_20", "w_buffalo_50",
    "w_italian_10", "w_italian_20", "w_italian_50",
    "w_lemonchicken_10", "w_lemonchicken_20", "w_lemonchicken_50",
  ],
};

const ITEMS = {
  // Poppers — individual flavors, priced each
  p_chicken: { price: 2.50 }, p_spinach: { price: 2.50 }, p_bacon: { price: 3.00 }, p_shrimp: { price: 3.00 },
  p_lemon_chicken: { price: 3.00 }, p_buffalo_chicken: { price: 3.00 }, p_italian_sausage: { price: 3.00 }, p_steak: { price: 3.00 },

  // Food — burgers now single items with patty + bacon dropdowns
  f_beef_burger: { price: 12.00, options: ["patty", "bacon"] },
  f_chicken_burger: { price: 12.00, options: ["patty", "bacon"] },
  f_wings6: { price: 14.00, options: ["wings_sauce"] },
  f_wings8: { price: 18.00, options: ["wings_sauce"] },
  f_wings10: { price: 22.00, options: ["wings_sauce"] },
  f_dip: { price: 2.00, options: ["dip_type"] },
  f_quesadilla_chicken: { price: 13.00 }, f_quesadilla_beef: { price: 15.00 }, f_quesadilla_shrimp: { price: 18.00 },
  f_chicken_fingers: { price: 13.00 }, f_nachos_chicken: { price: 13.00 }, f_nachos_beef: { price: 15.00 }, f_cheesy_fries: { price: 13.00 },

  // Drinks & shakes — soda now has a flavor dropdown
  d_soda: { price: 2.50, options: ["soda_flavor"] },
  d_juice_orange: { price: 5.00 }, d_juice_lime: { price: 5.00 }, d_juice_pineapple: { price: 5.00 },
  d_juice_watermelon: { price: 5.00 }, d_juice_soursop: { price: 5.00 }, d_juice_cantaloupe: { price: 5.00 },
  d_shake_papaya: { price: 10.00 }, d_shake_soursop: { price: 10.00 }, d_shake_cantaloupe: { price: 10.00 },
  d_shake_oreo: { price: 10.00 }, d_shake_strawberry: { price: 12.00 },

  // Wholesale frozen packs (10 / 20 / 50 per pack)
  w_chicken_10: { price: 18.00 }, w_chicken_20: { price: 36.00 }, w_chicken_50: { price: 90.00 },
  w_spinach_10: { price: 18.00 }, w_spinach_20: { price: 36.00 }, w_spinach_50: { price: 90.00 },
  w_shrimp_10: { price: 20.00 }, w_shrimp_20: { price: 40.00 }, w_shrimp_50: { price: 100.00 },
  w_bacon_10: { price: 20.00 }, w_bacon_20: { price: 40.00 }, w_bacon_50: { price: 100.00 },
  w_buffalo_10: { price: 20.00 }, w_buffalo_20: { price: 40.00 }, w_buffalo_50: { price: 100.00 },
  w_italian_10: { price: 20.00 }, w_italian_20: { price: 40.00 }, w_italian_50: { price: 100.00 },
  w_lemonchicken_10: { price: 20.00 }, w_lemonchicken_20: { price: 40.00 }, w_lemonchicken_50: { price: 100.00 },
};

const CART_KEY = "lita_cart_v2";

/* ---------- Item / option helpers (language-aware) ---------- */
function itemOptionGroups(id) {
  return (ITEMS[id] && ITEMS[id].options) || [];
}
function defaultSelections(id) {
  const sel = {};
  itemOptionGroups(id).forEach((groupId) => {
    sel[groupId] = OPTION_GROUPS[groupId].choices[0].id;
  });
  return sel;
}
function choiceDelta(groupId, choiceId) {
  const group = OPTION_GROUPS[groupId];
  const choice = group && group.choices.find((c) => c.id === choiceId);
  return choice ? choice.delta : 0;
}
function itemPriceWithSelections(id, selections) {
  const base = ITEMS[id] ? ITEMS[id].price : 0;
  const groups = itemOptionGroups(id);
  let total = base;
  groups.forEach((groupId) => {
    total += choiceDelta(groupId, (selections && selections[groupId]) || defaultSelections(id)[groupId]);
  });
  return total;
}
function itemDisplayName(id, selections) {
  const base = t(`item_${id}_name`);
  const groups = itemOptionGroups(id);
  if (!groups.length) return base;
  const parts = groups.map((groupId) => t(`opt_${groupId}_${(selections && selections[groupId]) || defaultSelections(id)[groupId]}`));
  return `${base} (${parts.join(", ")})`;
}
function categoryLabel(catKey) {
  return t(`cat_${catKey}`);
}
function lineKey(id, selections) {
  const groups = itemOptionGroups(id);
  if (!groups.length) return id;
  return id + "|" + groups.map((g) => `${g}:${selections[g]}`).join(",");
}

/* ---------- Cart storage helpers ---------- */
// cart = { [lineKey]: { id, qty, selections } }
function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}
function addToCart(id, selections, qty) {
  if (qty <= 0) return;
  const sel = selections || defaultSelections(id);
  const key = lineKey(id, sel);
  const cart = getCart();
  if (cart[key]) {
    cart[key].qty += qty;
  } else {
    cart[key] = { id, qty, selections: sel };
  }
  saveCart(cart);
}
function setCartLineQty(key, qty) {
  const cart = getCart();
  if (qty <= 0) {
    delete cart[key];
  } else if (cart[key]) {
    cart[key].qty = qty;
  }
  saveCart(cart);
  renderCartDrawer();
}
function cartItemCount() {
  const cart = getCart();
  return Object.values(cart).reduce((a, line) => a + line.qty, 0);
}
function cartTotal() {
  const cart = getCart();
  let total = 0;
  for (const key in cart) {
    const line = cart[key];
    total += itemPriceWithSelections(line.id, line.selections) * line.qty;
  }
  return total;
}
function updateCartCount() {
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = cartItemCount();
  });
}

/* ---------- Cart drawer UI (present on every page) ---------- */
function renderCartDrawer() {
  const body = document.querySelector("[data-cart-body]");
  if (!body) return;
  const cart = getCart();
  const keys = Object.keys(cart);

  if (keys.length === 0) {
    body.innerHTML = `<p class="cart-empty">${t("cart_empty")}</p>`;
  } else {
    body.innerHTML = keys.map((key) => {
      const line = cart[key];
      const name = itemDisplayName(line.id, line.selections);
      const price = itemPriceWithSelections(line.id, line.selections);
      return `
        <div class="cart-line">
          <div>
            <div class="cl-name">${name}</div>
            <div class="cl-meta">$${price.toFixed(2)} × ${line.qty} = $${(price * line.qty).toFixed(2)}</div>
          </div>
          <button class="cl-remove" data-remove="${key}" aria-label="${t("cart_remove")} ${name}">${t("cart_remove")}</button>
        </div>`;
    }).join("");

    body.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => setCartLineQty(btn.dataset.remove, 0));
    });
  }

  const totalEl = document.querySelector("[data-cart-total]");
  if (totalEl) totalEl.textContent = "$" + cartTotal().toFixed(2);

  const orderBtn = document.querySelector("[data-whatsapp-order]");
  if (orderBtn) orderBtn.disabled = keys.length === 0;
}

function buildWhatsAppOrderMessage() {
  const cart = getCart();
  const keys = Object.keys(cart);
  const nameField = document.querySelector("[data-order-name]");
  const pickupField = document.querySelector('input[name="fulfillment"]:checked');
  const notesField = document.querySelector("[data-order-notes]");

  let lines = [t("order_greeting"), ""];
  keys.forEach((key) => {
    const line = cart[key];
    const name = itemDisplayName(line.id, line.selections);
    const price = itemPriceWithSelections(line.id, line.selections);
    lines.push(`${line.qty}x ${name} — $${(price * line.qty).toFixed(2)}`);
  });
  lines.push("");
  lines.push(`${t("order_total_label")}: $${cartTotal().toFixed(2)} BZD`);
  if (nameField && nameField.value.trim()) lines.push(`${t("order_name_label")}: ${nameField.value.trim()}`);
  if (pickupField) {
    const fulfillmentLabel = pickupField.value === "delivery" ? t("cart_delivery") : t("cart_pickup");
    lines.push(`${t("order_fulfillment_label")}: ${fulfillmentLabel}`);
  }
  if (notesField && notesField.value.trim()) lines.push(`${t("order_notes_label")}: ${notesField.value.trim()}`);

  return lines.join("\n");
}

function sendWhatsAppOrder() {
  // Fire-and-forget order logging (see db.js) — deliberately not
  // awaited, so a slow or failed database write can never delay or
  // block window.open() below. Popup blockers can reject window.open
  // calls that happen after an await, so this stays fully synchronous.
  if (typeof logOrderToDatabase === "function") {
    const cart = getCart();
    const cartSnapshot = Object.values(cart).map((line) => ({
      id: line.id,
      name: itemDisplayName(line.id, line.selections),
      price: itemPriceWithSelections(line.id, line.selections),
      qty: line.qty,
    }));
    const nameField = document.querySelector("[data-order-name]");
    const pickupField = document.querySelector('input[name="fulfillment"]:checked');
    const notesField = document.querySelector("[data-order-notes]");
    logOrderToDatabase(cartSnapshot, {
      name: nameField ? nameField.value.trim() : "",
      fulfillment: pickupField ? pickupField.value : "",
      notes: notesField ? notesField.value.trim() : "",
      language: typeof currentLang === "function" ? currentLang() : "en",
      total: cartTotal(),
    });
  }

  const message = buildWhatsAppOrderMessage();
  const url = `https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener");
}

/* ---------- Shared page setup ---------- */
function setupNavAndCart() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const links = document.querySelector("[data-nav-links]");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  const cartOpeners = document.querySelectorAll("[data-open-cart]");
  const overlay = document.querySelector("[data-cart-overlay]");
  const drawer = document.querySelector("[data-cart-drawer]");
  const closeBtn = document.querySelector("[data-close-cart]");

  function openCart() {
    renderCartDrawer();
    if (overlay) overlay.classList.add("open");
    if (drawer) drawer.classList.add("open");
  }
  function closeCart() {
    if (overlay) overlay.classList.remove("open");
    if (drawer) drawer.classList.remove("open");
  }
  cartOpeners.forEach((btn) => btn.addEventListener("click", openCart));
  if (closeBtn) closeBtn.addEventListener("click", closeCart);
  if (overlay) overlay.addEventListener("click", closeCart);

  const orderBtn = document.querySelector("[data-whatsapp-order]");
  if (orderBtn) orderBtn.addEventListener("click", sendWhatsAppOrder);

  updateCartCount();
}

document.addEventListener("DOMContentLoaded", setupNavAndCart);
