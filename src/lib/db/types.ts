import type { PageManifest } from "@/lib/manifest/schema";

// ────────────────────────────────────────────────────────────────────────────
// Row types matching the tables defined in schema.sql.
// Fields mirror the DB columns exactly; jsonb columns are typed where the
// application schema is known, otherwise left as `unknown`.
// ────────────────────────────────────────────────────────────────────────────

export type PersonaRow = {
  id: string;
  name: string;
  doc: unknown; // Persona shape — validated at the application layer
  is_preset: boolean;
  created_at: string;
};

export type SessionRow = {
  id: string;
  persona_id: string | null;
  auth0_user_id: string | null;
  status: string;
  transcript: unknown[];
  prefs: unknown | null;
  created_at: string;
};

export type ManifestRow = {
  id: string;
  session_id: string;
  version: number;
  status: string;
  doc: PageManifest;
  updated_at: string;
};

export type ContentChunkRow = {
  id: string;
  source: string | null;
  text: string;
  /** 1536-dim float array (openai/text-embedding-3-small). Null until embedded. */
  embedding: number[] | null;
  metadata: unknown | null;
};

export type InteractionEventRow = {
  id: number;
  session_id: string;
  type: string;
  payload: unknown | null;
  ts: string;
};

export type MemorySummaryRow = {
  id: string;
  session_id: string;
  summary: unknown;
  emailed_at: string | null;
};
