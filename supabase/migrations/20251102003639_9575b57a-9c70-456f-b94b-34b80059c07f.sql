-- Final security hardening

-- 1. Remove public access to jobs table (ERROR: Customer Contact exposed)
DROP POLICY IF EXISTS "Public can view jobs" ON public.jobs;

-- Jobs should only be visible to authenticated users
-- Already have "Users can view jobs" policy for authenticated users

-- 2. Strengthen job creation policy to prevent worker assignment abuse
DROP POLICY IF EXISTS "Authenticated users can create jobs" ON public.jobs;

CREATE POLICY "Users can create jobs for themselves"
ON public.jobs
FOR INSERT
TO authenticated
WITH CHECK (
  -- Contractor must be the current user
  contractor_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
  -- Worker can only be assigned if null (initial creation)
  AND worker_id IS NULL
);

-- 3. Add policy for updating jobs (worker assignment)
CREATE POLICY "Job owners can update their jobs"
ON public.jobs
FOR UPDATE
TO authenticated
USING (
  -- Only contractor or assigned worker can update
  contractor_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
  OR worker_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
)
WITH CHECK (
  -- Contractor can update their own jobs
  contractor_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
  OR 
  -- Worker can only accept the job (set their ID as worker_id)
  (
    worker_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    AND worker_id IS NOT NULL
  )
);

-- 4. Strengthen ratings policy to prevent fake reviews
DROP POLICY IF EXISTS "Authenticated users can create ratings" ON public.ratings;

CREATE POLICY "Job participants can create ratings"
ON public.ratings
FOR INSERT
TO authenticated
WITH CHECK (
  -- Must be either contractor or worker of the job
  rating_user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.jobs
    WHERE id = job_id
    AND (
      contractor_id = rating_user_id
      OR worker_id = rating_user_id
    )
  )
);

-- 5. Add comment about webhook_response security
COMMENT ON COLUMN public.payments.webhook_response IS 'Contains sensitive payment gateway data. Should only be accessed by admins or system processes.';

-- 6. Ensure proper policy for job owner updates (fix existing policy)
DROP POLICY IF EXISTS "Job owner can update their job" ON public.jobs;

-- The policy created above replaces this one