import { Client } from "eve/client";

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

type OpenSessionResult = {
  sessionId: string;
  url: string;
  status: "configuring";
};

function serviceBearerToken(): string | undefined {
  return process.env.AGENT_SERVICE_BEARER_TOKEN ?? process.env.MCP_SERVICE_BEARER_TOKEN;
}

function createEveClient(req: Request): Client {
  const bearer = serviceBearerToken();
  return new Client({
    host: new URL(req.url).origin,
    ...(bearer ? { auth: { bearer }, redirect: "manual" as const } : {}),
  });
}

function isOpenSessionResult(output: unknown): output is OpenSessionResult {
  if (!output || typeof output !== "object" || Array.isArray(output)) return false;
  const record = output as Record<string, unknown>;
  return (
    typeof record.sessionId === "string" &&
    typeof record.url === "string" &&
    record.status === "configuring"
  );
}

function openSessionPrompt(persona: Persona): string {
  return [
    "Start a BRIM storefront simulation for this shopper persona.",
    "",
    "Required first action:",
    "- Call the `open_brim_session` tool immediately with the persona name, the full persona object, and any already-known public shopping prefs.",
    "- After that tool returns, continue configuring the BRIM storefront in this Eve session using BRIM inventory, localized copy, UI config, verification, and hand-back helpers.",
    "",
    "Persona JSON:",
    JSON.stringify(persona, null, 2),
  ].join("\n");
}

async function startEveConciergeSession(
  req: Request,
  persona: Persona,
): Promise<{ eveSessionId: string; opened: OpenSessionResult }> {
  const client = createEveClient(req);
  const session = client.session();
  const response = await session.send(openSessionPrompt(persona));

  for await (const event of response) {
    if (event.type !== "action.result") continue;
    const result = event.data.result;
    if (result.kind !== "tool-result" || result.toolName !== "open_brim_session") continue;
    if (result.isError) {
      throw new Error("Eve open_brim_session tool failed.");
    }
    if (!isOpenSessionResult(result.output)) {
      throw new Error("Eve open_brim_session returned an unexpected payload.");
    }
    return {
      eveSessionId: response.sessionId,
      opened: result.output,
    };
  }

  throw new Error("Eve did not open a BRIM session.");
}

export async function POST(req: Request): Promise<Response> {
  if (!authorized(req)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (process.env.NODE_ENV === "production" && !serviceBearerToken()) {
    return Response.json(
      { ok: false, error: "Eve service bearer token is not configured." },
      { status: 500 },
    );
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
    const { eveSessionId, opened } = await startEveConciergeSession(req, persona);
    return Response.json({
      ok: true,
      eveSessionId,
      sessionId: opened.sessionId,
      url: opened.url,
      status: opened.status,
    });
  } catch (e) {
    // Log details server-side; return a generic message so internals (DB errors,
    // stack traces) are never leaked to the caller.
    console.error("[/api/sim] session failed:", e);
    return Response.json({ ok: false, error: "Session failed" }, { status: 500 });
  }
}
