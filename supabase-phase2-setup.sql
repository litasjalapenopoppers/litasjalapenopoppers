-- =====================================================================
-- Lita's Jalapeño Poppers — Phase 2: live stock on the public website,
-- and wholesale orders.
-- Run this in Supabase → SQL Editor, AFTER supabase-setup.sql and
-- supabase-inventory-setup.sql. Safe to run more than once.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Wholesale orders
--    The Wholesale page saves its orders with source = 'wholesale'.
--    The public website may still only create PENDING orders — it can
--    never mark one confirmed.
-- ---------------------------------------------------------------------
alter table orders drop constraint if exists orders_source_check;
alter table orders add constraint orders_source_check
  check (source in ('online', 'wholesale', 'phone', 'walkin'));

drop policy if exists "Public can insert pending online orders" on orders;
drop policy if exists "Public can insert pending web orders" on orders;
create policy "Public can insert pending web orders"
  on orders for insert
  to anon, authenticated
  with check (status = 'pending' and source in ('online', 'wholesale'));

-- ---------------------------------------------------------------------
-- 2. Live stock levels for the public site
--    Returns ONLY the items the owner is tracking and has entered a
--    count for. Items that are "Not tracked" or "Not set" are left out,
--    so the website shows no limit for them. Nothing else about the
--    inventory (who changed it, history, etc.) is exposed.
-- ---------------------------------------------------------------------
create or replace function get_public_stock()
returns table (item_id text, stock integer, low_threshold integer)
language sql stable security definer
set search_path = public
as $$
  select i.item_id, i.stock, i.low_threshold
    from inventory i
   where i.mode <> 'untracked' and i.stock is not null;
$$;

revoke execute on function get_public_stock() from public;
grant execute on function get_public_stock() to anon, authenticated;
