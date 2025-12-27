-- Criar tabela email_log para auditoria de emails
CREATE TABLE IF NOT EXISTS public.email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  tipo text NOT NULL,
  status text DEFAULT 'pending',
  payload jsonb,
  error text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

-- Política para admins visualizarem logs
CREATE POLICY "Admins can view email logs"
  ON public.email_log
  FOR SELECT
  USING (is_colaborador_autorizado(auth.email()));

-- Política para inserção via service role (edge functions)
CREATE POLICY "Service role can insert email logs"
  ON public.email_log
  FOR INSERT
  WITH CHECK (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_email_log_email ON public.email_log(email);
CREATE INDEX IF NOT EXISTS idx_email_log_tipo ON public.email_log(tipo);
CREATE INDEX IF NOT EXISTS idx_email_log_status ON public.email_log(status);
CREATE INDEX IF NOT EXISTS idx_email_log_created_at ON public.email_log(created_at DESC);