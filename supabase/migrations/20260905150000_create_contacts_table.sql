-- /contact ("Central de Suporte", linkado no rodape do site inteiro) sempre
-- deu erro visivel ao enviar ("Erro ao enviar mensagem") — Contact.tsx faz
-- .from('contacts').insert(...), mas essa tabela nunca existiu no banco
-- (confirmado via information_schema, nao so pelas migrations antigas que
-- tambem a criavam mas nunca chegaram a rodar de fato neste projeto).
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Formulario e publico, sem login — qualquer um (anon ou logado) pode enviar.
CREATE POLICY "Anyone can submit a contact message"
ON public.contacts
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- So admin le as mensagens (mesmo padrao de audit_log/registrations).
CREATE POLICY "Admins can view contact messages"
ON public.contacts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
