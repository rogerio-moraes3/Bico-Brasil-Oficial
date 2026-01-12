-- Create secure RPC function to fetch worker contact information
-- Only accessible to authenticated users with premium access or tester status
CREATE OR REPLACE FUNCTION public.get_worker_contact(worker_id uuid)
RETURNS TABLE (
  phone text,
  email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if requesting user has access (premium or tester)
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE auth_id = auth.uid() 
    AND (
      is_tester = true 
      OR (plan_active = true AND subscription_end > NOW())
    )
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Premium access required to view contact information';
  END IF;
  
  -- Return contact information for active workers only
  RETURN QUERY
  SELECT u.phone, u.email
  FROM users u
  WHERE u.id = worker_id
  AND u.type = 'worker'
  AND u.plan_active = true;
END;
$$;