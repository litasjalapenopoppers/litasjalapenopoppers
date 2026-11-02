/* =========================================================
   Lita's Jalapeño Poppers — staff app: English / Español
   The staff screens are written in English. When Spanish is
   chosen, this file translates everything that appears on the
   page (including text the app adds later, like alerts and
   order cards) by looking each piece of text up in the lists
   below. Anything not in the lists simply stays in English.

   To fix a translation: find the English text below and change
   the Spanish next to it.
   Loaded before staff.js (needs STRINGS from ../i18n.js).
   ========================================================= */
(function () {
  "use strict";

  const KEY = "lita_staff_lang";

  function stLang() {
    let v = null;
    try { v = localStorage.getItem(KEY) || localStorage.getItem("lita_lang"); } catch (e) { /* ignore */ }
    return v === "es" ? "es" : "en";
  }
  function stSetLang(l) {
    try { localStorage.setItem(KEY, l === "es" ? "es" : "en"); } catch (e) { /* ignore */ }
  }
  window.stLang = stLang;
  window.stSetLang = stSetLang;
  window.ST_LOCALE = stLang() === "es" ? "es" : undefined;   // for dates and times

  /* ---------- exact translations ---------- */
  const SOUND_HINT = " Turn the sound on once per screen to hear a beep for new orders.";
  const REST_HINT = "Website orders wait here until you confirm or cancel them. Phone and walk-in orders are saved from the Take an order tab and appear in the history below. Confirming an order takes its items out of stock; cancelling does not.";
  const WHOLE_HINT = "Orders from the Wholesale page wait here until you confirm or cancel them. Confirming an order takes its items out of stock; cancelling does not.";

  const ES = {
    // header, sign in, general
    "Staff": "Personal",
    "← Back to website": "← Volver al sitio web",
    "Full staff view": "Vista completa del personal",
    "Sign out": "Cerrar sesión",
    "Loading…": "Cargando…",
    "The database isn't connected yet": "La base de datos aún no está conectada",
    "Staff sign in": "Inicio de sesión del personal",
    "Username": "Usuario",
    "Password": "Contraseña",
    "Sign in": "Iniciar sesión",
    "Forgot your username or password? Ask the owner.": "¿Olvidaste tu usuario o contraseña? Pídeselo al dueño.",
    "No staff access": "Sin acceso del personal",
    "You're signed in, but this account hasn't been given staff access. Ask the owner to add you.": "Iniciaste sesión, pero esta cuenta no tiene acceso del personal. Pídele al dueño que te agregue.",
    "Something went wrong": "Algo salió mal",
    "Try again": "Intentar de nuevo",
    "Enter your username and password.": "Escribe tu usuario y contraseña.",
    "Usernames use only letters, numbers, dots, dashes and underscores.": "Los usuarios solo usan letras, números, puntos, guiones y guiones bajos.",
    "Wrong username or password.": "Usuario o contraseña incorrectos.",
    "Too many tries. Wait a minute and try again.": "Demasiados intentos. Espera un minuto e intenta de nuevo.",
    "Couldn't sign in.": "No se pudo iniciar sesión.",
    "Couldn't reach the database.": "No se pudo conectar con la base de datos.",
    "Couldn't load the staff screen.": "No se pudo cargar la pantalla del personal.",
    "Couldn't load the database library. Check the internet connection and reload this page.": "No se pudo cargar la biblioteca de la base de datos. Revisa la conexión a internet y recarga la página.",
    "Your session ended. Please sign in again.": "Tu sesión terminó. Inicia sesión de nuevo.",
    "Something went wrong. Please try again.": "Algo salió mal. Intenta de nuevo.",
    "Owner": "Dueño",
    "Refresh": "Actualizar",
    "Optional": "Opcional",
    "Note": "Nota",
    "Total": "Total",
    "Other": "Otro",

    // tabs
    "Restaurant orders": "Pedidos del restaurante",
    "Wholesale orders": "Pedidos de mayoreo",
    "Take an order": "Tomar un pedido",
    "Stock": "Inventario",
    "Sales": "Ventas",
    "Team": "Equipo",

    // take an order
    "For phone and walk-in customers. Saving takes the items out of stock right away.": "Para clientes por teléfono y en el local. Al guardar, los artículos salen del inventario de inmediato.",
    "This order": "Este pedido",
    "Order type": "Tipo de pedido",
    "Walk-in": "En el local",
    "Phone": "Teléfono",
    "Website": "Sitio web",
    "Wholesale": "Mayoreo",
    "Customer name": "Nombre del cliente",
    "(optional)": "(opcional)",
    "(required for phone orders)": "(obligatorio para pedidos por teléfono)",
    "Save order": "Guardar pedido",
    "Save anyway": "Guardar de todos modos",
    "Clear": "Limpiar",
    "Remove": "Quitar",
    "Add": "Agregar",
    "Nothing added yet. Tap Add on a menu item.": "Aún no hay nada. Toca Agregar en un artículo del menú.",
    "Enter the customer's name for a phone order.": "Escribe el nombre del cliente para un pedido por teléfono.",
    "Stock changed — check the warning, then save again.": "El inventario cambió: revisa el aviso y guarda de nuevo.",
    "Order saved — stock updated.": "Pedido guardado: inventario actualizado.",

    // periods, dates
    "Period": "Período",
    "Today": "Hoy",
    "Yesterday": "Ayer",
    "Last 7 days": "Últimos 7 días",
    "Last 30 days": "Últimos 30 días",
    "Custom range": "Rango personalizado",
    "From": "Desde",
    "To": "Hasta",
    "Pick a From date and a To date.": "Elige una fecha Desde y una fecha Hasta.",
    "The From date must be on or before the To date.": "La fecha Desde debe ser igual o anterior a la fecha Hasta.",
    "Please pick a range of one year or less.": "Elige un rango de un año o menos.",
    "History period": "Período del historial",
    "History from date": "Historial desde",
    "History to date": "Historial hasta",

    // sales
    "Download CSV": "Descargar CSV",
    "Total sales": "Ventas totales",
    "Orders": "Pedidos",
    "Average order": "Pedido promedio",
    "Food wasted (menu price)": "Comida desperdiciada (precio de menú)",
    "By order type": "Por tipo de pedido",
    "Type": "Tipo",
    "By item (best sellers first)": "Por artículo (más vendidos primero)",
    "Item": "Artículo",
    "Sold": "Vendidos",
    "All": "Todos",
    "All items": "Todos los artículos",
    "By day": "Por día",
    "Day": "Día",
    "No confirmed orders in this period yet.": "Aún no hay pedidos confirmados en este período.",

    // stock
    "Today's Stock": "Inventario de hoy",
    "Recent changes": "Cambios recientes",
    "Waste report": "Reporte de desperdicio",
    "View only — ask the owner to change counts.": "Solo lectura: pídele al dueño que cambie las cantidades.",
    "Food removed from stock because it was spoiled, damaged or eaten by staff. These are not sales. The value uses today's menu prices, not what the food cost to make.": "Comida sacada del inventario por estar echada a perder, dañada o comida por el personal. No son ventas. El valor usa los precios del menú de hoy, no lo que costó hacerla.",
    "Value at menu price": "Valor a precio de menú",
    "Nothing has been removed in this period.": "No se quitó nada en este período.",
    "No changes yet.": "Aún no hay cambios.",
    "When": "Cuándo",
    "Change": "Cambio",
    "Now": "Ahora",
    "Reason": "Motivo",
    "By": "Por",
    "Count": "Cantidad",
    "Set": "Fijar",
    "Settings": "Ajustes",
    "Mode": "Modo",
    "Warn at or below": "Avisar con esta cantidad o menos",
    "Save settings": "Guardar ajustes",
    "Amount": "Cantidad",
    "e.g. 5": "p. ej. 5",
    "Remove stock (spoiled, damaged, staff meal…)": "Quitar inventario (echado a perder, dañado, comida del personal…)",
    "Daily batch": "Lote diario",
    "Carry-over": "Se arrastra al día siguiente",
    "Not tracked": "Sin control",
    "Not set": "Sin definir",
    "Sold out": "Agotado",
    "Morning count": "Conteo de la mañana",
    "Added stock": "Inventario agregado",
    "Correction": "Corrección",
    "Settings changed": "Ajustes cambiados",
    "Order confirmed": "Pedido confirmado",
    "Walk-in sale": "Venta en el local",
    "Phone order": "Pedido por teléfono",
    "Order cancelled": "Pedido cancelado",
    "Spoiled": "Echado a perder",
    "Damaged or dropped": "Dañado o caído",
    "Staff meal": "Comida del personal",
    "Other waste": "Otro desperdicio",
    "No items are being tracked yet. Open an item's Settings to turn tracking on.": "Aún no se controla ningún artículo. Abre los Ajustes de un artículo para activar el control.",
    "No items are being tracked yet.": "Aún no se controla ningún artículo.",
    "Enter a count for each item to turn on its limit.": "Escribe una cantidad para cada artículo para activar su límite.",
    "Enter a whole number, 0 or more.": "Escribe un número entero, 0 o más.",
    "Enter how many to add (1 or more).": "Escribe cuántos agregar (1 o más).",
    "The low-stock level must be a whole number, 0 or more.": "El nivel de inventario bajo debe ser un número entero, 0 o más.",
    "Enter how many to remove (1 or more).": "Escribe cuántos quitar (1 o más).",
    "Set a count for this item first.": "Primero fija una cantidad para este artículo.",

    // orders
    [REST_HINT + SOUND_HINT]: "Los pedidos del sitio web esperan aquí hasta que los confirmes o canceles. Los pedidos por teléfono y en el local se guardan desde la pestaña Tomar un pedido y aparecen en el historial de abajo. Confirmar un pedido saca sus artículos del inventario; cancelar no." + " Activa el sonido una vez en cada pantalla para oír un pitido con los pedidos nuevos.",
    [WHOLE_HINT + SOUND_HINT]: "Los pedidos de la página de Mayoreo esperan aquí hasta que los confirmes o canceles. Confirmar un pedido saca sus artículos del inventario; cancelar no." + " Activa el sonido una vez en cada pantalla para oír un pitido con los pedidos nuevos.",
    "Sound: on": "Sonido: sí",
    "Sound: off": "Sonido: no",
    "Open as TV screen": "Abrir como pantalla de TV",
    "History": "Historial",
    "Show": "Mostrar",
    "Show orders": "Mostrar pedidos",
    "All handled": "Todos los atendidos",
    "Confirmed": "Confirmado",
    "Cancelled": "Cancelado",
    "Voided": "Anulado",
    "Confirm": "Confirmar",
    "Confirm anyway": "Confirmar de todos modos",
    "Cancel…": "Cancelar…",
    "Cancel order": "Cancelar pedido",
    "Keep order": "Mantener pedido",
    "Void…": "Anular…",
    "Void order and put stock back": "Anular pedido y devolver al inventario",
    "Why is this order being cancelled?": "¿Por qué se cancela este pedido?",
    "Note (optional)": "Nota (opcional)",
    "Cancel note": "Nota de cancelación",
    "Why? (optional)": "¿Por qué? (opcional)",
    "Void note": "Nota de anulación",
    "Out of stock": "Sin existencias",
    "Customer changed their mind": "El cliente cambió de opinión",
    "Customer didn't reply": "El cliente no respondió",
    "Voided (entered by mistake)": "Anulado (ingresado por error)",
    "(no name)": "(sin nombre)",
    "just now": "justo ahora",
    "No orders match this filter.": "Ningún pedido coincide con este filtro.",
    "No handled orders in this period.": "No hay pedidos atendidos en este período.",
    "Not enough stock for part of this order. Check below.": "No hay suficiente inventario para parte de este pedido. Revisa abajo.",
    "Order confirmed — stock updated.": "Pedido confirmado: inventario actualizado.",
    "Order cancelled.": "Pedido cancelado.",
    "Order voided — stock put back.": "Pedido anulado: inventario devuelto.",
    "N new orders!": "",

    // team
    "Add a person": "Agregar a una persona",
    "Name": "Nombre",
    "Role": "Rol",
    "Staff member": "Personal",
    "Generate": "Generar",
    "Add person": "Agregar persona",
    "Switch off": "Desactivar",
    "Switch on": "Activar",
    "Active": "Activo",
    "Switched off": "Desactivado",
    "Last sign-in": "Último acceso",
    "Status": "Estado",
    "Actions": "Acciones",
    "Never": "Nunca",
    "Reset password": "Restablecer contraseña",
    "New password": "Nueva contraseña",
    "Save password": "Guardar contraseña",
    "Cancel": "Cancelar",
    "Make owner": "Hacer dueño",
    "Make staff": "Hacer personal",
    "(you)": "(tú)",
    "Give the person their username and this password. They can't see it again here, so write it down now.": "Dale a la persona su usuario y esta contraseña. No se puede volver a ver aquí, así que anótala ahora.",
    "Creating or changing accounts is for the owner. Switched-off people can no longer sign in, but their history is kept.": "Solo el dueño crea o cambia cuentas. Las personas desactivadas ya no pueden iniciar sesión, pero su historial se conserva.",
    "Username (letters and numbers, no spaces)": "Usuario (letras y números, sin espacios)",
    "At least 8 characters": "Al menos 8 caracteres",
    "Enter a username.": "Escribe un usuario.",
    "Enter the person's name.": "Escribe el nombre de la persona.",
    "The password must be at least 8 characters.": "La contraseña debe tener al menos 8 caracteres.",
    "Person added.": "Persona agregada.",
    "Password changed. Give the person the new password.": "Contraseña cambiada. Dale la nueva contraseña a la persona.",
    "Saved.": "Guardado.",
    "No one yet.": "Aún no hay nadie.",

    // costs & profit
    "Costs": "Costos",
    "What each item costs to make": "Lo que cuesta hacer cada artículo",
    "Only the owner can see these. Enter what it costs you to make one of each item (ingredients, packaging). Leave a box empty if you don't know yet. The Sales screen uses these numbers to work out profit.": "Solo el dueño puede verlos. Escribe lo que te cuesta hacer una unidad de cada artículo (ingredientes, empaque). Deja la casilla vacía si aún no lo sabes. La pantalla de Ventas usa estos números para calcular la ganancia.",
    "Menu price": "Precio de menú",
    "Cost to make": "Costo de hacerlo",
    "Profit each": "Ganancia por unidad",
    "Save costs": "Guardar costos",
    "Costs saved.": "Costos guardados.",
    "Costs must be numbers like 1.25 (0 or more).": "Los costos deben ser números como 1.25 (0 o más).",
    "Cost of food sold": "Costo de la comida vendida",
    "Profit": "Ganancia",
    "Margin": "Margen",
    "Cost": "Costo",
    "Profit (menu price − cost)": "Ganancia (precio de menú − costo)",
    "Sales, cost of food and profit. Voided and cancelled orders are not counted. Profit uses the costs you set on the Stock tab (Costs). Items with no cost set are not included in the profit numbers.": "Ventas, costo de la comida y ganancia. Los pedidos anulados y cancelados no se cuentan. La ganancia usa los costos que pusiste en la pestaña Inventario (Costos). Los artículos sin costo no se incluyen en la ganancia.",
    "Confirmed orders only (website, wholesale, phone and walk-in). Voided and cancelled orders are not counted.": "Solo pedidos confirmados (sitio web, mayoreo, teléfono y en el local). Los pedidos anulados y cancelados no se cuentan.",
    "Profit is worked out with the costs you have today, so changing a cost also changes past profit. It only includes items that have a cost.": "La ganancia se calcula con los costos de hoy, así que cambiar un costo también cambia la ganancia pasada. Solo incluye artículos que tienen costo.",
    "Waste at cost": "Desperdicio a costo",
    "Add what each item costs to make (Stock tab → Costs) to see profit here.": "Agrega lo que cuesta hacer cada artículo (pestaña Inventario → Costos) para ver la ganancia aquí.",
    "The costs table isn't set up yet. Run supabase-costs-setup.sql in Supabase, then reload.": "La tabla de costos aún no está lista. Ejecuta supabase-costs-setup.sql en Supabase y recarga.",
    "—": "—",

    // insights
    "Compared with the period before": "Comparado con el período anterior",
    "vs. the period before": "vs. el período anterior",
    "No sales in the period before.": "No hubo ventas en el período anterior.",
    "Busiest hours": "Horas más ocupadas",
    "Busiest days of the week": "Días más ocupados de la semana",
    "Best sellers by profit": "Más vendidos por ganancia",
    "Hour": "Hora",
    "Orders placed": "Pedidos hechos",
    "Weekday": "Día de la semana",
    "Not enough orders yet to show a pattern.": "Aún no hay suficientes pedidos para mostrar un patrón.",
    "Best day": "Mejor día",
    "Busiest hour": "Hora más ocupada",
    "Top seller": "Más vendido",
    "Sunday": "Domingo", "Monday": "Lunes", "Tuesday": "Martes", "Wednesday": "Miércoles",
    "Thursday": "Jueves", "Friday": "Viernes", "Saturday": "Sábado",
    "Sun": "Dom", "Mon": "Lun", "Tue": "Mar", "Wed": "Mié", "Thu": "Jue", "Fri": "Vie", "Sat": "Sáb",
  };
  delete ES["N new orders!"];

  // Menu item names, categories and options (English → Spanish), from the website's own lists.
  try {
    const en = STRINGS.en, es = STRINGS.es || {};
    Object.keys(en).forEach((k) => {
      if (/^(item_.+_name|cat_.+|opt_.+)$/.test(k) && es[k] && typeof en[k] === "string" && en[k] !== es[k] && ES[en[k]] === undefined) ES[en[k]] = es[k];
    });
  } catch (e) { /* the lists above are optional */ }

  /* ---------- translations with numbers or names inside ---------- */
  const lower = (s) => s.charAt(0).toLowerCase() + s.slice(1);
  const upper = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const tr = (s) => { const r = lookup(s); return r === undefined ? s : r; };
  const trLower = (s) => lower(tr(upper(s)));
  const money = (s) => s;

  function shortageList(s) {
    return s.replace(/(^|; )(.+?): ordered (\d+), only (\d+) in stock/g,
      (m, a, name, need, have) => a + name + ": pediste " + need + ", solo hay " + have + " en inventario");
  }

  const PATTERNS = [
    [/^Updated (.+)$/, (m) => "Actualizado " + m[1]],
    [/^Low — (\d+) left$/, (m) => "Bajo — quedan " + m[1]],
    [/^(\d+) left$/, (m) => "quedan " + m[1]],
    [/^(\d+) sold out$/, (m) => m[1] + " agotados"],
    [/^(\d+) low$/, (m) => m[1] + " bajos"],
    [/^(\d+) not set$/, (m) => m[1] + " sin definir"],
    [/^(.+) · (Owner|Staff)$/, (m) => m[1] + " · " + (m[2] === "Owner" ? "Dueño" : "Personal")],
    [/^(.+): set to (\d+)$/, (m) => m[1] + ": fijado en " + m[2]],
    [/^(.+): added (\d+)$/, (m) => m[1] + ": se agregaron " + m[2]],
    [/^(.+): settings saved$/, (m) => m[1] + ": ajustes guardados"],
    [/^(.+): removed (\d+) \((.+?)\)(?:, (\d+) left)?$/, (m) => m[1] + ": se quitaron " + m[2] + " (" + trLower(m[3]) + ")" + (m[4] ? ", quedan " + m[4] : "")],
    [/^Only (\d+) in stock, so (\d+) can't be removed\.$/, (m) => "Solo hay " + m[1] + " en inventario, así que no se pueden quitar " + m[2] + "."],
    [/^(Count|Mode|Low-stock level|Amount to remove|Reason for removing|Note for removing) for (.+)$/, (m) => ({
      "Count": "Cantidad de", "Mode": "Modo de", "Low-stock level": "Nivel bajo de",
      "Amount to remove": "Cantidad a quitar de", "Reason for removing": "Motivo para quitar", "Note for removing": "Nota al quitar"
    }[m[1]]) + " " + m[2]],
    [/^One (fewer|more) (.+)$/, (m) => (m[1] === "fewer" ? "Uno menos de " : "Uno más de ") + m[2]],
    [/^(.+?) for (.+)$/, (m) => { const r = lookup(m[1]); return r === undefined ? undefined : r + " de " + m[2]; }],
    [/^Notes: (.*)$/, (m) => "Notas: " + m[1]],
    [/^Note: (.*)$/, (m) => "Nota: " + m[1]],
    [/^(\d+) min ago( — waiting a while!)?$/, (m) => "hace " + m[1] + " min" + (m[2] ? " — ¡esperando hace rato!" : "")],
    [/^(\d+) hrs? (\d+) min ago( — waiting a while!)?$/, (m) => "hace " + m[1] + " h " + m[2] + " min" + (m[3] ? " — ¡esperando hace rato!" : "")],
    [/^just now( — waiting a while!)?$/, (m) => "justo ahora" + (m[1] ? " — ¡esperando hace rato!" : "")],
    [/^No (restaurant|wholesale) orders waiting\. 🎉$/, (m) => "No hay pedidos de " + (m[1] === "restaurant" ? "restaurante" : "mayoreo") + " esperando. 🎉"],
    [/^New (restaurant|wholesale) order!$/, (m) => "¡Nuevo pedido de " + (m[1] === "restaurant" ? "restaurante" : "mayoreo") + "!"],
    [/^(\d+) new (restaurant|wholesale) orders!$/, (m) => "¡" + m[1] + " pedidos nuevos de " + (m[2] === "restaurant" ? "restaurante" : "mayoreo") + "!"],
    [/^(\d+) new orders!$/, (m) => "¡" + m[1] + " pedidos nuevos!"],
    [/^\((\d+)\) NEW ORDER — Staff$/, (m) => "(" + m[1] + ") PEDIDO NUEVO — Personal"],
    [/^(Restaurant|Wholesale) orders — Staff$/, (m) => "Pedidos de " + (m[1] === "Restaurant" ? "restaurante" : "mayoreo") + " — Personal"],
    [/^Staff — Lita's Jalapeño Poppers$/, () => "Personal — Lita's Jalapeño Poppers"],
    [/^Opens a full-screen view that shows only (restaurant|wholesale) orders\. Good for a TV\.$/, (m) =>
      "Abre una vista de pantalla completa que muestra solo los pedidos de " + (m[1] === "restaurant" ? "restaurante" : "mayoreo") + ". Buena para una TV."],
    [/^Not enough stock — (.*)\. Confirming anyway takes what is left \(stock never goes below 0\)\.$/, (m) =>
      "No hay suficiente inventario — " + shortageList(m[1]) + ". Confirmar de todos modos toma lo que queda (el inventario nunca baja de 0)."],
    [/^Not enough stock — (.*)\. Saving anyway takes what is left \(never below 0\)\.$/, (m) =>
      "No hay suficiente inventario — " + shortageList(m[1]) + ". Guardar de todos modos toma lo que queda (nunca menos de 0)."],
    [/^(Out of stock|Customer changed their mind|Customer didn't reply|Other) — (.*)$/, (m) => tr(m[1]) + " — " + m[2]],
    [/^(\d+) handled · (\d+) confirmed \((.+?)\) · (\d+) cancelled · (\d+) voided$/, (m) =>
      m[1] + " atendidos · " + m[2] + " confirmados (" + m[3] + ") · " + m[4] + " cancelados · " + m[5] + " anulados"],
    [/^Showing the latest (\d+) of (\d+)\. Narrow the dates to see the rest\.$/, (m) =>
      "Mostrando los últimos " + m[1] + " de " + m[2] + ". Acota las fechas para ver el resto."],
    [/^(\d+) orders? \((.+)\)$/, (m) => m[1] + " pedidos (" + m[2] + ")"],
    [/^The username "(.+)" is already taken$/, (m) => "El usuario \"" + m[1] + "\" ya está en uso"],
    [/^(.+) was added\.$/, (m) => m[1] + " fue agregado."],
    [/^Password for (.+)$/, (m) => "Contraseña de " + m[1]],
    [/^Reset password for (.+)$/, (m) => "Restablecer contraseña de " + m[1]],
    [/^Username: (.+)$/, (m) => "Usuario: " + m[1]],
    [/^Password: (.+)$/, (m) => "Contraseña: " + m[1]],
    [/^(\d+) items? with no cost set (?:is|are) left out of the profit numbers\.$/, (m) => m[1] + " artículos sin costo no se incluyen en la ganancia."],
    [/^Up (\d+(?:\.\d+)?)% vs\. the period before$/, (m) => "Sube " + m[1] + "% vs. el período anterior"],
    [/^Down (\d+(?:\.\d+)?)% vs\. the period before$/, (m) => "Baja " + m[1] + "% vs. el período anterior"],
    [/^No change vs\. the period before$/, () => "Sin cambio vs. el período anterior"],
    [/^Before: (.+?) \((\d+) orders?\)$/, (m) => "Antes: " + m[1] + " (" + m[2] + " pedidos)"],
    [/^Only the owner can do this$/, () => "Solo el dueño puede hacer esto"],
    [/^Usernames use only letters, numbers, dots, dashes and underscores \(2 to 30 characters\)$/, () => "Los usuarios solo usan letras, números, puntos, guiones y guiones bajos (2 a 30 caracteres)"],
    [/^The password must be at least 8 characters$/, () => "La contraseña debe tener al menos 8 caracteres"],
    [/^You can't switch off your own account$/, () => "No puedes desactivar tu propia cuenta"],
    [/^There must always be at least one active owner$/, () => "Siempre debe haber al menos un dueño activo"],
    [/^That person was not found$/, () => "No se encontró a esa persona"],
    [/^This order was already (\w+) — refresh the screen$/, (m) => "Este pedido ya estaba " + ({ confirmed: "confirmado", cancelled: "cancelado", pending: "pendiente" }[m[1]] || m[1]) + " — actualiza la pantalla"],
  ];

  function lookup(s) {
    if (!s) return undefined;
    const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/);
    const core = m[2];
    if (!core) return undefined;
    let r = Object.prototype.hasOwnProperty.call(ES, core) ? ES[core] : undefined;
    if (r === undefined) {
      for (let i = 0; i < PATTERNS.length; i++) {
        const mm = core.match(PATTERNS[i][0]);
        if (mm) { r = PATTERNS[i][1](mm); if (r !== undefined) break; }
      }
    }
    return r === undefined ? undefined : m[1] + r + m[3];
  }

  // t("English text") — for the few places in staff.js that need an explicit translation.
  window.t = function (s) { return stLang() === "es" ? tr(s) : s; };

  /* ---------- apply to the page ---------- */
  const ATTRS = ["placeholder", "aria-label", "title"];
  const SKIP = /^(SCRIPT|STYLE|TEXTAREA|CODE)$/;

  function fixText(node) {
    const v = node.nodeValue;
    const r = lookup(v);
    if (r !== undefined && r !== v) node.nodeValue = r;
  }
  function fixAttrs(el) {
    ATTRS.forEach((a) => {
      if (!el.hasAttribute || !el.hasAttribute(a)) return;
      const v = el.getAttribute(a), r = lookup(v);
      if (r !== undefined && r !== v) el.setAttribute(a, r);
    });
  }
  function fixTree(root) {
    if (!root) return;
    if (root.nodeType === 3) { fixText(root); return; }
    if (root.nodeType !== 1 || SKIP.test(root.tagName)) return;
    fixAttrs(root);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) { if (!SKIP.test(n.parentNode.tagName)) fixText(n); }
      else if (!SKIP.test(n.tagName)) fixAttrs(n);
    }
  }

  function start() {
    const lang = stLang();
    document.documentElement.lang = lang;
    // The language buttons in the header.
    document.querySelectorAll("[data-st-lang]").forEach((b) => {
      const on = b.getAttribute("data-st-lang") === lang;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.addEventListener("click", () => {
        if (b.getAttribute("data-st-lang") === lang) return;
        stSetLang(b.getAttribute("data-st-lang"));
        window.location.reload();           // simplest way to rebuild every screen in the new language
      });
    });
    if (lang !== "es") return;

    document.title = tr(document.title);
    fixTree(document.body);
    new MutationObserver((records) => {
      records.forEach((rec) => {
        if (rec.type === "childList") rec.addedNodes.forEach(fixTree);
        else if (rec.type === "characterData") fixText(rec.target);
        else if (rec.type === "attributes") fixAttrs(rec.target);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
