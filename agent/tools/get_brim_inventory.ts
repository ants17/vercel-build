import { defineTool } from "eve/tools";
import { z } from "zod";

import { buildVisitorInventory } from "@/lib/inventory";

const collectionSchema = z.enum(["men", "women", "kids"]);

export default defineTool({
  description:
    "Select BRIM hats, theme hints, personalized prices, and shipping offers from the canonical catalog.",
  inputSchema: z.object({
    intent: z.string().optional(),
    interests: z.array(z.string()).optional(),
    constraints: z.array(z.string()).optional(),
    hiddenPrefs: z.array(z.string()).optional(),
    knownFacts: z.array(z.string()).optional(),
    tone: z.string().optional(),
    density: z.string().optional(),
    accessibility: z.array(z.string()).optional(),
    collection: collectionSchema.optional(),
    limit: z.number().int().min(0).max(24).optional(),
    excludeSlugs: z.array(z.string()).optional(),
  }),
  async execute(input) {
    const { collection, limit, excludeSlugs, ...preferences } = input;
    return buildVisitorInventory(preferences, { collection, limit, excludeSlugs });
  },
});
