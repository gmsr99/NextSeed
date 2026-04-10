-- supabase/migrations/009_calendar_events.sql
create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  child_id uuid references children(id) on delete set null,
  title text not null,
  date date not null,
  start_time time,
  end_time time,
  notes text,
  type text not null default 'evento',
  created_at timestamptz not null default now()
);

alter table calendar_events enable row level security;

create policy "family_calendar_events" on calendar_events
  using (family_id = my_family_id())
  with check (family_id = my_family_id());

create index on calendar_events (family_id, date);
