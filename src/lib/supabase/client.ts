import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
    return Boolean(
        import.meta.env.VITE_SUPABASE_URL &&
            import.meta.env.VITE_SUPABASE_ANON_KEY
    );
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
    if (!isSupabaseConfigured()) {
        return null;
    }
    if (!browserClient) {
        const url = import.meta.env.VITE_SUPABASE_URL as string;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
        browserClient = createClient(
            url,
            anonKey,
            {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                },
            }
        );
    }
    return browserClient;
}
