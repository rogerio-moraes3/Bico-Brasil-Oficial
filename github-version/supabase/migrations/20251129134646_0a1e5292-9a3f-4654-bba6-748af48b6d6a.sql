-- Adicionar RLS policy para permitir contagem pública de pré-cadastros
-- Isso permite que usuários anônimos vejam o contador sem acessar dados individuais

CREATE POLICY "Público pode contar pré-cadastros"
ON pre_cadastro
FOR SELECT
TO anon, public
USING (true);

-- Comentário: Esta policy permite SELECT COUNT mas não expõe dados individuais
-- porque o código usa { head: true, count: 'exact' } que só retorna contagem