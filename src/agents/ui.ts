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
    accent: z.enum(THEME_PRESETS).optional(),
    accentColor: z.string().optional().describe("Hex color, e.g. #7B2D3A"),
    density: z.enum(["compact", "comfortable"]),
    direction: z.enum(["ltr", "rtl"]).default("ltr"),
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
    instructions: `You are a UI architect designing a personalized BRIM hat storefront for a specific shopper.

Your job is to choose the best 3-6 BRIM sections and write REAL, shopper-tailored content in every section's props.

RULES - follow exactly:
1. Always start with a "hero" section.
2. End with a "ctaBanner" when it fits the intent; otherwise end with whichever section closes the story best.
3. For EVERY section you output, fill ALL non-optional props with specific, compelling copy tailored to the visitor's intent, interests, and tone. NEVER leave a required field empty or set it to a placeholder.
4. Component-specific requirements:
   - hero: write an editorial hat-shopping headline, subheadline, optional primaryCta/secondaryCta, and an optional product image.
   - filterBar: use hat categories such as All, Fedoras, Caps, Beanies, Straw, Kids, or Gift.
   - productList: include ready/partial/skeleton product cards with names, prices, descriptions, imageUrl when known, sizes, colors, and ctaLabel where ready.
   - statCallout: write 1-4 concrete BRIM fit, shipping, or catalog stats.
   - testimonial: write one believable shopper quote with author and optional place.
   - faqAccordion: write 3-5 fit, shipping, return, sizing, or gift questions the shopper would ask.
   - ctaBanner: write headline/body and cta.label that closes the page.
5. Use only BRIM theme presets: "heritage", "coastal", "field", "mono", "sun".
6. Set direction to "rtl" only if the shopper language is Arabic; otherwise use "ltr".
7. Match density: compact -> prefer hero + filterBar + productList + ctaBanner; comfortable -> add stats, testimonial, or FAQ for breathing room.`,
    prompt: `Design a personalized BRIM hat storefront for a shopper with the following preferences:

Intent: ${prefs.intent}
Interests: ${prefs.interests.join(", ")}
Tone: ${prefs.tone}
Density: ${prefs.density}
${prefs.notes ? `Notes: ${prefs.notes}` : ""}

Return a UI plan with theme and sections. Every section must have fully written, specific props - do not use placeholder text.`,
    output: Output.object({ schema: uiPlanSchema }),
  });

  return output;
}
