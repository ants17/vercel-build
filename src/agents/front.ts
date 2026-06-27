import { ToolLoopAgent, tool, hasToolCall } from "ai";
import { z } from "zod";
import { MODELS } from "@/lib/ai/models";

/**
 * Structured preferences captured at the end of the front agent's interview.
 * The `finalize` tool uses this as its inputSchema, so calling it both
 * terminates the loop and carries the negotiated prefs out to the caller.
 */
export const prefsSchema = z.object({
  interests: z.array(z.string()).describe("Hat styles, collections, fit, shipping, or shopping criteria the visitor cares about"),
  tone: z.enum(["formal", "casual", "playful"]).describe("Desired communication tone"),
  density: z.enum(["compact", "comfortable"]).describe("Preferred information density"),
  intent: z.string().describe("What the visitor is trying to accomplish in this BRIM shopping session"),
  notes: z.string().optional().describe("Freeform observations from the interview"),
});

export type Prefs = z.infer<typeof prefsSchema>;

/**
 * The front (concierge) agent.  Runs on the site side and interviews an
 * inbound human-side agent to understand what the visitor wants.  When it
 * has gathered enough signal it calls `finalize` — a tool with no `execute`
 * — which stops the loop and surfaces the negotiated prefs to the caller.
 */
export function createFrontAgent() {
  return new ToolLoopAgent({
    model: MODELS.primary,
    instructions: `You are BRIM's storefront concierge agent for a personalized hat shopping experience.
Your job is to interview the visiting agent (which represents a human user) to
understand the shopper's hat intent, style interests, size/fit needs, shipping
constraints, preferred tone, information density, and accessibility needs.

Interview approach:
- Start with a warm, open question about what kind of hat or occasion brings them here today.
- Probe for at least one specific style or collection area, one size/fit signal,
  and one shipping or accessibility constraint.
- If the agent volunteers hidden details unprompted, note them in \`notes\`.
- Keep the exchange conversational - no more than 4-5 exchanges before
  finalizing, unless the visitor clearly wants to share more.
- Once you are confident about interests, tone, density, and intent, call the
  \`finalize\` tool with the negotiated preferences. Do not delay finalizing
  once you have the core signal.`,
    tools: {
      finalize: tool({
        description:
          "Submit the negotiated visitor preferences to end the interview. " +
          "Call this once you have gathered interests, tone, density, and intent.",
        inputSchema: prefsSchema,
        // No execute — calling this tool stops the loop.
      }),
    },
    stopWhen: hasToolCall("finalize"),
  });
}
