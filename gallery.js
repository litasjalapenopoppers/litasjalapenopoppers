/* =========================================================
   Lita's Jalapeño Poppers — photo slideshow (About page)
   Arrows, swipe on phones, keyboard arrows, and a thumbnail
   strip. It auto-advances until a visitor takes control, and
   it won't auto-advance at all for people who have asked their
   device to reduce motion.
   Photos live in assets/gallery/main (slides) and
   assets/gallery/thumb (small previews). Captions are in
   i18n.js as gal_<name>.
   ========================================================= */
(function () {
  "use strict";
  const root = document.querySelector("[data-slideshow]");
  if (!root) return;

  // EDIT ME: add, remove or reorder photos here (file name without .jpg).
  // Then add a caption "gal_<name>" for each language in i18n.js.
  const PHOTOS = [
    "poppers-basket", "chicken-burger", "double-beef", "wings-fries",
    "quesadillas", "loaded-nachos", "cheesy-fries", "chicken-fingers",
    "fresh-juices", "milkshakes", "poppers-trio", "shrimp-popper",
    "buffalo-popper", "bacon-popper", "spinach-popper", "frozen-packs",
  ];
  const INTERVAL_MS = 5000;

  const slidesEl = root.querySelector("[data-slides]");
  const thumbsEl = document.querySelector("[data-thumbs]");
  const captionEl = root.querySelector("[data-caption]");
  const counterEl = root.querySelector("[data-counter]");
  const playBtn = root.querySelector("[data-playpause]");
  const prevBtn = root.querySelector("[data-prev]");
  const nextBtn = root.querySelector("[data-next]");

  let index = 0;
  let timer = null;
  let playing = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const caption = (name) => t("gal_" + name.replace(/-/g, "_"));

  PHOTOS.forEach((name, i) => {
    const slide = document.createElement("figure");
    slide.className = "ss-slide";
    slide.setAttribute("aria-hidden", "true");
    const img = document.createElement("img");
    img.src = "assets/gallery/main/" + name + ".jpg";
    img.alt = caption(name);
    if (i > 0) img.loading = "lazy";
    slide.append(img);
    slidesEl.append(slide);

    const b = document.createElement("button");
    b.type = "button";
    b.className = "ss-thumb";
    b.dataset.index = String(i);
    const ti = document.createElement("img");
    ti.src = "assets/gallery/thumb/" + name + ".jpg";
    ti.alt = "";
    ti.loading = "lazy";
    b.append(ti);
    b.addEventListener("click", () => { userControl(); show(i); });
    thumbsEl.append(b);
  });

  function show(i) {
    index = (i + PHOTOS.length) % PHOTOS.length;
    slidesEl.querySelectorAll(".ss-slide").forEach((el, k) => {
      const on = k === index;
      el.classList.toggle("is-active", on);
      el.setAttribute("aria-hidden", on ? "false" : "true");
    });
    thumbsEl.querySelectorAll(".ss-thumb").forEach((el, k) => {
      el.classList.toggle("is-active", k === index);
      el.setAttribute("aria-current", k === index ? "true" : "false");
    });
    captionEl.textContent = caption(PHOTOS[index]);
    counterEl.textContent = (index + 1) + " / " + PHOTOS.length;
  }

  function updateLabels() {
    prevBtn.setAttribute("aria-label", t("gallery_prev"));
    nextBtn.setAttribute("aria-label", t("gallery_next"));
    playBtn.textContent = playing ? t("gallery_pause") : t("gallery_play");
    slidesEl.querySelectorAll(".ss-slide img").forEach((img, k) => { img.alt = caption(PHOTOS[k]); });
    thumbsEl.querySelectorAll(".ss-thumb").forEach((b, k) => {
      b.setAttribute("aria-label", t("gallery_show").replace("{n}", k + 1) + ": " + caption(PHOTOS[k]));
    });
    captionEl.textContent = caption(PHOTOS[index]);
  }

  function start() {
    stop();
    if (playing) timer = setInterval(() => show(index + 1), INTERVAL_MS);
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function userControl() { playing = false; stop(); updateLabels(); }

  prevBtn.addEventListener("click", () => { userControl(); show(index - 1); });
  nextBtn.addEventListener("click", () => { userControl(); show(index + 1); });
  playBtn.addEventListener("click", () => { playing = !playing; updateLabels(); start(); });

  // keyboard
  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { userControl(); show(index - 1); }
    if (e.key === "ArrowRight") { userControl(); show(index + 1); }
  });

  // swipe
  let x0 = null;
  slidesEl.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  slidesEl.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 40) { userControl(); show(index + (dx < 0 ? 1 : -1)); }
  });

  // pause while the pointer is over it (without giving up control for good)
  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);

  // keep captions in the right language when the visitor switches language
  const previousHook = window.onLangApplied;
  window.onLangApplied = function (lang) {
    if (typeof previousHook === "function") previousHook(lang);
    updateLabels();
  };

  updateLabels();
  show(0);
  start();
})();
