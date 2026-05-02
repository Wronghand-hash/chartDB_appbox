import React, { useCallback, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/button/button';
import { Input } from '@/components/input/input';
import { useSupabaseAuth } from '@/context/supabase-auth/use-supabase-auth';

export const LoginPage: React.FC = () => {
    const { isConfigured, session, signInWithPassword, signUpWithPassword } =
        useSupabaseAuth();
    const location = useLocation();
    const from =
        (location.state as { from?: string } | null)?.from &&
        typeof (location.state as { from?: string }).from === 'string'
            ? (location.state as { from: string }).from
            : '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const onSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError(null);
            setInfo(null);
            setBusy(true);
            try {
                if (mode === 'sign-in') {
                    await signInWithPassword(email.trim(), password);
                } else {
                    const result = await signUpWithPassword(
                        email.trim(),
                        password
                    );
                    if (result.status === 'pending_email_confirmation') {
                        setInfo(
                            'Confirm the link sent to your email, then sign in. For a team-only server you can turn off “Confirm email” in Supabase Auth so signup works immediately.'
                        );
                    }
                }
            } catch (err: unknown) {
                const message =
                    err instanceof Error ? err.message : 'Authentication failed';
                setError(message);
            } finally {
                setBusy(false);
            }
        },
        [email, password, mode, signInWithPassword, signUpWithPassword]
    );

    if (!isConfigured) {
        return <Navigate to="/" replace />;
    }

    if (session) {
        return <Navigate to={from} replace />;
    }

    return (
        <>
            <Helmet>
                <title>ChartDB — Sign in</title>
            </Helmet>
            <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background p-6">
                <div className="w-full max-w-sm space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm">
                    <div className="space-y-1 text-center">
                        <h1 className="text-xl font-semibold">ChartDB</h1>
                        <p className="text-sm text-muted-foreground">
                            {mode === 'sign-in'
                                ? 'Sign in — everyone shares the same team diagrams.'
                                : 'Create an account — you are added to the team automatically.'}
                        </p>
                    </div>
                    <form className="space-y-4" onSubmit={onSubmit}>
                        <div className="space-y-2">
                            <label
                                className="text-sm font-medium"
                                htmlFor="chartdb-login-email"
                            >
                                Email
                            </label>
                            <Input
                                id="chartdb-login-email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label
                                className="text-sm font-medium"
                                htmlFor="chartdb-login-password"
                            >
                                Password
                            </label>
                            <Input
                                id="chartdb-login-password"
                                type="password"
                                autoComplete={
                                    mode === 'sign-in'
                                        ? 'current-password'
                                        : 'new-password'
                                }
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        {error ? (
                            <p className="text-sm text-destructive">{error}</p>
                        ) : null}
                        {info ? (
                            <p className="text-sm text-muted-foreground">{info}</p>
                        ) : null}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={busy}
                        >
                            {busy
                                ? 'Please wait…'
                                : mode === 'sign-in'
                                  ? 'Sign in'
                                  : 'Sign up'}
                        </Button>
                    </form>
                    <div className="flex justify-between text-sm">
                        <button
                            type="button"
                            className="text-primary underline-offset-4 hover:underline"
                            onClick={() => {
                                setMode(
                                    mode === 'sign-in' ? 'sign-up' : 'sign-in'
                                );
                                setError(null);
                                setInfo(null);
                            }}
                        >
                            {mode === 'sign-in'
                                ? 'Need an account? Sign up'
                                : 'Have an account? Sign in'}
                        </button>
                        <Link
                            to="/"
                            className="text-muted-foreground underline-offset-4 hover:underline"
                        >
                            Back
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};
