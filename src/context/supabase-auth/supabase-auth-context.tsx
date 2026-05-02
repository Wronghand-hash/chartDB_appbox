import { createContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';

export type SignUpResult =
    | { status: 'signed_in' }
    | { status: 'pending_email_confirmation' };

export interface SupabaseAuthContextValue {
    ready: boolean;
    isConfigured: boolean;
    session: Session | null;
    user: User | null;
    orgId: string | null;
    signInWithPassword: (email: string, password: string) => Promise<void>;
    signUpWithPassword: (
        email: string,
        password: string
    ) => Promise<SignUpResult>;
    signOut: () => Promise<void>;
}

export const supabaseAuthInitialValue: SupabaseAuthContextValue = {
    ready: false,
    isConfigured: false,
    session: null,
    user: null,
    orgId: null,
    signInWithPassword: async (email: string, password: string) => {
        void email;
        void password;
    },
    signUpWithPassword: async (
        email: string,
        password: string
    ): Promise<SignUpResult> => {
        void email;
        void password;
        return { status: 'signed_in' };
    },
    signOut: async () => {},
};

export const supabaseAuthContext = createContext<SupabaseAuthContextValue>(
    supabaseAuthInitialValue
);
