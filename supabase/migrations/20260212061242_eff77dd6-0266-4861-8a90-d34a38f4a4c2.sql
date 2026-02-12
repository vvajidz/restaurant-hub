
-- ============================================
-- MULTI-TENANT HOTEL SAAS MIGRATION
-- ============================================

-- 1. Create hotels table
CREATE TABLE public.hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  admin_user_id UUID NOT NULL,
  staff_user_id UUID,
  staff_email TEXT,
  staff_password TEXT, -- stored so admin can view credentials
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view own hotel" ON public.hotels
  FOR SELECT USING (auth.uid() = admin_user_id OR auth.uid() = staff_user_id);

CREATE POLICY "Admins can update own hotel" ON public.hotels
  FOR UPDATE USING (auth.uid() = admin_user_id);

CREATE INDEX idx_hotels_admin ON public.hotels(admin_user_id);
CREATE INDEX idx_hotels_staff ON public.hotels(staff_user_id);

-- 2. Helper function to get user's hotel_id
CREATE OR REPLACE FUNCTION public.get_user_hotel_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.hotels
  WHERE admin_user_id = _user_id OR staff_user_id = _user_id
  LIMIT 1
$$;

-- 3. Clean existing seed data (no hotel association)
DELETE FROM public.order_items;
DELETE FROM public.invoices;
DELETE FROM public.orders;
DELETE FROM public.menu_items;
DELETE FROM public.restaurant_tables;
DELETE FROM public.restaurant_settings;

-- 4. Add hotel_id to all tenant-scoped tables
ALTER TABLE public.menu_items ADD COLUMN hotel_id UUID REFERENCES public.hotels(id);
ALTER TABLE public.restaurant_tables ADD COLUMN hotel_id UUID REFERENCES public.hotels(id);
ALTER TABLE public.orders ADD COLUMN hotel_id UUID REFERENCES public.hotels(id);
ALTER TABLE public.expenses ADD COLUMN hotel_id UUID REFERENCES public.hotels(id);
ALTER TABLE public.invoices ADD COLUMN hotel_id UUID REFERENCES public.hotels(id);
ALTER TABLE public.restaurant_settings ADD COLUMN hotel_id UUID REFERENCES public.hotels(id) UNIQUE;
ALTER TABLE public.profiles ADD COLUMN hotel_id UUID REFERENCES public.hotels(id);
ALTER TABLE public.user_roles ADD COLUMN hotel_id UUID REFERENCES public.hotels(id);

-- Add indexes
CREATE INDEX idx_menu_items_hotel ON public.menu_items(hotel_id);
CREATE INDEX idx_restaurant_tables_hotel ON public.restaurant_tables(hotel_id);
CREATE INDEX idx_orders_hotel ON public.orders(hotel_id);
CREATE INDEX idx_expenses_hotel ON public.expenses(hotel_id);
CREATE INDEX idx_invoices_hotel ON public.invoices(hotel_id);
CREATE INDEX idx_profiles_hotel ON public.profiles(hotel_id);
CREATE INDEX idx_user_roles_hotel ON public.user_roles(hotel_id);

-- 5. Drop old RLS policies and create tenant-scoped ones

-- menu_items
DROP POLICY IF EXISTS "Admins can manage menu" ON public.menu_items;
DROP POLICY IF EXISTS "Anyone authenticated can view menu" ON public.menu_items;

CREATE POLICY "Users can view own hotel menu" ON public.menu_items
  FOR SELECT USING (hotel_id = public.get_user_hotel_id(auth.uid()));

CREATE POLICY "Admins can insert own hotel menu" ON public.menu_items
  FOR INSERT WITH CHECK (
    hotel_id = public.get_user_hotel_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update own hotel menu" ON public.menu_items
  FOR UPDATE USING (
    hotel_id = public.get_user_hotel_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete own hotel menu" ON public.menu_items
  FOR DELETE USING (
    hotel_id = public.get_user_hotel_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

-- restaurant_tables
DROP POLICY IF EXISTS "Admins can manage tables" ON public.restaurant_tables;
DROP POLICY IF EXISTS "Authenticated can update tables" ON public.restaurant_tables;
DROP POLICY IF EXISTS "Authenticated can view tables" ON public.restaurant_tables;

CREATE POLICY "Users can view own hotel tables" ON public.restaurant_tables
  FOR SELECT USING (hotel_id = public.get_user_hotel_id(auth.uid()));

CREATE POLICY "Admins can insert own hotel tables" ON public.restaurant_tables
  FOR INSERT WITH CHECK (
    hotel_id = public.get_user_hotel_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update own hotel tables" ON public.restaurant_tables
  FOR UPDATE USING (
    hotel_id = public.get_user_hotel_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete own hotel tables" ON public.restaurant_tables
  FOR DELETE USING (
    hotel_id = public.get_user_hotel_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Staff can update own hotel tables" ON public.restaurant_tables
  FOR UPDATE USING (hotel_id = public.get_user_hotel_id(auth.uid()));

-- orders
DROP POLICY IF EXISTS "Authenticated can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated can update orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated can view orders" ON public.orders;

CREATE POLICY "Users can view own hotel orders" ON public.orders
  FOR SELECT USING (hotel_id = public.get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can insert own hotel orders" ON public.orders
  FOR INSERT WITH CHECK (hotel_id = public.get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can update own hotel orders" ON public.orders
  FOR UPDATE USING (hotel_id = public.get_user_hotel_id(auth.uid()));

-- expenses
DROP POLICY IF EXISTS "Admins can manage expenses" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated can insert expenses" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated can view expenses" ON public.expenses;

CREATE POLICY "Users can view own hotel expenses" ON public.expenses
  FOR SELECT USING (hotel_id = public.get_user_hotel_id(auth.uid()));

CREATE POLICY "Admins can manage own hotel expenses" ON public.expenses
  FOR ALL USING (
    hotel_id = public.get_user_hotel_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can insert own hotel expenses" ON public.expenses
  FOR INSERT WITH CHECK (hotel_id = public.get_user_hotel_id(auth.uid()));

-- invoices
DROP POLICY IF EXISTS "Authenticated can insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated can view invoices" ON public.invoices;

CREATE POLICY "Users can view own hotel invoices" ON public.invoices
  FOR SELECT USING (hotel_id = public.get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can insert own hotel invoices" ON public.invoices
  FOR INSERT WITH CHECK (hotel_id = public.get_user_hotel_id(auth.uid()));

-- restaurant_settings
DROP POLICY IF EXISTS "Admins can update settings" ON public.restaurant_settings;
DROP POLICY IF EXISTS "Authenticated can view settings" ON public.restaurant_settings;

CREATE POLICY "Users can view own hotel settings" ON public.restaurant_settings
  FOR SELECT USING (hotel_id = public.get_user_hotel_id(auth.uid()));

CREATE POLICY "Admins can update own hotel settings" ON public.restaurant_settings
  FOR UPDATE USING (
    hotel_id = public.get_user_hotel_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can insert own hotel settings" ON public.restaurant_settings
  FOR INSERT WITH CHECK (
    hotel_id = public.get_user_hotel_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

-- profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own hotel profiles" ON public.profiles
  FOR SELECT USING (hotel_id = public.get_user_hotel_id(auth.uid()) OR auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- order_items (scoped via orders join)
DROP POLICY IF EXISTS "Authenticated can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated can view order items" ON public.order_items;

CREATE POLICY "Users can view order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.hotel_id = public.get_user_hotel_id(auth.uid())
    )
  );

CREATE POLICY "Users can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.hotel_id = public.get_user_hotel_id(auth.uid())
    )
  );

-- 6. Update trigger for updated_at on hotels
CREATE TRIGGER update_hotels_updated_at
  BEFORE UPDATE ON public.hotels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
