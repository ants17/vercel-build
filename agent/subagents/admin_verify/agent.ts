import { defineAgent } from "eve";

export default defineAgent({
  description:
    "Reviews BRIM manifest plans for design, safety, localization, and product-contract fit before ready state.",
  model: "anthropic/claude-opus-4.8",
  reasoning: "high",
});
