create table if not exists public.cyro_plans (
  id text primary key,
  name text not null unique,
  daily_price_ghs numeric(10,2) not null check (daily_price_ghs >= 0.50),
  daily_research_limit integer,
  annual_price_ghs numeric(10,2),
  billing_options text[] not null default ARRAY['daily','yearly'],
  description text not null,
  created_at timestamptz not null default now()
);

insert into public.cyro_plans (id, name, daily_price_ghs, daily_research_limit, description, annual_price_ghs)
values
  ('essential', 'Essential', 0.50, 10, 'Everyday research', 182.50),
  ('research', 'Research', 1.00, 50, 'More frequent research and saved knowledge', 365.00),
  ('deep-research', 'Deep Research', 2.00, 200, 'Heavier research workloads', 730.00)
on conflict (id) do update set
  name = excluded.name,
  daily_price_ghs = excluded.daily_price_ghs,
  daily_research_limit = excluded.daily_research_limit,
  description = excluded.description;

create table if not exists public.cyro_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_id text not null references public.cyro_plans(id),
  status text not null default 'active' check (status in ('active','past_due','paused','cancelled')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  provider text,
  provider_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cyro_daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default current_date,
  research_requests integer not null default 0 check (research_requests >= 0),
  research_units integer not null default 0 check (research_units >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);

alter table public.cyro_plans enable row level security;
alter table public.cyro_subscriptions enable row level security;
alter table public.cyro_daily_usage enable row level security;

create policy "authenticated users can read plans"
  on public.cyro_plans for select
  to authenticated
  using (true);

create policy "users read own subscription"
  on public.cyro_subscriptions for select
  to authenticated
  using (user_id = auth.uid());

create policy "users read own daily usage"
  on public.cyro_daily_usage for select
  to authenticated
  using (user_id = auth.uid());

create index if not exists cyro_subscriptions_plan_id_idx
  on public.cyro_subscriptions(plan_id);

create index if not exists cyro_daily_usage_date_idx
  on public.cyro_daily_usage(usage_date);
