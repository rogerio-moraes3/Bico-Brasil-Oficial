-- Create cities table
CREATE TABLE IF NOT EXISTS public.cities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  state text NOT NULL DEFAULT 'SP',
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Cities are viewable by everyone
CREATE POLICY "Cities are viewable by everyone"
ON public.cities
FOR SELECT
USING (active = true);

-- Insert initial cities
INSERT INTO public.cities (name, state, active) VALUES
  ('Presidente Prudente', 'SP', true),
  ('Caçapava', 'SP', true),
  ('São José dos Campos', 'SP', true),
  ('Paraíbuna', 'SP', true),
  ('Jacareí', 'SP', true)
ON CONFLICT DO NOTHING;

-- Update users table to use city_id instead of text
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES public.cities(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_city_id ON public.users(city_id);

-- Create push_subscriptions table for web push notifications
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own push subscriptions
CREATE POLICY "Users can manage their own push subscriptions"
ON public.push_subscriptions
FOR ALL
USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));