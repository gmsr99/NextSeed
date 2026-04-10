-- supabase/migrations/010_mission_rewards.sql
create table if not exists mission_rewards (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  title text not null,
  description text,
  points_cost integer not null check (points_cost > 0),
  emoji text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table mission_rewards enable row level security;

create policy "family_mission_rewards" on mission_rewards
  using (family_id = my_family_id())
  with check (family_id = my_family_id());

create table if not exists reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  reward_id uuid not null references mission_rewards(id) on delete cascade,
  points_spent integer not null check (points_spent > 0),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz not null default now(),
  resolved_at timestamptz,
  notes text
);

alter table reward_redemptions enable row level security;

create policy "family_reward_redemptions" on reward_redemptions
  using (
    child_id in (select id from children where family_id = my_family_id())
  )
  with check (
    child_id in (select id from children where family_id = my_family_id())
  );

create index on reward_redemptions (child_id, status);

create index if not exists idx_reward_redemptions_reward_id on reward_redemptions (reward_id);
