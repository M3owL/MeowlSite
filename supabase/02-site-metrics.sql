-- Editable public portfolio figures. Run once in Supabase SQL Editor.
create table if not exists public.site_settings (
  id text primary key check (id = 'portfolio_metrics'),
  completed_projects integer not null default 0 check (completed_projects >= 0),
  translated_words bigint not null default 0 check (translated_words >= 0)
);

insert into public.site_settings (id)
values ('portfolio_metrics')
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "Public can read portfolio metrics" on public.site_settings;
create policy "Public can read portfolio metrics"
  on public.site_settings for select
  using (true);

drop policy if exists "Admins can update portfolio metrics" on public.site_settings;
create policy "Admins can update portfolio metrics"
  on public.site_settings for update
  using (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;
