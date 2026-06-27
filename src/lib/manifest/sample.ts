import type { PageManifest } from "./schema";

/**
 * A hardcoded manifest for the M2 demo (/demo). Includes one intentionally
 * broken section (pricingTable with no `plans`) to prove the renderer falls
 * back to a skeleton instead of crashing.
 */
export const sampleManifest: PageManifest = {
  version: 1,
  sessionId: "demo",
  status: "ready",
  theme: { preset: "vibrant", accentColor: "#7c3aed", density: "comfortable" },
  sections: [
    {
      id: "hero",
      component: "hero",
      order: 0,
      props: {
        eyebrow: "Configured for you",
        headline: "A site that assembled itself around your agent",
        subheadline:
          "Your preferences arrived before you did. Everything below was chosen for this visit.",
        ctaLabel: "See how it works",
      },
    },
    {
      id: "features",
      component: "featureGrid",
      order: 1,
      props: {
        title: "Why this is different",
        features: [
          { title: "Agent-first", body: "Your agent negotiates preferences before the page renders." },
          { title: "Live reconfigure", body: "Sections stream in as specialized agents finish." },
          { title: "Carry-forward memory", body: "What you do here is handed back to your agent." },
        ],
      },
    },
    {
      id: "pricing-broken",
      component: "pricingTable",
      order: 2,
      // Intentionally invalid (missing `plans`) -> renders a skeleton.
      props: { title: "This section is malformed on purpose" },
    },
    {
      id: "stats",
      component: "statCallout",
      order: 3,
      props: {
        title: "By the numbers",
        stats: [
          { label: "Time to configure", value: "1.8s", sub: "median" },
          { label: "Sections generated", value: "6" },
          { label: "Preferences captured", value: "12" },
        ],
      },
    },
    {
      id: "faq",
      component: "faqAccordion",
      order: 4,
      props: {
        title: "Questions",
        items: [
          { question: "Who configured this page?", answer: "A fan-out of UI, RAG, and content agents, supervised by an administrator agent." },
          { question: "Is the layout fixed?", answer: "No — it is generated per visit from your agent's negotiated preferences." },
        ],
      },
    },
    {
      id: "cta",
      component: "ctaBanner",
      order: 5,
      props: {
        headline: "Ready to send your agent in?",
        body: "Author a persona and watch the site build itself.",
        ctaLabel: "Open Persona Studio",
      },
    },
  ],
};
