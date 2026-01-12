-- Add explicit policy to prevent users from updating their own payments
CREATE POLICY "Users cannot update their own payments"
ON public.payments
FOR UPDATE
TO authenticated
USING (false);

-- Add check to prevent duplicate pending payments
CREATE OR REPLACE FUNCTION public.can_create_payment(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.payments
    WHERE user_id = _user_id
    AND status = 'pending'
    AND created_at > NOW() - INTERVAL '1 hour'
  )
$$;