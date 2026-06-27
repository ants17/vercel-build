import { generateText } from "ai";
import { advise, MODELS } from "@/lib/ai/models";
import type { UiPlan } from "@/agents/ui";
import type { Prefs } from "@/agents/front";

export interface ReviewResult {
  approved: boolean;
  notes: string;
}

/**
 * The administrator agent (Opus advisor tier).
 *
 * Reviews a proposed UI plan against the visitor's negotiated preferences,
 * checking for fit (does the layout serve the intent?), coherence (do the
 * sections form a logical narrative?), and completeness (are the preferences
 * honoured?).
 *
 * @param plan   The UI plan produced by the UI agent.
 * @param prefs  The negotiated visitor preferences from the front agent.
 * @returns      Approval verdict and actionable notes.
 */
export async function reviewPlan(plan: UiPlan, prefs: Prefs): Promise<ReviewResult> {
  const planSummary = JSON.stringify(plan, null, 2);

  const prefsSummary = [
    `Intent: ${prefs.intent}`,
    `Interests: ${prefs.interests.join(", ")}`,
    `Tone: ${prefs.tone}`,
    `Density: ${prefs.density}`,
    prefs.notes ? `Notes: ${prefs.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  // Use the advisor call-up (Opus) for the critique.
  const critique = await advise({
    question:
      "Does this UI plan faithfully serve the visitor's preferences? " +
      "Check: (1) theme preset and tone match, (2) sections cover the stated interests, " +
      "(3) density choice is respected, (4) section order is narratively coherent, " +
      "(5) the intent is addressed by at least one prominent section. " +
      "End your response with a single line: VERDICT: APPROVED or VERDICT: REJECTED",
    draft: planSummary,
    context: prefsSummary,
  });

  const approved = /VERDICT:\s*APPROVED/i.test(critique);

  // Strip the verdict line from the notes so callers get clean feedback.
  const notes = critique.replace(/\nVERDICT:.*$/im, "").trim();

  // If the fast path approves, we're done. Otherwise escalate with a full
  // generateText call on MODELS.advisor to get richer revision guidance.
  if (!approved) {
    const { text: detailedNotes } = await generateText({
      model: MODELS.advisor,
      instructions:
        "You are a senior UX strategist reviewing a rejected UI plan. " +
        "Provide specific, actionable revision instructions the UI agent can act on. " +
        "Be concise — bullet points, not paragraphs.",
      prompt: `Visitor preferences:\n${prefsSummary}\n\nRejected plan:\n${planSummary}\n\nInitial critique:\n${notes}\n\nList the specific changes needed.`,
    });
    return { approved: false, notes: detailedNotes };
  }

  return { approved: true, notes };
}
