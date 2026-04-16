-- TrustLink MVP : Initial Database Schema
-- Supabase PostgreSQL

-- Create custom types for ENUMS
CREATE TYPE user_role AS ENUM ('CLIENT', 'AGENT', 'ADMIN', 'SELLER');
CREATE TYPE user_tier AS ENUM ('FREEMIUM', 'PREMIUM');
CREATE TYPE order_status AS ENUM ('PENDING', 'FUNDED', 'INSPECTED', 'SHIPPED', 'ARRIVED_AT_HUB', 'DELIVERED', 'DISPUTED');
CREATE TYPE dispute_status AS ENUM ('OPEN', 'RESOLVED_REFUND', 'RESOLVED_RELEASE');

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT UNIQUE,
  momo_network TEXT, -- e.g. MTN, MOOV
  city TEXT,
  role user_role DEFAULT 'CLIENT',
  tier user_tier DEFAULT 'FREEMIUM',
  store_name TEXT, -- Only for Sellers
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  lat NUMERIC,
  lng NUMERIC
);

-- Products Catalog (managed by Sellers)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.profiles(id), -- Mandatory link to Seller
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  base_price_cfa NUMERIC NOT NULL, -- Seller's price
  discount_percent NUMERIC DEFAULT 0,
  final_price_cfa NUMERIC NOT NULL, -- Calculated: base_price * (1 - discount/100)
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  lat NUMERIC,
  lng NUMERIC
);

-- Sourcing Requests
CREATE TABLE public.sourcing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.profiles(id),
  description TEXT NOT NULL,
  target_price_cfa NUMERIC,
  status TEXT DEFAULT 'PENDING', -- PENDING, QUOTED, REJECTED
  quoted_price_cfa NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.profiles(id),
  total_cfa NUMERIC NOT NULL,
  status order_status DEFAULT 'PENDING',
  payment_reference TEXT, -- FedaPay/KKiaPay reference
  escrow_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  lat NUMERIC,
  lng NUMERIC
);

-- Order Items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER DEFAULT 1,
  price_cfa NUMERIC NOT NULL
);

-- Inspections (Lagos Agents)
CREATE TABLE public.inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) UNIQUE,
  agent_id UUID REFERENCES public.profiles(id),
  video_url TEXT NOT NULL,
  location_lat NUMERIC,
  location_lng NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disputes (Clients receiving packages in Cotonou)
CREATE TABLE public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) UNIQUE,
  client_id UUID REFERENCES public.profiles(id),
  video_url TEXT NOT NULL,
  reason TEXT,
  status dispute_status DEFAULT 'OPEN',
  admin_resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE public.vendor_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.profiles(id),
  original_order_id UUID REFERENCES public.orders(id),
  status TEXT DEFAULT 'PENDING', -- PENDING, PREPARING, READY, PICKED_UP
  total_payout_cfa NUMERIC NOT NULL DEFAULT 0, -- Amount seller receives
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(seller_id, original_order_id)
);

CREATE TABLE public.vendor_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_order_id UUID REFERENCES public.vendor_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price_payout_cfa NUMERIC NOT NULL
);

-- Vendor Messages (Chat between Sellers and Hub Admin)
CREATE TABLE public.vendor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  sender TEXT NOT NULL, -- 'seller' or 'admin'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- AUTOMATION: Automatically create vendor_orders when order_items are created
CREATE OR REPLACE FUNCTION public.handle_new_order_item()
RETURNS TRIGGER AS $$
DECLARE
    v_seller_id UUID;
BEGIN
    -- Get seller_id from products
    SELECT seller_id INTO v_seller_id FROM public.products WHERE id = NEW.product_id;
    
    -- Insert or Update vendor_order
    INSERT INTO public.vendor_orders (original_order_id, seller_id, status, total_payout_cfa)
    VALUES (NEW.order_id, v_seller_id, 'PENDING', NEW.price_cfa * NEW.quantity)
    ON CONFLICT (seller_id, original_order_id) DO UPDATE
    SET total_payout_cfa = public.vendor_orders.total_payout_cfa + (NEW.price_cfa * NEW.quantity);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_item_created
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_order_item();
