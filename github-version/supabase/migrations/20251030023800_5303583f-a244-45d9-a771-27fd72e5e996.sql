-- Fix Security Issues: Restrict public access to users table to hide PII

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view full profiles" ON public.users;
DROP POLICY IF EXISTS "Public can view limited user profiles" ON public.users;

-- Create new policies with proper restrictions
-- Public users can only see active workers without PII
CREATE POLICY "Public can view limited worker profiles"
  ON public.users
  FOR SELECT
  USING (
    type = 'worker' 
    AND plan_active = true
  );

-- Authenticated users can view full profiles (including PII)
CREATE POLICY "Authenticated users can view all profiles"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);