import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock supabase client: control the select result via global.__supabaseSelectResult
vi.mock('@/integrations/supabase/client', () => {
    return {
        supabase: {
            from: (_table: string) => ({
                select: (_col: any, _opts?: any) => ({
                    limit: (_n: number) => Promise.resolve((global as any).__supabaseSelectResult)
                })
            })
        }
    };
});

import { hasColumn } from '../schemaCheck';

beforeEach(() => {
    // Reset the stubbed response and localStorage mocks
    (global as any).__supabaseSelectResult = { error: null };
    (global as any).localStorage = {
        getItem: vi.fn(() => null),
        setItem: vi.fn(() => null)
    } as any;
});

describe('schemaCheck.hasColumn', () => {
    it('returns true when supabase.select succeeds', async () => {
        (global as any).__supabaseSelectResult = { error: null };
        const res = await hasColumn('worker_services', 'availability');
        expect(res).toBe(true);
    });

    it('returns false when supabase.select returns an error', async () => {
        (global as any).__supabaseSelectResult = { error: new Error('column "availability" does not exist') };
        const res = await hasColumn('worker_services', 'availability');
        expect(res).toBe(false);
    });
});
