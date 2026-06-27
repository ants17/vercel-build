import { runConciergeSession } from "@/lib/session/orchestrator";
import { personaPresets } from "@/lib/persona/presets";
import type { Persona } from "@/lib/persona/schema";

// Long-running: allow up to 5 minutes for the full agent negotiation + UI design.
export const maxDuration = 300;

export async function POST(req: Request): Promise<Response> {
  let body: { personaId?: string; persona?: Persona } = {};
  try {
    body = (await req.json()) as { personaId?: string; persona?: Persona };
  } catch {
    // Empty or non-JSON body — treat as default persona.
  }

  // Resolve the persona: explicit object > preset by id > first preset.
  let persona: Persona;
  if (body.persona) {
    persona = body.persona;
  } else if (body.personaId) {
    const found = personaPresets.find((p) => p.id === body.personaId);
    if (!found) {
      return Response.json(
        { ok: false, error: `No preset found with id "${body.personaId}".` },
        { status: 400 },
      );
    }
    persona = found;
  } else {
    persona = personaPresets[0];
  }

  try {
    const { sessionId, prefs } = await runConciergeSession(persona);
    return Response.json({
      ok: true,
      sessionId,
      url: `/s/${sessionId}`,
      prefs,
    });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
