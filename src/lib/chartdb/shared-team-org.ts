/** Fixed team org id — must match `supabase/migrations/20260430220000_shared_team_org.sql`. */
export const CHARTDB_SHARED_TEAM_ORG_ID =
    '11111111-1111-1111-1111-111111111111' as const;

/** Postgres / ChartDB diagram org ids (not strict RFC 4122 — team id uses all `1` nibbles). */
const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Normalize `chartdb_ensure_default_org` RPC payload to an org id string. */
export function parseChartdbOrgIdFromRpc(data: unknown): string | null {
    if (data == null) {
        return null;
    }
    const s = typeof data === 'string' ? data.trim() : String(data).trim();
    if (s.length === 0) {
        return null;
    }
    return UUID_RE.test(s) ? s : null;
}
