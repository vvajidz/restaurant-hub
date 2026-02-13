-- Superadmin RLS policies for all tables
CREATE POLICY "Superadmin can view all hotels"
ON public.hotels FOR SELECT
USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can view all invoices"
ON public.invoices FOR SELECT
USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can view all orders"
ON public.orders FOR SELECT
USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can view all menu items"
ON public.menu_items FOR SELECT
USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can view all expenses"
ON public.expenses FOR SELECT
USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can view all settings"
ON public.restaurant_settings FOR SELECT
USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can view all tables"
ON public.restaurant_tables FOR SELECT
USING (public.has_role(auth.uid(), 'superadmin'));