-- Criar bucket avatars público
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
);

-- Policy: usuários autenticados podem fazer upload
CREATE POLICY "avatars_allow_insert_auth"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Policy: todos podem ver avatares (bucket público)
CREATE POLICY "avatars_allow_select_public"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy: usuários podem atualizar suas próprias fotos
CREATE POLICY "avatars_allow_update_owner"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: usuários podem deletar suas próprias fotos
CREATE POLICY "avatars_allow_delete_owner"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);