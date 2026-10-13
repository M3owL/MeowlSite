-- Keep the admin's work-area selections alongside each generated project report.
alter table public.projects
  add column if not exists work_scope text[] not null default '{}'::text[];

alter table public.projects
  add column if not exists report_seed text not null default '';
