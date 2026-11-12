-- Sourcing par lien : conserve ce que l'aperçu automatique a trouvé (informatif, non vérifié :
-- ces valeurs sont renvoyées par le navigateur, l'équipe confirme le prix réel).
alter table sourcing_requests add column if not exists source_price_ngn numeric(14,2);
alter table sourcing_requests add column if not exists source_image_url text;
