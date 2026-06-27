import { defineAgent } from "eve";

export default defineAgent({
  description:
    "Shapes full shopper personas into safe concierge handoff context for BRIM negotiation.",
  model: "anthropic/claude-sonnet-4.6",
  reasoning: "medium",
});
