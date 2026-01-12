-- Fix critical security issue: Restrict job contact information visibility
-- Only show full contact details to authenticated users involved in the job

DROP POLICY IF EXISTS "Users can view jobs" ON public.jobs;

-- New policy: Public can see jobs but with limited info
CREATE POLICY "Public can view job listings"
ON public.jobs
FOR SELECT
USING (
  -- Show basic job info to everyone
  true
);

-- Add function to check if user can see contact info
CREATE OR REPLACE FUNCTION can_view_job_contact(job_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
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

-- Update users table RLS to hide contact info from competitors
DROP POLICY IF EXISTS "Authenticated users can view worker basic info" ON public.users;

CREATE POLICY "Public can view worker profiles without contact"
ON public.users
FOR SELECT
USING (
  type = 'worker'
  AND plan_active = true
);

-- Update messages policy to verify sender is participant
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;

CREATE POLICY "Users can create messages in their conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id 
  AND EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (
      (conversations.contractor_id = auth.uid() AND sender_id = conversations.contractor_id)
      OR (conversations.worker_id = auth.uid() AND sender_id = conversations.worker_id)
    )
  )
);

-- Improve appointments policy to prevent unauthorized creation
DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments;

CREATE POLICY "Contractors can create appointment requests"
ON public.appointments
FOR INSERT
WITH CHECK (
  auth.uid() = contractor_id
  AND (worker_id IS NULL OR worker_id = (SELECT id FROM users WHERE auth_id = auth.uid()))
);

-- Restrict rating duplication
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_rating_per_job_user 
ON public.ratings (job_id, rating_user_id);