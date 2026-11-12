\set QUIET 1
create or replace function pg_temp.u(u text, r text default 'authenticated') returns void language sql as $$
  select set_config('request.jwt.claim.sub', u, false), set_config('request.jwt.claim.role', r, false); $$;
select pg_temp.u('00000000-0000-0000-0000-00000000000b') \g /dev/null
set role authenticated;
\echo [2] acheteur tente role=admin
do $$ begin update profiles set role='admin' where id=auth.uid(); raise notice '  ECHEC: accepte'; exception when others then raise notice '  bloque: %', sqlerrm; end $$;
do $$ begin update profiles set kyc_identity_verified=true where id=auth.uid(); raise notice '  ECHEC: kyc accepte'; exception when others then raise notice '  bloque (kyc): %', sqlerrm; end $$;
update profiles set phone='+22990000000', default_city='Cotonou' where id=auth.uid();
select '  modif normale du profil OK -> ' || phone from profiles where id=auth.uid();
\echo [3] acheteur tente d inserer une commande a 1 FCFA
do $$ begin insert into orders (buyer_id,total_amount) values (auth.uid(),1); raise notice '  ECHEC: accepte'; exception when others then raise notice '  bloque: %', sqlerrm; end $$;
\echo [3b] commande via create_checkout_order (TV x1 + Radio x2, coupon PROMO10)
select jsonb_pretty(create_checkout_order('[{"product_id":"10000000-0000-0000-0000-000000000001","quantity":1},{"product_id":"10000000-0000-0000-0000-000000000002","quantity":1},{"product_id":"10000000-0000-0000-0000-000000000002","quantity":1}]','{"city":"Cotonou","district":"Akpakpa"}','kkiapay','promo10') - 'order_ids' - 'group_id');
select '  orders: ' || count(*) || ' / somme totaux = ' || sum(total_amount) from orders;
do $$ begin perform create_checkout_order('[{"product_id":"10000000-0000-0000-0000-000000000002","quantity":1}]','{"city":"Cotonou"}','kkiapay','PROMO10'); raise notice '  ECHEC coupon reutilise'; exception when others then raise notice '  coupon epuise: %', sqlerrm; end $$;
do $$ begin perform create_checkout_order('[{"product_id":"10000000-0000-0000-0000-000000000002","quantity":3}]','{"city":"Cotonou"}','kkiapay'); raise notice '  ECHEC stock'; exception when others then raise notice '  stock: %', sqlerrm; end $$;
do $$ begin perform create_checkout_order('[{"product_id":"10000000-0000-0000-0000-000000000003","quantity":1}]','{"city":"Cotonou"}','kkiapay'); raise notice '  ECHEC brouillon'; exception when others then raise notice '  non publie: %', sqlerrm; end $$;
do $$ begin perform create_checkout_order('[{"product_id":"10000000-0000-0000-0000-000000000002","quantity":-5}]','{"city":"Cotonou"}','kkiapay'); raise notice '  ECHEC qte'; exception when others then raise notice '  quantite: %', sqlerrm; end $$;
do $$ begin perform increment_coupon_usage('PROMO10'); raise notice '  ECHEC increment'; exception when others then raise notice '  increment_coupon_usage: %', sqlerrm; end $$;
\echo [5] lecture des emails d alerte stock
select '  lignes visibles: ' || count(*) from stock_notifications;
\echo [7] upload video hors de son dossier / dans son dossier
do $$ begin insert into storage.objects (bucket_id,name,owner) values ('delivery-videos','confirmations/00000000-0000-0000-0000-0000000000ee/x.webm',auth.uid()); raise notice '  ECHEC accepte'; exception when others then raise notice '  dossier d un autre: bloque'; end $$;
insert into storage.objects (bucket_id,name,owner) values ('delivery-videos','confirmations/00000000-0000-0000-0000-00000000000b/o/1.webm',auth.uid());
select '  son dossier: OK';
reset role;
select pg_temp.u('00000000-0000-0000-0000-00000000000a') \g /dev/null
set role authenticated;
\echo [4] admin cree une notification + change un role
insert into notifications (user_id,type,title) values ('00000000-0000-0000-0000-00000000000b','order_update','Votre commande est payee');
select '  notification creee';
update profiles set role='seller' where email='sourcing@t.l';
select '  admin promeut sourcing -> ' || role from profiles where email='sourcing@t.l';
reset role;
select pg_temp.u('', 'service_role') \g /dev/null
set role service_role;
\echo [svc] cle service_role (script) modifie un role
update profiles set business_slug='trustlink-sourcing' where email='sourcing@t.l';
select '  OK -> ' || business_slug from profiles where email='sourcing@t.l';
reset role;
