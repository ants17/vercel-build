import { z } from "zod";

/**
 * A Persona is "what the human's agent knows and brings to the site agent."
 * Authored in Persona Studio, it seeds the human-side agent's instructions and
 * the structured preferences it negotiates with our engine.
 */
export const personaSchema = z.object({
  id: z.string(),
  name: z.string(),
  identity: z.object({
    role: z.string(),
    context: z.string(),
  }),
  /** What they're seeking THIS visit. */
  intent: z.string(),
  preferences: z.object({
    interests: z.array(z.string()),
    tone: z.enum(["formal", "casual", "playful"]),
    density: z.enum(["compact", "comfortable"]),
    accessibility: z.array(z.string()).optional(),
    constraints: z.array(z.string()).optional(),
  }),
  /** Facts the agent may volunteer. */
  knownFacts: z.array(z.string()),
  /** Only revealed if the engine probes — gives the interview signal. */
  hiddenPrefs: z.array(z.string()).optional(),
});
export type Persona = z.infer<typeof personaSchema>;

/** LLM-generated draft (id is assigned after generation). */
export const personaDraftSchema = personaSchema.omit({ id: true });
export type PersonaDraft = z.infer<typeof personaDraftSchema>;
