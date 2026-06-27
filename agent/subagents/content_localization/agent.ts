import { defineAgent } from "eve";

export default defineAgent({
  description:
    "Writes BRIM storefront copy in the shopper's tone and language, including RTL-aware Arabic.",
  model: "anthropic/claude-sonnet-4.6",
  reasoning: "medium",
});
