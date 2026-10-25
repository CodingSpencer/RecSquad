-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text
);

-- Turn on Row Level Security (RLS) immediately
alter table profiles enable row level security;

-- Policy: Anyone can view public profiles
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using (true);

-- Policy: Users can insert their own profile upon signup
create policy "Users can insert their own profile."
  on profiles for insert
  with check (auth.uid() = id);

-- Policy: Users can update their own profile
create policy "Users can update own profile."
  on profiles for update
  using (auth.uid() = id);