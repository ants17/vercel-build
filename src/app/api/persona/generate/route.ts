import { generatePersona, persistPersona } from "@/lib/persona/generate";
import { buildConciergeHandoff, personaSchema } from "@/lib/persona/schema";

export async function POST(req: Request) {
  let brief = "";
  try {
    const body = (await req.json()) as { brief?: string };
    brief = (body.brief ?? "").trim();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  if (!brief) {
    return Response.json({ ok: false, error: "A brief is required." }, { status: 400 });
  }

  try {
    const draft = await generatePersona(brief);
    const persona = personaSchema.parse({ ...draft, id: crypto.randomUUID() });
    const { personaRowId } = await persistPersona(persona);
    const handoff = buildConciergeHandoff(persona);

    return Response.json({ ok: true, persona, handoff, personaRowId, persisted: true });
  } catch (e) {
    const error = e instanceof Error ? e.message : "Generation failed.";
    const status = error.startsWith("AI Gateway not configured") ? 400 : 500;

    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Generation failed." },
      { status },
    );
  }
}
