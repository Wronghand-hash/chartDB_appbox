import React from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { Button } from '@/components/button/button';

function isLikelyStaleChunkError(message: string): boolean {
    const m = message.toLowerCase();
    return (
        m.includes('dynamically imported module') ||
        m.includes('importing a module script failed') ||
        m.includes('failed to fetch') ||
        m.includes('error loading') ||
        m.includes('loading chunk') ||
        m.includes('loading css chunk')
    );
}

export const RouteLoadError: React.FC = () => {
    const error = useRouteError();

    const message =
        error instanceof Error
            ? error.message
            : isRouteErrorResponse(error)
              ? error.statusText || String(error.data)
              : typeof error === 'string'
                ? error
                : 'Unknown error';

    const staleChunk = isLikelyStaleChunkError(message);

    return (
        <section className="flex min-h-dvh items-center justify-center bg-background p-6">
            <div className="mx-auto max-w-md text-center">
                <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
                    {staleChunk ? 'Update available' : 'Something went wrong'}
                </h1>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    {staleChunk
                        ? 'This page is out of date after a new deploy, or the script failed to load. Reload to fetch the latest version.'
                        : message}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button
                        type="button"
                        onClick={() => window.location.reload()}
                    >
                        Reload page
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                            window.location.href = '/';
                        }}
                    >
                        Go home
                    </Button>
                </div>
            </div>
        </section>
    );
};
