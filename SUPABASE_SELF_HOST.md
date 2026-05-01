# Supabase (Docker) for this ChartDB fork

Diagrams are stored in **Postgres** with **RLS**. Everyone on the instance shares one **Team** org: after **sign up or sign in**, the app calls `chartdb_ensure_default_org()` and adds the user to that org automatically. No SQL, invite codes, or manual membership steps.

## 1. Run Supabase locally (Docker)

This repo includes `supabase/config.toml` with **`[storage] enabled = false`** (ChartDB only needs Postgres + Auth) and **`[analytics] enabled = false`** to reduce Windows/Docker friction. If you change that, you may hit `supabase_storage_*` unhealthy; see [Supabase Windows docs](https://supabase.com/docs/guides/local-development/cli/getting-started?queryGroups=platform&platform=windows).

Install the [Supabase CLI](https://supabase.com/docs/guides/cli), or use:

```bash
npm run supabase:stop
npm run supabase:start
```

### `postgres-meta` unhealthy (especially with two local stacks)

The failing container is **`postgres-meta`** (pg meta): Supabase Studio’s sidecar for browsing SQL. It often fails Docker **health checks** on Windows and when **two full stacks** run at once (RAM/CPU and flaky health probes—not usually a port clash with your other stack, since API/DB ports are already offset to `553xx` in `config.toml`).

**This ChartDB app does not need `postgres-meta`**: sign-in and diagram sync use **Auth + Postgres + PostgREST** only. The default script **`npm run supabase:start`** runs `supabase start -x postgres-meta` so the stack can come up reliably. Studio may have reduced SQL-inspection features without it.

If you still need every service: `npm run supabase:start:full`, or as a last resort `npx supabase start --ignore-health-check` (see [CLI `supabase start`](https://supabase.com/docs/reference/cli/supabase-start)).

Give Docker Desktop enough **memory** (e.g. 8GB+) when running **two** Supabase projects.

Apply migrations (under `supabase/migrations/`):

```bash
npx supabase db reset
```

Copy **Project URL** and **anon key** from `npx supabase status` into `.env`:

```env
# Must match [api].port in supabase/config.toml (this fork uses 55321 to avoid clashing with another local Supabase on 54321).
VITE_SUPABASE_URL=http://127.0.0.1:55321
VITE_SUPABASE_ANON_KEY=<anon key from supabase status>
```

## 2. Self-hosted Supabase on your own server

Follow [Self-Hosting with Docker](https://supabase.com/docs/guides/self-hosting/docker). Apply all SQL files in `supabase/migrations/` in order (or use your migration pipeline).

## 3. Auth (smooth team signup)

1. Enable the **Email** provider (and optionally OAuth) under **Authentication → Providers**.
2. For **internal / trusted teams** where you want “sign up → work immediately”, turn **off** “Confirm email” for the email provider (**Authentication → Providers → Email**). If it stays on, new users must click the link in their inbox once; the login screen explains that.

Anyone who can create an account on your Supabase project can access team diagrams (same org). Lock down signup if needed (e.g. disable public signups and create users in the dashboard, or use Supabase hooks / SSO).

## 4. Deploy the frontend (e.g. Vercel)

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Build: `npm run build`.
