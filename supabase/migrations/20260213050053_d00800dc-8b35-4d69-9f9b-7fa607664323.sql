
-- Add status to hotels
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Create subscription_packages table
CREATE TABLE public.subscription_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  duration_days integer NOT NULL DEFAULT 30,
  features text[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_packages ENABLE ROW LEVEL SECURITY;

-- Only superadmin can manage packages
CREATE POLICY "Superadmin can manage packages"
  ON public.subscription_packages FOR ALL
  USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Everyone can view active packages (for registration page etc)
CREATE POLICY "Anyone can view active packages"
  ON public.subscription_packages FOR SELECT
  USING (is_active = true);

-- Add subscription fields to hotels
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS subscription_package_id uuid REFERENCES public.subscription_packages(id);
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS subscription_start date;
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS subscription_end date;

-- Trigger for updated_at
CREATE TRIGGER update_subscription_packages_updated_at
  BEFORE UPDATE ON public.subscription_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
