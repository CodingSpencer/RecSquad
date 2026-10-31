-- RecSquad master database setup.
-- Run this file once in the Supabase SQL Editor. It combines the profile,
-- group, event, account-settings, and RSVP schemas; sample data is excluded.

begin;

-- Profiles

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text
);

alter table public.profiles enable row level security;

drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile."
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile."
  on public.profiles for update
  using (auth.uid() = id);

-- Groups and memberships

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  state text,
  description text,
  sport text,
  image_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now()
);

alter table public.groups
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists image_url text;

create table if not exists public.group_members (
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('admin','member')) default 'member',
  joined_at timestamp with time zone default now(),
  primary key (group_id, user_id)
);

alter table public.groups enable row level security;
alter table public.group_members enable row level security;

drop policy if exists "Groups are viewable by everyone." on public.groups;
create policy "Groups are viewable by everyone."
  on public.groups for select using (true);

drop policy if exists "Authenticated users can create groups." on public.groups;
create policy "Authenticated users can create groups."
  on public.groups for insert with check (auth.uid() = created_by);

drop policy if exists "Group admins can update groups." on public.groups;
create policy "Group admins can update groups."
  on public.groups for update using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = groups.id
        and gm.user_id = auth.uid()
        and gm.role = 'admin'
    )
  );

drop policy if exists "Group admins can delete groups." on public.groups;
create policy "Group admins can delete groups."
  on public.groups for delete using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = groups.id
        and gm.user_id = auth.uid()
        and gm.role = 'admin'
    )
  );

drop policy if exists "Group members viewable by everyone." on public.group_members;
create policy "Group members viewable by everyone."
  on public.group_members for select using (true);

drop policy if exists "Users can join groups as members." on public.group_members;
create policy "Users can join groups as members."
  on public.group_members for insert
  with check (auth.uid() = user_id and role = 'member');

drop policy if exists "Group creators can make themselves admins." on public.group_members;
create policy "Group creators can make themselves admins."
  on public.group_members for insert with check (
    auth.uid() = user_id
    and role = 'admin'
    and exists (
      select 1
      from public.groups g
      where g.id = group_members.group_id
        and g.created_by = auth.uid()
    )
  );

drop policy if exists "Group admins can add admins or members." on public.group_members;
create policy "Group admins can add admins or members."
  on public.group_members for insert with check (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = group_members.group_id
        and gm.user_id = auth.uid()
        and gm.role = 'admin'
    )
  );

drop policy if exists "Group admins can update member roles." on public.group_members;
create policy "Group admins can update member roles."
  on public.group_members for update using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = group_members.group_id
        and gm.user_id = auth.uid()
        and gm.role = 'admin'
    )
  );

drop policy if exists "Group admins can remove members; users can leave." on public.group_members;
create policy "Group admins can remove members; users can leave."
  on public.group_members for delete using (
    auth.uid() = user_id
    or exists (
      select 1 from public.group_members gm
      where gm.group_id = group_members.group_id
        and gm.user_id = auth.uid()
        and gm.role = 'admin'
    )
  );

-- Events

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  skill_level text not null default 'Beginner',
  event_style text not null default 'Casual',
  event_type text not null default 'Pick Up',
  start_time timestamp with time zone not null,
  city text,
  state text,
  is_recurring boolean not null default false,
  recurrence_days text[] not null default '{}',
  recurrence_end_date date,
  max_players integer check (max_players is null or max_players >= 1),
  venue_address text,
  created_at timestamp with time zone not null default now()
);

alter table public.events
  add column if not exists skill_level text not null default 'Beginner',
  add column if not exists event_style text not null default 'Casual',
  add column if not exists event_type text not null default 'Pick Up',
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists is_recurring boolean not null default false,
  add column if not exists recurrence_days text[] not null default '{}',
  add column if not exists recurrence_end_date date;

alter table public.events
  alter column event_type set default 'Pick Up';

alter table public.events drop constraint if exists events_event_type_check;
alter table public.events drop constraint if exists events_event_type_allowed_check;

update public.events
set
  event_style = case
    when event_type = 'TOURNAMENT' then 'Tournament'
    else event_style
  end,
  event_type = case event_type
    when 'PICKUP' then 'Pick Up'
    when 'LEAGUE_MATCH' then 'Game'
    when 'TOURNAMENT' then 'Game'
    else event_type
  end;

alter table public.events drop constraint if exists events_skill_level_check;
alter table public.events
  add constraint events_skill_level_check
  check (skill_level in ('Beginner', 'Intermediate', 'Experienced'));

alter table public.events drop constraint if exists events_event_style_check;
alter table public.events
  add constraint events_event_style_check
  check (event_style in ('Casual', 'Competitive', 'Tournament'));

alter table public.events
  add constraint events_event_type_check
  check (event_type in ('Pick Up', 'Practice', 'Game', 'Info'));

alter table public.events drop constraint if exists events_recurrence_days_check;
alter table public.events
  add constraint events_recurrence_days_check
  check (
    recurrence_days <@ array[
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    ]::text[]
  );

alter table public.events drop constraint if exists events_recurrence_settings_check;
alter table public.events
  add constraint events_recurrence_settings_check
  check (
    (is_recurring and cardinality(recurrence_days) > 0)
    or
    (not is_recurring and cardinality(recurrence_days) = 0 and recurrence_end_date is null)
  );

create index if not exists events_group_start_time_idx
  on public.events (group_id, start_time);
create index if not exists events_start_time_idx
  on public.events (start_time);

alter table public.events enable row level security;

drop policy if exists "Events are viewable by everyone." on public.events;
create policy "Events are viewable by everyone."
  on public.events for select
  using (true);

drop policy if exists "Group admins can create events." on public.events;
create policy "Group admins can create events."
  on public.events for insert
  with check (
    exists (
      select 1
      from public.groups g
      where g.id = events.group_id
        and g.created_by = auth.uid()
    )
    or exists (
      select 1
      from public.group_members gm
      where gm.group_id = events.group_id
        and gm.user_id = auth.uid()
        and gm.role = 'admin'
    )
  );

-- Private account settings

create table if not exists public.account_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  city text,
  state text,
  updated_at timestamp with time zone not null default now()
);

alter table public.account_settings enable row level security;

drop policy if exists "Users can view their own account settings." on public.account_settings;
create policy "Users can view their own account settings."
  on public.account_settings for select
  using (user_id = (select auth.uid()));

drop policy if exists "Users can insert their own account settings." on public.account_settings;
create policy "Users can insert their own account settings."
  on public.account_settings for insert
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can update their own account settings." on public.account_settings;
create policy "Users can update their own account settings."
  on public.account_settings for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

revoke all on public.account_settings from public, anon;
grant select, insert, update on public.account_settings to authenticated;

-- Event RSVPs

create table if not exists public.event_rsvps (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  primary key (event_id, user_id)
);

create index if not exists event_rsvps_user_id_idx
  on public.event_rsvps (user_id);

alter table public.event_rsvps enable row level security;

drop policy if exists "Users can view their own event RSVPs." on public.event_rsvps;
create policy "Users can view their own event RSVPs."
  on public.event_rsvps for select
  using (user_id = (select auth.uid()));

drop policy if exists "Users can cancel their own event RSVPs." on public.event_rsvps;
create policy "Users can cancel their own event RSVPs."
  on public.event_rsvps for delete
  using (user_id = (select auth.uid()));

revoke all on public.event_rsvps from anon, authenticated;
grant select, delete on public.event_rsvps to authenticated;

create or replace function public.event_rsvp_count(p_event_id uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer
  from public.event_rsvps
  where event_id = p_event_id;
$$;

revoke all on function public.event_rsvp_count(uuid) from public;
grant execute on function public.event_rsvp_count(uuid) to anon, authenticated;

create or replace function public.event_rsvp_counts(p_event_ids uuid[])
returns table (event_id uuid, rsvp_count integer)
language sql
stable
security definer
set search_path = ''
as $$
  select requested.event_id, count(r.event_id)::integer as rsvp_count
  from unnest(coalesce(p_event_ids, array[]::uuid[])) as requested(event_id)
  left join public.event_rsvps r on r.event_id = requested.event_id
  group by requested.event_id;
$$;

revoke all on function public.event_rsvp_counts(uuid[]) from public;
grant execute on function public.event_rsvp_counts(uuid[]) to anon, authenticated;

create or replace function public.rsvp_to_event(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_max_players integer;
  current_rsvp_count integer;
  event_is_open boolean;
begin
  if auth.uid() is null then
    raise exception 'Sign in to RSVP to this event.' using errcode = '42501';
  end if;

  select
    e.max_players,
    case
      when e.is_recurring then
        e.recurrence_end_date is null
        or e.recurrence_end_date >= (now() at time zone 'UTC')::date
      else e.start_time > now()
    end
  into event_max_players, event_is_open
  from public.events e
  where e.id = p_event_id
  for update;

  if not found then
    raise exception 'Event not found.' using errcode = 'P0002';
  end if;

  if not event_is_open then
    raise exception 'This event is no longer accepting RSVPs.' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.event_rsvps r
    where r.event_id = p_event_id
      and r.user_id = auth.uid()
  ) then
    return;
  end if;

  if event_max_players is not null then
    select count(*)::integer
    into current_rsvp_count
    from public.event_rsvps r
    where r.event_id = p_event_id;

    if current_rsvp_count >= event_max_players then
      raise exception 'This event is full.' using errcode = 'P0001';
    end if;
  end if;

  insert into public.event_rsvps (event_id, user_id)
  values (p_event_id, auth.uid())
  on conflict (event_id, user_id) do nothing;
end;
$$;

revoke all on function public.rsvp_to_event(uuid) from public, anon;
grant execute on function public.rsvp_to_event(uuid) to authenticated;

notify pgrst, 'reload schema';

commit;
