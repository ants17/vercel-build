import { generateObject } from "ai";
import { z } from "zod";
import { MODELS } from "@/lib/ai/models";
import {
  getTextDirection,
  normalizeLanguage,
  normalizeToneMode,
  type SupportedLanguage,
  type TextDirection,
  type ToneMode,
} from "@/lib/content/brim";
import type { Prefs } from "@/agents/front";

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

export interface SessionConfiguredSection {
  id?: string;
  component?: string;
  title?: string;
  status?: string;
}

export interface SessionConfigurationSnapshot {
  sessionId?: string;
  url?: string;
  theme?: unknown;
  sections?: SessionConfiguredSection[];
  contentRefs?: string[];
}

type HandoffPrefs = Partial<Prefs> & {
  language?: string;
  toneMode?: string;
};

export interface SessionHandBackInput {
  sessionId?: string;
  prefs?: HandoffPrefs;
  configuration?: SessionConfigurationSnapshot | Record<string, unknown>;
  events?: InteractionEvent[];
}

export interface SessionHandBackPayload {
  version: 1;
  kind: "brim-session-handback";
  sessionId?: string;
  language: SupportedLanguage;
  dir: TextDirection;
  summary: string;
  carryForward: string[];
  prefs: {
    interests: string[];
    tone?: string;
    toneMode: ToneMode;
    density?: string;
    intent?: string;
    notes?: string;
    language: SupportedLanguage;
    dir: TextDirection;
  };
  configuration: SessionConfigurationSnapshot;
  conciergeContext: string;
  delivery: {
    resend: {
      status: "not_configured" | "available_not_sent";
      reason: string;
    };
  };
}

const sessionSummarySchema = z.object({
  summary: z.string(),
  carryForward: z.array(z.string()).default([]),
});

/**
 * Summarise a sequence of interaction events into a compact context handoff.
 * Run on MODELS.worker; no tools needed.
 *
 * @param events  Ordered list of events from this session.
 * @returns       A summary and a carry-forward bullet list.
 */
export async function summarizeInteractions(
  events: InteractionEvent[],
): Promise<SessionSummary> {
  if (events.length === 0) {
    return summarizeInteractionsFallback(events);
  }

  const eventLog = events.map(formatEvent).join("\n");

  try {
    const { object } = await generateObject({
      model: MODELS.worker,
      schema: sessionSummarySchema,
      schemaName: "SessionSummary",
      instructions: `You are a session state manager. Given a log of interaction events,
produce a concise summary for another concierge agent.

Return:
- summary: one compact paragraph, 3-5 sentences.
- carryForward: short facts or constraints that must survive into the next phase.

Do not include secrets, credentials, or raw personal contact details.`,
      prompt: `Session event log:\n\n${eventLog}`,
    });

    return object;
  } catch {
    return summarizeInteractionsFallback(events);
  }
}

/**
 * Build the payload the site can hand back to the visitor's concierge agent.
 * This is framework-neutral data: Eve agents can call it as a tool and decide
 * where to persist, display, or send the payload.
 */
export async function buildSessionHandBack(
  input: SessionHandBackInput,
): Promise<SessionHandBackPayload> {
  const prefs = normalizeHandoffPrefs(input.prefs);
  const configuration = normalizeConfiguration(input.configuration, input.sessionId);
  const summary =
    input.events && input.events.length > 0
      ? await summarizeInteractions(input.events)
      : summarizeFromPrefsAndConfig(prefs, configuration);

  const sessionId = input.sessionId ?? configuration.sessionId;

  return {
    version: 1,
    kind: "brim-session-handback",
    sessionId,
    language: prefs.language,
    dir: prefs.dir,
    summary: summary.summary,
    carryForward: summary.carryForward,
    prefs,
    configuration: {
      ...configuration,
      sessionId,
    },
    conciergeContext: formatConciergeContext({
      sessionId,
      prefs,
      configuration,
      summary,
    }),
    delivery: {
      resend: resendStatus(),
    },
  };
}

function normalizeHandoffPrefs(prefs?: HandoffPrefs): SessionHandBackPayload["prefs"] {
  const language = normalizeLanguage(prefs?.language);
  const dir = getTextDirection(language);
  const toneMode = normalizeToneMode(prefs?.toneMode ?? prefs?.tone ?? prefs?.density);

  return {
    interests: prefs?.interests ?? [],
    tone: prefs?.tone,
    toneMode,
    density: prefs?.density,
    intent: prefs?.intent,
    notes: prefs?.notes,
    language,
    dir,
  };
}

function normalizeConfiguration(
  configuration?: SessionConfigurationSnapshot | Record<string, unknown>,
  sessionId?: string,
): SessionConfigurationSnapshot {
  if (!configuration) {
    return { sessionId, sections: [], contentRefs: [] };
  }

  const record = configuration as Record<string, unknown>;
  const sections = Array.isArray(record.sections)
    ? record.sections
        .map(sectionFromUnknown)
        .filter((section): section is SessionConfiguredSection => Boolean(section))
    : [];

  return {
    sessionId: stringFrom(record.sessionId) ?? sessionId,
    url: stringFrom(record.url),
    theme: record.theme,
    sections,
    contentRefs: collectContentRefs(record),
  };
}

function sectionFromUnknown(value: unknown): SessionConfiguredSection | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const props = record.props && typeof record.props === "object" ? record.props : {};

  return {
    id: stringFrom(record.id),
    component: stringFrom(record.component),
    title: sectionTitle(props as Record<string, unknown>),
    status: stringFrom(record.status),
  };
}

function sectionTitle(props: Record<string, unknown>): string | undefined {
  return (
    stringFrom(props.title) ??
    stringFrom(props.headline) ??
    stringFrom(props.eyebrow)
  );
}

function collectContentRefs(record: Record<string, unknown>): string[] {
  const explicitRefs = record.contentRefs;
  if (Array.isArray(explicitRefs)) {
    return explicitRefs.map((ref) => String(ref)).filter(Boolean);
  }

  const sections = record.sections;
  if (!Array.isArray(sections)) return [];

  return sections.flatMap((section) => {
    if (!section || typeof section !== "object" || Array.isArray(section)) return [];
    const sectionRecord = section as Record<string, unknown>;
    const refs = sectionRecord.contentRefs;
    if (!Array.isArray(refs)) return [];

    return refs
      .map((ref) => {
        if (!ref || typeof ref !== "object" || Array.isArray(ref)) return null;
        return stringFrom((ref as Record<string, unknown>).ref);
      })
      .filter((ref): ref is string => Boolean(ref));
  });
}

function summarizeFromPrefsAndConfig(
  prefs: SessionHandBackPayload["prefs"],
  configuration: SessionConfigurationSnapshot,
): SessionSummary {
  const sections = configuration.sections?.map((section) => section.component).filter(Boolean) ?? [];
  const summary = [
    prefs.intent ? `The shopper intent is ${prefs.intent}.` : "The shopper intent is not yet explicit.",
    prefs.interests.length
      ? `Interests captured: ${prefs.interests.join(", ")}.`
      : "No specific interests were captured.",
    sections.length
      ? `Configured sections: ${sections.join(", ")}.`
      : "No configured sections were provided.",
  ].join(" ");

  return {
    summary,
    carryForward: [
      `Language: ${prefs.language} (${prefs.dir})`,
      `Tone mode: ${prefs.toneMode}`,
      prefs.density ? `Density: ${prefs.density}` : null,
      prefs.intent ? `Intent: ${prefs.intent}` : null,
    ].filter((item): item is string => Boolean(item)),
  };
}

function summarizeInteractionsFallback(events: InteractionEvent[]): SessionSummary {
  if (events.length === 0) {
    return {
      summary: "No interaction events were available for this session.",
      carryForward: [],
    };
  }

  const lastEvents = events.slice(-3).map((event) => `${event.actor}: ${event.description}`);
  return {
    summary: `The session recorded ${events.length} interaction event(s). Latest activity: ${lastEvents.join(" ")}`,
    carryForward: lastEvents,
  };
}

function formatConciergeContext(params: {
  sessionId?: string;
  prefs: SessionHandBackPayload["prefs"];
  configuration: SessionConfigurationSnapshot;
  summary: SessionSummary;
}): string {
  const sections =
    params.configuration.sections
      ?.map((section) => section.component ?? section.id)
      .filter(Boolean)
      .join(", ") || "none";

  return [
    "BRIM session hand-back",
    params.sessionId ? `Session: ${params.sessionId}` : null,
    `Language: ${params.prefs.language} (${params.prefs.dir})`,
    `Tone mode: ${params.prefs.toneMode}`,
    params.prefs.intent ? `Intent: ${params.prefs.intent}` : null,
    params.prefs.interests.length
      ? `Interests: ${params.prefs.interests.join(", ")}`
      : null,
    `Configured sections: ${sections}`,
    `Summary: ${params.summary.summary}`,
    params.summary.carryForward.length
      ? `Carry forward: ${params.summary.carryForward.join("; ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatEvent(event: InteractionEvent, index: number): string {
  const payload = safePayload(event.payload);
  return (
    `[${index + 1}] ${event.at} | ${event.actor}: ${event.description}` +
    (payload ? `\n    payload: ${payload}` : "")
  );
}

function safePayload(payload: unknown): string | null {
  if (payload === undefined) return null;
  try {
    return JSON.stringify(payload);
  } catch {
    return "[unserializable payload]";
  }
}

function resendStatus(): SessionHandBackPayload["delivery"]["resend"] {
  if (process.env.RESEND_API_KEY) {
    return {
      status: "available_not_sent",
      reason: "RESEND_API_KEY is present, but this helper only builds the hand-back payload.",
    };
  }

  return {
    status: "not_configured",
    reason: "RESEND_API_KEY is not present; email delivery remains a future integration.",
  };
}

function stringFrom(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}
