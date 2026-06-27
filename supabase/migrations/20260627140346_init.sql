-- ============================================================
-- Idempotent schema — safe to re-run against any Supabase project.
-- Apply via: Supabase MCP → apply_migration, or the SQL editor.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- Extensions
-- ────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "vector";     -- pgvector for embeddings

-- ────────────────────────────────────────────────────────────
-- personas
-- ────────────────────────────────────────────────────────────
create table if not exists personas (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  doc        jsonb       not null,
  is_preset  boolean     not null default false,
  created_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- sessions
-- ────────────────────────────────────────────────────────────
create table if not exists sessions (
  id            uuid        primary key default gen_random_uuid(),
  persona_id    uuid        references personas(id),
  auth0_user_id text,
  status        text        not null default 'negotiating',
  transcript    jsonb       not null default '[]'::jsonb,
  prefs         jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists sessions_persona_id_idx on sessions(persona_id);

-- ────────────────────────────────────────────────────────────
-- manifests  (one current manifest per session)
-- ────────────────────────────────────────────────────────────
create table if not exists manifests (
  id         uuid        primary key default gen_random_uuid(),
  session_id uuid        not null,
  version    int         not null default 1,
  status     text        not null default 'configuring',
  doc        jsonb       not null,
  updated_at timestamptz not null default now()
);

-- Unique index enables upsert on session_id (one manifest per session).
create unique index if not exists manifests_session_id_key on manifests(session_id);

-- ────────────────────────────────────────────────────────────
-- content_chunks  (RAG store, 1536-dim embeddings)
-- ────────────────────────────────────────────────────────────
create table if not exists content_chunks (
  id        uuid    primary key default gen_random_uuid(),
  source    text,
  text      text    not null,
  embedding vector(1536),
  metadata  jsonb
);

create index if not exists content_chunks_embedding_idx
  on content_chunks using hnsw (embedding vector_cosine_ops);

-- ────────────────────────────────────────────────────────────
-- interaction_events
-- ────────────────────────────────────────────────────────────
create table if not exists interaction_events (
  id         bigint      generated always as identity primary key,
  session_id uuid        not null,
  type       text        not null,
  payload    jsonb,
  ts         timestamptz not null default now()
);

create index if not exists interaction_events_session_id_idx
  on interaction_events(session_id);

-- ────────────────────────────────────────────────────────────
-- memory_summaries
-- ────────────────────────────────────────────────────────────
create table if not exists memory_summaries (
  id         uuid        primary key default gen_random_uuid(),
  session_id uuid        not null,
  summary    jsonb       not null,
  emailed_at timestamptz
);

create index if not exists memory_summaries_session_id_idx
  on memory_summaries(session_id);

-- ────────────────────────────────────────────────────────────
-- Realtime: enable on manifests
-- Wrapped in a DO block so re-runs don't error on "already member".
-- ────────────────────────────────────────────────────────────
do $$
begin
  alter publication supabase_realtime add table manifests;
exception
  when others then
    -- already a member of the publication — safe to ignore
    null;
end;
$$;
