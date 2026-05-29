
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users see own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins see all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Apartments
CREATE TABLE public.apartments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  building TEXT NOT NULL,
  floor INT NOT NULL,
  bedrooms INT NOT NULL,
  bathrooms INT NOT NULL,
  area_sqm INT NOT NULL,
  price_dzd BIGINT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.apartments TO anon, authenticated;
GRANT ALL ON public.apartments TO service_role;
ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read apartments" ON public.apartments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage apartments" ON public.apartments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID REFERENCES public.apartments(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT INSERT ON public.orders TO anon;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can place order" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "users see own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins see all orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update orders" ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed apartments
INSERT INTO public.apartments (title, building, floor, bedrooms, bathrooms, area_sqm, price_dzd, description, status) VALUES
('F3 Lumière', 'Bloc N°17 AADL', 4, 2, 1, 75, 14500000, 'Appartement F3 lumineux avec balcon vue ville, finitions modernes.', 'available'),
('F4 Panorama', 'Bloc N°17 AADL', 7, 3, 2, 102, 19800000, 'F4 spacieux avec double exposition et grande loggia.', 'available'),
('F2 Cosy', 'Bloc N°17 AADL', 2, 1, 1, 55, 9800000, 'F2 idéal premier achat, proche commerces et écoles.', 'available'),
('F5 Penthouse', 'Bloc N°17 AADL', 10, 4, 3, 145, 28500000, 'Penthouse au dernier étage avec terrasse privative.', 'available'),
('F3 Confort', 'Bloc N°17 AADL', 5, 2, 1, 78, 15200000, 'F3 traversant avec cuisine équipée et placards intégrés.', 'available'),
('F4 Familial', 'Bloc N°17 AADL', 6, 3, 2, 110, 21000000, 'Grand F4 familial avec cellier et double salon.', 'available');
