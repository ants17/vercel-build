import { defineTool } from "eve/tools";
import { z } from "zod";

import { buildSessionHandBack } from "@/agents/state";

const jsonRecord = z.record(z.string(), z.unknown());

const eventSchema = z.object({
  at: z.string(),
  actor: z.string(),
  description: z.string(),
  payload: z.unknown().optional(),
});

export default defineTool({
  description:
    "Build a compact BRIM session hand-back payload for the shopper's concierge agent.",
  inputSchema: z.object({
    sessionId: z.string().optional(),
    prefs: jsonRecord.optional(),
    configuration: jsonRecord.optional(),
    events: z.array(eventSchema).max(100).optional(),
  }),
  async execute(input) {
    return buildSessionHandBack(input);
  },
});
