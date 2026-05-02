import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { TooltipProvider } from './components/tooltip/tooltip';
import { HelmetData } from './helmet/helmet-data';
import { HelmetProvider } from 'react-helmet-async';
import { SupabaseAuthProvider } from './context/supabase-auth/supabase-auth-provider';

export const App = () => {
    return (
        <HelmetProvider>
            <HelmetData />
            <SupabaseAuthProvider>
                <TooltipProvider>
                    <RouterProvider router={router} />
                </TooltipProvider>
            </SupabaseAuthProvider>
        </HelmetProvider>
    );
};
