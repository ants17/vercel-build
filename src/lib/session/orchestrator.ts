import { ToolLoopAgent, tool, hasToolCall, isStepCount } from "ai";
import type { ModelMessage } from "ai";
import { z } from "zod";
import { getServerClient } from "@/lib/db/supabase";
import { createHumanAgent } from "@/agents/human";
import { runUiAgent } from "@/agents/ui";
import { reviewPlan } from "@/agents/administrator";
import { prefsSchema, type Prefs } from "@/agents/front";
import { pageManifestSchema, type PageManifest } from "@/lib/manifest/schema";
import { MODELS } from "@/lib/ai/models";
import type { Persona } from "@/lib/persona/schema";

export async function runConciergeSession(
  persona: Persona,
): Promise<{ sessionId: string; prefs: Prefs; manifest: PageManifest }> {
  const supabase = getServerClient();
  const sessionId = crypto.randomUUID();

  // ── 1. Persist persona ──────────────────────────────────────────────────────
  const { data: personaRow, error: personaError } = await supabase
    .from("personas")
    .insert({ name: persona.name, doc: persona, is_preset: false })
    .select("id")
    .single();

  if (personaError || !personaRow) {
    throw new Error(`Failed to insert persona: ${personaError?.message ?? "unknown error"}`);
  }

  // ── 2. Open session ─────────────────────────────────────────────────────────
  const { error: sessionError } = await supabase.from("sessions").insert({
    id: sessionId,
    persona_id: personaRow.id,
    status: "negotiating",
    transcript: [],
  });

  if (sessionError) {
    throw new Error(`Failed to insert session: ${sessionError.message}`);
  }

  // ── 3. Build agents and run negotiation ─────────────────────────────────────
  // Human agent represents the persona; conversation continuity is maintained
  // via humanMessages accumulating across each askHuman call.
  const humanAgent = createHumanAgent(persona);
  const humanMessages: ModelMessage[] = [];

  const frontAgent = new ToolLoopAgent({
    model: MODELS.primary,
    instructions: `You are the site's concierge front agent. An inbound visitor agent
has arrived ahead of the human. Interview it by calling askHuman with ONE focused
preference question at a time (3-5 total), then call finalize with the extracted prefs.

Interview approach:
- Start with a warm, open question about what brings them here today.
- Probe for at least one specific interest area and one accessibility or density preference.
- If the agent volunteers hidden details unprompted, note them in \`notes\`.
- Keep the exchange conversational — no more than 4-5 exchanges before finalizing.
- Once you are confident about interests, tone, density, and intent, call finalize.`,
    tools: {
      askHuman: tool({
        description:
          "Send one focused question to the visitor's agent and receive its answer. " +
          "Call this once per question — do not batch multiple questions.",
        inputSchema: z.object({ question: z.string() }),
        execute: async ({ question }) => {
          const r = await humanAgent.generate({
            messages: [...humanMessages, { role: "user", content: question }],
          });
          humanMessages.push(
            { role: "user", content: question },
            { role: "assistant", content: r.text },
          );
          return r.text;
        },
      }),
      finalize: tool({
        description:
          "Submit the negotiated visitor preferences to end the interview. " +
          "Call this once you have gathered interests, tone, density, and intent.",
        inputSchema: prefsSchema,
        // No execute — calling this tool stops the loop.
      }),
    },
    // Stop on finalize, with a hard step ceiling so a non-converging model
    // can't loop forever (prefs extraction below throws if finalize never ran).
    stopWhen: [hasToolCall("finalize"), isStepCount(12)],
  });

  const result = await frontAgent.generate({
    prompt: "A visitor's agent has arrived ahead of the human. Interview it, then finalize.",
  });

  // ── 4. Extract prefs from the finalize tool call ────────────────────────────
  // staticToolCalls aggregates across all loop steps, so finalize is findable
  // regardless of how many askHuman calls preceded it.
  const finalizeCall = result.staticToolCalls.find((c) => c.toolName === "finalize");
  if (!finalizeCall) {
    throw new Error(
      "Front agent did not call finalize — negotiation ended without extracted prefs. " +
        "This may indicate the model looped without converging; check the session transcript.",
    );
  }
  const prefs = prefsSchema.parse(finalizeCall.input);

  // ── 5. Update session to configuring ────────────────────────────────────────
  const { error: configError } = await supabase
    .from("sessions")
    .update({ status: "configuring", prefs })
    .eq("id", sessionId);

  if (configError) {
    throw new Error(`Failed to update session to configuring: ${configError.message}`);
  }

  // ── 6. Run UI agent, then best-effort administrator review ──────────────────
  const plan = await runUiAgent(prefs);

  try {
    const review = await reviewPlan(plan, prefs);
    console.log("[orchestrator] Administrator review:", review);
  } catch (reviewErr) {
    // Non-blocking — log and continue; the plan is still used as-is.
    console.warn("[orchestrator] Administrator review failed (non-blocking):", reviewErr);
  }

  // ── 7. Build and validate the PageManifest ──────────────────────────────────
  const rawManifest = {
    version: 1,
    sessionId,
    status: "ready" as const,
    theme: plan.theme,
    sections: plan.sections.map((s, i) => ({
      id: `s-${i}`,
      component: s.component,
      props: s.props,
      order: i,
    })),
  };

  const manifest = pageManifestSchema.parse(rawManifest);

  // ── 8. Upsert manifest into Supabase ────────────────────────────────────────
  const { error: manifestError } = await supabase
    .from("manifests")
    .upsert(
      { session_id: sessionId, status: "ready", doc: manifest, version: 1 },
      { onConflict: "session_id" },
    );

  if (manifestError) {
    throw new Error(`Failed to upsert manifest: ${manifestError.message}`);
  }

  // ── 9. Mark session ready ───────────────────────────────────────────────────
  const { error: readyError } = await supabase
    .from("sessions")
    .update({ status: "ready" })
    .eq("id", sessionId);

  if (readyError) {
    throw new Error(`Failed to update session to ready: ${readyError.message}`);
  }

  return { sessionId, prefs, manifest };
}
