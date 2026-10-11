-- Review and apply to the operator-approved Supabase project only.
-- No data migration or remote changes have been applied by this PR.
create table if not exists public.asnm_feedback (
 id bigint generated always as identity primary key,
 created_at timestamptz not null default now(),
 satisfaction integer not null check (satisfaction between 1 and 5),
 favorite text not null check (favorite in ('market','founder','builder','world','report','other')),
 improvement text not null check (char_length(improvement) between 1 and 1500),
 reuse integer not null check (reuse between 1 and 5),
 comment text not null default '' check (char_length(comment)<=1500)
);
create index if not exists asnm_feedback_created_idx on public.asnm_feedback(created_at desc);
create table if not exists public.asnm_event_counts (
 day date not null default current_date,
 event text not null check(event in ('landing_view','full_journey_start','quick_start','demo_start','module_complete','digital_twin_enter','first_decision','simulation_complete','compare_scenario','report_view','report_export','feedback_submit','market_view','founder_view','builder_view','world_view','report_module_view')),
 count bigint not null default 0 check(count>=0),primary key(day,event)
);
create table if not exists public.asnm_admins (user_id uuid primary key references auth.users(id) on delete cascade);
create table if not exists public.asnm_rate_limits (bucket text primary key,expires_at timestamptz not null,hits integer not null default 1);
alter table public.asnm_feedback enable row level security;
alter table public.asnm_event_counts enable row level security;
alter table public.asnm_admins enable row level security;
alter table public.asnm_rate_limits enable row level security;
-- No browser role receives access. The Edge Function verifies the signed user
-- using Auth, then checks the private allowlist using its server-side key.
revoke all on public.asnm_feedback,public.asnm_event_counts,public.asnm_admins,public.asnm_rate_limits from public,anon,authenticated;
grant all on public.asnm_feedback,public.asnm_event_counts,public.asnm_admins,public.asnm_rate_limits to service_role;
grant usage,select on sequence public.asnm_feedback_id_seq to service_role;
create or replace function public.asnm_increment_event(event_name text) returns void language plpgsql security definer set search_path='' as $$
begin
 insert into public.asnm_event_counts(day,event,count) values(current_date,event_name,1)
 on conflict(day,event) do update set count=public.asnm_event_counts.count+1;
end;$$;
create or replace function public.asnm_rate_check(bucket_key text,limit_count integer) returns boolean language plpgsql security definer set search_path='' as $$
declare total integer;
begin
 delete from public.asnm_rate_limits where expires_at<now();
 insert into public.asnm_rate_limits(bucket,expires_at,hits) values(bucket_key,now()+interval '1 hour',1)
 on conflict(bucket) do update set hits=public.asnm_rate_limits.hits+1 returning hits into total;
 return total<=limit_count;
end;$$;
revoke all on function public.asnm_increment_event(text),public.asnm_rate_check(text,integer) from public,anon,authenticated;
grant execute on function public.asnm_increment_event(text),public.asnm_rate_check(text,integer) to service_role;
