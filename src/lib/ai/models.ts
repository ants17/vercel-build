import { generateText } from "ai";

/**
 * Central model policy — the single source of truth for which model runs where.
 *
 * Tiering:
 *  - `primary`  Opus 4.8 — the authoritative intelligence (front orchestrator,
 *               administrator) and the escalation target.
 *  - `worker`   Sonnet — the default for fan-out subagents and workflow steps.
 *  - `advisor`  Opus 4.8 — what the worker "calls up to" in a call hook for a
 *               second opinion / verification.
 *
 * NOTE: Sonnet 4.8 is not on the AI Gateway yet (latest Sonnet is 4.6, verified
 * 2026-06-27). Swap `worker` to `anthropic/claude-sonnet-4.8` here when it ships.
 */
export const MODELS = {
  primary: "anthropic/claude-opus-4.8",
  worker: "anthropic/claude-sonnet-4.6",
  advisor: "anthropic/claude-opus-4.8",
  embedding: "openai/text-embedding-3-small",
} as const;

export type ModelTier = keyof typeof MODELS;

/**
 * Advisor call-up. A worker (Sonnet) consults the advisor (Opus 4.8) for a
 * focused second opinion. Use inside a workflow `"use step"` or an agent
 * `prepareStep` hook to escalate hard decisions or verify a draft before it
 * is published.
 */
export async function advise(params: {
  /** What the worker is unsure about, or the decision to review. */
  question: string;
  /** The worker's draft/output to critique, if any. */
  draft?: string;
  /** Any extra grounding (preferences, constraints, retrieved facts). */
  context?: string;
}): Promise<string> {
  const { text } = await generateText({
    model: MODELS.advisor,
    instructions:
      "You are a senior advisor reviewing a worker model's output. Be precise and " +
      "corrective: confirm what is right, flag what is wrong or risky, and give " +
      "concrete guidance the worker can act on. Prefer specifics over praise.",
    prompt: [
      `Question / decision: ${params.question}`,
      params.draft ? `\nWorker draft to review:\n${params.draft}` : "",
      params.context ? `\nContext:\n${params.context}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });
  return text;
}
