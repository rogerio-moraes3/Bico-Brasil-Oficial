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

    // In-memory single-flight guard to avoid parallel fetches across multiple hook instances
    let ongoingFetch: Promise<any[] | null> | null = null;

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

            // If another instance already started fetching, wait for it
            if (ongoingFetch && !forceRefresh) {
                const result = await ongoingFetch;
                if (result) setCities(result);
                setLoading(false);
                return;
            }

            // Start a single fetch and share the promise
            ongoingFetch = (async () => {
                const { data, error: fetchError } = await supabase
                    .from('cities')
                    .select('id, name, state')
                    .eq('active', true)
                    .order('name');

                if (fetchError) {
                    throw fetchError;
                }

                const citiesData = data || [];

                // Update cache
                localStorage.setItem(CACHE_KEY, JSON.stringify(citiesData));
                localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());

                return citiesData;
            })();

            const fetched = await ongoingFetch;
            if (fetched) setCities(fetched);

        } catch (err) {
            console.error('Error loading cities:', err);
            setError(err instanceof Error ? err : new Error('Failed to load cities'));

            // Fallback to cached data even if expired
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                setCities(JSON.parse(cached));
            }
        } finally {
            ongoingFetch = null;
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
