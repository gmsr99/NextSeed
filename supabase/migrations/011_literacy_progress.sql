-- supabase/migrations/011_literacy_progress.sql
create table if not exists literacy_progress (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  area text not null check (area in ('financial', 'digital')),
  module_id text not null,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  updated_at timestamptz not null default now(),
  unique (child_id, area, module_id)
);

alter table literacy_progress enable row level security;

create policy "family_literacy_progress" on literacy_progress
  using (
    child_id in (select id from children where family_id = my_family_id())
  )
  with check (
    child_id in (select id from children where family_id = my_family_id())
  );

create index on literacy_progress (child_id, area);
