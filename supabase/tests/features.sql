\set ON_ERROR_STOP 1
\set QUIET 1
-- Users
insert into auth.users (id,email,raw_user_meta_data) values
 ('00000000-0000-0000-0000-00000000000a','admin@t.l','{"role":"admin"}'),
 ('00000000-0000-0000-0000-00000000000b','buyer@t.l','{}'),
 ('00000000-0000-0000-0000-00000000000c','buyer2@t.l','{}'),
 ('00000000-0000-0000-0000-00000000000d','sourcing@t.l','{"role":"seller"}');
update profiles set role='admin' where id='00000000-0000-0000-0000-00000000000a';
update profiles set business_slug='trustlink-sourcing' where id='00000000-0000-0000-0000-00000000000d';
insert into products (id,seller_id,name,price,status,source_url,source_price_ngn) values
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000d','Tel',100000,'approved','https://x/1',240000);

\echo == 1. pricing
select ngn_to_xof(240000) as xof_240k_ngn, all_inclusive_price_xof(100000) as tout_compris_100k;

create or replace function pg_temp.as_user(u text) returns void language sql as $$
  select set_config('request.jwt.claim.sub', u, false), set_config('request.jwt.claim.role','authenticated',false); $$;

-- Buyer creates 2 orders in the same group (like the checkout)
insert into orders (id,buyer_id,group_id,total_amount) values
 ('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000b','30000000-0000-0000-0000-000000000001',1000),
 ('20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-00000000000b','30000000-0000-0000-0000-000000000001',2000),
 ('20000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-00000000000b',null,500);

\echo == 2. admin: paid, then inspection photo
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
set role authenticated;
update orders set status='paid';
insert into storage.objects (bucket_id,name,owner) values ('inspection-photos','orders/20000000-0000-0000-0000-000000000001/1.jpg','00000000-0000-0000-0000-00000000000a');
insert into order_inspections (order_id,photo_path,agent_name,inspected_by) values
 ('20000000-0000-0000-0000-000000000001','orders/20000000-0000-0000-0000-000000000001/1.jpg','Samuel','00000000-0000-0000-0000-00000000000a');
insert into order_inspections (order_id,photo_path,inspected_by) values
 ('20000000-0000-0000-0000-000000000001','orders/20000000-0000-0000-0000-000000000001/2.jpg','00000000-0000-0000-0000-00000000000a');
insert into order_inspections (order_id,photo_path,inspected_by,visible_to_buyer) values
 ('20000000-0000-0000-0000-000000000002','orders/x/internal.jpg','00000000-0000-0000-0000-00000000000a',false);
reset role;
select left(id::text,1)||right(id::text,1) o, status, inspected_at is not null as inspected from orders order by id;
select count(*) as notif_inspection from notifications where title like '%inspecté%';

\echo == 3. what the buyer / another buyer can see
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b'); set role authenticated;
select 'buyer' who, (select count(*) from order_inspections) inspections, (select count(*) from storage.objects where bucket_id='inspection-photos') fichiers, (select count(*) from order_tracking_events) events;
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c'); set role authenticated;
select 'buyer2' who, (select count(*) from order_inspections) inspections, (select count(*) from storage.objects where bucket_id='inspection-photos') fichiers, (select count(*) from order_tracking_events) events;
reset role;

\echo == 4. transit, delivery, history
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a'); set role authenticated;
update orders set status='in_transit' where id <> '20000000-0000-0000-0000-000000000003';
update orders set status='delivered' where id <> '20000000-0000-0000-0000-000000000003';
reset role;
select right(order_id::text,1) o, string_agg(step, ' > ' order by created_at, id) parcours from order_tracking_events group by order_id order by 1;
select right(id::text,1) o, status, delivered_at is not null livre from orders order by id;

\echo == 5. reminders
select send_delivery_reminders() as envoyes_t0;
update orders set delivered_at = now() - interval '30 hours' where status='delivered';
select send_delivery_reminders() as envoyes_30h;
select send_delivery_reminders() as envoyes_30h_bis;
update orders set delivered_at = now() - interval '50 hours' where status='delivered';
select send_delivery_reminders() as envoyes_50h;
select status from orders where id='20000000-0000-0000-0000-000000000001';
select title from notifications where title not like '%inspecté%' order by created_at;

\echo == 6. dispute window
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b'); set role authenticated;
do $$ begin perform open_order_dispute('20000000-0000-0000-0000-000000000001','broken'); raise notice 'BUYER >48h: accepted (WRONG)'; exception when others then raise notice 'BUYER >48h: refused -> %', sqlerrm; end $$;
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a'); set role authenticated;
update orders set status='in_transit' where id='20000000-0000-0000-0000-000000000003';
insert into disputes (order_id,buyer_id,reason) values ('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000b','late video review');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b'); set role authenticated;
select open_order_dispute('20000000-0000-0000-0000-000000000003','incomplete parcel') is not null as buyer_in_transit_ok;
reset role;
select count(*) disputes from disputes;

\echo == 7. auto_release
update escrow_config set auto_release = true;
insert into orders (id,buyer_id,status,total_amount) values ('20000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-00000000000b','paid',10);
update orders set status='delivered' where id='20000000-0000-0000-0000-000000000004';
update orders set delivered_at = now() - interval '49 hours' where id='20000000-0000-0000-0000-000000000004';
select send_delivery_reminders() envoyes;
select status from orders where id='20000000-0000-0000-0000-000000000004';
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b'); set role authenticated;
do $$ begin perform send_delivery_reminders(); raise notice 'buyer can run the job (WRONG)'; exception when others then raise notice 'buyer cannot run the job: %', sqlerrm; end $$;
reset role;
