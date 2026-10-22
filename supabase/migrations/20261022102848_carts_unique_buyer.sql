-- `carts` had no uniqueness guarantee on buyer_id: two concurrent requests
-- (two tabs, a double-click, a flaky connection retry) could each find no
-- existing cart and insert a second one for the same buyer, after which
-- `.maybeSingle()` calls in the app would start erroring on "multiple rows
-- returned". The buyer-side code now also retries the select on a unique
-- violation (see buyer/src/lib/supabase/cart.js), so this constraint turns
-- the race into a handled, recoverable case instead of a broken cart.
alter table carts add constraint carts_buyer_id_key unique (buyer_id);
