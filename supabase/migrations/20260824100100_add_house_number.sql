-- Complementa 20260824100000_add_phone_verification.sql: number/número da
-- residência é exigido pelo item 11 (cadastro obrigatoriamente completo)
-- junto com CEP, mas nunca existiu coluna pra isso — address só guarda o
-- logradouro que o CompleteProfile.tsx preenche via ViaCEP.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS house_number text;
