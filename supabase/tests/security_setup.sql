\set QUIET 1
insert into auth.users (id,email) values ('00000000-0000-0000-0000-00000000000a','admin@t.l');
update profiles set role='admin' where id='00000000-0000-0000-0000-00000000000a';
insert into invitation_codes (code, created_by, expires_at) values ('GOODCODE','00000000-0000-0000-0000-00000000000a', now()+interval '1 day');
-- inscriptions
insert into auth.users (id,email,raw_user_meta_data) values
 ('00000000-0000-0000-0000-0000000000ee','hacker@t.l','{"role":"admin"}'),
 ('00000000-0000-0000-0000-0000000000e2','hacker2@t.l','{"role":"admin","invite_code":"BADCODE"}'),
 ('00000000-0000-0000-0000-0000000000f1','newadmin@t.l','{"role":"admin","invite_code":"goodcode"}'),
 ('00000000-0000-0000-0000-0000000000f2','reuse@t.l','{"invite_code":"GOODCODE"}'),
 ('00000000-0000-0000-0000-00000000000b','buyer@t.l','{"full_name":"Awa"}'),
 ('00000000-0000-0000-0000-00000000000d','sourcing@t.l','{"role":"seller"}');
\echo [1] roles apres inscription (attendu: hacker=buyer, hacker2=buyer, newadmin=admin, reuse=buyer, sourcing=buyer)
select email, role from profiles where id <> '00000000-0000-0000-0000-00000000000a' order by email;
select code, used_by is not null as utilise from invitation_codes;
insert into products (id,seller_id,name,price,status,stock_quantity) values
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000a','TV',500000,'approved',5),
 ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-00000000000d','Radio',12345,'approved',2),
 ('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-00000000000d','Brouillon',10,'pending_review',9);
insert into coupons (code, discount_type, discount_value, max_uses) values ('PROMO10','percentage',10,1);
insert into stock_notifications (product_id,email) values ('10000000-0000-0000-0000-000000000001','client@gmail.com');
