import { generateText, Output } from "ai";
import { z } from "zod";
import { MODELS } from "@/lib/ai/models";
import { COMPONENT_KINDS, THEME_PRESETS } from "@/lib/manifest/schema";
import type { Prefs } from "@/agents/front";

/**
 * The schema for the UI plan the agent emits.  A subset of PageManifest —
 * the orchestrator maps this into a full PageManifest (adding ids, order, etc).
 */
export const uiPlanSchema = z.object({
  theme: z.object({
    preset: z.enum(THEME_PRESETS),
    accentColor: z.string().describe("Hex color, e.g. #6366f1"),
    density: z.enum(["compact", "comfortable"]),
  }),
  sections: z.array(
    z.object({
      component: z.enum(COMPONENT_KINDS),
      props: z.record(z.string(), z.unknown()).describe("Component-specific props"),
    }),
  ),
});

export type UiPlan = z.infer<typeof uiPlanSchema>;

/**
 * Run the UI agent.  Given negotiated visitor preferences, produce a
 * theme + ordered section plan for the personalised page.
 */
export async function runUiAgent(prefs: Prefs): Promise<UiPlan> {
  const { output } = await generateText({
    model: MODELS.worker,
    instructions: `You are a UI architect for a personalised landing page generator.
Given a visitor's negotiated preferences, design the most effective page layout
and visual theme to serve their intent and interests.

Rules:
- Choose a theme preset and accent color that matches the visitor's tone.
- Select 3-6 sections from the available component kinds in a logical reading order.
- For each section include minimal representative props (title/body strings,
  feature labels, stat values, etc.) — actual copy will be filled later.
- Prefer a "hero" section first and a "ctaBanner" last when appropriate.
- Match density preference: compact → fewer, denser sections; comfortable → more
  breathing room and introductory sections.`,
    prompt: `Design a personalised page for a visitor with the following preferences:

Intent: ${prefs.intent}
Interests: ${prefs.interests.join(", ")}
Tone: ${prefs.tone}
Density: ${prefs.density}
${prefs.notes ? `Notes: ${prefs.notes}` : ""}

Return a UI plan with theme and sections.`,
    output: Output.object({ schema: uiPlanSchema }),
  });

  return output;
}
