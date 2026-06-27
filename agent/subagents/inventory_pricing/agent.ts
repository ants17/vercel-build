import { defineAgent } from "eve";

export default defineAgent({
  description:
    "Selects BRIM hats from the catalog and prepares personalized pricing and shipping recommendations.",
  model: "anthropic/claude-sonnet-4.6",
  reasoning: "medium",
});
