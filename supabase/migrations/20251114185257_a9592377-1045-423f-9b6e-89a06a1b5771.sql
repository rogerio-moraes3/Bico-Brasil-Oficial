-- Função para auto-expirar pagamentos pendentes com mais de 15 minutos
CREATE OR REPLACE FUNCTION expire_old_pending_payments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE payments
  SET status = 'failed'
  WHERE status = 'pending'
    AND created_at < NOW() - INTERVAL '15 minutes';
END;
$$;