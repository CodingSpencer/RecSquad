-- Groups feature schema

create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  sport text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamp with time zone default now()
);

create table if not exists group_members (
  group_id uuid references groups(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text not null check (role in ('admin','member')) default 'member',
  joined_at timestamp with time zone default now(),
  primary key (group_id, user_id)
);

alter table groups enable row level security;
alter table group_members enable row level security;

create policy "Groups are viewable by everyone."
  on groups for select using (true);

create policy "Authenticated users can create groups."
  on groups for insert with check (auth.uid() = created_by);

create policy "Group admins can update groups."
  on groups for update using (
    exists (select 1 from group_members gm where gm.group_id = groups.id and gm.user_id = auth.uid() and gm.role = 'admin')
  );

create policy "Group admins can delete groups."
  on groups for delete using (
    exists (select 1 from group_members gm where gm.group_id = groups.id and gm.user_id = auth.uid() and gm.role = 'admin')
  );

create policy "Group members viewable by everyone."
  on group_members for select using (true);

create policy "Users can join groups as members."
  on group_members for insert with check (auth.uid() = user_id and role = 'member');

create policy "Group admins can add admins or members."
  on group_members for insert with check (
    exists (select 1 from group_members gm where gm.group_id = group_members.group_id and gm.user_id = auth.uid() and gm.role = 'admin')
  );

create policy "Group admins can update member roles."
  on group_members for update using (
    exists (select 1 from group_members gm where gm.group_id = group_members.group_id and gm.user_id = auth.uid() and gm.role = 'admin')
  );

create policy "Group admins can remove members; users can leave."
  on group_members for delete using (
    auth.uid() = user_id or
    exists (select 1 from group_members gm where gm.group_id = group_members.group_id and gm.user_id = auth.uid() and gm.role = 'admin')
  );
