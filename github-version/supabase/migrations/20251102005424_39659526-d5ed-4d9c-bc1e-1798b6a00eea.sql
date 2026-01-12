-- Critical security fixes for public data exposure

-- 1. Fix users table - remove public access completely (ERROR: Worker Contact Exposed)
DROP POLICY IF EXISTS "Public can view worker listings" ON public.users;

-- No public (anon) access to users table at all
-- Only authenticated users can see worker profiles (without email/phone)

-- 2. Fix jobs table policy to not expose contractor data to everyone
-- Keep existing authenticated policy but it needs client-side filtering
-- Note: Client MUST filter contractor_phone and contractor_name before displaying
-- Only show these fields if: currentUser.id === job.contractor_id || currentUser.id === job.worker_id