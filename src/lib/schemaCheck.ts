import { supabase } from "@/integrations/supabase/client";

const CACHE_TTL = 1000 * 60 * 60 * 24; // 24h

interface CacheEntry {
    exists: boolean;
    ts: number;
}

export async function hasColumn(table: string, column: string): Promise<boolean> {
    try {
        const key = `schema_check_${table}_${column}`;
        const raw = localStorage.getItem(key);
        if (raw) {
            try {
                const parsed: CacheEntry = JSON.parse(raw);
                if (Date.now() - parsed.ts < CACHE_TTL) {
                    return parsed.exists;
                }
            } catch (e) {
                // ignore
            }
        }

        // Try a simple head-select to check column existence
        const { error } = await supabase.from(table).select(column, { head: true, count: 'exact' }).limit(1);

        const exists = !error;
        try {
            localStorage.setItem(key, JSON.stringify({ exists, ts: Date.now() }));
        } catch (e) {
            // ignore storage errors
        }

        return exists;
    } catch (err) {
        console.warn('[schemaCheck] Error checking column', table, column, err);
        return true; // be permissive on failure
    }
}
