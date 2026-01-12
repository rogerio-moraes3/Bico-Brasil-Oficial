-- Corrigir search_path da função decrement_view_credits
CREATE OR REPLACE FUNCTION decrement_view_credits(user_auth_id UUID)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE users 
  SET view_credits = GREATEST(0, COALESCE(view_credits, 3) - 1)
  WHERE auth_id = user_auth_id;
END;
$$;