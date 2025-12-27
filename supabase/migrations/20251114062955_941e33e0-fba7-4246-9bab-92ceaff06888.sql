-- Force type regeneration for phone_type field
COMMENT ON COLUMN public.users.phone_type IS 'Tipo de contato telefônico: whatsapp_only, whatsapp_and_call, call_only';