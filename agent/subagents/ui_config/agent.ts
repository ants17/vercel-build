import { defineAgent } from "eve";

export default defineAgent({
  description:
    "Generates BRIM manifest section props and streams component-ready configuration decisions.",
  model: "anthropic/claude-sonnet-4.6",
  reasoning: "medium",
});
