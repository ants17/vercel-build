import { defineAgent } from "eve";

export default defineAgent({
  description:
    "Summarizes completed BRIM sessions into carry-forward memory for the human concierge agent.",
  model: "anthropic/claude-sonnet-4.6",
  reasoning: "medium",
});
