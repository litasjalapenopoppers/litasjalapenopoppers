# Lita's Jalapeño Poppers — Website

A 5-page site (Home, Menu, Wholesale, About Us, Contact) with two shopping carts
(restaurant and wholesale) that send orders straight to WhatsApp *and* log them
to a database, live "only 3 left / sold out" labels, a photo slideshow, item
option dropdowns, and a language picker (English/Spanish) that translates the
whole site. There is also a staff area (`/staff/`) for tracking stock.
No server for you to run — the site is plain HTML/CSS/JS, and the database
and staff logins use a free hosted service (Supabase).

## Files
- `index.html`, `menu.html`, `wholesale.html`, `about.html`, `contact.html` — the public pages
- `stock.js` — asks the database which items are low or sold out
- `catalog.js` — draws the item lists on the Menu and Wholesale pages
- `gallery.js` — the photo slideshow on the About page
- `style.css` — all styling (colors, fonts, layout)
- `script.js` — menu structure, prices, option groups, cart logic
- `i18n.js` — **all site text**, in English and Spanish, plus the language
  switcher logic
- `db.js` — the connection to Supabase (your project URL + key go here).
  Used by the public site (order logging) and the staff app.
- `supabase-setup.sql` — run first in Supabase: orders tables
- `supabase-inventory-setup.sql` — run second: staff logins, stock, change log
- `supabase-phase2-setup.sql` — run third: live stock for the public site, wholesale orders
- `staff/` — the staff app (sign in, Today's Stock)
- `assets/` — logo, favicons, photos (`assets/gallery/` holds the slideshow photos)
- `favicon.ico` — browser tab icon

## 0. Setting up Supabase (do this once, in this order)
1. **Create a free account** at supabase.com using the **owner's email**
   (not a school email — those usually stop working after graduation).
   Create a new project on the Free plan, save the database password
   somewhere safe, and pick the region closest to Belize.
2. **Run the SQL.** In the SQL Editor, run the whole of
   `supabase-setup.sql`, then the whole of `supabase-inventory-setup.sql`, then
   the whole of `supabase-phase2-setup.sql` (each in its own new query).
3. **Turn off public sign-ups.** In the dashboard go to Authentication →
   Sign In / Providers (the wording may differ slightly) and switch off
   "Allow new users to sign up". Staff accounts are created by you, below.
4. **Copy your keys.** Project Settings → API Keys. Copy the **Project URL**
   and the **Publishable key** (starts with `sb_publishable_`). If your
   dashboard only shows the older "anon" key, use that. **Never** copy the
   "secret" or "service_role" key.
5. **Paste them into `db.js`**, replacing the two placeholders at the top
   (the variable is still named `SUPABASE_ANON_KEY` — that is just a label).
6. **Upload everything to GitHub again**, including the new `staff` folder
   and the changed `db.js`. (Uploading a whole folder through the GitHub
   website is unreliable — use Add file → Upload files, then rename each
   file to include its folder path, e.g. `staff/staff.js`, as before. Or
   use GitHub Desktop.)
7. **Test an order.** Place a test order on the live site, then in Supabase
   open Table Editor → `orders` and `order_items`. It should be there.

Until step 5 is done, `db.js` quietly does nothing: orders still go out via
WhatsApp exactly as before. And even once it's connected, if a database save
ever fails, the WhatsApp order still goes through — the two are independent.

**Free-plan note:** Supabase pauses free projects after about a week with no
activity. A shop with daily orders and staff using the stock screen will keep
it active; a quiet week (a holiday closure) might pause it, and someone would
need to press "restore" in the dashboard. WhatsApp orders keep working either way.

## 0c. Live stock, wholesale, hours and the slideshow (Phase 2)
**Live stock.** The Menu and Wholesale pages show "Only N left" when an item is
at or below its low-stock level, and "Sold out" at zero (the Add button is then
disabled, and customers can't add more than what is left). The numbers refresh
about every 20 seconds while a page is open. Items the owner hasn't entered a
count for, or has set to "Not tracked", show no limit. Customers' carts are
re-checked, and a cart that holds more than is left can't be sent until it is
adjusted. If the database isn't connected, nothing is limited and nothing breaks.
*Note:* in this phase an online order does not reduce stock by itself — stock
drops when staff confirm orders, which is the next phase.

**Two kinds of orders.**
- **Restaurant** (Menu page): pickup only, goes to the restaurant WhatsApp number
  (`WHATSAPP_ORDER_NUMBER` in `script.js`).
- **Wholesale** (Wholesale page): its own cart, with Pickup or Delivery. For
  delivery the customer picks a district. Goes to `WHATSAPP_WHOLESALE_NUMBER`
  in `script.js`. That line is blank for now, so wholesale orders use the number
  on the wholesale flyer (634-8678) until you fill it in.
The two carts are separate, and orders are saved in the database with
`source = online` or `source = wholesale`.

**Wholesale delivery wording** is in `i18n.js` (search for `wholesale_`): free
delivery on Fridays to Belize, Cayo, Stann Creek and Toledo; Corozal and Orange
Walk through IDS (no fee is shown on the site); delivery days and details
are confirmed on WhatsApp. Edit these lines if the real policy differs.

**Hours** are on the Contact page in two sections: Restaurant (Mon–Thu
10 AM–8 PM, Fri–Sat 10 AM–9 PM, closed Sunday) and Packaging area (Mon–Fri
8 AM–5 PM, closed Sat–Sun). Edit them in `contact.html`.

**"Belizean Made Product"** shows on the Home page, the Wholesale page and the
footer of every page. Change the wording in `i18n.js` (`made_in_belize`).

**Slideshow** (About page): photos are in `assets/gallery/main` (large) and
`assets/gallery/thumb` (small). To add a photo: put a square image in each
folder with the same name, add its name to the `PHOTOS` list at the top of
`gallery.js`, and add a caption `gal_<name>` (dashes become underscores) in both
languages in `i18n.js`. Most of the starting photos came from your menu flyers
and booklet, so they are smaller than the originals. Send the original photos
and they can be swapped in for a sharper slideshow.

## 0b. Staff accounts (inventory system, Phase 1)
The staff area is at `https://<your-site>/staff/`. Every public page has a
**Staff Login** button in the top bar (in the menu on phones, translated into
Spanish) that opens it, and the staff page has a "Back to website" link.
Customers never sign in and cannot create accounts. The staff area is protected by a
login; the database itself refuses requests from anyone who isn't signed-in
staff, so this is real protection, not just a hidden page.

**Two roles**
- **Owner:** sees Today's Stock, sets counts, adds stock, changes each item's
  settings, and sees the change log (who changed what, when).
- **Staff:** view-only for now (they will confirm orders and record walk-in
  and phone orders in the next phases).

**Create each person (once per person)**
1. Supabase dashboard → Authentication → Users → Add user. Enter their email
   and a password, and tick "Auto Confirm User".
2. In the SQL Editor, run the template at the bottom of
   `supabase-inventory-setup.sql` (edit the email, name and role). Give the
   owner `'owner'` and everyone else `'staff'`.
3. They can now sign in at `/staff/`. To remove someone's access, run the
   "set active = false" line from the same template.

Forgot password? The owner resets it from Authentication → Users.

**Using Today's Stock (owner)**
Each menu item has a **mode**, which the owner can change per item under
"Settings":
- **Daily batch** — enter the day's count each morning with **Set**.
- **Carry-over** — stock stays until used up; use **Add** when restocking.
- **Not tracked** — no limit at all.
A count of "Not set" means no limit is shown for that item yet. **Set**
replaces the number (use it for the morning count or a correction); **Add**
adds to it (an extra batch, or a restock). "Warn at or below" is the level at
which an item shows as **Low**. The starting modes are only suggestions.

**What's built so far, and what's next**
- Done (Phase 1): staff logins, roles, the stock table and change log,
  Today's Stock screen, and the order status columns in the database.
- Next: live "X left / Sold out" on the public menu (Phase 2), the counter
  tablet's Incoming Orders screen (Phase 3), and the Take an Order screen for
  phone and walk-in orders (Phase 4).

**Adding a new menu item later:** add it in `script.js` and `i18n.js` as
usual. When the owner next opens the staff screen, a stock row for it is
created automatically (as "Not tracked" until the owner turns it on).

## 1. The WhatsApp numbers — please confirm these
The site uses **604-7398** (`5016047398`) for the cart's "Send order on
WhatsApp" button and the contact form — that's the number printed as
"Available on WhatsApp" on Lita's own menu flyers. The wholesale catalog
lists a different number, **634-8678**, used on the Contact page as a
separate "WhatsApp (wholesale)" link.

Please confirm 604-7398 is the right number to receive online orders. If
wholesale customers should check out through the same cart, or you'd rather
split retail/wholesale into two separate carts, let me know and I'll wire
that up. To change either number: `WHATSAPP_ORDER_NUMBER` near the top of
`script.js` (cart + contact form), and the two `wa.me/...` links in
`contact.html`.

## 2. A pricing conflict worth double-checking
The frozen popper packs appear with different numbers in two of your
documents:
- The **Popper Menu** flyer lists flat prices with no pack size stated:
  Chicken $23, Spinach $23, Shrimp/Bacon/Lemon/Buffalo $25.
- The **wholesale catalog booklet** breaks it down by size: Chicken &
  Spinach at $18 / $36 / $90 for 10 / 20 / 50 packs; Shrimp, Bacon, Buffalo,
  Italian Sausage and Lemon Chicken at $20 / $40 / $100.

The site currently uses the **catalog booklet's** numbers, since it's the
more detailed, dedicated wholesale price list — worth confirming which one
is actually current before this goes live. Prices live in `ITEM_PRICES` in
`script.js`.

## 3. The language picker
First-time visitors see a small popup asking English or Español. Their
choice is remembered (so it won't ask again), and an EN / ES switcher in
the nav bar lets them change it anytime — on any page, including mid-order.
Everything switches: nav, headings, menu item names, the cart, and even the
WhatsApp order message itself, in whichever language the visitor picked.
The logo image is the only thing that doesn't change, as requested.

**All site text lives in one file, `i18n.js`.** To fix a typo or reword
something, search for it there — English text is in the `en: { ... }`
block, Spanish in `es: { ... }`, matched by the same key (e.g.
`hero_h1: "..."` appears once per language). To add a third language,
duplicate the `en` block, translate every line, and add a matching button
in each HTML file (search for `data-lang-option`).

## 4. Logo & favicon
The badge logo is in `assets/logo.png` (transparent background, sized for
the nav) and is also the browser tab icon (`favicon.ico` + the PNGs in
`assets/`). To swap in a sharper version later: export it the same way
(transparent background, roughly square crop) and drop it in over the
existing files — no HTML changes needed.

## 5. Photos and the map are live now
- **Photos** — real photos are now in place on the Home and About pages, in
  `assets/photos/`. Since there wasn't a shake photo or a portrait of Lita
  available yet, I used the closest fitting shots instead (the burger and
  the "Enjoy! Comeback Soon" welcome shot) and adjusted their captions to
  match — easy to swap for the real thing later: replace the file in
  `assets/photos/` and keep the same filename, or update the `src` in
  `index.html` / `about.html` to a new filename. The frames crop
  automatically to fit (`object-fit: cover`), so any photo size works
  without breaking the layout.
- **Google Map** — now pinned to Lita's actual location from the link you
  sent (16.5314743, -88.4142091), in `contact.html`.
- **Exact street address** — still just says "Independence Village,
  Belize" in the text on the Contact page and footer, since I only have
  coordinates, not a written address. Send the address text whenever you
  have it and I'll drop it in — the map itself is already accurate.
- **Hours** — already set from your list in an earlier round.

## 6. How the cart → WhatsApp order works
No backend is required. When a customer adds items and taps "Send order on
WhatsApp," the site builds a plain text message (items, quantities, total,
name, pickup/delivery, notes — all in the customer's chosen language) and
opens `https://wa.me/<number>?text=...`, handing off to WhatsApp with that
message pre-filled. The customer taps Send in WhatsApp themselves. The cart
itself lives only in the visitor's own browser (`localStorage`), so nothing
about their order is stored anywhere else — same for their language choice.

## 7. Security notes
This is a static site with no logins, no server, and no database, so most
"website security" concerns (SQL injection, server breaches, session
hijacking) don't apply. What still matters:
- **Serve it over HTTPS.** Any hosting option below gives you free HTTPS
  automatically.
- **No payment info is collected here.** Payment still happens in person or
  however Lita's already handles it — this site never asks for a card
  number. Taking payments on the site itself would be a separate project
  (a real backend + a payment processor).
- The Google Map embed and Google Fonts load from Google's own servers over
  HTTPS; no user data is sent to them beyond a normal page view.

## 8. Putting it online
Any static hosting service works, since these are just plain files:
- **Netlify** — drag the whole `lita-site` folder onto app.netlify.com/drop
  for an instant HTTPS link.
- **GitHub Pages** — push these files to a GitHub repo, then enable Pages
  in the repo settings.

If uploading to an existing host, keep all files (including the `assets`
folder) in the same directory — they reference each other by relative path.

## 9. Testing before you launch
- Open `index.html` directly in a browser to preview locally.
- Try both languages, on every page, including with items in the cart.
- Add a few items on the Menu page, open the cart, and confirm the
  WhatsApp message looks right before sharing the site with anyone.
- Check the mobile view — most customers will likely visit from a phone.
