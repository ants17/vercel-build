import type { Persona } from "./schema";

/**
 * Seed personas. These double as the "rehearsed personas" that keep the live
 * demo deterministic — known-good preference paths the human agent can run.
 */
export const personaPresets: Persona[] = [
  {
    id: "preset-maya",
    name: "Maya — pragmatic founder",
    identity: {
      role: "Early-stage startup founder",
      context: "Evaluating tools fast between fundraising meetings.",
    },
    intent: "Find out quickly whether this can ship value this week, and what it costs.",
    preferences: {
      interests: ["pricing", "speed to value", "integrations"],
      tone: "casual",
      density: "compact",
      constraints: ["limited time", "tight budget"],
    },
    knownFacts: [
      "Runs a 4-person team",
      "Has used three competing tools already",
      "Cares about total cost, not feature count",
    ],
    hiddenPrefs: ["Will only commit if there is a free trial", "Distrusts long enterprise sales motions"],
  },
  {
    id: "preset-dr-okafor",
    name: "Dr. Okafor — careful researcher",
    identity: {
      role: "Academic researcher in public health",
      context: "Assessing credibility and evidence before adopting anything.",
    },
    intent: "Understand the methodology and see citations before trusting claims.",
    preferences: {
      interests: ["evidence", "methodology", "data sources"],
      tone: "formal",
      density: "comfortable",
      accessibility: ["high contrast", "readable typography"],
    },
    knownFacts: [
      "Publishes peer-reviewed work",
      "Skeptical of marketing language",
      "Prefers depth over breadth",
    ],
    hiddenPrefs: ["Wants every claim sourced", "Bounces if content feels promotional"],
  },
  {
    id: "preset-theo",
    name: "Theo — playful creative",
    identity: {
      role: "Independent designer and content creator",
      context: "Browsing for inspiration and delight as much as utility.",
    },
    intent: "See something visually distinctive that sparks ideas.",
    preferences: {
      interests: ["design", "examples", "community"],
      tone: "playful",
      density: "comfortable",
    },
    knownFacts: ["Values aesthetics highly", "Shares finds with a large following"],
    hiddenPrefs: ["Loves bold accent colors", "Turned off by generic corporate layouts"],
  },
];
