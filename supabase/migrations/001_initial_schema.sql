-- Migration 001: Initial schema for Cadence
-- Full schema from §3 of the plan
-- Applied in Phase 1 via Supabase Dashboard or CLI

-- profiles: 1:1 with auth.users
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text not null default 'UTC',
  visuals_3d_enabled boolean not null default true,
  weekly_email_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

-- habits
create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  icon text not null,               -- constrained lucide icon key
  color text not null,               -- constrained palette token, e.g. 'green-1'
  frequency text not null default 'daily', -- 'daily' | 'weekly' | 'custom'
  custom_days int[] default null,    -- 0-6 (Sun-Sat) when frequency = 'custom'
  focus_mode boolean not null default false,
  focus_duration_seconds int default null,
  archived_at timestamptz default null,
  created_at timestamptz not null default now()
);

-- check_ins: one row per habit per local calendar day
create table check_ins (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  checked_in_date date not null,
  note text,
  focus_duration_seconds int,
  created_at timestamptz not null default now(),
  unique (habit_id, checked_in_date)
);

-- habit_milestones: fires celebration exactly once per threshold
create table habit_milestones (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  milestone_value int not null,     -- 7, 30, 100, ...
  achieved_at timestamptz not null default now(),
  unique (habit_id, milestone_value)
);

-- RLS: every table scoped to auth.uid()
alter table profiles enable row level security;
alter table habits enable row level security;
alter table check_ins enable row level security;
alter table habit_milestones enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = id);
create policy "own habits" on habits for all using (auth.uid() = user_id);
create policy "own check_ins" on check_ins for all using (auth.uid() = user_id);
create policy "own milestones" on habit_milestones for all
  using (auth.uid() = (select user_id from habits where habits.id = habit_id));

-- Also allow insert with check
create policy "own milestones insert" on habit_milestones for insert
  with check (auth.uid() = (select user_id from habits where habits.id = habit_id));

-- streak function: walks consecutive local-calendar days backward from today/yesterday
create or replace function get_current_streak(p_habit_id uuid, p_timezone text)
returns int language plpgsql stable as $$
declare
  v_today date := (now() at time zone p_timezone)::date;
  v_cursor date := v_today;
  v_streak int := 0;
  v_exists boolean;
begin
  -- allow "yesterday" as the anchor so a streak isn't shown broken before today's check-in happens
  select exists(select 1 from check_ins where habit_id = p_habit_id and checked_in_date = v_today) into v_exists;
  if not v_exists then
    v_cursor := v_today - 1;
  end if;

  loop
    select exists(select 1 from check_ins where habit_id = p_habit_id and checked_in_date = v_cursor) into v_exists;
    exit when not v_exists;
    v_streak := v_streak + 1;
    v_cursor := v_cursor - 1;
  end loop;

  return v_streak;
end;
$$;

-- Auto-create profile on new user signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, timezone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'timezone', 'UTC')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
