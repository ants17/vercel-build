import { generateText, Output } from "ai";
import { MODELS } from "@/lib/ai/models";
import { getServerClient } from "@/lib/db/supabase";
import { personaDraftSchema, personaSchema, type Persona, type PersonaDraft } from "./schema";

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
      "You create realistic, specific shopper personas for BRIM, an agent-personalized hat e-commerce storefront. " +
      "The persona represents a human whose concierge agent will visit BRIM ahead of them. " +
      "Fill every shopping field with concrete hat-buying context: intent, collection interests, size and fit, price sensitivity, shipping and location, language, locale, tone, density, accessibility, style preferences, and constraints. " +
      "Use language EN, ES, JA, or AR, and use a matching BCP 47 locale such as en-US, es-US, ja-JP, or ar-AE. " +
      "Give the persona 2-4 hiddenPrefs that should only surface if BRIM asks a natural, specific question the persona would answer.",
    prompt: `Create one full BRIM shopper persona from this brief:\n\n${brief}`,
    output: Output.object({ schema: personaDraftSchema }),
  });

  return output;
}

export async function persistPersona(persona: Persona): Promise<{ personaRowId: string }> {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("personas")
    .insert({ name: persona.name, doc: persona, is_preset: false })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to persist persona: ${error?.message ?? "unknown error"}`);
  }

  return { personaRowId: String(data.id) };
}

export async function getSavedPersonaById(id: string): Promise<Persona | null> {
  const supabase = getServerClient();
  const byRow = await supabase
    .from("personas")
    .select("doc")
    .eq("id", id)
    .maybeSingle();

  if (byRow.data) {
    const parsed = personaSchema.safeParse(byRow.data.doc);
    if (parsed.success) return parsed.data;
  }

  const byDoc = await supabase
    .from("personas")
    .select("doc")
    .contains("doc", { id })
    .limit(1)
    .maybeSingle();

  if (byDoc.error || !byDoc.data) return null;

  const parsed = personaSchema.safeParse(byDoc.data.doc);
  return parsed.success ? parsed.data : null;
}

export async function listSavedPersonas(limit = 12): Promise<Persona[]> {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("personas")
    .select("doc")
    .eq("is_preset", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    throw new Error(`Failed to load saved personas: ${error?.message ?? "unknown error"}`);
  }

  return data
    .map((row) => personaSchema.safeParse(row.doc))
    .filter((result) => result.success)
    .map((result) => result.data);
}
