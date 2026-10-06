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
  ('essential', 'Essential', 0.50, 10, 'Everyday research', 136.88),
  ('research', 'Research', 1.00, 50, 'More frequent research and saved knowledge', 273.75),
  ('deep-research', 'Deep Research', 2.00, 200, 'Heavier research workloads', 547.50)
on conflict (id) do update set
  name = excluded.name,
  daily_price_ghs = excluded.daily_price_ghs,
  daily_research_limit = excluded.daily_research_limit,
  description = excluded.description,
  annual_price_ghs = excluded.annual_price_ghs,
  billing_options = excluded.billing_options;

create table if not exists public.cyro_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_id text not null references public.cyro_plans(id),
  status text not null default 'active' check (status in ('active','past_due','paused','cancelled')),
  billing_interval text not null default 'daily' check (billing_interval in ('daily','yearly')),
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


create table if not exists public.cyro_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null references public.cyro_plans(id),
  billing_interval text not null check (billing_interval in ('daily','yearly')),
  amount_ghs numeric(10,2) not null check (amount_ghs > 0),
  currency text not null default 'GHS' check (currency = 'GHS'),
  provider text,
  provider_reference text,
  momo_phone text,
  momo_provider text check (momo_provider in ('mtn','atl','vod') or momo_provider is null),
  status text not null default 'pending' check (status in ('pending','processing','success','failed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cyro_payments enable row level security;

create policy "users read own payments"
  on public.cyro_payments for select
  to authenticated
  using (user_id = auth.uid());

create index if not exists cyro_payments_user_id_idx
  on public.cyro_payments(user_id);

create index if not exists cyro_payments_provider_reference_idx
  on public.cyro_payments(provider_reference);


create unique index if not exists cyro_payments_provider_reference_uidx on public.cyro_payments(provider_reference) where provider_reference is not null;
