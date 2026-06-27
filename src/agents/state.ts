import { generateText } from "ai";
import { MODELS } from "@/lib/ai/models";

/** A single interaction event recorded during the session. */
export interface InteractionEvent {
  /** ISO timestamp */
  at: string;
  /** e.g. "front-agent", "human-agent", "ui-agent", "administrator" */
  actor: string;
  /** Brief description of what happened */
  description: string;
  /** Optional structured payload (tool call input, plan diff, etc.) */
  payload?: unknown;
}

export interface SessionSummary {
  /** Prose summary of the session so far, suitable for a new context window. */
  summary: string;
  /**
   * Key facts and decisions that must be carried forward into the next phase
   * (e.g. confirmed preferences, rejected plan reasons, content already written).
   */
  carryForward: string[];
}

/**
 * Summarise a sequence of interaction events into a compact context handoff.
 * Run on MODELS.worker; no tools needed — pure text summarisation.
 *
 * @param events  Ordered list of events from this session.
 * @returns       A summary and a carry-forward bullet list.
 */
export async function summarizeInteractions(
  events: InteractionEvent[],
): Promise<SessionSummary> {
  const eventLog = events
    .map(
      (e, i) =>
        `[${i + 1}] ${e.at} | ${e.actor}: ${e.description}` +
        (e.payload ? `\n    payload: ${JSON.stringify(e.payload)}` : ""),
    )
    .join("\n");

  const { text } = await generateText({
    model: MODELS.worker,
    instructions: `You are a session state manager. Given a log of interaction events,
produce a JSON object with two keys:
- "summary": a concise prose paragraph (3-5 sentences) describing what happened,
  suitable for seeding a new context window with no prior history.
- "carryForward": an array of short strings (< 20 words each) listing key facts,
  decisions, or constraints that must carry into the next phase.

Output only valid JSON — no markdown fences, no extra text.`,
    prompt: `Session event log:\n\n${eventLog}`,
  });

  const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  const parsed = JSON.parse(cleaned) as SessionSummary;
  return parsed;
}
