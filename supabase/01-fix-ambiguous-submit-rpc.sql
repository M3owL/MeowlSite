-- ============================================================================
-- FIX: "Could not choose the best candidate function between:
--        public.submit_review_with_code(...) and public.submit_review_with_code(...)"
-- ============================================================================
--
-- WHY THIS HAPPENS
--
-- `CREATE OR REPLACE FUNCTION` only replaces a function when the *parameter
-- list* is identical. Adding parameters creates a NEW function alongside the
-- old one -- Postgres treats them as overloads, not as a replacement.
--
-- Your database ended up with at least two of these, both starting with the
-- same three parameter names:
--
--   submit_review_with_code(input_code, input_review_text, input_ratings)
--   submit_review_with_code(input_code, input_review_text, input_ratings,
--                           input_bg_offset_x, input_bg_offset_y,
--                           input_logo_offset_x, input_logo_offset_y)
--
-- The client calls it with three named arguments, which matches BOTH, so the
-- planner gives up: error 42725, ambiguous_function. Nothing is wrong with the
-- app code -- the database simply has two functions where it should have one.
--
-- THE FIX
-- Drop every overload by name, then create exactly one function with the
-- signature the client actually calls.
--
-- Safe to run more than once.
-- Run in the Supabase dashboard -> SQL Editor.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. Columns the functions below read or write.
--    `add column if not exists` makes this section a no-op if you already have
--    them, so the script never fails on a partially migrated database.
-- ---------------------------------------------------------------------------

alter table public.reviews       add column if not exists game_title text;
alter table public.reviews       add column if not exists bg_offset_x integer default 0;
alter table public.reviews       add column if not exists bg_offset_y integer default 0;
alter table public.reviews       add column if not exists logo_offset_x integer default 0;
alter table public.reviews       add column if not exists logo_offset_y integer default 0;

alter table public.invite_codes  add column if not exists game_title text;
alter table public.invite_codes  add column if not exists discord_username text;
alter table public.invite_codes  add column if not exists used_at timestamptz;

alter table public.projects      add column if not exists bg_url text;
alter table public.projects      add column if not exists logo_url text;
alter table public.projects      add column if not exists pinned boolean not null default false;
alter table public.projects      add column if not exists sort_order integer not null default 0;
alter table public.projects      add column if not exists bg_offset_x integer default 0;
alter table public.projects      add column if not exists bg_offset_y integer default 0;
alter table public.projects      add column if not exists logo_offset_x integer default 0;
alter table public.projects      add column if not exists logo_offset_y integer default 0;


-- ---------------------------------------------------------------------------
-- 2. Drop EVERY overload of both RPCs, whatever their signatures are.
--    Hardcoding `drop function ...(text,text,text)` would miss the variants,
--    so this walks pg_proc instead.
-- ---------------------------------------------------------------------------

do $$
declare
  fn record;
begin
  for fn in
    select p.proname                                        as name,
           pg_get_function_identity_arguments(p.oid)        as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('submit_review_with_code', 'get_invite_code_preview')
  loop
    raise notice 'dropping public.% (%)', fn.name, fn.args;
    execute format('drop function if exists public.%I(%s)', fn.name, fn.args);
  end loop;
end $$;


-- ---------------------------------------------------------------------------
-- 3. Preview. Never consumes the code.
--    Returns game_title too, which the review form displays.
-- ---------------------------------------------------------------------------

create function public.get_invite_code_preview(input_code text)
returns table (
  nickname text,
  role text,
  game_title text,
  discord_username text,
  avatar_url text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select i.nickname,
         i.role,
         i.game_title,
         i.discord_username,
         i.avatar_url
  from public.invite_codes i
  where upper(i.code) = upper(trim(input_code))
    and i.used = false;
end;
$$;

revoke all on function public.get_invite_code_preview(text) from public;


-- ---------------------------------------------------------------------------
-- 4. The single canonical redemption function.
--
--    Deliberately has NO default values. Defaults are what made the two old
--    overloads ambiguous; with none, a call can only ever match this one.
--
--    `for update` locks the invite row, so two browsers submitting the same
--    code at the same time cannot both succeed -- the second sees used = true
--    and gets rejected.
-- ---------------------------------------------------------------------------

create function public.submit_review_with_code(
  input_code text,
  input_review_text text,
  input_ratings jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  code_row public.invite_codes%rowtype;
  new_id uuid;
begin
  if trim(coalesce(input_review_text, '')) = '' then
    raise exception 'Review text cannot be empty.' using errcode = 'P0001';
  end if;

  select *
  into code_row
  from public.invite_codes
  where upper(code) = upper(trim(input_code))
    and used = false
  for update;

  if not found then
    raise exception 'Invalid or already used invite code.' using errcode = 'P0001';
  end if;

  insert into public.reviews (
    nickname,
    discord_username,
    role,
    game_title,
    review_text,
    avatar_url,
    ratings,
    published
  )
  values (
    code_row.nickname,
    code_row.discord_username,
    code_row.role,
    code_row.game_title,
    trim(input_review_text),
    code_row.avatar_url,
    coalesce(input_ratings, '[]'::jsonb),
    false              -- stays hidden until you approve it in the admin panel
  )
  returning id into new_id;

  update public.invite_codes
  set used = true,
      used_at = now()
  where id = code_row.id
    and used = false;

  if not found then
    raise exception 'Invite code could not be consumed.' using errcode = 'P0001';
  end if;

  return new_id;
end;
$$;

revoke all on function public.submit_review_with_code(text, text, jsonb) from public;


-- ---------------------------------------------------------------------------
-- 5. Grants.
--    Supabase always has `anon` and `authenticated`, but these are guarded so
--    the script also runs cleanly on a plain Postgres instance (and so a
--    re-run never fails).
-- ---------------------------------------------------------------------------

do $$
declare
  target text;
  fn text;
begin
  foreach fn in array array[
    'public.get_invite_code_preview(text)',
    'public.submit_review_with_code(text, text, jsonb)'
  ]
  loop
    foreach target in array array['anon', 'authenticated']
    loop
      if exists (select 1 from pg_roles where rolname = target) then
        execute format('grant execute on function %s to %I', fn, target);
      else
        raise notice 'role % does not exist here, skipping grant', target;
      end if;
    end loop;
  end loop;
end $$;


-- ---------------------------------------------------------------------------
-- 6. Refresh PostgREST's schema cache so it picks up the new signatures.
-- ---------------------------------------------------------------------------

notify pgrst, 'reload schema';


-- ---------------------------------------------------------------------------
-- 7. Verification. Expect exactly TWO rows, one per function.
--    If you still see four, the drop in step 2 did not run.
-- ---------------------------------------------------------------------------

select p.oid::regprocedure as function_signature
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('submit_review_with_code', 'get_invite_code_preview')
order by 1;
