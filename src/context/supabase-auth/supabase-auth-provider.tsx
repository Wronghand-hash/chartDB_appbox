import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
    getSupabaseBrowserClient,
    isSupabaseConfigured,
} from '@/lib/supabase/client';
import {
    supabaseAuthContext,
    type SupabaseAuthContextValue,
} from './supabase-auth-context';

export const SupabaseAuthProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const [ready, setReady] = useState(!isSupabaseConfigured());
    const [session, setSession] = useState<Session | null>(null);
    const [orgId, setOrgId] = useState<string | null>(null);

    const bootstrapOrg = useCallback(async (activeSession: Session | null) => {
        const supabase = getSupabaseBrowserClient();
        if (!supabase || !activeSession?.user) {
            setOrgId(null);
            return;
        }
        const { data, error } = await supabase.rpc('chartdb_ensure_default_org');
        if (error) {
            console.error('chartdb_ensure_default_org', error);
            setOrgId(null);
            return;
        }
        setOrgId(typeof data === 'string' ? data : null);
    }, []);

    useEffect(() => {
        if (!isSupabaseConfigured()) {
            setReady(true);
            return;
        }
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
            setReady(true);
            return;
        }

        let cancelled = false;

        void supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (cancelled) {
                return;
            }
            setSession(s);
            void bootstrapOrg(s).finally(() => {
                if (!cancelled) {
                    setReady(true);
                }
            });
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, s) => {
            setSession(s);
            void bootstrapOrg(s);
        });

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, [bootstrapOrg]);

    const signInWithPassword = useCallback<
        SupabaseAuthContextValue['signInWithPassword']
    >(async (email, password) => {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
            throw new Error('Supabase is not configured');
        }
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            throw error;
        }
    }, []);

    const signUpWithPassword = useCallback<
        SupabaseAuthContextValue['signUpWithPassword']
    >(async (email, password) => {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
            throw new Error('Supabase is not configured');
        }
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            throw error;
        }
        if (data.session) {
            return { status: 'signed_in' as const };
        }
        return { status: 'pending_email_confirmation' as const };
    }, []);

    const signOut = useCallback(async () => {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
            return;
        }
        await supabase.auth.signOut();
        setOrgId(null);
    }, []);

    const value = useMemo<SupabaseAuthContextValue>(
        () => ({
            ready,
            isConfigured: isSupabaseConfigured(),
            session,
            user: session?.user ?? null,
            orgId,
            signInWithPassword,
            signUpWithPassword,
            signOut,
        }),
        [
            ready,
            session,
            orgId,
            signInWithPassword,
            signUpWithPassword,
            signOut,
        ]
    );

    return (
        <supabaseAuthContext.Provider value={value}>
            {children}
        </supabaseAuthContext.Provider>
    );
};
