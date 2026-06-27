import { defineTool } from "eve/tools";
import { z } from "zod";

import { writeLocalizedSectionCopy } from "@/agents/content";
import { prefsSchema } from "@/agents/front";
import { componentKindSchema, contentRefSchema } from "@/lib/manifest/schema";

export default defineTool({
  description:
    "Write localized BRIM storefront section props, including EN/ES/JA/AR copy and RTL direction.",
  inputSchema: z.object({
    kind: componentKindSchema,
    prefs: prefsSchema,
    refs: z.array(contentRefSchema).default([]),
    language: z.string().optional(),
    toneMode: z.string().optional(),
    includeProducts: z.boolean().optional(),
    productCount: z.number().int().min(0).max(8).optional(),
  }),
  async execute(input) {
    return writeLocalizedSectionCopy(input);
  },
});
