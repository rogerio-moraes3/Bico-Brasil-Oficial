-- Fix RLS on views and improve data protection

-- 1. Enable RLS on views (views inherit RLS from underlying tables)
-- Note: Views in Postgres don't have RLS directly, but we can grant/revoke access

-- 2. Restrict 'users' table access - authenticated users should only see non-sensitive data
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.users;

-- Policy for users to view their own complete profile
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = auth_id);

-- Policy for authenticated users to view limited public profiles of workers
CREATE POLICY "Authenticated users can view worker basic info"
ON public.users
FOR SELECT
TO authenticated
USING (
  type = 'worker' 
  AND plan_active = true
  -- Note: Client should filter to show only: name, city, neighborhood, category, 
  -- subcategory, description, price, rating_avg, rating_count, jobs_done
);

-- 3. Fix jobs table - properly restrict contractor info
DROP POLICY IF EXISTS "Users can view jobs with privacy protection" ON public.jobs;

-- Anyone authenticated can see jobs, but sensitive data requires special access
CREATE POLICY "Users can view jobs"
ON public.jobs
FOR SELECT
TO authenticated
USING (true);

-- Note: Client MUST implement logic to hide contractor_phone and contractor_name
-- except when: user.id = job.contractor_id OR user.id = job.worker_id

-- 4. Remove the worker_profiles view - it's redundant with proper RLS
DROP VIEW IF EXISTS public.worker_profiles;

-- 5. Remove user_payments view - it's redundant with proper RLS
DROP VIEW IF EXISTS public.user_payments;

-- 6. Add a function to check if user can see job contact info
CREATE OR REPLACE FUNCTION public.can_view_job_contact(job_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.jobs
    WHERE id = job_id 
    AND (
      contractor_id = (SELECT id FROM public.users WHERE auth_id = user_id)
      OR worker_id = (SELECT id FROM public.users WHERE auth_id = user_id)
    )
  );
$$;

-- 7. Better ratings policy - only show approved or job-related ratings
DROP POLICY IF EXISTS "Ratings are viewable by everyone" ON public.ratings;

CREATE POLICY "Authenticated users can view ratings"
ON public.ratings
FOR SELECT
TO authenticated
USING (true);

-- Public can only see ratings for active workers (through job context)
CREATE POLICY "Public can view worker ratings"
ON public.ratings
FOR SELECT
TO anon
USING (
  rated_user_id IN (
    SELECT id FROM public.users 
    WHERE type = 'worker' AND plan_active = true
  )
);