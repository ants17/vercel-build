import { defineTool } from "eve/tools";
import { z } from "zod";

import { getServerClient } from "@/lib/db/supabase";
import { pageManifestSchema } from "@/lib/manifest/schema";

const jsonRecord = z.record(z.string(), z.unknown());

export default defineTool({
  description:
    "Create a BRIM live storefront session and return the URL immediately before configuration work continues.",
  inputSchema: z.object({
    personaName: z.string().min(1),
    persona: jsonRecord,
    prefs: jsonRecord.optional(),
  }),
  outputSchema: z.object({
    sessionId: z.string(),
    url: z.string(),
    status: z.literal("configuring"),
  }),
  async execute({ personaName, persona, prefs }) {
    const supabase = getServerClient();
    const sessionId = crypto.randomUUID();
    const status = "configuring" as const;

    const { data: personaRow, error: personaError } = await supabase
      .from("personas")
      .insert({ name: personaName, doc: persona, is_preset: false })
      .select("id")
      .single();

    if (personaError || !personaRow) {
      throw new Error(`Failed to create persona: ${personaError?.message ?? "unknown error"}`);
    }

    const { error: sessionError } = await supabase.from("sessions").insert({
      id: sessionId,
      persona_id: personaRow.id,
      status,
      transcript: [],
      prefs: prefs ?? null,
    });

    if (sessionError) {
      throw new Error(`Failed to create session: ${sessionError.message}`);
    }

    const manifest = pageManifestSchema.parse({
      version: 1,
      sessionId,
      status,
      theme: {
        preset: "heritage",
        accentColor: "#7B2D3A",
        density: "comfortable",
      },
      sections: [],
    });

    const { error: manifestError } = await supabase.from("manifests").upsert(
      {
        session_id: sessionId,
        status,
        doc: manifest,
        version: 1,
      },
      { onConflict: "session_id" },
    );

    if (manifestError) {
      throw new Error(`Failed to create manifest: ${manifestError.message}`);
    }

    return { sessionId, url: `/s/${sessionId}`, status };
  },
});
