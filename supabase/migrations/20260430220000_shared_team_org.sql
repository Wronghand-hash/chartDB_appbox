-- One shared org for the whole deployment: every user is added on login/signup RPC.
-- Teammates only need to sign up or sign in — no SQL or invite codes.

insert into public.chartdb_orgs (id, name)
values (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Team'
)
on conflict (id) do nothing;

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
