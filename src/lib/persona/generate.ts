import { generateText, Output } from "ai";
import { MODELS } from "@/lib/ai/models";
import { personaDraftSchema, type PersonaDraft } from "./schema";

/**
 * LLM-assisted persona generation from a short brief. Server-only — uses the
 * AI Gateway. Guarded so the build/dev server works before a key is set.
 */
export async function generatePersona(brief: string): Promise<PersonaDraft> {
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
    throw new Error(
      "AI Gateway not configured. Set AI_GATEWAY_API_KEY in .env.local to generate personas.",
    );
  }

  const { output } = await generateText({
    model: MODELS.worker,
    instructions:
      "You create realistic, specific user personas for an agent-concierge demo. " +
      "The persona represents a human whose AI agent will visit a website on their behalf. " +
      "Make preferences concrete and give the persona 2-4 hiddenPrefs that only surface when probed.",
    prompt: `Create one persona from this brief:\n\n${brief}`,
    output: Output.object({ schema: personaDraftSchema }),
  });

  return output;
}
