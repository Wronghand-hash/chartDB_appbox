import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from '@/components/spinner/spinner';
import { useSupabaseAuth } from './use-supabase-auth';

export const RequireSupabaseAuth: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const { isConfigured, ready, session } = useSupabaseAuth();
    const location = useLocation();

    if (!isConfigured) {
        return children;
    }

    if (!ready) {
        return (
            <div className="flex h-dvh w-dvw items-center justify-center bg-background">
                <Spinner size="large" />
            </div>
        );
    }

    if (!session) {
        return (
            <Navigate to="/login" replace state={{ from: location.pathname }} />
        );
    }

    return children;
};
