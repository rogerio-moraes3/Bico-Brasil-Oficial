-- ============================================
-- P0: CRITICAL SECURITY FIXES
-- ============================================

-- 1. DROP overly permissive SELECT policies on users table
DROP POLICY IF EXISTS "Anon can view basic worker info" ON public.users;
DROP POLICY IF EXISTS "Authenticated can view basic worker info for search" ON public.users;

-- 2. Keep only owner-based and admin-based SELECT policies
-- (Users can view own full profile already exists)
-- (Users can view their own profile already exists)

-- 3. Ensure the public_worker_profiles view only has safe columns (already exists but verify)
-- Drop and recreate to ensure it's correct
DROP VIEW IF EXISTS public.public_worker_profiles;

CREATE VIEW public.public_worker_profiles AS
SELECT 
  id,
  name,
  type,
  city,
  city_id,
  neighborhood,
  state,
  category,
  subcategory,
  description,
  availability,
  price,
  profile_photo,
  verified,
  rating_avg,
  rating_count,
  jobs_done,
  plan_active,
  subscription_end,
  destaque_expires_at,
  created_at
FROM public.users
WHERE type IN ('worker', 'contractor');

-- Grant SELECT on the safe view to public
GRANT SELECT ON public.public_worker_profiles TO anon;
GRANT SELECT ON public.public_worker_profiles TO authenticated;

-- 4. Protect colaboradores_autorizados - remove public SELECT
DROP POLICY IF EXISTS "Público pode verificar whitelist" ON public.colaboradores_autorizados;

-- Create function to check authorization without exposing emails
CREATE OR REPLACE FUNCTION public.check_email_authorized(check_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM colaboradores_autorizados
    WHERE LOWER(email) = LOWER(check_email)
  );
$$;

-- Only allow admins and the email owner to see the table
CREATE POLICY "Only authorized users can verify their own email"
ON public.colaboradores_autorizados
FOR SELECT
USING (
  LOWER(email) = LOWER(auth.email())
  OR has_role(auth.uid(), 'admin')
);

-- 5. Create secure RPC for contact access with usage tracking
CREATE OR REPLACE FUNCTION public.get_worker_contact(worker_id uuid)
RETURNS TABLE(phone text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if requesting user has access via:
  -- 1. Premium/tester status
  -- 2. Previously unlocked this worker via contact_unlocks
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE auth_id = auth.uid() 
    AND (
      is_tester = true 
      OR (plan_active = true AND subscription_end > NOW())
    )
  ) AND NOT EXISTS (
    SELECT 1 FROM contact_unlocks
    WHERE user_id = auth.uid() AND contact_unlocks.worker_id = get_worker_contact.worker_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Premium access or contact unlock required';
  END IF;
  
  -- Return contact information for workers
  RETURN QUERY
  SELECT u.phone, u.email
  FROM users u
  WHERE u.id = get_worker_contact.worker_id
  AND u.type = 'worker';
END;
$$;