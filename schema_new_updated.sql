-- ============================================
-- TRUSTLINK - Schéma Supabase complet (Mis à jour v4)
-- Date: 2026-05-15
-- ============================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================
create type user_role as enum ('buyer', 'seller', 'admin');
create type order_status as enum (
  'pending',
  'paid',
  'processing',
  'in_transit',
  'delivered',
  'confirmed',
  'disputed',
  'cancelled',
  'refunded'
);
create type dispute_status as enum ('open', 'resolved_refund', 'resolved_no_refund');
create type message_status as enum ('sent', 'read');
create type product_status as enum ('draft', 'pending_review', 'approved', 'rejected');
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
-- TABLES
-- ============================================

-- PROFILES
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'buyer',
  full_name text,
  email text,
  phone text,
  avatar_url text,
  default_address_line1 text,
  default_address_line2 text,
  default_city text,
  default_country text default 'Bénin',
  default_postal_code text,
  business_name text,
  business_description text,
  business_address text,
  business_phone text,
  business_logo_url text,
  business_slug text unique,
  business_website text,
  business_instagram text,
  business_category text,
  kyc_identity_verified boolean default false,
  kyc_identity_url text,
  kyc_address_verified boolean default false,
  kyc_address_url text,
  kyc_business_verified boolean default false,
  kyc_business_url text,
  notification_frequency text default 'realtime',
  locale text default 'fr',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- NOTIFICATION PREFERENCES
create table notification_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  channel text not null check (channel in ('email', 'sms', 'push')),
  enabled boolean default true,
  created_at timestamptz default now(),
  unique(user_id, type, channel)
);

-- CATEGORIES
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  parent_id uuid references categories(id),
  created_at timestamptz default now()
);

-- PRODUCTS
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
  rejection_reason text,
  weight_kg numeric(6, 2),
  dimensions text,
  delivery_min_days integer default 2,
  delivery_max_days integer default 7,
  meta_title text,
  meta_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PRODUCT VARIANTS
create table product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,
  type text not null,
  value text not null,
  stock_quantity integer not null default 0,
  price_modifier numeric(12,2) default 0,
  image_url text,
  sort_order integer default 0,
  created_at timestamptz default now(),
  unique(product_id, type, value)
);

-- PRODUCT IMAGES
create table product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  is_primary boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- PRODUCT VIEWS (analytics)
create table product_views (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  viewed_at timestamptz default now()
);

-- EXCHANGE RATES
create table exchange_rates (
  id uuid primary key default uuid_generate_v4(),
  from_currency text not null,
  to_currency text not null,
  rate numeric(12, 4) not null,
  updated_by uuid references profiles(id),
  updated_at timestamptz default now()
);

insert into exchange_rates (from_currency, to_currency, rate)
values ('NGN', 'XOF', 0.89);

-- ESCROW CONFIG
create table escrow_config (
  id uuid primary key default uuid_generate_v4(),
  spread_pct numeric(5,2) not null default 3.0,
  min_amount_xof numeric(12,2) not null default 500,
  release_delay_hours integer not null default 72,
  auto_release boolean not null default false,
  updated_by uuid references profiles(id),
  updated_at timestamptz default now()
);

insert into escrow_config (spread_pct, min_amount_xof, release_delay_hours, auto_release)
values (3.0, 500, 72, false);

-- HUBS
create table hubs (
  code text primary key,
  name text not null,
  country text not null,
  active boolean not null default true,
  created_at timestamptz default now()
);

insert into hubs (code, name, country, active) values
  ('LOS', 'Lagos', 'Nigeria', true),
  ('ABJ', 'Abuja', 'Nigeria', true),
  ('COT', 'Cotonou', 'Bénin', true),
  ('PNV', 'Porto-Novo', 'Bénin', false);

-- WISHLISTS
create table wishlists (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz default now(),
  unique(buyer_id, product_id)
);

-- CARTS
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

-- ORDERS
create table orders (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references profiles(id),
  status order_status not null default 'pending',
  shipping_address_line1 text,
  shipping_address_line2 text,
  shipping_city text,
  shipping_country text default 'Bénin',
  shipping_postal_code text,
  total_amount numeric(12, 2),
  currency text default 'XOF',
  payment_reference text,
  payment_method text,
  notes text,
  admin_notes text,
  group_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ORDER ITEMS
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  seller_id uuid not null references profiles(id),
  product_id uuid not null references products(id),
  product_name text not null,
  product_price numeric(12, 2) not null,
  quantity integer not null default 1,
  subtotal numeric(12, 2),
  status order_status not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- DELIVERY VIDEOS
create table delivery_videos (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  buyer_id uuid not null references profiles(id),
  video_url text not null,
  duration_seconds integer,
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  is_defective boolean,
  defective_reason text,
  created_at timestamptz default now()
);

-- DISPUTES
create table disputes (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id),
  buyer_id uuid not null references profiles(id),
  video_id uuid references delivery_videos(id),
  reason text not null,
  status dispute_status not null default 'open',
  resolved_by uuid references profiles(id),
  resolution_notes text,
  resolved_at timestamptz,
  created_at timestamptz default now()
);

-- DISPATCHES
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

-- DISPATCH ORDERS
create table dispatch_orders (
  dispatch_id uuid not null references dispatches(id) on delete cascade,
  order_id uuid not null references orders(id) on delete cascade,
  primary key (dispatch_id, order_id),
  created_at timestamptz default now()
);

-- PAYOUTS
create table payouts (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references profiles(id) on delete cascade,
  amount_xof numeric(12, 2) not null,
  status payout_status not null default 'pending_review',
  created_at timestamptz default now(),
  resolved_at timestamptz,
  resolved_by uuid references profiles(id)
);

-- COUPONS
create table coupons (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(12,2) not null,
  min_order_amount numeric(12,2) default 0,
  max_uses integer default null,
  used_count integer default 0,
  expires_at timestamptz,
  active boolean default true,
  created_at timestamptz default now()
);

-- PRODUCT QUESTIONS / Q&A
create table product_questions (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  buyer_id uuid not null references profiles(id),
  question text not null,
  answer text,
  answered_by uuid references profiles(id),
  answered_at timestamptz,
  created_at timestamptz default now()
);

-- STOCK NOTIFICATIONS
create table stock_notifications (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  email text not null,
  notified boolean default false,
  created_at timestamptz default now()
);

-- SAVED PAYMENT METHODS
create table saved_payments (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references profiles(id) on delete cascade,
  method_type text not null,
  identifier text not null,
  label text default 'Mon moyen de paiement',
  is_default boolean default false,
  created_at timestamptz default now()
);

-- REVIEWS
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  buyer_id uuid not null references profiles(id),
  order_id uuid references orders(id),
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now(),
  unique(product_id, buyer_id)
);

-- MESSAGES
create table messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid not null references profiles(id),
  receiver_id uuid not null references profiles(id),
  subject text,
  content text not null,
  status message_status default 'sent',
  parent_id uuid references messages(id),
  created_at timestamptz default now()
);

-- NOTIFICATIONS
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text,
  resource_type text,
  resource_id uuid,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ADMIN LOGS
create table admin_logs (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid not null references profiles(id),
  action text not null,
  resource_type text,
  resource_id uuid,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz default now()
);

-- SELLER LOGS
create table seller_logs (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references profiles(id) on delete cascade,
  action text not null,
  resource_type text,
  resource_id uuid,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz default now()
);

-- SYSTEM ANNOUNCEMENTS
create table system_announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  body text,
  target_role user_role,
  is_active boolean default true,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  expires_at timestamptz
);

-- APP SETTINGS
create table app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

insert into app_settings (key, value) values ('maintenance_mode', 'false')
on conflict (key) do nothing;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table profiles enable row level security;
alter table notification_preferences enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table product_views enable row level security;
alter table exchange_rates enable row level security;
alter table escrow_config enable row level security;
alter table hubs enable row level security;
alter table wishlists enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table delivery_videos enable row level security;
alter table disputes enable row level security;
alter table dispatches enable row level security;
alter table dispatch_orders enable row level security;
alter table payouts enable row level security;
alter table coupons enable row level security;
alter table product_questions enable row level security;
alter table stock_notifications enable row level security;
alter table saved_payments enable row level security;
alter table reviews enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table admin_logs enable row level security;
alter table seller_logs enable row level security;
alter table system_announcements enable row level security;
alter table app_settings enable row level security;

-- ============================================
-- HELPER FUNCTION
-- ============================================
create or replace function is_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from profiles where id = user_id and role = 'admin');
$$;

-- ============================================
-- RLS POLICIES
-- ============================================

-- PROFILES
create policy "Users can view their own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles"
  on profiles for select using (is_admin(auth.uid()));
create policy "Admins can update all profiles"
  on profiles for update using (is_admin(auth.uid()));

-- NOTIFICATION PREFERENCES
create policy "Users can manage their own preferences"
  on notification_preferences for all using (user_id = auth.uid());
create policy "Admins can view all preferences"
  on notification_preferences for select using (is_admin(auth.uid()));

-- CATEGORIES
create policy "Anyone can view categories"
  on categories for select using (true);
create policy "Admins can manage categories"
  on categories for all using (is_admin(auth.uid()));

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
  on products for all using (is_admin(auth.uid()));

-- PRODUCT VARIANTS
create policy "Anyone can view product variants"
  on product_variants for select using (true);
create policy "Sellers can manage their product variants"
  on product_variants for all using (
    exists (select 1 from products where id = product_variants.product_id and seller_id = auth.uid())
  );
create policy "Admins can manage all variants"
  on product_variants for all using (is_admin(auth.uid()));

-- PRODUCT IMAGES
create policy "Anyone can view product images"
  on product_images for select using (true);
create policy "Sellers can manage images of their products"
  on product_images for all using (
    exists (select 1 from products where id = product_images.product_id and seller_id = auth.uid())
  );

-- PRODUCT VIEWS
create policy "Anyone can insert product views"
  on product_views for insert with check (true);
create policy "Sellers can view their own product stats"
  on product_views for select using (
    exists (select 1 from products where id = product_views.product_id and seller_id = auth.uid())
  );
create policy "Admins can view all product views"
  on product_views for select using (is_admin(auth.uid()));

-- EXCHANGE RATES
create policy "Anyone can view exchange rates"
  on exchange_rates for select using (true);
create policy "Admins can manage exchange rates"
  on exchange_rates for all using (is_admin(auth.uid()));

-- ESCROW CONFIG
create policy "Anyone can view escrow config"
  on escrow_config for select using (true);
create policy "Admins can manage escrow config"
  on escrow_config for all using (is_admin(auth.uid()));

-- HUBS
create policy "Anyone can view hubs"
  on hubs for select using (true);
create policy "Admins can manage hubs"
  on hubs for all using (is_admin(auth.uid()));

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
  on orders for all using (is_admin(auth.uid()));

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
create policy "Sellers can update their own order items status"
  on order_items for update using (seller_id = auth.uid())
  with check (seller_id = auth.uid());
create policy "Admins can manage all order items"
  on order_items for all using (is_admin(auth.uid()));

-- DELIVERY VIDEOS
create policy "Buyers can upload their own videos"
  on delivery_videos for insert with check (buyer_id = auth.uid());
create policy "Buyers can view their own videos"
  on delivery_videos for select using (buyer_id = auth.uid());
create policy "Sellers can view videos of their products"
  on delivery_videos for select using (
    exists (
      select 1 from order_items oi
      join products p on p.id = oi.product_id
      where oi.order_id = delivery_videos.order_id
      and p.seller_id = auth.uid()
    )
  );
create policy "Admins can view and review all videos"
  on delivery_videos for all using (is_admin(auth.uid()));

-- DISPUTES
create policy "Buyers can view their own disputes"
  on disputes for select using (buyer_id = auth.uid());
create policy "Buyers can create disputes"
  on disputes for insert with check (buyer_id = auth.uid());
create policy "Sellers can view disputes on their orders"
  on disputes for select using (
    exists (
      select 1 from order_items
      where order_id = disputes.order_id
      and seller_id = auth.uid()
    )
  );
create policy "Admins can manage all disputes"
  on disputes for all using (is_admin(auth.uid()));

-- DISPATCHES
create policy "Admins can manage dispatches"
  on dispatches for all using (is_admin(auth.uid()));

-- DISPATCH ORDERS
create policy "Admins can manage dispatch orders"
  on dispatch_orders for all using (is_admin(auth.uid()));
create policy "Sellers can view dispatch orders for their orders"
  on dispatch_orders for select using (
    exists (select 1 from order_items where order_id = dispatch_orders.order_id and seller_id = auth.uid())
  );

-- PAYOUTS
create policy "Sellers can view their own payouts"
  on payouts for select using (seller_id = auth.uid());
create policy "Admins can manage all payouts"
  on payouts for all using (is_admin(auth.uid()));

-- COUPONS
create policy "Anyone can view active coupons"
  on coupons for select using (active = true);
create policy "Admins can manage coupons"
  on coupons for all using (is_admin(auth.uid()));

-- PRODUCT QUESTIONS
create policy "Anyone can view questions and answers"
  on product_questions for select using (true);
create policy "Buyers can ask questions"
  on product_questions for insert with check (buyer_id = auth.uid());
create policy "Sellers can answer questions on their products"
  on product_questions for update using (
    exists (select 1 from products where id = product_questions.product_id and seller_id = auth.uid())
  );
create policy "Admins can manage all questions"
  on product_questions for all using (is_admin(auth.uid()));

-- STOCK NOTIFICATIONS
create policy "Anyone can subscribe to stock notifications"
  on stock_notifications for insert with check (true);
create policy "Anyone can view stock notifications"
  on stock_notifications for select using (true);
create policy "Admins can manage stock notifications"
  on stock_notifications for all using (is_admin(auth.uid()));

-- SAVED PAYMENTS
create policy "Buyers can manage their own payment methods"
  on saved_payments for all using (buyer_id = auth.uid());

-- REVIEWS
create policy "Anyone can view reviews"
  on reviews for select using (true);
create policy "Buyers can manage their own reviews"
  on reviews for all using (buyer_id = auth.uid());

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

-- ADMIN LOGS
create policy "Admins can view all logs"
  on admin_logs for select using (is_admin(auth.uid()));
create policy "Admins can insert logs"
  on admin_logs for insert with check (is_admin(auth.uid()));

-- SELLER LOGS
create policy "Sellers can manage their own logs"
  on seller_logs for all using (seller_id = auth.uid());
create policy "Admins can view all seller logs"
  on seller_logs for select using (is_admin(auth.uid()));

-- SYSTEM ANNOUNCEMENTS
create policy "Anyone can view active announcements"
  on system_announcements for select using (is_active = true or is_admin(auth.uid()));
create policy "Admins can manage announcements"
  on system_announcements for all using (is_admin(auth.uid()));

-- APP SETTINGS
create policy "Anyone can view app settings"
  on app_settings for select using (true);
create policy "Admins can manage app settings"
  on app_settings for all using (is_admin(auth.uid()));

-- ============================================
-- INDEXES
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
create index idx_variants_product_id on product_variants(product_id);
create index idx_coupons_code on coupons(code);
create index idx_questions_product_id on product_questions(product_id);
create index idx_stock_notif_product_id on stock_notifications(product_id);
create index idx_saved_payments_buyer_id on saved_payments(buyer_id);
create index idx_product_views_product_id on product_views(product_id);
create index idx_product_views_viewed_at on product_views(viewed_at);
create index idx_seller_logs_seller_id on seller_logs(seller_id);
create index idx_announcements_active on system_announcements(is_active);

-- ============================================
-- TRIGGERS
-- ============================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, full_name)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data->>'role', '')::user_role,
      'buyer'::user_role
    ),
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

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

-- ============================================
-- STORAGE RLS
-- ============================================
create policy "Public can view avatars"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

create policy "Users can update own avatars"
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.uid() = owner );

create policy "Authenticated users can upload delivery videos"
  on storage.objects for insert
  with check ( bucket_id = 'delivery-videos' and auth.role() = 'authenticated' );

create policy "Owners, admins and sellers can view delivery videos"
  on storage.objects for select
  using (
    bucket_id = 'delivery-videos'
    and (
      auth.uid() = owner
      or is_admin(auth.uid())
      or exists (
        select 1 from delivery_videos dv
        join order_items oi on oi.order_id = dv.order_id
        where dv.video_url like '%' || name
        and oi.seller_id = auth.uid()
      )
    )
  );

create policy "Anyone can view product images"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

create policy "Sellers can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and exists (select 1 from profiles where id = auth.uid() and role = 'seller')
  );
