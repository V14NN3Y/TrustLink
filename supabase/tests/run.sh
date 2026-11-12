#!/bin/bash
# Rejoue le schéma + toutes les migrations sur un Postgres LOCAL jetable, puis
# les scénarios fonctionnels et les attaques de sécurité.
# Ne jamais pointer ce script sur la base Supabase de production.
#
# Prérequis : un Postgres 15+ local, un super-utilisateur, et un rôle de
# connexion "authenticator" (créé par supabase_stub.sql) autorisé en local.
#   PGHOST=/tmp PGPORT=5432 PGUSER=postgres ./supabase/tests/run.sh
set -e
cd "$(dirname "$0")"
ROOT=../..
DB=${TEST_DB:-trustlink_test}
P="psql -v ON_ERROR_STOP=1 -q"

$P -d postgres -c "drop database if exists $DB" -c "create database $DB"
$P -d $DB -f supabase_stub.sql
$P -d $DB -f $ROOT/schema_new_updated.sql
$P -d $DB -f $ROOT/supabase/migrations/20261110120000_order_inspections.sql
$P -d $DB -f $ROOT/supabase/setup/00_buckets.sql
$P -d $DB -c "grant select, insert, update, delete on all tables in schema public, storage to anon, authenticated, service_role; grant execute on all functions in schema public to anon, authenticated;"
for f in $ROOT/supabase/migrations/202611122*.sql; do $P -d $DB -f "$f"; done
echo "== Migrations OK"

echo "== Scénarios fonctionnels"
psql -q -d $DB -f features.sql

$P -d postgres -c "drop database $DB" -c "create database $DB"
$P -d $DB -f supabase_stub.sql
$P -d $DB -f $ROOT/schema_new_updated.sql
$P -d $DB -f $ROOT/supabase/migrations/20261110120000_order_inspections.sql
$P -d $DB -f $ROOT/supabase/setup/00_buckets.sql
$P -d $DB -c "grant select, insert, update, delete on all tables in schema public, storage to anon, authenticated, service_role; grant execute on all functions in schema public to anon, authenticated;"
for f in $ROOT/supabase/migrations/202611122*.sql; do $P -d $DB -f "$f"; done
psql -q -d $DB -f security_setup.sql
echo "== Attaques (chaque ligne doit dire 'bloque', aucune 'ECHEC')"
psql -q -U authenticator -d $DB -f security_attacks.sql 2>&1 | sed 's/^psql:[^ ]*: NOTICE:  //'
