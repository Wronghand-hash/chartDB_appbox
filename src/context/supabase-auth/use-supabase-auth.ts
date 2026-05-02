import { useContext } from 'react';
import { supabaseAuthContext } from './supabase-auth-context';

export const useSupabaseAuth = () => useContext(supabaseAuthContext);
