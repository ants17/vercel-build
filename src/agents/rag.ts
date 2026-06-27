import { embed } from "ai";
import { MODELS } from "@/lib/ai/models";
import type { ContentRef } from "@/lib/manifest/schema";

export interface RetrieveOptions {
  /** Maximum number of results to return. Default: 5. */
  topK?: number;
  /** Minimum similarity threshold (0-1). Default: 0.7. */
  minScore?: number;
}

/**
 * Retrieve content references relevant to `query` using vector similarity.
 *
 * Currently computes the query embedding and returns an empty array;
 * the pgvector similarity search is wired up once the DB client is ready.
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

  // Embed the query so the shape of the downstream call is correct.
  const { embedding } = await embed({
    model: MODELS.embedding,
    value: query,
  });

  // TODO: pgvector similarity search via src/lib/db
  // Example (pseudocode):
  //   const rows = await db.query(
  //     `SELECT ref, kind, resolved, 1 - (embedding <=> $1) AS score
  //      FROM content_embeddings
  //      WHERE 1 - (embedding <=> $1) >= $2
  //      ORDER BY score DESC
  //      LIMIT $3`,
  //     [JSON.stringify(embedding), minScore, topK],
  //   );
  //   return rows.map(r => ({ kind: r.kind, ref: r.ref, resolved: r.resolved }));

  void embedding; // used above; suppress lint until TODO is wired
  void topK;
  void minScore;

  return [];
}
