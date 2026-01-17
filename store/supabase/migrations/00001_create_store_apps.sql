-- store_apps table for Photon OS Store MVP
create table public.store_apps (
  id uuid default gen_random_uuid() primary key,
  bundle_id text not null unique,
  name text not null,
  author text not null,
  url text not null,
  description text,
  submitted_at timestamptz default now() not null
);

-- Full-text search index
create index idx_store_apps_search on public.store_apps
  using gin(to_tsvector('english', name || ' ' || author || ' ' || coalesce(description, '')));

-- Search function
create or replace function search_store_apps(search_query text)
returns setof store_apps as $$
begin
  if search_query is null or search_query = '' then
    return query select * from store_apps order by submitted_at desc;
  end if;
  return query
    select * from store_apps
    where to_tsvector('english', name || ' ' || author || ' ' || coalesce(description, ''))
      @@ plainto_tsquery('english', search_query)
    order by submitted_at desc;
end;
$$ language plpgsql;

-- Public access (no auth for MVP)
alter table public.store_apps enable row level security;
create policy "Public read" on public.store_apps for select using (true);
create policy "Public insert" on public.store_apps for insert with check (true);
