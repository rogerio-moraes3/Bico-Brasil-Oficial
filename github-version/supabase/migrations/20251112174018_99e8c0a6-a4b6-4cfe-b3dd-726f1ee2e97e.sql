-- Add verification columns to users table
ALTER TABLE public.users
ADD COLUMN verification_document TEXT,
ADD COLUMN verification_status TEXT DEFAULT 'not_submitted';