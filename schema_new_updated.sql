-- ============================================
-- TRUSTLINK - Schéma Supabase complet (Mis à jour v3)
-- Date: 2026-05-06
-- Changements: Ajout KYC documents, notification_preferences,
-- uniformisation dispatches.status, création shared types
-- ============================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================
create type user_role as enum ('buyer', 'seller', 'admin');
create type order_status as enum (
  'pending',        -- en attente de paiement (hors ligne)
  'paid',           -- paiement confirmé par admin
  'processing',     -- en cours de traitement
  'in_transit',     -- en cours de livraison
  'delivered',      -- livré (en attente vidéo)
  'confirmed',      -- confirmé après vidéo OK
  'disputed',       -- litige ouvert
  'cancelled',      -- annulée
  'refunded'        -- remboursée
);
create type dispute_status as enum ('open', 'resolved_refund', 'resolved_no_refund');
create type message_status as enum ('sent', 'read');
create type product_status as enum ('pending_review', 'approved', 'rejected');
create type notification_type as enum (
  'order_update',
  'new_message',
  'product_approved',
  'product_rejected',
  'dispute_update',
  'new_order',
  'payment_received'
);
create type payout_status as enum ('pending_review', 'approved', 'rejected', 'paid');
create type dispatch_status as enum ('preparing', 'in_transit', 'delivered', 'cancelled');

-- ============================================
-- PROFILES (tous les users: buyer, seller, admin)
-- ============================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'buyer',
  full_name text,
  email text,
  phone text,
  avatar_url text,
  -- Adresse par défaut
  default_address_line1 text,
  default_address_line2 text,
  default_city text,
  default_country text default 'Bénin',
  default_postal_code text,
  -- Infos business (sellers uniquement)
  business_name text,
  business_description text,
  business_address text,
  business_phone text,
  business_logo_url text,
  business_slug text unique, -- URL de la boutique
  business_website text,
  business_instagram text,
  business_category text,
  -- KYC (vérifications identité/Adresse/Entreprise)
  kyc_identity_verified boolean default false,
  kyc_identity_url text, -- Document upload
  kyc_address_verified boolean default false,
  kyc_address_url text, -- Document upload
  kyc_business_verified boolean default false,
  kyc_business_url text, -- Document upload
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- NOTIFICATION PREFERENCES (par utilisateur)
-- ============================================
create table notification_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  channel text not null check (channel in ('email', 'sms', 'push')),
  enabled boolean default true,
  created_at timestamptz default now(),
  unique(user_id, type, channel)
);

-- ============================================
-- CATEGORIES
-- ============================================
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  parent_id uuid references categories(id),
  created_at timestamptz default now()
);

-- ============================================
-- PRODUCTS
-- ============================================
create table products (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references profiles(id) on delete cascade,
  category_id uuid references categories(id),
  name text not null,
  description text,
  price numeric(12, 2) not null,
  currency text default 'XOF',
  stock_quantity integer not null default 0,
  sku text,
  status product_status not null default 'pending_review',
  rejection_reason text,  -- si admin rejette
  weight_kg numeric(6, 2),
  dimensions text,  -- ex: "30x20x10 cm"
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- PRODUCT IMAGES
-- ============================================
create table product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  is_primary boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ============================================
-- EXCHANGE RATES (géré par admin)
-- ============================================
create table exchange_rates (
  id uuid primary key default uuid_generate_v4(),
  from_currency text not null,
  to_currency text not null,
  rate numeric(12, 4) not null,
  updated_by uuid references profiles(id),
  updated_at timestamptz default now()
);

-- Taux initial NGN → XOF
insert into exchange_rates (from_currency, to_currency, rate)
values ('NGN', 'XOF', 0.89);

-- ============================================
-- WISHLISTS
-- ============================================
create table wishlists (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz default now(),
  unique(buyer_id, product_id)
);

-- ============================================
-- CARTS
-- ============================================
create table carts (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table cart_items (
  id uuid primary key default uuid_generate_v4(),
  cart_id uuid not null references carts(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity integer not null default 1,
  created_at timestamptz default now(),
  unique(cart_id, product_id)
);

-- ============================================
-- ORDERS (commande globale du buyer)
-- ============================================
create table orders (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references profiles(id),
  status order_status not null default 'pending',
  -- Adresse de livraison (snapshot au moment de la commande)
  shipping_address_line1 text,
  shipping_address_line2 text,
  shipping_city text,
  shipping_country text default 'Bénin',
  shipping_postal_code text,
  total_amount numeric(12, 2),
  currency text default 'XOF',
  -- Référence de paiement (KkiaPay, Mobile Money, etc.)
  payment_reference text,
  payment_method text,
  notes text,  -- notes du buyer
  admin_notes text,  -- notes internes admin
  -- Groupement (plusieurs commandes d'un même panier)
  group_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- ORDER ITEMS (sous-commandes par seller)
-- ============================================
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  seller_id uuid not null references profiles(id),
  product_id uuid not null references products(id),
  -- Snapshot produit au moment de la commande
  product_name text not null,
  product_price numeric(12, 2) not null,
  quantity integer not null default 1,
  subtotal numeric(12, 2),
  -- Statut propre à ce seller pour cette commande
  status order_status not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- DELIVERY VIDEOS (vidéos d'ouverture de colis)
-- ============================================
create table delivery_videos (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  buyer_id uuid not null references profiles(id),
  video_url text not null,  -- Chemin relatif dans le bucket privé
  duration_seconds integer,
  -- Admin review
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  is_defective boolean,  -- null = pas encore reviewé
  defective_reason text,  -- Raison si produit défectueux
  created_at timestamptz default now()
);

-- ============================================
-- DISPUTES (litiges)
-- ============================================
create table disputes (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id),
  buyer_id uuid not null references profiles(id),
  video_id uuid references delivery_videos(id),
  reason text not null,
  status dispute_status not null default 'open',
  -- Décision admin
  resolved_by uuid references profiles(id),
  resolution_notes text,
  resolved_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================
-- DISPATCHES (voyages)
-- ============================================
create table dispatches (
  id uuid primary key default uuid_generate_v4(),
  dispatch_code text not null unique,
  origin_hub text not null,
  destination_hub text default 'Cotonou',
  status dispatch_status not null default 'preparing',
  driver_name text,
  truck_plate text,
  customs_agent text,
  total_value numeric(12,2),
  orders_count integer default 0,
  departure_date timestamptz,
  estimated_arrival timestamptz,
  actual_arrival timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- DISPATCH ORDERS (liaison commandes ↔ voyages)
-- ============================================
create table dispatch_orders (
  dispatch_id uuid not null references dispatches(id) on delete cascade,
  order_id uuid not null references orders(id) on delete cascade,
  primary key (dispatch_id, order_id),
  created_at timestamptz default now()
);

-- ============================================
-- PAYOUTS (virements sellers — gestion admin hors ligne)
-- ============================================
create table payouts (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references profiles(id) on delete cascade,
  amount_xof numeric(12, 2) not null,
  status payout_status not null default 'pending_review',
  created_at timestamptz default now(),
  resolved_at timestamptz,
  resolved_by uuid references profiles(id)
);

-- ============================================
-- REVIEWS (avis produits)
-- ============================================
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  buyer_id uuid not null references profiles(id),
  order_id uuid references orders(id),
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now(),
  unique(product_id, buyer_id)  -- 1 avis par buyer par produit
);

-- ============================================
-- MESSAGES (buyer↔admin et seller↔admin)
-- ============================================
create table messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid not null references profiles(id),
  receiver_id uuid not null references profiles(id),
  subject text,
  content text not null,
  status message_status default 'sent',
  -- Thread (pour les réponses)
  parent_id uuid references messages(id),
  created_at timestamptz default now()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text,
  -- Lien vers la ressource concernée
  resource_type text,  -- 'order', 'product', 'message', 'dispute'
  resource_id uuid,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- ADMIN LOGS (historique des actions admin)
-- ============================================
create table admin_logs (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid not null references profiles(id),
  action text not null,  -- ex: 'order_status_changed', 'product_approved'
  resource_type text,    -- 'order', 'product', 'user', 'dispute'
  resource_id uuid,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
alter table profiles enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table categories enable row level security;
alter table exchange_rates enable row level security;
alter table wishlists enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table delivery_videos enable row level security;
alter table disputes enable row level security;
alter table reviews enable row level security;
alter table dispatches enable row level security;
alter table dispatch_orders enable row level security;
alter table payouts enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table admin_logs enable row level security;
alter table notification_preferences enable row level security;

-- ============================================
-- POLICIES RLS
-- ============================================

-- PROFILES
create policy "Users can view their own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles"
  on profiles for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
create policy "Admins can update all profiles"
  on profiles for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- PRODUCTS
create policy "Anyone can view approved products"
  on products for select using (status = 'approved');
create policy "Sellers can view their own products"
  on products for select using (seller_id = auth.uid());
create policy "Sellers can insert their own products"
  on products for insert with check (seller_id = auth.uid());
create policy "Sellers can update their own products"
  on products for update using (seller_id = auth.uid());
create policy "Sellers can delete their own products"
  on products for delete using (seller_id = auth.uid());
create policy "Admins can manage all products"
  on products for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- CATEGORIES
create policy "Anyone can view categories"
  on categories for select using (true);
create policy "Admins can manage categories"
  on categories for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- EXCHANGE RATES
create policy "Anyone can view exchange rates"
  on exchange_rates for select using (true);
create policy "Admins can manage exchange rates"
  on exchange_rates for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- WISHLISTS
create policy "Buyers can manage their own wishlist"
  on wishlists for all using (buyer_id = auth.uid());

-- CARTS
create policy "Buyers can manage their own cart"
  on carts for all using (buyer_id = auth.uid());
create policy "Buyers can manage their own cart items"
  on cart_items for all using (
    exists (select 1 from carts where id = cart_items.cart_id and buyer_id = auth.uid())
  );

-- ORDERS
create policy "Buyers can view their own orders"
  on orders for select using (buyer_id = auth.uid());
create policy "Buyers can create orders"
  on orders for insert with check (buyer_id = auth.uid());
create policy "Buyers can confirm or dispute their own delivered orders"
  on orders for update
  using (
    buyer_id = auth.uid()
    AND status IN ('delivered', 'in_transit')
  )
  with check (
    buyer_id = auth.uid()
    AND status IN ('confirmed', 'disputed')
  );
create policy "Admins can manage all orders"
  on orders for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ORDER ITEMS
create policy "Buyers can view their order items"
  on order_items for select using (
    exists (select 1 from orders where id = order_items.order_id and buyer_id = auth.uid())
  );
create policy "Buyers can insert order items for their own orders"
  on order_items for insert with check (
    exists (select 1 from orders where id = order_items.order_id and buyer_id = auth.uid())
  );
create policy "Sellers can view their own order items"
  on order_items for select using (seller_id = auth.uid());
create policy "Admins can manage all order items"
  on order_items for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- DELIVERY VIDEOS
create policy "Buyers can upload their own videos"
  on delivery_videos for insert with check (buyer_id = auth.uid());
create policy "Buyers can view their own videos"
  on delivery_videos for select using (buyer_id = auth.uid());
create policy "Admins can view and review all videos"
  on delivery_videos for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- DISPUTES
create policy "Buyers can view their own disputes"
  on disputes for select using (buyer_id = auth.uid());
create policy "Buyers can create disputes"
  on disputes for insert with check (buyer_id = auth.uid());
create policy "Admins can manage all disputes"
  on disputes for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- REVIEWS
create policy "Anyone can view reviews"
  on reviews for select using (true);
create policy "Buyers can manage their own reviews"
  on reviews for all using (buyer_id = auth.uid());

-- DISPATCHES
create policy "Admins can manage dispatches"
  on dispatches for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- DISPATCH ORDERS
create policy "Admins can manage dispatch orders"
  on dispatch_orders for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
create policy "Sellers can view dispatch orders for their orders"
  on dispatch_orders for select using (
    exists (select 1 from order_items where order_id = dispatch_orders.order_id and seller_id = auth.uid())
  );

-- PAYOUTS
create policy "Sellers can view their own payouts"
  on payouts for select using (seller_id = auth.uid());
create policy "Admins can manage all payouts"
  on payouts for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- MESSAGES
create policy "Users can view messages they sent or received"
  on messages for select using (
    sender_id = auth.uid() or receiver_id = auth.uid()
  );
create policy "Users can send messages"
  on messages for insert with check (sender_id = auth.uid());

-- NOTIFICATIONS
create policy "Users can view their own notifications"
  on notifications for select using (user_id = auth.uid());
create policy "Users can mark their notifications as read"
  on notifications for update using (user_id = auth.uid());

-- NOTIFICATION PREFERENCES
create policy "Users can manage their own preferences"
  on notification_preferences for all using (user_id = auth.uid());
create policy "Admins can view all preferences"
  on notification_preferences for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ADMIN LOGS
create policy "Admins can view all logs"
  on admin_logs for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
create policy "Admins can insert logs"
  on admin_logs for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- PRODUCT IMAGES
create policy "Anyone can view product images"
  on product_images for select using (true);
create policy "Sellers can manage images of their products"
  on product_images for all using (
    exists (select 1 from products where id = product_images.product_id and seller_id = auth.uid())
  );

-- ============================================
-- INDEXES (performances)
-- ============================================
create index idx_orders_buyer_id on orders(buyer_id);
create index idx_orders_status on orders(status);
create index idx_orders_group_id on orders(group_id);
create index idx_orders_created_at on orders(created_at desc);
create index idx_order_items_seller_id on order_items(seller_id);
create index idx_order_items_order_id on order_items(order_id);
create index idx_order_items_product_id on order_items(product_id);
create index idx_products_seller_id on products(seller_id);
create index idx_products_category_id on products(category_id);
create index idx_products_status on products(status);
create index idx_product_images_product_id on product_images(product_id);
create index idx_notifications_user_id on notifications(user_id);
create index idx_notifications_is_read on notifications(user_id, is_read);
create index idx_notifications_created_at on notifications(user_id, created_at desc);
create index idx_messages_sender_id on messages(sender_id);
create index idx_messages_receiver_id on messages(receiver_id);
create index idx_delivery_videos_order_id on delivery_videos(order_id);
create index idx_delivery_videos_buyer_id on delivery_videos(buyer_id);
create index idx_disputes_order_id on disputes(order_id);
create index idx_disputes_buyer_id on disputes(buyer_id);
create index idx_reviews_product_id on reviews(product_id);
create index idx_reviews_buyer_id on reviews(buyer_id);
create index idx_dispatch_orders_dispatch_id on dispatch_orders(dispatch_id);
create index idx_dispatch_orders_order_id on dispatch_orders(order_id);
create index idx_payouts_seller_id on payouts(seller_id);
create index idx_payouts_status on payouts(status);
create unique index idx_exchange_rates_unique on exchange_rates(from_currency, to_currency);
create index idx_notif_prefs_user_id on notification_preferences(user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, role, full_name)
  values (
    new.id,
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'buyer'),
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_profiles
  before update on profiles
  for each row execute function update_updated_at();

create trigger set_updated_at_products
  before update on products
  for each row execute function update_updated_at();

create trigger set_updated_at_orders
  before update on orders
  for each row execute function update_updated_at();

create trigger set_updated_at_order_items
  before update on order_items
  for each row execute function update_updated_at();
