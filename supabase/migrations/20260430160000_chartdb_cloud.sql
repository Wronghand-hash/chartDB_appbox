-- ChartDB fork: team diagrams stored in Postgres (Supabase / self-hosted).
-- Run with Supabase CLI: `supabase db reset` or apply via dashboard SQL editor.

create table if not exists public.chartdb_orgs (
    id uuid primary key default gen_random_uuid(),
    name text not null default 'My team',
    created_at timestamptz not null default now()
);

create table if not exists public.chartdb_org_members (
    org_id uuid not null references public.chartdb_orgs (id) on delete cascade,
    user_id uuid not null references auth.users (id) on delete cascade,
    primary key (org_id, user_id)
);

create table if not exists public.chartdb_diagrams (
    id text primary key,
    org_id uuid not null references public.chartdb_orgs (id) on delete cascade,
    name text not null,
    snapshot jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    created_by uuid references auth.users (id) on delete set null
);

create index if not exists chartdb_diagrams_org_id_idx
    on public.chartdb_diagrams (org_id);

alter table public.chartdb_orgs enable row level security;
alter table public.chartdb_org_members enable row level security;
alter table public.chartdb_diagrams enable row level security;

create policy chartdb_orgs_select_member
    on public.chartdb_orgs
    for select
    to authenticated
    using (
        exists (
            select 1
            from public.chartdb_org_members m
            where m.org_id = chartdb_orgs.id
              and m.user_id = auth.uid()
        )
    );

create policy chartdb_org_members_select_self
    on public.chartdb_org_members
    for select
    to authenticated
    using (user_id = auth.uid());

create policy chartdb_diagrams_select_member
    on public.chartdb_diagrams
    for select
    to authenticated
    using (
        exists (
            select 1
            from public.chartdb_org_members m
            where m.org_id = chartdb_diagrams.org_id
              and m.user_id = auth.uid()
        )
    );

create policy chartdb_diagrams_insert_member
    on public.chartdb_diagrams
    for insert
    to authenticated
    with check (
        exists (
            select 1
            from public.chartdb_org_members m
            where m.org_id = chartdb_diagrams.org_id
              and m.user_id = auth.uid()
        )
    );

create policy chartdb_diagrams_update_member
    on public.chartdb_diagrams
    for update
    to authenticated
    using (
        exists (
            select 1
            from public.chartdb_org_members m
            where m.org_id = chartdb_diagrams.org_id
              and m.user_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1
            from public.chartdb_org_members m
            where m.org_id = chartdb_diagrams.org_id
              and m.user_id = auth.uid()
        )
    );

create policy chartdb_diagrams_delete_member
    on public.chartdb_diagrams
    for delete
    to authenticated
    using (
        exists (
            select 1
            from public.chartdb_org_members m
            where m.org_id = chartdb_diagrams.org_id
              and m.user_id = auth.uid()
        )
    );

create or replace function public.chartdb_ensure_default_org ()
    returns uuid
    language plpgsql
    security definer
    set search_path = public
as $$
declare
    v_org uuid;
begin
    select om.org_id
    into v_org
    from public.chartdb_org_members om
    where om.user_id = auth.uid()
    limit 1;

    if v_org is not null then
        return v_org;
    end if;

    insert into public.chartdb_orgs (name)
    values ('My team')
    returning id into v_org;

    insert into public.chartdb_org_members (org_id, user_id)
    values (v_org, auth.uid());

    return v_org;
end;
$$;

grant execute on function public.chartdb_ensure_default_org () to authenticated;
