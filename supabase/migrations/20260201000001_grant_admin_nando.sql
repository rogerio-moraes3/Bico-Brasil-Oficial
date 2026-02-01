-- Migration: Grant admin role to nando_petro@hotmail.com
-- Idempotent: safe to run multiple times
-- Created: 2026-02-01

-- Grant admin role to nando_petro@hotmail.com
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Find user by email in auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'nando_petro@hotmail.com';

  -- Only proceed if user exists
  IF v_user_id IS NOT NULL THEN
    -- Update users table to set admin role
    UPDATE public.users
    SET role = 'admin',
        updated_at = now()
    WHERE auth_id = v_user_id
      AND (role IS NULL OR role != 'admin');
    
    -- Log if update happened
    IF FOUND THEN
      RAISE NOTICE 'Admin role granted to nando_petro@hotmail.com (user_id: %)', v_user_id;
    ELSE
      RAISE NOTICE 'User nando_petro@hotmail.com already has admin role';
    END IF;
  ELSE
    RAISE NOTICE 'User nando_petro@hotmail.com not found in auth.users - will be granted admin on first login';
  END IF;
END $$;

-- Ensure 23rogeriomoraes@gmail.com also has admin (idempotent)
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = '23rogeriomoraes@gmail.com';

  IF v_user_id IS NOT NULL THEN
    UPDATE public.users
    SET role = 'admin',
        updated_at = now()
    WHERE auth_id = v_user_id
      AND (role IS NULL OR role != 'admin');
    
    IF FOUND THEN
      RAISE NOTICE 'Admin role confirmed for 23rogeriomoraes@gmail.com (user_id: %)', v_user_id;
    END IF;
  END IF;
END $$;
