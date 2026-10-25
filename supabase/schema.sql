-- ProChoir database schema
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- Safe to re-run: it only creates things that don't exist yet.

-- ───────────────────────────── Editors (MDs) ─────────────────────────────
-- Only emails in this table can add or change anything.
-- Everyone else (choir members) can only read.
create table if not exists public.editors (
  email text primary key
);

alter table public.editors enable row level security;

create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.editors
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.is_editor() to anon, authenticated;

-- ───────────────────────────── Songs ─────────────────────────────
create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text,
  song_key text,
  lyrics text not null default '',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Links (YouTube, Spotify, Drive…) and uploaded audio for a song
create table if not exists public.song_media (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references public.songs (id) on delete cascade,
  kind text not null check (kind in ('link', 'audio')),
  label text not null default '',
  url text,
  storage_path text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists song_media_song_id_idx on public.song_media (song_id);

-- ───────────────────────────── Set lists ─────────────────────────────
create table if not exists public.setlists (
  id uuid primary key default gen_random_uuid(),
  service_date date not null,
  title text not null default 'Sunday Service',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists setlists_service_date_idx on public.setlists (service_date);

create table if not exists public.setlist_songs (
  id uuid primary key default gen_random_uuid(),
  setlist_id uuid not null references public.setlists (id) on delete cascade,
  song_id uuid not null references public.songs (id) on delete cascade,
  position int not null default 0,
  song_key text,
  notes text
);

create index if not exists setlist_songs_setlist_id_idx on public.setlist_songs (setlist_id);

-- ───────────────────────────── Row level security ─────────────────────────────
-- Only editors (MDs) can read or write directly. Choir members read through
-- the website's server (which checks the choir PIN), never the database itself.
do $$
declare t text;
begin
  foreach t in array array['songs', 'song_media', 'setlists', 'setlist_songs'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "Anyone can read" on public.%I', t);
    execute format('drop policy if exists "Editors can write" on public.%I', t);
    execute format('create policy "Editors can write" on public.%I for all to authenticated using (public.is_editor()) with check (public.is_editor())', t);
  end loop;
end $$;

-- ───────────────────────────── Audio storage ─────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('audio', 'audio', true, 52428800, array['audio/*'])
on conflict (id) do nothing;

drop policy if exists "Editors can upload audio" on storage.objects;
create policy "Editors can upload audio" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'audio' and public.is_editor());

drop policy if exists "Editors can change audio" on storage.objects;
create policy "Editors can change audio" on storage.objects
  for update to authenticated
  using (bucket_id = 'audio' and public.is_editor());

drop policy if exists "Editors can delete audio" on storage.objects;
create policy "Editors can delete audio" on storage.objects
  for delete to authenticated
  using (bucket_id = 'audio' and public.is_editor());

-- ───────────────────────────── Add your MDs ─────────────────────────────
-- Replace with real emails, then run just these lines:
-- insert into public.editors (email) values ('md1@example.com'), ('md2@example.com');
