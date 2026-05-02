-- One catalog for the whole deployment: move legacy per-user org diagrams into the
-- shared team org and ensure every user who was in any org is also a member of the team org.

insert into public.chartdb_orgs (id, name)
values (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Team'
)
on conflict (id) do nothing;

update public.chartdb_diagrams
set org_id = '11111111-1111-1111-1111-111111111111'::uuid;

insert into public.chartdb_org_members (org_id, user_id)
select '11111111-1111-1111-1111-111111111111'::uuid, m.user_id
from public.chartdb_org_members m
on conflict (org_id, user_id) do nothing;

create or replace function public.chartdb_ensure_default_org ()
    returns uuid
    language plpgsql
    security definer
    set search_path = public
as $$
declare
    v_team uuid := '11111111-1111-1111-1111-111111111111'::uuid;
begin
    insert into public.chartdb_orgs (id, name)
    values (v_team, 'Team')
    on conflict (id) do nothing;

    insert into public.chartdb_org_members (org_id, user_id)
    values (v_team, auth.uid())
    on conflict (org_id, user_id) do nothing;

    return v_team;
end;
$$;

grant execute on function public.chartdb_ensure_default_org () to authenticated;
