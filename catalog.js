/* =========================================================
   Lita's Jalapeño Poppers — item lists (Menu + Wholesale pages)
   renderCatalog(hostElement, ["poppers", "food", ...]) draws the
   items with their option dropdowns, quantity buttons and Add
   buttons, and keeps the live "Only 3 left" / "Sold out" labels
   up to date without redrawing (so a customer's choices aren't lost).
   ========================================================= */
(function () {
  "use strict";
  let host = null;

  function readSelections(id) {
    const sel = {};
    host.querySelectorAll(`select[data-opt-item="${id}"]`).forEach((s) => { sel[s.dataset.optGroup] = s.value; });
    return sel;
  }

  function itemHtml(id) {
    const name = t(`item_${id}_name`);
    const desc = t(`item_${id}_desc`);
    const groups = itemOptionGroups(id);
    const basePrice = itemPriceWithSelections(id, defaultSelections(id));
    const optionsHtml = groups.length ? `
      <div class="item-options">
        ${groups.map((groupId) => `
          <label class="opt-group">
            <span>${t(`opt_${groupId}_label`)}</span>
            <span class="select-wrap">
              <select data-opt-item="${id}" data-opt-group="${groupId}">
                ${OPTION_GROUPS[groupId].choices.map((c) => `<option value="${c.id}">${t(`opt_${groupId}_${c.id}`)}</option>`).join("")}
              </select>
            </span>
          </label>`).join("")}
      </div>` : "";
    return `
      <div class="menu-item" data-item-row="${id}">
        <div>
          <div class="name">${name} <span class="stock-chip" data-stock-chip="${id}" hidden></span></div>
          ${desc ? `<div class="desc">${desc}</div>` : ""}
          ${optionsHtml}
          <div class="stock-note" data-stock-note="${id}" hidden>
            <span data-note-text></span>
            <a data-note-link target="_blank" rel="noopener"></a>
          </div>
        </div>
        <div class="price" data-price="${id}">$${basePrice.toFixed(2)}</div>
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="qty-row">
            <button type="button" data-step="-1" data-id="${id}" aria-label="${t("qty_decrease_label")}">−</button>
            <span class="qty-val" data-qty="${id}">1</span>
            <button type="button" data-step="1" data-id="${id}" aria-label="${t("qty_increase_label")}">+</button>
          </div>
          <button type="button" class="add-btn" data-add="${id}">${t("add_button")}</button>
        </div>
      </div>`;
  }

  function applyStock() {
    if (!host) return;
    host.querySelectorAll("[data-item-row]").forEach((row) => {
      const id = row.dataset.itemRow;
      const info = typeof stockInfo === "function" ? stockInfo(id) : null;
      const rem = typeof availableFor === "function" ? availableFor(id) : null; // null = no limit
      const chip = row.querySelector("[data-stock-chip]");
      const add = row.querySelector("[data-add]");
      const qtyEl = row.querySelector("[data-qty]");
      const minus = row.querySelector('[data-step="-1"]');
      const plus = row.querySelector('[data-step="1"]');

      if (info && info.stock === 0) {
        chip.textContent = t("stock_sold_out");
        chip.className = "stock-chip stock-out";
        chip.hidden = false;
      } else if (info && info.stock <= info.low_threshold) {
        chip.textContent = t("stock_only_left").replace("{n}", info.stock);
        chip.className = "stock-chip stock-low";
        chip.hidden = false;
      } else {
        chip.hidden = true;
      }
      row.classList.toggle("is-soldout", !!info && info.stock === 0);

      const none = rem !== null && rem <= 0;
      let qty = parseInt(qtyEl.textContent, 10) || 1;
      if (rem !== null && !none && qty > rem) { qty = rem; qtyEl.textContent = String(qty); }
      if (minus) minus.disabled = none;
      if (plus) plus.disabled = none || (rem !== null && qty >= rem);
      add.disabled = none;
      const note = row.querySelector("[data-stock-note]");
      let noteKey = null;
      if (info && info.stock > 0 && rem !== null) {
        if (rem === 0) noteKey = "stock_all_in_cart_note";
        else if (qty >= rem) noteKey = "stock_limit_note";
      }
      if (noteKey && note) {
        note.querySelector("[data-note-text]").textContent = t(noteKey).replace("{n}", info.stock);
        const link = note.querySelector("[data-note-link]");
        link.textContent = t("stock_need_more");
        link.href = "https://wa.me/" + orderNumber() + "?text=" +
          encodeURIComponent(t("stock_whatsapp_message").replace("{item}", t(`item_${id}_name`)));
        note.hidden = false;
      } else if (note) { note.hidden = true; }
      if (!add.dataset.flash) {
        add.textContent = none
          ? (info && info.stock === 0 ? t("stock_sold_out") : t("stock_all_in_cart"))
          : t("add_button");
      }
    });
  }

  function wire() {
    host.querySelectorAll("[data-step]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const span = host.querySelector(`[data-qty="${id}"]`);
        let val = parseInt(span.textContent, 10) + parseInt(btn.dataset.step, 10);
        if (val < 1) val = 1;
        const rem = typeof availableFor === "function" ? availableFor(id) : null;
        if (rem !== null && val > rem) val = Math.max(1, rem);
        span.textContent = String(val);
        applyStock();
      });
    });
    host.querySelectorAll("select[data-opt-item]").forEach((sel) => {
      sel.addEventListener("change", () => {
        const id = sel.dataset.optItem;
        const priceEl = host.querySelector(`[data-price="${id}"]`);
        if (priceEl) priceEl.textContent = "$" + itemPriceWithSelections(id, readSelections(id)).toFixed(2);
      });
    });
    host.querySelectorAll("[data-add]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.add;
        const span = host.querySelector(`[data-qty="${id}"]`);
        const qty = parseInt(span.textContent, 10);
        const added = addToCart(id, readSelections(id), qty);
        span.textContent = "1";
        if (added > 0) {
          btn.dataset.flash = "1";
          btn.textContent = t("added_button");
          setTimeout(() => { delete btn.dataset.flash; applyStock(); }, 900);
        }
        applyStock();
      });
    });
  }

  window.renderCatalog = function (hostEl, categories) {
    host = hostEl;
    host.innerHTML = categories.map((cat) => `
      <div class="menu-group">
        <h2>${categoryLabel(cat)}</h2>
        ${MENU_STRUCTURE[cat].map(itemHtml).join("")}
      </div>`).join("");
    wire();
    applyStock();
  };
  window.applyStockToCatalog = applyStock;

  document.addEventListener("stockupdated", applyStock);
  document.addEventListener("cartchanged", applyStock);
})();
