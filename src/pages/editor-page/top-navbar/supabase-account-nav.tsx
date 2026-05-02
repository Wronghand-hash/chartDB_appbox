import React, { useCallback } from 'react';
import { Button } from '@/components/button/button';
import { useSupabaseAuth } from '@/context/supabase-auth/use-supabase-auth';
import { LogOut } from 'lucide-react';

export const SupabaseAccountNav: React.FC = () => {
    const { isConfigured, user, signOut } = useSupabaseAuth();

    const onSignOut = useCallback(async () => {
        await signOut();
        window.location.assign('/login');
    }, [signOut]);

    if (!isConfigured || !user?.email) {
        return null;
    }

    return (
        <div className="flex max-w-[10rem] items-center gap-1">
            <span
                className="truncate text-xs text-muted-foreground"
                title={user.email}
            >
                {user.email}
            </span>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 shrink-0 px-2"
                onClick={() => void onSignOut()}
                title="Sign out"
            >
                <LogOut className="size-4" />
            </Button>
        </div>
    );
};
