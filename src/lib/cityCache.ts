// ========================================
// CACHE DE CIDADES - OTIMIZAÇÃO (LEGACY)
// ========================================
// NOTE: This module is legacy and kept for backward compatibility.
// Prefer using the `useCities` hook which implements a consistent
// caching strategy (localStorage TTL 1h) and a single-flight guard.
// Do not introduce new call sites to this module.

const CACHE_KEY = 'bico_cities_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas (legacy)

interface CachedData<T> {
    data: T;
    timestamp: number;
}

/**
 * Busca cidades com cache inteligente
 * - Se tem cache válido (< 24h), retorna do cache
 * - Se não tem ou expirou, busca do banco e atualiza cache
 * 
 * IMPORTANTE: Não altera nenhum comportamento existente!
 * Apenas adiciona uma camada de cache para melhorar performance.
 */
export const getCitiesWithCache = async () => {
    try {
        // Tentar buscar do cache
        const cached = localStorage.getItem(CACHE_KEY);

        if (cached) {
            const { data, timestamp }: CachedData<any[]> = JSON.parse(cached);

            // Verificar se cache ainda é válido
            if (Date.now() - timestamp < CACHE_DURATION) {
                return data;
            }
        }

        // Cache expirado ou não existe, buscar do banco
        const { createClient } = await import('@/integrations/supabase/client');
        const supabase = createClient();

        const { data, error } = await supabase
            .from('cities')
            .select('*')
            .eq('active', true)
            .order('name');

        if (error) throw error;

        // Salvar no cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
        }));

        return data;

    } catch (error) {
        console.error('Erro ao buscar cidades:', error);
        // Em caso de erro, retornar array vazio (fallback seguro)
        return [];
    }
};

/**
 * Limpa o cache de cidades
 * Útil quando admin adiciona/remove cidades
 */
export const clearCitiesCache = () => {
    localStorage.removeItem(CACHE_KEY);

};

/**
 * Força atualização do cache
 * Busca do banco e atualiza cache imediatamente
 */
export const refreshCitiesCache = async () => {
    clearCitiesCache();
    return await getCitiesWithCache();
};
