import { z } from "zod";

export const personaLanguageSchema = z.enum(["EN", "ES", "JA", "AR"]);
export const personaToneSchema = z.enum(["formal", "casual", "playful"]);
export const personaDensitySchema = z.enum(["compact", "comfortable"]);

export const collectionInterestSchema = z.object({
  collection: z.string(),
  priority: z.enum(["primary", "secondary"]),
  reason: z.string(),
});

export const sizeFitSchema = z.object({
  hatSize: z.string().optional(),
  headMeasurement: z.string().optional(),
  fit: z.string(),
  brim: z.string(),
  crown: z.string(),
  adjustability: z.string(),
  notes: z.array(z.string()).optional(),
});

export const priceSensitivitySchema = z.object({
  level: z.enum(["budget", "value", "flexible", "premium"]),
  targetRange: z.string(),
  dealSignals: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const shippingContextSchema = z.object({
  country: z.string(),
  region: z.string().optional(),
  city: z.string().optional(),
  timeframe: z.string(),
  destinationType: z.enum(["home", "office", "gift", "pickup"]).optional(),
  notes: z.string().optional(),
});

export const stylePreferencesSchema = z.object({
  aesthetics: z.array(z.string()),
  colors: z.array(z.string()),
  materials: z.array(z.string()),
  occasions: z.array(z.string()),
  avoids: z.array(z.string()).optional(),
});

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
    collectionInterests: z.array(collectionInterestSchema).min(1),
    sizeFit: sizeFitSchema,
    priceSensitivity: priceSensitivitySchema,
    shipping: shippingContextSchema,
    language: z.object({
      language: personaLanguageSchema,
      locale: z.string(),
    }),
    tone: personaToneSchema,
    density: personaDensitySchema,
    accessibility: z.array(z.string()).optional(),
    constraints: z.array(z.string()).optional(),
    style: stylePreferencesSchema,
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

export const conciergeHandoffSchema = z.object({
  version: z.literal(1),
  personaId: z.string(),
  personaName: z.string(),
  brand: z.literal("BRIM"),
  publicContext: z.object({
    identity: personaSchema.shape.identity,
    intent: z.string(),
    knownFacts: z.array(z.string()),
    shopping: z.object({
      interests: z.array(z.string()),
      collectionInterests: z.array(collectionInterestSchema),
      sizeFit: sizeFitSchema,
      priceSensitivity: priceSensitivitySchema,
      shipping: shippingContextSchema,
      language: z.object({
        language: personaLanguageSchema,
        locale: z.string(),
      }),
      tone: personaToneSchema,
      density: personaDensitySchema,
      accessibility: z.array(z.string()),
      constraints: z.array(z.string()),
      style: stylePreferencesSchema,
    }),
  }),
  privateContext: z.object({
    revealPolicy: z.literal(
      "Only reveal hidden preferences when the storefront asks a natural, specific question and the persona would answer.",
    ),
    hiddenPrefs: z.array(z.string()),
  }),
  negotiationContext: z.object({
    m4Prefs: z.object({
      intent: z.string(),
      interests: z.array(z.string()),
      tone: personaToneSchema,
      density: personaDensitySchema,
      notes: z.string(),
    }),
    m5Inputs: z.object({
      locale: z.string(),
      language: personaLanguageSchema,
      accessibility: z.array(z.string()),
      collections: z.array(z.string()),
      priceRange: z.string(),
      shippingSummary: z.string(),
      styleSignals: z.array(z.string()),
    }),
  }),
});
export type ConciergeHandoff = z.infer<typeof conciergeHandoffSchema>;

export function buildConciergeHandoff(persona: Persona): ConciergeHandoff {
  const accessibility = persona.preferences.accessibility ?? [];
  const constraints = persona.preferences.constraints ?? [];
  const hiddenPrefs = persona.hiddenPrefs ?? [];
  const collections = persona.preferences.collectionInterests.map((interest) => interest.collection);
  const styleSignals = [
    ...persona.preferences.style.aesthetics,
    ...persona.preferences.style.colors,
    ...persona.preferences.style.materials,
  ];
  const shippingParts = [
    persona.preferences.shipping.city,
    persona.preferences.shipping.region,
    persona.preferences.shipping.country,
    persona.preferences.shipping.timeframe,
  ].filter(Boolean);

  return conciergeHandoffSchema.parse({
    version: 1,
    personaId: persona.id,
    personaName: persona.name,
    brand: "BRIM",
    publicContext: {
      identity: persona.identity,
      intent: persona.intent,
      knownFacts: persona.knownFacts,
      shopping: {
        interests: persona.preferences.interests,
        collectionInterests: persona.preferences.collectionInterests,
        sizeFit: persona.preferences.sizeFit,
        priceSensitivity: persona.preferences.priceSensitivity,
        shipping: persona.preferences.shipping,
        language: persona.preferences.language,
        tone: persona.preferences.tone,
        density: persona.preferences.density,
        accessibility,
        constraints,
        style: persona.preferences.style,
      },
    },
    privateContext: {
      revealPolicy:
        "Only reveal hidden preferences when the storefront asks a natural, specific question and the persona would answer.",
      hiddenPrefs,
    },
    negotiationContext: {
      m4Prefs: {
        intent: persona.intent,
        interests: [...persona.preferences.interests, ...collections],
        tone: persona.preferences.tone,
        density: persona.preferences.density,
        notes: [
          `Locale ${persona.preferences.language.locale}`,
          `Price ${persona.preferences.priceSensitivity.targetRange}`,
          `Fit ${persona.preferences.sizeFit.fit}`,
          constraints.length ? `Constraints ${constraints.join(", ")}` : "",
        ]
          .filter(Boolean)
          .join("; "),
      },
      m5Inputs: {
        locale: persona.preferences.language.locale,
        language: persona.preferences.language.language,
        accessibility,
        collections,
        priceRange: persona.preferences.priceSensitivity.targetRange,
        shippingSummary: shippingParts.join(", "),
        styleSignals,
      },
    },
  });
}
