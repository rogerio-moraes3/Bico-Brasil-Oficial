-- Aditivo: permite reaproveitar o QR Code de um pedido de destaque pendente
-- muito recente em vez de criar um pedido/cobrança duplicada em duplo-clique
-- (mesmo padrão já usado em payments.qr_code/qr_code_base64).
ALTER TABLE public.destaque_orders ADD COLUMN IF NOT EXISTS qr_code text;
ALTER TABLE public.destaque_orders ADD COLUMN IF NOT EXISTS qr_code_base64 text;
