/* =========================================================
   Lita's Jalapeño Poppers — language switching
   All translatable text lives in STRINGS below. To add a
   language: copy the "en" block, translate every value, and
   add a button for it in the language modal / switcher
   markup (search each HTML file for data-lang-option).
   ========================================================= */

const LANG_KEY = "lita_lang";

const STRINGS = {
  en: {
    // Nav
    nav_home: "Home",
    nav_menu: "Menu",
    nav_about: "About Us",
    nav_contact: "Contact",
    cart_word: "Cart",
    cart_open_label: "Open cart",
    nav_toggle_label: "Open menu",
    brand_tagline: "Independence Village, Belize",

    // Language modal / switcher
    lang_modal_heading: "Choose your language",
    lang_modal_sub: "You can change this anytime from the menu bar.",
    lang_option_en: "English",
    lang_option_es: "Español",

    // Home — hero
    home_title: "Lita's Jalapeño Poppers — Independence Village, Belize",
    home_desc: "Homemade jalapeño poppers, food, drinks and shakes in Independence Village, Belize. Order for pickup on WhatsApp.",
    hero_eyebrow: "Independence Village, Belize · Family-run since 2016",
    hero_h1: "Ten years of stuffing peppers right.",
    hero_p: "What started as jalapeño poppers on a tray has grown into a full menu of food, drinks and shakes — made fresh and ready for pickup, right here in Independence Village.",
    hero_cta_menu: "View the menu",
    hero_cta_find: "Find us",
    photo_caption_1: "Fresh out of the fryer",
    photo_caption_2: "Our signature burger",

    // Home — category strip
    category_heading: "On the menu",
    cat_poppers_short: "Poppers",
    cat_food_short: "Food",
    cat_drinks_short: "Drinks & Shakes",
    cat_wholesale_short: "Wholesale",
    cat_poppers_desc: "Eight flavors made fresh to order — chicken, spinach, bacon, shrimp, lemon chicken, buffalo chicken, Italian sausage and steak.",
    cat_food_desc: "Burgers, wings, quesadillas, nachos and more, made fresh to order.",
    cat_drinks_desc: "Fresh juices, milk shakes and cold sodas.",
    cat_wholesale_desc: "Frozen poppers by the pack — 10, 20 or 50 — for events, resale or stocking up.",

    // Home — story
    story_stat_label: "years in the village",
    story_h2_home: "Still family-run, still local.",
    story_p_home: "Lita's has been serving Independence Village for a decade — starting with a simple batch of jalapeño poppers and growing, one order at a time, into a full menu that neighbors and visitors come back for. Every order is made fresh, and every customer is treated like family.",
    story_cta: "Read our story",

    // Home — CTA band
    cta_heading: "Ready to order?",
    cta_p: "Build your order on the Menu page, then send it straight to us on WhatsApp — we'll confirm your pickup time.",
    cta_button: "Order on WhatsApp",

    // Footer (shared)
    footer_tagline: "Homemade poppers, food, drinks and shakes — retail and wholesale — in Independence Village, Belize.",
    footer_visit: "Visit",
    footer_address: "Independence Village, Belize",
    footer_contact_heading: "Get in touch",
    footer_link_contact: "Contact & hours",
    footer_link_order: "Order on WhatsApp",
    footer_copyright: "All rights reserved.",

    // Cart drawer (shared)
    cart_drawer_heading: "Your order",
    cart_empty: "Your cart is empty. Add something tasty from the Menu.",
    cart_total_label: "Total",
    cart_name_label: "Your name",
    cart_name_placeholder: "e.g. Maria",
    cart_fulfillment_label: "Pickup or delivery?",
    cart_pickup: "Pickup",
    cart_delivery: "Delivery",
    cart_notes_label: "Notes (optional)",
    cart_notes_placeholder: "e.g. extra spicy, no bacon",
    cart_send_button: "Send order on WhatsApp",
    cart_remove: "Remove",
    cart_close_label: "Close cart",

    // Menu page
    menu_title: "Menu — Lita's Jalapeño Poppers",
    menu_desc: "Poppers, food, drinks, shakes and wholesale packs — browse the full menu and order on WhatsApp.",
    menu_page_eyebrow: "Prices in BZD",
    menu_page_h1: "Full menu",
    menu_page_p: "Add what you'd like, then send your order straight to us on WhatsApp.",
    filter_all: "All",
    add_button: "Add",
    added_button: "Added ✓",
    qty_decrease_label: "Decrease quantity",
    qty_increase_label: "Increase quantity",

    // Menu categories
    cat_poppers: "Jalapeño Poppers",
    cat_food: "Food",
    cat_drinks: "Drinks & Shakes",
    cat_wholesale: "Wholesale Frozen Packs",

    // Poppers (individual, priced each)
    item_p_chicken_name: "Chicken Popper",
    item_p_spinach_name: "Spinach Popper",
    item_p_bacon_name: "Bacon Popper",
    item_p_shrimp_name: "Shrimp Popper",
    item_p_lemon_chicken_name: "Lemon Chicken Popper",
    item_p_buffalo_chicken_name: "Buffalo Chicken Popper",
    item_p_italian_sausage_name: "Italian Sausage Popper",
    item_p_steak_name: "Steak Popper",
    item_p_chicken_desc: "", item_p_spinach_desc: "", item_p_bacon_desc: "", item_p_shrimp_desc: "",
    item_p_lemon_chicken_desc: "", item_p_buffalo_chicken_desc: "", item_p_italian_sausage_desc: "", item_p_steak_desc: "",

    // Food
    item_f_beef_burger_name: "Beef Burger",
    item_f_chicken_burger_name: "Chicken Burger",
    item_f_wings6_name: "Wings — 6 pc",
    item_f_wings8_name: "Wings — 8 pc",
    item_f_wings10_name: "Wings — 10 pc",
    item_f_dip_name: "Ranch / Chipotle Ranch",
    item_f_quesadilla_chicken_name: "Chicken Quesadilla",
    item_f_quesadilla_beef_name: "Beef Quesadilla",
    item_f_quesadilla_shrimp_name: "Shrimp Quesadilla",
    item_f_chicken_fingers_name: "Chicken Fingers",
    item_f_nachos_chicken_name: "Chicken Nachos",
    item_f_nachos_beef_name: "Beef Nachos",
    item_f_cheesy_fries_name: "Chicken Cheesy Fries",
    item_f_beef_burger_desc: "", item_f_chicken_burger_desc: "",
    item_f_wings6_desc: "", item_f_wings8_desc: "", item_f_wings10_desc: "",
    item_f_dip_desc: "", item_f_quesadilla_chicken_desc: "", item_f_quesadilla_beef_desc: "",
    item_f_quesadilla_shrimp_desc: "", item_f_chicken_fingers_desc: "", item_f_nachos_chicken_desc: "",
    item_f_nachos_beef_desc: "", item_f_cheesy_fries_desc: "",

    // Dropdown option groups (reused across items)
    opt_patty_label: "Patty",
    opt_patty_single: "Single",
    opt_patty_double: "Double",
    opt_bacon_label: "Bacon",
    opt_bacon_none: "No bacon",
    opt_bacon_add: "Add bacon (single strip)",
    opt_wings_sauce_label: "Sauce",
    opt_wings_sauce_buffalo: "Buffalo",
    opt_wings_sauce_bbq: "BBQ",
    opt_dip_type_label: "Type",
    opt_dip_type_ranch: "Ranch",
    opt_dip_type_chipotle: "Chipotle Ranch",
    opt_soda_flavor_label: "Flavor",
    opt_soda_flavor_coke: "Coke",
    opt_soda_flavor_fanta: "Orange Fanta",
    opt_soda_flavor_sprite: "Sprite",

    // Drinks & shakes
    item_d_soda_name: "Soda (can)",
    item_d_juice_orange_name: "Fresh Orange Juice",
    item_d_juice_lime_name: "Fresh Lime Juice",
    item_d_juice_pineapple_name: "Fresh Pineapple Juice",
    item_d_juice_watermelon_name: "Fresh Watermelon Juice",
    item_d_juice_soursop_name: "Fresh Soursop Juice",
    item_d_juice_cantaloupe_name: "Fresh Cantaloupe Juice",
    item_d_shake_papaya_name: "Papaya Shake",
    item_d_shake_soursop_name: "Soursop Shake",
    item_d_shake_cantaloupe_name: "Cantaloupe Shake",
    item_d_shake_oreo_name: "Oreo Cookie Shake",
    item_d_shake_strawberry_name: "Strawberry Shake",
    item_d_soda_desc: "",
    item_d_juice_orange_desc: "", item_d_juice_lime_desc: "", item_d_juice_pineapple_desc: "",
    item_d_juice_watermelon_desc: "", item_d_juice_soursop_desc: "", item_d_juice_cantaloupe_desc: "",
    item_d_shake_papaya_desc: "", item_d_shake_soursop_desc: "", item_d_shake_cantaloupe_desc: "",
    item_d_shake_oreo_desc: "", item_d_shake_strawberry_desc: "",

    // Wholesale frozen packs
    item_w_chicken_10_name: "Chicken & Cream Cheese — 10 pack",
    item_w_chicken_20_name: "Chicken & Cream Cheese — 20 pack",
    item_w_chicken_50_name: "Chicken & Cream Cheese — 50 pack",
    item_w_spinach_10_name: "Spinach & Cream Cheese — 10 pack",
    item_w_spinach_20_name: "Spinach & Cream Cheese — 20 pack",
    item_w_spinach_50_name: "Spinach & Cream Cheese — 50 pack",
    item_w_shrimp_10_name: "Shrimp & Cream Cheese — 10 pack",
    item_w_shrimp_20_name: "Shrimp & Cream Cheese — 20 pack",
    item_w_shrimp_50_name: "Shrimp & Cream Cheese — 50 pack",
    item_w_bacon_10_name: "Bacon & Cream Cheese — 10 pack",
    item_w_bacon_20_name: "Bacon & Cream Cheese — 20 pack",
    item_w_bacon_50_name: "Bacon & Cream Cheese — 50 pack",
    item_w_buffalo_10_name: "Buffalo & Cream Cheese — 10 pack",
    item_w_buffalo_20_name: "Buffalo & Cream Cheese — 20 pack",
    item_w_buffalo_50_name: "Buffalo & Cream Cheese — 50 pack",
    item_w_italian_10_name: "Italian Sausage & Cream Cheese — 10 pack",
    item_w_italian_20_name: "Italian Sausage & Cream Cheese — 20 pack",
    item_w_italian_50_name: "Italian Sausage & Cream Cheese — 50 pack",
    item_w_lemonchicken_10_name: "Lemon Chicken & Cream Cheese — 10 pack",
    item_w_lemonchicken_20_name: "Lemon Chicken & Cream Cheese — 20 pack",
    item_w_lemonchicken_50_name: "Lemon Chicken & Cream Cheese — 50 pack",
    item_w_chicken_10_desc: "Frozen, ready to fry.", item_w_chicken_20_desc: "Frozen, ready to fry.", item_w_chicken_50_desc: "Frozen, ready to fry.",
    item_w_spinach_10_desc: "Frozen, ready to fry.", item_w_spinach_20_desc: "Frozen, ready to fry.", item_w_spinach_50_desc: "Frozen, ready to fry.",
    item_w_shrimp_10_desc: "Frozen, ready to fry.", item_w_shrimp_20_desc: "Frozen, ready to fry.", item_w_shrimp_50_desc: "Frozen, ready to fry.",
    item_w_bacon_10_desc: "Frozen, ready to fry.", item_w_bacon_20_desc: "Frozen, ready to fry.", item_w_bacon_50_desc: "Frozen, ready to fry.",
    item_w_buffalo_10_desc: "Frozen, ready to fry.", item_w_buffalo_20_desc: "Frozen, ready to fry.", item_w_buffalo_50_desc: "Frozen, ready to fry.",
    item_w_italian_10_desc: "Frozen, ready to fry.", item_w_italian_20_desc: "Frozen, ready to fry.", item_w_italian_50_desc: "Frozen, ready to fry.",
    item_w_lemonchicken_10_desc: "Frozen, ready to fry.", item_w_lemonchicken_20_desc: "Frozen, ready to fry.", item_w_lemonchicken_50_desc: "Frozen, ready to fry.",

    // About page
    about_title: "About Us — Lita's Jalapeño Poppers",
    about_desc: "Ten years of Lita's Jalapeño Poppers in Independence Village, Belize — our story.",
    about_page_eyebrow: "Our story",
    about_page_h1: "From a tray of poppers to a full menu.",
    about_block1_h2: "How it started",
    about_block1_p: "Lita started out selling jalapeño poppers around Independence Village — a simple recipe, made fresh, sold by hand. Word got around fast, and what began as a side hustle became a business the whole village knew by name.",
    about_block1_caption: "A warm welcome, every time",
    about_block2_h2: "Growing the menu",
    about_block2_p: "As more people asked for more than just poppers, the menu grew with them — burgers, wings, quesadillas, fresh juices and hand-blended shakes joined the lineup, all made the same way from day one: fresh, and by hand. Today Lita's also supplies frozen poppers wholesale, by the pack.",
    about_block2_caption: "A little bit of everything",
    about_story_h2: "Still local, still family-run.",
    about_story_p: "Independence Village has been home to Lita's Jalapeño Poppers for a decade. Every order — whether it's a tray of poppers for a family gathering or a wholesale pack for resale — is made with the same care as the very first batch.",
    about_story_cta: "See the menu",

    // Contact page
    contact_title: "Contact — Lita's Jalapeño Poppers",
    contact_desc: "Find Lita's Jalapeño Poppers in Independence Village, Belize — hours, location and how to reach us.",
    contact_page_eyebrow: "Find us",
    contact_page_h1: "Visit or reach out",
    label_address: "Address",
    label_phone: "Phone",
    label_whatsapp: "WhatsApp (orders)",
    label_whatsapp_wholesale: "WhatsApp (wholesale)",
    whatsapp_chat_text: "Chat with us",
    label_hours: "Hours",
    hours_mon: "Monday", hours_tue: "Tuesday", hours_wed: "Wednesday", hours_thu: "Thursday",
    hours_fri: "Friday", hours_sat: "Saturday", hours_sun: "Sunday",
    label_facebook: "Facebook",
    label_email: "Email",
    map_note: "To update the map below, search Lita's address on Google Maps, choose Share → Embed a map, and paste the src link into the iframe in contact.html.",
    contact_form_heading: "Send a message",
    contact_form_p: "Prefer to type it out? This sends straight to our WhatsApp too.",
    label_name: "Name",
    label_phone_optional: "Phone (optional)",
    label_message: "Message",
    message_placeholder: "How can we help?",
    contact_submit: "Send on WhatsApp",

    // WhatsApp message building (script.js)
    order_greeting: "Hi Lita's Jalapeño Poppers! I'd like to place an order:",
    order_total_label: "Total",
    order_name_label: "Name",
    order_fulfillment_label: "Fulfillment",
    order_notes_label: "Notes",
    contact_msg_greeting: "Hi Lita's Jalapeño Poppers, my name is",
    contact_msg_phone_label: "My phone",
  },

  es: {
    nav_home: "Inicio",
    nav_menu: "Menú",
    nav_about: "Sobre Nosotros",
    nav_contact: "Contacto",
    cart_word: "Carrito",
    cart_open_label: "Ver carrito",
    nav_toggle_label: "Abrir menú",
    brand_tagline: "Independence Village, Belice",

    lang_modal_heading: "Elige tu idioma",
    lang_modal_sub: "Puedes cambiarlo cuando quieras desde el menú.",
    lang_option_en: "English",
    lang_option_es: "Español",

    home_title: "Lita's Jalapeño Poppers — Independence Village, Belice",
    home_desc: "Poppers de jalapeño, comida, bebidas y batidos caseros en Independence Village, Belice. Pide para recoger por WhatsApp.",
    hero_eyebrow: "Independence Village, Belice · Negocio familiar desde 2016",
    hero_h1: "Diez años rellenando chiles como se debe.",
    hero_p: "Lo que comenzó como jalapeños rellenos en una bandeja se convirtió en un menú completo de comida, bebidas y batidos — todo fresco y listo para recoger, aquí mismo en Independence Village.",
    hero_cta_menu: "Ver el menú",
    hero_cta_find: "Cómo llegar",
    photo_caption_1: "Recién salidos de la freidora",
    photo_caption_2: "Nuestra hamburguesa insignia",

    category_heading: "En el menú",
    cat_poppers_short: "Poppers",
    cat_food_short: "Comida",
    cat_drinks_short: "Bebidas y Batidos",
    cat_wholesale_short: "Mayoreo",
    cat_poppers_desc: "Ocho sabores preparados frescos al momento — pollo, espinaca, tocino, camarón, pollo al limón, pollo búfalo, salchicha italiana y res.",
    cat_food_desc: "Hamburguesas, alitas, quesadillas, nachos y más, preparados frescos al momento.",
    cat_drinks_desc: "Jugos frescos, batidos y refrescos fríos.",
    cat_wholesale_desc: "Poppers congelados por paquete — 10, 20 o 50 — para eventos, reventa o para abastecerte.",

    story_stat_label: "años en la aldea",
    story_h2_home: "Seguimos siendo familiares y locales.",
    story_p_home: "Lita's ha servido a Independence Village durante una década — comenzando con una simple tanda de jalapeños rellenos y creciendo, pedido a pedido, hasta convertirse en un menú completo al que vecinos y visitantes vuelven una y otra vez. Cada pedido se prepara fresco, y cada cliente es tratado como familia.",
    story_cta: "Conoce nuestra historia",

    cta_heading: "¿Listo para pedir?",
    cta_p: "Arma tu pedido en la página del Menú y envíalo directo por WhatsApp — te confirmamos la hora de recogida.",
    cta_button: "Pedir por WhatsApp",

    footer_tagline: "Poppers, comida, bebidas y batidos caseros — al detalle y al por mayor — en Independence Village, Belice.",
    footer_visit: "Visítanos",
    footer_address: "Independence Village, Belice",
    footer_contact_heading: "Contáctanos",
    footer_link_contact: "Contacto y horario",
    footer_link_order: "Pedir por WhatsApp",
    footer_copyright: "Todos los derechos reservados.",

    cart_drawer_heading: "Tu pedido",
    cart_empty: "Tu carrito está vacío. Agrega algo delicioso desde el Menú.",
    cart_total_label: "Total",
    cart_name_label: "Tu nombre",
    cart_name_placeholder: "ej. María",
    cart_fulfillment_label: "¿Recoger o entrega?",
    cart_pickup: "Recoger",
    cart_delivery: "Entrega",
    cart_notes_label: "Notas (opcional)",
    cart_notes_placeholder: "ej. extra picante, sin tocino",
    cart_send_button: "Enviar pedido por WhatsApp",
    cart_remove: "Quitar",
    cart_close_label: "Cerrar carrito",

    menu_title: "Menú — Lita's Jalapeño Poppers",
    menu_desc: "Poppers, comida, bebidas, batidos y paquetes al por mayor — explora el menú completo y pide por WhatsApp.",
    menu_page_eyebrow: "Precios en BZD",
    menu_page_h1: "Menú completo",
    menu_page_p: "Agrega lo que quieras y envía tu pedido directo por WhatsApp.",
    filter_all: "Todo",
    add_button: "Agregar",
    added_button: "Agregado ✓",
    qty_decrease_label: "Reducir cantidad",
    qty_increase_label: "Aumentar cantidad",

    cat_poppers: "Jalapeños Rellenos",
    cat_food: "Comida",
    cat_drinks: "Bebidas y Batidos",
    cat_wholesale: "Paquetes al por Mayor (Congelados)",

    item_p_chicken_name: "Popper de Pollo",
    item_p_spinach_name: "Popper de Espinaca",
    item_p_bacon_name: "Popper de Tocino",
    item_p_shrimp_name: "Popper de Camarón",
    item_p_lemon_chicken_name: "Popper de Pollo al Limón",
    item_p_buffalo_chicken_name: "Popper de Pollo Búfalo",
    item_p_italian_sausage_name: "Popper de Salchicha Italiana",
    item_p_steak_name: "Popper de Res",
    item_p_chicken_desc: "", item_p_spinach_desc: "", item_p_bacon_desc: "", item_p_shrimp_desc: "",
    item_p_lemon_chicken_desc: "", item_p_buffalo_chicken_desc: "", item_p_italian_sausage_desc: "", item_p_steak_desc: "",

    item_f_beef_burger_name: "Hamburguesa de Res",
    item_f_chicken_burger_name: "Hamburguesa de Pollo",
    item_f_wings6_name: "Alitas — 6 pz",
    item_f_wings8_name: "Alitas — 8 pz",
    item_f_wings10_name: "Alitas — 10 pz",
    item_f_dip_name: "Ranch / Ranch Chipotle",
    item_f_quesadilla_chicken_name: "Quesadilla de Pollo",
    item_f_quesadilla_beef_name: "Quesadilla de Res",
    item_f_quesadilla_shrimp_name: "Quesadilla de Camarón",
    item_f_chicken_fingers_name: "Dedos de Pollo",
    item_f_nachos_chicken_name: "Nachos de Pollo",
    item_f_nachos_beef_name: "Nachos de Res",
    item_f_cheesy_fries_name: "Papas con Queso y Pollo",
    item_f_beef_burger_desc: "", item_f_chicken_burger_desc: "",
    item_f_wings6_desc: "", item_f_wings8_desc: "", item_f_wings10_desc: "",
    item_f_dip_desc: "", item_f_quesadilla_chicken_desc: "", item_f_quesadilla_beef_desc: "",
    item_f_quesadilla_shrimp_desc: "", item_f_chicken_fingers_desc: "", item_f_nachos_chicken_desc: "",
    item_f_nachos_beef_desc: "", item_f_cheesy_fries_desc: "",

    opt_patty_label: "Carne",
    opt_patty_single: "Sencilla",
    opt_patty_double: "Doble",
    opt_bacon_label: "Tocino",
    opt_bacon_none: "Sin tocino",
    opt_bacon_add: "Agregar tocino (una tira)",
    opt_wings_sauce_label: "Salsa",
    opt_wings_sauce_buffalo: "Búfalo",
    opt_wings_sauce_bbq: "BBQ",
    opt_dip_type_label: "Tipo",
    opt_dip_type_ranch: "Ranch",
    opt_dip_type_chipotle: "Ranch Chipotle",
    opt_soda_flavor_label: "Sabor",
    opt_soda_flavor_coke: "Coca-Cola",
    opt_soda_flavor_fanta: "Fanta de Naranja",
    opt_soda_flavor_sprite: "Sprite",

    item_d_soda_name: "Refresco (lata)",
    item_d_juice_orange_name: "Jugo Fresco de Naranja",
    item_d_juice_lime_name: "Jugo Fresco de Limón",
    item_d_juice_pineapple_name: "Jugo Fresco de Piña",
    item_d_juice_watermelon_name: "Jugo Fresco de Sandía",
    item_d_juice_soursop_name: "Jugo Fresco de Guanábana",
    item_d_juice_cantaloupe_name: "Jugo Fresco de Melón",
    item_d_shake_papaya_name: "Batido de Papaya",
    item_d_shake_soursop_name: "Batido de Guanábana",
    item_d_shake_cantaloupe_name: "Batido de Melón",
    item_d_shake_oreo_name: "Batido de Galleta Oreo",
    item_d_shake_strawberry_name: "Batido de Fresa",
    item_d_soda_desc: "",
    item_d_juice_orange_desc: "", item_d_juice_lime_desc: "", item_d_juice_pineapple_desc: "",
    item_d_juice_watermelon_desc: "", item_d_juice_soursop_desc: "", item_d_juice_cantaloupe_desc: "",
    item_d_shake_papaya_desc: "", item_d_shake_soursop_desc: "", item_d_shake_cantaloupe_desc: "",
    item_d_shake_oreo_desc: "", item_d_shake_strawberry_desc: "",

    item_w_chicken_10_name: "Pollo y Queso Crema — paquete de 10",
    item_w_chicken_20_name: "Pollo y Queso Crema — paquete de 20",
    item_w_chicken_50_name: "Pollo y Queso Crema — paquete de 50",
    item_w_spinach_10_name: "Espinaca y Queso Crema — paquete de 10",
    item_w_spinach_20_name: "Espinaca y Queso Crema — paquete de 20",
    item_w_spinach_50_name: "Espinaca y Queso Crema — paquete de 50",
    item_w_shrimp_10_name: "Camarón y Queso Crema — paquete de 10",
    item_w_shrimp_20_name: "Camarón y Queso Crema — paquete de 20",
    item_w_shrimp_50_name: "Camarón y Queso Crema — paquete de 50",
    item_w_bacon_10_name: "Tocino y Queso Crema — paquete de 10",
    item_w_bacon_20_name: "Tocino y Queso Crema — paquete de 20",
    item_w_bacon_50_name: "Tocino y Queso Crema — paquete de 50",
    item_w_buffalo_10_name: "Búfalo y Queso Crema — paquete de 10",
    item_w_buffalo_20_name: "Búfalo y Queso Crema — paquete de 20",
    item_w_buffalo_50_name: "Búfalo y Queso Crema — paquete de 50",
    item_w_italian_10_name: "Salchicha Italiana y Queso Crema — paquete de 10",
    item_w_italian_20_name: "Salchicha Italiana y Queso Crema — paquete de 20",
    item_w_italian_50_name: "Salchicha Italiana y Queso Crema — paquete de 50",
    item_w_lemonchicken_10_name: "Pollo al Limón y Queso Crema — paquete de 10",
    item_w_lemonchicken_20_name: "Pollo al Limón y Queso Crema — paquete de 20",
    item_w_lemonchicken_50_name: "Pollo al Limón y Queso Crema — paquete de 50",
    item_w_chicken_10_desc: "Congelado, listo para freír.", item_w_chicken_20_desc: "Congelado, listo para freír.", item_w_chicken_50_desc: "Congelado, listo para freír.",
    item_w_spinach_10_desc: "Congelado, listo para freír.", item_w_spinach_20_desc: "Congelado, listo para freír.", item_w_spinach_50_desc: "Congelado, listo para freír.",
    item_w_shrimp_10_desc: "Congelado, listo para freír.", item_w_shrimp_20_desc: "Congelado, listo para freír.", item_w_shrimp_50_desc: "Congelado, listo para freír.",
    item_w_bacon_10_desc: "Congelado, listo para freír.", item_w_bacon_20_desc: "Congelado, listo para freír.", item_w_bacon_50_desc: "Congelado, listo para freír.",
    item_w_buffalo_10_desc: "Congelado, listo para freír.", item_w_buffalo_20_desc: "Congelado, listo para freír.", item_w_buffalo_50_desc: "Congelado, listo para freír.",
    item_w_italian_10_desc: "Congelado, listo para freír.", item_w_italian_20_desc: "Congelado, listo para freír.", item_w_italian_50_desc: "Congelado, listo para freír.",
    item_w_lemonchicken_10_desc: "Congelado, listo para freír.", item_w_lemonchicken_20_desc: "Congelado, listo para freír.", item_w_lemonchicken_50_desc: "Congelado, listo para freír.",

    about_title: "Sobre Nosotros — Lita's Jalapeño Poppers",
    about_desc: "Diez años de Lita's Jalapeño Poppers en Independence Village, Belice — nuestra historia.",
    about_page_eyebrow: "Nuestra historia",
    about_page_h1: "De una bandeja de poppers a un menú completo.",
    about_block1_h2: "Cómo comenzó",
    about_block1_p: "Lita comenzó vendiendo jalapeños rellenos por Independence Village — una receta sencilla, preparada fresca, vendida a mano. La voz se corrió rápido, y lo que empezó como un negocio extra se convirtió en un negocio que toda la aldea conocía por nombre.",
    about_block1_caption: "Una bienvenida cálida, siempre",
    about_block2_h2: "El menú fue creciendo",
    about_block2_p: "A medida que más personas pedían algo más que poppers, el menú fue creciendo con ellos — hamburguesas, alitas, quesadillas, jugos frescos y batidos hechos a mano se sumaron a la lista, todos preparados igual que desde el primer día: frescos y a mano. Hoy Lita's también surte poppers congelados al por mayor, por paquete.",
    about_block2_caption: "Un poco de todo",
    about_story_h2: "Seguimos siendo locales y familiares.",
    about_story_p: "Independence Village ha sido el hogar de Lita's Jalapeño Poppers durante una década. Cada pedido — ya sea una bandeja de poppers para una reunión familiar o un paquete al por mayor para reventa — se prepara con el mismo cuidado que la primera tanda.",
    about_story_cta: "Ver el menú",

    contact_title: "Contacto — Lita's Jalapeño Poppers",
    contact_desc: "Encuentra Lita's Jalapeño Poppers en Independence Village, Belice — horario, ubicación y cómo contactarnos.",
    contact_page_eyebrow: "Encuéntranos",
    contact_page_h1: "Visítanos o escríbenos",
    label_address: "Dirección",
    label_phone: "Teléfono",
    label_whatsapp: "WhatsApp (pedidos)",
    label_whatsapp_wholesale: "WhatsApp (mayoreo)",
    whatsapp_chat_text: "Escríbenos",
    label_hours: "Horario",
    hours_mon: "Lunes", hours_tue: "Martes", hours_wed: "Miércoles", hours_thu: "Jueves",
    hours_fri: "Viernes", hours_sat: "Sábado", hours_sun: "Domingo",
    label_facebook: "Facebook",
    label_email: "Correo electrónico",
    map_note: "Para actualizar el mapa, busca la dirección de Lita's en Google Maps, elige Compartir → Insertar un mapa, y pega el enlace src en el iframe de contact.html.",
    contact_form_heading: "Envíanos un mensaje",
    contact_form_p: "¿Prefieres escribirlo? Esto también se envía directo a nuestro WhatsApp.",
    label_name: "Nombre",
    label_phone_optional: "Teléfono (opcional)",
    label_message: "Mensaje",
    message_placeholder: "¿En qué podemos ayudarte?",
    contact_submit: "Enviar por WhatsApp",

    order_greeting: "¡Hola Lita's Jalapeño Poppers! Quisiera hacer un pedido:",
    order_total_label: "Total",
    order_name_label: "Nombre",
    order_fulfillment_label: "Entrega",
    order_notes_label: "Notas",
    contact_msg_greeting: "Hola Lita's Jalapeño Poppers, mi nombre es",
    contact_msg_phone_label: "Mi teléfono",
  },
};

/* ---------- Core helpers ---------- */
function getLang() {
  return localStorage.getItem(LANG_KEY) || null;
}
function currentLang() {
  return getLang() || "en";
}
function t(key) {
  const lang = currentLang();
  if (STRINGS[lang] && STRINGS[lang][key] !== undefined && STRINGS[lang][key] !== "") return STRINGS[lang][key];
  if (STRINGS.en[key] !== undefined) return STRINGS.en[key];
  return "";
}

function applyLang(lang) {
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    el.innerHTML = t(el.getAttribute("data-i18n-html"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria-label")));
  });

  const titleKey = document.documentElement.getAttribute("data-i18n-page-title");
  if (titleKey) document.title = t(titleKey);
  const metaDesc = document.querySelector('meta[name="description"][data-i18n-meta]');
  if (metaDesc) metaDesc.setAttribute("content", t(metaDesc.getAttribute("data-i18n-meta")));

  document.querySelectorAll("[data-lang-option]").forEach((btn) => {
    const active = btn.getAttribute("data-lang-option") === lang;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });

  // Menu page: re-render items, tabs and cart drawer so text updates
  if (typeof renderFilterTabs === "function") renderFilterTabs();
  if (typeof renderMenu === "function") {
    const activeTab = document.querySelector("[data-filter-tabs] button.active");
    renderMenu(activeTab ? activeTab.dataset.filter : "all");
  }
  if (typeof renderCartDrawer === "function") renderCartDrawer();
}

function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
  applyLang(lang);
}

function initLanguage() {
  const saved = getLang();
  const modal = document.querySelector("[data-lang-modal]");

  if (saved) {
    applyLang(saved);
  } else {
    applyLang("en"); // sensible default showing under the modal
    if (modal) modal.classList.add("open");
  }

  document.querySelectorAll("[data-lang-choose]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setLang(btn.getAttribute("data-lang-choose"));
      if (modal) modal.classList.remove("open");
    });
  });
  document.querySelectorAll("[data-lang-option]").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.getAttribute("data-lang-option")));
  });
}

document.addEventListener("DOMContentLoaded", initLanguage);
