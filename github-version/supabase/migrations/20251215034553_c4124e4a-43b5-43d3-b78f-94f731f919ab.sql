-- 1. Tornar campo phone nullable e adicionar default
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE users ALTER COLUMN phone SET DEFAULT '';

-- 2. Garantir que name também tenha default seguro
ALTER TABLE users ALTER COLUMN name SET DEFAULT '';

-- 3. Garantir que city tenha default
ALTER TABLE users ALTER COLUMN city SET DEFAULT 'Presidente Prudente';