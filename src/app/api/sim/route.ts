import { runConciergeSession } from "@/lib/session/orchestrator";
import { personaPresets } from "@/lib/persona/presets";
import { personaSchema, type Persona } from "@/lib/persona/schema";

// Long-running: allow up to 5 minutes for the full agent negotiation + UI design.
export const maxDuration = 300;

/**
 * This endpoint triggers an expensive multi-agent run (Opus + Sonnet LLM calls),
 * so it is guarded against unauthenticated abuse: when SIM_SECRET is set it
 * requires a matching `x-sim-secret` header; otherwise it is allowed only
 * outside production (local dev / demo). Production deployments must set
 * SIM_SECRET (or front this with real auth).
 */
function authorized(req: Request): boolean {
  const secret = process.env.SIM_SECRET;
  if (secret) return req.headers.get("x-sim-secret") === secret;
  return process.env.NODE_ENV !== "production";
}

export async function POST(req: Request): Promise<Response> {
  if (!authorized(req)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { personaId?: unknown; persona?: unknown } = {};
  try {
    body = (await req.json()) as { personaId?: unknown; persona?: unknown };
  } catch {
    // Empty or non-JSON body — fall through to the default persona.
  }

  // Resolve the persona. Untrusted input is validated against personaSchema
  // before it can reach the agents or the database.
  let persona: Persona;
  if (body.persona !== undefined) {
    const parsed = personaSchema.safeParse(body.persona);
    if (!parsed.success) {
      return Response.json(
        { ok: false, error: "Invalid persona payload" },
        { status: 400 },
      );
    }
    persona = parsed.data;
  } else if (body.personaId !== undefined) {
    if (typeof body.personaId !== "string") {
      return Response.json({ ok: false, error: "Invalid personaId" }, { status: 400 });
    }
    const found = personaPresets.find((p) => p.id === body.personaId);
    if (!found) {
      return Response.json({ ok: false, error: "Unknown personaId" }, { status: 400 });
    }
    persona = found;
  } else {
    persona = personaPresets[0];
  }

  try {
    const { sessionId, prefs } = await runConciergeSession(persona);
    return Response.json({ ok: true, sessionId, url: `/s/${sessionId}`, prefs });
  } catch (e) {
    // Log details server-side; return a generic message so internals (DB errors,
    // stack traces) are never leaked to the caller.
    console.error("[/api/sim] session failed:", e);
    return Response.json({ ok: false, error: "Session failed" }, { status: 500 });
  }
}
