-- Sample data for the RecSquad Groups, Events, and group-member pages.
-- Run in the Supabase SQL Editor after supabase_profiles.sql,
-- supabase_groups.sql, and supabase_events.sql.
--
-- This creates confirmed demo Auth users with randomly generated passwords.
-- The passwords are intentionally not recoverable; these accounts are for
-- displaying sample data, not for signing in.

begin;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  is_sso_user,
  is_anonymous
)
values
  (
    null,
    '30000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'rec-squad-demo-bruce@example.com',
    crypt(gen_random_uuid()::text, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"bruce_banner","full_name":"Bruce Banner","recsquad_sample_data":true}'::jsonb,
    now(),
    now(),
    false,
    false
  ),
  (
    null,
    '30000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'rec-squad-demo-bobby@example.com',
    crypt(gen_random_uuid()::text, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"bobby_smith","full_name":"Bobby Smith","recsquad_sample_data":true}'::jsonb,
    now(),
    now(),
    false,
    false
  ),
  (
    null,
    '30000000-0000-4000-8000-000000000003',
    'authenticated',
    'authenticated',
    'rec-squad-demo-tony@example.com',
    crypt(gen_random_uuid()::text, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"tony_stark","full_name":"Tony Stark","recsquad_sample_data":true}'::jsonb,
    now(),
    now(),
    false,
    false
  ),
  (
    null,
    '30000000-0000-4000-8000-000000000004',
    'authenticated',
    'authenticated',
    'rec-squad-demo-natasha@example.com',
    crypt(gen_random_uuid()::text, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"natasha_romanoff","full_name":"Natasha Romanoff","recsquad_sample_data":true}'::jsonb,
    now(),
    now(),
    false,
    false
  ),
  (
    null,
    '30000000-0000-4000-8000-000000000005',
    'authenticated',
    'authenticated',
    'rec-squad-demo-wanda@example.com',
    crypt(gen_random_uuid()::text, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"wanda_maximoff","full_name":"Wanda Maximoff","recsquad_sample_data":true}'::jsonb,
    now(),
    now(),
    false,
    false
  )
on conflict (id) do update
set email = excluded.email,
    raw_app_meta_data = excluded.raw_app_meta_data,
    raw_user_meta_data = excluded.raw_user_meta_data,
    email_confirmed_at = coalesce(auth.users.email_confirmed_at, excluded.email_confirmed_at),
    updated_at = now();

insert into public.profiles (id, username, full_name, avatar_url, updated_at)
values
  ('30000000-0000-4000-8000-000000000001', 'bruce_banner', 'Bruce Banner', null, now()),
  ('30000000-0000-4000-8000-000000000002', 'bobby_smith', 'Bobby Smith', null, now()),
  ('30000000-0000-4000-8000-000000000003', 'tony_stark', 'Tony Stark', null, now()),
  ('30000000-0000-4000-8000-000000000004', 'natasha_romanoff', 'Natasha Romanoff', null, now()),
  ('30000000-0000-4000-8000-000000000005', 'wanda_maximoff', 'Wanda Maximoff', null, now())
on conflict (id) do update
set username = excluded.username,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();

insert into public.groups (id, name, sport, description, created_by)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'Family Pickleball Crew',
    'Pickleball',
    'Friendly weekly games for all skill levels.',
    '30000000-0000-4000-8000-000000000001'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Free Range Disc Golf',
    'Disc Golf',
    'Meet up for casual rounds and course challenges.',
    '30000000-0000-4000-8000-000000000002'
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'Community Spikeball',
    'Spikeball',
    'Bring a partner and join a relaxed round-robin.',
    '30000000-0000-4000-8000-000000000003'
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'Open Table Tennis',
    'Table Tennis',
    'Open play, friendly matches, and beginner tips.',
    '30000000-0000-4000-8000-000000000004'
  )
on conflict (id) do update
set name = excluded.name,
    sport = excluded.sport,
    description = excluded.description,
    created_by = excluded.created_by;

insert into public.group_members (group_id, user_id, role)
values
  ('10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'admin'),
  ('10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000002', 'member'),
  ('10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000003', 'member'),
  ('10000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', 'admin'),
  ('10000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', 'member'),
  ('10000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000005', 'member'),
  ('10000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000003', 'admin'),
  ('10000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000004', 'member'),
  ('10000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000005', 'member'),
  ('10000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000004', 'admin'),
  ('10000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000001', 'member'),
  ('10000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000002', 'member'),
  ('10000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000003', 'member')
on conflict (group_id, user_id) do update
set role = excluded.role;

insert into public.events (
  id,
  group_id,
  title,
  skill_level,
  event_style,
  event_type,
  start_time,
  city,
  state,
  is_recurring,
  recurrence_days,
  recurrence_end_date,
  max_players,
  venue_address
)
values
  (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'Saturday Morning Open Play',
    'Beginner',
    'Casual',
    'Pick Up',
    now() + interval '2 days',
    'Orem',
    'Utah',
    true,
    array[trim(to_char((now() + interval '2 days')::date, 'Day'))],
    null,
    12,
    'Riverside Courts'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    'Beginner Pickleball Clinic',
    'Beginner',
    'Casual',
    'Practice',
    now() + interval '6 days',
    'Orem',
    'Utah',
    false,
    '{}'::text[],
    null,
    8,
    'Riverside Courts'
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000002',
    'Maple Park Morning Round',
    'Intermediate',
    'Casual',
    'Pick Up',
    now() + interval '3 days',
    'Provo',
    'Utah',
    false,
    '{}'::text[],
    null,
    10,
    'Maple Park Disc Golf Course'
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000002',
    'Northside Doubles Tournament',
    'Experienced',
    'Tournament',
    'Game',
    now() + interval '12 days',
    'Provo',
    'Utah',
    false,
    '{}'::text[],
    null,
    16,
    'Northside Disc Golf Course'
  ),
  (
    '20000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000003',
    'Sunday Spikeball Round-Robin',
    'Intermediate',
    'Competitive',
    'Game',
    now() + interval '4 days',
    'Springville',
    'Utah',
    true,
    array[
      trim(to_char((now() + interval '4 days')::date, 'Day')),
      trim(to_char((now() + interval '6 days')::date, 'Day'))
    ],
    (now() + interval '45 days')::date,
    16,
    'Cedar Beach Park'
  ),
  (
    '20000000-0000-4000-8000-000000000006',
    '10000000-0000-4000-8000-000000000003',
    'Summer Spikeball Cup',
    'Experienced',
    'Tournament',
    'Game',
    now() + interval '15 days',
    'Springville',
    'Utah',
    false,
    '{}'::text[],
    null,
    24,
    'Cedar Beach Park'
  ),
  (
    '20000000-0000-4000-8000-000000000007',
    '10000000-0000-4000-8000-000000000004',
    'Downtown Open Table Night',
    'Beginner',
    'Casual',
    'Pick Up',
    now() + interval '1 day',
    'Salt Lake City',
    'Utah',
    false,
    '{}'::text[],
    null,
    10,
    'Downtown Recreation Center'
  ),
  (
    '20000000-0000-4000-8000-000000000008',
    '10000000-0000-4000-8000-000000000004',
    'Friendly Table Tennis League',
    'Experienced',
    'Competitive',
    'Game',
    now() + interval '9 days',
    'Salt Lake City',
    'Utah',
    false,
    '{}'::text[],
    null,
    12,
    'Downtown Recreation Center'
  )
on conflict (id) do update
set group_id = excluded.group_id,
    title = excluded.title,
    skill_level = excluded.skill_level,
    event_style = excluded.event_style,
    event_type = excluded.event_type,
    start_time = excluded.start_time,
    city = excluded.city,
    state = excluded.state,
    is_recurring = excluded.is_recurring,
    recurrence_days = excluded.recurrence_days,
    recurrence_end_date = excluded.recurrence_end_date,
    max_players = excluded.max_players,
    venue_address = excluded.venue_address;

commit;

notify pgrst, 'reload schema';
