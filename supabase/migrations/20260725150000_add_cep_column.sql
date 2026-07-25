-- Adds an optional CEP column to support ViaCEP autofill in CompleteProfile.tsx.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cep text;
