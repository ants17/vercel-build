import { generateText } from "ai";
import { MODELS } from "@/lib/ai/models";
import type { ComponentKind, ContentRef } from "@/lib/manifest/schema";
import type { Prefs } from "@/agents/front";

export interface SectionCopyInput {
  kind: ComponentKind;
  prefs: Prefs;
  refs: ContentRef[];
}

export interface SectionCopy {
  title?: string;
  body: string;
  citations?: string[];
}

/**
 * Write copy for a single page section, grounded in retrieved content refs.
 *
 * @param input  Section kind, visitor preferences, and retrieved content.
 * @returns      Title, body, and citation strings for the section.
 */
export async function writeSectionCopy(input: SectionCopyInput): Promise<SectionCopy> {
  const { kind, prefs, refs } = input;

  const groundingBlock =
    refs.length > 0
      ? refs
          .map((r, i) => {
            const resolved = r.resolved;
            if (!resolved) return `[${i + 1}] ref: ${r.ref}`;
            return [
              `[${i + 1}] ${resolved.title ?? r.ref}`,
              resolved.body ? `  ${resolved.body}` : "",
            ]
              .filter(Boolean)
              .join("\n");
          })
          .join("\n\n")
      : "(no retrieved content — write from general knowledge)";

  const { text } = await generateText({
    model: MODELS.worker,
    instructions: `You are a copywriter producing section content for a personalised website.
Write concise, compelling copy that matches the visitor's tone and density preference.
Ground your writing in the provided content references where relevant.
Output JSON with keys: "title" (optional string), "body" (required string),
"citations" (optional array of strings citing the references you used, by number).`,
    prompt: `Section type: ${kind}
Visitor intent: ${prefs.intent}
Interests: ${prefs.interests.join(", ")}
Tone: ${prefs.tone}
Density: ${prefs.density}

Content references:
${groundingBlock}

Write the section copy as JSON.`,
  });

  // Parse the JSON the model returns.  Strip markdown fences if present.
  const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  const parsed = JSON.parse(cleaned) as SectionCopy;
  return parsed;
}
