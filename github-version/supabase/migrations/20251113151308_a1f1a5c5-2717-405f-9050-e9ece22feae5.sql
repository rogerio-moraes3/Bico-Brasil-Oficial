-- Criar tabela para pedidos de anúncio destaque
CREATE TABLE IF NOT EXISTS public.destaque_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  days INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired')),
  external_reference TEXT,
  preference_id TEXT,
  payment_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar campo destaque_expires_at na tabela users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS destaque_expires_at TIMESTAMP WITH TIME ZONE;

-- Habilitar RLS
ALTER TABLE public.destaque_orders ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver seus próprios pedidos" 
ON public.destaque_orders 
FOR SELECT 
USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Usuários podem criar seus próprios pedidos" 
ON public.destaque_orders 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_destaque_orders_user_id ON public.destaque_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_destaque_orders_status ON public.destaque_orders(status);
CREATE INDEX IF NOT EXISTS idx_destaque_orders_external_reference ON public.destaque_orders(external_reference);
CREATE INDEX IF NOT EXISTS idx_users_destaque_expires ON public.users(destaque_expires_at) WHERE destaque_expires_at IS NOT NULL;

-- Trigger para updated_at
CREATE TRIGGER update_destaque_orders_updated_at
BEFORE UPDATE ON public.destaque_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
