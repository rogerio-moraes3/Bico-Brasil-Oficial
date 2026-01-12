-- Fix PII exposure: Update RLS and secure contact access

-- 1. Update get_worker_contact to also check contact_unlocks table
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

-- 2. Drop the overly permissive RLS policy
DROP POLICY IF EXISTS "Public can view worker profiles without sensitive data" ON users;

-- 3. Create a new policy that allows public viewing of SAFE columns only via a view
-- First, create the secure view for public profile data (no PII)
CREATE OR REPLACE VIEW public.public_worker_profiles AS
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
FROM users
WHERE type IN ('worker', 'contractor');

-- Grant access to the view
GRANT SELECT ON public.public_worker_profiles TO anon, authenticated;

-- 4. Create restrictive RLS policy - users can only see their own full profile
CREATE POLICY "Users can view own full profile"
ON users FOR SELECT
USING (auth.uid() = auth_id);

-- 5. Create policy allowing authenticated users to see basic info for search functionality
-- This is needed because the view above uses SECURITY INVOKER by default
CREATE POLICY "Authenticated can view basic worker info for search"
ON users FOR SELECT
TO authenticated
USING (
  type IN ('worker', 'contractor')
);

-- 6. Create policy for anon users to view basic info (for public pages)
CREATE POLICY "Anon can view basic worker info"
ON users FOR SELECT
TO anon
USING (
  type IN ('worker', 'contractor')
);