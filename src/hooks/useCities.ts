import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface City {
    id: string;
    name: string;
    state: string;
}

const CACHE_KEY = 'cities_cache';
const CACHE_TIME_KEY = 'cities_cache_time';
const CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * Hook para carregar e cachear cidades ativas do Supabase.
 * Implementa cache em localStorage com TTL de 1 hora.
 * 
 * @returns {Object} - { cities, loading, error, refetch }
 */
export function useCities() {
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadCities = async (forceRefresh = false) => {
        try {
            setLoading(true);
            setError(null);

            // Check cache first (unless force refresh)
            if (!forceRefresh) {
                const cached = localStorage.getItem(CACHE_KEY);
                const cacheTime = localStorage.getItem(CACHE_TIME_KEY);

                if (cached && cacheTime) {
                    const age = Date.now() - parseInt(cacheTime);
                    if (age < CACHE_TTL) {
                        setCities(JSON.parse(cached));
                        setLoading(false);
                        return;
                    }
                }
            }

            // Fetch from Supabase
            const { data, error: fetchError } = await supabase
                .from('cities')
                .select('id, name, state')
                .eq('active', true)
                .order('name');

            if (fetchError) {
                throw fetchError;
            }

            const citiesData = data || [];
            setCities(citiesData);

            // Update cache
            localStorage.setItem(CACHE_KEY, JSON.stringify(citiesData));
            localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());

        } catch (err) {
            console.error('Error loading cities:', err);
            setError(err instanceof Error ? err : new Error('Failed to load cities'));

            // Fallback to cached data even if expired
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                setCities(JSON.parse(cached));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCities();
    }, []);

    return {
        cities,
        loading,
        error,
        refetch: () => loadCities(true)
    };
}
