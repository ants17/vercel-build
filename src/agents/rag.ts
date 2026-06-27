import { embed } from "ai";
import { MODELS } from "@/lib/ai/models";
import type { ContentRef } from "@/lib/manifest/schema";
import { getServerClient } from "@/lib/db/supabase";
import { getStaticBrimContentRefs } from "@/lib/content/brim";

export interface RetrieveOptions {
  /** Maximum number of results to return. Default: 5. */
  topK?: number;
  /** Minimum vector similarity threshold (0-1). Default: 0.7. */
  minScore?: number;
  /** Optional source filter for rows in content_chunks. */
  source?: string;
}

/**
 * Retrieve content references relevant to `query` using vector similarity.
 *
 * The preferred path is a Supabase RPC named `match_content_chunks`, which can
 * wrap pgvector ordering. If that function is not present yet, fall back to a
 * lightweight content_chunks scan and local text scoring. If Supabase is not
 * configured or no content exists, return static BRIM demo hints.
 *
 * @param query  Natural-language retrieval query.
 * @param opts   Optional retrieval tuning parameters.
 * @returns      Array of ContentRef objects ordered by descending similarity.
 */
export async function retrieve(
  query: string,
  opts: RetrieveOptions = {},
): Promise<ContentRef[]> {
  const { topK = 5, minScore = 0.7 } = opts;
  const fallback = () => getStaticBrimContentRefs(query, topK);

  if (!canQuerySupabase()) {
    return fallback();
  }

  const supabase = getServerClient();
  const embedding = await embedQuery(query);

  if (embedding) {
    const vectorRefs = await retrieveViaVectorRpc({
      embedding,
      minScore,
      topK,
      source: opts.source,
    });

    if (vectorRefs.length > 0) {
      return vectorRefs;
    }
  }

  const textRefs = await retrieveViaTextScan({
    query,
    topK,
    source: opts.source,
    supabase,
  });

  return textRefs.length > 0 ? textRefs : fallback();
}

type SupabaseClientLike = ReturnType<typeof getServerClient>;

interface ContentChunkCandidate {
  id?: string;
  source?: string | null;
  text?: string;
  content?: string;
  body?: string;
  metadata?: unknown;
  score?: number;
  similarity?: number;
}

function canQuerySupabase(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function embedQuery(query: string): Promise<number[] | null> {
  try {
    const { embedding } = await embed({
      model: MODELS.embedding,
      value: query,
    });
    return embedding;
  } catch {
    return null;
  }
}

async function retrieveViaVectorRpc(params: {
  embedding: number[];
  minScore: number;
  topK: number;
  source?: string;
}): Promise<ContentRef[]> {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase.rpc("match_content_chunks", {
      query_embedding: params.embedding,
      match_count: params.topK,
      match_threshold: params.minScore,
      source_filter: params.source ?? null,
    });

    if (error || !Array.isArray(data)) return [];

    return data
      .map((row) => contentRefFromCandidate(row as ContentChunkCandidate))
      .filter((ref): ref is ContentRef => Boolean(ref))
      .slice(0, params.topK);
  } catch {
    return [];
  }
}

async function retrieveViaTextScan(params: {
  query: string;
  topK: number;
  source?: string;
  supabase: SupabaseClientLike;
}): Promise<ContentRef[]> {
  try {
    let request = params.supabase
      .from("content_chunks")
      .select("id, source, text, metadata")
      .limit(Math.max(params.topK * 4, 12));

    if (params.source) {
      request = request.eq("source", params.source);
    }

    const { data, error } = await request;
    if (error || !Array.isArray(data)) return [];

    const terms = tokenize(params.query);

    return data
      .map((row) => {
        const candidate = row as ContentChunkCandidate;
        return {
          ref: contentRefFromCandidate(candidate),
          score: scoreCandidate(candidate, terms),
        };
      })
      .filter((item): item is { ref: ContentRef; score: number } => Boolean(item.ref))
      .filter((item) => terms.length === 0 || item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.ref)
      .slice(0, params.topK);
  } catch {
    return [];
  }
}

function contentRefFromCandidate(candidate: ContentChunkCandidate): ContentRef | null {
  const body = candidate.text ?? candidate.content ?? candidate.body;
  if (!body) return null;

  const metadata = asRecord(candidate.metadata);
  const title = stringFrom(metadata?.title) ?? candidate.source ?? candidate.id;
  const citation = stringFrom(metadata?.citation) ?? candidate.source ?? candidate.id;
  const ref = candidate.id ? `content_chunks:${candidate.id}` : candidate.source ?? "content_chunks";

  return {
    kind: "rag",
    ref,
    resolved: {
      title: title ?? undefined,
      body,
      citations: citation ? [citation] : undefined,
    },
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function stringFrom(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((term) => term.trim())
    .filter((term) => term.length > 2);
}

function scoreCandidate(candidate: ContentChunkCandidate, terms: string[]): number {
  if (terms.length === 0) return 1;

  const haystack = [
    candidate.source,
    candidate.text,
    candidate.content,
    candidate.body,
    JSON.stringify(candidate.metadata ?? {}),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}
