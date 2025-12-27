-- Fix: Require authentication for job_contacts INSERT
-- This prevents bots from spamming job contact records

-- Drop the permissive policy that allows unauthenticated access
DROP POLICY IF EXISTS "Anyone can create job contacts" ON public.job_contacts;

-- Create new policy requiring authentication
CREATE POLICY "Authenticated users can create job contacts"
ON public.job_contacts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);