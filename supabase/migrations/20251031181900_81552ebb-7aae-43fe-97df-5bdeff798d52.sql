-- Restrict jobs table to authenticated users only
-- This prevents public access to contractor personal information

DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON public.jobs;

CREATE POLICY "Authenticated users can view jobs"
ON public.jobs
FOR SELECT
TO authenticated
USING (true);