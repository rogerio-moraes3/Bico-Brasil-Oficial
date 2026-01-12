-- ==========================================
-- INSPEÇÃO DE ESTRUTURA: USER_ROLES
-- ==========================================

SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'user_roles'
ORDER BY 
    ordinal_position;
