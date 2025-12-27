-- ============================================
-- CORREÇÃO CRÍTICA: Exclusão de anúncios + Novas cidades
-- ============================================

-- 1. ADICIONAR POLÍTICA DELETE PARA JOB_POSTINGS
CREATE POLICY "Users can delete their own job postings"
ON job_postings FOR DELETE
USING (user_id IN (
  SELECT id FROM users WHERE auth_id = auth.uid()
));

-- 2. ADICIONAR NOVAS CIDADES
INSERT INTO cities (name, state, active) VALUES 
  ('Campo Grande', 'MS', true),
  ('Maringá', 'PR', true),
  ('Londrina', 'PR', true);