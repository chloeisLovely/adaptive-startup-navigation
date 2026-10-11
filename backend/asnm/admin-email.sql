-- Private operator designation before the owner completes Auth signup.
create table if not exists public.asnm_admin_emails (
 email text primary key check (email=lower(trim(email)) and position('@' in email)>1),
 created_at timestamptz not null default now()
);
alter table public.asnm_admin_emails enable row level security;
revoke all on public.asnm_admin_emails from public,anon,authenticated;
grant select,insert,update,delete on public.asnm_admin_emails to service_role;
