import { generateText, Output } from "ai";
import { z } from "zod";
import { MODELS } from "@/lib/ai/models";
import { THEME_PRESETS } from "@/lib/manifest/schema";
import { sectionSchema } from "@/lib/manifest/sections";
import type { Prefs } from "@/agents/front";

/**
 * The schema for the UI plan the agent emits.  A subset of PageManifest —
 * the orchestrator maps this into a full PageManifest (adding ids, order, etc).
 *
 * Each section uses a discriminated union so the model is forced to produce
 * real, validated props for whichever component it picks — no empty `{}`.
 */
export const uiPlanSchema = z.object({
  theme: z.object({
    preset: z.enum(THEME_PRESETS),
    accentColor: z.string().describe("Hex color, e.g. #6366f1"),
    density: z.enum(["compact", "comfortable"]),
  }),
  sections: z.array(sectionSchema).min(3).max(6),
});

export type UiPlan = z.infer<typeof uiPlanSchema>;

/**
 * Run the UI agent.  Given negotiated visitor preferences, produce a
 * theme + ordered section plan with fully-populated, persona-tailored props.
 */
export async function runUiAgent(prefs: Prefs): Promise<UiPlan> {
  const { output } = await generateText({
    model: MODELS.worker,
    instructions: `You are a UI architect designing a personalized landing page for a specific visitor.

Your job is to choose the best 3–6 sections and write REAL, persona-tailored content in every section's props.

RULES — follow exactly:
1. Always start with a "hero" section.
2. End with a "ctaBanner" when it fits the intent; otherwise end with whichever section closes the story best.
3. For EVERY section you output, fill ALL non-optional props with specific, compelling copy tailored to the visitor's intent, interests, and tone. NEVER leave a required field empty or set it to a placeholder.
4. Component-specific requirements:
   - hero: write a compelling headline, a 1-2 sentence subheadline, and a ctaLabel that matches their goal.
   - featureGrid: write 3 features, each with a short title and 1-2 sentence body that speaks to the visitor's interests.
   - pricingTable: write 2-3 plans with realistic names, prices, periods, and 3-5 features each; mark one as highlighted.
   - testimonialList: write 2-3 testimonials with believable quotes, author names, and roles relevant to the visitor's domain.
   - faqAccordion: write 3-5 questions the visitor would actually ask, with thorough answers.
   - ctaBanner: write a punchy headline and ctaLabel that closes the page with urgency.
   - richText: write a substantive body (at least 2 paragraphs separated by a blank line) relevant to the visitor's topic.
   - statCallout: write 3-5 stats with concrete label/value pairs that are meaningful for the visitor's interests.
5. Choose a theme preset and accent color that matches the visitor's tone:
   - formal/corporate → "corporate" or "editorial", neutral accent
   - casual/playful → "vibrant" or "minimal", bright accent
6. Match density: compact → pick denser sections (hero + featureGrid + ctaBanner); comfortable → add richText, testimonials, or stats for breathing room.`,
    prompt: `Design a personalized page for a visitor with the following preferences:

Intent: ${prefs.intent}
Interests: ${prefs.interests.join(", ")}
Tone: ${prefs.tone}
Density: ${prefs.density}
${prefs.notes ? `Notes: ${prefs.notes}` : ""}

Return a UI plan with theme and sections. Every section must have fully written, specific props — do not use placeholder text.`,
    output: Output.object({ schema: uiPlanSchema }),
  });

  return output;
}
